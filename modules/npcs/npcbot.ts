const npcBotEmote: creature_event_on_died = (event: number, creature: Creature, player: Player) => {

    // player.KillPlayer(); 
    print('Here!!!!!')
    // print(`Emote ${emoteId}`); 

    return true; 
}

const emoteHandler: creature_event_on_receive_emote = (event: number, creature: Creature, player: Player, emoteId: number) => {

    PrintError(`Emote ${emoteId}`);

    return true; 
}

const deadBot: creature_event_on_died = (event: number, creature: Creature, player: Player) => {
            
        PrintError(creature.GetName() + ' died!');    
        return false; 
}

const enterCombat: creature_event_on_enter_combat = (event: number, creature: Creature, target: Unit) => {
            
    PrintError(creature.GetName() + ' entered combat');   
    print(target.GetName()); 
    return false; 
}

const playerEmote: player_event_on_text_emote = (event: number, player: Player, textEmote: number, emoteNum: number, guid: number) => {
    
    const unit = player.GetSelection();

    if(!unit) {
        return false; 
    }
print(unit.GetTypeId()); 
    if(unit.GetTypeId() ==  TypeID.TYPEID_UNIT) {
        const creature = unit.ToCreature();
        
        print(creature.GetName());
        print(creature.IsNPCBot());
    }    
}

const playerChat: player_event_on_chat = (event: number, player: Player, message: string, type: number, lang: number) => {
            
        const target = player.GetVictim(); 
        print(target);

        return 'hello';
}

RegisterCreatureEvent(
    // 28690,    
    // 16402,
    1212,
    CreatureEvents.CREATURE_EVENT_ON_RECEIVE_EMOTE, 
    (...args) => emoteHandler(...args)
); 

RegisterCreatureEvent(
    // 7334, 
    // 16402,
    1212,
    CreatureEvents.CREATURE_EVENT_ON_DIED, 
    (...args) => deadBot(...args)
);

RegisterCreatureEvent(
    // 7334, 
    // 16402,
    1212,
    CreatureEvents.CREATURE_EVENT_ON_ENTER_COMBAT, 
    (...args) => enterCombat(...args)
);

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_TEXT_EMOTE, (...args) => playerEmote(...args)); 

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_CHAT, (...args) => playerChat(...args));


PrintError('NPC Bot loaded!');

