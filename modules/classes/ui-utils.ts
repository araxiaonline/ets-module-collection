export function colors(name: string) {
    const colors = {
        GREY: "|cff999999",
        RED: "|cffff0000",
        WHITE: "|cffFFFFFF",
        GREEN: "|cff1eff00",
        PURPLE: "|cff9F3FFF",
        BLUE: "|cff0070dd",
        ORANGE: "|cffFF8400",
        YELLOW: "|cffFFFF00",
    }; 

    const keyName = name.toUpperCase();
    if(colors[keyName]) {
        return colors[keyName]; 
    } else {
        return colors.WHITE;
    }
}

/**
 * Creates an item button with tooltip functionality
 * @param parent The parent frame
 * @param name Unique name for the button
 * @param itemId The item entry ID
 * @param size Size of the button (width and height)
 * @param x X position relative to anchor point
 * @param y Y position relative to anchor point
 * @param anchorPoint Anchor point on the parent frame
 * @returns The created button
 */
export function CreateItemButton(
    parent: WoWAPI.Frame, 
    name: string, 
    itemId: number, 
    size: number = 36, 
    x: number = 0, 
    y: number = 0, 
    anchorPoint: WoWAPI.Point = "LEFT"
): WoWAPI.Button {
    // Create or get existing button

    AIO_debug(`New button being generated for: ${name} inside of ${parent.GetName()}`);


    // IF it already exists just update the texture and gametooltip
    let button: WoWAPI.Button;
    let iconTexture: WoWAPI.Texture;
    button = _G[name];
    iconTexture = _G[`${name}_icon`];
    if(!button) {
        button = CreateFrame("Button", name, parent);
        button.SetSize(size, size);

        iconTexture = button.CreateTexture(`${name}_icon`, "BACKGROUND");
        iconTexture.SetAllPoints();
    }

    // const [itemName, itemLink] = GetItemInfo(itemId);
    // if(!itemName) {
    //     AIO_debug(`Failed to retrieve item! ${itemId}`);
    //     return;
    // }

    const itemTexture = GetItemIcon(itemId);
    if(!itemTexture) {
        AIO_debug(`Failed to retrieve item texture!`);
        return;
    }
        
    iconTexture.SetTexture(itemTexture);
    
    
    // AIO_debug(`The item link is as follows: for item:::: ${itemId}:::::: ${itemLink} :::::: ${itemTexture}`);

    // Add tooltip handlers
    button.SetScript("OnEnter", function(self) {
        GameTooltip.SetOwner(self, "ANCHOR_RIGHT");
        GameTooltip.SetHyperlink(`item:${itemId}`);
        GameTooltip.Show();
    });
    
    button.SetScript("OnLeave", function() {
        GameTooltip.Hide();
    });

    // // Position the button
    button.ClearAllPoints();
    button.SetPoint(anchorPoint, parent, anchorPoint, x, y);
    
    return button;
}

// Just makes a frame closable by escape
/** @noSelf **/
export function EscapeCloseable(frame: WoWAPI.Frame) {
    _G[frame.GetName()] = frame;
    tinsert(_G["UISpecialFrames"], frame.GetName());
}

/** @noSelf **/
export function MakeDraggable(frame: WoWAPI.Frame) {
    frame.SetMovable(true);
    frame.EnableMouse(true);
    frame.RegisterForDrag("LeftButton");
    frame.SetScript("OnDragStart", frame.StartMoving);
    frame.SetScript("OnDragStop", frame.StopMovingOrSizing);
}
