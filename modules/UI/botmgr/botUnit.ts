import * as Common from '../../constants/idmaps'; 
import { Equipment, EquipmentList } from './botmgr.server';

type CharInfo = {
    name: string,
    level: number,
    className: Common.CharacterClass,
    classId: keyof typeof Common.ClassesMapping,
    raceName: Common.CharacterRace,
    raceId: keyof typeof Common.RacesMapping
}

type CharStats = Record<keyof typeof Common.BotStat, number>;
type CharTalentSpec = typeof Common.BotTalentSpecs[keyof typeof Common.BotTalentSpecs];
type CharRoles = typeof Common.BotRoles[keyof typeof Common.BotRoles];

export class BotUnit {
    
    protected myself: Creature; 
    protected myOwner: Player;
    protected charinfo: CharInfo;
    protected equipment: EquipmentList;
    protected stats: CharStats;
    protected talentSpecId: CharTalentSpec;
    protected roles: CharRoles;

    constructor(creature: Creature) {
        if(!creature.IsNPCBot()) {
            return;
        }

        this.myself = creature;
        this.myOwner = <Player>creature.GetOwner();
        this.charinfo = {
            name: creature.GetName(),
            level: creature.GetLevel(),
            className: Common.ClassesMapping[creature.GetClass()],
            classId: creature.GetClass(),
            raceName: Common.RacesMapping[creature.GetRace()],
            raceId: creature.GetRace()
        };
        this.equipment = this._lookupEquipment();
        this.roles = creature.GetBotRoles();

    }

    // public isMeleeDps(): boolean {
    //     const meleeClassMap = [
    //         Common.Characte

    //     ]

    //     if(this.charinfo.classId)

    //     // return this.roles === Common.BotRoles.MeleeDps;
    // }

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
}