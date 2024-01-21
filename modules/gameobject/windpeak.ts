const TELEPORTER = 1000000; 
const teleport: gameobject_event_on_use = (event, go: GameObject, player: Player) => {
    player.Teleport(0, -5147.910845, 4024.771240, 59.303185, 5.775685);
    return true; 
}; 

RegisterGameObjectEvent(TELEPORTER, GameObjectEvents.GAMEOBJECT_EVENT_ON_USE, (...args) => teleport(...args)); 