const TaintedKill: player_event_on_kill_creature = (event, player, creature) => {
    if(creature.GetEntry() == 22009) {
        player.AddItem(31088, 1);
    }
}; 

RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_KILL_CREATURE,
    (...args) => TaintedKill(...args)
);
