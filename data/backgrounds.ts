/**
 * Background data for Star Trek character sheets
 * Each background defines stat modifiers, skill modifiers, background talents, and features.
 *
 * Each background must have exactly 4 design points spent on skillModifiers:
 * - Combat/Psionic skills: 2 points per rank
 * - Movement/Stealth/Knowledge/Science skills: 1 point per rank
 */

export type StatModifiers = {
    BODY?: number;
    HEALTH?: number;
    LUCK?: number;
    MIND?: number;
    ATTACKS?: number;
};

export type SkillModifier = {
    name: string;
    section: 'combat' | 'psionic' | 'movement' | 'stealth' | 'knowledge' | 'science';
    modifier: number;
};

export type BackgroundSkillPoints = {
    category: 'combat' | 'psionic' | 'movement' | 'stealth' | 'knowledge' | 'science';
    points: number;
}[];

export type BackgroundDrawback = {
    name: string;
    variantId?: string;
};

export type BackgroundTalent = {
    name: string;
    variantId?: string;
};

export type Background = {
    name: string;
    type: string;
    size?: string;
    description: string;
    statModifiers?: StatModifiers;
    skillModifiers?: SkillModifier[];
    backgroundSkillPoints?: BackgroundSkillPoints;
    backgroundTalents?: (string | BackgroundTalent)[];
    features?: (string | BackgroundDrawback)[];
};

export const backgrounds: Record<string, Background> = {
    "Aenar": {
        name: "Aenar",
        type: "Humanoid (Andorian)",
        description: "The [Aenar](https://memory-alpha.fandom.com/wiki/Aenar#Society_and_culture) are a subspecies of [[Andorian (species)|Andorians]] native to the Northern Wastes of Andoria.\n\nStarting SKILL: 3\nStarting HEALTH: 6\nStarting LUCK: 7\nStarting PSIONICS: 4\n##### Aenar Special Skills\nAenar have the following Special Skills.\n* Psionics / 1 rank in each [[Aenar Psionic Tradition (psionic special skill)]]\n* Psionics / Aura Reading\n* Psionics / Precognition\n* Psionics / Remote Viewing\n* Psionics / Telepathy\n* Social Sciences / [[Aenar Culture and History (special skill)]] (1 rank)\n* Languages / [[Aenar (language)]] (3 ranks)\n##### Special Skills\nAenar officers in [[Starfleet (affiliation)]] have the following Special Skills in addition to the Special Skills above:\n* Life Sciences / 1 rank in any 1 [[Sciences]] \n* Medical Science / [[Aenar (general medicine)]] (1 rank) \n* Medical Science / [[Andorian (general medicine)]] (1 rank) \n* Physical Sciences / 1 rank in any 1 [[Physical Sciences]] \n* Planetary Sciences / 1 rank in any 1 [[Planetary Sciences]] \n* Social Sciences / 1 rank in any 1 [[Social Sciences]] \n* Social Sciences / [[Andorian Culture and History (special skill)]] (1 rank)\n* Social Sciences / [[History]] (1 rank)\n* Space Sciences / 1 rank in any 1 [[Space Sciences]]\n* Languages / [[Federation Standard (language)]] (2 ranks)\n* Languages / [[Andorii (language)]] (2 ranks)\n##### Talents\n* [[Poor Senses (minor drawback)]]\n* [[Extreme Environment (minor alien talent)]] Frozen\n* [[Pacifist (major drawback)]]",
        features: [],
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 1,
            ATTACKS: 1
        },
        skillModifiers: [
            { name: "Awareness", section: "stealth", modifier: 1 },
            { name: "Sensors", section: "knowledge", modifier: 1 },
            { name: "Communications", section: "knowledge", modifier: 1 },
            { name: "Andorian", section: "knowledge", modifier: 4 }
        ],
    },
    "Android": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Android",
        type: "Construct",
        description: "The starting SKILL and HEALTH are 6 and 10 for a robot character, but they do not have a LUCK statistic. Robots do not believe in luck or fortune and they cannot benefit from luck in any way. A Robot Hero required to make a LUCK test will automatically fail. Robots also do not have the soul required to use psionics, and so cannot have a PSIONICS statistic. Instead, robot characters have a TECH statistic, representing the technology of the components within. A robot with low TECH will be constructed from old or obsolete components, whereas one with a TECH of 10 or higher will be built from the very latest parts. This is rolled against to avoid breakdowns or problems in harsh environments, and to resist electronic attack. It is also used as the base Statistic to add to special skills such as Computers, Communications, and any other skill that involves the robot interfacing directly to another electronic system. TECH also limits what upgrades and modules can be fitted to the robot. TECH starts at 4 for a new character. If TECH is ever temporarily reduced to below the value required for any modules or skill cards, they will cease to function until the robot is repaired.\n\nThe robot now has a pool of 8 points to improve these three statistics:\n\nSKILL can be improved to a maximum of 7\n\nHEALTH can be improved to a maximum of 18 (points count double)\n\nTECH can be improved to 10",
        features: [],
        skillModifiers: [
            { name: "Computers", section: "knowledge", modifier: 1 },
            { name: "Engineering", section: "knowledge", modifier: 1 },
            { name: "Sensors", section: "knowledge", modifier: 1 },
            { name: "Communications", section: "knowledge", modifier: 1 }
        ],
        
         // Androids are constructs, no biological mutations
    },
    "Andorian": {
        name: "Andorian",
        type: "Humanoid (Andorian)",
        description: "The Andorians are a warp-capable humanoid species from the moon Andoria, capital of the Andorian Empire, in the Alpha Quadrant. In 2161, their homeworld became a founding member of the United Federation of Planets.\n\nStarting SKILL: 4\nStarting HEALTH: 10\nStarting LUCK: 8\n##### Andorian Special Skills\nAndorian have the following Special Skills.\n* Combat Skills / [[Dodge]] (1 rank) \n* Combat Skills / [[Personal Combat]] (1 rank) \n* Combat Skills / [[1. Starfleet Officer's Handbook/Special Skills/Ground Combat Skills/Tactics]] (1 rank)\n* Social Sciences / [[Andorian Culture and History (special skill)]] (1 rank)\n* Languages / [[Andorii (language)]] (3 ranks)\n##### Special Skills\nAndorian officers in Star Fleet have the following Special Skills:\n* Life Sciences / 1 rank in any 1 [[Sciences]] \n* Medical Science / [[Andorian (general medicine)]] (1 rank) \n* Physical Sciences / 1 rank in any 1 [[Physical Sciences]] \n* Planetary Sciences / 1 rank in any 1 [[Planetary Sciences]] \n* Social Sciences / 1 rank in any 1 [[Social Sciences]] \n* Social Sciences / [[History]] (1 rank)\n* Space Sciences / 1 rank in any 1 [[Space Sciences]]\n* Sports / 1 rank in any 1 [[Sports]]\n* Languages / [[Federation Standard (language)]] (3 ranks)",
        statModifiers: {
            BODY: 1,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        skillModifiers: [
            { name: "Brawling", section: "combat", modifier: 1 },
            { name: "Melee Weapons", section: "combat", modifier: 1 }
        ],
        backgroundTalents: ["Federation (Affiliation)"],
        features: ["combat-reactions"],
        
        
    },
    "Augment": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Augment",
        type: "Humanoid (Human)",
        description: "> [!quote] Starfleet Intelligence\n> Admiral Kirk's error in allowing the crew of the Botany Bay to establish a colony at Alpha Ceti is only surpassed in recent years by Admiral Pike's approach to the Neutral Zone Incursion that lead to the last war. The Augments proved more than capable of not only surviving, but indeed thriving on Alpha Ceti III. Even after the recent catastrophic climatic shifts on Alpha Ceti III, the Augments are still a strong minor power in the form of the Soonge Khanate.\n\n+1 [[SKILL]]\n+1 Strength\n+1 Awareness\n+1 Athletics\n+1 Acrobatics",
        features: [
            "blood-red",
            "brain-humanoid",
            "arms-humanoid",
            "legs-humanoid",
            "hands-trotter",
            "nose-pig",
            "ear-left-humanoid",
            "ear-right-humanoid",
            "teeth-humanoid",
            "skull-humanoid",
            "skin-color-medium",
            "eye-left-normal",
            "eye-right-normal",
            "light-insensitivity",
            "sunlight-insensitivity",
            "appearance-ugly",
            "Social/aggressive"
        ],
        skillModifiers: [
            { name: "Brawling", section: "combat", modifier: 1 },
            { name: "Thrown", section: "combat", modifier: 1 }
        ],
        
        
    },
    "Betazoid": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Betazoid",
        type: "Humanoid (Betazoid)",
        description: "Efrosians are a species of humanoids native to the planet Efros, or Efros Delta. Members of the United Federation of Planets they are notable for their dedication to oral history, and for their musical language.\n\nBase SKILL: 4\nBase HEALTH: 8\nBase LUCK: 8\nBase PSIONICS: 1\n\nA Vulcan character has 6 points to spend on characteristics, with any spent on HEALTH increasing that by 2. SKILL and PSIONICS may only be increased to 7 and HEALTH to 18.\n\nThe character may also choose two further Special Skills at rank 2 and four Special Skills at rank 1.\n\n**Talents**\n* [[Uncanny Sense of Direction (minor alien talent)]]\n\n**Drawbacks**\n* [[Poor Senses (minor drawback)]]",
        features: [
            "blood-red",
            "brain-humanoid",
            "arms-humanoid",
            "legs-humanoid",
            "hands-trotter",
            "nose-pig",
            "ear-left-humanoid",
            "ear-right-humanoid",
            "teeth-humanoid",
            "skull-humanoid",
            "skin-color-medium",
            "eye-left-normal",
            "eye-right-normal",
            "light-insensitivity",
            "sunlight-insensitivity",
            "appearance-ugly",
            "Social/aggressive"
        ],
        skillModifiers: [
            { name: "Awareness", section: "stealth", modifier: 1 },
            { name: "Etiquette", section: "knowledge", modifier: 1 },
            { name: "Bargain", section: "knowledge", modifier: 1 },
            { name: "English", section: "knowledge", modifier: 4 }
        ],
        
        
    },
    "Caitian": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Caitian",
        type: "Humanoid (Caitian)",
        description: "The Caitians were a spacefaring feline humanoid species and long-standing members of the United Federation of Planets.\n\n> [!Abstract] Design\n> SKILL 6\n> HEALTH 8\n> LUCK 8\n> PSIONICS 1\n> \n> **Special Skills**\n> World Lore (1 rank) - Any\n> One Movement or Stealth Special Skill (1 rank)\n> Four Science Special Skills (1 rank)\n\nBase SKILL: 6\nBase HEALTH: 8\nBase LUCK: 8\nBase PSIONICS: 1",
        features: [
            "blood-red",
            "brain-humanoid",
            "arms-humanoid",
            "legs-humanoid",
            "hands-trotter",
            "nose-pig",
            "ear-left-humanoid",
            "ear-right-humanoid",
            "teeth-humanoid",
            "skull-humanoid",
            "skin-color-medium",
            "eye-left-normal",
            "eye-right-normal",
            "light-insensitivity",
            "sunlight-insensitivity",
            "appearance-ugly",
            "Social/aggressive"
        ],
        skillModifiers: [
            { name: "Acrobatics", section: "movement", modifier: 1 },
            { name: "Awareness", section: "stealth", modifier: 1 },
            { name: "Zoology", section: "science", modifier: 1 },
            { name: "Biology", section: "science", modifier: 1 }
        ],
        
        
    },
    "Edosian": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Edosian",
        type: "Humanoid (Edosian)",
        description: "The Edosians or Edoans were a race native to planet Edos in the Alpha Quadrant.\n\nEdosians were distinguished by their three arms, three legs, an elongated skull, and orange skin. They had a lifespan longer than even Vulcans. (Adventures RPG module: Alpha Quadrant Sourcebook)\n\nThey were quite strong despite their relatively slender build: a single blow from an Edosian's fist was capable of breaking a desk in half. Additionally, they could emit a guttural roar when angered.\n\n> [!Abstract] Design\n> SKILL 6\n> HEALTH 8\n> LUCK 8\n> PSIONICS 1\n> \n> **Special Skills**\n> World Lore (1 rank) - Any\n> One Movement or Stealth Special Skill (1 rank)\n> Four Science Special Skills (1 rank)\n\nBase SKILL: 6\nBase HEALTH: 8\nBase LUCK: 8\nBase PSIONICS: 1",
        features: [],
        skillModifiers: [
            { name: "Brawling", section: "combat", modifier: 1 },
            { name: "Melee Weapons", section: "combat", modifier: 1 }
        ],
        
         // Edosians have three arms and three legs
    },
    "Efrosian": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Efrosian",
        type: "Humanoid (Efrosian)",
        description: "[Efrosians](https://memory-beta.fandom.com/wiki/Efrosian) are a species of humanoids native to the planet Efros. Members of the United Federation of Planets they are notable for their dedication to oral history, and for their musical language.\n\nStarting SKILL: 5\nStarting HEALTH: 8\nStarting LUCK: 7\n##### Starting Special Skills\nEfrosian officers in Star Fleet have the following Special Skills. Efrosians in other situations may have entirely different Special Skills.\n\n* 1 rank in any 1 Special Skill\n* [[Artistic Expression]] / 1 rank in any musical forms\n* [[Carousing]] (1 rank)\n* Life Sciences / 1 rank in any 1 [[Sciences]]\n* Medical Sciences / [[Efrosian (general medicine)]] (1 rank) \n* Physical Sciences / 1 rank in any 1 [[Physical Sciences]]\n* Planetary Sciences / 1 rank in any 1 [[Planetary Sciences]]\n* Social Sciences / 1 rank in any 1 [[Social Sciences]]\n* Social Sciences / [[Efrosian Culture and History (special skill)]] (1 rank)\n* Social Sciences / [[History]] (1 rank)\n* Space Sciences / 1 rank in all 3 [[Space Sciences]]\n* Languages / [[Efrosian (language)]] (3 ranks)\n* Languages / [[Federation Standard (language)]] (3 ranks) \n\n**Talents**\n* [[Uncanny Sense of Direction (minor alien talent)]]\n* [[Extreme Environment (minor alien talent)]] - Frozen\n* [[Poor Senses (minor drawback)]] - Sight",
        features: [],
        skillModifiers: [
            { name: "Efrosian", section: "knowledge", modifier: 4 },
            { name: "Etiquette", section: "knowledge", modifier: 1 },
            { name: "Bargain", section: "knowledge", modifier: 1 }
        ],
        
         // Efrosians have poor sight
    },
    "Esper": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Esper",
        type: "Humanoid (Human)",
        description: "Espers are humans with psionic abilities. They have slightly reduced luck compared to baseline humans, but possess natural psionic capabilities.\n\nStarting SKILL: 4\nStarting HEALTH: 4\nStarting LUCK: 8\nStarting PSIONICS: 1\n##### Special Skills\nEsper officers in Star Fleet have the following Special Skills. Espers in other situations may have entirely different Special Skills.\n\n* [[Federation Standard (language)]] (3 ranks) \\[free\\]\n* One of [[Carousing]], [[Deception]], [[Leadership]], or [[Negotiation]] (1 rank)\n* 1 rank in any 1 Special Skill\n* 1 rank in any 1 [[Sciences]]\n* 1 rank in any 1 [[Physical Sciences]]\n* 1 rank in any 1 [[Planetary Sciences]]\n* 1 rank in any 1 [[Social Sciences]]\n* 1 rank in any 1 [[Space Sciences]]\n* 1 rank in any 1 [[Sports]]\n* [[History]] (1 rank) \\[1/3 point\\]\n* [[Human (general medicine)]] (1 rank) \\[1/3 point\\]\n* [[Human Culture and History (special skill)]] (1 rank) \\[1/3 point\\]\n* 3 ranks distributed in any way among [[Languages]] special skills\n##### Talents\nEspers do not gain any free talents or alien drawbacks as a result of their species.",
        features: [],
        skillModifiers: [
            { name: "Awareness", section: "stealth", modifier: 1 },
            { name: "Sensors", section: "knowledge", modifier: 1 },
            { name: "Sneak", section: "stealth", modifier: 1 },
            { name: "Disguise", section: "stealth", modifier: 1 }
        ],
        
        
    },
    "Gorn": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Gorn",
        type: "Humanoid (Gorn)",
        size: "Large",
        description: "> [!Quote] Kirk, on seeing the Gorn captain\n> \"_Like most Humans, I seem to have an instinctive revulsion to reptiles._\"\n\nThe Gorn are a warp-capable, bipedal reptilian species from the Beta Quadrant. Their interstellar government is known as the Gorn Hegemony.\n\n> [!Abstract]\n> Base SKILL: 6\n> Base HEALTH: 22\n> Base LUCK: 8",
        features: [],
        skillModifiers: [
            { name: "Brawling", section: "combat", modifier: 1 },
            { name: "Melee Weapons", section: "combat", modifier: 1 }
        ],
        
        
    },
    "Half-Aenar": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Half-Aenar",
        type: "Humanoid (Andorian)",
        description: "Half andorian and half aenar",
        features: ["eye-left-nearsighted", "eye-right-nearsighted", "ear-left-humanoid", "ear-right-universal-translator", "nose-humanoid", "teeth-humanoid", "skull-humanoid", "antennae-andorian-left", "antennae-andorian-right", "arm-left-humanoid", "arm-right-humanoid", "leg-left-humanoid", "leg-right-humanoid", "hand-left-humanoid", "hand-right-humanoid", "foot-left-humanoid", "foot-right-humanoid"],
        skillModifiers: [
            { name: "Awareness", section: "stealth", modifier: 1 },
            { name: "Sensors", section: "knowledge", modifier: 1 },
            { name: "Dodge", section: "movement", modifier: 1 },
            { name: "Brawling", section: "combat", modifier: 1 }
        ],
        
         // Half-Aenar have Aenar traits
    },
    "Half-Human": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Half-Human",
        type: "Humanoid (Human/Romulan)",
        description: "half human half romulcan\n\ncompare to half-romualn",
        features: [],
        skillModifiers: [
            { name: "Sneak", section: "stealth", modifier: 1 },
            { name: "Disguise", section: "stealth", modifier: 1 },
            { name: "Awareness", section: "stealth", modifier: 1 },
            { name: "Brawling", section: "combat", modifier: 1 }
        ],
        
        
    },
    "Half-Klingon": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Half-Klingon",
        type: "Humanoid (Human/Klingon (Original Series))",
        description: "A **Half-Klingon** is a Character with mixed [[Human (species)]] and [[Klingon (Original Series)]] ancestry.\n\n+2 HEALTH\n+1 LUCK\n\nless skills\n\n> [!NOTE] Half-Orcs\n> Half-Klingons serve the same story role as Half-Orcs in Dungeons and Dragons. Many Half-Klingons are going to have been the result of war crimes committed during the Four Years War. Each Half-Klingon is an individual with their own story and their own allegiance. Some have applied to Starfleet and have recently graduated as Ensigns.",
        features: [],
        skillModifiers: [
            { name: "Brawling", section: "combat", modifier: 1 },
            { name: "Melee Weapons", section: "combat", modifier: 1 }
        ],
        
         // Half-Klingon have Klingon (Original Series) warrior traits (aggressive trait would be in talents/drawbacks)
    },
    "Half-Romulan": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Half-Romulan",
        type: "Humanoid (Vulcan/Romulan)",
        description: "In the context of this game, a Half-Romulan is a character with mixed [[Romulan]] and [[Vulcan (species)]] heritage.",
        features: [],
        skillModifiers: [
            { name: "Sneak", section: "stealth", modifier: 1 },
            { name: "Disguise", section: "stealth", modifier: 1 },
            { name: "Awareness", section: "stealth", modifier: 1 },
            { name: "Brawling", section: "combat", modifier: 1 }
        ],
        
         // Half-Romulan have Romulan traits
    },
    "Half-Vulcan": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Half-Vulcan",
        type: "Humanoid (Human/Vulcan)",
        description: "In the context of this game, a Half-Vulcan is someone with mixed Human and Vulcan ancestry. For someone with Romulan and Vulcan ancestry, see Half-Romulan.",
        features: [],
        skillModifiers: [
            { name: "Physics", section: "science", modifier: 1 },
            { name: "Chemistry", section: "science", modifier: 1 },
            { name: "Biology", section: "science", modifier: 1 },
            { name: "Vulcan", section: "knowledge", modifier: 4 }
        ],
        
         // Half-Vulcan have Vulcan traits
    },
    "Human": {
        name: "Human",
        type: "Humanoid (Human)",
        description: "Humans are a race originating from the planet Earth in the Sol System. They were one of the founding races which created the United Federation of Planets, along with [[Vulcan (species)]], [[Andorian (species)]], and [[Tellarite (species)]].\n\nStarting SKILL: 4\nStarting HEALTH: 8\nStarting LUCK: 8",
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 1,
            MIND: 0,
            ATTACKS: 1
        },
        skillModifiers: [
            { name: "English", section: "knowledge", modifier: 4 },
            { name: "Swim", section: "movement", modifier: 1 },
            { name: "Run", section: "movement", modifier: 1 },
            { name: "Bargain", section: "speech", modifier: 1 },
            { name: "Leadership", section: "speech", modifier: 1 }
        ],
        backgroundTalents: ["Federation (Affiliation)"],
        features: [],
        
        
    },
    "Klingon": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Klingon",
        type: "Humanoid (Klingon)",
        description: "> [!Quote] Mara, on the Klingon way of life\n> We have always fought. We must. We are hunters, captain, tracking and taking what we need.\n\nKlingons are a humanoid warrior species that originated from the planet Qo'noS (pronounced Kronos), an M-class planet in the Beta Quadrant. One of the major powers of the galaxy, the Klingons are a proud, tradition-bound people who valued honor and combat. The aggressive Klingon culture has made them an interstellar military power to be respected and feared.\n\n> [!Abstract]\n> Base SKILL: 4\n> Base HEALTH: 12\n> Base LUCK: 8",
        features: [],
        skillModifiers: [
            { name: "Brawling", section: "combat", modifier: 1 },
            { name: "Melee Weapons", section: "combat", modifier: 1 }
        ],
        
        
    },
    "Medusan": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Medusan",
        type: "Bizarre Alien",
        description: "As energy-based lifeforms, Medusans had no physical body. They were known to identify as genderless.\n\nMedusans are telepathic and empathic, and capable of projecting their thoughts as speech to other species. Medusan thoughts were regarded as the most sublime in the galaxy, but their physical appearance was exactly the opposite. The sight of a Medusan rendered any corporeal viewer mad, and soon afterwards could cause death by massive organ failure, although some species with telepathic aptitude may be affected differently. Even viewing the reflection of a Medusan could cause catatonia and memory loss, though not permanent harm. Vulcans are capable of viewing Medusans, but only with the use of a specially filtered visor; upon direct exposure, it could induce a form of involuntary mind meld between the Medusan and Vulcan.\n\nThe Medusans were renowned for their navigational abilities.\n\n> [!Abstract] Design\n> HEALTH 8\n> LUCK 8\n> PSIONICS 5\n> \n> **Special Skills**\n> Astronavigation (2 ranks)\n> World Lore (1 rank) - Any\n> One Movement or Stealth Special Skill (1 rank)\n> Four Science Special Skills (1 rank)\n\nBase HEALTH: 8\nBase LUCK: 8\nBase PSIONICS: 5",
        features: [],
        skillModifiers: [
            { name: "Astronavigation", section: "knowledge", modifier: 2 },
            { name: "Physics", section: "science", modifier: 1 },
            { name: "Biology", section: "science", modifier: 1 }
        ],
        
         // Energy-based lifeform, no biological mutations
    },
    "Orion, Female": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Orion, Female",
        type: "Humanoid (Orion)",
        description: "> [!quote] Starfleet Intelligence\n> While Starfleet is not currently engaging in robust anti-slavery operations, it was a top mission priority during the last war. It was deemed by Starfleet Command that morale was so shaken by Romulans selling Starfleet POWs to the Orions, that resources were freed up from the front line to ensure that Starfleet officers could be rescued. As a side effect of this, many other species, including Orion females, were freed. As a pleasant surprise to Starfleet Command, many of those freed would go on to attend Starfleet Academy and become Starfleet Officers. Unfortunately for Starfleet Command, this has resulted in a large faction of junior officers agitating for the resumption of large scale anti-slavery operations.\n\nBase SKILL: 4\nBase HEALTH: 8\nBase LUCK: 8\nBase PSIONICS: 1",
        features: [],
        skillModifiers: [
            { name: "Bargain", section: "knowledge", modifier: 1 },
            { name: "Etiquette", section: "knowledge", modifier: 1 },
            { name: "Disguise", section: "stealth", modifier: 1 },
            { name: "Sneak", section: "stealth", modifier: 1 }
        ],
        
        
    },
    "Orion, Male": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Orion, Male",
        type: "Humanoid (Orion)",
        description: "> [!quote] Starfleet Intelligence\n> The Orion Syndicate was able to greatly expand during the last war, capitalizing on the conflict to arm smaller powers and to find both new sources and markets for the slave trade. Romulans were known to sell low ranking Starfleet Officers into Orion slavery as a way to sow fear amongst Starfleet crews. Unfortunately, due to the precarious nature of galactic politics at this time, Starfleet is not engaging in any active anti-slavery operations, although anti-piracy activity around friendly planets in the Triangle is at an all time high.\n\nBase SKILL: 4\nBase HEALTH: 8\nBase LUCK: 8\nBase PSIONICS: 0",
        features: [],
        skillModifiers: [
            { name: "Bargain", section: "knowledge", modifier: 1 },
            { name: "Brawling", section: "combat", modifier: 1 },
            { name: "Melee Weapons", section: "combat", modifier: 1 }
        ],
        
         // Plant-based lifeform, no standard biological mutations
    },
    "Phylosian": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Phylosian",
        type: "Bizarre Alien",
        description: "The Phylosians are a species of sentient plants who are native to a planet they called Phylos.\n\nThey are Human size, but are not humanoid. Their heads are partially covered with a furry bristle... eye stalks but no mouths or ears are visible. The bodies are composed of a group of slender rope-like extensions, some of which hang down at the sides, and others of which bunch near the bottom before spreading out again into a loose collection of bulbous protuberances which are apparently the motive limbs. The body color is an ochre yellow, almost sickly. Despite their alien appearance, they seem to be passive and harmless; the voices we hear [from them] are quiet and reasoning.\n\nThe Flumph of Star Trek",
        features: [],
        skillModifiers: [
            { name: "Botany", section: "science", modifier: 1 },
            { name: "Biology", section: "science", modifier: 1 },
            { name: "Ecology", section: "science", modifier: 1 },
            { name: "Survival", section: "knowledge", modifier: 1 }
        ],
        
        
    },
    "Reman": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Reman",
        type: "Humanoid (Reman)",
        description: "> [!quote] Starfleet Intelligence\n> Remans are a species of bat-like space vampires that the Romulans enslaved when they first settled Romulus. From POWs captured during the war, we know there is a Reman resistance movement in the Romulan Star Empire and Remans - despite their horrifying appearance to most humans - are fully sentient and reasonable beings. That being said, most Remans encountered by Starfleet Officers are propagandized and brainwashed shock troops used by the Romulans during boarding actions. Expect any Romulan Warbird to carry at least a detachment of Reman marines.\n\n+1 PSIONICS\n\nLook like Count Orlock\n\n+20 Perception\n+1.5% Expose Chance\n+1 sec Expose Duration\n+10% Exploit Damage\n+25% Resistance to Flanking damage\n+5 Resistance Rating to Energy and Physical damage\n\n> [!Abstract] Design\n> SKILL 6\n> HEALTH 8\n> LUCK 8\n> PSIONICS 1\n> \n> **Special Skills**\n> World Lore (1 rank) - Any\n> One Movement or Stealth Special Skill (1 rank)\n> Four Science Special Skills (1 rank)\n\nBase SKILL: 6\nBase HEALTH: 8\nBase LUCK: 8\nBase PSIONICS: 1",
        features: [],
        skillModifiers: [
            { name: "Brawling", section: "combat", modifier: 1 },
            { name: "Melee Weapons", section: "combat", modifier: 1 }
        ],
        
         // Remans are bat-like vampires
    },
    "Romulan": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Romulan",
        type: "Humanoid (Romulan)",
        description: "> [!quote] Starfleet Intelligence\n> Romulans are ancient cousins of the Vulcans. They are descended by Vulcans who rejected the teachings of Surok and instead left Vulcan to found a new power: the Romulan Star Empire. Starfleet Intelligence has no doubts about the loyalty of Vulcans to the Federation, but numerous high profile Romulan spies posing as Vulcans - as well as numerous Half-Vulcan and Half-Romulan children produced by spies - has lead to some suspicion of Vulcans amongst Starfleet crews.\n\nBase SKILL: 4\nBase HEALTH: 8\nBase LUCK: 8\nBase PSIONICS: 0",
        features: [],
        skillModifiers: [
            { name: "Sneak", section: "stealth", modifier: 1 },
            { name: "Disguise", section: "stealth", modifier: 1 },
            { name: "Awareness", section: "stealth", modifier: 1 },
            { name: "Brawling", section: "combat", modifier: 1 }
        ],
        
         // Romulans are related to Vulcans
    },
    "Saurian": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Saurian",
        type: "Humanoid (Saurian)",
        description: "The [Saurians](https://memory-alpha.fandom.com/wiki/Saurian_(species)) are a reptilian humanoid species affiliated with the Federation. They have served in Starfleet since at least the 2250s.\n\nStarting SKILL: 4\nStarting HEALTH: 12 (2 pts)\nStarting LUCK: 8\n##### Saurian Special Skills\nSaurians have the following Special Skills.\n* [[Saurian Culture and History (special skill)]] (1 rank) \\[1/3 point\\]\n* [[Zero-G Operations]] (1 rank) - Sauria is a low-g world\n##### Special Skills\nSaurian officers in Starfleet have the following Special Skills. Saurians in other situations may have entirely different Special Skills.\n* [[Federation Standard (language)]] (3 ranks) \\[free\\]\n* 1 rank in any 1 [[Sciences]]\n* 1 rank in any 1 [[Physical Sciences]]\n* 1 rank in any 1 [[Planetary Sciences]]\n* 1 rank in any 1 [[Social Sciences]]\n* 1 rank in any 1 [[Space Sciences]]\n* [[History]] (1 rank) \\[1/3 point\\]\n* [[Saurian (general medicine)]] (1 rank) \\[1/3 point\\]\n* 3 ranks distributed in any way among [[Languages]] special skills\n##### Talents\n* [[Extreme Environment (minor alien talent)]] - Volcanic Swamps\n* [[Extreme Senses (minor alien talent)]] - Vision\n* [[Incredibly Strong (minor alien talent)]]\n* [[Natural Weapon (minor alien talent)]] - Claws",
        features: [],
        skillModifiers: [
            { name: "Brawling", section: "combat", modifier: 1 },
            { name: "Melee Weapons", section: "combat", modifier: 1 }
        ],
        
         // Saurians are reptilian
    },
    "Tellarite": {
        name: "Tellarite",
        type: "Humanoid (Tellarite)",
        description: "The Tellarites are a warp-capable pig-like humanoid species from the planet Tellar Prime in the Alpha Quadrant. In 2161, their homeworld became a founding member of the United Federation of Planets.\n\nStarting SKILL: 4\nStarting HEALTH: 10\nStarting LUCK: 7 \n##### Tellarite Special Skills\nTellarites have the following Special Skills\n* Social Sciences / [[Tellarite Culture and History (special skill)]] (1 rank)\n* Technology / 1 rank in any 2 [[Systems Technology]] special skills\n* Languages / [[Tellaran (language)]] (3 ranks)\n##### Special Skills\nTellarite officers in Star Fleet have the following Special Skills. Tellarites in other situations may have entirely different Special Skills.\n\n* Life Sciences / 1 rank in any 1 [[Sciences]] \n* Medical Sciences / [[Tellarite (general medicine)]] (1 rank) \n* Physical Sciences / 1 rank in any 1 [[Physical Sciences]] \n* Planetary Sciences / 1 rank in any 1 [[Planetary Sciences]] \n* Social Sciences / 1 rank in any 1 [[Social Sciences]]\n* Social Sciences / [[History]] (1 rank)\n* Space Sciences / 1 rank in any 1 [[Space Sciences]]\n* Languages / 1 rank in any 1 [[Languages]] special skill\n* Languages / [[Federation Standard (language)]] (3 ranks)\n##### Talents\n* [[Stubborn (minor alien talent)]]",
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        skillModifiers: [
            { name: "Engineering", section: "knowledge", modifier: 1 },
            { name: "Computers", section: "knowledge", modifier: 1 },
            { name: "Physics", section: "science", modifier: 1 },
            { name: "Chemistry", section: "science", modifier: 1 }
        ],
        backgroundTalents: ["Federation (Affiliation)"],
        features: [
            "blood-red",
            "brain-humanoid",
            "arms-humanoid",
            "legs-humanoid",
            "feet-trotter",
            "hands-trotter",
            "nose-pig",
            "ear-left-humanoid",
            "ear-right-humanoid",
            "teeth-humanoid",
            "skull-humanoid",
            "skin-color-medium",
            "eye-left-normal",
            "eye-right-normal",
            "light-insensitivity",
            "sunlight-insensitivity",
            "appearance-ugly",
            "Social/aggressive"
        ],
        
         // Tellarites are pig-like humanoids
    },
    "Tholian": {
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        name: "Tholian",
        type: "Bizarre Alien",
        description: "> [!quote] Starfleet Intelligence\n> Tholians are drawn to areas of spatial or temporal disruption like moths to the flame. With the use of [[Quantum Singularity Bombs (starship weapon)]] in the last war, these type of phenomenon can be found throughout the Romulan Neutral Zone and on both sides of the border. Tholian expeditions to these areas constitutes a breach of Federation territorial integrity, however there is little appetite for another war and so Starfleet has a policy of de-escalation when Tholian expeditions are intercepted.\n\nBase SKILL: 6\nBase HEALTH: 12\nBase LUCK: 8\nBase PSIONICS: 0",
        features: ["arms-crystalline", "brain-crystalline", "ears-crystalline", "hands-crystalline", "feet-crystalline", "skull-crystalline", "jaw-crystalline", "nose-crystalline", "hexapod-crystalline", "blood-magma"],
        skillModifiers: [
            { name: "Physics", section: "science", modifier: 1 },
            { name: "Astronavigation", section: "knowledge", modifier: 1 },
            { name: "Sensors", section: "knowledge", modifier: 1 },
            { name: "Computers", section: "knowledge", modifier: 1 }
        ],
        
         // Tholians are crystalline aliens
    },
    "Vulcan": {
        name: "Vulcan",
        type: "Humanoid (Vulcan)",
        description: "The Vulcans are a warp-capable humanoid species from the planet Vulcan. They are widely renowned for their strict adherence to logic and reason as well as their remarkable stoicism.\n\nStarting SKILL: 5\nStarting HEALTH: 8\nStarting LUCK: 7\nStarting PSIONICS: 2\n##### Vulcan Special Skills\nVulcans have the following Special Skills\n* [[Admin]] (1 rank)\n* Psionics / [[Mind Meld (psionic power)]] (1 rank)\n* Psionics / [[Nerve Pinch (psionic power)]] (1 rank)\n* Social Sciences / Cultures / [[Vulcan Culture and History (special skill)]] (1 rank)\n* Languages / [[Vulcan (language)]] (3 ranks)\n##### Special Skills\nVulcan officers in Star Fleet have the following Special Skills\n* Life Sciences / 1 rank in any 3 [[Sciences]]\n* Medical Sciences / [[Vulcan (general medicine)]] (1 rank)\n* Planetary Sciences / 1 rank in any 1 [[Planetary Sciences]]\n* Physical Sciences / 1 rank in any 3 [[Physical Sciences]]\n* Social Sciences / [[History]] (1 rank)\n* Social Sciences / 1 rank in any 3 [[Social Sciences]]\n* Space Sciences / 1 rank in any 1 [[Space Sciences]]\n* Languages / 2 ranks distributed in any way among [[Languages]] special skills\n* Languages / [[Federation Standard (language)]] (2 ranks)\n##### Talents\n* [[Extreme Environment (minor alien talent)]] Desert\n* [[Incredibly Strong (minor alien talent)]]\n* [[Emotionless (minor alien drawback)]]\n* [[Pon Farr (minor alien drawback)]]",
        statModifiers: {
            BODY: 0,
            HEALTH: 0,
            LUCK: 0,
            MIND: 0,
            ATTACKS: 1
        },
        skillModifiers: [
            { name: "Physics", section: "science", modifier: 1 },
            { name: "Chemistry", section: "science", modifier: 1 },
            { name: "Biology", section: "science", modifier: 1 },
            { name: "Vulcan", section: "knowledge", modifier: 4 }
        ],
        backgroundTalents: ["Federation (Affiliation)"],
        features: ["strongarm"],
        
         // Vulcans from desert planet, strong, logical
    }
};

/**
 * Get background data by name
 */
export function getBackground(backgroundName: string): Background | undefined {
    return backgrounds[backgroundName];
}

/**
 * Get all available background names
 */
export function getAllBackgroundNames(): string[] {
    return Object.keys(backgrounds).sort();
}
