/** @ts-expect-error */
let aio: AIO = {}; 
if(!aio.AddAddon()) {
    const audioHandlers = aio.AddHandlers('AIOAudioPlayer', {});
    audioHandlers.PlaySingleSound = (sound: string) => {    
       print("Playing Source Sound: " + sound);
        PlaySoundFile(sound, "Master");

    };    
}