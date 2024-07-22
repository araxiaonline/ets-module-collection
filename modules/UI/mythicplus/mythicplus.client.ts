/** @ts-expect-error */
let aio: AIO = {};

import { MythicPlusState } from "./mythicplus.state";

if(!aio.AddAddon()) {

const mythicPlusHandlers = aio.AddHandlers('MythicPlus', {}); 

const selectImages = [
    "Interface/MythicPlus/mythic",
    "Interface/MythicPlus/mythic-selected",
    "Interface/MythicPlus/legendary",      
    "Interface/MythicPlus/legendary-selected",
    "Interface/MythicPlus/ascendant",
    "Interface/MythicPlus/ascendant-selected"
];

const Difficulty = {
    Mythic: 2,
    Legendary: 3,
    Ascendant: 4
};

const MPanelStyles = {   
    // Main Window Config     
    width: 538,
    height: 466,

    // Skull Frame Config
    skullAlpha: 0.65,
    skullWidth: 180,
    skullHeight: 180,
    fontFace: "Fonts\\MORPHEUS.ttf",
    fontSize: 16,

    // Text Panel Config for information text 
    infoWidth: 488,
    infoHeight: 240,
    infoFontFace: "Fonts\\FRIZQT__.ttf",
    infoFontSize: 14

};

const MPanelSounds = {
    open: "GAMEDIALOGOPEN",
    close: "GAMEDIALOGCLOSE",
    select: "PVPTHROUGHQUEUE"
}; 

let MythicUIPanel: WoWAPI.Frame; 
let MythicClientState: MythicPlusState = {
    difficulty: 0,
    groupId: -1,
    groupLeader: -1,
    inGroup: false,
    isLeader: false,
};

let Text = {
    MYTHIC_TITLE: `MYTHIC DUNGEON`,
    MYTHIC_DESC1: `Enemy Strength: x2`,
    MYTHIC_DESC2: `  - Level: 83`,
    MYTHIC_DESC3: `Potential Affixes: 0`,
    MYTHIC_DESC4: `Party Deaths: |cff1eff00 Unlimited`,
    MYTHIC_REWARD1: `Drops: |cff9F3FFF Epic up to 320`,
    MYTHIC_REWARD2: `Bonus Stats: Mid Tier`,

    LEGENDARY_TITLE: `LEGENDARY DUNGEON`,
    LEGENDARY_DESC1: `Enemy Strength: x3`,
    LEGENDARY_DESC2: `  - Level: 85`,
    LEGENDARY_DESC3: `Potential Affixes: 1`,
    LEGENDARY_DESC4: `Party Deaths: |cff1eff00 Unlimited`,
    LEGENDARY_REWARD1: `Drops: |cff9F3FFF Epic up to 340`,
    LEGENDARY_REWARD2: `Bonus Stats: High Tier`,

    ASCENDANT_TITLE: `ASCENDANT DUNGEON`,
    ASCENDANT_DESC1: `Enemy Strength: x5`,
    ASCENDANT_DESC2: `  - Level: 85 `,
    ASCENDANT_DESC3: `Potential Affixes: 2`,
    ASCENDANT_DESC4: `Party Deaths:|cffff0000 15 (Instance Reset at 0 lives)`,
    ASCENDANT_REWARD1: `Drops:|cffFF8400 Legendary up to 360 `,
    ASCENDANT_REWARD2: `Bonus Stats: Epic Tier`,

    DEFAULT_DESC1: `Harder difficulty dungeon not set.`,
    DEFAULT_DESC2: `Select a dungeon difficulty to view information.`
}

// These are used to store the textures and fonts for the Mythic+ UI panel so they can 
// be referenced in different functions
const MPTextures: Record<string, WoWAPI.Texture> = {};
const MPFonts: Record<string, WoWAPI.FontString> = {};

function refreshUIState() {
    updateInfoText(MythicClientState.selected);
    updateSkulls(MythicClientState.selected);
}

// Updates the skull images based on the selected difficulty passed in
function updateSkulls(selected: number): void {
    switch(selected) {
        case Difficulty.Mythic: {
            MPTextures[`SkullImg2`].SetTexture(selectImages[1]);
            MPTextures[`SkullImg3`].SetTexture(selectImages[2]);
            MPTextures[`SkullImg4`].SetTexture(selectImages[4]);
            MPTextures[`SkullImg3`].SetAlpha(MPanelStyles.skullAlpha);
            MPTextures[`SkullImg4`].SetAlpha(MPanelStyles.skullAlpha);            
            break;
        }
        case Difficulty.Legendary: {
            MPTextures[`SkullImg2`].SetTexture(selectImages[0]);
            MPTextures[`SkullImg3`].SetTexture(selectImages[3]);
            MPTextures[`SkullImg4`].SetTexture(selectImages[4]);
            MPTextures[`SkullImg2`].SetAlpha(MPanelStyles.skullAlpha);
            MPTextures[`SkullImg4`].SetAlpha(MPanelStyles.skullAlpha);                
            _G[`SkullFrame${Difficulty.Legendary}`].SetPoint("LEFT", `SkullFrame${Difficulty.Mythic}`, "RIGHT", -10,2);
            _G[`SkullFrame${Difficulty.Ascendant}`].SetPoint("LEFT", `SkullFrame${Difficulty.Legendary}`, "RIGHT", -10,-6);
            break;
        }
        case Difficulty.Ascendant: {
            MPTextures[`SkullImg2`].SetTexture(selectImages[0]);
            MPTextures[`SkullImg3`].SetTexture(selectImages[2]);
            MPTextures[`SkullImg4`].SetTexture(selectImages[5]);
            MPTextures[`SkullImg2`].SetAlpha(MPanelStyles.skullAlpha);
            MPTextures[`SkullImg3`].SetAlpha(MPanelStyles.skullAlpha);
            _G[`SkullFrame${Difficulty.Legendary}`].SetPoint("LEFT", `SkullFrame${Difficulty.Mythic}`, "RIGHT", -10,-2);
            _G[`SkullFrame${Difficulty.Ascendant}`].SetPoint("LEFT", `SkullFrame${Difficulty.Legendary}`, "RIGHT", -10,2);
            break;
        }

        default: {
            MPTextures[`SkullImg2`].SetTexture(selectImages[0]);
            MPTextures[`SkullImg3`].SetTexture(selectImages[2]);
            MPTextures[`SkullImg4`].SetTexture(selectImages[4]);
            MPTextures[`SkullImg2`].SetAlpha(MPanelStyles.skullAlpha);
            MPTextures[`SkullImg3`].SetAlpha(MPanelStyles.skullAlpha);
            MPTextures[`SkullImg4`].SetAlpha(MPanelStyles.skullAlpha);
            break;
        }
    }
}

// Updates the information text based on the selected difficulty passed in
function updateInfoText(difficulty: Difficulty) {
    const titleFont = MPFonts[`InfoTitle`];
    const descFont1 = MPFonts[`InfoDesc1`];
    const descFont2 = MPFonts[`InfoDesc2`];
    const descFont3 = MPFonts[`InfoDesc3`];
    const descFont4 = MPFonts[`InfoDesc4`];
    const reward1 = MPFonts[`Reward1`];
    const reward2 = MPFonts[`Reward2`];

    switch(difficulty) {
        case Difficulty.Mythic: {
            titleFont.SetText(Text.MYTHIC_TITLE);
            descFont1.SetText(Text.MYTHIC_DESC1);
            descFont2.SetText(Text.MYTHIC_DESC2);
            descFont3.SetText(Text.MYTHIC_DESC3);
            descFont4.SetText(Text.MYTHIC_DESC4);
            reward1.SetText(Text.MYTHIC_REWARD1);
            reward2.SetText(Text.MYTHIC_REWARD2);
            
            break;
        }
        case Difficulty.Legendary: {
            titleFont.SetText(Text.LEGENDARY_TITLE);
            descFont1.SetText(Text.LEGENDARY_DESC1);
            descFont2.SetText(Text.LEGENDARY_DESC2);
            descFont3.SetText(Text.LEGENDARY_DESC3);
            descFont4.SetText(Text.LEGENDARY_DESC4);
            reward1.SetText(Text.LEGENDARY_REWARD1);
            reward2.SetText(Text.LEGENDARY_REWARD2);

            break;
        }
        case Difficulty.Ascendant: {
            titleFont.SetText(Text.ASCENDANT_TITLE);
            descFont1.SetText(Text.ASCENDANT_DESC1);
            descFont2.SetText(Text.ASCENDANT_DESC2);
            descFont3.SetText(Text.ASCENDANT_DESC3);
            descFont4.SetText(Text.ASCENDANT_DESC4);
            reward1.SetText(Text.ASCENDANT_REWARD1);
            reward2.SetText(Text.ASCENDANT_REWARD2);

            break;
        }        

        default: {

            if(difficulty == 0) {
                titleFont.SetText("NORMAL DUNGEON");
            } else {
                titleFont.SetText("HEROIC DUNGEON");
            }

            descFont1.SetText(Text.DEFAULT_DESC1);
            descFont2.SetText("");
            descFont3.SetText(Text.DEFAULT_DESC2);
            descFont4.SetText("");
            reward1.SetText("None");
            reward2.SetText("");
            break;
        }
    }    
}


// Creates the information text for the Mythic+ UI panel
function CreateInfoText(parent: WoWAPI.Frame, difficulty: Difficulty = null): void {

    const infoFrame = CreateFrame("Frame", `MPInfoFrame`, parent);
    infoFrame.SetSize(MPanelStyles.infoWidth,MPanelStyles.infoHeight);
    infoFrame.SetPoint("TOPLEFT", parent, "TOPLEFT", 10,-218);

    const bgTexture = infoFrame.CreateTexture("InfoFrameBG", "BACKGROUND");
    bgTexture.SetAllPoints(infoFrame);
    bgTexture.SetTexture("Interface\\LFGFrame\\UI-LFG-BACKGROUND-HEROIC")        
    infoFrame.Show();

    const titleFont = infoFrame.CreateFontString("InfoTitle", "OVERLAY", "QuestTitleFontBlackShadow");
    titleFont.SetPoint("TOPLEFT", infoFrame, "TOPLEFT", 16, -16);    
    MPFonts[`InfoTitle`] = titleFont;

    const descFont1: WoWAPI.FontString = infoFrame.CreateFontString("InfoDesc1", "OVERLAY", "GameFontHighlight");
    descFont1.SetPoint("TOPLEFT", titleFont, "TOPLEFT", 0, -27);
    MPFonts[`InfoDesc1`] = descFont1;
    
    const descFont2 = infoFrame.CreateFontString("InfoDesc2", "OVERLAY", "GameFontHighlight");
    descFont2.SetPoint("LEFT", descFont1, "RIGHT", 0, 0);    
    descFont2.SetJustifyH("LEFT");
    MPFonts[`InfoDesc2`] = descFont2;

    const descFont3 = infoFrame.CreateFontString("InfoDesc3", "OVERLAY", "GameFontHighlight");
    descFont3.SetPoint("TOPLEFT", descFont1, "TOPLEFT", 0, -18);    
    descFont3.SetJustifyH("LEFT");
    MPFonts[`InfoDesc3`] = descFont3;

    const descFont4 = infoFrame.CreateFontString("InfoDesc4", "OVERLAY", "GameFontHighlight");
    descFont4.SetPoint("TOPLEFT", descFont3, "TOPLEFT", 0, -18);    
    descFont4.SetJustifyH("LEFT");
    MPFonts[`InfoDesc4`] = descFont4;

    const rewardTitle = infoFrame.CreateFontString("InfoTitleReward", "OVERLAY", "QuestTitleFontBlackShadow");
    rewardTitle.SetPoint("TOPLEFT", descFont4, "TOPLEFT", 0, -30);    
    rewardTitle.SetText("REWARDS");
    MPFonts[`RewardTitle`] = rewardTitle;

    const reward1: WoWAPI.FontString = infoFrame.CreateFontString("Reward1", "OVERLAY", "GameFontHighlight");
    reward1.SetPoint("TOPLEFT", rewardTitle, "TOPLEFT", 0, -27);
    MPFonts[`Reward1`] = reward1;

    const reward2 = infoFrame.CreateFontString("Reward2", "OVERLAY", "GameFontHighlight");
    reward2.SetPoint("TOPLEFT", reward1, "TOPLEFT", 0, -18);    
    reward2.SetJustifyH("LEFT");
    MPFonts[`Reward2`] = reward2;
}

// Creates the skull frames UI elements and artwork for the Mythic+ UI panel
function CreateSkullFrame(difficulty: Difficulty, title: string, imageIndex: number): void {

    const parent = _G["MythicPlusPanel"];    
    const MythicFrame = CreateFrame("Frame", `SkullFrame${difficulty}`, parent, null, difficulty);
    MythicFrame.SetSize(MPanelStyles.skullWidth, MPanelStyles.skullHeight);

    if(imageIndex === 0) {
        MythicFrame.SetPoint("TOPLEFT", 10, -29);
    } else {
        MythicFrame.SetPoint("LEFT", `SkullFrame${difficulty-1}`, "RIGHT", -10,-2);
        MythicFrame.SetFrameLevel(difficulty);
    }
    
    MythicFrame.EnableMouse(true); 
    MythicFrame.SetScript("OnEnter", function(f: WoWAPI.Frame) {            
        const texture = <WoWAPI.Texture>MPTextures[`SkullImg${difficulty}`];        
        texture.SetAlpha(1);                
    });
    MythicFrame.SetScript("OnLeave", function(f: WoWAPI.Frame) {
        if(MythicClientState.selected == f.GetID()) {
            return;
        }        
        const texture = <WoWAPI.Texture>MPTextures[`SkullImg${difficulty}`];
        texture.SetAlpha(MPanelStyles.skullAlpha);        
    });

    MythicFrame.SetScript("OnMouseDown", function(f: WoWAPI.Frame, button: string) {
        if(button != "LeftButton") {
            return;
        }
    
        PlaySound("PVPTHROUGHQUEUE");        

        if(MythicClientState.selected == f.GetID()) {
            MythicClientState.selected = 0;
            SetDungeonDifficulty(2);             
            refreshUIState();        
        } else {    
            MythicClientState.selected = f.GetID();
            SetDungeonDifficulty(2);       
        }

        aio.Handle("MythicPlus", "SetDifficulty", MythicClientState.selected);
        refreshUIState();        
    });

    const artTexture = MythicFrame.CreateTexture("MythicTexture", "ARTWORK");
    artTexture.SetAllPoints(MythicFrame);
    artTexture.SetTexture(selectImages[imageIndex]);
    artTexture.SetAlpha(0.80);    
    MPTextures[`SkullImg${difficulty}`] = artTexture;

    const titleFont = MythicFrame.CreateFontString("MythicText", "OVERLAY");
    titleFont.SetPoint("BOTTOM", MythicFrame, "BOTTOM", 0, 10);
    titleFont.SetFont(MPanelStyles.fontFace, MPanelStyles.fontSize, "THICKOUTLINE");
    titleFont.SetText(title);
}

function ShowUIPanel(): void {

    if(MythicUIPanel) {
        MythicUIPanel.Show();        
        return;
    }
    
    const mainFrame = CreateFrame("Frame", "MythicPlusPanel", UIParent, "UIPanelDialogTemplate");
    mainFrame.SetSize(MPanelStyles.width,MPanelStyles.height);
    mainFrame.SetPoint("TOPLEFT", UIParent, "LEFT", 17, 300);
    mainFrame.SetBackdrop({
        bgFile: "Interface/DialogFrame/UI-DialogBox-Background-Dark",
        edgeFile: "Interface/DialogFrame/UI-DialogBox-Border",
        tile: true,
        tileSize: 32,
        edgeSize: 32,
        insets: {
            left: 11,
            right: 12,
            top: 12,
            bottom: 11
        }
    });    
    mainFrame.EnableMouse(true);
    
    MythicUIPanel = mainFrame;    

    const bgTexture = mainFrame.CreateTexture("MythicBGTexture", "OVERLAY");
    bgTexture.SetAllPoints(mainFrame);
    bgTexture.SetTexture("Interface\\Buttons\\WHITE8X8")
    bgTexture.SetVertexColor(0.0, 0.0, 0.0, 0.8);
    bgTexture.SetSize(MPanelStyles.width,MPanelStyles.height);

    CreateSkullFrame(Difficulty.Mythic, "Mythic +", 0);
    CreateSkullFrame(Difficulty.Legendary, "Legendary ++", 2);
    CreateSkullFrame(Difficulty.Ascendant, "Ascendant +++", 4);

    // Create the info text frames (we could do this just swap the text but this will work easier for now. )
    CreateInfoText(mainFrame);

    mainFrame.Show();
}

mythicPlusHandlers.ShowUI = (state: MythicPlusState) : void => {    
    MythicClientState = state;
    ShowUIPanel(); 
    refreshUIState();    
}; 

mythicPlusHandlers.UpdateState = (state: MythicPlusState) : void => {
    MythicClientState = state;
    refreshUIState();
}

// Shows the button that opens the Mythic+ UI
function ShowUIButton(): void {
    const button = CreateFrame("Button", "MythicPlusButton", UIParent);
    button.SetSize(28, 58);
    button.SetPoint("TOPRIGHT", -25, -225);
    button.EnableMouse(true);
    // button.SetBackdrop({        
    //     edgeFile: "Interface/DialogFrame/UI-DialogBox-Border",
    //     tile: true,
    //     tileSize: 32,
    //     edgeSize: 32,
    //     insets: {
    //         left: 11,
    //         right: 12,
    //         top: 12,
    //         bottom: 11
    //     }
    // });    
    button.SetScript("OnClick", function(f: WoWAPI.Frame, button: string) {
        if(button != "LeftButton") {
            return;
        }
        PlaySound("GAMEDIALOGOPEN");
        mythicPlusHandlers.ShowUI();
    });

    // const btnBg = button.CreateTexture("MythicPlusButtonBG", "BACKGROUND");
    // btnBg.SetAllPoints(button);
    // btnBg.SetTexture("Interface\\Buttons\\WHITE8X8");
    // btnBg.SetVertexColor(0, 0, 0, 1);

    // const btnTexture = button.CreateTexture("MythicPlusButtonTexture", "ARTWORK");
    // btnTexture.SetPoint("CENTER", 0, 0);
    // btnTexture.SetSize(32, 32);
    // btnTexture.SetTexture(selectImages[0]);

    const btnTexture = button.CreateTexture("MythicPlusButtonTexture", "OVERLAY");
     btnTexture.SetTexture("Interface\\Buttons\\UI-MicroButton-Socials-Up");
    btnTexture.SetPoint("CENTER", 0, 0);
    btnTexture.SetSize(32, 32);
    // btnTexture.SetTexture(selectImages[0]);
}

ShowUIButton();
    

}