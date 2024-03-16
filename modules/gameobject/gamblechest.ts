/** @ts-expect-error */
let aio: AIO = {}; 

const GambleChestID = 910001;
const TrapSounds = [
    "Sound\\Effects\\hell-no.mp3",    
    "Sound\\Effects\\bad-to-the-bone.mp3",
    "Sound\\Effects\\fucked-up.mp3",
];

const OpeningSounds = [
    "Sound\\Effects\\crab-rave.mp3",    
    "Sound\\Effects\\outro-song.mp3",
    "Sound\\Effects\\run-away-sax.mp3",
]; 

const LootGoodSound = "Sound\\Effects\\gold-coins.mp3";
const LivingBombSpell = 63801;
const LongOpenChestSpellID = 24390;
const BombCreature = 19896;


// Contains which chests are trapped; 
const LootTrapMap: Record<number, boolean> = {};

function RollLootTrap(object: GameObject) {
    const roll = Math.floor(Math.random() * 100);       
    // print(`Guid ${object.GetGUIDLow()}`); 
    // print(`Roll: ${roll}`);  
    if(roll > 98) {
        object.AddLoot(43347, 1);       // Satchel of Spoils 2%
        LootTrapMap[object.GetGUIDLow()] = false;
        return;             
    } else if(roll > 89) {
        object.AddLoot(43346, 1);       // Large Satchel of Spoils 18%
        LootTrapMap[object.GetGUIDLow()] = false;
        return;             
    } else if(roll > 82) {
        object.AddLoot(49294, 1);       // Ashen Sack of Spoils 7%
        LootTrapMap[object.GetGUIDLow()] = false;
        return;
    } else if(roll > 79) {
        object.AddLoot(45878, 1);       // Large Sack of Uldaur Spoils 3%    
        LootTrapMap[object.GetGUIDLow()] = false;
        return;
    } else if(roll > 67) {
        object.AddLoot(910001, 10);     // Araxia Tokens 12%      
        LootTrapMap[object.GetGUIDLow()] = false;
        return;             
    } else if(roll > 55) {
        object.AddLoot(19182, 25);      // Darkmoon Fair Tickets 12%
        LootTrapMap[object.GetGUIDLow()] = false;
        return;             
    } else if(roll > 45) {
        object.AddLoot(52005, 1);      // Satchel of Helpful Goods 10%
        LootTrapMap[object.GetGUIDLow()] = false;
        return;             
    } else if(roll > 20) {
        object.AddLoot(43102, 1);      // Frozen Orb 25%
        LootTrapMap[object.GetGUIDLow()] = false;
        return;             
    } else {
        LootTrapMap[object.GetGUIDLow()] = true;
        return; 
    }  
}

const onKillCreature: player_event_on_kill_creature = (event: number, killer: Player, killed: Creature) => {
    const map: EMap = killed.GetMap();
    
    if(!map.IsDungeon() && !map.IsRaid()) {
        return false; 
    }
    // if(!map.IsHeroic()) {
    //     return false;
    // }

    if(killed.GetLevel() < (killer.GetLevel() - 5)) {        
        return false;
    }

    const [x,y,z,o] = killed.GetLocation();
    let roll = Math.floor(Math.random() * 100);
    
    if(roll > 8) {
        return; 
    }

    const object = killer.SummonGameObject(GambleChestID,x,y,z+0.3,0,100);  
    const objectHighlight = killer.SummonGameObject(146083,x,y,z+0.35,0,40);  
    
    RollLootTrap(object);
}

const onLootStateChange: gameobject_event_on_loot_state_change = (event: number, gameObject: GameObject, state: number) => {

    if(state == 2) {

        // print(`LootTrapped ${LootTrapMap[gameObject.GetGUIDLow()]}`); 
        // print(`InState GUID ${gameObject.GetGUIDLow()}`);

        // if it is a trap time to do some killing!
        if(LootTrapMap[gameObject.GetGUIDLow()] == true) {
            
            const creature1: Creature = <Creature>PerformIngameSpawn(1, BombCreature, gameObject.GetMapId(), gameObject.GetInstanceId(), gameObject.GetX(), gameObject.GetY(), gameObject.GetZ(),gameObject.GetO(), false, 100);                   
            const player = gameObject.GetNearestPlayer(50);            

            const sound = TrapSounds[Math.floor(Math.random() * TrapSounds.length)];
            const players = gameObject.GetPlayersInRange(50);
            for(let i = 0; i < players.length; i++) {
                const player = players[i];
                aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound', sound);
            }            

            for(let i =0; i < 20; i++) {
                if(player.IsAlive()) {
                    creature1.CastSpell(player, LivingBombSpell);
                }
            }
                                                                                
            creature1.DespawnOrUnsummon();                                         
        } else {
            const players = gameObject.GetPlayersInRange(50);
            for(let i = 0; i < players.length; i++) {
                const player = players[i];
                aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound', LootGoodSound);
            }
            
        }

        gameObject.RemoveEventById(event);        
    }
};

// Register GameObject Event on Loot State Change
RegisterGameObjectEvent(GambleChestID,GameObjectEvents.GAMEOBJECT_EVENT_ON_LOOT_STATE_CHANGE, (...args) => onLootStateChange(...args));

// Register Kill Event for Mystery Chest Pop
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_KILL_CREATURE, (...args) => onKillCreature(...args));  



const onSpell: player_event_on_spell_cast = (event: number, player: Player, spell: Spell, skipCheck: boolean) => {
    // Implementation
    const gameObjects = player.GetGameObjectsInRange(10, GambleChestID); 
    if(gameObjects.length > 0) {
        if(spell.GetEntry() == LongOpenChestSpellID) {
            const sound = OpeningSounds[Math.floor(Math.random() * OpeningSounds.length)];
            aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound',sound);
        }
    }
};

// Register
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_SPELL_CAST, (...args) => onSpell(...args));
