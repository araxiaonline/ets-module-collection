/** @ts-expect-error */
let aio: AIO = {}; 
if(!aio.AddAddon()) {
    const audioHandlers = aio.AddHandlers('AIOAudioPlayer', {});
    
    // Define an interface for audio options
    interface AudioOptions {
        volume?: number;   // 0.0 to 1.0 (for relative volume control)
        duration?: number; // Duration in seconds before restoring original volume
    }
    
    // Track which sounds have been played for each player
    const playedSounds: Record<string, string[]> = {};
    
    // Store the default SFX volume for restoration
    let defaultSFXVolume: string | null = null;
    
    // Function to get the current SFX volume safely
    function getSFXVolume(): string {
        try {
            // @ts-ignore - WoW API
            return GetCVar("Sound_SFXVolume");
        } catch (e) {
            return "1.0";
        }
    }
    
    // Function to set the SFX volume safely
    function setSFXVolume(volume: string): void {
        try {
            // @ts-ignore - WoW API
            SetCVar("Sound_SFXVolume", volume);
        } catch (e) {
            // Silently fail if SetCVar is not available
        }
    }
    
    // Create a timer system for WoW 3.3.5
    let totalElapsed = 0;
    let targetTime = 0;
    let isTimerActive = false;
    
    // Create the timer frame
    const timerFrame = CreateFrame("Frame", "hiddenTimingFrame");
    
    // Set up the OnUpdate handler
    timerFrame.SetScript("OnUpdate", function(self: WoWAPI.Frame, elapsed: number) {
        if (!isTimerActive) return;
        
        // Accumulate elapsed time (elapsed is in seconds)
        totalElapsed += elapsed;
        
        // Check if we've reached the target time
        if (totalElapsed >= targetTime) {
            // Restore the volume
            if (defaultSFXVolume !== null) {
                setSFXVolume(defaultSFXVolume);
            }
            
            // Reset the timer
            isTimerActive = false;
            totalElapsed = 0;
        }
    });
    
    // Function to start the timer
    function startVolumeRestoreTimer(duration: number): void {
        if (duration <= 0) return;
        
        // Set the timer parameters
        totalElapsed = 0;
        targetTime = duration;
        isTimerActive = true;
    }
    
    audioHandlers.PlaySingleSound = (sound: string, options?: AudioOptions, playerName?: string) => {
        const volume = options?.volume !== undefined ? options.volume : 1.0;
        const duration = options?.duration !== undefined ? options.duration : 0;
        
        if (defaultSFXVolume === null) {
            defaultSFXVolume = getSFXVolume();
        }
        
        if (volume !== 1.0) {
            setSFXVolume(volume.toString());
            
            // Start the timer to restore volume if duration is specified
            if (duration > 0) {
                startVolumeRestoreTimer(duration);
            }
        }
        
        // Always play through SFX channel
        // @ts-ignore - WoW API
        PlaySoundFile(sound, "SFX");
        
        // If player name is provided, track that this sound was played for this player
        if (playerName) {
            if (!playedSounds[playerName]) {
                playedSounds[playerName] = [];
            }
            
            // Add this sound to the player's played sounds list
            if (!playedSounds[playerName].includes(sound)) {
                playedSounds[playerName].push(sound);
            }
        }
    };
    
    // Add a function to check if a sound has been played for a player
    audioHandlers.HasPlayedSound = (sound: string, playerName: string) => {
        return playedSounds[playerName] && playedSounds[playerName].includes(sound);
    };
    
    // Add a function to reset played sounds for a player or instance
    audioHandlers.ResetPlayedSounds = (playerName?: string) => {
        if (playerName) {
            // Reset for specific player
            playedSounds[playerName] = [];
        } else {
            // Reset for all players
            for (const player in playedSounds) {
                playedSounds[player] = [];
            }
        }
    };
    
    // Add a function to restore the default volume
    audioHandlers.RestoreDefaultVolume = () => {
        if (defaultSFXVolume !== null) {
            setSFXVolume(defaultSFXVolume);
        }
    };
}