/** @ts-expect-error */
let aio: AIO = {};

const SCRIPT_NAME = "UpgradeUI";
import { Logger } from "../../classes/logger";
import { PlayerAdvancement } from "./advstate";
const log = new Logger(SCRIPT_NAME);

// Flag to track if materials have been loaded
let materialsLoaded = false;

type ItemType = {
  entry: number;
  name: string;
};

type Materials = {
  name: string;
  items: Array<ItemType>;
};

const upgradeMaterials: Record<number, Materials> = {};
const playerAdvData: Map<number, PlayerAdvancement[]> = new Map();

/*
    Advancement IDs in Database 

    MP_ADV_INTELLECT        = 0,
    MP_ADV_SPIRIT           = 1,
    MP_ADV_STRENGTH         = 2,
    MP_ADV_AGILITY          = 3,
    MP_ADV_STAMINA          = 4,
    MP_ADV_RESIST_ARCANE    = 5,
    MP_ADV_RESIST_FIRE      = 6,
    MP_ADV_RESIST_NATURE    = 7,
    MP_ADV_RESIST_FROST     = 8,
    MP_ADV_RESIST_SHADOW    = 9,
*/

export interface AdvCost {
  upgradeRank: number; // The rank of the upgrade
  advancementId: number; // Which advancement this applies to
  itemEntry1: number; // First item required for upgrade
  itemEntry2: number; // Second item required for upgrade
  itemEntry3: number; // Third item required for upgrade
  itemCost1: number; // Quantity of first item
  itemCost2: number; // Quantity of second item
  itemCost3: number; // Quantity of third item
  minIncrease1: number; // Minimum stat increase for option 1
  maxIncrease1: number; // Maximum stat increase for option 1
  minIncrease2: number; // Minimum stat increase for option 2
  maxIncrease2: number; // Maximum stat increase for option 2
  minIncrease3: number; // Minimum stat increase for option 3
  maxIncrease3: number; // Maximum stat increase for option 3
  chanceCost1: number; // Success chance cost for option 1
  chanceCost2: number; // Success chance cost for option 2
  chanceCost3: number; // Success chance cost for option 3
}

export function GetAdvCostNextLevel(
  advId: number,
  player: Player
): AdvCost | null {
  // First, get the player's current upgrade rank for this advancement
  const playerGuid = player.GetGUID();
  const playerAdvQuery = CharDBQuery(
    `SELECT upgradeRank FROM mp_player_advancements WHERE guid = ${playerGuid} AND advancementId = ${advId}`
  );

  // Default to rank 0 if player doesn't have this advancement yet
  const currentRank = playerAdvQuery ? playerAdvQuery.GetUInt32(0) : 0;

  // Get the next rank (current + 1)
  const nextRank = currentRank + 1;

  // Now get the upgrade costs for the next rank
  const costsQuery = WorldDBQuery(
    `SELECT * FROM mp_upgrade_ranks WHERE upgradeRank = ${nextRank} AND advancementId = ${advId}`
  );

  if (!costsQuery) {
    // No more upgrades available for this advancement
    return null;
  }

  return {
    upgradeRank: costsQuery.GetUInt32(0),
    advancementId: costsQuery.GetUInt32(1),
    itemEntry1: costsQuery.GetUInt32(2),
    itemEntry2: costsQuery.GetUInt32(3),
    itemEntry3: costsQuery.GetUInt32(4),
    itemCost1: costsQuery.GetUInt32(5),
    itemCost2: costsQuery.GetUInt32(6),
    itemCost3: costsQuery.GetUInt32(7),
    minIncrease1: costsQuery.GetUInt32(8),
    maxIncrease1: costsQuery.GetUInt32(9),
    minIncrease2: costsQuery.GetUInt32(10),
    maxIncrease2: costsQuery.GetUInt32(11),
    minIncrease3: costsQuery.GetUInt32(12),
    maxIncrease3: costsQuery.GetUInt32(13),
    chanceCost1: costsQuery.GetUInt32(14),
    chanceCost2: costsQuery.GetUInt32(15),
    chanceCost3: costsQuery.GetUInt32(16),
  };
}

/**
 * Helper function to safely get items from a material
 */
const getItemsFromMaterial = (material: Materials): Array<ItemType> => {
  if (!material) {
    return [];
  }

  if (!material.items) {
    material.items = [];
  }

  return material.items;
};

/**
 * Handles the logic for showing the upgrade UI when a player types .advanceme
 */
const ShowUpgradeUI: player_event_on_command = (
  event: number,
  player: Player,
  command: string
): boolean => {
  if (command === "advanceme") {
    log.info(`Showing Upgrade UI for player: ${player.GetName()}`);
    aio.Handle(player, "UpgradeUI", "ShowUpgradeWindow");
    return false;
  }
  return true;
};

/**
 * Register the command event to listen for ".advanceme"
 */
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_COMMAND, (...args) =>
  ShowUpgradeUI(...args)
);

const ShowNextLevelCost: player_event_on_chat = (
  event: number,
  player: Player,
  msg: string,
  Type: ChatMsg,
  lang: Language
): string | boolean => {
  log.info(`Player ${player.GetName()} typed ${msg}`);
  if (msg.includes("#nextlevelcost")) {
    const args = msg.split(" ");
    const advId = Number(args[1]);

    const nextLevelCost = GetAdvCostNextLevel(advId, player);
    player.SendBroadcastMessage(
      `Next level cost: Chance: ${nextLevelCost.chanceCost1}, Item: ${nextLevelCost.itemEntry1} x ${nextLevelCost.itemCost1}`
    );
    return false;
  }

  if(msg.includes("#advancedata")) {
    const data = playerAdvData.get(player.GetGUIDLow());
    if(!data) {
        PrintInfo(`Player ${player.GetName()} does not have any advancement data`);
        return true;
    }

    for(let i=0; i<data.length; i++) {
        PrintInfo(`Player ${player.GetName()} advancement ${data[i].advancementId} is at rank ${data[i].upgradeRank} total history ${data[i].history.length}`);
    }

    aio.Handle(player, "MythicAdvUI", "UpdateAdvancements", data);
    return false;
  }
  return true;
};

/**
 * Initialize advancement data for a player if they do not have any
 * @param player
 */
function _initPlayerAdvancements(player: Player): void {
  for (let i = 0; i < 10; i++) {
    // If it already exists then skip it.
    const checkQuery = CharDBQuery(
      `SELECT * FROM mp_player_advancements WHERE guid = ${player.GetGUID()} AND advancementId = ${i}`
    );
    if (checkQuery) {
      continue;
    }

    CharDBQuery(
      `INSERT INTO mp_player_advancements (guid, advancementId, bonus, upgradeRank, diceSpent) VALUES (${player.GetGUID()}, ${i}, 0, 0, 0)`
    );
  }
}

// this will get the advancement data for a player and pass back empty data if they do not have one.
function _getAdvancementData(player: Player): PlayerAdvancement[] {
  let result = CharDBQuery(
    `SELECT * FROM mp_player_advancements WHERE guid = ${player.GetGUID()} ORDER BY advancementId ASC`
  );

  const advancements: PlayerAdvancement[] = [];
  if (!result) {
    _initPlayerAdvancements(player);

    // now grab the new initialized results
    result = CharDBQuery(
      `SELECT * FROM mp_player_advancements WHERE guid = ${player.GetGUID()} ORDER BY advancementId ASC`
    );
  }

  if (result.GetRowCount() !== 10) {
    _initPlayerAdvancements(player);
    result = CharDBQuery(
      `SELECT * FROM mp_player_advancements WHERE guid = ${player.GetGUID()} ORDER BY advancementId ASC`
    );
  }

  if (!result) {
    PrintError(`Failed to get advancement data for player ${player.GetName()}`);
    return [];
  }

  for(let i=0; i<result.GetRowCount(); i++) {
    const row = result.GetRow();
    advancements[Number(row.advancementId)] = {
      advancementId: Number(row.advancementId),
      upgradeRank: Number(row.upgradeRank),
      diceSpent: Number(row.diceSpent),
      bonus: Number(row.bonus),
      history: []
    };

    const historyQuery = CharDBQuery(
      `SELECT * FROM mp_player_advancement_history WHERE guid = ${player.GetGUID()} AND advancementId = ${
        row.advancementId
      }`
    );

    if(historyQuery) {
    for(let j=0; j<historyQuery.GetRowCount(); j++) {
        const historyRow = historyQuery.GetRow();
        advancements[Number(row.advancementId)].history.push({
            rank: Number(historyRow.upgradeRank),
            diceSpent: Number(historyRow.diceSpent),
            bonus: Number(historyRow.bonus),
        });
        historyQuery.NextRow();
        }
    }

    result.NextRow();
  }

  PrintInfo(`Loaded Advancements for player ${player.GetName()} total ${advancements.length}...`);

  return advancements;
}

const GetAdvancementData: player_event_on_login = (
  event: number,
  player: Player
) => {
  const advancements = _getAdvancementData(player);
  playerAdvData.set(player.GetGUIDLow(), advancements);
  aio.Handle(player, "MythicAdvUI", "UpdateAdvancementState", player.GetGUIDLow(), advancements);
};

// Get the player state when the login and push to client for storage.
// RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_LOGIN, (...args) =>
//   GetAdvancementData(...args)
// );

const ReloadAdvancements: eluna_event_on_lua_state_open = (event: number) => {

    PrintInfo("Lua State Closed");    
    // Need to capture all players online and reload their state. 
    const players = GetPlayersInWorld(); 
    for(let i=0; i<players.length; i++) {
        GetAdvancementData(event, players[i]);
    }
};

// Register Server Event on Lua State Ope
// RegisterServerEvent(ServerEvents.ELUNA_EVENT_ON_LUA_STATE_OPEN, (...args) => ReloadAdvancements(...args));

// RegisterServerEvent(ServerEvents.ELUNA_EVENT_ON_LUA_STATE_CLOSE, (...args) => {
//     PrintInfo("Lua State Closed");    
// }); 


// Register
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_CHAT, (...args) =>
  ShowNextLevelCost(...args)
);

/**
 * Get all the material types from the database
 * RegisterServerEvent(ServerEvents.ELUNA_EVENT_ON_LUA_STATE_OPEN, (...args) => GetMaterialsList(...args));
 */

// AIO Handlers for Mythic Advancement UI
const MythicAdvUIHandlers = {
  // Handle the GetNextLevelCost request from client
  GetNextLevelCost: function (this: void, player: Player, advId: number): void {
    log.info(
      `GetNextLevelCost called for player ${player.GetName()} with advId ${advId}`
    );

    // Get the next level cost information
    const nextLevelCost = GetAdvCostNextLevel(advId, player);

    if (!nextLevelCost) {
      log.error(`No next level cost found for advId ${advId}`);
      return;
    }

    // Send the cost information back to the client
    aio.Handle(player, "MythicAdvUI", "UpdateNextLevelCost", nextLevelCost);

    log.info(
      `Sent next level cost for advId ${advId} to player ${player.GetName()}`
    );
  },

  GetAdvancementState: function (this: void, player: Player, advId?: number, rank?: number, bonus?: number): void {
    
    const advancements = _getAdvancementData(player);    

    // if the client passes us an override from the backend then apply it before sending it back. 
    if(advId && rank && bonus) {
        advancements[advId].upgradeRank = rank;
        advancements[advId].bonus = Math.round(bonus);
    }
    playerAdvData.set(player.GetGUIDLow(), advancements);

    aio.Handle(player, "MythicAdvUI", "UpdateAdvancementState", player.GetGUIDLow(), advancements);
  },
};

// Register the handlers with AIO
aio.AddHandlers("MythicAdvUI", MythicAdvUIHandlers);

const ShowUpgradeWindow: player_event_on_chat = (event: number, player: Player, msg: string, Type: ChatMsg, lang: Language): string | boolean => {
  // Implementation
  if(msg === "#advanceme") {

    const parts = msg.split(" ");
    const type = parts[1];

    aio.Handle(player, "MythicAdvUI", "ShowUpgradeWindow", type);
    return false;
  }
  return true;
};

// Register
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_CHAT, (...args) => ShowUpgradeWindow(...args));
