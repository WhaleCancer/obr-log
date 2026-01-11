# Dice Roll Sound Setup

## Adding Your Dice Roll Sound

To add a dice roll sound effect that plays whenever dice are rolled:

1. **Download or extract your audio file**
   - The sound should be in MP3, OGG, or WAV format
   - Recommended: MP3 format for best browser compatibility
   - Suggested duration: 0.5-2 seconds for a satisfying dice roll sound

2. **Extract audio from YouTube video (if needed)**
   
   If you want to extract audio from a YouTube video, you can use `yt-dlp`:
   
   ```bash
   # Install yt-dlp first (if not already installed)
   # Windows: choco install yt-dlp
   # macOS: brew install yt-dlp
   # Linux: pip install yt-dlp
   
   # Extract audio from YouTube video
   yt-dlp -x --audio-format mp3 "YOUTUBE_VIDEO_URL" -o "dice-roll.%(ext)s"
   ```
   
   Or use an online YouTube to MP3 converter:
   - Visit a service like y2mate.com or similar
   - Paste your YouTube video URL
   - Download the audio file

3. **Save the file**
   - Rename your audio file to `dice-roll.mp3` (or `dice-roll.ogg` or `dice-roll.wav`)
   - Place it in the `public/` folder (same folder as this README)
   - The file should be at: `public/dice-roll.mp3`

4. **Update the code (if using a different format)**
   
   If your file uses a different extension (.ogg or .wav), edit `src/utils/sound.ts`:
   
   ```typescript
   const DICE_ROLL_SOUND_PATH = '/dice-roll.ogg'; // or .wav
   ```

5. **Rebuild the extension**
   ```bash
   npm run build
   ```

6. **Test it**
   - Load the extension in Owlbear Rodeo
   - Roll some dice - you should hear the sound effect!

## Troubleshooting

- **No sound plays**: 
  - Check the browser console for errors
  - Verify the file exists at `public/dice-roll.mp3`
  - Make sure the file is a valid audio format
  - Note: Some browsers require user interaction before allowing audio playback

- **Sound is too loud/quiet**:
  - Edit `src/utils/sound.ts` and adjust the volume:
    ```typescript
    audio.volume = 0.7; // Change 0.7 to your desired volume (0.0 to 1.0)
    ```

- **File not found error**:
  - Ensure the file is named exactly `dice-roll.mp3` (case-sensitive on some systems)
  - Make sure it's in the `public/` folder, not `src/` or `dist/`
  - Rebuild after adding the file: `npm run build`

## Example YouTube Video

If you're looking for a good dice roll sound, search YouTube for:
- "dice roll sound effect"
- "2d6 dice roll sound"
- "tabletop dice rolling sound"

Make sure to respect copyright when extracting audio from videos.
