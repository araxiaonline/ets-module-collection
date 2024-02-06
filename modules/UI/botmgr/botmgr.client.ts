
/** @noSelfInFile **/
/** @ts-expect-error */
let aio: AIO = {}; 


/**
 * @todo Add all equipment slots for the bot onload - done
 * @todo Create frames for bot status 
 * @todo Complete resist information frame. 
 * @todo Update server message to send class name, bot race - done
 * @todo Add hover events to handle equipment change on bot. 
 * @todo Add compare tooltip for bot equipment - sort of done (shows equipment next to each other)
 * 
 * v2: 
 * @todo Add slot management for bot equipment
 * @todo Add bot spec under bot info
 * @todo Add talent spec to bot profile
 */


import { UIInvSlot, BotEquipSlot, BotSlotName } from "../../constants/idmaps";
import { BotData } from "./botmgr.server";
import { BotStorage } from "./bot";



const id = (name: string, entry: number = null) => `BotMgr${name}` + (entry ? entry : '');
const compId = (botId: number, name: string) => `${botId}:BotMgr${name}`;

function ucase(input: string): string {
    if (input.length === 0) {
        return input; // Return unchanged if the input is an empty string
    }
    const firstLetter = input.charAt(0).toUpperCase();
    let restOfTheString = input.slice(1).toLowerCase();

    if(input.slice(-1) == "1" || input.slice(-1) == "2") {
        restOfTheString = restOfTheString.slice(0, -1);        
    }

    return firstLetter + restOfTheString;
}


// If we are a client file. aio.AddAddon() will return false and this file will be serialized and sent to client. 
if(!aio.AddAddon()) {
    
    const botMgrHandlers = aio.AddHandlers('BotMgr', {}); 
    const InfoFramePool: Map<number, WoWAPI.Frame> = new Map();  
    const ComponentsPool: Map<string, unknown> = new Map();   // key botId + ":" + componentid
    const botStorage: BotStorage = new BotStorage();
    

    let BotItemTooltip: WoWAPI.GameTooltip;  

    /**
     * All Resists for the bot
     * Is a SubFrame as well as children. 
     * @param parent 
     * @param resists 
     */
    function AddResistFrame(parent: WoWAPI.Frame, resists: any = {}) {
        const resistFrame = CreateFrame("Frame", id("ResistsFrame"), parent);
        resistFrame.SetSize(32, 160); 
        resistFrame.SetPoint("TOPRIGHT", parent, "TOPLEFT", 297, -77); 


        const magicRes1 = CreateFrame("Frame", id("MagicResFrame1"), resistFrame, "MagicResistanceFrameTemplate", 6);
        magicRes1.SetPoint("TOP", resistFrame, "TOP", 0, 0);
        magicRes1.SetSize(32, 32);

        const magResBack1 = magicRes1.CreateTexture(id("MagicResTexture1"), "BACKGROUND");
        magResBack1.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-ResistanceIcons");
        magResBack1.SetTexCoord(0, 1, 0.2265, 0.3398);
        magResBack1.SetAllPoints(magicRes1);
        
        const magResFont1 = magicRes1.CreateFontString(id("MagicResFont1"), "BACKGROUND", "GameFontHighlightSmall");
        magResFont1.SetPoint("BOTTOM", magicRes1, null, 0, 3);
        magResFont1.SetText("X");
    }

    /**
     * This is for the Characters left picture and class,race, name details. 
     * Only created once. 
     */
    function AddPortrait(parent: WoWAPI.Frame, botData: BotData) {
        const portrait = parent.CreateTexture(id("Portrait", botData.entry), "ARTWORK");
        portrait.SetPoint("TOPLEFT", 10, -7);
        portrait.SetSize(58, 58);
        
        SetPortraitTexture(portrait, "target");

        const characterName = CreateFrame("Frame", id("CharacterName", botData.entry), parent);
        characterName.SetSize(109,12); 
        characterName.SetPoint("CENTER",6,232);
        characterName.SetScript("OnLoad", (frame) => {
            RaiseFrameLevel(frame); 
        });

        const charFont = characterName.CreateFontString(id("CharacterNameFont", botData.entry), "BACKGROUND", "GameFontNormal");
        charFont.SetText(GetUnitName("target", false));
        charFont.SetSize(300,12); 
        charFont.SetPoint("CENTER",0,0);
        charFont.SetTextColor(1,1,1,1);

        const infoTextFrame = CreateFrame("Frame", id("InfoTextFrame", botData.entry), parent);
        infoTextFrame.SetSize(200,12);
        infoTextFrame.SetPoint("CENTER", characterName, "BOTTOM", 0, -15);
        infoTextFrame.SetScript("OnLoad", (frame) => {
            RaiseFrameLevel(frame); 
        });

        const infoTextFont = infoTextFrame.CreateFontString(id("InfoTextFont", botData.entry), "BACKGROUND", "GameFontHighlightSmall");
        if(botData.classId > 10) {
            infoTextFont.SetText(`${YELLOW_FONT_COLOR_CODE} Level ${UnitLevel("target")} ${botData.class}`);
        } else {
            infoTextFont.SetText(`${YELLOW_FONT_COLOR_CODE} Level ${UnitLevel("target")} ${botData.race} ${botData.class}`);
        }

        infoTextFont.SetSize(300,12);
        infoTextFont.SetPoint("CENTER",0,0);    
        
    }

    function AddCharacterModel(parent: WoWAPI.Frame, botData: BotData) {        
        const frameChar = CreateFrame("PlayerModel", id("ModelFrame", botData.entry), parent, null, botData.entry);
        frameChar.SetPoint("TOP", -5, -82);
        frameChar.SetSize(240, 160);
        frameChar.SetUnit("target"); 
        frameChar.SetFacing(0.3);
        frameChar.SetFrameStrata("MEDIUM");
    }

    function UpdateEquipFrame(group: 'left' | 'right' | 'weapons', parent: WoWAPI.Frame, botData: BotData) {
        let slotOrder = []; 

        switch(group) {
            case 'left':
                slotOrder = [BotEquipSlot.HEAD,BotEquipSlot.NECK,BotEquipSlot.SHOULDERS,BotEquipSlot.BACK,BotEquipSlot.CHEST,-1,-2,BotEquipSlot.WRIST];
                break;
            case 'right':
                slotOrder = [BotEquipSlot.HANDS,BotEquipSlot.WAIST,BotEquipSlot.LEGS,BotEquipSlot.FEET,BotEquipSlot.FINGER1,BotEquipSlot.FINGER2,BotEquipSlot.TRINKET1,BotEquipSlot.TRINKET2];
                break;
            case 'weapons':
                slotOrder = [BotEquipSlot.MAINHAND,BotEquipSlot.OFFHAND,BotEquipSlot.RANGED];
                break;
        }                         
        
        // loop through the left equipment and create the buttons and texture. 
        for(let i = 0; i < slotOrder.length; i++) {            
            const itemSlotId = slotOrder[i] >= 0 ? slotOrder[i] : 92+slotOrder[i];
            const equipSlot = CreateFrame("Button", id(`${group}-EquipmentSlot-${slotOrder[i]}`), parent, "ItemButtonTemplate", itemSlotId);

            if(group === 'weapons') 
                equipSlot.SetPoint("TOPLEFT", i*40+1, 0);
            else 
                equipSlot.SetPoint("TOPLEFT", 0, -i*40-1);
            equipSlot.SetSize(40, 40);    
            equipSlot.SetScript("OnEnter", ItemSlotOnEnter);
            equipSlot.SetScript("OnLeave", ItemSlotOnLeave);
            equipSlot.SetScript("OnClick", ItemSlotOnClick); 

            const equippedItemId = botData.equipment[slotOrder[i]];
            let itemIcon: WoWAPI.TexturePath; 
            let itemId: number;
            let idsuffix: string | number;

            // If it is a shirt or tabard which are not supported just show the background texture.
            if(slotOrder[i] < 0) {
                const shirtOrTabard = (slotOrder[i] === -1) ? "SHIRT" : "TABARD";
                [itemId, itemIcon] = GetInventorySlotInfo(UIInvSlot[`${shirtOrTabard}SLOT`]);
                idsuffix = shirtOrTabard
            }
            
            // If we have a piece of equipment add the icon template
            if(equippedItemId && equippedItemId > 0) {
                itemIcon = GetItemIcon(equippedItemId);                    
                idsuffix = slotOrder[i];             
            }

            // If there is not a piece of equipment add the background texture
            if(!equippedItemId && slotOrder[i] > 0) {
                let slotName = BotSlotName[slotOrder[i]];

                if(slotOrder[i] === BotEquipSlot.FINGER1) slotName = "FINGER0";
                if(slotOrder[i] === BotEquipSlot.FINGER2) slotName = "FINGER1";
                if(slotOrder[i] === BotEquipSlot.TRINKET1) slotName = "TRINKET0";
                if(slotOrder[i] === BotEquipSlot.TRINKET2) slotName = "TRINKET1";
                if(slotOrder[i] === BotEquipSlot.OFFHAND) slotName = "SECONDARYHAND";
                
               [itemId, itemIcon] = GetInventorySlotInfo(UIInvSlot[`${slotName}SLOT`]);
                idsuffix = slotOrder[i];                
            }

            const itemTexture = equipSlot.CreateTexture(id(`ItemTexture-${idsuffix}`), "OVERLAY");
            itemTexture.SetTexture(itemIcon);
            itemTexture.SetPoint("CENTER", 0, 0);
            itemTexture.SetSize(36,36);                                        
        }
    }


    function AddEquipmentFrames(parent: WoWAPI.Frame, botData: BotData) {
        
        // Get all our frames 
        const frames = {
            left: ComponentsPool.get(compId(botData.entry, "LeftEquipment")), 
            right: ComponentsPool.get(compId(botData.entry, "RightEquipment")),
            weapons: ComponentsPool.get(compId(botData.entry, "WeaponsEquipment"))
        }; 
        
        let equipFrame: WoWAPI.Frame; 
        if(!frames.left) {
            equipFrame = CreateFrame("Frame", id("LeftEquipment"), parent, null, 1);
            equipFrame.SetPoint("TOPLEFT", 20, -73);
            equipFrame.SetSize(40, 330);
            UpdateEquipFrame('left', equipFrame, botData);
            ComponentsPool.set(compId(botData.entry, "LeftEquipment"), equipFrame);    

        }

        if(!frames.right) {
            equipFrame = CreateFrame("Frame", id("RightEquipment"), parent, null, 2);
            equipFrame.SetPoint("TOPRIGHT", -40, -73);
            equipFrame.SetSize(40, 330);
            ComponentsPool.set(compId(botData.entry, "RightEquipment"), equipFrame);    
            UpdateEquipFrame('right', equipFrame, botData);
            
        }

        if(!frames.weapons) {
            equipFrame = CreateFrame("Frame", id("WeaponEquipment"), parent, null, 3);
            equipFrame.SetPoint("CENTER", -10, -147);
            equipFrame.SetSize(129, 40);
            ComponentsPool.set(compId(botData.entry, "WeaponsEquipment"), equipFrame);
            UpdateEquipFrame('weapons', equipFrame, botData);
            // const placeholder = equipFrame.CreateTexture(id("RightEquipmentPlaceholder"), "OVERLAY");
            // placeholder.SetAllPoints(equipFrame); 
            // placeholder.SetTexture(0,0,0,0.8); 
        }
        
        
    }

    function SetBackground(parent: WoWAPI.Frame) {        
        // Left corner
        const leftUpper = parent.CreateTexture(id("BgUpperLeft"), "BACKGROUND");
        leftUpper.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-CharacterTab-L1");
        leftUpper.SetSize(256,256);
        leftUpper.SetPoint("TOPLEFT");             

        // Right corner
        const rightUpper = parent.CreateTexture(id("BgUpperRight"), "BACKGROUND");
        rightUpper.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-CharacterTab-R1");
        rightUpper.SetSize(128,256);
        rightUpper.SetPoint("TOPRIGHT");

        // left bottom
        const leftBottom = parent.CreateTexture(id("BgBottomLeft"), "BACKGROUND");
        leftBottom.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-CharacterTab-L2");
        leftBottom.SetSize(256,256);
        leftBottom.SetPoint("BOTTOMLEFT");

        // right bottom
        const rightBottom = parent.CreateTexture(id("BgBottomRight"), "BACKGROUND");
        rightBottom.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-CharacterTab-R2");
        rightBottom.SetSize(128,256);
        rightBottom.SetPoint("BOTTOMRIGHT");

        // Close Button 
        const closeButton = CreateFrame("Button", id("CloseButton"), parent, "UIPanelCloseButton");
        closeButton.SetPoint("CENTER", parent, "TOPRIGHT", -44, -25);
        closeButton.SetScript("OnClick", () => {
            parent.Hide();
        });                 
    }

    function AddSoundEffects(frame: WoWAPI.Frame) {
        frame.SetScript("OnShow", (frame) => {            
            PlaySound("igCharacterInfoOpen");
        }); 

        frame.SetScript("OnHide", (frame) => {                       
            PlaySound("igCharacterInfoClose");            
        });  
    }

    function ItemSlotOnEnter(frame: WoWAPI.Button) {
        const botId = botStorage.GetActive();        
        const itemId = botStorage.GetBotItem(botId, <BotEquipmentSlotNum>frame.GetID());        
        GameTooltip.SetOwner(frame, "ANCHOR_RIGHT");                 
        if(itemId) {
            GameTooltip.SetHyperlink(`item:${itemId}:0:0:0:0:0:0:0`);
        } else {            
            if(frame.GetID() == 90) {
                GameTooltip.SetText("Tabard");
            } else if(frame.GetID() == 91) {
                GameTooltip.SetText("Shirt");
            } else {
                GameTooltip.SetText(
                    ucase(BotSlotName[frame.GetID()])
                );
             
            }
        }                

        if(CursorHasItem()) {
            const [compItem, compItemId, compItemLink] = GetCursorInfo();                    
            const BotTooltip = <WoWAPI.GameTooltip>ComponentsPool.get(compId(botId, "tooltip"));        
            BotTooltip.SetOwner(frame, "ANCHOR_LEFT");            
            BotTooltip.SetHyperlink(compItemLink);                    
            BotTooltip.Show();            
        }
        GameTooltip.Show(); 

    }

    function ItemSlotOnLeave(frame: WoWAPI.Button) {        
        const botId = botStorage.GetActive();                        
        const BotTooltip = <WoWAPI.GameTooltip>ComponentsPool.get(compId(botId, "tooltip"));          
        BotTooltip.Hide();
        GameTooltip.Hide();     
    }

    function ItemSlotOnClick(frame: WoWAPI.Button, button: string) {
        const botId = botStorage.GetActive();        
        const itemId = botStorage.GetBotItem(botId, <BotEquipmentSlotNum>frame.GetID());    

        const [compItem, compItemId, compItemLink] = GetCursorInfo();
        print(`CursorHasItem: ${compItemLink}`);

        if(itemId && !compItem) {
            if(button == "LeftButton") {
                PickupItem(itemId);
                return; 
            }             
        } 

        if(compItem) {
            const slot = frame.GetID(); 
            
            aio.Handle("BotMgr", "EquipItem",botId, slot, compItemId); 
            // Attempt to equip the item. 
            PlaySound("INTERFACESOUND_CURSORDROPOBJECT");
            ClearCursor(); 
        }
        
        
        // else {
        //     if(CursorHasItem()) {
        //         const [compItem, compItemId, compItemLink] = GetCursorInfo();                    
        //         botStorage.EquipBotItem(botId, <BotEquipmentSlotNum>frame.GetID(), compItemId);
        //     }
        // }
    }

    /**
     * Shows or Creates a new Bot Equipment Management Frame
     * Every NPC Bot that is requested to be managed will get their own unique frame. This
     * reduces what textures and subframes need to be reloaded. For instance 3d models, portraits. 
     * 
     * Each Frame will be keyed on a Frame Manager by EntryID.  This should not cause performance issues as 
     * each player is limited to the number of NPC bots they can manage.  
     * 
     * @param player 
     * @param botdetails 
     * @returns 
     * @noSelf
     */
    function ShowBotFrame(botData: BotData) {

        let mainFrame: WoWAPI.Frame = null;         

        mainFrame = InfoFramePool.get(botData.entry);         

        if(mainFrame) { print('main frame already created'); }
        // Build the complete frame if we do not already have one in the pool. 
        if(!mainFrame) {
            mainFrame = CreateFrame("Frame", id("MainFrame"+botData.entry), UIParent, null, botData.entry);
            mainFrame.SetPoint("TOPLEFT", 300, -204);
            mainFrame.SetSize(384, 512);            
            mainFrame.SetFrameLevel(5);             
            mainFrame.SetMovable(true);
            mainFrame.EnableMouse(true);
            mainFrame.RegisterForDrag("LeftButton");
            mainFrame.SetScript("OnDragStart", mainFrame.StartMoving); 
            mainFrame.SetScript("OnHide", mainFrame.StopMovingOrSizing);     
            mainFrame.SetScript("OnDragStop", mainFrame.StopMovingOrSizing);            
            mainFrame.SetScript("OnEnter", (frame) => {                 
                botStorage.SetActive(frame.GetID());
                frame.SetFrameLevel(20); 
            });            
            mainFrame.SetScript("OnLeave", (frame) => {
                frame.SetFrameLevel(5);
            });
            
            // mainFrame.Hide(); 
            
            BotItemTooltip = CreateFrame("GameTooltip", id("ItemToolTip"+botData.entry), mainFrame, "GameTooltipTemplate", botData.entry);  
            BotItemTooltip.SetOwner(mainFrame, "ANCHOR_NONE");
            BotItemTooltip.Hide(); 

            // Build all elements of the frame on creation. 
            SetBackground(mainFrame);
            AddPortrait(mainFrame, botData);
            AddCharacterModel(mainFrame, botData);
            AddResistFrame(mainFrame);                    
            AddEquipmentFrames(mainFrame, botData);
            AddSoundEffects(mainFrame);

            InfoFramePool.set(botData.entry, mainFrame); 
            ComponentsPool.set(compId(botData.entry, "tooltip"), <WoWAPI.GameTooltip>BotItemTooltip); 

            // const button2 = CreateFrame("Button", id("CharacterNeckSlot"), mainFrame, "ItemButtonTemplate");
            // button2.SetPoint("TOP", button, "BOTTOM", 0, -3);        
            // button2.SetSize(40,40);
            
            // const [itemId, texture] = GetInventorySlotInfo(UIInvSlot.NECKSLOT);
    
            // const itemTexture2 = button2.CreateTexture(id("ItemTextureNeck"), "OVERLAY");
            // itemTexture2.SetTexture(texture);
            // itemTexture2.SetPoint("CENTER", 0, 0);
            // itemTexture2.SetSize(38,38);
                   


            // const leftEquipment = CreateFrame("Frame", id("LeftEquipment"), mainFrame);
            // leftEquipment.SetPoint("TOPLEFT", 20, -73);
            // leftEquipment.SetSize(40, 330);

            // const background = leftEquipment.CreateTexture(id("Background"), "OVERLAY");
            // background.SetTexture(0,0,0,0.7);
            // background.SetAllPoints(leftEquipment);

            // const button = CreateFrame("Button", id("CharacterHeadSlot"), leftEquipment, "ItemButtonTemplate");
            // button.SetPoint("TOPLEFT", 0, 0);        
            // button.SetSize(40,40);
            
            // const itemTexture = button.CreateTexture(id("ItemTextureHead"), "OVERLAY");
            // itemTexture.SetTexture(GetItemIcon(botData.equipment[BotEquipSlot.HEAD]));
            // itemTexture.SetPoint("CENTER", 0, 0);
            // itemTexture.SetSize(36,36);
                   
        } 

        mainFrame.Show();       
        
            
        // aio.Handle("BotMgr", "ParseBotEntry", UnitGUID("target"));
        // aio.Handle("BotMgr", "ShowComplexArray", { "one": 1, "two": 2, "three": 3 });


        // const headTex = GetItemIcon(botdetails.equipment[BotEquipSlot.HEAD]); 
        // print(headTex); 

        


        // const testTexture = itemFrame.CreateTexture(id("TestTexture"), "OVERLAY");
        // testTexture.SetTexture(GetItemIcon(2194));
        // // testTexture.SetSize(64,64);
        // testTexture.SetAllPoints(button);
        // testTexture.SetPoint("TOPLEFT", 0, 0);


        // SetItemButtonTexture(button, texture);
        
        // button.SetScript("OnLoad", (frame) => {
        //     const head = frame.CreateTexture("CharacterHeadSlotTexture", "ARTWORK");
        //     head.SetAllPoints(button);
        //     head.SetTexture(1,0,0,1);            
        // }); 

        


        //button.SetName("CharacterHeadSlot");






        
        // const frameCore = CreateFrame("Frame", "BotMgrCoreFrame", mainFrame);
        // frameCore.SetSize(600, 440);
        // frameCore.SetPoint("TOPLEFT", 0, 0);

        // const mainTexture = frameCore.CreateTexture("BotMgrMainFrameTexture", "BACKGROUND");        
        // mainTexture.SetAllPoints(frameCore);

        // const titleText = frameCore.CreateFontString("BotMgrTitle", "ARTWORK");
        // titleText.SetFont("Fonts\\FRIZQT__.TTF", 14, "OUTLINE");
        // titleText.SetPoint("TOP", 0, -5);
        // titleText.SetText(GetUnitName("target", false));

        // const unitTexture = frameChar.CreateTexture("BotMgrCharTexture", "BACKGROUND");
        // unitTexture.SetTexture(0, 0, 0);
        // unitTexture.SetAllPoints(frameChar);
         
    }

    botMgrHandlers.ShowFrame = (botData: BotData) => {              
        
        // Update the botData manager for this Bot on panel show. 
        botStorage.UpdateBotData(botData.entry, botData);
        ShowBotFrame(botData);     
    }   
}

