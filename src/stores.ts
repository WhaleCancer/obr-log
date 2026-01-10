import { writable } from 'svelte/store';
import { localStore } from './localStore';

const initialSheet = {
    id: 1,
    name: "",
    notes: "Welcome to your Star Trek character sheet!\n\nTo use:\n• Click on values to edit them directly.\n• Click EDIT to modify stat names, section titles, and add/remove entries.\n• Characteristics have separate Initial and Current values.\n• Special Skills are organized by category.\n• EXPORT your character to JSON and IMPORT it back anytime.\n• GMs can view all player sheets via the tabs at the top.",
    portrait: "",
    sections: [
      {
        id: 1,
        name: "Character Info",
        stats: [
          {
            id: 1,
            name: "Name",
            value: ""
          },
          {
            id: 2,
            name: "Species",
            value: "Human"
          },
          {
            id: 3,
            name: "Rank",
            value: "Lieutenant Commander"
          },
          {
            id: 4,
            name: "Division",
            value: "Command"
          },
          {
            id: 5,
            name: "Assignment",
            value: "USS Castor"
          },
          {
            id: 6,
            name: "Experience",
            value: "0"
          }
        ]
      },
      {
        id: 3,
        name: "Combat Special Skills",
        stats: [
          {
            id: 1,
            name: "Armor",
            value: "0"
          },
          {
            id: 2,
            name: "Brawling",
            value: "0"
          },
          {
            id: 3,
            name: "Firearms - Heavy",
            value: "0"
          },
          {
            id: 4,
            name: "Firearms - Light",
            value: "0"
          },
          {
            id: 5,
            name: "Firearms - Vehicle",
            value: "0"
          },
          {
            id: 6,
            name: "Melee Weapons",
            value: "0"
          },
          {
            id: 7,
            name: "Starship Gunnery",
            value: "0"
          },
          {
            id: 8,
            name: "Thrown",
            value: "0"
          }
        ]
      },
      {
        id: 4,
        name: "Movement Special Skills",
        stats: [
          {
            id: 1,
            name: "Acrobatics",
            value: "0"
          },
          {
            id: 2,
            name: "Climb",
            value: "0"
          },
          {
            id: 3,
            name: "Dodge",
            value: "0"
          },
          {
            id: 4,
            name: "Jump",
            value: "0"
          },
          {
            id: 5,
            name: "Pilot - Air",
            value: "0"
          },
          {
            id: 6,
            name: "Pilot - Ground",
            value: "0"
          },
          {
            id: 7,
            name: "Pilot - Space",
            value: "0"
          },
          {
            id: 8,
            name: "Pilot - Water",
            value: "0"
          },
          {
            id: 9,
            name: "Ride",
            value: "0"
          },
          {
            id: 10,
            name: "Run",
            value: "0"
          },
          {
            id: 11,
            name: "Swim",
            value: "0"
          }
        ]
      },
      {
        id: 5,
        name: "Stealth Special Skills",
        stats: [
          {
            id: 1,
            name: "Awareness",
            value: "0"
          },
          {
            id: 2,
            name: "Disguise",
            value: "0"
          },
          {
            id: 3,
            name: "Locks",
            value: "0"
          },
          {
            id: 4,
            name: "Sleight of Hand",
            value: "0"
          },
          {
            id: 5,
            name: "Sneak",
            value: "0"
          },
          {
            id: 6,
            name: "Traps",
            value: "0"
          }
        ]
      },
      {
        id: 6,
        name: "Science Special Skills",
        stats: [
          {
            id: 1,
            name: "Archaeology",
            value: "0"
          },
          {
            id: 2,
            name: "Biology",
            value: "0"
          },
          {
            id: 3,
            name: "Botany",
            value: "0"
          },
          {
            id: 4,
            name: "Chemistry",
            value: "0"
          },
          {
            id: 5,
            name: "Ecology",
            value: "0"
          },
          {
            id: 6,
            name: "Geology",
            value: "0"
          },
          {
            id: 7,
            name: "Meteorology",
            value: "0"
          },
          {
            id: 8,
            name: "Oceanography",
            value: "0"
          },
          {
            id: 9,
            name: "Physics",
            value: "0"
          },
          {
            id: 10,
            name: "Zoology",
            value: "0"
          }
        ]
      },
      {
        id: 7,
        name: "Knowledge Special Skills",
        stats: [
          {
            id: 1,
            name: "Animal Skills",
            value: "0"
          },
          {
            id: 2,
            name: "Astronavigation",
            value: "0"
          },
          {
            id: 3,
            name: "Bargain",
            value: "0"
          },
          {
            id: 4,
            name: "Bureaucracy",
            value: "0"
          },
          {
            id: 5,
            name: "Communications",
            value: "0"
          },
          {
            id: 6,
            name: "Computers",
            value: "0"
          },
          {
            id: 7,
            name: "Engineering",
            value: "0"
          },
          {
            id: 8,
            name: "Etiquette",
            value: "0"
          },
          {
            id: 9,
            name: "Evaluate",
            value: "0"
          },
          {
            id: 10,
            name: "Languages",
            value: "0"
          },
          {
            id: 11,
            name: "Law",
            value: "0"
          },
          {
            id: 12,
            name: "Leadership",
            value: "0"
          },
          {
            id: 13,
            name: "Medicine",
            value: "0"
          },
          {
            id: 14,
            name: "Planetary Navigation",
            value: "0"
          },
          {
            id: 15,
            name: "Sensors",
            value: "0"
          },
          {
            id: 16,
            name: "Survival",
            value: "0"
          },
          {
            id: 17,
            name: "Trade Knowledge",
            value: "0"
          }
        ]
      },
      {
        id: 8,
        name: "Psionic Special Skills",
        stats: [
          {
            id: 1,
            name: "Emotional Suppression",
            value: "0"
          },
          {
            id: 2,
            name: "Logic Enhanced",
            value: "0"
          },
          {
            id: 3,
            name: "Mental Discipline",
            value: "0"
          },
          {
            id: 4,
            name: "Mind Meld",
            value: "0"
          },
          {
            id: 5,
            name: "Mind Shield",
            value: "0"
          },
          {
            id: 6,
            name: "Nerve Pinch",
            value: "0"
          },
          {
            id: 7,
            name: "Precognition",
            value: "0"
          },
          {
            id: 8,
            name: "Telepathy",
            value: "0"
          }
        ]
      },
      {
        id: 9,
        name: "Characteristics",
        stats: [
          {
            id: 1,
            name: "SKILL",
            value: "0/0"
          },
          {
            id: 2,
            name: "STAMINA",
            value: "0/0"
          },
          {
            id: 3,
            name: "LUCK",
            value: "0/0"
          },
          {
            id: 4,
            name: "PSIONICS",
            value: "0/0"
          },
          {
            id: 5,
            name: "PSI POINTS",
            value: "0/0"
          }
        ]
      },
      {
        id: 10,
        name: "Talents",
        stats: []
      },
      {
        id: 11,
        name: "Drawbacks",
        stats: [
          {
            id: 1,
            name: "Example Drawback",
            value: "Description or notes"
          }
        ]
      }
    ]
  }
const initialTheme = {
    primary:        "255,255,255",
    secondary:      "42,42,42",
    accent:         "255,213,140", // Gold (Command Division default)
    textShadow:     "1px 1px 2px #000000"
};

// Division color mappings (accent colors)
const divisionColors: Record<string, string> = {
    "Command": "255,213,140",      // Gold
    "Sciences": "107,180,255",     // Blue
    "Medical": "107,180,255",      // Blue (same as Sciences)
    "Engineering": "255,100,100",  // Red
    "Security": "255,100,100"      // Red (same as Engineering)
};

// Function to get theme colors based on division
export function getThemeForDivision(division: string) {
    const accentColor = divisionColors[division] || divisionColors["Command"];
    return {
        primary: initialTheme.primary,
        secondary: initialTheme.secondary,
        accent: accentColor,
        textShadow: initialTheme.textShadow
    };
}


// Export function to get a fresh copy of initial sheet
export function getInitialSheet() {
    // Return a deep copy of initialSheet to avoid reference issues
    return JSON.parse(JSON.stringify(initialSheet));
}

// Export function to reset sheet to initial values
export function resetSheet() {
    sheet.set(getInitialSheet());
}

export const editing = writable(false);
export const sheet = localStore('star-trek-character-sheet', initialSheet);
export const theme = localStore('star-trek-character-sheet-theme', initialTheme);
