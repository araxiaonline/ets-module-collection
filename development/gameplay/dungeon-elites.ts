
const groupInstance = {};

const onPlayerEnter : map_event_on_player_enter = (event: number, map: EMap, player: Player) => {
    // Implementation
};

// Register Map Event on Player Enter
RegisterServerEvent(ServerEvents.MAP_EVENT_ON_PLAYER_ENTER, (event: number, map: EMap, player: Player) => {
    // Implementation
    print(`Player ${player.GetName()} entered map ${map.GetName()}`);
    print(map.GetInstanceId()); 

    let group = player.GetGroup();
    if(!group) {
        return; 
    }

    if(!groupInstance[group.GetGUID()]) {
        groupInstance[group.GetGUID()] = [];
    }

    if(groupInstance[group.GetGUID()].includes(map.GetInstanceId())) {
        return; 
    }

    if(!groupInstance[map.GetInstanceId()]) {
        groupInstance[map.GetInstanceId()] = [];

        player.
        const group = player.GetGroup();
        const members = group.GetMembers();
        for(let i=0; i<members.length; i++) {
            const member = members[i];
            print(member.GetName());
        }
    }

    if(map.GetMapId() == MapIdType.Utgarde_Keep) {
        print("Utgarde Keep");
        // AddAuraToCreatures(player);
    
        const creatures = player.GetCreaturesInRange(1000);
        for(let i=0; i<creatures.length; i++) {
            const creature = creatures[i];
            creature.AddAura(45078, creature);
            creature.AddAura(48162, creature);
            creature.AddAura(48161, creature);
            // creature.SetMaxHealth(creature.GetMaxHealth() * 3);                        
            creature.SetScale(1);
        }
    }
    
        
};

RegisterServerEvent(ServerEvents.MAP_EVENT_ON_PLAYER_ENTER, (...args) => onPlayerEnter(...args));



// // Register Map Event on Player Enter
// RegisterServerEvent(ServerEvents.MAP_EVENT_ON_PLAYER_ENTER, (...args) => onUtPlayerEnter(...args));

// const onCreatureCreate: instance_event_on_creature_create = (event: number, instance_data: number[], map: EMap, creature: Creature) => {
//     print('Creature Create');
// }

// const onInstanceInitialize: instance_event_on_initialize = (event: number, instance_data: number[], map: EMap) => {

//     print('Instance Initialize');



// }

// const onPlayerEnter: instance_event_on_player_enter = (event: number, instance_data: number[], map: EMap, player: Player) => {
//     print('Player Enter');
//     print(map.GetName());
//     print(map.GetInstanceId());
//     print(player.GetName());
//     print(player.GetGUID());
//     print(player.GetMapId());
// }

// const onMapPlayerEnter: map_event_on_player_enter = (event: number, map: EMap, player: Player) => {
//     print('Player Enter');
//     print(map.GetName());
//     print(map.GetInstanceId());
//     print(player.GetName());
//     print(player.GetGUID());
//     print(player.GetMapId());
// }

// const onMapCreate: map_event_on_create = (event: number, map: EMap) => {

//     print('Map Create');
//     print(map.GetName());
//     print(map.GetInstanceId());

//     if(!map.IsDungeon()) {
//         return;
//     }
// }

// const onMapLoad: instance_event_on_load = (event: number, instance_data: number[], map: EMap) => {
//     print('Map Load'); 
// }

// RegisterMapEvent(MapIdType.ZulFarrak, InstanceEvents.INSTANCE_EVENT_ON_INITIALIZE, (...args) => onInstanceInitialize(...args));

// RegisterMapEvent(MapIdType.ZulFarrak, InstanceEvents.INSTANCE_EVENT_ON_CREATURE_CREATE, (...args) => onCreatureCreate(...args));

// RegisterMapEvent(MapIdType.ZulFarrak, InstanceEvents.INSTANCE_EVENT_ON_PLAYER_ENTER, (...args) => onPlayerEnter(...args));

// RegisterMapEvent(MapIdType.Kalimdor, InstanceEvents.INSTANCE_EVENT_ON_INITIALIZE, (...args) => onInstanceInitialize(...args));

// RegisterMapEvent(MapIdType.Kalimdor, InstanceEvents.INSTANCE_EVENT_ON_CREATURE_CREATE, (...args) => onCreatureCreate(...args));

// RegisterMapEvent(MapIdType.Kalimdor, InstanceEvents.INSTANCE_EVENT_ON_PLAYER_ENTER, (...args) => onPlayerEnter(...args));

// RegisterMapEvent(MapIdType.Kalimdor, InstanceEvents.INSTANCE_EVENT_ON_LOAD, (...args) => onMapLoad(...args));

// RegisterInstanceEvent(6, InstanceEvents.INSTANCE_EVENT_ON_PLAYER_ENTER, (...args) => onPlayerEnter(...args));

// RegisterServerEvent(ServerEvents.MAP_EVENT_ON_PLAYER_ENTER, (...args) => onMapPlayerEnter(...args));

// RegisterServerEvent(ServerEvents.MAP_EVENT_ON_CREATE, (...args) => onMapCreate(...args));

// // RegisterCreatureEvent(CreatureEvents.CREATURE_EVENT_ON_ADD, (...args) => onCreatureCreate(...args));

// print ('Dungeon Elites Loaded');
// // RegisterInstanceEvent(InstanceEvents.INSTANCE_EVENT_ON_CREATURE_CREATE, (...args) => onCreatureCreate(...args));