 /** @ts-expect-error */
let aio: AIO = {}; 

const SCRIPT_NAME = 'BotMgr';
import { Logger } from "../../classes/logger";
import { BotUnit } from "./botUnit";
const log = new Logger(SCRIPT_NAME);

import { 
    BotStat,     
    BotEquipLast,     
    ClassesMapping, 
    CharacterClass,
    RacesMapping,
    CharacterRace,    
    QualityType
 } from "../../constants/idmaps";

export type Equipment = {
    entry: number,
    link: string, 
    quality?: QualityType,
    itemLevel?: number,
    enchantmentId?: number,
}

export type EquipmentList = Record<BotEquipmentSlotNum, Equipment>;

 /**
  * Everything we ever wanted to know about the bot info on load
  */
 export type BotData = {
    owner: string,
    name: string,
    level: number,
    talentSpec: number,
    talentSpecName: string,
    roles: number,
    entry: number,
    class: CharacterClass, 
    classId: number,
    race: CharacterRace,
    raceId: number,
    equipment?: EquipmentList,  // SlotName - ItemId  See BotEquipSlot
    leftStats?: Record<string, string>[],
    rightStats?: Record<string, string>[], 
    allStats?: Record<string, string>      // StatId - Value
}; 

/**
 * @todo Move to a data mgr class eventually
 */
const NpcDetailStorage = {} as Record<number, BotData>; 

/**
 * Get the current targetted npc bot or returns undefined if not a bot. 
 * @param player 
 * @returns Creature | undefined
 * @noSelf
 */
function GetBotNpc(player: Player): Creature | undefined {
    try {
        const target = player.GetSelection();
        const creature = target.ToCreature();
    
        if(!creature.IsNPCBot()) {
            return; 
        }
    
        return creature;
    } catch (e) {
        log.error(`Could not lookup bot npc: ${e}`);
    }    
}

/**
 * This target is eligible for the player to manage otherwise ship them a friendly error message
 * @param player 
 * @returns boolean
 * @noSelf
 */
function TargetIsEligible(player: Player) {
    const creature = GetBotNpc(player);

    if(creature) {
        const botOwner = creature.GetBotOwner();                
        if(botOwner.GetGUID() == player.GetGUID()) {
            log.info(`Target is a NPCBot that can be managed by the player`);
            return true;
        }
    }    

    return false;
}

/**
 * @noSelf
 */
function GetBotDetails(bot: Creature): BotData {

    try {        
        const botUnit = new BotUnit(bot);
        NpcDetailStorage[bot.GetEntry()] = botUnit.toBotData(); 
    } catch (e) {
        log.error(`Could not get bot details: ${e}`);
    }
    
    return NpcDetailStorage[bot.GetEntry()];    
}

/**
 * Equip an item for the bot and update bot details
 * @param event 
 * @param player 
 * @param command 
 * @returns 
 */
function EquipTheItem(player: string, botEntry: number, slot: BotEquipmentSlotNum, item: number, link: string ): void {
    if(botEntry && typeof botEntry !== 'number') {
        return; 
    }

    try {
        const owner = GetPlayerByName(player);
        const creatures = owner.GetCreaturesInRange(300, botEntry) as Creature[]; 
        const bot = creatures[0];
        let data; 
    
        const isEligible = bot.BotCanEquipItem(item, slot);
           if(!isEligible) {
               log.error(`Bot cannot equip item: ${item} in slot: ${slot}`);
               return; 
           }
           // already equipped
    
           if(bot.BotEquipItem(item, slot)) {                  
                data = GetBotDetails(bot);      
                // log.log(`Bot successfully equipped item: ${item} in slot: ${slot}`);
                aio.Handle(bot.GetBotOwner(), 'BotMgr', 'OnEquipSuccess',botEntry, slot, data.equipment[slot]);
           } else {
                // log.error(`Bot failed to equip item: ${item} in slot: ${slot}`);
                aio.Handle(bot.GetBotOwner(), 'BotMgr', 'OnEquipFail', botEntry, slot, item, link);
             }  
    } catch (error) {
        log.error(`Error equipping item: ${error}`);
    }
                
}

function UnequipTheItem(player: string, slot: number, botEntry: number): void {
    try {
        const owner = GetPlayerByName(player);
        const creatures = owner.GetCreaturesInRange(60, botEntry) as Creature[]; 
        const bot = creatures[0];
    
        if(bot.BotUnequipBotItem(slot)) {
            GetBotDetails(bot);
            log.log(`Bot successfully unequipped item at slot: ${slot}`);
            aio.Handle(bot.GetBotOwner(), 'BotMgr', 'OnUnEquipSuccess',slot, botEntry, );
       } else {
            log.error(`Bot failed to equip item in slot: ${slot}`);
            aio.Handle(bot.GetBotOwner(), 'BotMgr', 'OnUnEquipFail', slot,  botEntry);
         }  
    } catch (error) {
        log.error(`Error unequipping item: ${error}`);
    }
    
         
}


const ShowBotMgr: player_event_on_command = (event: number,player: Player, command: string): boolean => {
    if(command == 'botmgr') {

        if(TargetIsEligible(player)) {
            const botdetails = GetBotDetails(GetBotNpc(player));

            aio.Handle(player, 'BotMgr', 'ShowFrame', botdetails);
            return false;
        } else {
            player.PlayDirectSound(8959, player); // Play error sound (no money sound            
            player.SendNotification("That is not a NPCBot that you can manage!");
            return false; 
        }
    }

    return true; 
}



/***  
 * @noSelf
 */
function GetBotPanelInfo(player: Player): void  {
    const target = player.GetSelection();
    const creature = target.ToCreature();

    if(!creature.IsNPCBot()) {
        return; 
    }

    try {
        
        const target = player.GetSelection(); 
        PrintInfo(`Server ${target.GetGUID()}`); 

        const entry = GetGUIDEntry(target.GetGUID());
        print(`BotMgr: Parsing Bot Entry: ${entry}`); 
    

    } catch (e) {
        print(`BotMgr: Error parsing bot entry: ${e}`);
    }    
}
const botMgrHandlers = aio.AddHandlers('BotMgr', {    
    TargetIsEligible,
    GetBotPanelInfo, 
    "EquipTheItem": EquipTheItem,
    "UnequipTheItem": UnequipTheItem,
}); 


RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_COMMAND, 
    (...args) => ShowBotMgr(...args)
); 