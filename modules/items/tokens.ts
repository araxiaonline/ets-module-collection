import { PlayerStats, StatEvents } from "../classes/stats";

/**
 * Configuration options
 */
const TOKEN_ROLL_CHANCE = 5;
const NORMAL_ROLL_CHANCE = 5; 
const TOKEN_ROLL_CAP = 1500; 
const TOKEN_GROUP_SIZE = 2;

const bosses = {
	11520: true, // Taragaman the Hungerer (Ragefire Chasm)
	3654:  true, // Mutanus the Devourer (Wailing Caverns)
	639:   true, // Edwin VanCleef (The Deadmines)
	4275:  true, // Archmage Arugal (Shadowfang Keep)
	4829:  true, // Aku'mai (Blackfathom Deeps)
	1716:  true, // Bazil Thredd (Stormwind Stockade)
	7800:  true, // Mekgineer Thermaplugg (Gnomeregan)
	4421:  true, // Charlga Razorflank (Razorfen Kraul)
	4543:  true, // Bloodmage Thalnos (Scarlet Monastery Graveyard)
	6487:  true, // Arcanist Doan (Scarlet Monastery Library)
	3975:  true, // Herod (Scarlet Monastery Armory)
	3977:  true, // High Inquisitor Whitemane (Scarlet Monastery Cathedral)
	7358:  true, // Amnennar the Coldbringer (Razorfen Downs)
	2748:  true, // Archaedas (Uldaman)
	7267:  true, // Chief Ukorz Sandscalp (Zul'Farrak)
	12201: true, // Princess Theradras (Maraudon)
	8443:  true, // Avatar of Hakkar (Sunken Temple)
	9019:  true, // Emperor Dagran Thaurissan (Blackrock Depths)
	9568:  true, // Overlord Wyrmthalak (Lower Blackrock Spire)
	10363: true, // General Drakkisath (Upper Blackrock Spire)
	11492: true, // Alzzin the Wildshaper (Dire Maul East)
	11489: true, // Tendris Warpwood (Dire Maul West)
	11501: true, // King Gordok (Dire Maul North)
	10440: true, // Baron Rivendare (Stratholme Undead Side)
	10813: true, // Balnazzar (Stratholme Live Side)
	1853:  true, // Darkmaster Gandling (Scholomance)

	17307: true, // Vazruden (Hellfire Ramparts)
	17536: true, // Nazan (Hellfire Ramparts)
	17377: true, // Keli'dan the Breaker (The Blood Furnace)
	16808: true, // Warchief Kargath Bladefist (The Shattered Halls)
	17942: true, // Quagmirran (The Slave Pens)
	17826: true, // Swamplord Musel'ek (The Underbog)
	17798: true, // Warlord Kalithresh (The Steamvault)
	18344: true, // Nexus-Prince Shaffar (Mana-Tombs)
	18373: true, // Exarch Maladaar (Auchenai Crypts)
	18473: true, // Talon King Ikiss (Sethekk Halls)
	18708: true, // Murmur (Shadow Labyrinth)
	19220: true, // Pathaleon the Calculator (The Mechanar)
	17977: true, // Warp Splinter (The Botanica)
	20912: true, // Harbinger Skyriss (The Arcatraz)
	17881: true, // Aeonus (The Black Morass)
	18096: true, // Epoch Hunter (Old Hillsbrad Foothills)
	24664: true, // Kael'thas Sunstrider (Magisters' Terrace)

	23954: true, // Ingvar the Plunderer (Utgarde Keep)
	26723: true, // Keristrasza (The Nexus)
	29120: true, // Anub'arak (Azjol-Nerub)
	29311: true, // Herald Volazj (Ahn'kahet: The Old Kingdom)
	26632: true, // The Prophet Tharon'ja (Drak'Tharon Keep)
	31134: true, // Cyanigosa (Violet Hold)
	29306: true, // Gal'darah (Gundrak)
	27978: true, // Sjonnir the Ironshaper (Halls of Stone)
	28923: true, // Loken (Halls of Lightning)
	27656: true, // Ley-Guardian Eregos (The Oculus)
	26533: true, // Mal'Ganis (Culling of Stratholme)
	26861: true, // King Ymiron (Utgarde Pinnacle)
	35451: true, // The Black Knight (Trial of the Champion)
	36502: true, // Devourer of Souls (Forge of Souls)
	36658: true, // Scourgelord Tyrannus (Pit of Saron)
	37226: true, // The Lich King (Halls of Reflection)
};

const createChest = (player: Player, creature: Creature, direction: string): void => {

  const [x,y,z,o] = creature.GetLocation();

  let chestX,chestY,chestZ; 
  if(direction == 'center') {
    chestX = x+0.5; 
    chestY = y+0.5; 
    chestZ = z; 
  } else if(direction == 'left') {
    chestX = x+2.5; 
    chestY = y+2.5; 
    chestZ = z; 
  } else {
    chestX = x+2.5; 
    chestY = y-3.5; 
    chestZ = z;     
  }

  player.PlayDirectSound(7256);  // Loud Chime
  player.SummonGameObject(110000,chestX,chestY,chestZ,o, 0);
  player.SummonGameObject(186246, chestX,chestY,chestZ+0.20,o, 100);

}

/**
 * This creates a randomly dropping currency that rewards players who play together.  
 * It also has a small chance for doing harder content for solo players to get it, but based chance is on
 * any other kill is 0.2%
 */
const TokenKillEvent: player_event_on_kill_creature = (event: number, player: Player, creature: Creature ) => {

   // if the creature level is much lower then you have 0 chance to get a token. 
  if(creature.GetLevel() < (player.GetLevel() - 5)) {
    return; 
  }

  const map = creature.GetMap(); 

  // Must be a group of real player 3(default) or more with bonus to drop rate for each player after 3, Condition (3)
  const group = player.GetGroup();
  let groupCount = 0;

  if(group != undefined) {
    const members = group.GetMembers();

    for(let member of members) {
      member.GetName();
      groupCount += 1;
    }
  
  }
  
  // PrintDebug(`Player: ${player.GetName()} is in a group of ${groupCount}`);

  // Roll for token drop
  let roll = Math.floor(Math.random() * TOKEN_ROLL_CAP);
  let rollModifer = NORMAL_ROLL_CHANCE;
  
  // Solo Drop rates
  if(groupCount < TOKEN_GROUP_SIZE) {
    if(creature.IsWorldBoss() || creature.IsDungeonBoss()) {
      rollModifer += 30;
    } else {
      if(creature.IsElite()) {
        rollModifer = rollModifer + TOKEN_ROLL_CHANCE; 
      } 
    }

    if(map.IsRaid() || map.IsHeroic()) {
      rollModifer = rollModifer + 20; 
    }
  
    if(map.IsDungeon()) {
      rollModifer = rollModifer + 5;
    }  

  } else {

    // Group Drop Rates
    if(creature.IsWorldBoss() || creature.IsDungeonBoss()) {
      rollModifer += 100;
    } else {
      if(creature.IsElite()) {
        rollModifer = rollModifer + 30; 
      } 
    }

    if(map.IsRaid() || map.IsHeroic()) {
      rollModifer = rollModifer + (8 * groupCount); 
    } else {
      if(map.IsDungeon()) {
        rollModifer = rollModifer + (4 * groupCount);
      }
    }
  
  }

  let chestShown = false;

  PrintDebug(`Player: ${player.GetName()} Roll: ${roll} Roll Modifer: ${rollModifer} Chance: ${rollModifer}`)
  if(roll <= rollModifer) {

    createChest(player, creature, 'center'); 
    // createChest(player, creature, 'left'); 
    
    chestShown = true;
    
    // Add player stat they created token
    const pStats = new PlayerStats(player);
     pStats.increment(StatEvents.TOKEN_CREATED);
     pStats.save();
  }


  if (bosses[creature.GetEntry()]) {
    createChest(player, creature, 'right');
  }

  // if it is a larger group roll again!
  // if(groupCount >= TOKEN_GROUP_SIZE) {
  //   if(creature.IsDungeonBoss()) {
  //     roll = Math.floor(Math.random() * TOKEN_ROLL_CAP);
  //     if(roll <= rollModifer+100 ) {
  //       createChest(player, creature,'right');     
  //     }
  //   }
  // }   
}

RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_KILL_CREATURE,
    (...args) => TokenKillEvent(...args)
);


