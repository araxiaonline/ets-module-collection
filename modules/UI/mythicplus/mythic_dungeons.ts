import {
  isBossDbCheck,
  MapIds,
  MapNames,
  DungeonLevels,
  isFinalBoss,
} from "../../classes/mapzones";
import {
  MYTHIC_TOKEN,
  EMBLEM_OF_UNDEATH,
  EMBLEM_OF_CHAOS,
  EMBLEM_OF_VEIL,
  VOID_BADGE,
} from "./mythic_items";
import { Logger } from "../../classes/logger";
const SCRIPT_NAME = "MythicDungeonsLoot";
const log = new Logger(SCRIPT_NAME);

log.info(`Mythic Dungeons Loot Module Loaded`);

function isInMythicPlus(playerId: number, instanceId: number): boolean {
  const result = CharDBQuery(
    "select guid, instanceId, difficulty from mp_player_instance_data where guid = " +
      playerId +
      " and instanceId = " +
      instanceId
  );
  if (result && result.GetUInt32(2) >= 3) {
    return true;
  }
  return false;
}

const mythicBossKill: player_event_on_kill_creature = (
  _: number,
  killer: Player,
  killed: Creature
) => {
  // if the creature that is killed is a boss from a mythic plus instance lets check the chart to figure out the
  // token reward.

  PrintInfo(`IsBossDbCheck: ${isBossDbCheck(killed.GetEntry())} NAme: ${killed.GetName()}`);
  const mapId = killer.GetMap().GetMapId();
  const instanceId = killer.GetInstanceId();

  if (
    isInMythicPlus(killer.GetGUID(), killer.GetInstanceId()) &&
    isBossDbCheck(killed.GetEntry())
  ) {
    const reward = getRewardAmount(killer.GetMap(), killed);
    const token = getRewardTokenEntry(killer.GetMap(), killed);

    // Give the player the right amount of tokens for their hard work.
    if (reward > 0 && token > 0) {
      killer.AddItem(token, reward);

      // send a message to the player to let them know they have been awarded tokens
      killer.SendChatMessageToPlayer(
        ChatMsg.CHAT_MSG_ACHIEVEMENT,
        Language.LANG_COMMON,
        `|cff00ff00You have been awarded ${reward} ${getTokenName(
          token
        )} for defeating ${killed.GetName()}!|r`,
        killer
      );
    }
  }

  return false; // return true to stop normal action
};

// Get the number of token that will be awarded to the group.
function getRewardAmount(map: EMap, creature: Creature): number {
  const mapId = map.GetMapId();
  const creatureEntry = creature.GetEntry();
  const isCreatureFinalBoss = isFinalBoss(creatureEntry);

  // Find the corresponding map name for this map ID
  let dungeonLevel = 0;
  for (const [mapName, id] of Object.entries(MapIds)) {
    if (id === mapId) {
      dungeonLevel = DungeonLevels[mapName as MapNames];
      break;
    }
  }

  // Apply reward rules based on dungeon level
  if (dungeonLevel < 35) {
    return 1; // 1 per boss regardless of final boss status
  } else if (dungeonLevel >= 35 && dungeonLevel <= 59) {
    return isCreatureFinalBoss ? 2 : 1; // 1 per boss, 2 for final boss
  } else if (dungeonLevel === 60) {
    return isCreatureFinalBoss ? 4 : 2; // 2 per boss, 4 if final boss
  } else if (dungeonLevel >= 61 && dungeonLevel <= 69) {
    return isCreatureFinalBoss ? 3 : 2; // 2 per boss, 3 on final bosses
  } else if (dungeonLevel === 70) {
    return isCreatureFinalBoss ? 5 : 2; // 2 per boss, 5 on final bosses
  } else if (dungeonLevel >= 71 && dungeonLevel <= 79) {
    return isCreatureFinalBoss ? 3 : 2; // 2 per boss, 3 on final bosses
  } else if (dungeonLevel === 80) {
    return isCreatureFinalBoss ? 5 : 3; // 3 per boss, 5 on final bosses
  }

  return 0;
}

// This will need expanded later to account for legendary status.
function getRewardTokenEntry(map: EMap, boss: Creature): number {
  // if the map is a normal instance return the mythic token id
  if (map.IsDungeon()) {
    if (map.IsHeroic()) {
      return VOID_BADGE;
    } else {
      return MYTHIC_TOKEN;
    }
  }

  // Only mythic raids launched at this time will be these 3
  if (map.IsRaid()) {
    // undeath tier gear raids MoltenCore, BlackwingLair, ZulGurub
    const undeathRaids = [
      MapIds[MapNames.MOLTEN_CORE],
      MapIds[MapNames.BLACKWING_LAIR],
      MapIds[MapNames.ZUL_GURUB],
    ];
    if (undeathRaids.includes(map.GetMapId())) {
      return EMBLEM_OF_UNDEATH;
    }
  }

  return 0;
}

function getTokenName(token: number): string {
  switch (token) {
    case MYTHIC_TOKEN:
      return "Mythic Token";
    case EMBLEM_OF_UNDEATH:
      return "Emblem of Undeath";
    case EMBLEM_OF_CHAOS:
      return "Emblem of Chaos";
    case EMBLEM_OF_VEIL:
      return "Emblem of Veil";
    case VOID_BADGE:
      return "Void Badge";
    default:
      return "Unknown Token";
  }
}

// Register
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_KILL_CREATURE, (...args) =>
  mythicBossKill(...args)
);

