local ____lualib = require("lualib_bundle")
local __TS__New = ____lualib.__TS__New
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__StringIncludes = ____lualib.__TS__StringIncludes
local ____exports = {}
local ____money = require("classes.money")
local ToCopper = ____money.ToCopper
local GetPlayerTax = ____money.GetPlayerTax
local ____account = require("classes.account")
local AccountInfo = ____account.AccountInfo
local spawned = {}
local NPCS = {
    GOTHUK = 9000003,
    BERNIE = 9000004,
    EDWARD = 9000005,
    LUNA = 9000006,
    BOB_B = 9000007,
    SHIVA = 9000008
}
local selectedItem = {}
local function GossipHello(____, event, player, creature)
    local accountId = player:GetAccountId()
    local bernieCost = ToCopper(nil, 1000) + GetPlayerTax(nil, player, 5)
    player:GossipClearMenu()
    do
        local i = 23
        while i <= 38 do
            local item = player:GetItemByPos(255, i)
            if item ~= nil then
                print(item:GetItemLink())
                if item:IsSoulBound() then
                    local quality = item:GetQuality()
                    if quality > 2 then
                        player:GossipMenuAddItem(
                            1,
                            "Item: " .. item:GetItemLink(),
                            1,
                            item:GetGUIDLow(),
                            nil,
                            nil
                        )
                    end
                end
            end
            i = i + 1
        end
    end
    player:GossipSendMenu(NPCS.GOTHUK, creature, 10000)
    return true
end
local function GossipSelect(____, event, player, creature, selection, action, code, menuId)
    PrintInfo("selection: " .. tostring(selection))
    print("action " .. tostring(action))
    local account = __TS__New(
        AccountInfo,
        player:GetAccountId()
    )
    local characters = account:GetCharacters()
    if action > 15 then
        do
            local numC = 0
            while numC < #characters do
                local name = characters[numC + 1].name
                if name ~= player:GetName() then
                    player:GossipMenuAddItem(
                        2,
                        "Send to: " .. name,
                        2,
                        numC + 1,
                        nil
                    )
                end
                numC = numC + 1
            end
        end
        selectedItem[player:GetName()] = action
        player:GossipSendMenu(NPCS.GOTHUK, creature, 10000)
    end
    if action <= 15 then
        local itemToChange = selectedItem[player:GetName()]
        local itemGuid = GetItemGUID(itemToChange)
        local PlayerItem = player:GetItemByGUID(itemGuid)
        print((("Item Info: " .. PlayerItem:GetOwner():GetName()) .. " owns ") .. PlayerItem:GetName())
        print("To Name is " .. characters[action].name)
        local newItemGuid = SendMail(
            "Item Soulswap " .. PlayerItem:GetName(),
            "Soulbinder has sent you a gift " .. PlayerItem:GetName(),
            characters[action].guid,
            player:GetGUIDLow(),
            41,
            100,
            0,
            0,
            PlayerItem:GetEntry(),
            1
        )
        print((("send new item " .. tostring(newItemGuid)) .. " to ") .. characters[action].name)
        player:GossipComplete()
    end
    return true
end
--- This will load NPCs that shoud be loaded based on purchased guild benefits
-- and if system is enabled.
local function LoadNpcOnStart(____, event)
    local npcs = {
        9000003,
        9000004,
        9000005,
        9000006,
        9000007,
        9000008
    }
    local result = WorldDBQuery("SELECT * from guild_elite_benefits")
    do
        local i = 0
        while i < result:GetRowCount() do
            local benefit = result:GetRow()
            local entry = benefit.creature_entry
            if benefit.purchased == 1 and not __TS__ArrayIncludes(spawned, entry) then
                PerformIngameSpawn(
                    1,
                    entry,
                    1,
                    0,
                    benefit.x,
                    benefit.y,
                    benefit.z,
                    benefit.o,
                    false
                )
                PrintInfo("benefit.benefit,'was purchased!")
            else
                PrintInfo("benefit.benefit,'was NOT purchased!'")
            end
            result:NextRow()
            i = i + 1
        end
    end
end
RegisterCreatureGossipEvent(
    9000003,
    1,
    function(...) return GossipHello(nil, ...) end
)
RegisterCreatureGossipEvent(
    9000003,
    2,
    function(...) return GossipSelect(nil, ...) end
)
local function seeItems(____, event, player, command)
    if __TS__StringIncludes(command, "backpack") then
        do
            local i = 23
            while i <= 38 do
                local item = player:GetItemByPos(255, i)
                print(item:GetName())
                print(item:GetItemLink())
                i = i + 1
            end
        end
    end
    return true
end
RegisterPlayerEvent(
    42,
    function(...) return seeItems(nil, ...) end
)
return ____exports
