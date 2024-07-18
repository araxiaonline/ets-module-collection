import { PlayerStats, StatEvents } from "../classes/stats";

/**
 * Configuration options
 */
const TOKEN_ROLL_CHANCE = 5;
const NORMAL_ROLL_CHANCE = 5; 
const TOKEN_ROLL_CAP = 2000; 
const TOKEN_GROUP_SIZE = 2;

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

  PrintDebug(`Player: ${player.GetName()} Roll: ${roll} Roll Modifer: ${rollModifer} Chance: ${rollModifer}`)
  if(roll <= rollModifer) {

    createChest(player, creature, 'center'); 
    createChest(player, creature, 'left'); 
    
    
    // Add player stat they created token
    const pStats = new PlayerStats(player);
     pStats.increment(StatEvents.TOKEN_CREATED);
     pStats.save();
  }

  // if it is a larger group roll again!
  if(groupCount >= TOKEN_GROUP_SIZE) {
    if(creature.IsWorldBoss() || creature.IsDungeonBoss()) {
      roll = Math.floor(Math.random() * TOKEN_ROLL_CAP);
      if(roll <= rollModifer+100 ) {
        createChest(player, creature,'right');     
      }
    }
  }   
}

RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_KILL_CREATURE,
    (...args) => TokenKillEvent(...args)
);
