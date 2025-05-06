/** @ts-expect-error */
let aio: AIO = {}; 

const SCRIPT_NAME = 'UpgradeUI';
import { Logger } from "../../classes/logger";
const log = new Logger(SCRIPT_NAME);

// Flag to track if materials have been loaded
let materialsLoaded = false;

type ItemType = {
    entry: number;
    name: string;
}

type Materials = {
    name: string;
    items: Array<ItemType>
}

const upgradeMaterials: Record<number, Materials> = {};

/**
 * Helper function to safely get items from a material
 */
const getItemsFromMaterial = (material: Materials): Array<ItemType> => {
    if (!material) {
        return [];
    }
    
    if (!material.items) {        
        material.items = [];
    }
    
    return material.items;
};

/**
 * Handles the logic for showing the upgrade UI when a player types .advanceme
 */
const ShowUpgradeUI: player_event_on_command = (event: number, player: Player, command: string): boolean => {
    if (command === "advanceme") {
        log.info(`Showing Upgrade UI for player: ${player.GetName()}`);
        aio.Handle(player, 'UpgradeUI', 'ShowUpgradeWindow');
        return false;
    }
    return true;
};

/**
 * Get a list of materials from the database that can be used for mythic plus advancement
 * @param event World startup event
 */
// const GetMaterialsList: eluna_event_on_lua_state_open = (event: number) => { 
    
//     const query = WorldDBQuery(`select materialId, entry, name from mp_material_types`);

//     const categoryMap: Record<number, string> = {
//         1: "Cloth",
//         2: "Rare Cloth",
//         3: "Plants",
//         4: "Rare Plants",
//         5: "Ore", 
//         6: "Rare Ore",
//         7: "Leather", 
//         8: "Rare Leather",
//         9: "Gems",
//         10: "Rare Gems",
//         11: "Enchanting",
//         12: "Rare Enchanting",
//         13: "Water Elements",
//         14: "Rare Water Elements",
//         15: "Fire Elements",
//         16: "Rare Fire Elements",
//         17: "Nature Elements",
//         18: "Rare Earth Elements",
//         19: "Shadow Elements",
//         20: "Rare Shadow Elements",
//         21: "Arcane Elements",
//         22: "Rare Arcane Elements",
//         23: "Veilstone",
//     };

//     if (query) {
//         do {
//             const materialId = query.GetUInt32(0);
//             const entry = query.GetUInt32(1);
//             const categoryName = categoryMap[materialId] || "Unknown";

//             // Initialize the material group if it doesn't exist
//             if (!upgradeMaterials[materialId]) {
//                 upgradeMaterials[materialId] = {
//                     name: categoryName,
//                     items: []
//                 };
//             }

//             // Add the item to the material group
//             upgradeMaterials[materialId].items.push({
//                 entry: entry,
//                 name: query.GetString(2)
//             });

//         } while (query.NextRow());
//     }

//     log.info(`Loaded ${Object.keys(upgradeMaterials).length} material groups with items for mythic plus advancement`);
//     materialsLoaded = true;
// };

// /**
//  * This will show all the counts for a player by from the upgradeMaterials object
//  */
// function GetMaterials(this:void, player: Player) {

//     // Create a readable string representation of the materials and their counts
//     let materialsString = 'Your Mythic+ Advancement Materials:\n';
//     log.info("Showing material counts");
    
//     // Track total materials by category
//     const materialCounts: Record<number, number> = {};
    
//     // Initialize counts for all categories
//     const materialIds = Object.keys(upgradeMaterials);
//     log.info(`Found ${materialIds.length} material groups`);
    
//     // Initialize all material counts to 0
//     for (let i = 0; i < materialIds.length; i++) {
//         const materialId = materialIds[i];
//         materialCounts[materialId] = 0;
//     }
    
//     // Process each material group
//     for (let i = 0; i < materialIds.length; i++) {
//         const materialId = materialIds[i];
//         log.info(`Processing material ID: ${materialId}`);
        
//         // Get the material object and verify it exists
//         const material = upgradeMaterials[materialId];
//         if (!material) {
//             log.info(`Material with ID ${materialId} is undefined`);
//             continue;
//         }
        
//         // Get the material name
//         const materialName = material.name || "Unknown Material";
//         materialsString = materialsString + '\n' + materialName + ':\n';
        
//         // Get items using our helper function to ensure it's not nil
//         const items = getItemsFromMaterial(material);
//         log.info(`Material ${materialName} has ${items.length} items`);
        
//         if (items.length === 0) {
//             log.info(`No items found for material ${materialName}`);
//             materialsString = materialsString + '  No items found in this category\n';
//             continue;
//         }
        
//         // Process each item in the material category
//         let categoryTotal = 0;
//         for (let j = 0; j < items.length; j++) {
//             // Get the item and verify it exists
//             const item = items[j];
//             if (!item) {
//                 log.info(`Item at index ${j} is undefined for material ${materialName}`);
//                 continue;
//             }
            
//             // Get the item entry and name
//             const itemEntry = item.entry;
//             const itemName = item.name || "Unknown Item";
            
//             log.info(`Checking item ${itemName} (${itemEntry})`);
            
//             try {
//                 // Get the item count
//                 const count = player.GetItemCount(itemEntry, true); // true = include bank
//                 log.info(`Player has ${count} of item ${itemName}`);
                
//                 // Add to category total
//                 categoryTotal = categoryTotal + count;
                
//                 // Only show items the player has
//                 if (count > 0) {
//                     materialsString = materialsString + '  - ' + itemName + ': ' + count + '\n';
//                 }
//             } catch (error) {
//                 log.info(`Error getting count for item ${itemName}: ${error}`);
//             }
//         }
        
//         // Store the category total
//         materialCounts[materialId] = categoryTotal;
        
//         // Add total for this category
//         materialsString = materialsString + '  Total ' + materialName + ': ' + categoryTotal + '\n';
//     }
    
//     log.info("Initialized material counts");

//     // Send the material counts to the player
//     player.SendBroadcastMessage(materialsString);
    
//     // Log the material counts for debugging
//     log.info('Showed material counts for player: ' + player.GetName());
    
//     return true;
// }

// const UpgradeHandlers = aio.AddHandlers("UpgradeUI", {
//     ShowMaterialCount
// });

/**
 * Register the command event to listen for ".advanceme"
 */
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_COMMAND, (...args) => ShowUpgradeUI(...args));

/**
 * Get all the material types from the database
 * RegisterServerEvent(ServerEvents.ELUNA_EVENT_ON_LUA_STATE_OPEN, (...args) => GetMaterialsList(...args));
 */

