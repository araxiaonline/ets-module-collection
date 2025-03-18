/** @ts-expect-error */
let aio: AIO = {}; 

import { Logger } from "../../classes/logger";
import type { MythicPlusState } from "./mythicplus.state";

const logger = new Logger("MythicPlusMod");

// PlayerGUID -> MythicPlusState
const StateStorage: Map<number, MythicPlusState> = new Map();

// This looks up the current group id for the player -1 indicates no group
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
    const groupId = getPlayerGroupId(player);


    logger.debug(`MythicPlusMod: Getting difficulty for ${player.GetName()} with difficulty ${difficulty} and group ${groupId}`);

    if(groupId == -1) {
        aio.Handle(player, "MythicPlus", "SetDifficulty", difficulty);
    }

    const result = CharDBQuery(`SELECT difficulty FROM group_difficulty WHERE guid = ${groupId}`);
    if(result) {
        logger.debug(`MythicPlusMod: Setting difficulty for ${player.GetName()} to ${result.GetUInt32(0)}`);             
        return result.GetUInt32(0);
    } 
}

// Set the difficulty for the encounter
function _setDifficulty(player: Player, difficulty: number): void {          
    const groupId = getPlayerGroupId(player);
    const group = player.GetGroup();
    if(groupId == -1) {
        player.SendNotification('You must be in a group to set a mythic+ difficulty');        
        return;
    }
    logger.debug(`Setting difficulty for ${player.GetName()} to ${difficulty}`);    

    if(! group.IsLeader(player.GetGUID())) {
        return;
    }

    const map = player.GetMap();
    if(map.IsDungeon() != false) {
        player.SendNotification('You can not change the difficulty in a dungeon');        
        return;
    }

    // 0 is the lowest difficulty and 4 is the highest
    if(difficulty > 4) {
        logger.error(`Invalid difficulty set:  ${difficulty}`);
    }
  
    if(difficulty == 0) {
        CharDBExecute(`DELETE FROM group_difficulty WHERE guid = ${groupId}`);        
        return;
    }

    CharDBExecute(`REPLACE INTO group_difficulty (guid, difficulty) VALUES (${groupId}, ${difficulty})`);    
}

function SetDifficulty(this:void, player: Player, difficulty: number): void {
    _setDifficulty(player, difficulty);    
    aio.Handle(player, 'MythicPlus', 'UpdateState', StateStorage.get(player.GetGUIDLow()));     
}

// This is used to 
function _refreshState(player: Player) {
    if(player.IsInGroup()) {
        const groupId = getPlayerGroupId(player);
        const groupLeader = player.GetGroup().GetLeaderGUID();
        const isLeader = player.GetGUID() == groupLeader;
        const difficulty = _getDifficulty(player);
        StateStorage.set(player.GetGUIDLow(), {difficulty, inGroup: true, groupId, groupLeader, isLeader});
        return;
    } else {
        StateStorage.set(player.GetGUIDLow(), {difficulty: _getDifficulty(player), inGroup: false, groupId: -1, groupLeader: -1, isLeader: false});        
    }
}

// Update the state from what is on the server and send it back to the client. 
function GetState(this:void, player: Player): void {
    _refreshState(player);
    const state = StateStorage.get(player.GetGUIDLow());
    aio.Handle(player, 'MythicPlus', 'UpdateState', state);
}

// This is the command to open the mythic plus panel
const OpenUI: player_event_on_command = (event: number,player: Player, command: string): boolean => {
    if(command == 'mythicplus') {            
        const state = StateStorage.get(player.GetGUIDLow());
        logger.debug(`OpenUI command 
            player: ${player.GetName()}, 
            difficulty ${state.difficulty}, 
            groupId: ${state.groupId}, 
            groupLeader: ${state.groupLeader}, 
            isLeader: ${state.isLeader}`
        );
        aio.Handle(player, 'MythicPlus', 'ShowUI', StateStorage.get(player.GetGUIDLow())); 
        return false; 
    }
    return true; 
}; 

// This enables the client to fire a request to open the mythic plus panel after updating state
function ShowUI(this:void, player: Player): void {
    _refreshState(player);
    aio.Handle(player, 'MythicPlus', 'ShowUI', StateStorage.get(player.GetGUIDLow())); 
}

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_COMMAND, (...args) => OpenUI(...args));

const MPStartState: player_event_on_login = (_event: number, player: Player): void => {
    _refreshState(player);
    aio.Handle(player, 'MythicPlus', 'UpdateState', StateStorage.get(player.GetGUIDLow()));
};

// On login set up the mythic panel mod state for the player
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_LOGIN, (...args) => MPStartState(...args));

// const MPGroupDisband: group_event_on_disband = (_event: number, group: Group): void => {
//     const members = group.GetMembers();

//     for(let i = 0; i < members.length; i++) {
//         _refreshState(members[i]);
//         aio.Handle(members[i], 'MythicPlus', 'UpdateState', StateStorage.get(members[i].GetGUIDLow()));
//     }
// }

// RegisterGroupEvent(GroupEvents.GROUP_EVENT_ON_DISBAND, (...args) => MPGroupDisband(...args));

// When a leader change happens need to update the state storage for each leader to enable changes in the panel. 
// const MPLeaderChange: group_event_on_leader_change = (_event: number,group: Group, leader: number, oldLeader: number): void => {
//     _refreshState(GetPlayerByGUID(leader));
//     aio.Handle(GetPlayerByGUID(leader), 'MythicPlus', 'UpdateState', StateStorage.get(leader));

//     _refreshState(GetPlayerByGUID(oldLeader));
//     aio.Handle(GetPlayerByGUID(oldLeader), 'MythicPlus', 'UpdateState', StateStorage.get(oldLeader));
// }

// RegisterGroupEvent(GroupEvents.GROUP_EVENT_ON_LEADER_CHANGE, (...args) => MPLeaderChange(...args));


const DeletePlayerState: player_event_on_logout = (event: number, player: Player) => {
    StateStorage.delete(player.GetGUIDLow());
};

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_LOGOUT, (...args) => DeletePlayerState(...args));      

// API Handlers available to the client
const MPHandlers = aio.AddHandlers("MythicPlus", {    
    ShowUI,
    SetDifficulty, 
    GetState,
}); 