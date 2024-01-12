/** @ts-expect-error */
let aio: AIO = {}; 


if(!aio.AddAddon()) {

    const myHandlers = aio.AddHandlers('AIOTest', {}); 
    const FrameTest = CreateFrame("Frame", "FrameTest2", UIParent, "UIPanelDialogTemplate"); 
    let frame = FrameTest; 

    frame.SetSize(400,300); 
    frame.SetMovable(true);
    frame.RegisterForDrag("LeftButton"); 
    frame.SetPoint("CENTER"); 
    frame.EnableMouse(true); 
    frame.Hide();     
    frame.SetHyperlinksEnabled(true);

    frame.SetScript("OnHyperlinkClick")
    frame.SetScript("OnDragStart", frame.StartMoving); 
    frame.SetScript("OnHide", frame.StopMovingOrSizing);     
    frame.SetScript("OnDragStop", frame.StopMovingOrSizing); 

    let increment = -40;

    frame.SetScript("OnEnter", (frame: WoWAPI.Frame) => {                
        
        if(CursorHasItem()) {
            let [objectType, objectId, link] = GetCursorInfo(); 
            const text = frame.CreateFontString('itemdragged', "OVERLAY", "GameFontHighlight"); 
            text.SetPoint("TOPLEFT", 10,increment); 
            text.SetText(link); 
            increment = increment - 15;     
        }
        
        



        // if(CursorHasItem()) {
        //     print(type); 
        //     print(GetCursorInfo()); 
        //     print(details); 
        // }

        // print(CursorHasItem()); 

    }); 

    myHandlers.ShowFrame = (player: Player) => {
        frame.Show(); 
    }    

    frame.Show(); 

}