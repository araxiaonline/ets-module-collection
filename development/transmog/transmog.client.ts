/** @ts-expect-error */
let aio: AIO = {}; 

// Helper functions to create unique ids for frames and components
// const id = (name: string, entry: number = null) => `Transmog${name}` + (entry ? entry : '');
// const compId = (pageId: number, name: string) => `${botId}:BotMgr${name}`;

if(!aio.AddAddon()) {
    const transmogHandlers = aio.AddHandlers('Transmog', {}); 
    let transmogFrame: WoWAPI.Frame; 

    function mainFrame(player: Player) {

        // Build the main frame 
        if(!transmogFrame) {
            transmogFrame = CreateFrame("Frame", "TransmogMainFrame", UIParent, null, 1 );
            transmogFrame.SetSize(550, 265); 
            transmogFrame.SetPoint("CENTER", UIParent, "CENTER", -100, 0);
            transmogFrame.SetBackdropColor(0, 0, 0, 0.5);
            
            // Create a dressup model 
            const model = CreateFrame()
        }

    }

    transmogHandlers.ShowFrame = (player: Player) => {
        mainFrame(player); 
    }

}
