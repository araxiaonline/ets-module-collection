import { BotData } from './botmgr.server';
import { Equipment } from './botmgr.server';

type ItemInHand = {
    entry: number | undefined,
    link: string | undefined,
    bot: number | undefined,    
    slot: number | undefined    
}

/**
 * This is the UI bot data manager class to make it easier
 * to managed bot data in the UI. 
 */
export class BotStorage {

    private storage: Map<number, BotData> = new Map();
    private active: number = null;
    private pickedUp: boolean = false;
    private itemInHand: ItemInHand = { entry: undefined, link: undefined, bot: undefined, slot: undefined };
    private bankItem: { entry: number, link: string, slot: number } = { entry: 0, link: '', slot: 0 };

    public GetBotData(entry: number): BotData | undefined {
        return this.storage.get(entry);
    }

    GetBotItem(botId: number, slot: BotEquipmentSlotNum): Equipment | undefined {
        const bot = this.GetBotData(botId);
        if(bot) {
            return bot.equipment[slot];
        } 
    }
    
    SetBotData(entry: number, data: BotData): void {
        this.storage.set(entry, data);
    }

    SetBotItem(botId: number, slot: BotEquipmentSlotNum, item: Equipment): void {
        const botData = this.GetBotData(botId);
        if(botData) {
            botData.equipment[slot] = item;
        }

        this.SetBotData(botId, botData);
    }

    UpdateBotData(entry: number, data: BotData): void {
        this.storage.set(entry, data);
    }

    SetActive(botId: number): void {
        this.active = botId;
    }

    GetActive(): number {
        return this.active;
    }

    ClearActive(): void {
        this.active = null;
    }

    IsPickedUp(): boolean {
        return this.pickedUp;
    }

    BotItemPickedUp(botId: number, entry: number, link: string): void {
        const bot = this.GetBotData(botId);
        if(bot) {
            this.itemInHand.entry = entry;
            this.itemInHand.link = link;
            this.itemInHand.bot = botId;            
            this.itemInHand.slot = this.GetSlotByItemId(entry);
        }
        this.pickedUp = true;
        
    }

    GetItemInHand(): ItemInHand {
        return this.itemInHand;
    }

    GetFromBank(): { entry: number, link: string, slot: number } | undefined {
        if(!this.bankItem) {
            return undefined;
        }
        
        return this.bankItem;
    }

    SetFromBank(item: { entry: number, link: string, slot: number }): void {
        this.bankItem = item;
    }

    ClearFromBank(): void {
        this.bankItem = undefined;
    }

    BotItemCursorClear(): void {
        this.itemInHand = undefined;
        this.pickedUp = false;
    }

    GetSlotByItemId(entry: number): number | undefined {
        const botData = this.GetBotData(this.GetActive());
        const allItems = Object.entries(botData.equipment)
        for(const [slot, item] of allItems) {
            if(item.entry === entry) {
                return parseInt(slot);
            }
        }
        return;                 
    }


}import * as Common from '../../constants/idmaps'; 
import { BotData, Equipment, EquipmentList } from './botmgr.server';

type CharInfo = {
    name: string,
    level: number,
    className: Common.CharacterClass,
    classId: keyof typeof Common.ClassesMapping,
    raceName: Common.CharacterRace,
    raceId: keyof typeof Common.RacesMapping
}

type CharStats = Partial<Record<keyof typeof Common.BotStat, number>>;

function humanizeTalentName(input: string): string {
    if (input.length === 0) {
        return input; // Return unchanged if the input is an empty string
    }

    try {
        const parts = input.split("_");
        parts[0] = parts[0].toLowerCase(); 
        parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        parts[1] = parts[1].toLowerCase(); 
        parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    
        return `${parts[1]} ${parts[0]}`;
    } catch (e) {
        print(`failed to humanize talent name: ${input}` + e);
    }

}    
export class BotUnit {
    
    protected myself: Creature; 
    protected myOwner: Player;
    protected charinfo: CharInfo;
    protected equipment: EquipmentList;
    protected statsLeft: Record<string, string>[]; 
    protected statsRight: Record<string, string>[];
    protected talentSpecId: number;
    protected roles: number;
    protected allStats: Record<string, string> = {};

    constructor(creature: Creature) {
        if(!creature.IsNPCBot()) {
            return;
        }

        this.myself = creature;
        this.myOwner = creature.GetBotOwner();
        this.charinfo = {
            name: creature.GetName(),
            level: creature.GetLevel(),
            className: Common.ClassesMapping[creature.GetClass()],
            classId: creature.GetClass(),
            raceName: Common.RacesMapping[creature.GetRace()],
            raceId: creature.GetRace()
        };
        this.equipment = this._lookupEquipment();
        this.talentSpecId = creature.GetTalentSpec();     
        this.parseStats(creature.GetBotDump());
        try {
            this.statsLeft = this._lookupStats('left');
            this.statsRight = this._lookupStats('right');
        } catch (e) {
            print("failed to get stats for bot:" + e);
        }
        
        this.roles = creature.GetBotRoles();
        
           
    }

    public toBotData(): BotData {
        return {
            name: this.charinfo.name,
            entry: this.myself.GetEntry(),
            owner: this.myOwner.GetName(),
            level: this.charinfo.level,
            class: this.charinfo.className,
            classId: this.charinfo.classId,
            race: this.charinfo.raceName,
            raceId: this.charinfo.raceId,
            talentSpec: this.talentSpecId,
            talentSpecName: humanizeTalentName(this.talentSpecName()),
            roles: this.roles,
            equipment: this.equipment,
            leftStats: this.statsLeft,
            rightStats: this.statsRight,
            allStats: this.allStats
        }
    }

    public isHealer(): boolean {
        if(this.talentSpecId == Common.TalentSpecs.SHAMAN_RESTORATION || 
            this.talentSpecId == Common.TalentSpecs.PRIEST_DISCIPLINE ||
            this.talentSpecId == Common.TalentSpecs.PRIEST_HOLY ||
            this.talentSpecId == Common.TalentSpecs.PALADIN_HOLY ||
            this.talentSpecId == Common.TalentSpecs.DRUID_RESTORATION) {
                return true;
            }
        return false;
    }

    public isDualWield(): boolean {
        if(this.talentSpecId == Common.TalentSpecs.ROGUE_COMBAT ||
            this.talentSpecId == Common.TalentSpecs.ROGUE_SUBTLETY ||
            this.talentSpecId == Common.TalentSpecs.ROGUE_ASSASSINATION ||
            this.talentSpecId == Common.TalentSpecs.SHAMAN_ENHANCEMENT ||
            this.talentSpecId == Common.TalentSpecs.WARRIOR_FURY) {
                if(this.equipment[Common.BotEquipSlot.MAINHAND] && 
                    this.equipment[Common.BotEquipSlot.OFFHAND]) {
                    return true;
                }

            }
    }


    public GetMeleeStats (): Record<string, Common.BotStatName[]>{        
        const botStatValues = Object.values(Common.BotStatLabel);
        type BotStatValues = typeof botStatValues[number];

        return { 
            left: [
                "Strength",
                "Agility",
                "Damage",
                "Power",
                "Hit Rating",
                "Crit %",
                "Expertise",
                "Armor Pen"                                
            ], 
            right: [            
                "Haste Rating",
                "Armor",
                "Stamina",
                "Defense",
                "Dodge",
                "Parry",
                "Block",
                "Physical Res."                
            ]
        }
    }

    public GetRangedStats (): Record<string, Common.BotStatName[]>{
        return {
            left: [              
                "Strength",
                "Agility",
                "Damage Rng",
                "Speed",
                "Power",
                "Hit Rating",
                "Crit %",                
                "Armor Pen" 
            ],
            right: [
                "Expertise",
                "Haste Rating",
                "Armor",
                "Stamina",
                "Defense",
                "Dodge",
                "Parry",
                "Block",                                
            ]
        }
    }

    public GetCasterStats (): Record<string, Common.BotStatName[]> {
        return {
            left: [
                "Intellect",
                "Spirit",
                "Stamina",
                "Bonus Dmg",
                "Crit %",
                "Hit Rating",                
                "Spell Pen"                
            ],
            right: [
                "Haste Rating",                
                "MP5",
                "Spell Res.", 
                "Dodge",
                "Armor",
                "Parry",                                
            ]
        }
    }

    public GetStatMappings() {        

        switch(this.talentSpecId) {
            case Common.TalentSpecs.WARRIOR_ARMS:
            case Common.TalentSpecs.WARRIOR_FURY:
            case Common.TalentSpecs.WARRIOR_PROTECTION:
            case Common.TalentSpecs.PALADIN_PROTECTION:
            case Common.TalentSpecs.PALADIN_RETRIBUTION:
            case Common.TalentSpecs.DK_BLOOD:
            case Common.TalentSpecs.DK_FROST:
            case Common.TalentSpecs.DK_UNHOLY:
            case Common.TalentSpecs.ROGUE_ASSASSINATION:
            case Common.TalentSpecs.ROGUE_COMBAT:
            case Common.TalentSpecs.ROGUE_SUBTLETY:
            case Common.TalentSpecs.SHAMAN_ENHANCEMENT:
            case Common.TalentSpecs.DRUID_FERAL:
                return this.GetMeleeStats();                
            
            case Common.TalentSpecs.HUNTER_SURVIVAL:
            case Common.TalentSpecs.HUNTER_MARKSMANSHIP:
            case Common.TalentSpecs.HUNTER_BEASTMASTERY:
                return this.GetRangedStats();                

            case Common.TalentSpecs.MAGE_ARCANE:
            case Common.TalentSpecs.MAGE_FIRE:
            case Common.TalentSpecs.MAGE_FROST:
            case Common.TalentSpecs.WARLOCK_AFFLICTION:
            case Common.TalentSpecs.WARLOCK_DEMONOLOGY:
            case Common.TalentSpecs.WARLOCK_DESTRUCTION:
            case Common.TalentSpecs.PRIEST_DISCIPLINE:
            case Common.TalentSpecs.PRIEST_HOLY:
            case Common.TalentSpecs.PRIEST_SHADOW:
            case Common.TalentSpecs.SHAMAN_ELEMENTAL:
            case Common.TalentSpecs.SHAMAN_RESTORATION:
            case Common.TalentSpecs.DRUID_BALANCE:
            case Common.TalentSpecs.DRUID_RESTORATION:
                return this.GetCasterStats();                

            default:
                print(`Unknown Talent Spec: ${this.talentSpecId}`);                            
        }
    }

    public talentSpecName() {
        // print(`Talent Spec: ${this.talentSpecId}`);
        const keys = Object.keys(Common.TalentSpecs);
        for(let i=0; i < keys.length; i++) {
            if(Common.TalentSpecs[keys[i]] === this.talentSpecId) {
                return keys[i];
            }
        }
    }   

    private _lookupEquipment(): EquipmentList {
        const myEquipment = {} as EquipmentList;
        for(let slot=0; slot <= Common.BotEquipLast; slot++) {
            const equipment = this.myself.GetBotEquipment(<BotEquipmentSlotNum>slot);
            
            if(equipment) {            
                myEquipment[slot] =  {
                    entry: equipment.GetEntry(),
                    link: equipment.GetItemLink(),
                    quality: <Common.QualityType>equipment.GetQuality(),
                    itemLevel: equipment.GetItemLevel(),
                    enchantmentId: equipment.GetEnchantmentId(0),  // Only the permenant enchantments
                }                     
            } else {
               myEquipment[slot] = undefined;
            }                
        }

        return myEquipment;
    }

    private _lookupStats(panel: 'left' | 'right'): Record<string, string>[] {        
        const statMappings = this.GetStatMappings();
        const classStats: Record<string, string>[] = []

        for(let stat = 0; stat < statMappings[panel].length; stat++) {
            const statName = statMappings[panel][stat];
            let statValue = this.allStats[statName];
            const statRecord= {};  

            // skip offhand stats will be handled with main hand
            if(statName === 'Dmg Off') {
                continue;
            }

            // handle some special cases for stats 
            if(statName === 'Damage') {                                
                statRecord[statName] = statValue;
                classStats.push(statRecord); 

                // Go ahead and add dual wield damage also
                if(this.isDualWield()) {                    
                    //statRecord['Dmg Off'] = statValue; 
                    //classStats.push(statRecord);                    
                }
                continue; 
            }
            
            if(this.isHealer() && statName === 'Bonus Dmg') {
                statRecord['Bonus Heals'] = statValue;
                classStats.push(statRecord);
                // print(`Stat: Bonus Heals = ${statValue}`);
                continue; 
            }

            if(statName && statValue) {
                statRecord[statName] = statValue;
                classStats.push(statRecord);
                // print(`Stat: ${statName} = ${statValue}`);
            } else {
                // print("failed to get stat: " + statName); 
            }
                        
        }

        return classStats; 
    }

    private parseStats(botdump: string) {
        const stats = botdump.split('\n');     
        for(let i=0; i<stats.length; i++) {
            const parts = stats[i].split(':');

            if(parts[0] == "Resistance") {                    
                parts[0] = parts[0] + ":" + parts[1];                 
                this.allStats[parts[0]] = parts[2];                                
                continue; 
            }            

            if(!Common.BotStatLabel[parts[0]]) {                
                continue;
            }

            parts[1] = parts[1].replace("(-0.00 pct)", ""); 
            parts[1] = parts[1].replace("pct", "%").trim();
            parts[1] = parts[1].replace("+", "");

            const statName = Common.BotStatLabel[parts[0]];
            if(statName == "Damage" || statName == "Dmg Off" || statName == "Damage Rng") {
                parts[1] = parts[2].split(",")[0].trim() + "-" + parts[3].trim();  
                
            }

            if(statName == "Physical Res." || statName == "Spell Res.") { 
                const value = parseFloat(parts[1]);
                if(value === 1) {
                    parts[1] = "0.00%";
                }
                parts[1] = ((1 - value) * 100) + ".00%"; 
                
            }

            if(statName == "Expertise") {
                parts[1] = parts[1].trim().split(" ")[0]; 
            }

            if(statName == "Dodge" || statName == "Parry" || statName == "Block" || 
            statName == "Crit %" ) {
                parts[1] = parts[1].trim() + "%";
            }

            if(statName == "Strength" || statName == "Agility" || statName == "Intellect" || 
            statName == "Spirit" || statName == "Stamina") {
                parts[1] = "" + Math.round(parseInt(parts[1]));
            }

            this.allStats[statName] = parts[1].trim().replace(" %", "%");   
            // print("Parsed Stat: " + statName + " = " + parts[1]);                 
        }        
    }
}
/** @noSelfInFile **/
/** @ts-expect-error */
let aio: AIO = {}; 

/**
 * v2: 
 * @todo Add slot management for bot equipment 
 */


import { UIInvSlot, BotEquipSlot, BotSlotName, BotStat, BotStatLabel } from "../../constants/idmaps";
import { BotData, Equipment } from "./botmgr.server";
import { BotStorage } from "./bot";
import { colors } from "../../classes/ui-utils";

// Helper functions to create unique ids for frames and components
const id = (name: string, entry: number = null) => `BotMgr${name}` + (entry ? entry : '');
const compId = (botId: number, name: string) => `${botId}:BotMgr${name}`;

// includes of global polyfills in main file for submodules 
let incObjectEntries = { 1: 'inlude'}; Object.entries(incObjectEntries);    
let incParseInt = parseInt('1');

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

function humanizeName(input: string): string {
    if (input.length === 0) {
        return input; // Return unchanged if the input is an empty string
    }

    const parts = input.split("_");
    parts[0] = parts[0].toLowerCase(); 
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    parts[1] = parts[1].toLowerCase(); 
    parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);

    return `${parts[1]} ${parts[0]}`;
}  

// If we are a client file. aio.AddAddon() will return false and this file will be serialized and sent to client. 
if(!aio.AddAddon()) {
    
    const botMgrHandlers = aio.AddHandlers('BotMgr', {}); 
    const InfoFramePool: Map<number, WoWAPI.Frame> = new Map();  
    const ComponentsPool: Map<string, unknown> = new Map();   // key botId + ":" + componentid
    const ItemClickFuncs: Map<string, any> = new Map();  // containerid (1-13):itemslotId (1-36) => click function
    const botStorage: BotStorage = new BotStorage();

    let BotItemTooltip: WoWAPI.GameTooltip;  

    function AddResistFrame(parent: WoWAPI.Frame, botData: BotData) {
        const resistFrame = CreateFrame("Frame", id("ResistsFrame"), parent);
        resistFrame.SetSize(32, 160); 
        resistFrame.SetPoint("TOPRIGHT", parent, "TOPLEFT", 297, -77); 

        const magicRes1 = CreateFrame("Frame", id("MagicResFrame1"), resistFrame, "MagicResistanceFrameTemplate", 1);
        magicRes1.SetPoint("TOP", 0, 0);
        magicRes1.SetSize(32, 32);

        const magResBack1 = magicRes1.CreateTexture(id("MagicResTexture1"), "BACKGROUND");
        magResBack1.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-ResistanceIcons");
        magResBack1.SetTexCoord(0, 1, 0.2265, 0.3398);
        magResBack1.SetAllPoints(magicRes1);
        
        const magResFont1 = magicRes1.CreateFontString(id("Resist2"), "BACKGROUND", "GameFontHighlightSmall");
        magResFont1.SetPoint("BOTTOM", magResBack1, null, 0, 3);
        magResFont1.SetText(`${GREEN_FONT_COLOR_CODE}${botData.allStats["Resistance: arcane"]}`);
        ComponentsPool.set(compId(botData.entry, "Resist1"), magResFont1);

        // End Arcance Resistance

        const magicRes2 = CreateFrame("Frame", id("MagicResFrame2"), resistFrame, "MagicResistanceFrameTemplate", 2);
        magicRes2.SetPoint("TOP", magicRes1, "BOTTOM", 0, 0);
        magicRes2.SetSize(32, 32);

        const magResBack2 = magicRes2.CreateTexture(id("MagicResTexture2"), "BACKGROUND");
        magResBack2.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-ResistanceIcons");
        magResBack2.SetTexCoord(0, 1, 0, 0.11328125);
        magResBack2.SetAllPoints(magicRes2);
        
        const magResFont2 = magicRes1.CreateFontString(id("Resist2"), "BACKGROUND", "GameFontHighlightSmall");
        magResFont2.SetPoint("BOTTOM", magicRes2, null, 0, 3);
        magResFont2.SetText(`${GREEN_FONT_COLOR_CODE}${botData.allStats["Resistance: fire"]}`);
        ComponentsPool.set(compId(botData.entry, "Resist2"), magResFont2);

        // end fire resistance

        const magicRes3 = CreateFrame("Frame", id("MagicResFrame3"), resistFrame, "MagicResistanceFrameTemplate", 3);
        magicRes3.SetPoint("TOP", magicRes2, "BOTTOM", 0, 0);
        magicRes3.SetSize(32, 32);

        const magResBack3 = magicRes3.CreateTexture(id("MagicResTexture3"), "BACKGROUND");
        magResBack3.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-ResistanceIcons");
        magResBack3.SetTexCoord(0, 1, 0.11328125, 0.2265625);
        magResBack3.SetAllPoints(magicRes3);
    
        const magResFont3 = magicRes3.CreateFontString(id("Resist3"), "BACKGROUND", "GameFontHighlightSmall");
        magResFont3.SetPoint("BOTTOM", magicRes3, null, 0, 3);
        magResFont3.SetText(`${GREEN_FONT_COLOR_CODE}${botData.allStats["Resistance: nature"]}`);
        ComponentsPool.set(compId(botData.entry, "Resist3"), magResFont3);        

        // end nature resistance

        const magicRes4 = CreateFrame("Frame", id("MagicResFrame4"), resistFrame, "MagicResistanceFrameTemplate", 4);
        magicRes4.SetPoint("TOP", magicRes3, "BOTTOM", 0, 0);
        magicRes4.SetSize(32, 32);

        const magResBack4 = magicRes4.CreateTexture(id("MagicResTexture4"), "BACKGROUND");
        magResBack4.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-ResistanceIcons");
        magResBack4.SetTexCoord(0, 1, 0.33984375, 0.453125);
        magResBack4.SetAllPoints(magicRes4);
    
        const magResFont4 = magicRes4.CreateFontString(id("Resist4"), "BACKGROUND", "GameFontHighlightSmall");
        magResFont4.SetPoint("BOTTOM", magicRes4, null, 0, 3);
        magResFont4.SetText(`${GREEN_FONT_COLOR_CODE}${botData.allStats["Resistance: frost"]}`);
        ComponentsPool.set(compId(botData.entry, "Resist4"), magResFont4); 
        
        // end frost resistance

        const magicRes5 = CreateFrame("Frame", id("MagicResFrame5"), resistFrame, "MagicResistanceFrameTemplate", 5);
        magicRes5.SetPoint("TOP", magicRes4, "BOTTOM", 0, 0);
        magicRes5.SetSize(32, 32);

        const magResBack5 = magicRes5.CreateTexture(id("MagicResTexture5"), "BACKGROUND");
        magResBack5.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-ResistanceIcons");
        magResBack5.SetTexCoord(0, 1, 0.453125, 0.56640625);
        magResBack5.SetAllPoints(magicRes5);
    
        const magResFont5 = magicRes5.CreateFontString(id("Resist5"), "BACKGROUND", "GameFontHighlightSmall");
        magResFont5.SetPoint("BOTTOM", magicRes5, null, 0, 3);
        magResFont5.SetText(`${GREEN_FONT_COLOR_CODE}${botData.allStats["Resistance: shadow"]}`);
        ComponentsPool.set(compId(botData.entry, "Resist5"), magResFont5); 

        // end shadow resistance
    }

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

        const spec = infoTextFrame.CreateFontString(id("SpecFont", botData.entry), "BACKGROUND", "GameFontHighlightSmall");
        spec.SetText(`${botData.talentSpecName}`);
        spec.SetPoint("TOP", infoTextFont, "BOTTOM", 0, -2);
        ComponentsPool.set(compId(botData.entry, "SpecFont"), spec);

        infoTextFont.SetSize(300,12);
        infoTextFont.SetPoint("CENTER",0,0);    
        
    }
    
    function AddCharacterModel(parent: WoWAPI.Frame, botData: BotData) {        
        const frameChar = CreateFrame("PlayerModel", id("ModelFrame", botData.entry), parent, null, botData.entry);
        frameChar.SetPoint("TOP", -5, -82);
        frameChar.SetSize(240, 175);
        frameChar.SetUnit("target"); 
        frameChar.SetFacing(0.3);        
        frameChar.SetAlpha(0.65);
        frameChar.SetGlow(0.9);
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

            const equippedItem: Equipment = botData.equipment[slotOrder[i]];
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
            if(equippedItem && equippedItem.entry > 0) {
                itemIcon = GetItemIcon(equippedItem.entry);                    
                idsuffix = slotOrder[i];             
            }

            // If there is not a piece of equipment add the background texture
            if(!equippedItem && slotOrder[i] > 0) {
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
            ComponentsPool.set(compId(botData.entry, `ItemSlotTexture-${itemSlotId}`), itemTexture);
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
           UpdateEquipFrame('right', equipFrame, botData);
            ComponentsPool.set(compId(botData.entry, "RightEquipment"), equipFrame);                
        }

        if(!frames.weapons) {
            equipFrame = CreateFrame("Frame", id("WeaponEquipment"), parent, null, 3);
            equipFrame.SetPoint("CENTER", -10, -147);
            equipFrame.SetSize(129, 40);
            UpdateEquipFrame('weapons', equipFrame, botData);
            ComponentsPool.set(compId(botData.entry, "WeaponsEquipment"), equipFrame);            
        }
                
    }

    function AddStats(parent: WoWAPI.Frame | undefined, botData: BotData) {
        const leftStats = botData.leftStats;
        const rightStats = botData.rightStats;
        for(let i =0; i < leftStats.length; i++) {
            const statName = Object.keys(leftStats[i])[0];

            let statLabel = <WoWAPI.FontString>ComponentsPool.get(compId(botData.entry, `StatName-${statName}`));            
            if(!statLabel) {
                statLabel = parent.CreateFontString(id(`StatName-${statName}`), "ARTWORK", "GameFontNormalSmall");
                statLabel.SetPoint("TOPLEFT", parent, "TOPLEFT", 5, -7 - (i * 14));                        
                statLabel.SetJustifyH("LEFT");
                statLabel.SetText(`${statName}:`);            
                ComponentsPool.set(compId(botData.entry, `StatName-${statName}`), statLabel); 
            }
            
            let statValue = <WoWAPI.FontString>ComponentsPool.get(compId(botData.entry, `StatValue-${statName}`));
            // if there is not an existing component create a new one
            if(!statValue) {
                statValue = parent.CreateFontString(id(`StatValue-${statName}`), "ARTWORK", "GameFontNormalSmall");
                statValue.SetPoint("TOPRIGHT", parent, "TOP", -4, -5 - (i * 14));
                if(statName === "Damage") {
                    statValue.SetSize(90, 14); 
                } else {
                    statValue.SetSize(50, 14);
                }           
                statValue.SetJustifyH("RIGHT");        
                ComponentsPool.set(compId(botData.entry, `StatValue-${statName}`), statValue); 
            }
            statValue.SetText(`${colors('white')}${leftStats[i][statName]}`);            
        }

        for(let i =0; i < rightStats.length; i++) {
            const statName = Object.keys(rightStats[i])[0];
            let statLabel = <WoWAPI.FontString>ComponentsPool.get(compId(botData.entry, `StatName-${statName}`));
            if(!statLabel) {
                statLabel = parent.CreateFontString(id(`StatName-${statName}`), "ARTWORK", "GameFontNormalSmall");
                statLabel.SetPoint("TOPLEFT", parent, "TOPLEFT", 118, -7 - (i * 14));            
                statLabel.SetText(`${statName}:`);
                statLabel.SetJustifyH("LEFT");
                ComponentsPool.set(compId(botData.entry, `StatName-${statName}`), statLabel); 
            }            

            let statValue = <WoWAPI.FontString>ComponentsPool.get(compId(botData.entry, `StatValue-${statName}`));
            if(!statValue) {
                statValue = parent.CreateFontString(id(`StatValue-${statName}`), "ARTWORK", "GameFontNormalSmall");
                statValue.SetPoint("TOPRIGHT", parent, "TOPRIGHT", -4, -5 - (i * 14));
                statValue.SetSize(50, 14); 
                statValue.SetJustifyH("RIGHT");            
                ComponentsPool.set(compId(botData.entry, `StatValue-${statName}`), statValue); 
            }
            statValue.SetText(`${colors('white')}${rightStats[i][statName]}`);
                        
        }
    }

    function CreateStats(parent: WoWAPI.Frame, botData: BotData) {

        const statsFrame = CreateFrame("Frame", id("CharacterAttr"), parent, null, 1);
        statsFrame.SetSize(230,78); 
        statsFrame.SetPoint("TOPLEFT", 67, -251);
        statsFrame.SetFrameLevel(parent.GetFrameLevel() + 1);
        // statsFrame.SetFrameStrata("LOW");
        statsFrame.SetAlpha(1.0);    
        statsFrame.SetBackdropColor(0,0,0,1.0);    

        const leftTop = statsFrame.CreateTexture(id("StatLeftTop"), "BACKGROUND");
        leftTop.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-StatBackground");
        leftTop.SetSize(115,16);
        leftTop.SetPoint("TOPLEFT", 0, 0);
        leftTop.SetTexCoord(0, 0.8984375, 0, 0.125); 

        const leftmiddle = statsFrame.CreateTexture(id("StatLeftMiddle"), "BACKGROUND");
        leftmiddle.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-StatBackground");
        leftmiddle.SetSize(115,95);
        leftmiddle.SetPoint("TOPLEFT", leftTop, "BOTTOMLEFT", 0, 0);
        leftmiddle.SetTexCoord(0, 0.8984375, 0.125, 0.1953125);

        const leftBottom = statsFrame.CreateTexture(id("StatLeftBottom"), "BACKGROUND");
        leftBottom.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-StatBackground");
        leftBottom.SetSize(115,16);
        leftBottom.SetPoint("TOPLEFT", leftmiddle, "BOTTOMLEFT", 0, 0);
        leftBottom.SetTexCoord(0, 0.8984375, 0.484375, 0.609375);

        const rightTop = statsFrame.CreateTexture(id("StatRightTop"), "BACKGROUND");
        rightTop.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-StatBackground");
        rightTop.SetSize(115,16);
        rightTop.SetPoint("TOPLEFT", leftTop, "TOPRIGHT",0, 0);
        rightTop.SetTexCoord(0, 0.8984375, 0, 0.125);

        const rightMiddle = statsFrame.CreateTexture(id("StatRightMiddle"), "BACKGROUND");
        rightMiddle.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-StatBackground");
        rightMiddle.SetSize(115,95);
        rightMiddle.SetPoint("TOPLEFT", leftmiddle, "TOPRIGHT", 0, 0);
        rightMiddle.SetTexCoord(0, 0.8984375, 0.125, 0.1953125);

        const rightBottom = statsFrame.CreateTexture(id("StatRightBottom"), "BACKGROUND");
        rightBottom.SetTexture("Interface\\PaperDollInfoFrame\\UI-Character-StatBackground");
        rightBottom.SetSize(115,16);
        rightBottom.SetPoint("TOPLEFT", leftBottom, "TOPRIGHT", 0, 0);
        rightBottom.SetTexCoord(0, 0.8984375, 0.484375, 0.609375);

        AddStats(statsFrame, botData);
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

    /**
     * START OF EVENT HANDLERS 
     */

    function ItemSlotOnEnter(frame: WoWAPI.Button) {
        const botId = botStorage.GetActive();        
        const theItem = botStorage.GetBotItem(botId, <BotEquipmentSlotNum>frame.GetID());        
        GameTooltip.SetOwner(frame, "ANCHOR_RIGHT");                 
        if(theItem) {
            GameTooltip.SetHyperlink(theItem.link);
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
                
        const theItem = botStorage.GetBotItem(botId, <BotEquipmentSlotNum>frame.GetID());    
        const [compItem, compItemId, compItemLink] = GetCursorInfo();        

        // IF we have a bank item since it is not our inventory it will crash the server so store it then send equip
        const bankItem = botStorage.GetFromBank();
        if(bankItem) {
            for(let i=0; i <= 4; i++) {
                if(GetContainerNumFreeSlots(<WoWAPI.CONTAINER_ID>i)) {
                    if(i === 0) {
                        PutItemInBackpack();                         
                    } else {
                        PutItemInBag(i);
                    }
                }
            }
        }

        // Special case to handle unquipping items via modified click
        if(IsModifiedClick("AUTOLOOTTOGGLE")) {
            if(theItem && !compItem) {
                aio.Handle("BotMgr", "UnequipTheItem", GetUnitName("player", false), frame.GetID(), botId);
                return; 
            }
        }
        
        if(theItem && !compItem) {
            if(button == "LeftButton") {
                PickupItem(theItem.link);
                // print('Set Bot Pickup Item', botId, theItem.entry, theItem.link); 
                botStorage.BotItemPickedUp(botId, theItem.entry, theItem.link);
                return; 
            }             
        } 

        if(compItem) {
            const slot = frame.GetID(); 

            // if we have a bot virtual item in hand
            if(botStorage.IsPickedUp()) {
                const botItemInHand = botStorage.GetItemInHand();                
                // first unequip item on target bot
                aio.Handle("BotMgr", "UnequipTheItem", GetUnitName("player", false),  slot, botItemInHand.bot);
                aio.Handle("BotMgr", "EquipTheItem", GetUnitName("player", false), botId, slot, compItemId, compItemLink); 
            } else {
                aio.Handle("BotMgr", "EquipTheItem", GetUnitName("player", false), botId, slot, compItemId, compItemLink); 
            }

            // Attempt to equip the item. 
            PlaySound("INTERFACESOUND_CURSORDROPOBJECT");
            ClearCursor(); 
        }
    }

    botMgrHandlers.OnEquipSuccess = (botId: number, slot: BotEquipmentSlotNum, item: Equipment) => {        
        const itemTexture = <WoWAPI.Texture>ComponentsPool.get(compId(botId, `ItemSlotTexture-${slot}`));
        itemTexture.SetTexture(GetItemIcon(item.entry));
        
        // Hide Tooltips otherwise it will show old item. 
        const BotTooltip = <WoWAPI.GameTooltip>ComponentsPool.get(compId(botId, "tooltip"));    
        botStorage.SetBotItem(botId, slot, item); 
            
        BotTooltip.Hide();
        GameTooltip.Hide();             
    }

    botMgrHandlers.OnUnEquipSuccess = (botId: number, slot: BotEquipmentSlotNum) => {                
        const itemTexture = <WoWAPI.Texture>ComponentsPool.get(compId(botId, `ItemSlotTexture-${slot}`));
        /** TO DO move to generic function for getting textures right now is copy/paste */
        let slotName: string = BotSlotName[slot];

        if(slot === BotEquipSlot.FINGER1) slotName = "FINGER0";
        if(slot === BotEquipSlot.FINGER2) slotName = "FINGER1";
        if(slot === BotEquipSlot.TRINKET1) slotName = "TRINKET0";
        if(slot === BotEquipSlot.TRINKET2) slotName = "TRINKET1";
        if(slot === BotEquipSlot.OFFHAND) slotName = "SECONDARYHAND";
        
        const [, itemIcon] = GetInventorySlotInfo(UIInvSlot[`${slotName}SLOT`]);              
        itemTexture.SetTexture(itemIcon);
        
        // Hide Tooltips otherwise it will show old item. 
        const BotTooltip = <WoWAPI.GameTooltip>ComponentsPool.get(compId(botId, "tooltip"));          
        BotTooltip.Hide();
        GameTooltip.Hide();                             
    }

    botMgrHandlers.OnEquipFail = (botId: number, slot: BotEquipmentSlotNum, itemId: number, itemLink: string) => {
        PlaySound("ITEMGENERICSOUND");
        botStorage.BotItemCursorClear(); 
        ClearCursor();
    }


    botMgrHandlers.OnUnEquipFail = (botId: number, slot: BotEquipmentSlotNum) => {
        PlaySound("ITEMGENERICSOUND");
        botStorage.BotItemCursorClear(); 
        ClearCursor();
    }

    botMgrHandlers.UpdateBotData = (data: BotData) => {             
        botStorage.SetBotData(data.entry, data);
        UpdateBotFrame(data);
    }

    function HandleUnequipItem(itemButton: WoWAPI.Button, isBankSlot: boolean = false): void {

        const slotNum = itemButton.GetID();
        const bagId = itemButton.GetParent().GetID();    
        if(!GetContainerItemLink((isBankSlot) ? -1 : bagId, slotNum)) {
            if(botStorage.IsPickedUp()) {
                const item = botStorage.GetItemInHand();                
                aio.Handle("BotMgr", "UnequipTheItem", GetUnitName("player", false), item.slot, item.bot); 
            }
        }        
    }

    /**
     * This handles listening on Bot Items being dragged to the bag. Attaches
     * to the default handler before run and handles bot items specifically. 
     */
    function StoreItemSlotHandlers(): void {

        // Intercept Bank Item Slots Click Event
        for(let bankSlot = 1; bankSlot <= _G[`NUM_BANKGENERIC_SLOTS`]; bankSlot++) {
            ItemClickFuncs.set(`bank:${bankSlot}`, _G[`BankFrameItem${bankSlot}`].GetScript("OnClick"));
            
            _G[`BankFrameItem${bankSlot}`].SetScript("OnClick", (frame: WoWAPI.Button, ...args) => {                                                          

                HandleUnequipItem(frame, true);
                const callback = ItemClickFuncs.get(`bank:${frame.GetID()}`);
                (callback) ? callback(frame, ...args)  : null;
                 //print(`No callback for bank:${bankSlot}`)

                if(CursorHasItem()) {
                    const [compItem, compItemId, compItemLink] = GetCursorInfo();                        
                    botStorage.SetFromBank({
                        slot: frame.GetID(),
                        link: compItemLink,
                        entry: compItemId
                    });
                }
            }); 
        }
                            
    }
    
    function UpdateBotFrame(botData: BotData) {
        
        // Set the new Talent Spec 
        const talentSpec = <WoWAPI.FontString>ComponentsPool.get(compId(botData.entry, "SpecFont"));
        talentSpec.SetText(botData.talentSpecName);

        // Update Resist Frames
        let resist = <WoWAPI.FontString>ComponentsPool.get(compId(botData.entry, "Resist1")); 
        resist.SetText(`${GREEN_FONT_COLOR_CODE}${botData.allStats['Resistance: arcane']}`);
        resist = <WoWAPI.FontString>ComponentsPool.get(compId(botData.entry, "Resist2")); 
        resist.SetText(`${GREEN_FONT_COLOR_CODE}${botData.allStats['Resistance: fire']}`);
        resist = <WoWAPI.FontString>ComponentsPool.get(compId(botData.entry, "Resist3")); 
        resist.SetText(`${GREEN_FONT_COLOR_CODE}${botData.allStats['Resistance: nature']}`);
        resist = <WoWAPI.FontString>ComponentsPool.get(compId(botData.entry, "Resist4")); 
        resist.SetText(`${GREEN_FONT_COLOR_CODE}${botData.allStats['Resistance: frost']}`);
        resist = <WoWAPI.FontString>ComponentsPool.get(compId(botData.entry, "Resist5")); 
        resist.SetText(`${GREEN_FONT_COLOR_CODE}${botData.allStats['Resistance: shadow']}`);

        // Update the stats frame
        AddStats(undefined, botData); 
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
            
            BotItemTooltip = CreateFrame("GameTooltip", id("ItemToolTip"+botData.entry), mainFrame, "GameTooltipTemplate", botData.entry);  
            BotItemTooltip.SetOwner(mainFrame, "ANCHOR_NONE");
            BotItemTooltip.Hide(); 

            // Build all elements of the frame on creation. 
            SetBackground(mainFrame);
            AddPortrait(mainFrame, botData);
            AddCharacterModel(mainFrame, botData);
            AddResistFrame(mainFrame, botData);                    
            AddEquipmentFrames(mainFrame, botData);
            CreateStats(mainFrame, botData);
            AddSoundEffects(mainFrame);

            InfoFramePool.set(botData.entry, mainFrame); 
            ComponentsPool.set(compId(botData.entry, "tooltip"), <WoWAPI.GameTooltip>BotItemTooltip); 
            mainFrame.Show();                              

            // mainFrame.RegisterEvent("CURSOR_UPDATE");
            // mainFrame.RegisterEvent("ITEM_LOCK_CHANGED");
            mainFrame.RegisterEvent("ITEM_UNLOCKED");            
            mainFrame.SetScript("OnEvent", (frame: WoWAPI.Frame, eventName: WoWAPI.Event, ...args) => {                              
                if(eventName === "ITEM_UNLOCKED") {                    
                    botStorage.ClearFromBank();                     
                }
            }); 

        } else {
            mainFrame.Show();                    
            UpdateBotFrame(botData);
        }

     
    }
    
    botMgrHandlers.ShowFrame = (botData: BotData) => {
        botStorage.UpdateBotData(botData.entry, botData);
        ShowBotFrame(botData);
    }    

    // Global calls to set things up
    StoreItemSlotHandlers(); 
    
}

 /** @ts-expect-error */
let aio: AIO = {}; 

const SCRIPT_NAME = 'BotMgr';
import { Logger } from "../../classes/logger";
import { BotUnit } from "./botUnit";
const log = new Logger(SCRIPT_NAME);

import { 
    BotStat,     
    BotEquipLast,     
    ClassesMapping, 
    CharacterClass,
    RacesMapping,
    CharacterRace,    
    QualityType
 } from "../../constants/idmaps";

export type Equipment = {
    entry: number,
    link: string, 
    quality?: QualityType,
    itemLevel?: number,
    enchantmentId?: number,
}

export type EquipmentList = Record<BotEquipmentSlotNum, Equipment>;

 /**
  * Everything we ever wanted to know about the bot info on load
  */
 export type BotData = {
    owner: string,
    name: string,
    level: number,
    talentSpec: number,
    talentSpecName: string,
    roles: number,
    entry: number,
    class: CharacterClass, 
    classId: number,
    race: CharacterRace,
    raceId: number,
    equipment?: EquipmentList,  // SlotName - ItemId  See BotEquipSlot
    leftStats?: Record<string, string>[],
    rightStats?: Record<string, string>[], 
    allStats?: Record<string, string>      // StatId - Value
}; 

/**
 * @todo Move to a data mgr class eventually
 */
const NpcDetailStorage = {} as Record<number, BotData>; 

/**
 * Get the current targetted npc bot or returns undefined if not a bot. 
 * @param player 
 * @returns Creature | undefined
 * @noSelf
 */
function GetBotNpc(player: Player): Creature | undefined {
    try {
        const target = player.GetSelection();
        const creature = target.ToCreature();
    
        if(!creature.IsNPCBot()) {
            return; 
        }
    
        return creature;
    } catch (e) {
        log.error(`Could not lookup bot npc: ${e}`);
    }    
}

/**
 * This target is eligible for the player to manage otherwise ship them a friendly error message
 * @param player 
 * @returns boolean
 * @noSelf
 */
function TargetIsEligible(player: Player) {
    const creature = GetBotNpc(player);

    if(creature) {
        const botOwner = creature.GetBotOwner();                
        if(botOwner.GetGUID() == player.GetGUID()) {
            log.info(`Target is a NPCBot that can be managed by the player`);
            return true;
        }
    }    

    return false;
}

/**
 * Used to retrieve the bot for the player 
 * @param player 
 * @returns Creature
 */
function GetBotForPlayer(player: string, botEntry: number) {
    try {
        const owner = GetPlayerByName(player);
        const creatures = owner.GetCreaturesInRange(300, botEntry) as Creature[];
        const bot = creatures[0];
        return bot; 
    } catch (e) {
        log.error(`Could not get bot for player ${player}: ${e}`);
    }    
}

/**
 * @noSelf
 */
function GetBotDetails(bot: Creature): BotData {

    try {        
        const botUnit = new BotUnit(bot);
        NpcDetailStorage[bot.GetEntry()] = botUnit.toBotData(); 
    } catch (e) {
        log.error(`Could not get bot details: ${e}`);
    }
    
    return NpcDetailStorage[bot.GetEntry()];    
}

/**
 * Sends a client message with update bot details typically fired 
 * after an equipment event. 
 * @param player 
 * @param botEntry 
 */
function RefreshBotData(bot: Creature): void {
    try {        
        bot.RegisterEvent((delay:number, repeats:number, bot: Creature) => {
            const data = GetBotDetails(bot);
            log.info(`Sending bot details to player: ${bot.GetBotOwner().GetName()}`); 
            aio.Handle(bot.GetBotOwner(), 'BotMgr', 'UpdateBotData', data);    
        }, 650, 1);         
        
    } catch (e) {
        log.error(`Could not send bot details: ${e}`);
    }
}

/**
 * Equip an item for the bot and update bot details
 * @param event 
 * @param player 
 * @param command 
 * @returns 
 */
function EquipTheItem(player: string, botEntry: number, slot: BotEquipmentSlotNum, item: number, link: string ): void {
    if(botEntry && typeof botEntry !== 'number') {
        return; 
    }

    try {
        const bot = GetBotForPlayer(player, botEntry);
        let data; 
    
        const isEligible = bot.BotCanEquipItem(item, slot);
           if(!isEligible) {
               log.error(`Bot cannot equip item: ${item} in slot: ${slot}`);
               return; 
           }
           // already equipped
    
           if(bot.BotEquipItem(item, slot)) {                  
                data = GetBotDetails(bot);      
                // log.log(`Bot successfully equipped item: ${item} in slot: ${slot}`);
                aio.Handle(bot.GetBotOwner(), 'BotMgr', 'OnEquipSuccess',bot.GetEntry(), slot, data.equipment[slot]);
                RefreshBotData(bot);
           } else {
                // log.error(`Bot failed to equip item: ${item} in slot: ${slot}`);
                aio.Handle(bot.GetBotOwner(), 'BotMgr', 'OnEquipFail', bot.GetEntry(), slot, item, link);
             }  
    } catch (error) {
        log.error(`Error equipping item: ${error}`);
    }
                
}

function UnequipTheItem(player: string, slot: number, botEntry: number): void {
    try {
        const bot = GetBotForPlayer(player, botEntry);
        
        if(bot.BotUnequipBotItem(slot)) {
            let data = GetBotDetails(bot);
            log.log(`Bot successfully unequipped item at slot: ${slot}`);
            aio.Handle(bot.GetBotOwner(), 'BotMgr', 'OnUnEquipSuccess',bot.GetEntry(), slot);
            
            RefreshBotData(bot);
       } else {
            log.error(`Bot failed to equip item in slot: ${slot}`);
            aio.Handle(bot.GetBotOwner(), 'BotMgr', 'OnUnEquipFail', bot.GetEntry(), slot);
         }  
    } catch (error) {
        log.error(`Error unequipping item: ${error}`);
    }             
}


const ShowBotMgr: player_event_on_command = (event: number,player: Player, command: string): boolean => {
    if(command == 'botmgr') {

        if(TargetIsEligible(player)) {
            const botdetails = GetBotDetails(GetBotNpc(player));

            aio.Handle(player, 'BotMgr', 'ShowFrame', botdetails);
            return false;
        } else {
            player.PlayDirectSound(8959, player); // Play error sound (no money sound            
            player.SendNotification("That is not a NPCBot that you can manage!");
            return false; 
        }
    }

    return true; 
}



/***  
 * @noSelf
 */
function GetBotPanelInfo(player: Player): void  {
    const target = player.GetSelection();
    const creature = target.ToCreature();

    if(!creature.IsNPCBot()) {
        return; 
    }

    try {
        
        const target = player.GetSelection(); 
        PrintInfo(`Server ${target.GetGUID()}`); 

        const entry = GetGUIDEntry(target.GetGUID());
        print(`BotMgr: Parsing Bot Entry: ${entry}`); 
    

    } catch (e) {
        print(`BotMgr: Error parsing bot entry: ${e}`);
    }    
}
const botMgrHandlers = aio.AddHandlers('BotMgr', {    
    TargetIsEligible,
    GetBotPanelInfo, 
    "EquipTheItem": EquipTheItem,
    "UnequipTheItem": UnequipTheItem    
}); 


RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_COMMAND, 
    (...args) => ShowBotMgr(...args)
); /** @ts-expect-error */
let aio: AIO = {}; 
if(!aio.AddAddon()) {

const gamblerHandlers = aio.AddHandlers('GamblerMain', {}); 

const classImages = [
   "Interface/Gambler/druid",
   "Interface/Gambler/deathknight",
   "Interface/Gambler/hunter",
   "Interface/Gambler/mage",
   "Interface/Gambler/paladin",
   "Interface/Gambler/priest",
   "Interface/Gambler/rogue",
   "Interface/Gambler/shaman",
   "Interface/Gambler/warlock",
   "Interface/Gambler/warrior",
];

let slotSpin = []; 
let multiplier = 1; 

// this function will randomly select a class image from the array above
function getRandomClassImage() {
    const spinIndex = Math.floor(Math.random() * classImages.length);
    slotSpin.push(spinIndex);

    return classImages[spinIndex];
}

// reset the spin
function resetSpin () {
    slotSpin = []; 
}


function determineWin(): number {
    let  win = 0;
    let gold = 0;
    let tokens = 0; 

    // Jackpot is all 3 slots as deathknight arthas
    if(slotSpin[0] == 1 && slotSpin[1] == 1 && slotSpin[2] == 1) {

        if(multiplier == 3) {
            tokens = 100; 
        }
        gold = multiplier * 2000;                        
        win = 2;
    }

    if(slotSpin[0] == slotSpin[1] && slotSpin[1] == slotSpin[2]) {
        if(multiplier == 3) {
            tokens = 50; 
        }
        gold = multiplier * 500;        
        win = 1; 
    }

    // Deathknights are considered wild cards
    if(
        (slotSpin[0] == slotSpin[1] && slotSpin[2] === 1) || 
        (slotSpin[0] == slotSpin[2] && slotSpin[1] === 1) || 
        (slotSpin[1] == slotSpin[2] && slotSpin[0] === 1) ||
        (slotSpin[0] == 1 && slotSpin[1] === 1) || 
        (slotSpin[0] == 1 && slotSpin[2] === 1) ||
        (slotSpin[1] == 1 && slotSpin[2] === 1)       
    
    ) {
        if(multiplier == 3) {
            tokens = 3; 
        }
        gold = multiplier * 300;
        win = 1;
    }

    // handle two of the same class in a row
    if((slotSpin[0] == slotSpin[1]) && win == 0) {
        gold = multiplier * 150;        
        win = 1;

        if(slotSpin[1] == 1) {
            if(multiplier == 3) {
                tokens = 3; 
            }
            gold = multiplier * 150;
            win = 1;
        }
    }

    // Return money on any lich king wild
    if((slotSpin[0] == 1 || slotSpin[1] == 1 || slotSpin[2] == 1) && win == 0) {
        if(multiplier == 3) {
            tokens = 0; 
            gold = 100; 
        } else {
            tokens = 0; 
            gold = 20;
        }

        win = 1;
    }

    if(win > 0) {
        PlaySoundFile("Sound\\Interface\\LootCoinLarge.wav", "Master");
        aio.Handle("GamblerMain", "AwardSlotWin", gold, tokens);
    } 

    return win; 
}

function SpinSlots(SlotFrame: WoWAPI.Frame, Slot: WoWAPI.Texture[]) {
    let timer = 1; 
    let counter = 1; 
    
    PlaySoundFile("Sound\\Doodad\\GnomeMachine02StandLoop.wav", "Master");
    SlotFrame.SetScript("OnUpdate", (frame, elapsed) => {
        timer = timer + elapsed; 
        if(timer > 0.20) {
            counter = counter + 1;  
            
            resetSpin(); 
            timer = 0;
            Slot[0].SetTexture(getRandomClassImage());    
            Slot[1].SetTexture(getRandomClassImage());    
            Slot[2].SetTexture(getRandomClassImage());                   

            if(counter > 22) {
                frame.SetScript("OnUpdate", null); 
                
                determineWin(); 
            }
        }
    });
}

function ShowSlots(player: Player) {

    const GamblerMainFrame = CreateFrame("Frame", "GamblerMainFrame", UIParent, "UIPanelDialogTemplate"); 

    GamblerMainFrame.SetSize(512,324); 
    GamblerMainFrame.SetMovable(false);    
    GamblerMainFrame.SetPoint("CENTER"); 
    GamblerMainFrame.EnableMouse(true); 
    GamblerMainFrame.EnableKeyboard(true);      
    GamblerMainFrame.Hide();

    const Title = GamblerMainFrame.CreateFontString("TitleFrame", "OVERLAY", "GameFontHighlight");
    Title.SetPoint("TOPLEFT", 15, -10);
    Title.SetText("Heros Slots");
    Title.SetFont("Fonts\\FRIZQT__.TTF", 10);

    // Slots Display Window
    const Slots = CreateFrame("Frame", "SlotsFrame", GamblerMainFrame);
    Slots.SetSize(420,160);
    Slots.SetPoint("CENTER", 0, 25);
    Slots.SetFrameLevel(1);    
    Slots.SetBackdrop({
        bgFile: "Interface/DialogFrame/UI-DialogBox-Background",
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

    // Slot Columns 1 - 3
    const Slot1 = Slots.CreateTexture("Slot1Texture", null, Slots);
    Slot1.SetSize(128,128);
    Slot1.SetAlpha(0.85);
    Slot1.SetPoint("TOPLEFT", 13, -16);
    Slot1.SetTexture(getRandomClassImage());

    let [ Slot1Point, Slot1Region, Slot1RelPoint, x1offset, y1offset ] = Slot1.GetPoint();

    const Slot2 = Slots.CreateTexture("Slot2Texture", null, Slots);
    Slot2.SetSize(128,128);
    Slot2.SetAlpha(0.85);
    Slot2.SetPoint("TOPLEFT", Slot1Region, Slot1RelPoint, x1offset + 128 + 5, y1offset);
    Slot2.SetTexture(getRandomClassImage());

    let [ Slot2Point, Slot2Region, Slot2RelPoint, x2offset, y2offset ] = Slot2.GetPoint();

    const Slot3 = Slots.CreateTexture("Slot3Texture", null, Slots);
    Slot3.SetSize(128,128);
    Slot3.SetAlpha(0.85);
    Slot3.SetPoint("TOPLEFT", Slot2Region, Slot2RelPoint, x2offset + 128 + 5, y2offset);
    Slot3.SetTexture(getRandomClassImage());

    // Low bet button. 
    const SpinButton = CreateFrame("Button", "SpinButtonLow", GamblerMainFrame, "UIPanelButtonTemplate");
    SpinButton.SetSize(128,32);
    SpinButton.SetPoint("CENTER", -80, -80);
    SpinButton.SetText("Bet 20g Spin");
    SpinButton.SetFrameLevel(2);
    SpinButton.SetScript("OnClick", (frame, mouse, button) => {        
        resetSpin();    
        multiplier = 1;
        aio.Handle("GamblerMain", "PayForSpin", 20*10000);
    }); 

    const SpinButtonHigh = CreateFrame("Button", "SpinButtonHigh", GamblerMainFrame, "UIPanelButtonTemplate");
    SpinButtonHigh.SetSize(128,32);
    SpinButtonHigh.SetPoint("CENTER", 80, -80);
    SpinButtonHigh.SetText("Bet 100g Spin");
    SpinButtonHigh.SetFrameLevel(2);
    SpinButtonHigh.SetScript("OnClick", (frame, mouse, button) => {        
        resetSpin();    
        multiplier = 3;
        aio.Handle("GamblerMain", "PayForSpin", 100*10000);
    }); 

    gamblerHandlers.StartSpin = (player: Player) => {        
        SpinSlots(Slots, [Slot1, Slot2, Slot3]);
        SendChatMessage("Started a spin", "CHANNEL", null, "7");
    }
    
    GamblerMainFrame.Show(); 

    return GamblerMainFrame;
}    

gamblerHandlers.ShowFrame = (player: Player) => {
    ShowSlots(player);     
}    

}

/** @ts-expect-error */
let aio: AIO = {}; 

/**
 * Gambler - Slot Machine
 * This is the server side code used to add gambling games to the server. 
 */


/**
 * Game OBject that will start the slot machine up
 */
const SLOT_GAME_OBJECT = 750001;


const ShowGambler: player_event_on_command = (event: number,player: Player, command: string): boolean => {
    if(command == 'gamble') {
        aio.Handle(player, 'GamblerMain', 'ShowFrame'); 
        return false; 
    }
    return true; 
}; 

/**
 * @noSelf
 */
function PayForSpin(this:void, player: Player, cost: number): void {
    const money = player.GetCoinage(); 
    if(money >= cost) {
        player.ModifyMoney(cost * -1);                 
        aio.Handle(player, 'GamblerMain', 'StartSpin');
    } else {
        player.SendNotification("You don't have enough money to spin the slots!");
        player.PlayDirectSound(8959, player);
    }    
}

function AwardSlotWin(this:void, player: Player, gold: number, tokens: number): void {    
    player.ModifyMoney(gold*10000);    
    if(tokens > 0) {
        player.AddItem(910001, tokens); 
    }

    if(tokens > 75) {
        player.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_GUILD, 0, `|cff1eff00I HIT THE JACKPOT! I won ${gold} gold and ${tokens} tokens!`, player);
    } else {        
        if(tokens > 0) {
            player.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_GUILD, 0, `|cff1eff00I won ${gold} gold and ${tokens} tokens!`, player);        
        } else {
            player.SendChatMessageToPlayer(ChatMsg.CHAT_MSG_GUILD, 0, `|cff1eff00I won ${gold} gold`, player);        
        }
    }
    
}

const SendSlotStart: gameobject_event_on_use = (event: number, gameobject: GameObject, player: Player): boolean => {    
    aio.Handle(player, 'GamblerMain', 'ShowFrame'); 
    return true; 
}

const gamblerHandlers = aio.AddHandlers('GamblerMain', {
    PayForSpin,
    AwardSlotWin
}); 

RegisterPlayerEvent(
    PlayerEvents.PLAYER_EVENT_ON_COMMAND, 
    (...args) => ShowGambler(...args)
); 

RegisterGameObjectEvent(SLOT_GAME_OBJECT, GameObjectEvents.GAMEOBJECT_EVENT_ON_USE, (...args) => SendSlotStart(...args)); 
/**
 * Class for find out information about an account
 */
export type BasicCharacter = {
    guid: number, 
    name: string
}

export class AccountInfo {
    private accountId: number; 

    constructor(accountId: number) {
        this.accountId = accountId;        
    }

    GetAccountMoney(): number {
        const result = CharDBQuery(`SELECT SUM(Money) as AccountMoney from acore_characters.characters WHERE account = ${this.accountId}`);
        const row = result.GetRow() as Record<string, number>;
        return row.AccountMoney;
    }

    GetCharacters(): BasicCharacter[] {
        const result = CharDBQuery(`SELECT guid, name from characters WHERE account = ${this.accountId}`); 
        const characters: BasicCharacter[] = []; 
        
        for(let i=0; i < result.GetRowCount(); i++) {
            const row = result.GetRow();             
            characters.push({ guid: row.guid as number, name: row.name as string });  
            result.NextRow();
        }
        
        return characters; 
    } 

}
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
}const CLASS_WEAPON = 2;
const CLASS_ARMOR = 4;

const WEAPON_TYPES = {
  0: "Axe",
  1: "2H Axe",
  2: "Bow",
  3: "Gun",
  4: "Mace",
  5: "2H Mace",
  6: "Polearm",
  7: "Sword",
  8: "2H Sword",
  10: "Staff",
  13: "Fist Weapon",
  15: "Dagger",
  16: "Thrown",
  17: "Spear",
  18: "Crossbow",
  19: "Wand",
};

const ARMOR_TYPES = {
  0: "Misc",
  1: "Cloth",
  2: "Leather",
  3: "Mail",
  4: "Plate",
  6: "Shield",
};

type ArmorType = "Range" | "Melee" | "Caster" | "Tank" ;

export class ItemDetails {
  item: Item;
  stats: Record<string, number>;

  constructor(item: Item) {
    this.item = item;
    this.stats = {};
  }

  IsWeapon(): boolean {
    return this.item.GetClass() === CLASS_WEAPON;
  }

  IsArmor(): boolean {
    return this.item.GetClass() === CLASS_ARMOR;
  }

  GetWeaponType(): string | false {
    if (!this.IsWeapon()) {
      return false;
    }

    if(this.HasRangedStats()) {
        return "Ranged";
    }

    if(this.HasCasterStats()) {
        return "Caster";
    }

    if(this.HasMeleeStats()) {
        return "Melee";
    }

    if(this.HasDefensiveStats()) {
        return "Tank";
    }

    const stats = this.GetStats();
    if (stats.Description) {

        const desc: string = <string>stats.Description; 

        if (desc.includes("attack power") || desc.includes("critical strike rating") || desc.includes("hit rating") || desc.includes("melee haste rating") || desc.includes("armor penetration rating")) {
            return "Melee";
        }

        if (desc.includes("defense rating") || desc.includes("block") || desc.includes("parry") ) {
            return "Tank";
        }

        if (desc.includes("spell power") || desc.includes("spell critical strike rating") || desc.includes("spell hit rating") || desc.includes("spell haste rating") || desc.includes("spell penetration")) {
            return "Caster";
        }

        if (desc.includes("ranged attack power") || desc.includes("ranged critical strike rating") || desc.includes("ranged hit rating") || desc.includes("ranged haste rating") || desc.includes("ranged weapon penetration")) {
            return "Range";
        }
    }

    // still nothing?  Then just do the best guess based on what the hell it is. 

    if(this.IsMeleeWeapon()) {
        return "Melee";
    }

    if(this.IsRangedWeapon()) {
        return "Range";
    }

    if(this.IsCasterWeapon()) {
        return "Caster";
    }

    if(this.IsArmor() && ARMOR_TYPES[this.item.GetSubClass()] === "Plate") {
        return "Tank";
    }
    
    if(this.IsArmor() && ARMOR_TYPES[this.item.GetSubClass()] === "Mail") {
        return "Ranged";
    }

    if(this.IsArmor() && ARMOR_TYPES[this.item.GetSubClass()] === "Leather") {
        return "Melee";
    }
    if(this.IsArmor() && ARMOR_TYPES[this.item.GetSubClass()] === "Cloth") {
        return "Caster";
    }

    if(this.item.GetSubClass() === 6) {
        return "Tank";
    }

    return false;
  }

  GetArmorType(): ArmorType | false {

    if(!this.IsArmor()) {
        return false;
    }

    if(this.IsRangedArmor()) {
        return "Range";
    }
    if(this.IsCasterArmor()) {
        return "Caster";
    }
    if(this.IsTankArmor()) {
        return "Tank";
    }
    if(this.IsMeleeArmor()) {
        return "Melee";
    }
    
    return false
  }

  IsMeleeWeapon(): boolean {
    if (!this.IsWeapon()) {
      return false;
    }

    const subClass = this.item.GetSubClass();
    switch (WEAPON_TYPES[subClass]) {
      case "Axe":
      case "2H Axe":
      case "Mace":
      case "2H Mace":
      case "Polearm":
      case "Sword":
      case "2H Sword":
      case "Fist Weapon":
      case "Dagger":
      case "Spear":
        if (this.HasCasterStats()) {
          return false;
        }
        return true;
      default:
        return false;
    }
  }

  IsCasterWeapon() {
    if (!this.IsWeapon()) {
      return false;
    }

    switch (WEAPON_TYPES[this.item.GetSubClass()]) {
      case "Mace":
      case "2H Mace":
      case "Sword":
      case "Dagger":
      case "Wand":
      case "Staff":
        if (this.HasCasterStats()) {
          return true;
        }
        return false;
      default:
        return false;
    }
  }

  IsRangedWeapon() {
    if (!this.IsWeapon()) {
      return false;
    }

    switch (WEAPON_TYPES[this.item.GetSubClass()]) {
      case "Bow":
      case "Gun":
      case "Thrown":
      case "Crossbow":
        return true;
      default:
        return false;
    }
  }

  Is2HWeapon() {
    if (!this.IsWeapon()) {
      return false;
    }

    switch (WEAPON_TYPES[this.item.GetSubClass()]) {
      case "2H Axe":
      case "2H Mace":
      case "Polearm":
      case "2H Sword":
      case "Staff":
        return true;
      default:
        return false;
    }
  }

  IsCasterArmor(): boolean {
    if (!this.IsArmor()) {
      return false;
    }

    const type = ARMOR_TYPES[this.item.GetSubClass()];
    if (type === "Cloth") {
      return true;
    }

    if (this.HasCasterStats()) {
      return true;
    }

    return false;
  }

  IsMeleeArmor(): boolean {
    if (!this.IsArmor()) {
      return false;
    }

    const type = ARMOR_TYPES[this.item.GetSubClass()];
    if (type === "Cloth") {
      return false;
    }

    if(this.HasMeleeStats()) {
        return true;
    }

    return false;
  }

  IsRangedArmor(): boolean {
    if (!this.IsArmor()) {
      return false;
    }

    const type = ARMOR_TYPES[this.item.GetSubClass()];
    if (type === "Cloth" || type === "Plate") {
      return false;
    }

    if(this.HasRangedStats()) {
        return true;
    }

    return false;
  }

  IsTankArmor(): boolean {
    if (!this.IsArmor()) {
      return false;
    }

    const type = ARMOR_TYPES[this.item.GetSubClass()];
    if (type === "Cloth" || type === "Mail") {
      return false; 
    }

    if(this.HasDefensiveStats()) {
        return true;
    }

    return false;
  }

  HasCasterStats(): boolean {
    const stats = this.GetStats();

    if (Object.keys(stats).length === 0) {
      return false;
    }

    const casterStats = [5, 6, 18, 21, 27, 30, 41, 42, 43, 45, 47];
    for (let i = 1; i <= 8; i++) {
        let statType = stats[`stat_type${i}`] ? <number>stats[`stat_type${i}`] : 0;
      if (casterStats.includes(statType)) {
        return true;
      }
    }

    return false;
  }

  HasDefensiveStats(): boolean {
    const stats = this.GetStats();
    if (Object.keys(stats).length === 0) {
      return false;
    }

    const defStats = [1,12, 13, 14, 15, 22, 23, 24, 25, 26, 27, 48];
    for (let i = 1; i <= 8; i++) {        
      let statType = stats[`stat_type${i}`] ? <number>stats[`stat_type${i}`] : 0;
      
      if (defStats.includes(statType)) {
        return true;
      }
    }

    return false;
  }

  HasMeleeStats(): boolean {
    const stats = this.GetStats();
    if (Object.keys(stats).length === 0) {
      return false;
    }

    const meleeStats = [3, 16,19,28,31,32,36,37,38,44]
    for (let i = 1; i <= 8; i++) {
        let statType = stats[`stat_type${i}`] ? <number>stats[`stat_type${i}`] : 0;
        if (meleeStats.includes(statType)) {
          return true;
        }
      }
  
      return false;    
  }

  HasRangedStats(): boolean {
    const stats = this.GetStats();
    if (Object.keys(stats).length === 0) {
      return false;
    }

    const rangedStats = [17,20,29,39];
    for (let i = 1; i <= 8; i++) {
      let statType = stats[`stat_type${i}`] ? <number>stats[`stat_type${i}`] : 0;
      if (rangedStats.includes(statType)) {
        return true;
      }
    }
  }

  GetStats(): Record<string, unknown> {
    // return stats if we have already parsed them.
    if (Object.keys(this.stats).length != 0) {
      return this.stats;
    }

    const entry = this.item.GetEntry();
    const sql = `SELECT
    stat_type1, stat_value1,
    stat_type2, stat_value2,
    stat_type3, stat_value3,
    stat_type4, stat_value4,
    stat_type5, stat_value5,
    stat_type6, stat_value6,
    stat_type7, stat_value7,
    stat_type8, stat_value8,
    spell_dbc.Description_Lang_enUS as  Description
    
    FROM item_template 
    LEFT JOIN spell_dbc ON item_template.spellid_1 = spell_dbc.ID
    WHERE entry = ${entry}`;
    const query = WorldDBQuery(sql);
    // print(`GetStats: ${sql}`);

    if(query) {
        return query.GetRow();        
    } else {
        PrintError("ItemDetails/GetStats: Failed to get ITem Stats: ", sql);
        return {};
    }
  }
}
// Purpose: Logger class to log messages to the console.
export class Logger { 
    
    public logname: string; 
    
    constructor(name: string) {
        this.logname = name;            
    }


    log(message: string) {
        const info = debug.getinfo(2, "Sl");
        print(`[${this.logname}][Log]: ${message} was printed from ${info.short_src}:${info.currentline}`);
    }

    debug(message: string) {
        const info = debug.getinfo(2, "Sl");
        PrintDebug(`[${this.logname}][Debug]: ${message} was printed from ${info.short_src}:${info.currentline}`);
    }


    info(message: string) {
        const info = debug.getinfo(2, "Sl");
        PrintInfo(`[${this.logname}][Info]: ${message} was printed from ${info.short_src}:${info.currentline}`);
    }

    warn(message: string) {
        const info = debug.getinfo(2, "Sl");
        print(`\\27[33m[${this.logname}][Warn]: ${message} was printed from ${info.short_src}:${info.currentline}\\27[0m`);
    }

    error(message: string) {
        const info = debug.getinfo(2, "Sl");
        PrintError(`[${this.logname}][Error]: ${message} was printed from ${info.short_src}:${info.currentline}`);
    }
    
}import { AccountInfo } from "./account";

export const GOLD_TO_COPPER = 10000;

/**
 * Converts a copper cost to gold 
 * @param cost <number> Cost of item in copper
 * @returns number
 */
export function ToGold(cost: number) : number {
    return Math.floor(cost / GOLD_TO_COPPER); 
}

/**
 * Converts a gold cost to copper
 * @param gold <number> Cost of item in gold
 * @returns number
 */
export function ToCopper(gold: number) : number {
    return gold*GOLD_TO_COPPER;
}

/**
 * Gets a scaling tax for players to help with balancing the economy for guild features. 
 * @param player Player
 * @param tax amount of tax against player to levy number (0-100)
 * @returns number result in copper
 */
export function GetPlayerTax(player: Player, tax: number) : number {
    const account = new AccountInfo(player.GetAccountId());             
    return (tax/100) * account.GetAccountMoney(); 
}
// A function that will take a min and a max and return a random number between them
export function rollDice(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}declare function GetGameTime(): number;

const PLAYER_TYPE = 'player';
export const StatEvents = {
  TOKEN_CREATED: 'token_created',
  TICKETS_AWARDED: 'darkmoon_tickets_awarded',
};

export class Stats {

  stats = new Map<string, Stat>();
  entity: StatEntity;

  constructor(entity: StatEntity) {
    this.entity = entity;
    this.load();
  }

  static GetStatsByType(type: string, name: string) : Map<number, number> {
    const result = CharDBQuery(`SELECT id, name, value, updated FROM ${type}_stats WHERE name = '${name}'`);
    const stats = new Map<number, number>();
    if(!result) {
      return stats;
    }
    for(let i=0; i < result.GetRowCount(); i++) {
      const row = result.GetRow();      
      stats.set(row.id as number, row.value as number);
      result.NextRow();
    }    
    return stats;
  }; 

  load() : boolean {
    const result = CharDBQuery(`SELECT id, name, value, updated FROM ${this.entity.type}_stats WHERE id = ${this.entity.id}`);
    if(!result) {
      return false;
    }
    for(let i=0; i < result.GetRowCount(); i++) {
      const row = result.GetRow();
      const stat: Stat = {
        name: row.name as string,
        type: this.entity.type,
        value: row.value as number,
        updated: row.updated as number,
        loaded: true
      }
      this.stats.set(stat.name, stat);
      result.NextRow();
    }
    return true;
  }

  save() : void {

    for(const stat of this.stats.values()) {
      if(!stat.loaded) {
        CharDBExecute(`INSERT INTO ${this.entity.type}_stats (id, name, value, updated) VALUES (${this.entity.id}, '${stat.name}', ${stat.value}, ${stat.updated})`);
        PrintDebug(`Inserted ${stat.name} for ${this.entity.type} ${this.entity.id} with value ${stat.value}`);
      } else {
        CharDBExecute(`UPDATE ${this.entity.type}_stats SET value = ${stat.value}, updated = ${stat.updated} WHERE id = ${this.entity.id} AND name = '${stat.name}'`);
        PrintDebug(`Updated ${stat.name} for ${this.entity.type} ${this.entity.id} to ${stat.value}`);
      }
    }
  }

  getStat(name: string) : Stat | undefined {
    return this.stats.get(name);
  }

  setStat(name: string, value: number) : void {
    const stat = this.stats.get(name);
    if(stat) {
      stat.value = value;
      stat.updated = GetGameTime();
    } else {
      this.stats.set(name, {
        name: name,
        type: PLAYER_TYPE,
        value: value,
        updated: GetGameTime(),
        loaded: false
      });
    }
  }

  increment(name: string, amount: number = 1) : void {
    const stat = this.stats.get(name);
    if(stat) {
      stat.value += amount;
      stat.updated = GetGameTime();
    } else {
      this.stats.set(name, {
        name: name,
        type: PLAYER_TYPE,
        value: 0,
        updated: GetGameTime(),
        loaded: false
      });
    }
  }
}

/**
 * Custom player stats that will be
 */
export class PlayerStats extends Stats {

  player: Player;
  playerStats: Stat[] = [];

  constructor(player: Player) {
    super({
      id: player.GetGUID(),
      type: PLAYER_TYPE
    });
    this.player = player;
  }

}

interface StatEntity {
  type: string,
  id: number
}

interface Stat {
  type: string,
  name: string,
  value: number,
  updated: number,
  loaded: boolean
}

/* @noSelfInFile */

type TriggerInput = {    
    triggerName: string, 
    characterGuid: number, 
    isSet: boolean
}

/**
 * Sets a player trigger boolean that can be retieved later as needed
 * @param charTrigger TriggerInput
 */
export function SetTrigger(charTrigger: TriggerInput) {
    let sql = `INSERT INTO player_trigger (triggerName, characterGuid, isSet) `+
    `VALUES ("${charTrigger.triggerName}", ${charTrigger.characterGuid}, ${charTrigger.isSet})`+
    `ON DUPLICATE KEY UPDATE isSet=${charTrigger.isSet}`;         
    print(sql); 
    CharDBExecute(sql);     
}

/**
 * Will return the value of the trigger if it exists, otherwise it will return false
 * @param charGuid number
 * @param triggerName string
 * @returns boolean
 */
export function GetTrigger(charGuid: number, triggerName: string) {
    let sql = `SELECT isSet from player_trigger WHERE triggerName="${triggerName}" and characterGuid=${charGuid}`;
    const result = CharDBQuery(sql); 

    if(result && result.GetRowCount() > 0) {
        return result.GetBool(0)
    } else {
        return false;
    }
    
}
export function colors(name: string) {
    const colors = {
        GREY: "|cff999999",
        RED: "|cffff0000",
        WHITE: "|cffFFFFFF",
        GREEN: "|cff1eff00",
        PURPLE: "|cff9F3FFF",
        BLUE: "|cff0070dd",
        ORANGE: "|cffFF8400",
        YELLOW: "|cffFFFF00",
    }; 

    const keyName = name.toUpperCase();
    if(colors[keyName]) {
        return colors[keyName]; 
    } else {
        return colors.WHITE;
    }
}export const BotEquipSlot = {
    MAINHAND:    0,
    OFFHAND:     1,
    RANGED:      2,
    HEAD:        3,
    SHOULDERS:   4,
    CHEST:       5,
    WAIST:       6,
    LEGS:        7,
    FEET:        8,
    WRIST:       9,
    HANDS:      10,
    BACK:       11,
    BODY:       12, 
    FINGER1:    13,
    FINGER2:    14,
    TRINKET1:   15,
    TRINKET2:   16,
    NECK:       17,
  } as const;

export const BotSlotName = {
    0: "MAINHAND",
    1: "OFFHAND",
    2: "RANGED",
    3: "HEAD",
    4: "SHOULDER",
    5: "CHEST",
    6: "WAIST",
    7: "LEGS",
    8: "FEET",
    9: "WRIST",
    10: "HANDS",
    11: "BACK",
    12: "BODY",
    13: "FINGER1",
    14: "FINGER2",
    15: "TRINKET1",
    16: "TRINKET2",
    17: "NECK",
} as const;

export const BotEquipLast = 17;
export const BotStatLabel = {
  "total str": "Strength",
  "total agi": "Agility",
  "total sta": "Stamina",
  "total int": "Intellect",
  "total spi": "Spirit",
  "Melee AP": "Power",
  "Ranged AP": "Power",
  "armor": "Armor",
  "crit": "Crit %",
  "defense": "Defense",
  "miss": "Miss",
  "dodge": "Dodge",
  "parry": "Parry",
  "block": "Block",
  "block value": "Block Value",
  "Damage taken melee": "Physical Res.",
  "Damage taken spell": "Spell Res.",
  "Damage range mainhand": "Damage",
  "Damage range offhand": "Dmg Off",
  "Attack time offhand": "Speed Off",
  "Damage mult mainhand": "Damage Multiplier (Mainhand)",
  "Attack time mainhand": "Speed Main",
  "Damage range ranged": "Damage Rng",
  "Damage mult ranged": "Damage Multiplier (Ranged)",
  "Attack time ranged": "Speed",
  "base hp": "Base Health",
  "total hp": "Total Health",
  "base mana": "Base Mana",
  "total mana": "Total Mana",
  "spell power": "Bonus Dmg",
  "health regen_5 bonus": "Health Regen (5s Bonus)",
  "haste": "Haste Rating",
  "hit": "Hit Rating",
  "expertise": "Expertise",
  "mana regen_5 casting": "MP5",
  "armor penetration": "Armor Pen",
  "spell penetration": "Spell Pen",
  "Resistance: holy": "Resist Holy",
  "Resistance: fire": "Resist Fire",
  "Resistance: nature": "Resist Nature",
  "Resistance: frost": "Resist Frost",
  "Resistance: shadow": "Resist Shadow",
  "Resistance: arcane": "Resist Arcane",
} as const;

export type BotStatName = Partial<typeof BotStatLabel[keyof typeof BotStatLabel]>;

export const BotStat = {
    MANA:                      0,
    HEALTH:                    1,
    AGILITY:                   3,
    STRENGTH:                  4,
    INTELLECT:                 5,
    SPIRIT:                    6,
    STAMINA:                   7,
    DEFENSE_SKILL_RATING:     12,
    DODGE_RATING:             13,
    PARRY_RATING:             14,
    BLOCK_RATING:             15,
    HIT_MELEE_RATING:         16,
    HIT_RANGED_RATING:        17,
    HIT_SPELL_RATING:         18,
    CRIT_MELEE_RATING:        19,
    CRIT_RANGED_RATING:       20,
    CRIT_SPELL_RATING:        21,
    HIT_TAKEN_MELEE_RATING:   22,
    HIT_TAKEN_RANGED_RATING:  23,
    HIT_TAKEN_SPELL_RATING:   24,
    CRIT_TAKEN_MELEE_RATING:  25,
    CRIT_TAKEN_RANGED_RATING: 26,
    CRIT_TAKEN_SPELL_RATING:  27,
    HASTE_MELEE_RATING:       28,
    HASTE_RANGED_RATING:      29,
    HASTE_SPELL_RATING:       30,
    HIT_RATING:               31,
    CRIT_RATING:              32,
    HIT_TAKEN_RATING:         33,
    CRIT_TAKEN_RATING:        34,
    RESILIENCE_RATING:        35,
    HASTE_RATING:             36,
    EXPERTISE_RATING:         37,
    ATTACK_POWER:             38,
    RANGED_ATTACK_POWER:      39,
    FERAL_ATTACK_POWER:       40,
    SPELL_HEALING_DONE:       41,
    SPELL_DAMAGE_DONE:        42,
    MANA_REGENERATION:        43,
    ARMOR_PENETRATION_RATING: 44,
    SPELL_POWER:              45,
    HEALTH_REGEN:             46,
    SPELL_PENETRATION:        47,
    BLOCK_VALUE:              48,   
    DAMAGE_MIN:               49,
    DAMAGE_MAX:               50,
    ARMOR:                    51,
    RESIST_HOLY:              52,
    RESIST_FIRE:              53,   
    RESIST_NATURE:            54,
    RESIST_FROST:             55,
    RESIST_SHADOW:            56,
    RESIST_ARCANE:            57,
    EXPERTISE:                58,
    MAX_BOT_ITEM_MOD:         59,
    BOT_STAT_MOD_RESISTANCE_START: 51, // Assuming BOT_STAT_MOD_ARMOR is defined somewhere
  } as const;

export const BotStatLast = 58;
  
export const UIInvSlot = {
    AMMOSLOT: "AMMOSLOT",
    HEADSLOT: "HEADSLOT",
    NECKSLOT: "NECKSLOT",
    SHOULDERSLOT: "SHOULDERSLOT",
    SHIRTSLOT: "SHIRTSLOT",
    CHESTSLOT: "CHESTSLOT",
    WAISTSLOT: "WAISTSLOT",
    LEGSSLOT: "LEGSSLOT",
    FEETSLOT: "FEETSLOT",
    WRISTSLOT: "WRISTSLOT",
    HANDSSLOT: "HANDSSLOT",
    FINGER0SLOT: "FINGER0SLOT",
    FINGER1SLOT: "FINGER1SLOT",
    TRINKET0SLOT: "TRINKET0SLOT",
    TRINKET1SLOT: "TRINKET1SLOT",
    BACKSLOT: "BACKSLOT",
    MAINHANDSLOT: "MAINHANDSLOT",
    SECONDARYHANDSLOT: "SECONDARYHANDSLOT",
    RANGEDSLOT: "RANGEDSLOT",
    TABARDSLOT: "TABARDSLOT",
  } as const;

  export const ClassesMapping: Record<number, string> = {
    1: "Warrior",
    2: "Paladin",
    3: "Hunter",
    4: "Rogue",
    5: "Priest",
    6: "Death Knight",
    7: "Shaman",
    8: "Mage",
    9: "Warlock",
    10: "Druid",
    11: "Blade Master",
    12: "Sphynx",
    13: "Archmage",
    14: "Dreadlord",
    15: "Spellbreaker",
    16: "Dark Ranger",
    17: "Necromancer",
    18: "Sea Witch",
    19: "Crypt Lord",
  } as const;

export type CharacterClass = typeof ClassesMapping[keyof typeof ClassesMapping];

export const RacesMapping: Record<number, string> = {
    1: "Human",
    2: "Orc",
    3: "Dwarf",
    4: "Night Elf",
    5: "Undead",
    6: "Tauren",
    7: "Gnome",
    8: "Troll",
    9: "Goblin",
    10: "Blood Elf",
    11: "Draenei",
    12: "Worgen",
} as const;

export type CharacterRace = typeof RacesMapping[keyof typeof RacesMapping];

export const TalentSpecs = {
  WARRIOR_ARMS         : 1,
  WARRIOR_FURY         : 2,
  WARRIOR_PROTECTION   : 3,
  PALADIN_HOLY         : 4,
  PALADIN_PROTECTION   : 5,
  PALADIN_RETRIBUTION  : 6,
  HUNTER_BEASTMASTERY  : 7,
  HUNTER_MARKSMANSHIP  : 8,
  HUNTER_SURVIVAL      : 9,
  ROGUE_ASSASSINATION  : 10,
  ROGUE_COMBAT         : 11,
  ROGUE_SUBTLETY       : 12,
  PRIEST_DISCIPLINE    : 13,
  PRIEST_HOLY          : 14,
  PRIEST_SHADOW        : 15,
  DK_BLOOD             : 16,
  DK_FROST             : 17,
  DK_UNHOLY            : 18,
  SHAMAN_ELEMENTAL     : 19,
  SHAMAN_ENHANCEMENT   : 20,
  SHAMAN_RESTORATION   : 21,
  MAGE_ARCANE          : 22,
  MAGE_FIRE            : 23,
  MAGE_FROST           : 24,
  WARLOCK_AFFLICTION   : 25,
  WARLOCK_DEMONOLOGY   : 26,
  WARLOCK_DESTRUCTION  : 27,
  DRUID_BALANCE        : 28,
  DRUID_FERAL          : 29,
  DRUID_RESTORATION    : 30,
  DEFAULT              : 31,
  BEGIN                : 1,  
  END                  : 31 
} as const;

export const BotRoles = {
  NONE                   : 0,
  TANK                   : 1,
  TANK_OFF               : 2,
  DPS                    : 4,
  HEAL                   : 8,
  RANGED                 : 16,
  PARTY                  : 32, // hidden
  GATHERING_MINING       : 64,
  GATHERING_HERBALISM    : 128,
  GATHERING_SKINNING     : 256,
  GATHERING_ENGINEERING  : 512,
  AUTOLOOT               : 1024,
  AUTOLOOT_POOR          : 2048,
  AUTOLOOT_COMMON        : 4096,
  AUTOLOOT_UNCOMMON      : 8192,
  AUTOLOOT_RARE          : 16384,
  AUTOLOOT_EPIC          : 32768,
  AUTOLOOT_LEGENDARY     : 65536,  
//   MASK_MAIN              : (1 | 2 | 4 | 8 | 16),  
//   MASK_GATHERING         : (64 | 128 | 256 | 512),
//   MASK_LOOTING           : (2048 | 4096 | 8192 | 16384 | 32768 | 65536),  
//   BOT_MAX_ROLE                    : 131072,
} as const;


/**************** ITEM CONSTANTS *************************/

export const ItemQuality = {
  Poor:       0,
  Common:     1,
  Uncommon:   2,
  Rare:       3,
  Epic:       4,
  Legendary:  5,
  Artifact:   6,
  Heirlooms:  7,
} as const;

export type QualityType = typeof ItemQuality[keyof typeof ItemQuality];


export const ItemStat = {
  MANA:                      0,
  HEALTH:                    1,
  AGILITY:                   3,
  STRENGTH:                  4,
  INTELLECT:                 5,
  SPIRIT:                    6,
  STAMINA:                   7,
  DEFENSE_SKILL_RATING:     12,
  DODGE_RATING:             13,
  PARRY_RATING:             14,
  BLOCK_RATING:             15,
  HIT_MELEE_RATING:         16,
  HIT_RANGED_RATING:        17,
  HIT_SPELL_RATING:         18,
  CRIT_MELEE_RATING:        19,
  CRIT_RANGED_RATING:       20,
  CRIT_SPELL_RATING:        21,
  HIT_TAKEN_MELEE_RATING:   22,
  HIT_TAKEN_RANGED_RATING:  23,
  HIT_TAKEN_SPELL_RATING:   24,
  CRIT_TAKEN_MELEE_RATING:  25,
  CRIT_TAKEN_RANGED_RATING: 26,
  CRIT_TAKEN_SPELL_RATING:  27,
  HASTE_MELEE_RATING:       28,
  HASTE_RANGED_RATING:      29,
  HASTE_SPELL_RATING:       30,
  HIT_RATING:               31,
  CRIT_RATING:              32,
  HIT_TAKEN_RATING:         33,
  CRIT_TAKEN_RATING:        34,
  RESILIENCE_RATING:        35,
  HASTE_RATING:             36,
  EXPERTISE_RATING:         37,
  ATTACK_POWER:             38,
  RANGED_ATTACK_POWER:      39,
  FERAL_ATTACK_POWER:       40, // Note: This is not used as of 3.3
  SPELL_HEALING_DONE:       41,
  SPELL_DAMAGE_DONE:        42,
  MANA_REGENERATION:        43,
  ARMOR_PENETRATION_RATING: 44,
  SPELL_POWER:              45,
  HEALTH_REGEN:             46,
  SPELL_PENETRATION:        47,
  BLOCK_VALUE:              48,
} as const;

export const DamageType = {
  Physical:  0,
  Holy:      1,
  Fire:      2,
  Nature:    3,
  Frost:     4,
  Shadow:    5,
  Arcane:    6,
} as const;

export const SocketColor = {
  Meta:   1,
  Red:    2,
  Yellow: 4,
  Blue:   8,
} as const;

export const SocketBonus = {
  3312: '+8 Strength',
  3313: '+8 Agility',
  3305: '+12 Stamina',
  3:    '+8 Intellect',
  2872: '+9 Healing',
  3753: '+9 Spell Power',
  3877: '+16 Attack Power',
} as const;

