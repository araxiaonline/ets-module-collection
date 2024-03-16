import { rollDice } from '../classes/server-utils';

const startRoll: number = 10;
const endRoll: number = 35;

const CREATURE_TYPE_CRITTER: number = 8;

const tabardFactions = {
    23999: 946,
    24004: 947,
    31773: 941,
    31774: 978,
    31775: 970,
    31776: 933,
    31777: 989,
    31778: 1011,
    31779: 932,
    31780: 934,
    31781: 935,
    31804: 942,
    32445: 1031,
    32828: 1038,
    35221: 1077,
    43154: 1106,
    43155: 1098,
    43156: 1091,
    43157: 1090,
    46817: 1094,
    46818: 1124
};

function killGetRep(event: number, killer: Player, killed: Creature): void {

    // determine the players currently equipped tabard
    const tabard = killer.GetEquippedItemBySlot(EquipmentSlots.EQUIPMENT_SLOT_TABARD);
    if (!tabard) {
        return;
    }

    // determine the reputation gain for the tabard
    const factionId = tabardFactions[tabard.GetEntry()];

    if(!factionId) {
        return;
    }

   if(killed.GetLevel() < (killer.GetLevel() - 3)) {
        return; 
   }

    const currentRep = killer.GetReputation(factionId);
    killer.SetReputation(factionId, currentRep + rollDice(startRoll, endRoll));

}

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_KILL_CREATURE, (...args) => killGetRep(...args));

