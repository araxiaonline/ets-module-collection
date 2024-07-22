
import { ItemDetails } from "../classes/itemdetails";
const SCALED_ITEMS_START = 20000000; 

function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEnchant(stat: string, min: number, max: number) {

    if(stat.includes("Dodge Rating")) {
        min = 5;
        max = 20;
    }

    if(stat.includes("Hit Rating")) {
        
        if (max > 50) {
            max = 50;            
        }        
    }

    const sql = `
        SELECT ID
        FROM acore_world.spellitemenchantment_dbc 
        WHERE Name_Lang_enUS REGEXP '^\\\\+[0-9]{1,3} ${stat}'  
            and EffectPointsMax_1 >= ${min} and EffectPointsMax_1 <= ${max}
            and RequiredSkillRank = 0
        ORDER BY RAND() LIMIT 1
    `;

    const query = WorldDBQuery(sql);
    if(!query) {
       
        PrintError("BonusEnchantment/getEnchantment - Failed to get enchantment for stat: " + stat);
        print(sql); 
        return null;
    }

    if (query.GetRowCount() === 0) {
        PrintError("BonusEnchantment/getEnchantment - No Enchant Found for stat: " + stat);
        return null;
    }

    return query.GetUInt32(0);
}


function rollEnchant(item: Item, highStats: boolean): number[] {
    const itemDetails = new ItemDetails(item); 

    const tankPrimary =[
        "Dodge Rating",
        "Defense Rating",
        "Block Rating",
        "Block",        
        "Stamina"        
    ];

    const resists = [
        "Fire Resist",
        "Frost Resist",
        "Nature Resist",
        "Shadow Resist",
        "Arcane Resist",
    ];

    const meleePrimary = [
        "Attack Power",
        "Agility",
        "Critical Strike",
        "Strength",        
        "Armor Penetration",                
        "Hit Rating",
        "Haste",
    ];

    const meleeSecondary = [
        "Stamina",
        
        "Dodge Rating",
        "Intellect",        
    ].concat(meleePrimary, resists);

    const rangePrimary = [
        "Attack Power",
        "Range Attack Power",
        "Agility",
        "Critical Strike",
        "Hit Rating",
        "Haste",
        "Armor Penetration",
    ];

    const rangeSecondary = [        
        "Stamina"
    ].concat(rangePrimary, resists);

    const casterPrimary = [
        "Spell Power",
        "Intellect",
        "Critical Strike",
        "Haste",
        "Hit Rating",        
        "Spell Penetration",
    ];

    const casterSecondary = [
        "Stamina",
        "Spirit",    
        "Mana every",    
    ].concat(casterPrimary);
        
    const tankSecondary = [        
        "Strength",
    ].concat(tankPrimary, meleePrimary, resists);

    let enchantId: number; 
    let secEnchantId: number;
    let primary: string;
    let secondary: string;
    const itemCategory = itemDetails.IsArmor() ? itemDetails.GetArmorType() : itemDetails.GetWeaponType();

    if(!itemCategory) { 
        PrintError("BonusEnchantment/rollEnchant - Failed to get item category for item: " + item.GetEntry());
    }

    switch(itemCategory) {
                
        case "Tank": {
            primary = tankPrimary[randomInteger(0, tankPrimary.length - 1)];                            
            secondary = tankSecondary[randomInteger(0, tankSecondary.length - 1)];
            break;
        }
        case "Melee": {
            primary = meleePrimary[randomInteger(0, meleePrimary.length - 1)];                            
            secondary = meleeSecondary[randomInteger(0, meleeSecondary.length - 1)];
            break;
        }
        case "Range": {
            primary = rangePrimary[randomInteger(0, rangePrimary.length - 1)];                            
            secondary = rangeSecondary[randomInteger(0, rangeSecondary.length - 1)];
            break;
        }
        case "Caster": {
            primary = casterPrimary[randomInteger(0, casterPrimary.length - 1)];                            
            secondary = casterSecondary[randomInteger(0, casterSecondary.length - 1)];
            break;
        }
        default: {
            throw new Error("BonusEnchantment/rollEnchant - Invalid Armor Type");
        }
    }

    if (highStats) {
        enchantId = getEnchant(primary, 10, 120);                                

    } else {
        enchantId = getEnchant(primary, 5, 40);        
    }

    if(secondary.includes("Resist")) {
        if(highStats) {
            secEnchantId = getEnchant(secondary, 20, 70);
        } else {
            secEnchantId = getEnchant(secondary, 10, 38);
        }
    } else {
        secEnchantId = getEnchant(secondary, 5, 40);
    }

    return [enchantId, secEnchantId];
}

RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_LOOT_ITEM, (event, player, item) => {
    const itemCls = item.GetClass();
    const subClass = item.GetSubClass();

    if (item.GetQuality() < 2) {
        return;
    }

    if (item.GetEntry() < SCALED_ITEMS_START) {
        return; 
    }

    if (itemCls !== 2 && itemCls !== 4) {
        return; 
    }

    const weaponList = [0,1,2,3,4,5,6,7,8,10,13,15,16,17,18,19];
    const armorList = [0,1,2,3,4,6]

    // not a weapon
    if ( itemCls === 2 && !weaponList.includes(subClass)) {
        return; 
    }

    // not armor
    if ( itemCls === 4 && !armorList.includes(subClass)) {
        return; 
    }

    const ids = rollEnchant(item, true);

    if(ids.length !== 2) {
        PrintError("BonusEnchantment/OnLootITem - Failed to get enchant ids");
        return; 
    }

    if(ids[0]) {
        item.SetEnchantment(ids[0], 4);
    }

    if(ids[1]) {
        item.SetEnchantment(ids[1], 5);
    }


    PrintInfo("BonusEnchantment/OnLootItem - Enchanting item: " + item.GetEntry() + " with enchants: " + ids[0] + " and " + ids[1]);
            
}); 