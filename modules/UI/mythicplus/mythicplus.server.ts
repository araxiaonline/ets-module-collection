/** @ts-expect-error */
let aio: AIO = {}; 

function getPlayerGroupId(player: Player): number {
    const result = CharDBQuery(`SELECT m.guid FROM acore_characters.characters c left join acore_characters.group_member m on c.guid = m.memberGuid where c.guid = ${player.GetGUID()}`);

    if(!result) {
        return -1;
    }

    return result.GetUInt32(0);
}


// Get the difficulty alread set for the player or group
function _getDifficulty(player: Player): number {
    const difficulty = player.GetDifficulty(); 
    const group = player.GetGroup();
    if(!group) {
        aio.Handle(player, "MythicPlus", "SetDifficulty", difficulty);
    }

    const result = CharDBQuery(`SELECT difficulty FROM group_difficulty WHERE guid = ${group.GetGUID()}`);
    if(result) {
        print(`MythicPlusMod: Setting difficulty for ${player.GetName()} to ${result.GetUInt32(0)}`);
        aio.Handle(player, 'MythicPlus', 'SetDifficulty', result.GetUInt32(0));        
        return;
    } 
}

// Server API for Client
function GetDifficulty(this:void, player: Player): void {
    aio.Handle(player, 'MythicPlus', 'SetDifficulty', _getDifficulty(player));
}

// Set the difficulty for the encounter
function _setDifficulty(player: Player, difficulty: number): void {          
    const groupId = getPlayerGroupId(player);
    const group = player.GetGroup();
    if(groupId == -1) {
        player.SendNotification('You must be in a group to set a mythic+ difficulty');        
        return;
    }
    PrintInfo("Group ID: " + groupId);    

    if(! group.IsLeader(player.GetGUID())) {
        return;
    }

    if(difficulty > 4) {
        PrintError(`MythicPlusMod: Invalid difficulty set:  ${difficulty}`);
    }
  
    if(difficulty == 0) {
        CharDBExecute(`DELETE FROM group_difficulty WHERE guid = ${groupId}`);
        GetDifficulty(player);        
        return;
    }

    CharDBExecute(`REPLACE INTO group_difficulty (guid, difficulty) VALUES (${groupId}, ${difficulty})`);    
}

function SetDifficulty(this:void, player: Player, difficulty: number): void {
    _setDifficulty(player, difficulty);    
}

const ShowIt: player_event_on_command = (event: number,player: Player, command: string): boolean => {
    if(command == 'mythicplus') {        
        const difficulty = player.GetDifficulty();
        PrintInfo(`MythicPlusMod: Showing UI for ${player.GetName()} with difficulty ${difficulty}`);
        aio.Handle(player, 'MythicPlus', 'ShowUI', {difficulty: difficulty}); 
        return false; 
    }
    return true; 
}; 


const MPHandlers = aio.AddHandlers("MythicPlus", {    
    GetDifficulty, 
    SetDifficulty
}); 

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_COMMAND, (...args) => ShowIt(...args));
