/** @noSelfInFile **/
/** @ts-expect-error */
let aio: AIO = {}; 

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
 *  ('80000009','spell_mp_lichs_bane_aura'),
 *  ('80000010','spell_mp_glacial_fortress_aura');
 */
import { AdvanceState, PlayerAdvancement, AdvancementType } from "./advstate";
import { CreateItemButton, EscapeCloseable, MakeDraggable } from "../../classes/ui-utils";
import { rollDice } from "../../classes/server-utils";


if (!aio.AddAddon()) {

    // Frame Map of all frames being used. 
    const UpgradeUIFrames: Map<string, WoWAPI.Frame> = new Map();

    // Handler Map for all event Handlers from server
    const AdvanceUIHandlers = aio.AddHandlers('MythicAdvUI', {}); 

    // Application State 
    const advancementState = new AdvanceState();

    const id = (name: string) => {
        const advType = advancementState.GetAdvType();
        if(!advType) {
            return `MythicAdvUI_${name}`;
        }
        return `MythicAdvUI_${name}_${advType}`;
    };

    function GetComponent<T extends WoWAPI.Frame = WoWAPI.Frame>(name: string, type: string = "Frame"): T | null {
        const component = _G[id(name)];
        return component ? component as T : null;
    }
    
    function GetAnyComponent<T>(name: string): T | null {
        const component = _G[id(name)];
        return component ? component as T : null;
    }
    

    // UI Configuration Settings 
    const mainWidth = 768;
    const mainHeight = 512; 
    const centerOffset = mainWidth / 2;

    function SendServerEvent(method: string, args: any[]): void {

        const playerGuid = advancementState.GetPlayerGuid();

        let message = ""; 
        message += `p|${playerGuid}|`;
        message += `${method}|`;

        for(let i = 0; i < args.length; i++) {
            message += `${args[i]}|`;
        }
        // remove last pipe
        message = message.slice(0, -1);

        SendAddonMessage("MPUi", message, "WHISPER", GetUnitName("player", false));
    }


    const customTextures = {
        // frame background elements
        "bgFrame": "Interface\\Modules\\MythicPlus\\Textures\\mythic-adv-frame",
        "bgFrameHq": "Interface\\Modules\\MythicPlus\\Textures\\mythic-adv-frame-hq",
        "darkBg": "Interface\\Modules\\MythicPlus\\Textures\\DialogBox-Background-Dark",
        "diceFrame": "Interface\\Modules\\MythicPlus\\Textures\\advancement_frame",

        // advancement icons buttons
        "str": "Interface\\Modules\\MythicPlus\\Textures\\str_adv.tga",
        "agi": "Interface\\Modules\\MythicPlus\\Textures\\agi_adv.tga",
        "int": "Interface\\Modules\\MythicPlus\\Textures\\int_adv.tga",        
        "spr": "Interface\\Modules\\MythicPlus\\Textures\\spr_adv.tga",
        "sta": "Interface\\Modules\\MythicPlus\\Textures\\sta_adv.tga",
        "fire": "Interface\\Modules\\MythicPlus\\Textures\\fire_adv.tga",
        "frost": "Interface\\Modules\\MythicPlus\\Textures\\frost_adv.tga",
        "nature": "Interface\\Modules\\MythicPlus\\Textures\\nature_adv.tga",
        "arcane": "Interface\\Modules\\MythicPlus\\Textures\\arcane_adv.tga",
        "shadow": "Interface\\Modules\\MythicPlus\\Textures\\shadow_adv.tga",
        "icon_overlay": "Interface\\Modules\\MythicPlus\\Textures\\icon_overlay.tga",
        "int_selected": "Interface\\Modules\\MythicPlus\\Textures\\int_adv_selected.tga",
        "spr_selected": "Interface\\Modules\\MythicPlus\\Textures\\spr_adv_selected.tga",  
        "sta_selected": "Interface\\Modules\\MythicPlus\\Textures\\sta_adv_selected.tga",  
        "str_selected": "Interface\\Modules\\MythicPlus\\Textures\\str_adv_selected.tga",  
        "agi_selected": "Interface\\Modules\\MythicPlus\\Textures\\agi_adv_selected.tga",    
        "fire_selected": "Interface\\Modules\\MythicPlus\\Textures\\fire_adv_selected.tga",    
        "frost_selected": "Interface\\Modules\\MythicPlus\\Textures\\frost_adv_selected.tga",    
        "nature_selected": "Interface\\Modules\\MythicPlus\\Textures\\nature_adv_selected.tga",    
        "arcane_selected": "Interface\\Modules\\MythicPlus\\Textures\\arcane_adv_selected.tga",    
        "shadow_selected": "Interface\\Modules\\MythicPlus\\Textures\\shadow_adv_selected.tga",    
        

        // Dice buttons
        "single_roll": "Interface\\Modules\\MythicPlus\\Textures\\single_roll.tga",
        "double_roll": "Interface\\Modules\\MythicPlus\\Textures\\double_roll.tga",
        "triple_roll": "Interface\\Modules\\MythicPlus\\Textures\\triple_roll.tga",
        "single_roll_selected": "Interface\\Modules\\MythicPlus\\Textures\\single_roll_selected.tga",
        "double_roll_selected": "Interface\\Modules\\MythicPlus\\Textures\\double_roll_selected.tga",
        "triple_roll_selected": "Interface\\Modules\\MythicPlus\\Textures\\triple_roll_selected.tga",
        
        // Advancement Bars 
        "bars": "Interface\\Modules\\MythicPlus\\Textures\\adv_bars.tga",

        // Roll Numbers
        "numbers": "Interface\\Modules\\MythicPlus\\Textures\\big_numbers.tga",

        // Buttons 
        "close_button": "Interface\\Buttons\\UI-Panel-MinimizeButton-Up",
        "close_button_hl": "Interface\\Buttons\\UI-Panel-MinimizeButton-Highlight",
        "close_button_pushed": "Interface\\Buttons\\UI-Panel-MinimizeButton-Down"
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

    function UpdateCostVisibility(show: boolean): void {
        const costFrame = GetComponent<WoWAPI.Frame>("cost_frame", "Frame");
        if(costFrame) {
            costFrame.SetAlpha(show ? 1.0 : 0.0);
        }
    }
    
    function SelectAdvancement(name: string, button: WoWAPI.Button): void {        
    
        // if the button click is itself, reset it
        if (advancementState.GetAdvancement() === name) {
            AIO_debug("Resetting advancement");

            button.SetNormalTexture(GetTexture(name));
            advancementState.SetAdvancement(null);
            UpdateDiceVisibility(false);
            UpdateCostVisibility(false);
        } else {
            // Set the new advancement
            button.SetNormalTexture(GetTexture(`${name}_selected`));
            
            // Handle opposing button
            const opposingStats = {
                'int': 'spr',
                'spr': 'int',
                'str': 'agi',
                'agi': 'str',
                'fire': 'frost',
                'frost': 'fire',
                'nature': 'arcane',
                'arcane': 'nature',                
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
            aio.Handle("MythicAdvUI", "GetNextLevelCost", advancementState.GetAdvancementId());

            UpdateCostVisibility(true);
            UpdateDiceVisibility(true);
        }
    }

    // Advancement bar creation and update logic
    function CreateAdvColorBar(frame: WoWAPI.Frame, goldBar: WoWAPI.Texture, uniqId: string ): void {
        let bar = GetAnyComponent<WoWAPI.Texture>(`adv_bar_${uniqId}`);
        if(!bar) {
            bar = frame.CreateTexture(id(`adv_bar_${uniqId}`), "ARTWORK");
            bar.SetPoint("LEFT", goldBar, "LEFT", 27, 0);
            bar.SetSize(1, 25); // Default/empty
            bar.SetTexture(GetTexture("bars"));
            bar.SetTexCoord(58/256, 142/256, 85/256, 101/256); // Default lowest bar
        }
    }

    function UpdateAdvColorBar(uniqId: string, rank: number): void {
        let percent = rank / 50;
        let coords: number[];
        if(percent >= 0.67) {
            coords = [58/256, 142/256, 42/256, 61/256];  // green
        } else if(percent >= 0.33 && percent < 0.67) {
            coords = [58/256, 142/256, 64/256, 81/256]; // yellow
        } else {
            coords = [58/256, 142/256, 85/256, 101/256]; // red
        }
        let width = Math.round(167 * percent);
        if(width === 0) width = 1;

        let bar = GetAnyComponent<WoWAPI.Texture>(`adv_bar_${uniqId}`);
        if(bar) {
            bar.SetSize(width, 25);
            bar.SetTexCoord(coords[0], coords[1], coords[2], coords[3]);
        } else {
            AIO_debug(`Could not find bar ${uniqId}`);
        }
    }
    // This will create the advancement color bars that show player progress


    // /**
    //  * Add icons icons used for advancement upgrades. 
    //  * @param frame Main Frame
    //  */
    function CreateAdvIcons(frame: WoWAPI.Frame): void {

        const ICON_POS_LEFT = 38;
        const ICON_POS_TOP = -150;

        let topIcon: string = "";
        let bottomIcon: string = "";
        let topText: string = "";
        let bottomText: string = "";

        if (advancementState.GetAdvType() === "Magic") {
            topIcon = "int";
            bottomIcon = "spr";            
            topText = "Forbidden Knowledge";
            bottomText = "Celestial Grace";
            
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
        else if (advancementState.GetAdvType() === "FireFrost") {
            topIcon = "fire";
            bottomIcon = "frost";
            topText = "Hellfire Shielding";
            bottomText = "Glacial Fortress";
        }
        else if (advancementState.GetAdvType() === "NatureArcane") {
            topIcon = "nature";
            bottomIcon = "arcane";
            topText = "Primal Endurance";
            bottomText = "Eldritch Barrier";
        }
        else if (advancementState.GetAdvType() === "Shadow") {
            topIcon = "shadow";
            topText = "Lich's Bane";
        }
        
        const topButton = CreateFrame("Button", id(`${topIcon}_button`), frame);
        topButton.SetSize(132, 132);
        topButton.SetPoint("TOPLEFT", ICON_POS_LEFT, ICON_POS_TOP);
        topButton.SetNormalTexture(GetTexture(topIcon));
        topButton.SetHighlightTexture(GetTexture("icon_overlay"));      
        topButton.SetScript("OnClick", function(self: WoWAPI.Button) {            
            PlaySound("GLUESCREENLARGEBUTTONMOUSEDOWN");
            SelectAdvancement(topIcon, self);
        });                   
        
        topButton.Show();

        const bottomButton = CreateFrame("Button", id(`${bottomIcon}_button`), frame);
        bottomButton.SetSize(132, 132);
        bottomButton.SetPoint("TOPLEFT", topButton, "BOTTOMLEFT", 0, -20);
        bottomButton.SetNormalTexture(GetTexture(bottomIcon));
        bottomButton.SetHighlightTexture(GetTexture("icon_overlay"));            
        bottomButton.SetScript("OnClick", function(self: WoWAPI.Button) {            
            PlaySound("GLUESCREENLARGEBUTTONMOUSEDOWN");
            SelectAdvancement(bottomIcon, self);
        });
        
        bottomButton.Show();

        // Add advancement bars
        const topbarTexture = frame.CreateTexture(id("topbar_gold"), "OVERLAY");
        topbarTexture.SetPoint("LEFT", topButton, "RIGHT", -4, -10);
        topbarTexture.SetSize(187, 37);
        topbarTexture.SetTexture(GetTexture("bars"));
        topbarTexture.SetTexCoord(36/256, 218/256, 0/256, 37/256);

        const bottombarTexture = frame.CreateTexture(id("bottombar_gold"), "OVERLAY");
        bottombarTexture.SetPoint("LEFT", bottomButton, "RIGHT", -4, -10);
        bottombarTexture.SetSize(187, 37);
        bottombarTexture.SetTexture(GetTexture("bars"));
        bottombarTexture.SetTexCoord(36/256, 218/256, 0/256, 37/256);

        // Always create the advancement bars here (default visuals)
        CreateAdvColorBar(frame, topbarTexture, "top");
        CreateAdvColorBar(frame, bottombarTexture, "bottom");

 
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

        // Add placeholder for current rank: 
        const topbarRankText = frame.CreateFontString(id("topbar_rank"), "OVERLAY");
        topbarRankText.SetPoint("CENTER", topButton, "CENTER", 3, -66);
        topbarRankText.SetTextColor(1, 1, 1, 1)  // White
        topbarRankText.SetFont("Fonts\\FRIZQT__.TTF", 14)
        topbarRankText.SetText("Rank: ");

        const bottombarRankText = frame.CreateFontString(id("bottombar_rank"), "OVERLAY");
        bottombarRankText.SetPoint("CENTER", bottomButton, "CENTER", 3, -66);
        bottombarRankText.SetTextColor(1, 1, 1, 1)  // White
        bottombarRankText.SetFont("Fonts\\FRIZQT__.TTF", 14)
        bottombarRankText.SetText("Rank: ");

        const topbarRankBonusText = frame.CreateFontString(id("topbar_bonus"), "OVERLAY");
        topbarRankBonusText.SetPoint("CENTER", topbarTexture, "CENTER", 0, -27);
        topbarRankBonusText.SetFont("Fonts\\FRIZQT__.TTF", 13)
        topbarRankBonusText.SetTextColor(1, 0.84, 0, 1)  // Golden yellow
        topbarRankBonusText.SetText(`Bonus: `);

        const bottombarRankBonusText = frame.CreateFontString(id("bottombar_bonus"), "OVERLAY");
        bottombarRankBonusText.SetPoint("CENTER", bottombarTexture, "CENTER", 0, -27);
        bottombarRankBonusText.SetFont("Fonts\\FRIZQT__.TTF", 13)
        bottombarRankBonusText.SetTextColor(1, 0.84, 0, 1)  // Golden yellow
        bottombarRankBonusText.SetText(`Bonus: `)   ;        

    }

    function CreateCostFrame(frame: WoWAPI.Frame): void {

        const myWidth = 300;
        let costFrame = GetComponent("cost_frame");
        if(!costFrame) {
            costFrame = CreateFrame("Frame", id("cost_frame"), frame);
            costFrame.SetSize(myWidth, 68);
            costFrame.SetPoint("LEFT", frame, "TOPLEFT", mainWidth * 0.5 + 45, -120);
            
            // Set a dark background with border
            costFrame.SetBackdrop({
                bgFile: "Interface/Tooltips/UI-Tooltip-Background",
                edgeFile: "Interface/Tooltips/UI-Tooltip-Border",
                tile: true,
                tileSize: 16,
                edgeSize: 16,
                insets: {
                    left: 4,
                    right: 4,
                    top: 4,
                    bottom: 4
                }
            });

            costFrame.SetAlpha(0.0);
            
            // Set the background color to dark
            costFrame.SetBackdropColor(0.1, 0.1, 0.1, 0.8);  // Dark gray, slightly transparent
            
            // Set the border color - using the available method
            costFrame.SetBackdropBorderColor(0.4, 0.4, 0.4, 1.0);  // Medium gray border
            
            // Add a title above the frame
            const titleText = costFrame.CreateFontString(id("cost_frame_title"), "OVERLAY", "GameFontNormal");
            titleText.SetPoint("BOTTOM", costFrame, "TOP", 0, 5);
            titleText.SetText("Required Items");
            titleText.SetTextColor(1, 0.84, 0, 1);  // Golden yellow
        }
    }    

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
                       
                        UpgradeAdvancement(buttonInfo.rolls);


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

    function CreateCloseButton(frame: WoWAPI.Frame): void {
        const closeBtn = CreateFrame("Button", id("close_button"), frame);
        closeBtn.SetSize(52, 52);
        closeBtn.SetPoint("TOPRIGHT", frame, "TOPRIGHT", 0, -20);
        closeBtn.SetNormalTexture(GetTexture("close_button"));
        closeBtn.SetHighlightTexture(GetTexture("close_button_hl"));
        closeBtn.SetPushedTexture(GetTexture("close_button_pushed"));
        closeBtn.SetScript("OnClick", function(self: WoWAPI.Button) {
            frame.Hide();
        });
        closeBtn.Show();
    }

    function CreateRollFrame(frame: WoWAPI.Frame): WoWAPI.Frame {
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
        return rollFrame;
    }
    

    let diceTextures: WoWAPI.Texture[] = [];
    /**
     * This adds in the big numbers that will flash to simulate a dice rolls... 
     * even though the dice roll actually happens on the server in the module. 
     * @param frame 
     */
    function RollDice(min: number, max: number, endValue: number): void {

        const rollFrame = GetComponent("roll_frame");
        if(!rollFrame) {
            AIO_debug(`RollDice: roll_frame not found`);
            return;
        }

        // create a texture that will change the graphic number being rolled using big_number tga
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

        function clearTextures() {
            diceTextures.forEach(texture => {
                texture.Hide();
                texture.ClearAllPoints();
            });
            diceTextures = [];
        }
        clearTextures();

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
            diceTextures.push(rollTexture);
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
        let elapsed = 0;
        let played = false;

        PlaySound("GLUESCREENSMALLBUTTONMOUSEDOWN")
        rollFrame.SetScript("OnUpdate", function(_, deltaTime) {
            elapsed = elapsed + deltaTime * 1000;
            lastUpdate += deltaTime * 1000;

            // Show a new number every 100ms
            if (lastUpdate >= 100) {
                lastUpdate = 0;
                const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                showNumber(randomNum);
            }

            if(elapsed >= 1200 && !played) {
                PlaySoundFile("Interface\\Modules\\MythicPlus\\Audio\\mythiclevel.ogg");
                played = true;
            }

            // Stop rolling after the duration is reached
            if (elapsed >= 1500) {
                
                
                rollFrame.SetScript("OnUpdate", null);
                clearTextures();
                showNumber(endValue);
                rolling = false;
            }
        }); 
   
    }

    function getMessageArgs(message: string): string[] {
        return message.split("|");
    }

    /**
     * Create the main upgrade window frame.
     * @returns Main Frame
     */
    function CreateUpgradeWindow(type: AdvancementType): WoWAPI.Frame {

        // Main frame creation 
        const frame = CreateFrame("Frame", id(`main_${type}`), UIParent);
        frame.SetSize(mainWidth, mainHeight);
        frame.SetPoint("CENTER");
        frame.SetFrameLevel(100);  // Set high frame level to stay on top

        // Add typical frame behaviors 
        MakeDraggable(frame);
        EscapeCloseable(frame);
        
        // Background texture
        const bgTexture = frame.CreateTexture(id("background"), "BACKGROUND");
        bgTexture.SetPoint('TOPLEFT');
        bgTexture.SetWidth(mainWidth);
        bgTexture.SetHeight(mainHeight);
        bgTexture.SetTexture(GetTexture("bgFrameHq"));
        bgTexture.SetTexCoord(0, 768/1024, 0, 1);  // Show 75% of width (768/1024) and full height 
 
        // Add components
        AddTitle(frame);
        CreateCloseButton(frame);
        CreateAdvIcons(frame);
        CreateRollFrame(frame);
        // ShowRollNumbers(frame);
        CreateCostFrame(frame);
        
        const rollFrame = GetComponent("roll_frame");
        if (rollFrame) {            
            CreateDiceButtons(frame, rollFrame);
        }
       
        return frame;
    }
    /**
     * Internal Event Handlers
     */
    function SimulateRoll(rank: number, endValue: number) {

        let min = 1; 
        let max = 11;
        
        if(rank >= 10 && rank < 20) {
            min = 3;
            max = 18;
        }
        if(rank >= 20 && rank < 30) {
            min = 5;
            max = 20;
        }
        if(rank >= 30 && rank < 40) {
            min = 7;
            max = 34;
        }
        if(rank >= 40 && rank <= 50) {
            min = 9;
            max = 42;
        }

        RollDice(min, max, endValue);        
    }

    // This needs to tell the c++ server event listener in the mythic mod to upgrade the advancement
    // for this player
    function UpgradeAdvancement(diceLevel: number) {
        AIO_debug(`Upgrading Player ${advancementState.GetPlayerGuid()} advancement ${advancementState.GetAdvancementId()} with dice level ${diceLevel}`);
        SendServerEvent("UpgradeAdvancement", [advancementState.GetAdvancementId(), diceLevel]);
    }

    // This handles updating rank text when advancement state change
    function UpdateRanks() {
        const topRankText = GetAnyComponent<WoWAPI.FontString>("topbar_rank");
        const bottomRankText = GetAnyComponent<WoWAPI.FontString>("bottombar_rank");
        const topBonusRankText = GetAnyComponent<WoWAPI.FontString>("topbar_bonus");
        const bottomBonusRankText = GetAnyComponent<WoWAPI.FontString>("bottombar_bonus");
        
        const ids = advancementState.GetShownIds();
        const topId = ids[0];
        const topRank = advancementState.GetRank(topId);
        AIO_debug("Top rank", topRank);

        topRankText.SetText("Rank: " + topRank.toString());
        const topBonus = advancementState.GetBonus(topId);
        const bonusText = `${advancementState.AdvIdToName(topId)}: +${topBonus}`;
        topBonusRankText.SetText(bonusText);
        
        // Update the top bar level experience. 
        const goldBar = GetAnyComponent<WoWAPI.Texture>("topbar_gold");
        UpdateAdvColorBar("top", topRank);

        // If the panel is showing 2 stats also do the bottom one.
        if(ids.length == 2) {
            const bottomId = ids[1];
            const bottomRank = advancementState.GetRank(bottomId);
            bottomRankText.SetText("Rank: " + bottomRank.toString());
            const bottomBonus = advancementState.GetBonus(bottomId);
            const bonusText = `${advancementState.AdvIdToName(bottomId)}: +${bottomBonus}`;
            bottomBonusRankText.SetText(bonusText);
            // Update the bottom bar level experience.
            UpdateAdvColorBar("bottom", bottomRank);
        }
    }

    // Updates the display of the cost to the user
    function UpdateCosts(cost: any) {
        // Get the cost frame
        const costFrame = GetComponent<WoWAPI.Frame>("cost_frame");
        if (!costFrame) {
            AIO_debug("Cost frame not found");
            return;
        }
    
        const itemEntries = [cost.itemEntry1, cost.itemEntry2, cost.itemEntry3];
        const itemCosts = [cost.itemCost1, cost.itemCost2, cost.itemCost3];
        
        const validItems = [];
        for (let i = 0; i < itemEntries.length; i++) {
            if (itemEntries[i] && itemEntries[i] > 0 && itemCosts[i] > 0) {
                validItems.push({
                    entry: itemEntries[i],
                    cost: itemCosts[i]
                });
            }
        }

        const ICON_SIZE = 48;
        const SPACING = 10;

        for(let i =0 ; i <3; i++) {
            const button: WoWAPI.Button = GetAnyComponent(`cost_item_${i}`);
            if (button) {
                button.Hide();
                AIO_debug(`>>>>>>>>>>>>>>>>>>>>>>>> Hiding existing button ${name}`);
            }
        }
        
        for (let i = 0; i < validItems.length; i++) {
            const item = validItems[i];            
            const name = id(`cost_item_${i}`);

            // Create the item button
            const iconButton = CreateItemButton(
                costFrame,
                name,
                item.entry,
                48,
                10 + (i * (ICON_SIZE + SPACING + 40)),
                0
            );
        
            // Create or get cost text
            let costText = GetAnyComponent<WoWAPI.FontString>(`cost_text_${i}`);
            if (!costText) {
                costText = iconButton.CreateFontString(id(`cost_text_${i}`), "OVERLAY", "GameFontNormal");
                costText.SetFont("Fonts\\FRIZQT__.TTF", 16);
                costText.SetPoint("LEFT", iconButton, "RIGHT", 5, 0);
            }
            
            if(GetItemCount(item.entry) >= item.cost) {
                costText.SetTextColor(0.117, 1, 0, 1); // green
            } else {
                costText.SetTextColor(1, 0.125, 0, 1); // red
            }

            // Set the cost text
            costText.SetText(`x${item.cost}`);
            
            // Show the button
            iconButton.Show();
        }

        for(let i =0 ; i <3; i++) {
            
            // Get the dice button to create the text against. 
            
            const diceButtonNames = ['single_roll_button', 'double_roll_button', 'triple_roll_button'];
            let diceText: WoWAPI.FontString;
            let diceButton = GetComponent<WoWAPI.Button>(diceButtonNames[i], "Button");
            
            if (diceButton) {
                // Clear the dice text if it exists
                diceText = GetAnyComponent<WoWAPI.FontString>(`dice_text_${i}`);                
                if (!diceText) {                    
                    diceText = diceButton.CreateFontString(id(`dice_text_${i}`), "OVERLAY");
                    diceText.SetFont("Fonts\\FRIZQT__.TTF", 13);                                            
                }       
                let chanceCost = cost[`chanceCost${i+1}`];

            
                diceText.SetPoint("TOP", diceButton, "BOTTOM", 0, 10);                
                diceText.SetText(`x${chanceCost}`); 

                // set the color based on if they have the materials 
                if(GetItemCount(911000) >= chanceCost) {
                    // WoW green: #1eff00 (RGB: 0.117, 1, 0)
                    diceText.SetTextColor(0.117, 1, 0, 1); // WoW green
                } else {
                    // WoW red: #ff2020 (RGB: 1, 0.125, 0)
                    diceText.SetTextColor(1, 0.125, 0, 1); // WoW red
                }
                diceText.Show();
                
            }
        }

    }

    /**
     * Mythic Event Handlers 
     * Events that come from calling into the MythicPlus Mod via AddOn channel
     */
    const eventFrame = CreateFrame("Frame", id("event_frame"));
    eventFrame.RegisterEvent("CHAT_MSG_ADDON") 
    eventFrame.SetScript("OnEvent", function(self, event, prefix, message, sender) {

        // If it is coming in on our channel 
        if (prefix == "MPUi") {
            
            const result = getMessageArgs(message);
            if(!result || result.length < 1) {
                AIO_debug("Received event with no data");
                return;                
            }
            // only look at server events
            if(result[0] != "s") {
                return;
            }

            // log if it is an error but do not continue
            if(result[2] == 'Error') {
                AIO_debug(`ERROR: Received event ${result[3]} Details: ${result[4]}`);
                return;                
            }

            const method = result[2];
            switch(method) {
                case "UpgradeAdvancement": 
                    
                    // Send an update to the server to update shared state of client. 
                    const thisRoll = result[4];
                    const rank = result[5];
                    const totalBonus = result[6];

                    // Send the roll over to simulate the roll but end on the correct number
                    SimulateRoll(Number(rank), Number(thisRoll));
                    
                    // refresh the state. 
                    aio.Handle("MythicAdvUI", "GetAdvancementState", advancementState.GetAdvancementId(), rank, totalBonus);                 
                    break;
                default:
                    AIO_debug(`Unknown method: ${method}`);
                    break;
            }

            aio.Handle("MythicAdvUI", "GetAdvancementState", advancementState.GetAdvancementId(), result[5], result[6]);                 
        }
    });    



    /**
     * Server Event State Handlers 
     */

    // This will update the advancement state from the server 
    AdvanceUIHandlers.UpdateAdvancementState = (playerId: number, advancements: PlayerAdvancement[]) => {   
        advancementState.SetPlayerGuid(playerId);
        advancementState.LoadAdvancements(advancements);    
        
        const advId = advancementState.GetAdvancementId();
        if(advId) {
            aio.Handle("MythicAdvUI", "GetNextLevelCost", advId);
        }

        UpdateRanks();                
    };

    AdvanceUIHandlers.UpdateNextLevelCost = (cost: any) => {        
        AIO_debug("I received next level cost from the server", cost.itemEntry1);       
        UpdateCosts(cost);
    };


    // This will show the advancement upgrade window 
    let frame: WoWAPI.Frame | undefined = undefined;
    AdvanceUIHandlers.ShowUpgradeWindow = (type: AdvancementType) => {
        advancementState.ClearState();
        advancementState.SetType(type);
        aio.Handle("MythicAdvUI", "GetAdvancementState");

        if(!UpgradeUIFrames.has(type)) {                   
           frame = CreateUpgradeWindow(type);
           UpgradeUIFrames.set(type, frame);
        } else {
           frame = UpgradeUIFrames.get(type);
        }

        let ids = advancementState.GetShownIds();
        AIO_debug("Shown ids", ids[0]);

        frame?.Show();
        // if (advancementState.GetShownIds().length > 0 && frame) {
        //     UpdateRanks();
        // }
    };


}
