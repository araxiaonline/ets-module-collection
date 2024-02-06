import { BotData } from './botmgr.server';

export class BotStorage {

    private storage: Map<number, BotData> = new Map();
    private active: number = null;

    public GetBotData(entry: number): BotData | undefined {
        return this.storage.get(entry);
    }

    GetBotItem(botId: number, slot: BotEquipmentSlotNum): number | undefined {
        const bot = this.GetBotData(botId);
        if(bot) {
            return bot.equipment[slot];
        } 
    }
    
    SetBotData(entry: number, data: BotData): void {

    }

    SetBotItem(botId: number, slot: BotEquipmentSlotNum, item: number): void {
        const bot = this.GetBotData(botId);
        if(bot) {
            bot.equipment[slot] = item;
        }
    }

    UpdateBotData(entry: number, data: BotData): void {
        this.storage.set(entry, data);
    }

    SetActive(botId: number): void {
        this.active = botId;
    }

    GetActive(): number {
        return this.active;
    }

    ClearActive(): void {
        this.active = null;
    }

}