/**
 * Badge Of Justice Multiplier
 * Increases the number of Badges of Justice a player will receive. 
 */

/**
 * Config
 */

const BADGE_OF_JUSTICE_BONUS = 1;
const HEROIC_FOCUS_AURA = 95000;
const BADGE_OF_JUSTICE_ENTRY = 29434;

const LootToken: player_event_on_loot_item = (event: number, player: Player, item: Item) => {
    
    if(item.GetEntry() == BADGE_OF_JUSTICE_ENTRY) {
        player.AddItem(BADGE_OF_JUSTICE_ENTRY, BADGE_OF_JUSTICE_BONUS);         
        
        if(player.HasAura(HEROIC_FOCUS_AURA)) {
            const randomNumber = Math.floor(Math.random() * 3) + 1;
            player.AddItem(BADGE_OF_JUSTICE_ENTRY, randomNumber);
        }
    }


}

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_LOOT_ITEM, (...args) => LootToken(...args));