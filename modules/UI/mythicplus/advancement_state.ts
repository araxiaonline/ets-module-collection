import { Logger } from "../../classes/logger";
const log = new Logger("AdvancementState");

export type AdvancementType = "Magic" | "Attack" | "Defense";
export class AdvancementState {

    private advancement: string | null = null;
    private advType: AdvancementType | null = null;

    SetType(type: AdvancementType): void {
        this.advType = type;
    }

    GetAdvType(): AdvancementType | null {
        return this.advType;
    }

    SetAdvancement(icon: string): void {
        this.advancement = icon;
    }   

    GetAdvancement(): string | null {
        return this.advancement;
    }

    ClearAdvancement() {
        this.advancement = null; 
    }

    ClearState() {
        this.advancement = null;
        this.advType = null;
    }

}