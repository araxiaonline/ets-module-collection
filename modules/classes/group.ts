
export function GetGroupSize(player: Player): number {

    const group = player.GetGroup();
    let groupCount = 0;

    if(group != undefined) {
    const members = group.GetMembers();

        for(let member of members) {
            member.GetName();
            groupCount += 1;
        }
    }

    return groupCount;
}