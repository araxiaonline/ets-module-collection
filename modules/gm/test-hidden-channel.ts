// let aio: AIO = {}; 
// if(!aio.AddAddon()) {

//     const myFrame = CreateFrame("Frame", "MythicEventListener", UIParent);
//     myFrame.RegisterEvent("CHAT_MSG_ADDON");
//     myFrame.SetScript("OnEvent", (frame, event, ...args) => {
//         if(event === "CHAT_MSG_ADDON") {

//             // Ensure args is treated as an array
//             const argsArray = [...args];

//             // Explicitly destructure the arguments
//             const prefix = argsArray[0];
//             const message = argsArray[1];
//             const channel = argsArray[2];
//             const sender = argsArray[3];


//             if(prefix === "MPUi") {
//                 print(` >>>>> MPUI Mythic+ Message received from ${sender} on channel ${channel}: ${message}`);
//             } else {
//                 print(`Addon Message received from ${sender} on channel ${channel} with prefix ${prefix}: ${message}`);
//             }
//         }
//     });

// }


// const TestHiddenChannel: player_event_on_chat = (event: number, player: Player, msg: string, Type: ChatMsg, lang: Language): string | boolean => {


//     if(msg.includes("#debug")) {



//         player.SendAddonMessage("MpUi", "Sending Addon Message from Client 7", 7, player);
//         player.SendAddonMessage("MpUi", "Sending Addon Message from Client 0", 0, player);
//         player.SendAddonMessage("MpUi", "Sending Addon Message from Client 17", 17, player);
//         PrintInfo(`Player ${player.GetName()} sent a hidden message to channel MpUi`);
//         // const message = "hidden message sent to channel 100";
//         // const chatTag = player.GetChatTag();

//         // let size = 35 + message.length; 

// /*
//         std::string prefix = Eluna::CHECKVAL<std::string>(L, 2);
//         std::string message = Eluna::CHECKVAL<std::string>(L, 3);
//         uint8 channel = Eluna::CHECKVAL<uint8>(L, 4);
//         Player* receiver = Eluna::CHECKOBJ<Player>(L, 5);

//         std::string fullmsg = prefix + "\t" + message;/script

//         WorldPacket data(SMSG_MESSAGECHAT, 100);
//         data << uint8(channel);
//         data << int32(LANG_ADDON);
//         data << player->GET_GUID();
// #ifndef CLASSIC
//         data << uint32(0);
//         data << receiver->GET_GUID();
// #endif
//         data << uint32(fullmsg.length() + 1);
//         data << fullmsg;
//         data << uint8(0);
// #ifdef CMANGOS*/
//         const message = "Hello from a packet test"

//          const chatPacket = CreatePacket(0x096,100);         
//          chatPacket.WriteUByte(ChatMsg.CHAT_MSG_WHISPER);
//          chatPacket.WriteULong(Language.LANG_ADDON);
//          chatPacket.WriteGUID(player.GetGUID());
//          chatPacket.WriteULong(0);         
//          chatPacket.WriteGUID(player.GetGUID());         
//          chatPacket.WriteULong(message.length + 1);
//          chatPacket.WriteString(message);
//          chatPacket.WriteUByte(0); 

//          player.SendPacket(chatPacket, true);

        

//         // player.SendAddonMessage("DebugTest", "hidden message sent to channel 100", 100, player);
//     }     
    
//     return 'hidden message sent to channel 100';     
// };

// // Register
// RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_CHAT, (...args) => TestHiddenChannel(...args));

// const PlayerListenChannel: player_event_on_channel_chat = (event: number, player: Player, msg: string, Type: ChatMsg, lang: Language, channel: number): string | boolean => {
    
//     PrintInfo(`Player ${player.GetName()} sent a message to channel ${channel} with the message: ${msg}`);
    
//     return true; // Return false to block the message, or return true to allow the message;
// };

// // Register
// RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_CHANNEL_CHAT, (...args) => PlayerListenChannel(...args));

// const TestDoAddon: player_event_on_spell_cast = (event: number, player: Player, spell: Spell, skipCheck: boolean) => {
//     // Implementation

//     PrintInfo("Player " + player.GetName() + " cast spell " + spell.GetEntry());
//     const message = "Hello from a packet test"

//     const chatPacket = CreatePacket(0x096,100);         
//     chatPacket.WriteUByte(ChatMsg.CHAT_MSG_SAY);
//     chatPacket.WriteULong(Language.LANG_UNIVERSAL);
//     chatPacket.WriteGUID(player.GetGUID());
//     chatPacket.WriteULong(0);         
//     chatPacket.WriteGUID(player.GetGUID());         
//     chatPacket.WriteULong(message.length + 1);
//     chatPacket.WriteString(message);
//     chatPacket.WriteUByte(0); 

//     player.SendPacket(chatPacket, false);


//     player.SendAddonMessage("MpUi", "Sending Addon Message from Client 7", 7, player);
//     player.SendAddonMessage("MpUi", "Sending Addon Message from Client 0", 0, player);
//     player.SendAddonMessage("MpUi", "Sending Addon Message from Client 17", 17, player);
// };

// // Register
// RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_SPELL_CAST, (...args) => TestDoAddon(...args));    