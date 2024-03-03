/** @ts-expect-error */
let aio: AIO = {}; 
if(!aio.AddAddon()) {
    const audioHandlers = aio.AddHandlers('AIOAudioPlayer', {});
    audioHandlers.PlaySingleSound = (sound: string) => {           
        PlaySoundFile(sound, "Master");
    };    
}