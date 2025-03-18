/** @ts-expect-error */
let aio: AIO = {}; 


const onChat: player_event_on_chat = (event: number, player: Player, msg: string, type: ChatMsg, lang: Language): string | boolean => {

    if(msg.includes("leeroy")) {
        
        const members = player.GetGroup().GetMembers();
        for(let i = 0; i < members.length; i++) {
            aio.Handle(members[i], 'AIOAudioPlayer', 'PlaySingleSound', "Sound\\Effects\\leroy.swf.mp3");
        }

        print("lerrrooooooy jenkins")
        aio.Handle(player, 'AIOAudioPlayer', 'PlaySingleSound', "Sound\\Effects\\leroy.swf.mp3");
    }

    



return ''
}

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_CHAT,(...args) => onChat(...args))