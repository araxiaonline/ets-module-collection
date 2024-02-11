import { BotData } from './botmgr.server';
import { Equipment } from './botmgr.server';

type ItemInHand = {
    entry: number | undefined,
    link: string | undefined,
    bot: number | undefined,    
    slot: number | undefined    
}

/**
 * This is the UI bot data manager class to make it easier
 * to managed bot data in the UI. 
 */
export class BotStorage {

    private storage: Map<number, BotData> = new Map();
    private active: number = null;
    private pickedUp: boolean = false;
    private itemInHand: ItemInHand = { entry: undefined, link: undefined, bot: undefined, slot: undefined };
    private bankItem: { entry: number, link: string, slot: number } = { entry: 0, link: '', slot: 0 };

    public GetBotData(entry: number): BotData | undefined {
        return this.storage.get(entry);
    }

    GetBotItem(botId: number, slot: BotEquipmentSlotNum): Equipment | undefined {
        const bot = this.GetBotData(botId);
        if(bot) {
            return bot.equipment[slot];
        } 
    }
    
    SetBotData(entry: number, data: BotData): void {
        this.storage.set(entry, data);
    }

    SetBotItem(botId: number, slot: BotEquipmentSlotNum, item: Equipment): void {
        const botData = this.GetBotData(botId);
        if(botData) {
            botData.equipment[slot] = item;
        }

        this.SetBotData(botId, botData);
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

    IsPickedUp(): boolean {
        return this.pickedUp;
    }

    BotItemPickedUp(botId: number, entry: number, link: string): void {
        const bot = this.GetBotData(botId);
        if(bot) {
            this.itemInHand.entry = entry;
            this.itemInHand.link = link;
            this.itemInHand.bot = botId;            
            this.itemInHand.slot = this.GetSlotByItemId(entry);
        }
        this.pickedUp = true;
        
    }

    GetItemInHand(): ItemInHand {
        return this.itemInHand;
    }

    GetFromBank(): { entry: number, link: string, slot: number } | undefined {
        if(!this.bankItem) {
            return undefined;
        }
        
        return this.bankItem;
    }

    SetFromBank(item: { entry: number, link: string, slot: number }): void {
        this.bankItem = item;
    }

    ClearFromBank(): void {
        this.bankItem = undefined;
    }

    BotItemCursorClear(): void {
        this.itemInHand = undefined;
        this.pickedUp = false;
    }

    GetSlotByItemId(entry: number): number | undefined {
        const botData = this.GetBotData(this.GetActive());
        const allItems = Object.entries(botData.equipment)
        for(const [slot, item] of allItems) {
            if(item.entry === entry) {
                return parseInt(slot);
            }
        }
        return;                 
    }


}