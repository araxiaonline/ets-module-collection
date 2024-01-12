import { ToGold, ToCopper, GetPlayerTax } from "../modules/classes/money";
import { AccountInfo } from "../modules/classes/account";

const spawned:Array<number> = []; 
const NPCS =  {
    GOTHUK: 9000003,
    BERNIE: 9000004,
    EDWARD: 9000005,
    LUNA: 9000006,
    BOB_B: 9000007,
    SHIVA: 9000008
}; 
const selectedItem: Record<string, number> = {};
const GossipHello : gossip_event_on_hello = (event: number, player: Player, creature: EObject) => {

    const accountId = player.GetAccountId(); 
    
    // NPC Hire Costs 
    const bernieCost = ToCopper(1000) + GetPlayerTax(player,5);

    player.GossipClearMenu();     

    let items = 0; 
    for(let i=23; i <= 38; i++ ) {
        let item = player.GetItemByPos(255, i);
        if(item != undefined) {    
            print(item.GetItemLink()); 
            if(item.IsSoulBound() ) {
                const quality = item.GetQuality();
                if(quality > 2) {
                    items += 1;
                    player.GossipMenuAddItem(1,`Item: ${item.GetItemLink()}`,1,item.GetGUIDLow(), undefined, undefined);
                }        
            }
            
        }
        
     //   print(item.GetName()); 
       // print(item.GetItemLink()); 
    }

    if(items === 0) {
        player.SendNotification("You have no soulbound items in your backback to send to your other characters.");
    }

    player.GossipMenuAddItem(1,`Stop using the device`,1,50500);
    
    // player.GossipMenuAddItem(1,`Hire Grandmaster Smith - (Reset Timers) 200g`,1,10,undefined,undefined,10000*200);
    // player.GossipMenuAddItem(1,`Hire Grandmaster Tailor - (Reset Timers) 200g`,1,20,undefined,undefined,10000*200);
    // // // player.GossipMenuAddItem(1,`Hire Grandmaster Leatherworker - (Reset Timers) 200g`, 1,30, undefined, undefined, 10000*200);
    // // player.GossipMenuAddItem(1,`Hire Grandmaster Jewelcrafter - (Reset Timers) 200g`, 1,40, undefined, undefined, 10000*200);
    // player.GossipMenuAddItem(1,`Hire Bernie, Leather Trader - ${ToGold(bernieCost)}g`, NPCS.BERNIE,50, undefined, undefined, bernieCost);
    // // player.GossipMenuAddItem(1,`Epic Tradeskill Vendor - 650g`, 1,60, undefined, undefined, 10000*650);    
    // // player.GossipMenuAddItem(1,`Secret Goods Vendor 1300g`, 1,80, undefined, undefined, 10000*1300);
    // player.GossipMenuAddItem(0, `I will leave you alone`,1,2);
    player.GossipSendMenu(NPCS.GOTHUK, creature, 10000);    

    return true;
}

const GossipSelect: gossip_event_on_select = (event: number, player: Player, creature: any, selection, action, code, menuId) => {

    PrintInfo(`selection: ${selection}`);
    print(`action ${action}`); 

    // const cost = 100000;
    // const inGold = cost / 10000; 
    const account = new AccountInfo(player.GetAccountId()); 
    const characters = account.GetCharacters(); 

    if(action === 50500) {
        player.GossipClearMenu(); 
        player.GossipComplete(); 
        return true;
    }

    // player.GossipClearMenu(); 
    
    if(action > 15) {
        for(let numC = 0; numC < characters.length; numC++) {
            let name = characters[numC].name;        

            if(name != player.GetName()) {
                // player.GossipMenuAddItem(2, `Send to: ${name}`, 2, numC+1, undefined, `Are you sure you will to rebind this item to ${name}?`, 10000); 
                player.GossipMenuAddItem(2, `Send to: ${name}`, 2, numC+1, undefined); 
            }            
        }   

        selectedItem[player.GetName()] = action; 
        
        player.GossipSendMenu(NPCS.GOTHUK, creature, 10000);        

    } 

    if(action <= 15) {

        let itemToChange = selectedItem[player.GetName()]; 
        let itemGuid = GetItemGUID(itemToChange); 

        const PlayerItem = player.GetItemByGUID(itemGuid); 
        print(`Item Info: ${PlayerItem.GetOwner().GetName()} owns ${PlayerItem.GetName()}`); 
        
        let newItemGuid = SendMail(
            `Item Rebound ${PlayerItem.GetName()}`, 
            `Soulbinder has sent you a gift ${PlayerItem.GetName()}`, 
            characters[action-1].guid,
            player.GetGUIDLow(), 
            MailStationery.MAIL_STATIONERY_DEFAULT,
            0,
            0,
            0,
            PlayerItem.GetEntry(),            
            1
        ); 
        
        print(`To Name is ${characters[action-1].name}`);        
        player.RemoveItem(PlayerItem, PlayerItem.GetEntry(), 1);

        print(`send new item ${newItemGuid} to ${characters[action-1].name}`);         
        player.GossipClearMenu(); 
        player.GossipComplete(); 
    } 

 
    return true; 
}

// const MapLog: map_event_on_player_enter = (event: number, map: EMap, player:Player) => {
    
//     PrintInfo(map.GetName());
//     PrintInfo(`${map.GetInstanceId()}`);

//     PrintInfo(`${player.GetZoneId()}`);
//     PrintInfo(`${GetGameTime()}`);

//     if(player.GetZoneId() == 876) {
//         WorldDBExecute(`insert into guild_house_log VALUES(null,'${player.GetGUID()}','${player.GetName()} entered the guild house', CURTIME())`);
//     }

//     return true;
// }

/**
 * This will load NPCs that shoud be loaded based on purchased guild benefits
 * and if system is enabled. 
 */
const LoadNpcOnStart: eluna_event_on_lua_state_open = (event: number) => {
    const npcs = [
        9000003,  // Gothuk
        9000004,  // Bernie
        9000005,  // Edward
        9000006,  // Luna
        9000007,  // Bob B
        9000008   // Shiva
    ];

    const result = WorldDBQuery("SELECT * from guild_elite_benefits");

    for(let i =0; i < result.GetRowCount(); i++ ) {
        let benefit = result.GetRow();
        let entry = benefit.creature_entry as number; 

        if(benefit.purchased === 1 && !spawned.includes(entry)) {

            PerformIngameSpawn(1,entry,1,0,
                // location data 
                benefit.x as number,
                benefit.y as number,
                benefit.z as number,
                benefit.o as number,
            false);
                                    

            PrintInfo(`benefit.benefit,'was purchased!`);
        } else {
            PrintInfo(`benefit.benefit,'was NOT purchased!'`);
        }

        result.NextRow();
    }

    // for(const npcId of npcs) {
    //     Get
    // }
}

// RegisterServerEvent(
//     ServerEvents.ELUNA_EVENT_ON_LUA_STATE_OPEN,
//     (...args) => {
//         let spawned = []; 
//         LoadNpcOnStart(...args)
//     }
// );


// PerformIngameSpawn(1,9000003,1,0,16221.8,16278,20.9032,4.70345,false);

// const object = GetObjectGUID(3110516,9000003);


RegisterCreatureGossipEvent(
    9000003,
    GossipEvents.GOSSIP_EVENT_ON_HELLO, 
    (...args) => GossipHello(...args)
);

RegisterCreatureGossipEvent(
    9000003,
    GossipEvents.GOSSIP_EVENT_ON_SELECT, 
    (...args) => GossipSelect(...args)
);

RegisterGameObjectGossipEvent(
    750000,
    GossipEvents.GOSSIP_EVENT_ON_HELLO, 
    (...args) => GossipHello(...args)
);

RegisterGameObjectGossipEvent(
    750000,
    GossipEvents.GOSSIP_EVENT_ON_SELECT, 
    (...args) => GossipSelect(...args)
);


// RegisterServerEvent(
//     ServerEvents.MAP_EVENT_ON_PLAYER_ENTER,
//     (...args) => MapLog(...args)
// )

const seeItems: player_event_on_command = (event: number, player:  Player, command: string): boolean => {
    if(command.includes('backpack')) {
        for(let i=23; i <= 38; i++ ) {
            let item = player.GetItemByPos(255, i);
            print(item.GetName()); 
            print(item.GetItemLink()); 
        }
    }
    
    
    return true; 
}

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_COMMAND, (...args) => seeItems(...args)); 

