#!/usr/bin/env python3
"""
Edit dice roll sound: cut first second and add fade-in
"""

from pydub import AudioSegment
import os

def edit_dice_sound():
    input_file = "dice-roll.mp3"
    output_file = "dice-roll.mp3"
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found!")
        return False
    
    try:
        # Load the audio file
        print(f"Loading {input_file}...")
        audio = AudioSegment.from_mp3(input_file)
        
        original_duration = len(audio) / 1000.0  # Duration in seconds
        print(f"Original duration: {original_duration:.2f} seconds")
        
        # Cut first 1 second (1000ms)
        skip_start = 1000  # 1 second in milliseconds
        if len(audio) <= skip_start:
            print(f"Error: Audio is too short ({len(audio)}ms), cannot skip {skip_start}ms")
            return False
        
        # Extract audio starting from 1 second
        audio_cut = audio[skip_start:]
        print(f"After cutting first second: {len(audio_cut) / 1000.0:.2f} seconds")
        
        # Add fade-in of 0.1 seconds (100ms)
        fade_in_duration = 100  # 100ms = 0.1 seconds
        audio_faded = audio_cut.fade_in(fade_in_duration)
        
        # Save the edited audio
        print(f"Saving to {output_file}...")
        audio_faded.export(output_file, format="mp3", bitrate="192k")
        
        final_duration = len(audio_faded) / 1000.0
        print(f"Success! Final duration: {final_duration:.2f} seconds")
        print(f"  (Cut {skip_start}ms from start, added {fade_in_duration}ms fade-in)")
        
        return True
        
    except Exception as e:
        print(f"Error editing audio: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = edit_dice_sound()
    exit(0 if success else 1)
