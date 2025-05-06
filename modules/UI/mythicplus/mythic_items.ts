// custom items for advancement 
export const ANCIENT_DICE = 911000;
export const ONYX_SPIKE_RELIC = 911001;
export const VEILSTONE = 911002; 
export const FUSED_RARE_ORE = 911003;
export const FUSED_MYTHIC_ORE = 911004; 
export const FUSED_RARE_CLOTH = 911005;
export const FUSED_MYTHIC_CLOTH = 911006;
export const FUSED_RARE_LEATHER = 911007;
export const FUSED_MYTHIC_LEATHER = 911008;
export const FUSED_RARE_ALCHEMY = 911009;
export const FUSED_MYTHIC_ALCHEMY = 911010;
export const FUSED_RARE_GEM = 911011;
export const FUSED_MYTHIC_GEM = 911012;
export const FUSED_RARE_ESSENCE = 911013;
export const FUSED_MYTHIC_ESSENCE = 911014;
export const FUSED_RARE_ICE_STONE = 911015;
export const FUSED_MYTHIC_ICE_STONE = 911016;
export const FUSED_RARE_INFERNAL_STONE = 911017;
export const FUSED_MYTHIC_INFERNAL_STONE = 911018;
export const FUSED_RARE_ARCANE_CRYSTAL = 911019;
export const FUSED_MYTHIC_ARCANE_CRYSTAL = 911020;
export const FUSED_RARE_DARK_CRYSTAL = 911021;
export const FUSED_MYTHIC_DARK_CRYSTAL = 911022;
export const FUSED_RARE_EARTH_STONE = 911023;
export const FUSED_MYTHIC_EARTH_STONE = 911024;

export const MYTHIC_MATERIALS = {
    ANCIENT_DICE,
    ONYX_SPIKE_RELIC,
    VEILSTONE,
    FUSED_RARE_ORE,
    FUSED_MYTHIC_ORE,
    FUSED_RARE_CLOTH,
    FUSED_MYTHIC_CLOTH,
    FUSED_RARE_LEATHER,
    FUSED_MYTHIC_LEATHER,
    FUSED_RARE_ALCHEMY,
    FUSED_MYTHIC_ALCHEMY,
    FUSED_RARE_GEM,
    FUSED_MYTHIC_GEM,
    FUSED_RARE_ESSENCE,
    FUSED_MYTHIC_ESSENCE,
    FUSED_RARE_ICE_STONE,
    FUSED_MYTHIC_ICE_STONE,
    FUSED_RARE_INFERNAL_STONE,
    FUSED_MYTHIC_INFERNAL_STONE,
    FUSED_RARE_ARCANE_CRYSTAL,
    FUSED_MYTHIC_ARCANE_CRYSTAL,
    FUSED_RARE_DARK_CRYSTAL,
    FUSED_MYTHIC_DARK_CRYSTAL,
    FUSED_RARE_EARTH_STONE,
    FUSED_MYTHIC_EARTH_STONE
};

export const CategoryMapToFused: Record<number, number> = {
    1: FUSED_RARE_CLOTH,
    2: FUSED_MYTHIC_CLOTH,
    3: FUSED_RARE_ALCHEMY,
    4: FUSED_MYTHIC_ALCHEMY,
    5: FUSED_RARE_ORE, 
    6: FUSED_MYTHIC_ORE,
    7: FUSED_RARE_LEATHER, 
    8: FUSED_MYTHIC_LEATHER,
    9: FUSED_RARE_GEM,
    10: FUSED_MYTHIC_GEM,
    11: FUSED_RARE_ESSENCE,
    12: FUSED_MYTHIC_ESSENCE,
    13: FUSED_RARE_ICE_STONE,
    14: FUSED_MYTHIC_ICE_STONE,
    15: FUSED_RARE_INFERNAL_STONE,
    16: FUSED_MYTHIC_INFERNAL_STONE,
    17: FUSED_RARE_ARCANE_CRYSTAL,
    18: FUSED_MYTHIC_ARCANE_CRYSTAL,
    19: FUSED_RARE_DARK_CRYSTAL,
    20: FUSED_MYTHIC_DARK_CRYSTAL,
    21: FUSED_RARE_EARTH_STONE,
    22: FUSED_MYTHIC_EARTH_STONE
};

export const RARE_FUSED_ITEMS: number[] = [
    FUSED_RARE_ORE,
    FUSED_RARE_CLOTH,
    FUSED_RARE_LEATHER,
    FUSED_RARE_ALCHEMY,
    FUSED_RARE_GEM,
    FUSED_RARE_ESSENCE,
    FUSED_RARE_ICE_STONE,
    FUSED_RARE_INFERNAL_STONE,
    FUSED_RARE_ARCANE_CRYSTAL,
    FUSED_RARE_DARK_CRYSTAL,
    FUSED_RARE_EARTH_STONE
];

export const MYTHIC_FUSED_ITEMS: number[] = [
    FUSED_MYTHIC_ORE,    
    FUSED_MYTHIC_CLOTH,
    FUSED_MYTHIC_LEATHER,
    FUSED_MYTHIC_ALCHEMY,
    FUSED_MYTHIC_GEM,
    FUSED_MYTHIC_ESSENCE,
    FUSED_MYTHIC_ICE_STONE,
    FUSED_MYTHIC_INFERNAL_STONE,
    FUSED_MYTHIC_ARCANE_CRYSTAL,
    FUSED_MYTHIC_DARK_CRYSTAL,
    FUSED_MYTHIC_EARTH_STONE
];

// Populated after load with items mapped to fused counterparts. 
// key is the material id, value is the item entries that can be used in fusion
export const FusedToItemMap: Record<number, number[]> = {};

// create a lookup of item ids from the database to the fused items as the items in each category will 
// produce that fused item when the fusion spell is cast on it. 
const CreateItemToFusedMap: eluna_event_on_lua_state_open = (event: number) => {
    const query = WorldDBQuery(`select materialId, entry, name from mp_material_types`);
    if (query) {
        do {
            const materialId = query.GetUInt32(0);
            const entry = query.GetUInt32(1);

            // Initialize the material group if it doesn't exist
            if (!FusedToItemMap[materialId]) {
                FusedToItemMap[materialId] = [entry];
            } else {
                FusedToItemMap[materialId].push(entry);
            }

        } while (query.NextRow());
    }

    PrintInfo(`Loaded ${Object.keys(FusedToItemMap).length} material groups and mapped to fused items`);
    
}
RegisterServerEvent(ServerEvents.ELUNA_EVENT_ON_LUA_STATE_OPEN, (...args) => CreateItemToFusedMap(...args));

export function GetFusedItemFromItemEntry(itemEntry: number): number {
    for (const [materialId, entries] of Object.entries(FusedToItemMap)) {
        if (entries.includes(itemEntry)) {
            return CategoryMapToFused[Number(materialId)];
        }
    }    
    
    return 0;
}

// Get the category of the fused item
export function GetFusedItemMaterialId(itemEntry: number): number {
    for (const [materialId, entries] of Object.entries(FusedToItemMap)) {
        if (entries.includes(itemEntry)) {
            return Number(materialId);
        }
    }    
    return 0;
}

export function IsRareFusionItem(fusedItemEntry: number): boolean {

    PrintInfo(`looking up ${fusedItemEntry}`); 
    return (RARE_FUSED_ITEMS.includes(fusedItemEntry)) ? true : false; 
}

export function IsMythicFusionItem(fusedItemEntry: number): boolean {
    return (MYTHIC_FUSED_ITEMS.includes(fusedItemEntry)) ? true : false; 
}

export function IsVeilstone(itemEntry: number): boolean {
    if(itemEntry == VEILSTONE) {
        return true; 
    } 
    return false; 
}
