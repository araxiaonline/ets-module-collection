/** @ts-expect-error */
let aio: AIO = {}; 

import { run } from "node:test";
import { GetGroupSize } from "../classes/group";

const GambleChestID = 910001;
const TrapSounds = [
    "Sound\\Effects\\dumb.mp3",  
    "Sound\\Effects\\bad-to-the-bone.mp3",
    "Sound\\Effects\\shit_here_go.mp3",
    "Sound\\Effects\\there_you_are.mp3",
    "Sound\\Effects\\steve.mp3",
    "Sound\\Effects\\end_career.mp3",
    "Sound\\Effects\\fucked-up.mp3",
    "Sound\\Effects\\mission_failed.mp3",
    "Sound\\Effects\\say_goodbye.mp3",
    "Sound\\Effects\\emotional.mp3",
    "Sound\\Effects\\laugh.mp3",
    "Sound\\Effects\\trombone.mp3",
    "Sound\\Effects\\win_error.mp3",
    "Sound\\Effects\\brass_fail.mp3",
    "Sound\\Effects\\gonna_hurt.mp3",
    "Sound\\Effects\\oh_hell_no.mp3",
    "Sound\\Effects\\you_die.mp3",
    "Sound\\Effects\\skill_issue.mp3",
];

const OpeningSounds = [
    "Sound\\Effects\\crab-rave.mp3",    
    "Sound\\Effects\\xao.mp3",
    "Sound\\Effects\\fortnite.mp3",
    "Sound\\Effects\\money.mp3",
    "Sound\\Effects\\name_fart.mp3",
    "Sound\\Effects\\rick_roll.mp3",
    "Sound\\Effects\\memento.mp3",
    "Sound\\Effects\\halogen.mp3",
    "Sound\\Effects\\spongebob.mp3",
    "Sound\\Effects\\cotton_eye.mp3",
    "Sound\\Effects\\lethal_company.mp3",
    "Sound\\Effects\\senor_noche.mp3",
    "Sound\\Effects\\jojo_gold.mp3",
    "Sound\\Effects\\meme_credits.mp3",
    "Sound\\Effects\\gas_credits.mp3",
    "Sound\\Effects\\jojo_ay.mp3",
    "Sound\\Effects\\evil_morty.mp3",
    "Sound\\Effects\\party_music.mp3",
    "Sound\\Effects\\got_that.mp3",
    "Sound\\Effects\\snoop.mp3",
    "Sound\\Effects\\run-away-sax.mp3",
  
    "Sound\\Effects\\africa.mp3",
    "Sound\\Effects\\allstar.mp3",
    "Sound\\Effects\\dont-hurt-me.mp3",
    "Sound\\Effects\\blowmeaway.mp3",
    "Sound\\Effects\\bones.mp3",
    "Sound\\Effects\\coolio.mp3",
    "Sound\\Effects\\doom.mp3",
    "Sound\\Effects\\dropkick.mp3",
    "Sound\\Effects\\lose-yourself.mp3",
    "Sound\\Effects\\gank-plank-galleon.mp3",

    "Sound\\Effects\\sir-mixalot-baby-got-back.mp3",
    "Sound\\Effects\\tetris.mp3",
    "Sound\\Effects\\thunder.mp3",
    "Sound\\Effects\\memory-remain.mp3",
    "Sound\\Effects\\meglovania.mp3",
    "Sound\\Effects\\halo-2.mp3",
    "Sound\\Effects\\tacos.mp3",
    "Sound\\Effects\\mortal-kombat.mp3",
    "Sound\\Effects\\hello_its_john_cena.mp3",    
    
]; 

const LootGoodSound = "Sound\\Effects\\gold-coins.mp3";

const LivingBombSpell = 63801;
const GrowSpell = 70345;
const ShrinkSpell = 71555; 
const KnockUpSpell = 46014;
const DeathSpell = 7;
const CorpseExplodeSpell = 53730;
const SpinSpell = 51581;
const KnockbackSpell = 40532; // works
const LightningSpell = 36896;
const CatSpell = 23398; 
// const Murloc = 49935;
const Gumbo = 42760;
const Drunk = 37591;
const FunBomb = 20547;
const Worm = 518;
const Timberling = 5666;
// const Haunted = 7056; 
const LichEyes = 57889;
const FuryLich = 72350;
const FuryStorm = 62702; 
// const Skelly = 24724;   // broke
const ExplodeSheep = 44276; 
const ExpUp = 42138;
const DrunkBarf = 67486;
const Aggro = 1; 
const Venom = 24596; 
// const DarkDwarf = 5268; // broke
const GotoDark = 445;
const Sacrifice = 34661;
const Cosmic = 47044;
const RedOgre = 30167;
const RunAway = 6614; 
const Levitate = 31704; // broke 
const Murloc = 42365;
// const Ghost = 24737; // broke
// const Mini = 13463; // broke
const RandomCostume = 24720;
const SummonDuke = 24763; 
const Meteors = 45227;
const Corrupted = 24328;

const LongOpenChestSpellID = 24390;
const BombCreature = 19896;

const effectSpells = [
    LightningSpell, GrowSpell, ShrinkSpell, KnockUpSpell, DeathSpell, CorpseExplodeSpell, SpinSpell, KnockbackSpell, LivingBombSpell, CatSpell, Murloc, Gumbo,Drunk,Worm, FunBomb, Timberling, 
    LichEyes,  FuryLich, FuryStorm, ExplodeSheep, ExpUp, DrunkBarf, Aggro, Venom, GotoDark, Sacrifice, Cosmic, RedOgre, RunAway, Levitate, Murloc, RandomCostume, SummonDuke,
    Meteors, Corrupted

];

// Contains which chests are trapped; 
const LootTrapMap: Record<number, boolean> = {};

// Who won the gamblers chest. 
const ChestAssignment: Record<number, number> = {};

function RollLootTrap(object: GameObject) {
    const roll = Math.floor(Math.random() * 100);       
    
    // TEST TRAP
// LootTrapMap[object.GetGUIDLow()] = true;
// return 

    if(roll > 99) {
        object.AddLoot(911001, 1);       // Mind Spike
        LootTrapMap[object.GetGUIDLow()] = false;
        return;                       
    } else if(roll > 85) {
        // Get a random number of tokens between 1-3
        const tokens = Math.floor(Math.random() * 3) + 1;

        object.AddLoot(910001, tokens);       // Araxia Token
        LootTrapMap[object.GetGUIDLow()] = false;
        return;         
    } else if(roll > 65) {
        // get a random number of ancient dice between 2-5
        const dice = Math.floor(Math.random() * 4) + 2;

        object.AddLoot(911000, dice);      // Ancient Dice
        LootTrapMap[object.GetGUIDLow()] = false;
        return;              
    } else if(roll > 55) {
        object.AddLoot(92301, 1);      // Huge Sack of Coins
        LootTrapMap[object.GetGUIDLow()] = false;
        return;             
    } else {
        LootTrapMap[object.GetGUIDLow()] = true;
        return; 
    }  
}

const assignChestWinner = (go: GameObject) => {
    const players = go.GetPlayersInRange(100);

    if(players.length == 0) {
        return; 
    }

    const winner = players[Math.floor(Math.random() * players.length)];
    ChestAssignment[go.GetGUIDLow()] = winner.GetGUIDLow();

    const group: Group = winner.GetGroup(); 
    if(group) {
        const members = group.GetMembers();
        for(let i = 0; i < members.length; i++) {
            members[i].SendChatMessageToPlayer(ChatMsg.CHAT_MSG_RAID_BOSS_EMOTE,Language.LANG_COMMON,`${winner.GetName()} has won the Gamblers Chest!`, members[i]);
        }
    }
}

const onKillCreature: player_event_on_kill_creature = (event: number, killer: Player, killed: Creature) => {
    const map: EMap = killed.GetMap();
    
    if(!map.IsDungeon() && !map.IsRaid()) {
        return false; 
    }

    // Must not be solo
    const groupCount = GetGroupSize(killer);
    if(groupCount < 2) {
        return false; 
    }

    if(killed.GetLevel() < 83) {
       // return false;
    }

    if(killed.GetLevel() < 3) {
        return false;
    }


    const [x,y,z,o] = killed.GetLocation();
    let roll = Math.floor(Math.random() * 100);
    
    if(roll > 25) {
        return; 
    }

    // if there are other gamble chests nearby don't spawn another one.
    const chests = killer.GetGameObjectsInRange(10, GambleChestID);
    if(chests.length > 0) {
        return; 
    }

    const object = killer.SummonGameObject(GambleChestID,x,y,z+0.3,0,100);  
    const objectHighlight = killer.SummonGameObject(146083,x,y,z+0.35,0,40);      

    assignChestWinner(object);
    RollLootTrap(object);
}


const onSpell: player_event_on_spell_cast = (event: number, player: Player, spell: Spell, skipCheck: boolean) => {
  
    let target; 

    if(spell.GetEntry() == LongOpenChestSpellID) {
        
        const go = player.GetNearestGameObject(7, GambleChestID);

        if(!go || go.GetEntry() != GambleChestID) {
            player.SendBroadcastMessage(`There is no Gamblers Chest nearby!`);
            return false;
        }

        const guid = go.GetGUIDLow();
        if(ChestAssignment[guid] != player.GetGUIDLow()) {
            player.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_RAID_BOSS_EMOTE,Language.LANG_COMMON,`You did not win this Gambler Chest!`, player);
            spell.Cancel(); 
            return true;
        }        

        const sound = OpeningSounds[Math.floor(Math.random() * OpeningSounds.length)];
        const members = player.GetGroup().GetMembers();
    
        for(let i = 0; i < members.length; i++) {
            player.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_RAID_BOSS_EMOTE,Language.LANG_COMMON,`${player.GetName()} is taking a gamble!`, members[i]);
            // Use the updated audio player with player name and audio options
            aio.Handle(members[i], 'AIOAudioPlayer', 'PlaySingleSound', sound, {
                channel: "SFX",
                volume: 0.5,
                duration: 12.0  // Most opening sounds are short
            }, members[i].GetName());
        }

    }
    
    return false; 

};

// Handle when the chest is ready to be looted. 
const onLootStateChange: gameobject_event_on_loot_state_change = (event: number, gameObject: GameObject, state: number) => {

    if(state == 2) {

        // return; 

        // print(`LootTrapped ${LootTrapMap[gameObject.GetGUIDLow()]}`); 
        // print(`InState GUID ${gameObject.GetGUIDLow()}`);

        // if it is a trap time to do some killing!
        if(LootTrapMap[gameObject.GetGUIDLow()] == true) {
                        
            const player = gameObject.GetNearestPlayer(50);            

            const sound = TrapSounds[Math.floor(Math.random() * TrapSounds.length)];
            const players = gameObject.GetPlayersInRange(50);
            for(let i = 0; i < players.length; i++) {
                const player = players[i];
                // Use the updated audio player with player name and audio options
                aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound', sound, {
                    channel: "SFX",
                    volume: 0.5, // Trap sounds should be louder
                    duration: 8.0 // Most trap sounds are short
                }, player.GetName());
            }            

            if(player.IsAlive()) {
                const effect = effectSpells[Math.floor(Math.random() * effectSpells.length)];

                if(effect == Aggro) {
                    const creatures = gameObject.GetCreaturesInRange(100);
                    for(let i = 0; i < creatures.length; i++) {
                        creatures[i].AddThreat(player, 1000);    
                        creatures[i].Attack(player);             
                    }
                    
                    for(let i = 0; i < players.length; i++) {
                        players[i].SendChatMessageToPlayer(ChatMsg.CHAT_MSG_RAID_BOSS_EMOTE,Language.LANG_COMMON,`You have angered the creatures!`, players[i]);
                    }
                        
                } else {

                    const members = player.GetGroup().GetMembers();
                
                    for(let i = 0; i < members.length; i++) {
                        members[i].SendBroadcastMessage(`{player.GetName()} has triggered trap number ${effect}, hate that guy!`);
                        // Use the updated audio player with player name and audio options
                        aio.Handle(members[i], 'AIOAudioPlayer', 'PlaySingleSound', sound, {
                            channel: "SFX",
                            volume: 0.5,
                            duration: 8.0 // Most trap sounds are short
                        }, members[i].GetName());
                    }

                    player.CastSpell(player, effect, true);                                

                }


                
            }
                                                                                                                        
        } else {
            const players = gameObject.GetPlayersInRange(50);
            for(let i = 0; i < players.length; i++) {
                const player = players[i];
                // Use the updated audio player with player name and audio options
                aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound', LootGoodSound, {
                    channel: "SFX",
                    volume: 0.5,
                    duration: 25.0 // Loot sound is short
                }, player.GetName());
            }
            
        }

        gameObject.RemoveEventById(event);  
        gameObject.Despawn();
        gameObject.SetLootState(0);      
    }
};

// Register GameObject Event on Loot State Change
RegisterGameObjectEvent(GambleChestID,GameObjectEvents.GAMEOBJECT_EVENT_ON_LOOT_STATE_CHANGE, (...args) => onLootStateChange(...args));

// Register Kill Event for Mystery Chest Pop
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_KILL_CREATURE, (...args) => onKillCreature(...args));  

// Validate player can open chest and play opening sound. 
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_SPELL_CAST, (...args) => onSpell(...args));

const Growers = new Map<number, number>();

const CheckGrowthDeath: map_event_on_update = (event: number, map: EMap, diff: number) => {
    const team1players = map.GetPlayers(1); 
    const team2players = map.GetPlayers(0);

    // combine team1 and team2 players
    const allPlayers = team1players.concat(team2players);

    for(let i = 0; i < allPlayers.length; i++) {
        const player = allPlayers[i];
        
        if(player.HasAura(GrowSpell)) {

            if(!Growers.has(player.GetGUIDLow())) {
                Growers.set(player.GetGUIDLow(),diff);
            } else {
                let lastTime = Growers.get(player.GetGUIDLow());                
                if(lastTime + diff > 75000 && lastTime + diff < 10500) {                    
                    player.CastSpell(player, 51874, true);       
                } else if(lastTime + diff > 70500 && lastTime + diff < 30600) {  
                    
                    let groupies = player.GetGroup().GetMembers();
                    for(let i = 0; i < groupies.length; i++) {
                        groupies[i].SendChatMessageToPlayer(ChatMsg.CHAT_MSG_RAID_BOSS_EMOTE,Language.LANG_COMMON,`${player.GetName()} is going to explode!`, groupies[i]);
                    }

                    Growers.set(player.GetGUIDLow(),lastTime + diff);
                } else if(lastTime + diff > 77000) {
                    let group = player.GetPlayersInRange(50); 
                    for(let i = 0; i < group.length; i++) {
                        player.Kill(group[i], false);
                    }                    
    
                    player.Kill(player, false); 
                    player.RemoveAura(GrowSpell);                    
                    Growers.delete(player.GetGUIDLow());
                } else {
                    Growers.set(player.GetGUIDLow(),lastTime + diff);
                }                
            }
                    
        }
    }


}


// Register Map Event on Update
RegisterServerEvent(ServerEvents.MAP_EVENT_ON_UPDATE, (...args) => CheckGrowthDeath(...args));  