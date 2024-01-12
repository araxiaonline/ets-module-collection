import { SetTrigger, GetTrigger } from "../classes/triggers";
/**
 * Show the Burning Crusade moving on first login. 
 * 
 * @param event 
 * @param player 
 */
const ShowBCMovie: player_event_on_login = (event: number, player: Player) => {    
    const movieShown = GetTrigger(player.GetGUIDLow(), "tbc_movie_shown");

    if(movieShown === false) {
        player.SendMovieStart(1); 
            SetTrigger({
            triggerName: "tbc_movie_shown", 
            characterGuid: player.GetGUIDLow(), 
            isSet: true
        }); 
    }
}

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_LOGIN, 
    (...args) => ShowBCMovie(...args)
); 
