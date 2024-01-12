import { PlayerStats, StatEvents } from "../classes/stats";

const NORMAL_TICKET_CHANCE = 2;
const BOSS_TICKET_CHANCE = 10;

/**
 * Conditions to get a potential token drop are as follows
 * Helps with giving players more tickets during darkmoon fair month.
 * If
 */
const TicketKill: player_event_on_kill_creature = (event: number, player: Player, creature: Creature ) => {

  

  // let chance: number;
  // if( creature.IsDungeonBoss() ) {
  //   chance = BOSS_TICKET_CHANCE;
  // } else if(!creature.IsWorldBoss() ) {
  //   chance = 100;
  // } else {
  //   chance = NORMAL_TICKET_CHANCE;
  // }

  // // player level is greater then 7 levels than creature level
  // const clevel = creature.GetLevel();
  // const plevel = player.GetLevel();

  // if(plevel >= (clevel + 7)) {
  //   return;
  // }

  // let darkmoon = [];
  // const result = WorldDBQuery('SELECT eventEntry from game_event WHERE description like "%Darkmoon Faire%"');

  // // A Darkmoon event has to be active.
  // const events = GetActiveGameEvents();

  // for(let i=0; i < result.GetRowCount(); i++) {
  //   const row = result.GetRow();
  //   darkmoon.push(row.eventEntry);
  //   result.NextRow();
  // }

  // let darkmoonActive = false;
  // for(let event of events) {
  //   if(darkmoon.includes(event)) {
  //     darkmoonActive = true;
  //   }
  // }

  // // Roll for token drop
  // let roll = Math.floor(Math.random() * 100);

  // const pStats = new PlayerStats(player);
  // if(roll <= chance) {
  //   if(creature.IsWorldBoss()) {
  //     player.AddItem(19182,100);
  //     player.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_LOOT, Language.LANG_COMMON, `Congrats here are 100 tickets.`, player);
  //     pStats.increment(StatEvents.TICKETS_AWARDED,100);
  //   } else if(creature.IsDungeonBoss()) {
  //     player.AddItem(19182, 20);
  //     player.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_LOOT, Language.LANG_COMMON, `You received a 20 Darkmoon tickets, lucky you!`, player);
  //     pStats.increment(StatEvents.TICKETS_AWARDED,20);
  //   } else {
  //     player.AddItem(19182,1);
  //     player.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_LOOT, Language.LANG_COMMON, `You received a Darkmoon ticket, lucky you!`, player);
  //     pStats.increment(StatEvents.TICKETS_AWARDED,1);
  //   }
  // }

}

// RegisterPlayerEvent(
//     PlayerEvents.PLAYER_EVENT_ON_KILL_CREATURE,
//     (...args) => TicketKill(...args)
// );
