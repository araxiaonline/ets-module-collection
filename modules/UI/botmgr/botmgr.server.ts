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
    CharacterRace,
    ItemQuality,
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
    entry: number,
    class: CharacterClass, 
    classId: number,
    race: CharacterRace,
    raceId: number,
    equipment?: EquipmentList,  // SlotName - ItemId  See BotEquipSlot
    stats?: Record<number, number>,      // StatId - Value
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

function GetMeleeStats () {
    return { 
        left: [
            BotStat.STRENGTH,
            BotStat.AGILITY,
            BotStat.DAMAGE_MIN, 
            BotStat.DAMAGE_MAX,                        
            BotStat.ATTACK_POWER,
            BotStat.HIT_RATING,
            BotStat.CRIT_RATING,            
            BotStat.EXPERTISE,
            BotStat.ARMOR_PENETRATION_RATING,
        ], 
        right: [            
            BotStat.HASTE_RATING,            
            BotStat.ARMOR,
            BotStat.STAMINA,
            BotStat.DEFENSE_SKILL_RATING,
            BotStat.DODGE_RATING,
            BotStat.PARRY_RATING,
            BotStat.BLOCK_RATING,
            BotStat.BLOCK_VALUE
        ]
    }
}

function GetCasterStats() {

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
        equipment: {} as EquipmentList,  
        stats: {},
    }; 

    print(bot.GetBotRoles()); 


    // Get all the equipment
    for(let slot=0; slot <= BotEquipLast; slot++) {
        const equipment = bot.GetBotEquipment(<BotEquipmentSlotNum>slot);
        
        if(equipment) {            
            NpcDetailStorage[bot.GetEntry()].equipment[slot] =  {
                entry: equipment.GetEntry(),
                link: equipment.GetItemLink(),
                quality: <QualityType>equipment.GetQuality(),
                itemLevel: equipment.GetItemLevel(),
                enchantmentId: equipment.GetEnchantmentId(0),
            }                     
        } else {
           NpcDetailStorage[bot.GetEntry()].equipment[slot] = undefined;
        }                
    }

    // get the stats we care about by Class 
    // This will determine what stats to lookup for the bot.
    const lookups = GetMeleeStats(); 


    lookups.left.forEach(stat => {
        const result = bot.GetBotStat(stat);
        NpcDetailStorage[bot.GetEntry()].stats[stat] = result;        
    });
    lookups.right.forEach(stat => {
        const result = bot.GetBotStat(stat);
        NpcDetailStorage[bot.GetEntry()].stats[stat] = result;        
    });
    
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

    const owner = GetPlayerByName(player);
    const creatures = owner.GetCreaturesInRange(60, botEntry) as Creature[]; 
    const bot = creatures[0];


    const isEligible = bot.BotCanEquipItem(item, slot);
       if(!isEligible) {
           log.error(`Bot cannot equip item: ${item} in slot: ${slot}`);
           return; 
       }

       if(bot.BotEquipItem(item, slot)) {
            GetBotDetails(bot);
            log.log(`Bot successfully equipped item: ${item} in slot: ${slot}`);
            aio.Handle(bot.GetBotOwner(), 'BotMgr', 'OnEquipSuccess',botEntry, slot, item, link);
       } else {
            log.error(`Bot failed to equip item: ${item} in slot: ${slot}`);
            aio.Handle(bot.GetBotOwner(), 'BotMgr', 'OnEquipFail', botEntry, slot, item, link);
         }  
                     
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
    "EquipTheItem": EquipTheItem
}); 


RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_COMMAND, 
    (...args) => ShowBotMgr(...args)
); 