/** @ts-expect-error */
let aio: AIO = {}; 

import { MapNames, MapIds, BossIDs } from "../../classes/mapzones";
import * as Spells from "./mythic_custom_spells";
/** 
* This is the file for managing new NPC interactions
 * - Mick Ashwild - 9500561 teaches leather/fire fusions
 * - Thorin Firehand - 9500562 teaches ore/cold fusions
 * - Elowyn Threadbinder - 9500563 teaches cloth/arcane fusions
 * - Shivey - 9500564 teaches alchemy/nature fusions
 * - ??? - 9500565 teaches gem/essence fusions
 * - ??? - Old Witch teaches shadow fusion  
 * 
 */

export enum NPCType {
    MICK_ASHWILD = 'mick',
    THORIN_FIREHAND = 'thorin',
    ELOWYN_THREADBINDER = 'elowyn',
    SHIVEY = 'shivey',
    OLD_WITCH = 'old_witch'
}

export const NPCIds: Record<NPCType, number> = {
    [NPCType.MICK_ASHWILD]: 9500561,
    [NPCType.THORIN_FIREHAND]: 9500562,
    [NPCType.ELOWYN_THREADBINDER]: 9500563,
    [NPCType.SHIVEY]: 9500564,
    [NPCType.OLD_WITCH]: 9500565
};

export enum GobjectType {
    PORTAL = 'portal',
   
}

export const GobjectIds: Record<GobjectType, number> = {
    [GobjectType.PORTAL]: 181508
}

const AUDIO_BASE_PATH = "Interface\\Modules\\MythicPlus\\Audio\\";

export const AudioPaths: Record<NPCType, string> = {
    [NPCType.MICK_ASHWILD]: AUDIO_BASE_PATH + "Mick\\mick-",
    [NPCType.THORIN_FIREHAND]: AUDIO_BASE_PATH + "Thorin\\thorin-",
    [NPCType.ELOWYN_THREADBINDER]: AUDIO_BASE_PATH + "Elowyn\\elowyn-",
    [NPCType.SHIVEY]: AUDIO_BASE_PATH + "Shivey\\shivey-",
    [NPCType.OLD_WITCH]: AUDIO_BASE_PATH + "OldWitch\\old-witch-"
};

function getAudioFile(npcName: NPCType, file: string): string {
    return AudioPaths[npcName] + file + ".mp3";
}

function isInMythicPlus(playerId: number, instanceId: number): boolean {
    const result = CharDBQuery("select guid, instanceId, difficulty from mp_player_instance_data where guid = " + playerId + " and instanceId = " + instanceId);
    if(result && result.GetUInt32(2) >= 3) {
        return true;
    }
    return false;
}

/**
 * the player will meet different characters at different times so the hello will check to see whch
 * audio file and gossip menu needs to be shown. The list of locations an npc will show up is below
 * 
 * Mick 
 *   Rare Leather Fusion : Wailing Caverns Verdan the everliving
 *   Mythic Leather Fusion : Sartharion Obsidian Sanctum
 *   Rare Fire Fusion : Hellfire Ramparts Nazan + Vazruden 
 *   Mythic Fire Fusion : Onyxia Lair Flamegor
 *   Casual Spawns : World ends Tavern Shatrath
 * 
 * Thorin 
 *   Rare Ore Fusion : BRD Magmus
 *   Mythic Ore Fusion : Ragnaros
 *   Casual Spawns : The Great Forge 

 *  
 */


// Track NPC dialog animation state
interface ActiveNpcState {
    time: number;
    intro: boolean;
    audioActive: boolean;
    players?: string[];  // list of players nearby when the NPC spawns
    lastEmote?: number;
    outro?: string[];  // list of players that have heard the outro
}

interface PlayedAudioState {
  playerName: string; 
  audioFile: string;
  played: boolean;
}

// Track the ai update loop for each instance of a NPC which
let npcState: Record<string, ActiveNpcState> = {};

// Create emote maps for npcs while they are talking keys are seconds into audio and values are emote types
const emotesMap: Record<string, Record<number, EmoteType>> = {}; 

// Track the audio that has been played for each for this instance id. 
// key: InstanceId value:  playerId: audioFile
let playedAudio: Record<string, Record<string, string[]>> = {};

// Mick + WC
emotesMap[`${NPCIds[NPCType.MICK_ASHWILD]}-${MapIds[MapNames.WAILING_CAVERNS]}`] = {
    1: EmoteType.STATE_TALK,
    6: EmoteType.STATE_EXCLAIM,
    8: EmoteType.STATE_TALK,
    10: EmoteType.ONESHOT_NONE,
    12: EmoteType.STATE_POINT,
    14: EmoteType.ONESHOT_NONE,
    15: EmoteType.STATE_TALK,
    26: EmoteType.STATE_EXCLAIM,
    28: EmoteType.STATE_TALK,
    35: EmoteType.ONESHOT_EXCLAMATION,
    37: EmoteType.STATE_TALK,
    41: EmoteType.STATE_POINT,
    43: EmoteType.ONESHOT_NONE
}; 

// Spell to spell MapId
const spellToMap: Record<number, number> = {
    [MapIds[MapNames.WAILING_CAVERNS]]: Spells.SPELL_LEATHER_FUSION    
};

// Does this player already know what the special NPC is offering. 
function PlayerHasSpell(player: Player): boolean {
    const mapId = player.GetMapId();
    if(spellToMap[mapId]) {
        return player.HasSpell(spellToMap[mapId]);
    }
    return false;
}


// This will prevent audio from being played more than once for the same player using a global map
function PlayAudioOnce(player: Player, audioFile: string): void {
    const instanceId = player.GetInstanceId();

    if(!playedAudio[instanceId]) {
        playedAudio[instanceId] = {};
    }
        // If nothing has been played to the player create the audio entry
    if(!playedAudio[instanceId][player.GetName()]) {
        playedAudio[instanceId][player.GetName()] = [];            
        playedAudio[instanceId][player.GetName()].push(audioFile);
        PrintDebug(`Playing audio ${audioFile} for player ${player.GetName()} in instance ${instanceId}`);
        aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound', audioFile);
        return; 
    } 

    if(playedAudio[instanceId][player.GetName()].includes(audioFile)) {
        return; 
    } 
    
    playedAudio[instanceId][player.GetName()].push(audioFile);
    aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound', audioFile);
    
}

// Get the instance state of the NPC for this group and instance. 
function GetNPCState(creature: Creature): ActiveNpcState {
    const instanceId = creature.GetInstanceId();
    const creatureGuid = creature.GetGUIDLow();
    let state = npcState[`${instanceId}-${creatureGuid}`];

    if(!state) {
        state = {
            time: 0,
            intro: false,
            outro: [],
            audioActive: false,
            players: []
        };
        npcState[`${instanceId}-${creatureGuid}`] = state;
    }
    return state;
}


/**
 * Handle AI Dialogs for Mick and others.
 */
const handleMickAIUpdates: creature_event_on_aiupdate = (event: number, creature: Creature, diff: number): boolean => {
 
    const creatureGuid = creature.GetGUIDLow();
    const instanceId = creature.GetInstanceId();
    const state = npcState[`${instanceId}-${creatureGuid}`];
    const previousTime = state.time || 0;

    state.time = (previousTime + diff);
    const seconds = Math.ceil(state.time / 1000);
    
    const npcEmoteMap = emotesMap[`${creature.GetEntry()}-${creature.GetMapId()}`];
    if(npcEmoteMap && npcEmoteMap[seconds] && npcEmoteMap[seconds] !== state.lastEmote) {

        PrintDebug(`Mick player state: ${state.players.length}`);
        creature.EmoteState(npcEmoteMap[seconds]);
        state.lastEmote = npcEmoteMap[seconds];
    }

    // Handle the AI Updates for Wailing Caverns
    if(MapIds[MapNames.WAILING_CAVERNS] === creature.GetMapId()) {
        if(seconds >= 43) {
            ClearUniqueCreatureEvents(creature.GetGUID(), instanceId);
            state.audioActive = false;
            state.intro = true;
            for(let i=0; i < state.players.length; i++) {
                const playerId = state.players[i];

                if(!playerId) {
                    PrintError(`${creature.GetName()} gossip menu failed no valid player in state`);
                    continue;
                }
                const player = GetPlayerByName(playerId);                 
                if(player) {
                    npcHello(player, creature, player.GetMapId());
                }
            }

        }
    }

    return true;
}

/**
 * the player will meet different characters at different times so the hello will check to see whch
 * audio file and gossip menu needs to be shown. The list of locations an npc will show up is below
 * 
 * Mick 
 *   Rare Leather Fusion : Wailing Caverns Verdan the everliving
 *   Mythic Leather Fusion : Sartharion Obsidian Sanctum
 *   Rare Fire Fusion : Hellfire Ramparts Nazan + Vazruden 
 *   Mythic Fire Fusion : Onyxia Lair Flamegor
 *   Casual Spawns : World ends Tavern Shatrath
 * 
 * Thorin 
 *   Rare Ore Fusion : BRD Magmus
 *   Mythic Ore Fusion : Ragnaros
 *   Casual Spawns : The Great Forge 

 *  
 */

// When verdan dies Mike should show phase in from a portal 
const verdanDied: creature_event_on_died = (event: number, creature: Creature, killer: Creature): boolean => {
    
    // Spawn the portal and Mick
    creature.SummonGameObject(GobjectIds[GobjectType.PORTAL], -79.273, 4.999, -30.962, 2.20);
    const mick = creature.SpawnCreature(NPCIds[NPCType.MICK_ASHWILD], -79.273, 4.999, -30.962, 2.20, TempSummonType.TEMPSUMMON_TIMED_DESPAWN, 1200000);
    mick.SetWalk(true);
    mick.MoveTo(1, -83.252, 19.723, -31.076);
 
    return false; // return false to continue normal action
};

function npcHello(player: Player, creature: Creature, mapId: number, known?: boolean): void {
    player.GossipClearMenu();
    PrintDebug("sending menu to player: " + player.GetName());
    
    if(mapId === MapIds[MapNames.WAILING_CAVERNS]) {
        if(known) {
            player.GossipMenuAddItem(0, "Got nuthin' for ya friend.", 1, 999);  
            player.GossipSendMenu(1, creature, 90000);
            return; 
        }

        player.GossipMenuAddItem(3, "Learn Leather Fusion (requires grandmaster)",1, Spells.SPELL_LEATHER_FUSION);
        player.GossipMenuAddItem(0, "Best to come another time", 1, 999);
    }

    player.GossipSendMenu(1, creature, 90000);
}

const mickSelect: gossip_event_on_select = (event: number, player: Player, creature: Creature, sender: number, selection: number): boolean => {
    
    const state = GetNPCState(creature);

    PrintDebug(`Player ${player.GetName()} selected ${selection}`);

    // 999 is a signal nothing to do
    if(selection === 999) {     
        // play the outro audio for the player if they are done.   
        if(!state.outro[player.GetName()]) {
            aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound', getAudioFile(NPCType.MICK_ASHWILD, "rare-goodbye"));
            state.outro[player.GetName()] = true; 
        }
        player.GossipClearMenu();
        player.GossipComplete();
        return true;
    }

    // Check the range of the spell we are trying to learn to make sure there is not a problem. 
    if(selection < Spells.SPELL_ORE_FUSION || selection > Spells.SPELL_EARTH_FUSION_RANK_2) {
        PrintError(`The selection ${selection} is not in the range of learnable spells check coding!!`); 
        return true;
    }
    PrintDebug(`Learning spell ${selection} for player ${player.GetName()}`);
    PrintDebug(`Player skill ${player.GetSkillValue(165)}`);

    switch(player.GetMapId()) {

        case MapIds[MapNames.WAILING_CAVERNS]:
            if(player.GetSkillValue(165) == 450) {  // if they are a grandmaster leather worker.
                player.LearnSpell(selection);

                PrintDebug(`Learning spell ${selection} for player ${player.GetName()}`);
                PlayAudioOnce(player, getAudioFile(NPCType.MICK_ASHWILD, "teach-rare-yes"));
            } else {
                PrintDebug(`FAILING ${selection} for player ${player.GetName()}`);
                PlayAudioOnce(player, getAudioFile(NPCType.MICK_ASHWILD, "teach-rare-no"));
            }
            break; 

        default: 
            break;
    }

    player.GossipComplete();
    return true;
}

// Micks events
const mickHello: gossip_event_on_hello = (event: number, player: Player, creature: Creature): boolean => {
    const zoneId = player.GetMapId();
    const instanceId = player.GetInstanceId();

    // Get the global creature state for special NPCs
    const myState = GetNPCState(creature);

    // if(isInMythicPlus(player.GetGUID(), instanceId)) {
    if (MapIds[MapNames.WAILING_CAVERNS] === zoneId) {
        
        creature.SetFacingToObject(player);

        // Do play outro dialog if they already know the spell. 
        if(PlayerHasSpell(player)) {                    
            npcHello(player, creature, zoneId, true);
            if(!myState.outro[player.GetName()]) {
                PlayAudioOnce(player, getAudioFile(NPCType.MICK_ASHWILD, "rare-goodbye"));                
                myState.outro[player.GetName()] = true; 
            }            
            return true; 
        }
        
        // Audio should play for all players in range when the NPC spawns.. 
        // however the menu will show up only to the player that clicked hello, 
        // or other players after the audio has played. 
        if (!myState.audioActive) {

   
            const nearPlayers = creature.GetPlayersInRange(35);
            for (let i = 0; i < nearPlayers.length; i++) {
                myState.players.push(nearPlayers[i].GetName());
                PlayAudioOnce(player, getAudioFile(NPCType.MICK_ASHWILD, "rare-hello"));                 
            }
            
            creature.EmoteState(EmoteType.ONESHOT_NONE);
            myState.audioActive = true;
            ClearUniqueCreatureEvents(creature.GetGUID(), instanceId, CreatureEvents.CREATURE_EVENT_ON_AIUPDATE);
            RegisterUniqueCreatureEvent(creature.GetGUID(), instanceId, CreatureEvents.CREATURE_EVENT_ON_AIUPDATE, (...args) => handleMickAIUpdates(...args));
        } else {
            myState.players.push(player.GetName()); // player wants to interact with the NPC
            if(myState.players.length === 1 && myState.intro) {
                npcHello(player, creature, player.GetMapId());
            }
        }
        
    }
    return true;
};

/**** Boss Kill Handlers ****/

// Wailing Caverns - Verdan the Everliving is killed
RegisterCreatureEvent(5775, CreatureEvents.CREATURE_EVENT_ON_DIED, (...args) => verdanDied(...args));

/****  NPC Gossip Events Handlers ****/ 

// Mick Ashwild
RegisterCreatureGossipEvent(NPCIds[NPCType.MICK_ASHWILD], GossipEvents.GOSSIP_EVENT_ON_HELLO, (...args) => mickHello(...args));
RegisterCreatureGossipEvent(NPCIds[NPCType.MICK_ASHWILD], GossipEvents.GOSSIP_EVENT_ON_SELECT, (...args) => mickSelect(...args));


/****  NPC Events Handlers ****/

// Registers the creature state to our instance state map and sets default state values. 
function commonCreatureRegister(creature: Creature) {
    ClearUniqueCreatureEvents(creature.GetGUID(), creature.GetInstanceId()); 
    npcState[`${creature.GetInstanceId()}-${creature.GetGUIDLow()}`] = {
        time: 0,
        intro: false,
        outro: [],
        audioActive: false,
        players: []
    };   
}

// Micks Events 
RegisterCreatureEvent(NPCIds[NPCType.MICK_ASHWILD], CreatureEvents.CREATURE_EVENT_ON_SPAWN, (event: number, creature: Creature): boolean => {
    commonCreatureRegister(creature);
    return false;
}); 
RegisterCreatureEvent(NPCIds[NPCType.MICK_ASHWILD], CreatureEvents.CREATURE_EVENT_ON_REMOVE, (event: number, creature: Creature): boolean => {    
    commonCreatureRegister(creature);
    return false;
}); 

/**** Server events for state management around instances ****/

const cleanupAudio: map_event_on_destroy = (event: number, map: EMap) => {
    playedAudio[map.GetInstanceId()] = {};
};

// Register Map Event on Destroy
RegisterServerEvent(ServerEvents.MAP_EVENT_ON_DESTROY, (...args) => cleanupAudio(...args));

const createPlayedAudio: map_event_on_destroy = (event: number, map: EMap) => {
    playedAudio[map.GetInstanceId()] = {};
};

// Register Map Event on Destroy
RegisterServerEvent(ServerEvents.MAP_EVENT_ON_DESTROY, (...args) => createPlayedAudio(...args));

const resetPlayedAudio: eluna_event_on_lua_state_open = (event: number) => {
    PrintDebug("resetting played audio");
    playedAudio = {};
};
const resetPlayedAudioClose: eluna_event_on_lua_state_close = (event: number) => {
    PrintDebug("resetting played audio");
    playedAudio = {};
}


// Register Server Event on Lua State Open
RegisterServerEvent(ServerEvents.ELUNA_EVENT_ON_LUA_STATE_OPEN, (...args) => resetPlayedAudio(...args));
RegisterServerEvent(ServerEvents.ELUNA_EVENT_ON_LUA_STATE_CLOSE, (...args) => resetPlayedAudioClose(...args));