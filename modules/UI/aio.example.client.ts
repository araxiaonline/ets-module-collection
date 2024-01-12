
/** @ts-expect-error */
let aio: AIO = {}; 

if(!aio.AddAddon()) {
    const myHandlers = aio.AddHandlers('AIOTest', {}); 
    const MainFrame = CreateFrame("Frame", "MainFrame", UIParent, "UIPanelDialogTemplate"); 
    let frame = MainFrame; 

    frame.SetSize(800,600); 
    frame.SetMovable(true);
    frame.RegisterForDrag("LeftButton"); 
    frame.SetPoint("CENTER", 0, 20); 
    frame.EnableMouse(true); 
    frame.Hide();     

        
    frame.SetScript("OnDragStart", frame.StartMoving); 
    frame.SetScript("OnHide", frame.StopMovingOrSizing);     
    frame.SetScript("OnDragStop", frame.StopMovingOrSizing); 

    let increment = -40;

    const ImgFrame = CreateFrame("Frame", "ImgFrame", frame); 
    ImgFrame.SetSize(800,600);
    ImgFrame.SetPoint("CENTER", 0, 20 );
    ImgFrame.SetFrameLevel(1); 

    const PageFrame = MainFrame.CreateTexture("MainFrameImgTexture", null, ImgFrame);
    PageFrame.SetSize(512,512);
    PageFrame.SetPoint("CENTER", 0, -15);
    PageFrame.SetTexture("Interface/Comics/Comic_Page3");


    frame.SetScript("OnEnter", (frame) => {                
        
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

}

