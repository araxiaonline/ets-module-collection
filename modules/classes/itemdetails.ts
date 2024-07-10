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

    return false; 
  }

  HasCasterStats(): boolean {
    const stats = this.GetStats();

    if (Object.keys(stats).length === 0) {
      return false;
    }

    const casterStats = [0, 5, 6, 18, 21, 27, 30, 41, 42, 43, 45, 47];
    for (let i = 1; i <= 8; i++) {
      let statType = stats[`StatType${i}`] ? <number>stats[`StatType${i}`] : 0;
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

    const defStats = [1, 12, 13, 14, 15, 22, 23, 24, 25, 26, 27, 48];
    for (let i = 1; i <= 8; i++) {
      let statType = stats[`StatType${i}`] ? <number>stats[`StatType${i}`] : 0;
      if (defStats.includes(statType)) {
        return true;
      }
    }

    return false;
  }

  GetStats(): Record<string, number> {
    // return stats if we have already parsed them.
    if (Object.keys(this.stats).length != 0) {
      return this.stats;
    }

    const entry = this.item.GetEntry();
    const query = WorldDBQuery(`SELECT 
        StatType1, StatValue1, StatType2, StatValue2, StatType3, StatValue3, StatType4, StatValue4, 
        StatType5, StatValue5, StatType6, StatValue6, StatType7, StatValue7, StatType8, StatValue8
        FROM item_template 
        WHERE entry = ${entry}`);

    if (query.GetRowCount() === 0) {
      return {};
    }

    return <Record<string, number>>query.GetRow();
  }
}
