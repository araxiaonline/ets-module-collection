const COPPER_ORE = 2770;

const HandleSpell: player_event_on_spell_cast = (event: number, player: Player, spell: Spell, skipCheck: boolean) => {
    print(spell.GetEntry());
    print(skipCheck); 
    return; 
}

// State Changes
// 1 - Ready / Deactivated
// 2 - Activated
// 3 - Looting
const HandleMiningLoot: gameobject_event_on_loot_state_change = (event: number, gameObj: GameObject, state: number) => {
    print(gameObj.GetName());
    print(`State change: ${state}`); 
    
    let player = gameObj.GetNearestPlayer();
    print(player.GetName());

    // Is Mining and has special pick 
    if(state === 3) {
        if(player.HasItem(910000)) {
            let quantity = Math.ceil(Math.random() * 3); 
            player.AddItem(COPPER_ORE,quantity);             
            player.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_LOOT, Language.LANG_COMMON, `Your Diamond Axe grants you gifts from beyond!`, player);          
        }
    }
    return;
}


RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_SPELL_CAST,
    (...args) => HandleSpell(...args)
);

RegisterGameObjectEvent(
    1731,
    GameObjectEvents.GAMEOBJECT_EVENT_ON_LOOT_STATE_CHANGE,
    (...args) => HandleMiningLoot(...args)
)
