const bonusAuraId = 600000;
const bonusAreaId = 3817;

const teleportData = {
  map: 571,
  x: 5496.157227,
  y: 4725.473633,
  z: -194.177444,
  o: 2.009775,
};

function exitPlayer(player): boolean {
    if (player.GetAreaId() === bonusAreaId && !player.HasAura(bonusAuraId)) {
        player.Teleport(teleportData.map, teleportData.x, teleportData.y, teleportData.z, teleportData.o);
        return true;
    }    
    return false; 
}

const checkAura = (eventId: number, delay: number, repeats: number, player: Player): void => {
    if(exitPlayer(player)){
        player.RemoveEventById(eventId);
    }
}

const openRift: player_event_on_update_zone = (event: number, player: Player) => {
  // Exit player should not be here 
  if(!exitPlayer(player)){
    player.RegisterEvent(checkAura, 60000, 11); 
  } 
}


RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_UPDATE_ZONE, (...args) => openRift(...args)); 

