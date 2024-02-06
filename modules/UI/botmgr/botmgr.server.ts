 /** @ts-expect-error */
let aio: AIO = {}; 

const SCRIPT_NAME = 'BotMgr';
import { Logger } from "../../classes/logger";
const log = new Logger(SCRIPT_NAME);

import { 
    BotStat, 
    BotEquipSlot, 
    BotSlotName,
    BotEquipLast, 
    BotStatLast,
    ClassesMapping, 
    CharacterClass,
    RacesMapping,
    CharacterRace
 } from "../../constants/idmaps";



 /**
  * Everything we ever wanted to know about the bot info on load
  */
 export type BotData = {
    owner: string,
    name: string,
    entry: number,
    class: CharacterClass, 
    classId: number,
    race: CharacterRace,
    raceId: number,
    equipment?: Record<string, number>,  // SlotName - ItemId  See BotEquipSlot
    stats?: Record<number, number>,      // StatId - Value
}; 

/**
 * @todo Move to a data mgr class eventually
 */
const NpcDetailStorage = {} as Record<number, BotData>; 

// // cheap way to load everything on the server side and force so client as access. (Don't love this at all will need to work back into plugin); 
// const loader = BotStat || BotEquipSlot || BotEquipLast || BotStatLast || ClassesMapping || RacesMapping;

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

    const owner = bot.GetBotOwner();

    // We can use bot entrys since they are 1:1 with GUIDs for shorter storage keys
    NpcDetailStorage[bot.GetEntry()] = {
        owner: owner.GetName(),
        name: bot.GetName(),
        entry: bot.GetEntry(),
        class: ClassesMapping[bot.GetBotClass()], 
        classId: bot.GetBotClass(),
        race: RacesMapping[bot.GetRace()],
        raceId: bot.GetRace(),
        equipment: {},
       // stats: {},
    }; 

    for(let slot=0; slot <= BotEquipLast; slot++) {
        const equipment = bot.GetBotEquipment(<BotEquipmentSlotNum>slot);
        
        if(equipment) {
            NpcDetailStorage[bot.GetEntry()].equipment[slot] = equipment.GetEntry();
            print(`Slot: ${BotSlotName[slot]} Item: ${equipment.GetEntry()}`);            
        } else {
           NpcDetailStorage[bot.GetEntry()].equipment[slot] = undefined;
        }                
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
function EquipItem(botEntry: number, slot: BotEquipmentSlotNum, item: number): void {
    

    print(`Bot: ${botEntry} Slot: ${slot} Item: ${item}`); 

    // const isEligible = bot.BotCanEquipItem(item, slot);



    //    if(!isEligible) {
    //        log.error(`Bot cannot equip item: ${item} in slot: ${slot}`);
    //        return; 
    //    }

    //    if(bot.BotEquipItem(item, slot)) {
    //         NpcDetailStorage[bot.GetEntry()].equipment[slot] = item;
    //         aio.Handle(bot.GetBotOwner(), 'BotMgr', 'EquipSuccess', { slot, item});
    //    } else {
    //         log.error(`Bot failed to equip item: ${item} in slot: ${slot}`);
    //         aio.Handle(bot.GetBotOwner(), 'BotMgr', 'EquipFail', { slot, item});
    //      }  
                     
}


const ShowBotMgr: player_event_on_command = (event: number,player: Player, command: string): boolean => {
    if(command == 'botmgr') {

        if(TargetIsEligible(player)) {
            const botdetails = GetBotDetails(GetBotNpc(player));
            
            // loop through bot details and print the key value pair
            for (const [key, value] of Object.entries(botdetails.equipment)) {
                print(`${key}: ${value}`);
            }

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
    EquipItem
}); 

RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_COMMAND, 
    (...args) => ShowBotMgr(...args)
); 
