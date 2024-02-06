import { BotStat, BotEquipSlot } from '../constants/idmaps';

const npcBotEmote: creature_event_on_died = (event: number, creature: Creature, player: Player) => {

    // player.KillPlayer(); 
    print('Here!!!!!')
    // print(`Emote ${emoteId}`); 

    return true; 
}

const emoteHandler: creature_event_on_receive_emote = (event: number, creature: Creature, player: Player, emoteId: number) => {

    PrintError(`Emote ${emoteId}`);

    return true; 
}

const deadBot: creature_event_on_died = (event: number, creature: Creature, player: Player) => {
            
        PrintError(creature.GetName() + ' died!');    
        return false; 
}

const enterCombat: creature_event_on_enter_combat = (event: number, creature: Creature, target: Unit) => {
            
    PrintError(creature.GetName() + ' entered combat');   
    print(target.GetName()); 
    return false; 
}

const playerEmote: player_event_on_text_emote = (event: number, player: Player, textEmote: number, emoteNum: number, guid: number) => {
    
    print('Emote: ' + textEmote);
    print('EmoteNum: ' + emoteNum); 

    const unit = player.GetSelection();

    if(!unit) {
        return false; 
    }
    if(unit.GetTypeId() ==  TypeID.TYPEID_UNIT) {
        const creature = unit.ToCreature();
        
        print(`BotName ${creature.GetName()}`);      
        
        if(creature.IsNPCBot()) {
            const owner = creature.GetOwner();
            print(owner); 
            if(owner !== undefined) {
                print(`Owner: ${owner.GetName()}`);       
                print(`Bot Gear Item Level: ${creature.GetBotAverageItemLevel()}`);         
                print(`Bot Roles ${creature.GetBotRoles()}`);                
                print(`IsBotTank: ${creature.IsBotTank()}`);
                print(`IsBotOffTank ${creature.IsBotOffTank()}`);                
            }           
            
            print(`Generic Info ------------`); 
            const botclass = creature.GetClass();
            print(`Bot Class: ${botclass}`);    
            print(`Bot Str ${creature.GetBotStat(4)}`); 
            print(`Is Free Bot: ${creature.IsFreeBot()}`);

        }

    }    
}

const playerChat: player_event_on_chat = (event: number, player: Player, message: string, type: number, lang: number) => {
                
    const unit = player.GetSelection();
    if(unit) {
        const creature = unit.ToCreature();
        if(creature.IsNPCBot()) {            

            let [action, item] = message.split(" ");                                                  
            if(action === 'botequip') {
                if(item) {
                    const itemEntry = parseInt(item);
                    if(itemEntry < 1) {
                        player.SendBroadcastMessage('Invalid item entry');
                        return false;
                    }
                    
                    if(!player.HasItem(itemEntry, 1)) {
                        player.SendBroadcastMessage('You do not have that item'); 
                        return false;
                    }

                    if(itemEntry) {
                        creature.BotEquipItem(itemEntry, BotEquipSlot.MAINHAND);
                    }
                } else {
                    const mainhand = creature.GetBotEquipment(BotEquipSlot.MAINHAND);

                    if(mainhand) {
                        print(`Mainhand: ${mainhand.GetName()}`);
                        creature.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_SAY, Language.LANG_COMMON, `Mainhand: ${mainhand.GetItemLink()}`, player);                       
                    }
                    print(`Haste Rating: ${creature.GetBotStat(BotStat.HASTE_RATING)}`);

                }
            }

        }
        

    }
    return '';   
    
}

RegisterCreatureEvent(
    // 28690,    
    // 16402,
    1212,
    CreatureEvents.CREATURE_EVENT_ON_RECEIVE_EMOTE, 
    (...args) => emoteHandler(...args)
); 

RegisterCreatureEvent(
    // 7334, 
    // 16402,
    1212,
    CreatureEvents.CREATURE_EVENT_ON_DIED, 
    (...args) => deadBot(...args)
);

RegisterCreatureEvent(
    // 7334, 
    // 16402,
    1212,
    CreatureEvents.CREATURE_EVENT_ON_ENTER_COMBAT, 
    (...args) => enterCombat(...args)
);

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_TEXT_EMOTE, (...args) => playerEmote(...args)); 

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_CHAT, (...args) => playerChat(...args));


