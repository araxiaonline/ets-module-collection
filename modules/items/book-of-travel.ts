
/**
 * Item that will enable a user to teleport to a new location in azeroth loaded from
 * existing waypoints set in the database. 
 * @date 2023-12-01
 * @author ben-of-codecraft
 */

/**
 * Configuration options
 */
const TELEPORT_ITEM_ENTRY = 910006;

const TeleportHandler: item_event_on_use = (event: number, player: Player, item: Item, target: Unit) => {       

    if(player.IsHorde()) {
        const master = PerformIngameSpawn(1, 2851, player.GetMapId(), player.GetInstanceId(), player.GetX(), player.GetY(), player.GetZ(), player.GetO(), false, 1, 0) as Creature;        
        player.SendTaxiMenu(master);
    } else {        
        const master = player.SpawnCreature(1571, player.GetX(), player.GetY(), player.GetZ(), player.GetO(), TempSummonType.TEMPSUMMON_MANUAL_DESPAWN);        
        player.SendTaxiMenu(master);
        master.DespawnOrUnsummon(60*1000);
    }

    return true; 
}; 
RegisterItemEvent(TELEPORT_ITEM_ENTRY, ItemEvents.ITEM_EVENT_ON_USE, (...args) => TeleportHandler(...args));
