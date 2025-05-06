/** @ts-expect-error */
let aio: AIO = {}; 

const id = (name: string) => `MythicAdvUI_${name}`;

function GetComponent<T extends WoWAPI.Frame = WoWAPI.Frame>(name: string, type: string = "Frame"): T | null {
    const component = _G[id(name)];
    return component ? component as T : null;
}

import { colors } from "../../classes/ui-utils";
import { AdvancementState } from "./advancement_state";

/**
 * Advancement Name and Spell Reference
 *     
 *  ('80000001','spell_mp_titans_strength_aura'),
 *  ('80000002','spell_mp_steel_forged_aura'),
 *  ('80000003','spell_mp_celestial_grace_aura'),
 *  ('80000004','spell_mp_forbidden_knowledge_aura'),
 *  ('80000005','spell_mp_spectral_reflexes_aura'),
 *  ('80000006','spell_mp_eldritch_barrier_aura'),
 *  ('80000007','spell_mp_hellfire_shielding_aura'),
 *  ('80000008','spell_mp_primal_endurance_aura'),
 *  ('80000009','spell_mp_lichbane_aura'),
 *  ('80000010','spell_mp_glacial_fortress_aura');
 */

if (!aio.AddAddon()) {
    const upgradeUIHandlers = aio.AddHandlers("MythicAdvUI", {});
    const UpgradeUIFrames: Map<string, WoWAPI.Frame> = new Map();

    // const itemSlots: Map<number, string> = new Map();
    // let selectedDice: WoWAPI.Button | null = null;
    // let rolling: boolean = false;
    
    const mainWidth = 768;
    const mainHeight = 512; 
    const centerOffset = mainWidth / 2;

    // Load the advancement state based on the requested type for now just do magic type
    const advancementState = new AdvancementState();
    advancementState.SetType("Magic");

    const customTextures = {
        // frame background elements
        "bgFrame": "Interface\\AddOns\\MythicPlusData\\Textures\\mythic-adv-frame",
        "bgFrameHq": "Interface\\AddOns\\MythicPlusData\\Textures\\mythic-adv-frame-hq",
        "darkBg": "Interface\\AddOns\\MythicPlusData\\Textures\\DialogBox-Background-Dark",
        "diceFrame": "Interface\\AddOns\\MythicPlusData\\Textures\\advancement_frame",

        // advancement icons buttons
        "str": "Interface\\AddOns\\MythicPlusData\\Textures\\str_adv.tga",
        "agi": "Interface\\AddOns\\MythicPlusData\\Textures\\agi_adv.tga",
        "int": "Interface\\AddOns\\MythicPlusData\\Textures\\int_adv.tga",        
        "spr": "Interface\\AddOns\\MythicPlusData\\Textures\\spr_adv.tga",
        "sta": "Interface\\AddOns\\MythicPlusData\\Textures\\sta_adv.tga",
        "icon_overlay": "Interface\\AddOns\\MythicPlusData\\Textures\\icon_overlay.tga",
        "int_selected": "Interface\\AddOns\\MythicPlusData\\Textures\\int_adv_selected.tga",
        "spr_selected": "Interface\\AddOns\\MythicPlusData\\Textures\\spr_adv_selected.tga",    

        // Dice buttons
        "single_roll": "Interface\\AddOns\\MythicPlusData\\Textures\\single_roll.tga",
        "double_roll": "Interface\\AddOns\\MythicPlusData\\Textures\\double_roll.tga",
        "triple_roll": "Interface\\AddOns\\MythicPlusData\\Textures\\triple_roll.tga",
        "single_roll_selected": "Interface\\AddOns\\MythicPlusData\\Textures\\single_roll_selected.tga",
        "double_roll_selected": "Interface\\AddOns\\MythicPlusData\\Textures\\double_roll_selected.tga",
        "triple_roll_selected": "Interface\\AddOns\\MythicPlusData\\Textures\\triple_roll_selected.tga",
        
        // Advancement Bars 
        "bars": "Interface\\AddOns\\MythicPlusData\\Textures\\adv_bars.tga",

        // Roll Numbers
        "numbers": "Interface\\AddOns\\MythicPlusData\\Textures\\big_numbers.tga",
    }

    interface ItemSlot extends WoWAPI.Button {
        hasItem?: boolean;
        itemLink?: string;
    }

    function GetTexture(name: string): string  {
        return customTextures[name] || "";
    }
    
    function UpdateDiceVisibility(show: boolean): void {
        const buttons = ['single_roll', 'double_roll', 'triple_roll'];
        buttons.forEach(name => {
            const button = GetComponent<WoWAPI.Button>(`${name}_button`, "Button");
            if (button) {
                if (show) {
                    button.SetAlpha(0.8);
                    button.Enable();
                } else {
                    button.SetAlpha(0.0);
                    button.Disable();
                }
            }
        });
    }
    
    function SelectAdvancement(name: string, button: WoWAPI.Button): void {        
        
        // if the button click is itself, reset it
        if (advancementState.GetAdvancement() === name) {
            button.SetNormalTexture(GetTexture(name));
            advancementState.SetAdvancement(null);
            UpdateDiceVisibility(false);
        } else {
            // Set the new advancement
            button.SetNormalTexture(GetTexture(`${name}_selected`));
            
            // Handle opposing button
            const opposingStats = {
                'int': 'spr',
                'spr': 'int',
                'str': 'agi',
                'agi': 'str'
            };
            
            const opposingStat = opposingStats[name];
            if (opposingStat) {
                const opposingButton = GetComponent<WoWAPI.Button>(`${opposingStat}_button`, "Button");
                if (opposingButton) {
                    opposingButton.SetNormalTexture(GetTexture(opposingStat));
                }
            }

            // Update advancement state and show dice buttons
            advancementState.SetAdvancement(name);
            UpdateDiceVisibility(true);
        }
    }

    /**
     * Add icons icons used for advancement upgrades. 
     * @param frame Main Frame
     */
    function CreateAdvIcons(frame: WoWAPI.Frame): void {

        const ICON_POS_LEFT = 38;
        const ICON_POS_TOP = -150;

        let topIcon: string = "";
        let bottomIcon: string = "";
        let topText: string = "";
        let bottomText: string = "";

        if (advancementState.GetAdvType() === "Magic") {
            topIcon = "spr";
            bottomIcon = "int";
            topText = "Celestial Grace";
            bottomText = "Forbidden Knowledge";
        }
        else if (advancementState.GetAdvType() === "Attack") {
            topIcon = "str";
            bottomIcon = "agi";
            topText = "Titan's Strength";
            bottomText = "Spectral Reflexes";
        }
        else if (advancementState.GetAdvType() === "Defense") {
            topIcon = "sta";  
            topText = "Steel Forged"          
        }
        
        const topButton = CreateFrame("Button", id(`${topIcon}_button`), frame);
        topButton.SetSize(132, 132);
        topButton.SetPoint("TOPLEFT", ICON_POS_LEFT, ICON_POS_TOP);
        topButton.SetNormalTexture(GetTexture(topIcon));
        topButton.SetHighlightTexture(GetTexture("icon_overlay"));      
        topButton.SetScript("OnClick", function(self: WoWAPI.Button) {            
            SelectAdvancement(topIcon, self);
        });                   
        
        topButton.Show();

        const bottomButton = CreateFrame("Button", id(`${bottomIcon}_button`), frame);
        bottomButton.SetSize(132, 132);
        bottomButton.SetPoint("TOPLEFT", topButton, "BOTTOMLEFT", 0, -20);
        bottomButton.SetNormalTexture(GetTexture(bottomIcon));
        bottomButton.SetHighlightTexture(GetTexture("icon_overlay"));            
        bottomButton.SetScript("OnClick", function(self: WoWAPI.Button) {            
            SelectAdvancement(bottomIcon, self);
        });
        
        bottomButton.Show();

        // Add advancement bars
        const topbarTexture = frame.CreateTexture(id("topbar_gold"), "ARTWORK");
        topbarTexture.SetPoint("LEFT", topButton, "RIGHT", -4, -10);
        topbarTexture.SetSize(187, 37);
        topbarTexture.SetTexture(GetTexture("bars"));
        topbarTexture.SetTexCoord(36/256, 218/256, 0/256, 37/256);

        const bottombarTexture = frame.CreateTexture(id("bottombar_gold"), "ARTWORK");
        bottombarTexture.SetPoint("LEFT", bottomButton, "RIGHT", -4, -10);
        bottombarTexture.SetSize(187, 37);
        bottombarTexture.SetTexture(GetTexture("bars"));
        bottombarTexture.SetTexCoord(36/256, 218/256, 0/256, 37/256);
 
        const topbarText = frame.CreateFontString(id("topbar_text"), "OVERLAY");
        topbarText.SetPoint("CENTER", topbarTexture, "CENTER", 0, 33);
        topbarText.SetTextColor(1, 1, 1, 1)  // White
        topbarText.SetFont("Fonts\\FRIZQT__.TTF", 16)
        topbarText.SetText(topText);

        const bottombarText = frame.CreateFontString(id("bottombar_text"), "OVERLAY");
        bottombarText.SetPoint("CENTER", bottombarTexture, "CENTER", 0, 33);
        bottombarText.SetTextColor(1, 1, 1, 1)  // White
        bottombarText.SetFont("Fonts\\FRIZQT__.TTF", 16)
        bottombarText.SetText(bottomText);
    }

    /**
     * 
     */

    /**
     * Creates the dice roll buttons that appear below the roll frame
     * @param frame Main Frame
     * @param rollFrame The frame containing the roll numbers
     */
    function CreateDiceButtons(frame: WoWAPI.Frame, rollFrame: WoWAPI.Frame): void {
        const buttonWidth = 72;
        const buttonHeight = 72;
        const spacing = 20;
        const totalWidth = (buttonWidth * 3) + (spacing * 2);
        const startX = -(totalWidth / 2) + (buttonWidth / 2);
        
        const buttons = [
            { name: 'single_roll', rolls: 1 },
            { name: 'double_roll', rolls: 2 },
            { name: 'triple_roll', rolls: 3 }
        ];

        let selectedButton = GetComponent<WoWAPI.Button>("selected_dice_button", "Button");

        buttons.forEach((buttonInfo, index) => {
            const buttonId = `${buttonInfo.name}_button`;
            let button = GetComponent<WoWAPI.Button>(buttonId, "Button");
            
            if (!button) {
                button = CreateFrame("Button", id(buttonId), frame) as WoWAPI.Button;
                button.SetSize(buttonWidth, buttonHeight);
                button.SetPoint("TOP", rollFrame, "BOTTOM", startX + (index * (buttonWidth + spacing)), -75);

                const normalTexture = button.CreateTexture(null, "BACKGROUND");
                normalTexture.SetTexture(GetTexture(buttonInfo.name));
                normalTexture.SetAllPoints(button);
                button.SetNormalTexture(normalTexture);

                const highlightTexture = button.CreateTexture(null, "HIGHLIGHT");
                highlightTexture.SetTexture(GetTexture(`${buttonInfo.name}_selected`));
                highlightTexture.SetAllPoints(button);
                button.SetHighlightTexture(highlightTexture);
                
                // Start hidden by default
                button.SetAlpha(0.0);
                button.SetScript("OnClick", function() {
                    if (selectedButton) {
                        const prevButtonInfo = buttons.find(b => b.name === selectedButton.GetName().split('_')[0]);
                        if (prevButtonInfo) {
                            selectedButton.SetNormalTexture(GetTexture(prevButtonInfo.name));
                        }
                    }
                    
                    if (selectedButton === button) {
                        selectedButton = null;
                    } else {
                        selectedButton = button;
                        button.SetNormalTexture(GetTexture(`${buttonInfo.name}_selected`));
                        // Here you would typically trigger the roll with the number of dice
                        frame["rollNumbers"](buttonInfo.rolls, 25 * buttonInfo.rolls);
                    }
                });
            }
        });

        // Ensure buttons are hidden/shown based on current advancement state
        UpdateDiceVisibility(advancementState.GetAdvancement() !== null);
    }

    /**
     * Add title text to the frame.
     * @param frame Main Frame
     */
    function AddTitle(frame: WoWAPI.Frame): void {
        // Add title text
        const titleBar = frame.CreateFontString(id("TitleBar"), "OVERLAY");
        titleBar.SetPoint("TOP", -150, -40);
        titleBar.SetTextColor(1, 0.84, 0, 1)  // Golden yellow
        titleBar.SetFont("Interface/Modules/MythicPlus/Fonts/NOTO.TTF", 16)
        titleBar.SetText(`Mythic Upgrades`);
    }

    /**
     * This adds in the big numbers that will flash to simulate a dice rolls... 
     * even though the dice roll actually happens on the server in the module. 
     * @param frame 
     */
    function ShowRollNumbers(frame: WoWAPI.Frame): void {

        let rollFrame = GetComponent("roll_frame");
        if (!rollFrame) {
            rollFrame = CreateFrame("Frame", id("roll_frame"), frame);
            rollFrame.SetSize(120, 120);
            rollFrame.SetPoint("CENTER", 200, -24);
            rollFrame.SetBackdrop({
                bgFile: GetTexture("darkBg"),                
                tile: false,
                tileSize: 120,
                insets: { left: 1, right: 1, top: 1, bottom: 1 },   
            });
            rollFrame.SetBackdropColor(0, 0, 0, 0.3);  // RGB + alpha
        }
        rollFrame.Show();

        // create a texture that will change the graphic every few seconds between 1-25 using big_number tga
        // for numbers greater than 9 it will need to add to smaller textures. Below are coordinates of the 
        // big_number tga [UL, UR, LL, LR]

        const coords: {[key: number]: number[]} = {
            0: [35, 96, 8, 81],
            1: [174, 210, 8, 81],
            2: [292, 345, 8, 81],
            3: [424, 472, 8, 81],
            4: [33, 95, 98, 163],
            5: [167, 217, 98, 163],
            6: [291, 346, 98, 163],
            7: [425, 471, 98, 163],
            8: [38, 89, 182, 247],
            9: [165, 218, 182, 247],
        }

        let currentTextures: WoWAPI.Texture[] = [];

        function clearTextures() {
            currentTextures.forEach(texture => {
                texture.Hide();
                texture.ClearAllPoints();
            });
            currentTextures = [];
        }

        function createNumberTexture(digit: number, xOffset: number = 0) {
            const rollTexture = rollFrame.CreateTexture(null, "ARTWORK");
            rollTexture.SetSize(60, 60);
            rollTexture.SetPoint("CENTER", rollFrame, "CENTER", xOffset, 0);
            rollTexture.SetTexture(GetTexture("numbers"));


            if (coords[digit]) {
                rollTexture.SetTexCoord(
                    coords[digit][0] / 512, 
                    coords[digit][1] / 512, 
                    coords[digit][2] / 256, 
                    coords[digit][3] / 256
                );
            }
            currentTextures.push(rollTexture);
            return rollTexture;
        }

        function showNumber(num: number) {
            clearTextures();
            if (num >= 10) {
                const tens = Math.floor(num / 10);
                const ones = num % 10;
                createNumberTexture(tens, -30).Show();
                createNumberTexture(ones, 30).Show();
            } else {
                createNumberTexture(num, 0).Show();  // Explicitly set offset to 0 for single digits
            }
        }

        let rolling = false;
        let lastUpdate = 0;

        // Make rollNumbers accessible on the frame for external calls
        frame["rollNumbers"] = function(min: number, max: number, duration: number = 2000) {
            if (rolling) return;
            clearTextures();
            rolling = true;
            let elapsed = 0;
            
            frame.SetScript("OnUpdate", function(_, deltaTime) {
                elapsed = elapsed + deltaTime * 1000;
                lastUpdate += deltaTime * 1000;
                
                // Update number every 100ms
                if (lastUpdate >= 100) {
                    lastUpdate = 0;
                    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                    showNumber(randomNum);
                }
                
                if (elapsed >= duration) {
                    frame.SetScript("OnUpdate", null);
                    rolling = false;
                }
            });
        }
    }

    /**
     * Create the main upgrade window frame.
     * @returns Main Frame
     */
    function CreateUpgradeWindow(state: AdvancementState): WoWAPI.Frame {

        // Main frame creation 
        const frame = CreateFrame("Frame", id("main"), UIParent);
        frame.SetSize(mainWidth, mainHeight);
        frame.SetPoint("CENTER");
        frame.SetMovable(true);
        frame.EnableMouse(true);
        frame.RegisterForDrag("LeftButton");
        frame.SetScript("OnDragStart", frame.StartMoving);
        frame.SetScript("OnDragStop", frame.StopMovingOrSizing);
        frame.SetFrameLevel(100);  // Set high frame level to stay on top
        
        // Background texture
        const bgTexture = frame.CreateTexture(id("background"), "BACKGROUND");
        bgTexture.SetPoint('TOPLEFT');
        bgTexture.SetWidth(mainWidth);
        bgTexture.SetHeight(mainHeight);
        bgTexture.SetTexture(GetTexture("bgFrameHq"));
        bgTexture.SetTexCoord(0, 768/1024, 0, 1);  // Show 75% of width (768/1024) and full height 
 
        // Add components
        CreateAdvIcons(frame);
        AddTitle(frame);
        ShowRollNumbers(frame);
        


        const rollFrame = GetComponent("roll_frame");
        if (rollFrame) {            
            CreateDiceButtons(frame, rollFrame);
        }
       
        return frame;
    }
        
        // Remove the template's close button
        // const templateCloseButton = frame.GetChildren()[0] as WoWAPI.Frame;
        // if (templateCloseButton) {
        //     templateCloseButton.Hide();
        // }
        
        // Add our custom close button
        // const closeButton = CreateFrame("Button", id("CloseButton"), frame, "UIPanelCloseButton");
        // closeButton.SetPoint("TOPRIGHT", -5, -5);
        // closeButton.SetScript("OnClick", () => {
        //     frame.Hide();
        // });
        
        // Header Row: Skill Icons & Ranks
        // for (let i = 0; i < 3; i++) {
        //     const skillFrame = CreateFrame("Frame", id(`Skill_${i}`), frame);
        //     skillFrame.SetSize(64, 64);
        //     skillFrame.SetPoint("TOP", -125 + i * 125, -55);

        //     const skillIcon = skillFrame.CreateTexture(id(`SkillIcon_${i}`), "ARTWORK");
        //     skillIcon.SetTexture("Interface\\Icons\\INV_Misc_QuestionMark");
        //     skillIcon.SetAllPoints();
            
        //     const skillName = skillFrame.CreateFontString(id(`SkillName_${i}`), "OVERLAY", "GameFontNormalLarge");
        //     skillName.SetPoint("TOP", skillFrame, "BOTTOM", 0, -5);
        //     skillName.SetText(`Skill ${i + 1}`);
            
        //     const skillRank = skillFrame.CreateFontString(id(`SkillRank_${i}`), "OVERLAY", "GameFontHighlightLarge");
        //     skillRank.SetPoint("TOP", skillName, "BOTTOM", 0, -2);
        //     skillRank.SetText("0 / 50");
        // }
                
        // Add a new texture in the middle of the frame that is 512x512 and the middle layer
        // const centerTexture = frame.CreateTexture(id("DiceTextureBack"), "ARTWORK");
        // centerTexture.SetDrawLayer("ARTWORK", 3);
        // centerTexture.SetSize(128, 128);
        // centerTexture.SetPoint("CENTER", frame, "CENTER", 0, -20);
        // centerTexture.SetTexture("Interface\\MythicPlus\\adv-dice-light.blp");

        // const circleTexture = frame.CreateTexture(id("DiceTextureBack"), "BACKGROUND");
        // circleTexture.SetDrawLayer("ARTWORK", 5);
        // circleTexture.SetSize(512, 512);
        // circleTexture.SetAlpha(0.20);
        // circleTexture.SetPoint("CENTER", frame, "CENTER", 0, -20);
        // circleTexture.SetTexture("Interface\\MythicPlus\\gold-circle.blp");
        
        // // Add a glowing effect behind the dice
        // const glowTexture = frame.CreateTexture(id("DiceGlow"), "ARTWORK");
        // glowTexture.SetDrawLayer("ARTWORK", -2);
        // glowTexture.SetSize(300, 300);
        // glowTexture.SetPoint("CENTER", centerTexture, "CENTER", 0, 0);
        // glowTexture.SetTexture("Interface\\GLUES\\MODELS\\UI_MainMenu_Legion\\UI_MainMenu_Legion3");
        // glowTexture.SetAlpha(0.3);

        // Roll Display with better font handling
        // const rollDisplay = frame.CreateFontString(id("RollDisplay"),"ARTWORK");
        // rollDisplay.SetFont("Interface\\MythicPlus\\NOTO.TTF", 256, "THICKOUTLINE");
        // rollDisplay.SetPoint("CENTER", frame, "CENTER", 0, -80);        
        // rollDisplay.SetTextColor(1, 0.84, 0, 1); // More golden yellow color
        // rollDisplay.SetText("-");
        

        // Dice Multipliers with Selection Logic
        // const diceMultipliers = ["1x", "2x", "3x"];              
        // for (let k = 0; k < diceMultipliers.length; k++) {
        //     const diceButton = CreateFrame("Button", id(`Dice_${k}`), frame);
        //     diceButton.SetSize(24, 24);
        //     diceButton.SetPoint("TOPLEFT", 150 + (k * 30), -450);
            
        //     const diceText = diceButton.CreateFontString(id(`DiceText_${k}`), "OVERLAY", "GameFontHighlight");
        //     diceText.SetPoint("CENTER", diceButton, "CENTER", 0, 0);
        //     diceText.SetText(diceMultipliers[k]);
            
        //     diceButton.SetScript("OnClick", function() {
        //         if (selectedDice) {
        //             selectedDice.SetAlpha(1.0); // Reset previous selection
        //         }
        //         selectedDice = diceButton;
        //         selectedDice.SetAlpha(1.5); // Glow effect
        //     });
        // }
        
        // Roll Button with animation logic
        // const rollButton = CreateFrame("Button", id("RollButton"), frame, "UIPanelButtonTemplate");
        // rollButton.SetSize(100, 30);
        // rollButton.SetPoint("BOTTOM", frame, "BOTTOM", 0, 50);
        // rollButton.SetText("Roll");
        
        // function rollDice(min: number, max: number, duration: number = 5000) {
        //     if (rolling) return;
        //     rolling = true;
        //     let elapsed = 0;
        //     let lastUpdate = 0;
            
        //     frame.SetScript("OnUpdate", function(_, deltaTime) {
        //         elapsed = elapsed + deltaTime * 5000;
        //         lastUpdate += deltaTime * 1000;
                
        //         // Only update every 200ms to slow down the rolling animation
        //         if (lastUpdate >= 100) {
        //             lastUpdate = 0;
        //             rollDisplay.SetText(`${Math.floor(Math.random() * (max - min + 1)) + min}`);
        //         }
                
        //         if (elapsed >= duration) {
        //             frame.SetScript("OnUpdate", null);
        //             rolling = false;
        //             // Set final roll
        //             rollDisplay.SetText(`${Math.floor(Math.random() * (max - min + 1)) + min}`);
        //         }
        //     });
        // }

        // rollButton.SetScript("OnClick", function() {
        //     rollDice(2, 23); // Default to 2-23 range for backward compatibility
        // });
        
        // Roll History
        // const historyFrame = CreateFrame("Frame", id("HistoryFrame"), frame);
        // historyFrame.SetSize(380, 80);
        // historyFrame.SetPoint("BOTTOM", frame, "BOTTOM", 0, 10);
        
        // const historyText = historyFrame.CreateFontString(id("HistoryText"), "OVERLAY", "GameFontHighlight");
        // historyText.SetPoint("TOPLEFT", historyFrame, "TOPLEFT", 10, -10);        
        // historyText.SetText("Roll History:");
        

    let frame: WoWAPI.Frame | undefined = undefined;
    
    if(!UpgradeUIFrames.has(advancementState.GetAdvType())) {
       // frame = CreateUpgradeWindow(advancementState);
    } else {
        // if we have the frame already show it
       // frame = UpgradeUIFrames.get(advancementState.GetAdvType());
    }

    // For debugging purposes show the window
    //frame.Show();

    // Triggered from ths server to be set up later 
    upgradeUIHandlers.ShowUpgradeWindow = () => {
        // if (!UpgradeUIFrames.has(1)) {
        //     CreateUpgradeWindow();
        // }
        // UpgradeUIFrames.get(1).Show();        
    };
}
