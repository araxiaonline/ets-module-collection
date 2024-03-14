
const onUtPlayerEnter: map_event_on_player_enter = (event: number, map: EMap, player: Player) => {
    // Implementation
    print(`Player ${player.GetName()} entered map ${map.GetName()}`);
    print(map.GetInstanceId()); 

    if(map.GetMapId() == MapIdType.Utgarde_Keep) {
        print("Utgarde Keep");
        // AddAuraToCreatures(player);
    
        const creatures = player.GetCreaturesInRange(1000);
        for(let i=0; i<creatures.length; i++) {
            const creature = creatures[i];
            creature.AddAura(45078, creature);
            creature.AddAura(48162, creature);
            // creature.SetMaxHealth(creature.GetMaxHealth() * 3);                        
            creature.SetScale(1);
        }
    }
    
        
};



// Register Map Event on Player Enter
RegisterServerEvent(ServerEvents.MAP_EVENT_ON_PLAYER_ENTER, (...args) => onUtPlayerEnter(...args));