// Force transpiler to rebuild - temporary comment
export type AdvancementType = "Magic" | "Attack" | "Defense" | "FireFrost" | "NatureArcane" | "Shadow";

/*
    Advancement IDs in Database 

    MP_ADV_INTELLECT        = 0,
    MP_ADV_SPIRIT           = 1,
    MP_ADV_STRENGTH         = 2,
    MP_ADV_AGILITY          = 3,
    MP_ADV_STAMINA          = 4,
    MP_ADV_RESIST_ARCANE    = 5,
    MP_ADV_RESIST_FIRE      = 6,
    MP_ADV_RESIST_NATURE    = 7,
    MP_ADV_RESIST_FROST     = 8,
    MP_ADV_RESIST_SHADOW    = 9,
*/

export interface PlayerAdvancement {
    advancementId: number;
    upgradeRank: number;
    diceSpent: number;
    bonus: number;
    history: Array<{rank: number, diceSpent: number, bonus: number}>;
}

export class AdvanceState {

    // Server Side Player Guid
    private playerGuid: number = 0;

    private advancement: string | null = null;

    // Type of panel it is
    private advType: AdvancementType | null = null;

    // Actively selected stat id
    private advId: number | null = null;

    // All the advancements for the player
    private advancements: PlayerAdvancement[] = [];

    // Ids that are being shown in the panel 
    private shownIds: number[] = []

    LoadAdvancements(advancements: PlayerAdvancement[]): void {
        this.advancements = advancements;
    }

    SetType(type: AdvancementType): void {
        this.advType = type;

        if(this.advType === "Magic") {
            this.shownIds = [0, 1];
        }
        else if(this.advType === "Attack") {
            this.shownIds = [2, 3];
        }
        else if(this.advType === "Defense") {
            this.shownIds = [4];
        }
        else if(this.advType === "FireFrost") {
            this.shownIds = [6, 8];
        }
        else if(this.advType === "NatureArcane") {
            this.shownIds = [7, 5];
        }
        else if(this.advType === "Shadow") {
            this.shownIds = [9];
        }
    }

    GetShownIds(): number[] {
        return this.shownIds;
    }

    GetAdvType(): AdvancementType | null {
        return this.advType;
    }

    SetAdvancement(icon: string): void {
        this.advancement = icon;

        if(!icon) {
            this.advId = null; 
            return;
        }

        const advId = this.AdvNameToId(icon);
        if(advId !== -1) {
            this.advId = advId;
        } else {
            throw new Error("Invalid advancement name: " + icon);
        }
    }

    GetAdvancement(): string | null {
        return this.advancement;
    }

    GetAdvancementId(): number {
        return this.advId;
    }

    AdvNameToId(name: string): number {
        switch(name) {
            case "int":
                return 0;
            case "spr":
                return 1;
            case "str":
                return 2;
            case "agi":
                return 3;
            case "sta":
                return 4;
            case "arcane":
                return 5;
            case "fire":
                return 6;
            case "nature":
                return 7;
            case "frost":
                return 8;
            case "shadow":
                return 9;
            default:
                return -1;
        }
    }

    AdvIdToName(id: number): string {
        switch(id) {
            case 0:
                return "Intellect";
            case 1:
                return "Spirit";
            case 2:
                return "Strength";
            case 3:
                return "Agility";
            case 4:
                return "Stamina";
            case 5:
                return "Arcane";
            case 6:
                return "Fire";
            case 7:
                return "Nature";
            case 8:
                return "Frost";
            case 9:
                return "Shadow";
            default:
                return "";
        }
    }

    GetRank(id: number): number {
        if(!this.advancements[id]) {
            AIO_debug("Invalid advancement id: " + id);
            AIO_debug("Advancements Length: ", this.advancements.length);
            return -1;
        }
        return this.advancements[id].upgradeRank;
    }

    GetBonus(id: number): number {
        if(!this.advancements[id]) {
            AIO_debug("Invalid advancement id: " + id);
            AIO_debug("Advancements Length: ", this.advancements.length);
            return -1;
        }
        return this.advancements[id].bonus;
    }

    ClearAdvancement(): void {
        this.advancement = null; 
    }

    SetPlayerGuid(guid: number): void {
        this.playerGuid = guid;
    }
    
    GetPlayerGuid(): number {
        return this.playerGuid;
    }
    
    ClearState(): void {
        this.advancement = null;
        this.advType = null;
        this.advId = null;
        this.shownIds = [];
        this.advancements = [];
        this.playerGuid = 0;
        
    }

}