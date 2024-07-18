const CLASS_WEAPON = 2;
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
