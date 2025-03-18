class Command {

    onCommand : player_event_on_command = (
        event: number, 
        player: Player, 
        command: string
      ) => {
    
        if(command == "doit") {
            const message = "A Command from the script has been entered" + command;   
            print(message); 
            

            SendWorldMessage(message); 
        }
        print("debug: " + command); 
        
        return true; 
      }

}


const commandHander = new Command(); 
RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_COMMAND, 
    (...args) => commandHander.onCommand(...args)
)
