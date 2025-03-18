/** @ts-expect-error */
let aio: AIO = {}; 

const id = (name: string) => `UpgradeUI_${name}`;
import { colors } from "../../classes/ui-utils";

if (!aio.AddAddon()) {
    const upgradeUIHandlers = aio.AddHandlers("UpgradeUI", {});
    const UpgradeUIFrames: Map<number, WoWAPI.Frame> = new Map();
    const itemSlots: Map<number, string> = new Map();
    let selectedDice: WoWAPI.Button | null = null;
    let rolling: boolean = false;
    
    const mainWidth = 768;
    const mainHeight = 512; 
    const centerOffset = mainWidth / 2;

    const usedTextures = {
        "bgFrame": "Interface/Modules/MythicPlus/Textures/mythic-adv-frame",
        "bgFrameHq": "Interface/Modules/MythicPlus/Textures/mythic-adv-frame-hq",
        "bgFrameHq2": "Interface/Modules/MythicPlus/Textures/mythic-upgrade-frame-hq-2",
        "darkBg": "Interface/DialogFrame/UI-DialogBox-Background-Dark",
        "diceFrame": "Interface/Modules/MythicPlus/Textures/advancement_frame",
     
    }

    function GetTexture(name: string): string  {
        return usedTextures[name] || "";
    }

    function CreateUpgradeWindow() {

        const frame = CreateFrame("Frame", id("main"), UIParent);
        frame.SetSize(mainWidth, mainHeight);
        frame.SetPoint("CENTER");
        frame.SetMovable(true);
        frame.EnableMouse(true);
        frame.RegisterForDrag("LeftButton");
        frame.SetScript("OnDragStart", frame.StartMoving);
        frame.SetScript("OnDragStop", frame.StopMovingOrSizing);
        
    
        const bgTexture = frame.CreateTexture(id("background"), "BACKGROUND");
        bgTexture.SetPoint('TOPLEFT');
        bgTexture.SetWidth(mainWidth);
        bgTexture.SetHeight(mainHeight);
        bgTexture.SetTexture(GetTexture("bgFrameHq"));
        bgTexture.SetTexCoord(0, 768/1024, 0, 1);  // Show 75% of width (768/1024) and full height
 
        frame.Show();


        // Add title background
        const titleBg = frame.CreateTexture(id("TitleBg"), "ARTWORK");
        // titleBg.SetTexture("Interface/DialogFrame/UI-DialogBox-Header");
        // titleBg.SetWidth(300);
        // titleBg.SetHeight(64);
        // titleBg.SetDrawLayer("OVERLAY", 10)
        // titleBg.SetPoint("TOP", 0, 14);
        
        // Add title text
        const titleBar = frame.CreateFontString(id("TitleBar"), "OVERLAY");
        titleBar.SetPoint("TOP", -150, -40);
        titleBar.SetTextColor(1, 0.84, 0, 1)  // Golden yellow
        titleBar.SetFont("Interface/Modules/MythicPlus/Fonts/NOTO.TTF", 16)
        titleBar.SetText(`Mythic Upgrades`);
        
        // Remove the template's close button
        const templateCloseButton = frame.GetChildren()[0] as WoWAPI.Frame;
        if (templateCloseButton) {
            templateCloseButton.Hide();
        }
        
        // // Add our custom close button
        // const closeButton = CreateFrame("Button", id("CloseButton"), frame, "UIPanelCloseButton");
        // closeButton.SetPoint("TOPRIGHT", -5, -5);
        // closeButton.SetScript("OnClick", () => {
        //     frame.Hide();
        // });
        
        // Header Row: Skill Icons & Ranks
        for (let i = 0; i < 3; i++) {
            const skillFrame = CreateFrame("Frame", id(`Skill_${i}`), frame);
            skillFrame.SetSize(64, 64);
            skillFrame.SetPoint("TOP", -125 + i * 125, -55);

            const skillIcon = skillFrame.CreateTexture(id(`SkillIcon_${i}`), "ARTWORK");
            skillIcon.SetTexture("Interface\\Icons\\INV_Misc_QuestionMark");
            skillIcon.SetAllPoints();
            
            const skillName = skillFrame.CreateFontString(id(`SkillName_${i}`), "OVERLAY", "GameFontNormalLarge");
            skillName.SetPoint("TOP", skillFrame, "BOTTOM", 0, -5);
            skillName.SetText(`Skill ${i + 1}`);
            
            const skillRank = skillFrame.CreateFontString(id(`SkillRank_${i}`), "OVERLAY", "GameFontHighlightLarge");
            skillRank.SetPoint("TOP", skillName, "BOTTOM", 0, -2);
            skillRank.SetText("0 / 50");
        }
                
        // Add a new texture in the middle of the frame that is 512x512 and the middle layer
        const centerTexture = frame.CreateTexture(id("DiceTextureBack"), "ARTWORK");
        centerTexture.SetDrawLayer("ARTWORK", 3);
        centerTexture.SetSize(128, 128);
        centerTexture.SetPoint("CENTER", frame, "CENTER", 0, -20);
        centerTexture.SetTexture("Interface\\MythicPlus\\adv-dice-light.blp");

        const circleTexture = frame.CreateTexture(id("DiceTextureBack"), "BACKGROUND");
        circleTexture.SetDrawLayer("ARTWORK", 5);
        circleTexture.SetSize(512, 512);
        circleTexture.SetAlpha(0.20);
        circleTexture.SetPoint("CENTER", frame, "CENTER", 0, -20);
        circleTexture.SetTexture("Interface\\MythicPlus\\gold-circle.blp");
        
        // Add a glowing effect behind the dice
        const glowTexture = frame.CreateTexture(id("DiceGlow"), "ARTWORK");
        glowTexture.SetDrawLayer("ARTWORK", -2);
        glowTexture.SetSize(300, 300);
        glowTexture.SetPoint("CENTER", centerTexture, "CENTER", 0, 0);
        glowTexture.SetTexture("Interface\\GLUES\\MODELS\\UI_MainMenu_Legion\\UI_MainMenu_Legion3");
        glowTexture.SetAlpha(0.3);

        // Roll Display with better font handling
        const rollDisplay = frame.CreateFontString(id("RollDisplay"),"ARTWORK");
        rollDisplay.SetFont("Interface\\MythicPlus\\NOTO.TTF", 256, "THICKOUTLINE");
        rollDisplay.SetPoint("CENTER", frame, "CENTER", 0, -80);        
        rollDisplay.SetTextColor(1, 0.84, 0, 1); // More golden yellow color
        rollDisplay.SetText("-");
        

        // Dice Multipliers with Selection Logic
        const diceMultipliers = ["1x", "2x", "3x"];              
        for (let k = 0; k < diceMultipliers.length; k++) {
            const diceButton = CreateFrame("Button", id(`Dice_${k}`), frame);
            diceButton.SetSize(24, 24);
            diceButton.SetPoint("TOPLEFT", 150 + (k * 30), -450);
            
            const diceText = diceButton.CreateFontString(id(`DiceText_${k}`), "OVERLAY", "GameFontHighlight");
            diceText.SetPoint("CENTER", diceButton, "CENTER", 0, 0);
            diceText.SetText(diceMultipliers[k]);
            
            diceButton.SetScript("OnClick", function() {
                if (selectedDice) {
                    selectedDice.SetAlpha(1.0); // Reset previous selection
                }
                selectedDice = diceButton;
                selectedDice.SetAlpha(1.5); // Glow effect
            });
        }
        
        // Roll Button with animation logic
        const rollButton = CreateFrame("Button", id("RollButton"), frame, "UIPanelButtonTemplate");
        rollButton.SetSize(100, 30);
        rollButton.SetPoint("BOTTOM", frame, "BOTTOM", 0, 50);
        rollButton.SetText("Roll");
        
        function rollDice(min: number, max: number, duration: number = 5000) {
            if (rolling) return;
            rolling = true;
            let elapsed = 0;
            let lastUpdate = 0;
            
            frame.SetScript("OnUpdate", function(_, deltaTime) {
                elapsed = elapsed + deltaTime * 5000;
                lastUpdate += deltaTime * 1000;
                
                // Only update every 200ms to slow down the rolling animation
                if (lastUpdate >= 100) {
                    lastUpdate = 0;
                    rollDisplay.SetText(`${Math.floor(Math.random() * (max - min + 1)) + min}`);
                }
                
                if (elapsed >= duration) {
                    frame.SetScript("OnUpdate", null);
                    rolling = false;
                    // Set final roll
                    rollDisplay.SetText(`${Math.floor(Math.random() * (max - min + 1)) + min}`);
                }
            });
        }

        rollButton.SetScript("OnClick", function() {
            rollDice(2, 23); // Default to 2-23 range for backward compatibility
        });
        
        // Roll History
        const historyFrame = CreateFrame("Frame", id("HistoryFrame"), frame);
        historyFrame.SetSize(380, 80);
        historyFrame.SetPoint("BOTTOM", frame, "BOTTOM", 0, 10);
        
        const historyText = historyFrame.CreateFontString(id("HistoryText"), "OVERLAY", "GameFontHighlight");
        historyText.SetPoint("TOPLEFT", historyFrame, "TOPLEFT", 10, -10);        
        historyText.SetText("Roll History:");
        
        UpgradeUIFrames.set(1, frame);
    }
    
    CreateUpgradeWindow();
    UpgradeUIFrames.get(1).Show();

     upgradeUIHandlers.ShowUpgradeWindow = () => {
         if (!UpgradeUIFrames.has(1)) {
             CreateUpgradeWindow();
         }
         UpgradeUIFrames.get(1).Show();        
     };
}
