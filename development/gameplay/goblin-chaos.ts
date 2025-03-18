const dungeonGo: player_event_on_map_change = (event: number, player: Player) => {    
    const map = player.GetMap();    

    if (! map.IsDungeon() && ! map.IsRaid()) {
        return;
    }

    if (player.GetMapId() !== 0) {
        return;        
    }    
    const group = player.GetGroup();             
    if (!group) {
        return;
    }

    if(player.GetRace() != 9) {
        print("was not a goblin you get no chaos items")
    } // Goblins only 

    player.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_RAID_BOSS_EMOTE,Language.LANG_COMMON,`YOU HAVE ENTERED GOBLIN CHAOS!`, player);

};


RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_MAP_CHANGE, (...args) => dungeonGo(...args));    

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_LOOT_ITEM, (event, player, item) => {
    
    const itemCls = item.GetClass();
    const subClass = item.GetSubClass();

    if (item.GetQuality() < 2) {
        return;
    }

    if (itemCls !== 2 && itemCls !== 4) {
        return; 
    }

    const weaponList = [0,1,2,3,4,5,6,7,8,10,13,15,16,17,18,19];
    const armorList = [0,1,2,3,4,6]

    // not a weapon
    if ( itemCls === 2 && !weaponList.includes(subClass)) {
        return; 
    }

    // not armor
    if ( itemCls === 4 && !armorList.includes(subClass)) {
        return; 
    }

    const ids = rollEnchant(item, true);

    if(ids.length !== 2) {
        PrintError("BonusEnchantment/OnLootITem - Failed to get enchant ids");
        return; 
    }

    if(ids[0]) {
        item.SetEnchantment(ids[0], 4);
    }

    if(ids[1]) {
        item.SetEnchantment(ids[1], 5);
    }


    PrintInfo("BonusEnchantment/OnLootItem - Enchanting item: " + item.GetEntry() + " with enchants: " + ids[0] + " and " + ids[1]);
            
}); 