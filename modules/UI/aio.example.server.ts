/** @ts-expect-error */
let aio: AIO = {}; 
const myHandlers = aio.AddHandlers('AIOTest', {}); 

myHandlers.print = (...args) => {
    print(args); 
}

const frame = CreateFrame

const ShowWindow: player_event_on_command = (event: number,player: Player, command: string): boolean => {
    if(command == 'testwin') {
        aio.Handle(player, 'AIOTest', 'ShowFrame'); 
        return false; 
    }
    return true; 
}; 

RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_COMMAND, 
    (...args) => ShowWindow(...args)
); 
   