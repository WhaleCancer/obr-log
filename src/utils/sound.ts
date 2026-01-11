/**
 * Utility functions for playing sounds
 * 
 * To add a custom dice roll sound:
 * 1. Download your audio file (e.g., from YouTube using a tool like youtube-dl or an online converter)
 * 2. Save it as "dice-roll.mp3" (or dice-roll.ogg/dice-roll.wav) in the public/ folder
 * 3. Supported formats: MP3, OGG, WAV
 * 
 * Example command to extract audio from YouTube (requires youtube-dl or yt-dlp):
 * yt-dlp -x --audio-format mp3 "YOUTUBE_URL" -o "dice-roll.%(ext)s"
 */

// Path to the dice roll sound file
const DICE_ROLL_SOUND_PATH = '/dice-roll.mp3';
const SUCCESS_SOUND_PATH = '/tos_keypress2.mp3';
const FAILURE_SOUND_PATH = '/tos_keypress7.mp3';

// Audio element instances (reused for performance)
let diceRollAudio: HTMLAudioElement | null = null;
let successAudio: HTMLAudioElement | null = null;
let failureAudio: HTMLAudioElement | null = null;

/**
 * Get a human-readable description of audio error codes
 */
function getAudioErrorDescription(code: number): string {
    switch (code) {
        case 1: return 'MEDIA_ERR_ABORTED - User aborted loading';
        case 2: return 'MEDIA_ERR_NETWORK - Network error';
        case 3: return 'MEDIA_ERR_DECODE - File corrupted or unsupported format';
        case 4: return 'MEDIA_ERR_SRC_NOT_SUPPORTED - File not found or unsupported format';
        default: return 'Unknown error';
    }
}

/**
 * Initialize the dice roll audio element (lazy loading)
 */
function getDiceRollAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    
    // Create audio element if it doesn't exist
    if (!diceRollAudio) {
        try {
            diceRollAudio = new Audio(DICE_ROLL_SOUND_PATH);
            diceRollAudio.preload = 'auto';
            diceRollAudio.volume = 0.7; // Set volume to 70% (adjust as needed)
            
            // Handle errors gracefully (file might not exist yet)
            diceRollAudio.addEventListener('error', (e) => {
                const error = diceRollAudio?.error;
                if (error) {
                    console.warn('⚠️ Dice roll sound file not found:', DICE_ROLL_SOUND_PATH);
                    console.warn('Error code:', error.code, '-', getAudioErrorDescription(error.code));
                    console.warn('📝 To add a dice roll sound:');
                    console.warn('   1. Place an audio file (MP3, OGG, or WAV) in the public/ folder');
                    console.warn('   2. Name it "dice-roll.mp3" (or .ogg/.wav)');
                    console.warn('   3. Rebuild: npm run build');
                    console.warn('   See public/DICE_ROLL_SOUND_README.md for details');
                }
            });
        } catch (e) {
            console.warn('Failed to create audio element for dice roll sound:', e);
            return null;
        }
    }
    
    return diceRollAudio;
}

// Track if we've warned about missing file (only warn once)
let missingFileWarned = false;

/**
 * Play the dice roll sound effect
 * Note: The audio file has already been edited to:
 * - Cut the first 1 second
 * - Add a 100ms fade-in at the start
 * So we just play from the beginning and return the full duration
 */
export function playDiceRollSound(): Promise<number> {
    return new Promise((resolve) => {
        try {
            const audio = getDiceRollAudio();
            if (!audio) {
                if (!missingFileWarned) {
                    console.warn('⚠️ Dice roll sound not available - audio element could not be created');
                    missingFileWarned = true;
                }
                // Return default duration immediately
                resolve(2000);
                return;
            }
            
            // Get duration (in milliseconds) - resolve immediately with best available duration
            // The file has been edited by Python script to:
            // - Cut the first 1 second (original ~4s -> ~3s, or ~3s -> ~2s)
            // - Add a 100ms fade-in at the start
            // Final duration is typically ~1.97-2.97 seconds depending on original length
            let duration = 2000; // Default fallback
            
            if (audio.readyState >= 1 && audio.duration > 0) {
                // We have duration metadata, use it immediately
                duration = audio.duration * 1000;
            } else if (audio.readyState >= 1) {
                // Metadata is loading but duration not yet available, use default
                duration = 1970; // Approximate duration from previous edits
            }
            
            // Resolve immediately with the duration we have
            // This allows animation to start right away
            resolve(duration);
            
            // Try to play the sound (don't wait for it)
            const tryPlay = () => {
                try {
                    audio.currentTime = 0;
                    audio.volume = 0.7; // Base volume (fade-in is already in the file)
                    
                    if (audio.readyState >= 2) {
                        // Ready to play now
                        audio.play().catch((e) => {
                            // Silently fail - browser may require user interaction
                            if (!missingFileWarned) {
                                console.warn('⚠️ Could not play dice roll sound:', e.message || e);
                                console.warn('This is normal on first interaction - browser requires user interaction before playing audio');
                                missingFileWarned = true;
                            }
                        });
                    } else {
                        // Wait for audio to be ready, then play
                        const handleCanPlay = () => {
                            audio.removeEventListener('canplay', handleCanPlay);
                            audio.currentTime = 0;
                            audio.volume = 0.7;
                            audio.play().catch((e) => {
                                // Silently fail
                            });
                        };
                        audio.addEventListener('canplay', handleCanPlay, { once: true });
                        
                        // If metadata loads, update duration estimate
                        if (audio.readyState < 1) {
                            audio.addEventListener('loadedmetadata', () => {
                                // Duration is now available but we've already resolved
                                // This is just for future reference
                            }, { once: true });
                        }
                    }
                } catch (e) {
                    // Silently fail - sound is optional
                }
            };
            
            // Start trying to play immediately
            tryPlay();
            
        } catch (e) {
            if (!missingFileWarned) {
                console.warn('⚠️ Error setting up dice roll sound:', e);
                missingFileWarned = true;
            }
            // Always resolve immediately with default duration
            resolve(2000);
        }
    });
}

/**
 * Set the volume for the dice roll sound (0.0 to 1.0)
 */
export function setDiceRollVolume(volume: number): void {
    const audio = getDiceRollAudio();
    if (audio) {
        audio.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    }
}

/**
 * Get the success sound audio element (lazy loading)
 */
function getSuccessAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    
    if (!successAudio) {
        try {
            successAudio = new Audio(SUCCESS_SOUND_PATH);
            successAudio.preload = 'auto';
            successAudio.volume = 0.7;
        } catch (e) {
            console.warn('Failed to create success sound audio element:', e);
            return null;
        }
    }
    
    return successAudio;
}

/**
 * Get the failure sound audio element (lazy loading)
 */
function getFailureAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    
    if (!failureAudio) {
        try {
            failureAudio = new Audio(FAILURE_SOUND_PATH);
            failureAudio.preload = 'auto';
            failureAudio.volume = 0.7;
        } catch (e) {
            console.warn('Failed to create failure sound audio element:', e);
            return null;
        }
    }
    
    return failureAudio;
}

/**
 * Play the success sound effect
 */
export function playSuccessSound(): void {
    try {
        const audio = getSuccessAudio();
        if (!audio) return;
        
        audio.currentTime = 0;
        audio.play().catch((e) => {
            // Silently fail - browser may require user interaction
        });
    } catch (e) {
        // Silently fail
    }
}

/**
 * Play the failure sound effect
 */
export function playFailureSound(): void {
    try {
        const audio = getFailureAudio();
        if (!audio) return;
        
        audio.currentTime = 0;
        audio.play().catch((e) => {
            // Silently fail - browser may require user interaction
        });
    } catch (e) {
        // Silently fail
    }
}

/**
 * Check if the dice roll sound file exists
 */
export async function checkDiceRollSoundExists(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
        const response = await fetch(DICE_ROLL_SOUND_PATH, { method: 'HEAD' });
        return response.ok;
    } catch (e) {
        return false;
    }
}
