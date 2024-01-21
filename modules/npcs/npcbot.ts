const npcBotEmote: creature_event_on_died = (event: number, creature: Creature, player: Player) => {

    // player.KillPlayer(); 
    print('Here!!!!!')
    // print(`Emote ${emoteId}`); 

    return true; 
}

RegisterCreatureEvent(
    25155,
    // 70201, 
    CreatureEvents.CREATURE_EVENT_ON_DIED, 
    (...args) => npcBotEmote(...args)
); 

print("hello world"); 