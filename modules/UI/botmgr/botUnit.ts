import * as Common from '../../constants/idmaps'; 
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