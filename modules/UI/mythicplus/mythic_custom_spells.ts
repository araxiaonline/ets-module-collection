/**
 * Custom Spells that have been implemented for Mythic Plus components
 */
import { GetFusedItemFromItemEntry, IsVeilstone, IsMythicFusionItem, IsRareFusionItem, GetFusedItemMaterialId } from "./mythic_items";
import { Logger } from "../../classes/logger"; 

const log = new Logger("mythic_custom_spells");
const MAX_STACK_SIZE = 200;

/**
 * Spells for combining old materials
 * 150000 - Ore Fusion
 * 150001 - Cloth Fusion 
 * 150002 - Leather Fusion
 * 150003 - Alchemy Fusion
 * 150004 - Gem Fusion
 * 150005 - Essence Fusion
 * 150006 - Cold Fusion
 * 150007 - Flame Fusion
 * 150008 - Arcane Fusion
 * 150009 - Dark Fusion
 * 150010 - Earth Fusion
 */

// Spells for combining old materials
export const SPELL_ORE_FUSION        = 150000;
export const SPELL_CLOTH_FUSION      = 150001;
export const SPELL_LEATHER_FUSION    = 150002;
export const SPELL_ALCHEMY_FUSION    = 150003;
export const SPELL_GEM_FUSION        = 150004;
export const SPELL_ESSENCE_FUSION    = 150005;
export const SPELL_COLD_FUSION       = 150006;
export const SPELL_FLAME_FUSION      = 150007;
export const SPELL_ARCANE_FUSION     = 150008;
export const SPELL_DARK_FUSION       = 150009;
export const SPELL_EARTH_FUSION      = 150010;
export const SPELL_ORE_FUSION_RANK_2 = 150011;
export const SPELL_CLOTH_FUSION_RANK_2      = 150012;
export const SPELL_LEATHER_FUSION_RANK_2    = 150013;
export const SPELL_ALCHEMY_FUSION_RANK_2    = 150014;
export const SPELL_GEM_FUSION_RANK_2        = 150015;
export const SPELL_ESSENCE_FUSION_RANK_2    = 150016;
export const SPELL_COLD_FUSION_RANK_2       = 150017;
export const SPELL_FLAME_FUSION_RANK_2      = 150018;
export const SPELL_ARCANE_FUSION_RANK_2     = 150019;
export const SPELL_DARK_FUSION_RANK_2       = 150020;
export const SPELL_EARTH_FUSION_RANK_2      = 150021;


export const FUSION_SPELLS_RANK_1 = [150000, 150001, 150002, 150003, 150004, 150005, 150006, 150007, 150008, 150009, 150010];
export const FUSION_SPELLS_RANK_2 = [150011, 150012, 150013, 150014, 150015, 150016, 150017, 150018, 150019, 150020, 150021];

/**
 * Stat Advancement Spells
 * 1. 80000001 - Titans' Strength Aura
 * 2. 80000002 - Steel Forged Aura
 * 3. 80000003 - Celestial Grace Aura
 * 4. 80000004 - Forbidden Knowledge Aura
 * 5. 80000005 - Spectral Reflexes Aura
 * 6. 80000006 - Eldritch Barrier Aura
 * 7. 80000007 - Hellfire Shielding Aura
 * 8. 80000008 - Primal Endurance Aura
 * 9. 80000009 - Lichbane Aura
 * 10. 80000010 - Glacial Fortress Aura
 */

// Stat Advancement Spells
export enum StatAdvancementSpell {
  TITANS_STRENGTH_AURA      = 80000001,
  STEEL_FORGED_AURA         = 80000002,
  CELESTIAL_GRACE_AURA      = 80000003,
  FORBIDDEN_KNOWLEDGE_AURA  = 80000004,
  SPECTRAL_REFLEXES_AURA    = 80000005,
  ELDRITCH_BARRIER_AURA     = 80000006,
  HELLFIRE_SHIELDING_AURA   = 80000007,
  PRIMAL_ENDURANCE_AURA     = 80000008,
  LICHBANE_AURA             = 80000009,
  GLACIAL_FORTRESS_AURA     = 80000010,
}

export const STAT_ADVANCEMENT_SPELLS = {
  TITANS_STRENGTH_AURA: StatAdvancementSpell.TITANS_STRENGTH_AURA,
  STEEL_FORGED_AURA: StatAdvancementSpell.STEEL_FORGED_AURA,
  CELESTIAL_GRACE_AURA: StatAdvancementSpell.CELESTIAL_GRACE_AURA,
  FORBIDDEN_KNOWLEDGE_AURA: StatAdvancementSpell.FORBIDDEN_KNOWLEDGE_AURA,
  SPECTRAL_REFLEXES_AURA: StatAdvancementSpell.SPECTRAL_REFLEXES_AURA,
  ELDRITCH_BARRIER_AURA: StatAdvancementSpell.ELDRITCH_BARRIER_AURA,
  HELLFIRE_SHIELDING_AURA: StatAdvancementSpell.HELLFIRE_SHIELDING_AURA,
  PRIMAL_ENDURANCE_AURA: StatAdvancementSpell.PRIMAL_ENDURANCE_AURA,
  LICHBANE_AURA: StatAdvancementSpell.LICHBANE_AURA,
  GLACIAL_FORTRESS_AURA: StatAdvancementSpell.GLACIAL_FORTRESS_AURA,
};

const RARE_ITEM_REQUIREMENT = 20;
const MYTHIC_ITEM_REQUIREMENT = 5;

// Get the total number of items in the stack for the given item
function GetTotalStackCount(item: Item): number {
    if (!item) return 0;
    return item.GetCount ? item.GetCount() : 0;
}

const playerAngerCount: Record<number, number> = {};

const MythicMaterialFusion: player_event_on_spell_cast = (event: number, player: Player, spell: Spell, skipCheck: boolean) => {
    if(!FUSION_SPELLS_RANK_1.includes(spell.GetEntry()) && !FUSION_SPELLS_RANK_2.includes(spell.GetEntry())) {
        return false;
    }

    const rank = FUSION_SPELLS_RANK_1.includes(spell.GetEntry()) ? 1 : 2; 
    const target = spell.GetTarget() as Item;
    log.info(`Item Details ${target.GetName()}`);
    const hasItem = player.HasItem(target.GetEntry());

    if(!hasItem) {
        log.info("Did not have an item target"); 
        return false;
    }
    
    const fusedItemEntry = GetFusedItemFromItemEntry(target.GetEntry());

    log.info(`Fused Item Entry ${fusedItemEntry}`); 
    if(fusedItemEntry == 0) {
        player.SendBroadcastMessage("You can not cast fuse this material"); 
        player.PlayDirectSound(847);
        return false; 
    }
 
    if(IsVeilstone(target.GetEntry())) {
        PrintInfo(`Veilstone detected`);
        const angerCount = (playerAngerCount[player.GetGUIDLow()] || 0) + 1;
        playerAngerCount[player.GetGUIDLow()] = angerCount;
        if(angerCount === 1) {
            player.SendBroadcastMessage("You are attempting to do something that is forbidden, do no not do it again.");
            player.PlayDirectSound(847);
            return false;
        }

        if(angerCount == 2) {
            player.SendBroadcastMessage("You are about to anger the gods, stop yourself before you cause a rift in the fabric of the world!!!");
            player.PlayDirectSound(847);
            return false
        }

        if(angerCount >= 3) {            
            player.Teleport(0, -11139.2, -1742.44, -29.7367, 0);                        
            player.SendNotification("YOU HAVE ATTEMPTED TO CORRUPT THE VEIL AND HAVE ANGERED THE GODS. YOU HAVE BEEN SENTENCED TO PURGATORY!");            
            player.RemoveItem(target, 1);
            return false; 
        }
    }

    // make sure the correct spell is mapping to the correct material type
    // @see CategoryMapToFused
    const materialId = GetFusedItemMaterialId(target.GetEntry());
    if(materialId == 0) {
        PrintInfo(`No material id found for fused item entry: ${fusedItemEntry}`);
        return false; 
    }
    if(materialId === 1 && spell.GetEntry() !== SPELL_CLOTH_FUSION && spell.GetEntry() !== SPELL_CLOTH_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }
    if(materialId === 2 && spell.GetEntry()!== SPELL_CLOTH_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 3 && spell.GetEntry() !== SPELL_ALCHEMY_FUSION && spell.GetEntry() !== SPELL_ALCHEMY_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 4 && spell.GetEntry() !== SPELL_ALCHEMY_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 5 && spell.GetEntry() !== SPELL_ORE_FUSION && spell.GetEntry() !== SPELL_ORE_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 6 && spell.GetEntry() !== SPELL_ORE_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 7 && spell.GetEntry() !== SPELL_LEATHER_FUSION && spell.GetEntry() !== SPELL_LEATHER_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 8 && spell.GetEntry() !== SPELL_LEATHER_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 9 && spell.GetEntry() !== SPELL_GEM_FUSION && spell.GetEntry() !== SPELL_GEM_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 10 && spell.GetEntry() !== SPELL_GEM_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 11 && spell.GetEntry() !== SPELL_ESSENCE_FUSION && spell.GetEntry() !== SPELL_ESSENCE_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 12 && spell.GetEntry() !== SPELL_ESSENCE_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 13 && spell.GetEntry() !== SPELL_COLD_FUSION && spell.GetEntry() !== SPELL_COLD_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 14 && spell.GetEntry() !== SPELL_COLD_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 15 && spell.GetEntry() !== SPELL_FLAME_FUSION && spell.GetEntry() !== SPELL_FLAME_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 16 && spell.GetEntry() !== SPELL_FLAME_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 17 && spell.GetEntry() !== SPELL_ARCANE_FUSION && spell.GetEntry() !== SPELL_ARCANE_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 18 && spell.GetEntry() !== SPELL_ARCANE_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 19 && spell.GetEntry() !== SPELL_DARK_FUSION && spell.GetEntry() !== SPELL_DARK_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 20 && spell.GetEntry() !== SPELL_DARK_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 21 && spell.GetEntry() !== SPELL_EARTH_FUSION && spell.GetEntry() !== SPELL_EARTH_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

    if(materialId === 22 && spell.GetEntry() !== SPELL_EARTH_FUSION_RANK_2) {
        player.PlayDirectSound(847);
        return false; 
    }

PrintInfo(`materialId: ${materialId} and spell: ${spell.GetEntry()}`);

    if(IsMythicFusionItem(fusedItemEntry)) {
        if(target.GetCount() < MYTHIC_ITEM_REQUIREMENT) {
            player.SendBroadcastMessage("You do not have enough materials to apply fusion.");
            player.PlayDirectSound(847);
            return false;
        }
        

        log.info(`Fusing ${target.GetName()}`); 

        const random = Math.floor(Math.random() * 3) + 1;
        player.PlayDirectSound(10720);
        //player.AddItem(fusedItemEntry, random);
        target.SetCount(target.GetCount() - MYTHIC_ITEM_REQUIREMENT);
        return true; 
    }

    if(IsRareFusionItem(fusedItemEntry)) {
        if(target.GetCount() < RARE_ITEM_REQUIREMENT) {
            player.SendBroadcastMessage("You do not have enough materials to apply fusion"); 
            player.PlayDistanceSound(847); 
            return false; 
        }

        // If the target is a max stack then apply it to the entire stack for QoL reasons
        let totalFused = 0;
        let removeCount = 0;
        if(target.GetCount() === MAX_STACK_SIZE) {            
            for(let i = 0; i < 10; i++) {
                let random = Math.floor(Math.random() * 3) + 1;
                totalFused += random;                
            }            
            removeCount = MAX_STACK_SIZE;
            player.RemoveItem(target, MAX_STACK_SIZE);
        } else {
            totalFused = Math.floor(Math.random() * 3) + 1;
            removeCount = RARE_ITEM_REQUIREMENT;
            target.SetCount(target.GetCount() - RARE_ITEM_REQUIREMENT);
            player.SaveToDB();
            player.RemoveItem(target, 1);
        }

        player.PlayDirectSound(12334);        
        player.AddItem(fusedItemEntry, totalFused);
    }

    return true;
};

    // // Get the item
    // const stackCount = GetTotalStackCount(item);

    // // Determine if this item can be fused
    // // const fusedItemEntry = GetFusedItemFromItemEntry(itemEntry);
    // if (!fusedItemEntry || fusedItemEntry === 0) {
    //     player.SendBroadcastMessage("This item cannot be fused.");
    //     return false;
    // }

    // // Calculate number of batches (every 20 items)
    // const batchSize = 20;
    // const numBatches = Math.floor(stackCount / batchSize);
    // if (numBatches === 0) {
    //     player.SendBroadcastMessage(`You need at least ${batchSize} items to fuse.`);
    //     return false;
    // }

    // // Remove items from player's inventory
    // item.Remove(batchSize * numBatches);

    // // For each batch, roll 1-3 and give that many fused items
    // let totalFused = 0;
    // for (let i = 0; i < numBatches; i++) {
    //     const amount = 1 + Math.floor(Math.random() * 3); // 1-3
    //     player.AddItem(fusedItemEntry, amount);
    //     totalFused += amount;
    // }

    // player.SendBroadcastMessage(
    //     `You fused ${numBatches * batchSize} items into ${totalFused} rare materials!`
    // );

// Register
RegisterPlayerEvent(PlayerEvents.PLAYER_EVENT_ON_SPELL_CAST, (...args) => MythicMaterialFusion(...args));   
