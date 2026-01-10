import { writable } from 'svelte/store';
import { localStore } from './localStore';

const initialSheet = {
    id: 1,
    name: "Star Trek Character",
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
            value: ""
          },
          {
            id: 3,
            name: "Rank",
            value: ""
          },
          {
            id: 4,
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
            name: "Dodge",
            value: "0"
          },
          {
            id: 3,
            name: "Pilot - Air",
            value: "0"
          },
          {
            id: 4,
            name: "Pilot - Ground",
            value: "0"
          },
          {
            id: 5,
            name: "Pilot - Space",
            value: "0"
          },
          {
            id: 6,
            name: "Pilot - Water",
            value: "0"
          },
          {
            id: 7,
            name: "Ride",
            value: "0"
          },
          {
            id: 8,
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
            name: "Sneaking",
            value: "0"
          },
          {
            id: 6,
            name: "Trap Knowledge",
            value: "0"
          }
        ]
      },
      {
        id: 6,
        name: "Knowledge Special Skills",
        stats: [
          {
            id: 1,
            name: "Animal Lore",
            value: "0"
          },
          {
            id: 2,
            name: "Bargain",
            value: "0"
          },
          {
            id: 3,
            name: "City Lore",
            value: "0"
          },
          {
            id: 4,
            name: "Con",
            value: "0"
          },
          {
            id: 5,
            name: "Crafting",
            value: "0"
          },
          {
            id: 6,
            name: "Etiquette",
            value: "0"
          },
          {
            id: 7,
            name: "Evaluate",
            value: "0"
          },
          {
            id: 8,
            name: "Fishing",
            value: "0"
          },
          {
            id: 9,
            name: "Healing",
            value: "0"
          },
          {
            id: 10,
            name: "Hunting",
            value: "0"
          },
          {
            id: 11,
            name: "Languages",
            value: "0"
          },
          {
            id: 12,
            name: "Law",
            value: "0"
          },
          {
            id: 13,
            name: "Leadership",
            value: "0"
          },
          {
            id: 14,
            name: "Religion Lore",
            value: "0"
          },
          {
            id: 15,
            name: "Secret Signs",
            value: "0"
          },
          {
            id: 16,
            name: "World Lore",
            value: "0"
          }
        ]
      },
      {
        id: 7,
        name: "Magical Special Skills",
        stats: [
          {
            id: 1,
            name: "Magic-Minor",
            value: "0"
          },
          {
            id: 2,
            name: "Magic-Priestly",
            value: "0"
          },
          {
            id: 3,
            name: "Magic-Sorcery",
            value: "0"
          },
          {
            id: 4,
            name: "Magic-Wizardry",
            value: "0"
          },
          {
            id: 5,
            name: "Magic Lore",
            value: "0"
          },
          {
            id: 6,
            name: "Second Sight",
            value: "0"
          }
        ]
      },
      {
        id: 8,
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
          }
        ]
      },
      {
        id: 9,
        name: "Talents",
        stats: [
          {
            id: 1,
            name: "Example Talent",
            value: "Description or notes"
          }
        ]
      },
      {
        id: 10,
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
    accent:         "255,213,140",
    textShadow:     "1px 1px 2px #000000"
};


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
