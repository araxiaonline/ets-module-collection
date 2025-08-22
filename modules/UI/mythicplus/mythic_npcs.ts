/** @ts-expect-error */
let aio: AIO = {}; 

import { MapNames, MapIds, BossIDs } from "../../classes/mapzones";
import * as Spells from "./mythic_custom_spells";
import { SetTrigger, GetTrigger } from "../../classes/triggers";

/** 
* This is the file for managing new NPC interactions
 * - Mick Ashwild - 9500561 teaches leather/fire fusions
 * - Thorin Firehand - 9500562 teaches ore/cold fusions
 * - Elowyn Threadbinder - 9500563 teaches cloth/arcane fusions
 * - Shivey - 9500564 teaches alchemy/nature fusions
 * - ??? - 9500565 teaches gem/essence fusions
 * - ??? - Old Witch teaches shadow fusion  
 * 
 * The player will meet different characters at different times so the hello will check to see whch
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
 */

export enum NPCType {
    MICK_ASHWILD = 'mick',
    THORIN_FIREHAND = 'thorin',
    ELOWYN_THREADBINDER = 'elowen',
    SHIVEY = 'shivey',
    STEVE = 'steve',
    VAERIC = 'vaeric',
    AGATHA = 'agatha',
    SYLVIA = 'sylvia',
    
}   

export const NPCIds: Record<NPCType, number> = {
    [NPCType.MICK_ASHWILD]: 9500561,
    [NPCType.THORIN_FIREHAND]: 9500562,
    [NPCType.ELOWYN_THREADBINDER]: 9500563,
    [NPCType.SHIVEY]: 9500564,
    [NPCType.STEVE]: 9500565, 
    [NPCType.VAERIC]: 9500566,
    [NPCType.AGATHA]: 9500567,
    [NPCType.SYLVIA]: 9500568,

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
    [NPCType.ELOWYN_THREADBINDER]: AUDIO_BASE_PATH + "Elowen\\elowen-",
    [NPCType.SHIVEY]: AUDIO_BASE_PATH + "Shivey\\shivey-",
    [NPCType.STEVE]: AUDIO_BASE_PATH + "Steve\\steve-",
    [NPCType.VAERIC]: AUDIO_BASE_PATH + "Vaeric\\vaeric-",
    [NPCType.AGATHA]: AUDIO_BASE_PATH + "Agatha\\agatha-",
    [NPCType.SYLVIA]: AUDIO_BASE_PATH + "Sylvia\\sylvia-",
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

// Track the audio that has been played for each for this instance id. 
// key: InstanceId value:  playerId: audioFile
let playedAudio: Record<string, Record<string, string[]>> = {};


// This will prevent audio from being played more than once for the same player using a global map
function PlayAudioOnce(player: Player, audioFile: string, npcType?: NPCType, forcePlay?: boolean): void {
    const instanceId = player.GetInstanceId();
    const mapId = player.GetMapId();
    const playerName = player.GetName();
    
    // Get audio options from NPC config if provided
    let audioOptions: {volume: number, duration: number} | undefined;
    if (npcType) {
        const npcConfig = getNPCMapConfig(npcType, mapId);
        if (npcConfig?.audioOptions) {
            audioOptions = npcConfig.audioOptions;
        }
    }
    
    // Default audio options if not specified in NPC config
    if (!audioOptions) {
        audioOptions = {
            volume: 0.5,
            duration: 45
        };
    }

    if(!playedAudio[instanceId]) {
        playedAudio[instanceId] = {};
    }
    
    // If nothing has been played to the player create the audio entry
    if(!playedAudio[instanceId][playerName]) {
        playedAudio[instanceId][playerName] = [];            
        playedAudio[instanceId][playerName].push(audioFile);
        aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound', audioFile, audioOptions, playerName);
        return; 
    } 

    if(playedAudio[instanceId][playerName].includes(audioFile) && forcePlay !== true) {
        return; 
    } 
    
    playedAudio[instanceId][playerName].push(audioFile);
    aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound', audioFile, audioOptions, playerName);    
}


// Track the ai update loop for each instance of a NPC which
let npcState: Record<string, ActiveNpcState> = {};

// Create emote maps for npcs while they are talking keys are seconds into audio and values are emote types
const emotesMap: Record<string, Record<number, EmoteType>> = {}; 

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

emotesMap[`${NPCIds[NPCType.SHIVEY]}-${MapIds[MapNames.SCHOLOMANCE]}`] = {
    1: EmoteType.STATE_TALK,
    3: EmoteType.STATE_EXCLAIM,
    6: EmoteType.STATE_TALK,
    10: EmoteType.STATE_LAUGH,
    12: EmoteType.STATE_TALK,
    15: EmoteType.STATE_EXCLAIM,
    17: EmoteType.STATE_TALK,
    23: EmoteType.STATE_EXCLAIM,
    25: EmoteType.ONESHOT_NONE,
    26: EmoteType.STATE_POINT,
    28: EmoteType.ONESHOT_NONE,
};
emotesMap[`${NPCIds[NPCType.THORIN_FIREHAND]}-${MapIds[MapNames.BLACKROCK_SPIRE_UPPER]}`] = {
    1: EmoteType.STATE_TALK,
    10: EmoteType.ONESHOT_YES,
    12: EmoteType.ONESHOT_TALK,
    17: EmoteType.ONESHOT_NO,
    19: EmoteType.ONESHOT_TALK,
    28: EmoteType.ONESHOT_NO,
    31: EmoteType.ONESHOT_TALK,
    34: EmoteType.ONESHOT_POINT,
    36: EmoteType.ONESHOT_NONE
};

emotesMap[`${NPCIds[NPCType.ELOWYN_THREADBINDER]}-${MapIds[MapNames.STRATHOLME]}`] = {
    1: EmoteType.STATE_TALK,
    10: EmoteType.ONESHOT_YES,
    12: EmoteType.ONESHOT_TALK,
    17: EmoteType.STATE_EXCLAIM,
    19: EmoteType.ONESHOT_TALK,
    28: EmoteType.ONESHOT_YES,
    30: EmoteType.ONESHOT_TALK,
    31: EmoteType.ONESHOT_NONE
};

emotesMap[`${NPCIds[NPCType.STEVE]}-${MapIds[MapNames.UTGARDE_PINNACLE]}`] = {
    1: EmoteType.STATE_TALK,
    10: EmoteType.ONESHOT_YES,
    12: EmoteType.ONESHOT_TALK,
    17: EmoteType.STATE_EXCLAIM,
    19: EmoteType.ONESHOT_TALK,
    28: EmoteType.ONESHOT_YES,
    30: EmoteType.ONESHOT_TALK,    
    38: EmoteType.ONESHOT_EXCLAMATION,
    40: EmoteType.ONESHOT_NO,
    42: EmoteType.ONESHOT_TALK,
    43: EmoteType.ONESHOT_POINT,
    45: EmoteType.ONESHOT_EXCLAMATION,
    47: EmoteType.ONESHOT_TALK,
    54: EmoteType.ONESHOT_YES,
    56: EmoteType.ONESHOT_TALK,
    64: EmoteType.ONESHOT_NONE
};

emotesMap[`${NPCIds[NPCType.THORIN_FIREHAND]}-${MapIds[MapNames.HALLS_OF_LIGHTNING]}`] = {
    1: EmoteType.STATE_TALK,
    10: EmoteType.ONESHOT_YES,
    12: EmoteType.ONESHOT_TALK,
    17: EmoteType.STATE_EXCLAIM,
    19: EmoteType.ONESHOT_TALK,
    28: EmoteType.ONESHOT_YES,
    30: EmoteType.ONESHOT_TALK,    
    46: EmoteType.ONESHOT_YES,    
    48: EmoteType.ONESHOT_TALK,    
    52: EmoteType.ONESHOT_NONE,    
};

emotesMap[`${NPCIds[NPCType.MICK_ASHWILD]}-${MapIds[MapNames.HELLFIRE_RAMPARTS]}`] = {
    1: EmoteType.STATE_EXCLAIM,
    3: EmoteType.STATE_TALK,
    10: EmoteType.ONESHOT_YES,
    12: EmoteType.ONESHOT_TALK,
    17: EmoteType.STATE_EXCLAIM,
    19: EmoteType.ONESHOT_TALK,
    28: EmoteType.ONESHOT_YES,
    30: EmoteType.ONESHOT_TALK,    
    38: EmoteType.ONESHOT_EXCLAMATION,
    40: EmoteType.ONESHOT_NO,
    42: EmoteType.ONESHOT_TALK,
    43: EmoteType.ONESHOT_POINT,
    45: EmoteType.ONESHOT_EXCLAMATION,
    47: EmoteType.ONESHOT_TALK,
    54: EmoteType.ONESHOT_YES,
    56: EmoteType.ONESHOT_TALK,
    84: EmoteType.ONESHOT_NONE
};

emotesMap[`${NPCIds[NPCType.SHIVEY]}-${MapIds[MapNames.NEXUS]}`] = {
    1: EmoteType.STATE_TALK,
    10: EmoteType.ONESHOT_YES,
    12: EmoteType.ONESHOT_TALK,
    17: EmoteType.ONESHOT_NO,
    19: EmoteType.ONESHOT_TALK,
    28: EmoteType.ONESHOT_NO,
    31: EmoteType.ONESHOT_TALK,
    34: EmoteType.ONESHOT_POINT,
    36: EmoteType.ONESHOT_TALK,
    39: EmoteType.ONESHOT_NONE
};

// Spell to spell MapId
const spellToMap: Record<number, number> = {
    [MapIds[MapNames.WAILING_CAVERNS]]: Spells.SPELL_LEATHER_FUSION,
    [MapIds[MapNames.SCHOLOMANCE]]: Spells.SPELL_ALCHEMY_FUSION,
    [MapIds[MapNames.BLACKROCK_SPIRE_UPPER]]: Spells.SPELL_ORE_FUSION,
    [MapIds[MapNames.STRATHOLME]]: Spells.SPELL_CLOTH_FUSION,
    [MapIds[MapNames.UTGARDE_PINNACLE]]: Spells.SPELL_ESSENCE_FUSION,
    [MapIds[MapNames.HALLS_OF_LIGHTNING]]: Spells.SPELL_GEM_FUSION,
    [MapIds[MapNames.HELLFIRE_RAMPARTS]]: Spells.SPELL_FLAME_FUSION,
    [MapIds[MapNames.NEXUS]]: Spells.SPELL_COLD_FUSION,
};

// Does this player already know what the special NPC is offering. 
function PlayerHasSpell(player: Player): boolean {
    const mapId = player.GetMapId();
    if(spellToMap[mapId]) {
        return player.HasSpell(spellToMap[mapId]);
    }
    return false;
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

interface NPCMapConfig {
    introAudio: string;
    outroAudio: string;
    teachYesAudio?: string;
    teachNoAudio?: string;
    completionTime: number;
    spellId?: number;
    gossipOptions: {
        knownSpell: string;  // Text shown when player already knows the spell
        learnSpell: string;  // Text for learning the spell
        decline: string;     // Text for declining to learn
    };
    audioOptions?: {
        volume: number;     
        duration: number;      
    };
    // Spawn configuration when this NPC appears after a boss kill
    spawnConfig?: {
        bossId: number;               
        portalLocation: { x: number; y: number; z: number; o: number }; // Where to spawn the portal and NPC
        moveToLocation: { x: number; y: number; z: number };           // Where the NPC should walk to
        despawnTime?: number; // How long before the NPC despawns (ms)
    };
}

const NpcConfigMap: Record<string, Record<number, NPCMapConfig>> = {
    [NPCType.MICK_ASHWILD]: {
        [MapIds[MapNames.WAILING_CAVERNS]]: {
            introAudio: "rare-hello",
            outroAudio: "rare-goodbye",
            teachYesAudio: "teach-rare-yes",
            teachNoAudio: "teach-rare-no",
            completionTime: 43,
            spellId: Spells.SPELL_LEATHER_FUSION,
            gossipOptions: {
                knownSpell: "Got nuthin' for ya friend.",
                learnSpell: "Learn Leather Fusion (requires grandmaster)",
                decline: "Best to come another time"
            },
            audioOptions: {
                volume: 1.0,
                duration: 45
            },
            spawnConfig: {
                bossId: 5775, // Verdan the Everliving
                portalLocation: { x: -79.273, y: 4.999, z: -30.962, o: 2.20 },
                moveToLocation: { x: -83.252, y: 19.723, z: -31.076 },
                despawnTime: 1200000 // 20 minutes
            }
        },
        [MapIds[MapNames.HELLFIRE_RAMPARTS]]: {
            introAudio: "fire-hello",
            outroAudio: "fire-goodbye",
            teachYesAudio: "teach-fire-yes",
            teachNoAudio: "teach-fire-no",
            completionTime: 85,
            spellId: Spells.SPELL_FLAME_FUSION,
            gossipOptions: {
                knownSpell: "Got nuthin' for ya friend.",
                learnSpell: "Learn Flame Fusion (Requires 10,000g and 1 Jug of Badlands Bourbon)",
                decline: "Best to come another time"
            },
            audioOptions: {
                volume: 1.0,
                duration: 85
            },
            spawnConfig: {
                bossId: 17536, // Nazan
                portalLocation: { x: -1439, y: 1764, z: 81.98, o: 5.55 },
                moveToLocation: { x: -1433, y: 1761, z: 81.80 },
                despawnTime: 1200000 // 20 minutes
            }
        },
        // Add other maps for Mick
    },
    [NPCType.SHIVEY]: {
        [MapIds[MapNames.SCHOLOMANCE]]: {
            introAudio: "rare-hello",
            outroAudio: "rare-goodbye",
            teachYesAudio: "teach-rare-yes",
            teachNoAudio: "teach-rare-no",
            completionTime: 29,
            spellId: Spells.SPELL_ALCHEMY_FUSION,
            gossipOptions: {
                knownSpell: "Why you staring at me like that, get lost.",
                learnSpell: "Learn Alchemy Fusion (requires grandmaster)",
                decline: "No thanks"
            },
            audioOptions: {
                volume: 0.5,
                duration: 29
            },
            spawnConfig: {
                bossId: 10508, // Ras Frostwhisper                    
                portalLocation: { x: 25.457, y: 152.83, z: 83.54, o: 0.54 },
                moveToLocation: { x: 40.22, y: 159.23, z: 83.54 },
                despawnTime: 1200000 // 20 minutes
            }
        },
        [MapIds[MapNames.NEXUS]]: {
            introAudio: "cold-hello",
            outroAudio: "cold-goodbye",
            teachYesAudio: "teach-cold-yes",
            teachNoAudio: "teach-cold-no",
            completionTime: 40,
            spellId: Spells.SPELL_COLD_FUSION,
            gossipOptions: {
                knownSpell: "Why you staring at me like that, get lost.",
                learnSpell: "Learn Cold Fusion (10,000g and Flask of Death)",
                decline: "No thanks"
            },
            audioOptions: {
                volume: 0.7,
                duration: 40
            },
            spawnConfig: {
                bossId: 26794, // Ormorok The Tree Shaper                    
                portalLocation: { x: 264.9, y: -255.4, z: -8.1, o: 5.89 },
                moveToLocation: { x: 283.5, y: -239, z: -8.25 },
                despawnTime: 1200000 // 20 minutes
            }
        }
        // Add other maps for Shivey
    },
    [NPCType.THORIN_FIREHAND]: {
        [MapIds[MapNames.BLACKROCK_SPIRE_UPPER]]: {
            introAudio: "rare-hello",
            outroAudio: "rare-goodbye",
            teachYesAudio: "teach-rare-yes",
            teachNoAudio: "teach-rare-no",
            completionTime: 36,
            spellId: Spells.SPELL_ORE_FUSION,
            gossipOptions: {
                knownSpell: "...Leave me alone",
                learnSpell: "Learn Ore Fusion (requires grandmaster)",
                decline: "No thanks"
            },
            audioOptions: {
                volume: 1.0,
                duration: 36
            },
            spawnConfig: {
                bossId: 9938, // Magmus                    
                portalLocation: { x: 1394.31, y: -703.50, z: -92.08, o: 1.08 },
                moveToLocation: { x: 1388.74, y: -692, z: -92.05 },
                despawnTime: 1200000 // 20 minutes
            }
        },
        [MapIds[MapNames.HALLS_OF_LIGHTNING]]: {
            introAudio: "rare-lightning-hello",
            outroAudio: "rare-lightning-goodbye",
            teachYesAudio: "teach-rare-lightning-yes",
            teachNoAudio: "teach-rare-lightning-no",
            completionTime: 52,
            spellId: Spells.SPELL_GEM_FUSION,
            gossipOptions: {
                knownSpell: "...Leave me alone",
                learnSpell: "Learn Gem Fusion (requires grandmaster)",
                decline: "No thanks"
            },
            audioOptions: {
                volume: 1.0,
                duration: 52
            },
            spawnConfig: {
                bossId: 28587, // Volkan                    
                portalLocation: { x: 1331.91, y: -126.63, z: 56.71, o: 4.71 },
                moveToLocation: { x: 1331.91, y: -139.77, z: 53.27 },
                despawnTime: 1200000 // 20 minutes
            }
        }
        // Add other maps for Shivey
    },
    [NPCType.ELOWYN_THREADBINDER]: {
        [MapIds[MapNames.STRATHOLME]]: {
            introAudio: "rare-hello",
            outroAudio: "rare-goodbye",
            teachYesAudio: "teach-rare-yes",
            teachNoAudio: "teach-rare-no",
            completionTime: 31,
            spellId: Spells.SPELL_CLOTH_FUSION,
            gossipOptions: {
                knownSpell: "Please leave me to mourn.",
                learnSpell: "Learn Cloth Fusion (requires grandmaster)",
                decline: "Another time"
            },
            audioOptions: {
                volume: 1.0,
                duration: 31
            },
            spawnConfig: {
                bossId: 10436, // Baroness Anastari                    
                portalLocation: { x: 3866.14, y: -3702.15, z: 141.78, o: 2.12 },
                moveToLocation: { x: 3865.73, y: -3696.5, z: 141.90 },
                despawnTime: 1200000 // 20 minutes
            }
        }
        // Add other maps for Shivey
    },
    [NPCType.STEVE]: {
        [MapIds[MapNames.UTGARDE_PINNACLE]]: {
            introAudio: "rare-hello",
            outroAudio: "rare-goodbye",
            teachYesAudio: "teach-rare-yes",
            teachNoAudio: "teach-rare-no",
            completionTime: 65,
            spellId: Spells.SPELL_ESSENCE_FUSION,
            gossipOptions: {
                knownSpell: "Queues are taking forever...",
                learnSpell: "Learn Essence Fusion (requires grandmaster)",
                decline: "Another time"
            },
            audioOptions: {
                volume: 0.8,
                duration: 65
            },
            spawnConfig: {
                bossId: 26687, // Gortok                    
                portalLocation: { x: 314.63, y: -461.73, z: 104.71, o: 2.725 },
                moveToLocation: { x: 313.21, y: -452.52, z: 104.71 },
                despawnTime: 1200000 // 20 minutes
            }
        }
        // Add other maps for Shivey
    },
    // Add other NPCs
};

function getNPCMapConfig(npcType: NPCType, mapId: number): NPCMapConfig | undefined {
    return NpcConfigMap[npcType]?.[mapId];
}

// Helper function to get NPC type from entry
function getNPCTypeFromEntry(entry: number): NPCType | undefined {
    for (const [type, id] of Object.entries(NPCIds)) {
        if (id === entry) {
            return type as NPCType;
        }
    }
    return undefined;
}

const handleNPCAIUpdates: creature_event_on_aiupdate = (event: number, creature: Creature, diff: number): boolean => {
 
    const creatureGuid = creature.GetGUIDLow();
    const instanceId = creature.GetInstanceId();
    const mapId = creature.GetMapId();
    const npcEntry = creature.GetEntry();
    const state = npcState[`${instanceId}-${creatureGuid}`];
    const previousTime = state.time || 0;

    // Get NPC type and config
    const npcType = getNPCTypeFromEntry(npcEntry);
    if (!npcType) return true;
    
    const npcConfig = getNPCMapConfig(npcType, mapId);
    if (!npcConfig) return true;

    state.time = (previousTime + diff);
    const seconds = Math.ceil(state.time / 1000);
    
    // Handle emotes based on the emote map for this NPC in this map
    const npcEmoteMap = emotesMap[`${npcEntry}-${mapId}`];
    if(npcEmoteMap && npcEmoteMap[seconds] && npcEmoteMap[seconds] !== state.lastEmote) {
        PrintDebug(`Emote for ${npcEntry} at ${seconds} seconds`);
        creature.EmoteState(npcEmoteMap[seconds]);
        state.lastEmote = npcEmoteMap[seconds];
    }

    // Check if the audio/dialog sequence has completed based on config
    if(seconds >= npcConfig.completionTime) {
        ClearUniqueCreatureEvents(creature.GetGUID(), instanceId);
        state.audioActive = false;
        state.intro = true;
        
        // Show gossip menu to all players who were in range when the NPC started talking
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

    return true;
}

const BossMapping: Record<number, NPCType> = {
    [5775]: NPCType.MICK_ASHWILD,         // Verdan the Everliving
    [10508]: NPCType.SHIVEY,              // Ras Frostwhisper
    [9938]: NPCType.THORIN_FIREHAND,      // Magmus 
    [10436]: NPCType.ELOWYN_THREADBINDER, // Baroness Anastari
    [26687]: NPCType.STEVE,               // Gortok
    [28587]: NPCType.THORIN_FIREHAND,      // Volkahn
    [17536]: NPCType.MICK_ASHWILD,         // Nazan
    [26794]: NPCType.SHIVEY,               // Ormorok The Tree Shaper
};

// Generic function for handling boss deaths and spawning NPCs
const handleBossDeath: creature_event_on_died = (event: number, creature: Creature, killer: Creature): boolean => {
    const mapId = creature.GetMapId();
    const bossId = creature.GetEntry();
    const npcType = BossMapping[bossId];

    if(!npcType) {
        PrintError(`No NPC type found for boss ID ${bossId}`);
        return false;
    }
    
    const config = getNPCMapConfig(npcType, mapId);
    if(!config) {
        PrintError(`No NPC configured to spawn for boss ID ${bossId} on map ${mapId}`);
        return false;
    }
    
    // Spawn the blue portal 
    const startLoc = config.spawnConfig.portalLocation;
    const endLoc = config.spawnConfig.moveToLocation;
    const despawnTime = config.spawnConfig.despawnTime || 1200000;
    
    PrintDebug(`${creature.GetName()} died, spawning ${npcType}`);
    
    const portal = creature.SummonGameObject(
        GobjectIds[GobjectType.PORTAL],
        startLoc.x, startLoc.y, startLoc.z, startLoc.o
    );
    
    // Spawn the special NPC at the portal location
    const npc = portal.SpawnCreature(
        NPCIds[npcType],
        startLoc.x, startLoc.y, startLoc.z, startLoc.o,
        TempSummonType.TEMPSUMMON_TIMED_DESPAWN, despawnTime
    );
    
    if(!npc) {
        PrintError(`Failed to spawn ${npcType} for boss ID ${bossId} on map ${mapId}`);
        return false;
    }

    // Make the NPC walk to the destination
    npc.SetWalk(true);
    npc.MoveTo(1, endLoc.x, endLoc.y, endLoc.z);
    
    return false; // return false to continue normal action
};

// Helper function to get all map configs for an NPC type
function getNPCMapConfigs(npcType: NPCType): Record<number, NPCMapConfig> {
    const configs: Record<string, Record<number, NPCMapConfig>> = {
        [NPCType.MICK_ASHWILD]: {
            [MapIds[MapNames.WAILING_CAVERNS]]: getNPCMapConfig(NPCType.MICK_ASHWILD, MapIds[MapNames.WAILING_CAVERNS])!
            // Add other maps for Mick
        },
        [NPCType.SHIVEY]: {
            [MapIds[MapNames.SCHOLOMANCE]]: getNPCMapConfig(NPCType.SHIVEY, MapIds[MapNames.SCHOLOMANCE])!
            // Add other maps for Shivey
        }
        // Add other NPCs
    };
    
    return configs[npcType] || {};
}

// Generic menu handler used by all special trainers 
function npcHello(player: Player, creature: Creature, mapId: number, known?: boolean): void {
    player.GossipClearMenu();
    
    const npcEntry = creature.GetEntry();
    const npcType = getNPCTypeFromEntry(npcEntry);
    if (!npcType) return;

    const npcConfig = getNPCMapConfig(npcType, mapId);
    if (!npcConfig) return;

    if(known) {
        player.GossipMenuAddItem(0, npcConfig.gossipOptions.knownSpell, 1, 999);  
        player.GossipSendMenu(1, creature, 90000);
        return; 
    }

    if (npcConfig.spellId) {
        player.GossipMenuAddItem(3, npcConfig.gossipOptions.learnSpell, 1, npcConfig.spellId);
    }
    player.GossipMenuAddItem(0, npcConfig.gossipOptions.decline, 1, 999);    
    player.GossipSendMenu(1, creature, 90000);

}

// This will handle the selection of the spell and granting the player the spell. 
const handleNpcSelect: gossip_event_on_select = (event: number, player: Player, creature: Creature, sender: number, selection: number): boolean => {
    
    const state = GetNPCState(creature);
    const npcEntry = creature.GetEntry();
    const npcType = getNPCTypeFromEntry(npcEntry);
    if (!npcType) return;

    const npcConfig = getNPCMapConfig(npcType, player.GetMapId());
    if (!npcConfig) return;

    PrintDebug(`Player ${player.GetName()} selected ${selection}`);

    // 999 is a signal nothing to do
    if(selection === 999) {     
        // play the outro audio for the player if they have not heard it yet.   
        PlayAudioOnce(player, getAudioFile(npcType, npcConfig.outroAudio), npcType);        
        player.GossipClearMenu();
        player.GossipComplete();
        return true;
    }

    // Check the range of the spell we are trying to learn to make sure there is not a problem. 
    if(selection < Spells.SPELL_ORE_FUSION || selection > Spells.SPELL_EARTH_FUSION_RANK_2) {
        PrintError(`The selection ${selection} is not in the range of learnable spells check coding!!`); 
        return true;
    }

    const skillRequirements: Record<number, {skillId: number, requiredLevel: number}> = {
        [Spells.SPELL_LEATHER_FUSION]: { skillId: 165, requiredLevel: 450 },  // Leatherworking
        [Spells.SPELL_ORE_FUSION]: { skillId: 164, requiredLevel: 450 },      // Blacksmithing
        [Spells.SPELL_CLOTH_FUSION]: { skillId: 197, requiredLevel: 450 },    // Tailoring
        [Spells.SPELL_ALCHEMY_FUSION]: { skillId: 171, requiredLevel: 450 },  // Alchemy
        [Spells.SPELL_GEM_FUSION]: { skillId: 755, requiredLevel: 450 },      // Jewelcrafting
        [Spells.SPELL_ESSENCE_FUSION]: { skillId: 333, requiredLevel: 450 }   // Enchanting
    };

    // these are 10,000 a piece and a special item 
    const costRequirement: Record<number, {cost: number, itemId: number, itemQty: number}> = {
        [Spells.SPELL_FLAME_FUSION]: { cost: 10000*10000, itemId: 2595, itemQty: 1 }, // Jug of Badlands Bourbon
        [Spells.SPELL_COLD_FUSION]: { cost: 10000*10000, itemId: 35716, itemQty: 1 }, // Flask of Pure Death
        [Spells.SPELL_DARK_FUSION]: { cost: 10000*10000, itemId: 197, itemQty: 1 },
        [Spells.SPELL_ARCANE_FUSION]: { cost: 10000*10000, itemId: 171, itemQty: 1 },
        [Spells.SPELL_EARTH_FUSION]: { cost: 10000*10000, itemId: 755, itemQty: 1 },
    };
    
    const requirement = skillRequirements[selection];
    const cost = costRequirement[selection];
    
    if (requirement) {
        const playerSkill = player.GetSkillValue(requirement.skillId);
        PrintDebug(`Learning spell ${selection} for player ${player.GetName()}`);
        PrintDebug(`Player skill ${playerSkill} for skill ID ${requirement.skillId}`);
        
        if (playerSkill >= requirement.requiredLevel) {
            // Player has required skill level, teach the spell
            player.LearnSpell(selection);
            PrintDebug(`Learning spell ${selection} for player ${player.GetName()}`);
            PlayAudioOnce(player, getAudioFile(npcType, npcConfig.teachYesAudio || "teach-rare-yes"), npcType);
            player.CastSpell(player, 40333);
        } else {
            // Player doesn't have required skill level
            PrintDebug(`FAILING ${selection} for player ${player.GetName()}`);
            PlayAudioOnce(player, getAudioFile(npcType, npcConfig.teachNoAudio || "teach-rare-no"), npcType);
        }
    } else if(cost) {
        const playerMoney = player.GetCoinage(); 
        const playerItem = player.GetItemCount(cost.itemId);
        if(playerMoney >= cost.cost && playerItem >= cost.itemQty) {
            player.SetCoinage(playerMoney - cost.cost);
            player.RemoveItem(cost.itemId, cost.itemQty);
            player.LearnSpell(selection);
            PlayAudioOnce(player, getAudioFile(npcType, npcConfig.teachYesAudio), npcType);
            player.CastSpell(player, 40333);
        } else {
            PrintDebug(`FAILING ${selection} for player ${player.GetName()}`);
            PlayAudioOnce(player, getAudioFile(npcType, npcConfig.teachNoAudio), npcType);
        }
    } else {
        PrintError(`No skill requirement defined for spell ${selection}`);
    }

    player.GossipComplete();
    return true;
}

// Micks events
const handleNpcHello: gossip_event_on_hello = (event: number, player: Player, creature: Creature): boolean => {
    const npcEntry = creature.GetEntry();
    const mapId = player.GetMapId();
    const instanceId = player.GetInstanceId();

    const npcType = getNPCTypeFromEntry(npcEntry);
    if (!npcType) {
        return false; // Not one of our special NPCs
    }
    
    // Get the global creature state for special NPCs
    const myState = GetNPCState(creature);
    const npcConfig = getNPCMapConfig(npcType, mapId);
    if (!npcConfig) {
        return false; // NPC not configured for this map
    }

    creature.SetFacingToObject(player);

    // Check if player already knows the spell for this location
    if (PlayerHasSpell(player)) {
        npcHello(player, creature, mapId, true);
        PlayAudioOnce(player, getAudioFile(npcType, npcConfig.outroAudio));
        return true;
    }

    if (!myState.audioActive) {
        // Get all nearby players
        const nearPlayers = creature.GetPlayersInRange(35);
        
        for (let i = 0; i < nearPlayers.length; i++) {
            const nearPlayer = nearPlayers[i];
            myState.players.push(nearPlayer.GetName());
            
            // Play appropriate audio based on whether player knows the spell
            if (PlayerHasSpell(nearPlayer)) {
                // Player already knows the spell, play outro audio
                PlayAudioOnce(nearPlayer, getAudioFile(npcType, npcConfig.outroAudio), npcType);
            } else {
                // Player doesn't know the spell, play intro audio
                PlayAudioOnce(nearPlayer, getAudioFile(npcType, npcConfig.introAudio), npcType);
            }
        }
        
        creature.EmoteState(EmoteType.ONESHOT_NONE);
        myState.audioActive = true;
        ClearUniqueCreatureEvents(creature.GetGUID(), instanceId, CreatureEvents.CREATURE_EVENT_ON_AIUPDATE);
        RegisterUniqueCreatureEvent(creature.GetGUID(), instanceId, CreatureEvents.CREATURE_EVENT_ON_AIUPDATE, 
            (...args) => handleNPCAIUpdates(...args));


    } else {
        // NPC already active, just add this player if not already tracked
        if (!myState.players.includes(player.GetName())) {
            myState.players.push(player.GetName());
        }
        
        // If intro is complete, show appropriate gossip menu
        if (myState.intro) {
            npcHello(player, creature, mapId, PlayerHasSpell(player));
        }
    }

    return true;
};

/**** Boss Kill Handlers ****/

// Register boss death events based on NPC configurations
function registerBossDeathEvents() {
    // Set to track which boss IDs we've already registered
    const registeredBossIds = new Set<number>();

    // Loop through all NPCs and their map configs
    for (const npcType in NpcConfigMap) {
        const mapConfigs = NpcConfigMap[npcType];


        // Check each map config for this NPC
        for (const mapIdStr in mapConfigs) {
            const config = mapConfigs[mapIdStr];

            PrintDebug(`Registering boss death events for ${npcType} in map ${mapIdStr}`);

            // If this NPC has a spawn config with a boss ID
            if (config.spawnConfig?.bossId) {
                const bossId = config.spawnConfig.bossId;
                
                // Only register each boss ID once
                if (!registeredBossIds.has(bossId)) {
                    RegisterCreatureEvent(bossId, CreatureEvents.CREATURE_EVENT_ON_DIED, (...args) => handleBossDeath(...args));
                    PrintDebug(`Registered death event for boss ID ${bossId}`);
                    registeredBossIds.add(bossId);
                }
            }
        }
    }
}

// Register all boss death events
registerBossDeathEvents();

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

// Register events only for specific, known NPCs
const validNPCs = [
    NPCType.MICK_ASHWILD,
    NPCType.SHIVEY,
    NPCType.THORIN_FIREHAND,
    NPCType.ELOWYN_THREADBINDER,
    NPCType.STEVE,
    // Add other valid NPCs here as you implement them
];

for (let i = 0; i < validNPCs.length; i++) {
    const npcType = validNPCs[i];
    const npcId = NPCIds[npcType];
    
    if (npcId) {
        // Register spawn event
        RegisterCreatureEvent(npcId, CreatureEvents.CREATURE_EVENT_ON_SPAWN, (event: number, creature: Creature): boolean => {
            PrintDebug(`NPC ${npcType} (ID: ${npcId}) spawned`);
            commonCreatureRegister(creature);
            return false;
        });
        
        // Register remove event
        RegisterCreatureEvent(npcId, CreatureEvents.CREATURE_EVENT_ON_REMOVE, (event: number, creature: Creature): boolean => {
            PrintDebug(`NPC ${npcType} (ID: ${npcId}) removed`);
            commonCreatureRegister(creature);
            return false;
        });
        
        // Register gossip events
        RegisterCreatureGossipEvent(npcId, GossipEvents.GOSSIP_EVENT_ON_HELLO, (...args) => handleNpcHello(...args));
        RegisterCreatureGossipEvent(npcId, GossipEvents.GOSSIP_EVENT_ON_SELECT, (...args) => handleNpcSelect(...args));
        
        PrintDebug(`Registered all events for NPC ${npcType} (ID: ${npcId})`);
    } else {
        PrintError(`Failed to register events for NPC ${npcType} - ID not found`);
    }
}

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

// Lore Audio Player

function showVaericGossip(player: Player, creature: Creature) {
    player.GossipClearMenu(); 
    player.GossipMenuAddItem(0, "Tell me what has happened, again", 1,1);
    player.GossipMenuAddItem(9, "Increase my strength and agility", 1,2); 
    player.GossipMenuAddItem(0, "Goodbye, Vaeric", 1,999);
    player.GossipSendMenu(60566, creature, 90566); 
}

const vaericIntro: gossip_event_on_hello = (event: number, player: Player, creature: Creature): boolean => {
    creature.SetFacingToObject(player);

    if(!GetTrigger(player.GetGUID(), "VAERIC_INTRO")) {
        PlayAudioOnce(player, getAudioFile(NPCType.VAERIC, "lore-intro"));
        SetTrigger({triggerName: "VAERIC_INTRO", characterGuid: player.GetGUID(), isSet: true});
        creature.EmoteState(EmoteType.ONESHOT_TALK);
    } else {
        PlayAudioOnce(player, getAudioFile(NPCType.VAERIC, "hello-1"), null, true);
    }

    // player.RegisterEvent((delay: number, repeats: number, player: Player) => {
        showVaericGossip(player, creature);
    // }, 150);

    creature.RegisterEvent((delay: number, repeats: number, creature: Creature) => {
        creature.EmoteState(EmoteType.ONESHOT_NONE);
    }, 12000);

    return true;
};

const vaericSelect: gossip_event_on_select = (event: number, player: Player, creature: Creature, sender: number, selection: number): boolean => {

    PrintInfo(`Vaeric select: ${selection} from sender ${sender}`);

    if(selection === 1) {
        creature.EmoteState(EmoteType.ONESHOT_TALK);
        PlayAudioOnce(player, getAudioFile(NPCType.VAERIC, "lore-intro"), undefined, true);
        creature.RegisterEvent((delay: number, repeats: number, creature: Creature) => {
            creature.EmoteState(EmoteType.ONESHOT_NONE);
        }, 12000);
    } else if(selection === 2) {
        PlayAudioOnce(player, getAudioFile(NPCType.VAERIC, "stronger"), undefined, true);
        aio.Handle(player, "MythicAdvUI", "ShowUpgradeWindow", "Attack");
    } else if(selection === 999) {
        PlayAudioOnce(player, getAudioFile(NPCType.VAERIC, "goodbye-1"), undefined, true);
        player.GossipComplete();
        creature.EmoteState(EmoteType.ONESHOT_NONE);  
        return false;
    }

    showVaericGossip(player, creature);

    return false;
};

RegisterCreatureGossipEvent(NPCIds[NPCType.VAERIC], GossipEvents.GOSSIP_EVENT_ON_HELLO, (...args) => vaericIntro(...args));
RegisterCreatureGossipEvent(NPCIds[NPCType.VAERIC], GossipEvents.GOSSIP_EVENT_ON_SELECT, (...args) => vaericSelect(...args));


// Agatha
function showAgathaGossip(player: Player, creature: Creature) {
    player.GossipClearMenu(); 
    player.GossipMenuAddItem(0, "Who are you again?", 1,1);
    player.GossipMenuAddItem(0, "Tell me about the relics.", 1,2);
    player.GossipMenuAddItem(0, "How else can you assist me?", 1,3);
    player.GossipMenuAddItem(0, "Why can't you erase Kel'Thuzad?", 1,4);
    player.GossipMenuAddItem(3, "Improve my mind and spirit", 1,5); 
    player.GossipMenuAddItem(3, "Help me resist shadow energy", 1,6); 
    player.GossipMenuAddItem(0, "Goodbye, Agatha", 1,999);
    player.GossipSendMenu(60567, creature, 90567); 
}

const agathaIntro: gossip_event_on_hello = (event: number, player: Player, creature: Creature): boolean => {
    creature.SetFacingToObject(player);

    if(!GetTrigger(player.GetGUID(), "AGATHA_INTRO")) {
        PlayAudioOnce(player, getAudioFile(NPCType.AGATHA, "intro-lore"));
        SetTrigger({triggerName: "AGATHA_INTRO", characterGuid: player.GetGUID(), isSet: true});
    } else {
        PlayAudioOnce(player, getAudioFile(NPCType.AGATHA, "hello-1"), null, true);
    }

    showAgathaGossip(player, creature);

    return true;
};

const agathaSelect: gossip_event_on_select = (event: number, player: Player, creature: Creature, sender: number, selection: number): boolean => {

    PrintInfo(`Agatha select: ${selection} from sender ${sender}`);

    if(selection === 1) {
        PlayAudioOnce(player, getAudioFile(NPCType.AGATHA, "intro-lore"), undefined, true);
    } else if(selection === 2) {
        PlayAudioOnce(player, getAudioFile(NPCType.AGATHA, "dice"), undefined, true);
    } else if(selection === 3) {
        PlayAudioOnce(player, getAudioFile(NPCType.AGATHA, "meetings"), undefined, true);
    } 
    else if(selection === 4) {
        PlayAudioOnce(player, getAudioFile(NPCType.AGATHA, "stop-asking"), undefined, true); 
    } else if(selection === 5) {
        PlayAudioOnce(player, getAudioFile(NPCType.AGATHA, "stronger"), undefined, true);
        aio.Handle(player, "MythicAdvUI", "ShowUpgradeWindow", "Magic");
    } else if(selection === 6) {
        PlayAudioOnce(player, getAudioFile(NPCType.AGATHA, "shadow"), undefined, true);
        aio.Handle(player, "MythicAdvUI", "ShowUpgradeWindow", "Shadow");
    } 

    else if(selection === 999) {
        PlayAudioOnce(player, getAudioFile(NPCType.AGATHA, "goodbye"), undefined, true);
        player.GossipComplete();
        return false;
    }

    showAgathaGossip(player, creature);

    return false;
};

RegisterCreatureGossipEvent(NPCIds[NPCType.AGATHA], GossipEvents.GOSSIP_EVENT_ON_HELLO, (...args) => agathaIntro(...args));
RegisterCreatureGossipEvent(NPCIds[NPCType.AGATHA], GossipEvents.GOSSIP_EVENT_ON_SELECT, (...args) => agathaSelect(...args));

// Slyvia
function showSylviaGossip(player: Player, creature: Creature) {
    player.GossipClearMenu(); 
    player.GossipMenuAddItem(0, "Who are you again?", 1,1);
    player.GossipMenuAddItem(3, "Improve my stamina", 1,2);
    player.GossipMenuAddItem(3, "Grant me resistance against the elements", 1,3);
    player.GossipMenuAddItem(3, "Grant me resistance against arcane and poisons", 1,4);
    player.GossipMenuAddItem(0, "Goodbye, ", 1,999);
    player.GossipSendMenu(60568, creature, 90568); 
}

const sylviaIntro: gossip_event_on_hello = (event: number, player: Player, creature: Creature): boolean => {

    if(!creature || !player) {
        AIO_debug("Sylvia intro: creature is null");
        return false;
    } 

    if(!GetTrigger(player.GetGUID(), "SYLVIA_INTRO")) {
        creature.EmoteState(EmoteType.ONESHOT_TALK);
        PlayAudioOnce(player, getAudioFile(NPCType.SYLVIA, "intro"));
        SetTrigger({triggerName: "SYLVIA_INTRO", characterGuid: player.GetGUID(), isSet: true});
        creature.RegisterEvent((delay: number, repeats: number, creature: Creature) => {
            creature.EmoteState(EmoteType.ONESHOT_NONE);
        }, 10000);
    } else {
        PlayAudioOnce(player, getAudioFile(NPCType.SYLVIA, "hello"), null, true);
    }

    showSylviaGossip(player, creature);

    return true;
};

const sylviaSelect: gossip_event_on_select = (event: number, player: Player, creature: Creature, sender: number, selection: number): boolean => {

    if(selection === 1) {
        creature.EmoteState(EmoteType.ONESHOT_TALK);
        PlayAudioOnce(player, getAudioFile(NPCType.SYLVIA, "intro"), undefined, true);
        creature.RegisterEvent((delay: number, repeats: number, creature: Creature) => {
            creature.EmoteState(EmoteType.ONESHOT_NONE);
        }, 10000);
    } else if(selection === 2) {
        PlayAudioOnce(player, getAudioFile(NPCType.SYLVIA, "stronger"), undefined, true);
        aio.Handle(player, "MythicAdvUI", "ShowUpgradeWindow", "Defense");
    } else if(selection === 3) {
        PlayAudioOnce(player, getAudioFile(NPCType.SYLVIA, "fire-ice"), undefined, true);
        aio.Handle(player, "MythicAdvUI", "ShowUpgradeWindow", "FireFrost");
    } 
    else if(selection === 4) {
        PlayAudioOnce(player, getAudioFile(NPCType.SYLVIA, "arcane-nature"), undefined, true); 
        aio.Handle(player, "MythicAdvUI", "ShowUpgradeWindow", "NatureArcane");
 
    } else if(selection === 999) {
        PlayAudioOnce(player, getAudioFile(NPCType.SYLVIA, "goodbye"), undefined, true);
        player.GossipComplete();
        return false;
    }

   showSylviaGossip(player, creature);

    return false;
};

RegisterCreatureGossipEvent(NPCIds[NPCType.SYLVIA], GossipEvents.GOSSIP_EVENT_ON_HELLO, (...args) => sylviaIntro(...args));
RegisterCreatureGossipEvent(NPCIds[NPCType.SYLVIA], GossipEvents.GOSSIP_EVENT_ON_SELECT, (...args) => sylviaSelect(...args));