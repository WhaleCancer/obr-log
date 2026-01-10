// Talent data extracted from markdown files
// Auto-generated - do not edit manually

export type TalentType = 'Major' | 'Minor';

export type Talent = {
    name: string;
    type: TalentType;
    description: string;
};

export const talents = {
    major: [
        {
            name: "Ambidextrous",
            type: "Major" as const,
            description: "This Hero may use both hands with equal acuity, and may\nuse a melee weapon in both hands without any penalty. The\ncharacter will make one normal attack roll vs an opponent\nwith the attacks resolved normally. The Hero will then make\na second attack roll for their second weapon. If this second\ncombat total exceeds that of their opponent, this attack hits\nas well.\n\nIf this Hero wishes to use two firearms, each of these attacks\nwill need to be against the same opponent and will suffer a\npenalty of -2."
        },
        {
            name: "Combat Reactions",
            type: "Major" as const,
            description: "This Hero is fast in combat and difficult to surprise. The\nHero cannot be ambushed and reduces all penalties from\nbeing outnumbered by 1. If the Hero uses the Fast Shot\noption in combat, they will go first if the speeds are tied."
        },
        {
            name: "Crack Shot",
            type: "Major" as const,
            description: "A Hero with this Talent has a particular ability with ranged\nweapons and can add +1 to all damage rolls made with\nfirearms or other personal weapons. This Talent does not\napply to vehicle or starship mounted weapons."
        },
        {
            name: "Defensive Pilot",
            type: "Major" as const,
            description: "This Hero naturally flies (or drives) in a defensive way, even\nif there are no enemies in sight! This translates to a +1 on all\nstarship or vehicle armour rolls made whilst this Hero is the\npilot."
        },
        {
            name: "Directed Aggression",
            type: "Major" as const,
            description: "A Psionicist Hero with this Talent is aggressive and forceful\nwhen attacking and gains a +1 bonus on all Psionic direct\ndamage rolls."
        },
        {
            name: "Dogfighter",
            type: "Major" as const,
            description: "The Hero with this Talent can normally see the weak spots in\nan enemy vehicle or starship in the same way that a hero\narcher can see the weak spot in a dragon's belly. The Hero\ngains a +1 bonus to vehicle/starship weapon damage rolls\nmade by that character."
        },
        {
            name: "Focused",
            type: "Major" as const,
            description: "Normally, a Psionicist can eventually learn all eight of the\nPsionic powers that are available to their tradition. This\nHero is more specialised than that, able to learn only four of\nthe available powers, but gaining a one off bonus of +2 to\ntheir PSIONICS score. It may be possible, in rare cases, to\nlose this Talent (the Director may allow you to choose\nanother), losing the +2 bonus to PSIONICS but recovering\nthe ability to use all eight powers."
        },
        {
            name: "Hotshot",
            type: "Major" as const,
            description: "The pilot Hero with this Talent is a natural behind the\nwheel/joystick and gains a +1 bonus to all piloting rolls."
        },
        {
            name: "Iron Will",
            type: "Major" as const,
            description: "This Hero is immune to all direct-effect Psionic powers,\nwhether used by friend or by foe. Such a Hero would take\nno damage from Choke Enemy, but would be burned as\nusual as a result of Pyrokinesis, as the fire in that case is\nnormal once started. The Hero would also recover no\nSTAMINA from the Energy Medicine power, etc. The Hero\ncannot use PSI powers themselves."
        },
        {
            name: "Martial Artist",
            type: "Major" as const,
            description: "A character with this talent has received training in one or\nmore styles of unarmed combat and is a master at fighting\nwithout weapons. The character does not suffer a penalty\nfor fighting unarmed, and uses the Unarmed-Large damage\ntable."
        },
        {
            name: "Strongarm",
            type: "Major" as const,
            description: "This Hero is very strong and has a +1 bonus to all damage\nrolls made in hand to hand combat."
        },
    ],
    minor: [
        {
            name: "Affiliation",
            type: "Minor" as const,
            description: "This Talent means that the Hero is affiliated with a particular\norganisation, and almost certainly has official status within\nit. The Hero may be an agent or other employee or could be\nan honoured member or associate. The Hero may, at\nappropriate times and with appropriate contact, Test their\nLuck to gain special assistance. The downside to this Talent\nis that sworn enemies of the organisation also see the Hero\nas an enemy!"
        },
        {
            name: "Armour Training",
            type: "Minor" as const,
            description: "This Hero is able to make the most of any armour worn and\nreceives a +1 to all Armour Rolls."
        },
        {
            name: "Charmed Life",
            type: "Minor" as const,
            description: "This Hero leads a charmed life and impossibly avoids injury\nwhen there is seemingly no way it could happen! This Hero\ncan, when hit, reduce the damage dice result to a 1 (all\nnormal modifiers apply). This ability can only be used once\nper attack, and each use requires the Hero to spend 1 LUCK\npoint, although a LUCK roll is not required."
        },
        {
            name: "Dealer",
            type: "Minor" as const,
            description: "This Hero is a hard negotiator when the chips are down and\ntheir back is to the wall. If the character fails their Trading\nroll, the margin of failure cannot be more than -2 for the\npurposes of calculating the actual sale price."
        },
        {
            name: "Hawkeye",
            type: "Minor" as const,
            description: "This Hero has fantastic eyes and their brain is incredibly\nperceptive. They gain a +3 bonus to all sight-based\nAwareness tests, even if at some later point their eyes are\nreplaced with cybernetic replacements or regenerated."
        },
        {
            name: "Jury Rigger",
            type: "Minor" as const,
            description: "A Hero with this talent is able to make just about any tool or\nbasic mechanism given a few parts and basic tools, and can\nalso force a damaged system to work, even if at minimum\ncapacity. This talent is not a replacement for the engineering\nspecial skill for proper repairs or maintenance, although this\ntalent does allow the creation of some outrageous (and short\nlived) inventions. Any mechanism made or repaired by this\ntalent will work just long enough to fulfil its purpose before\nfailing completely."
        },
        {
            name: "Learned",
            type: "Minor" as const,
            description: "A Hero with this talent has had an extensive education, and\nspends most of their spare time reading and learning. They\nknow a huge amount of...stuff, and gain a +2 bonus to all\nknowledge tests made against special skills."
        },
        {
            name: "Light Footed",
            type: "Minor" as const,
            description: "This Hero is slippery and fluid in combat and difficult to hit.\nAll Dodge rolls are made with a bonus of +1."
        },
        {
            name: "Linguist",
            type: "Minor" as const,
            description: "This talent grants a basic understanding of almost all\nstandard languages, and the Hero may grasp the basic\nconcepts of any spoken communication. The Hero may also\nbuy the language special skill at half normal XP cost. This\ntalent does not apply to truly alien languages that\ncommunicate via smell, flashing lights or facial expressions!"
        },
        {
            name: "Lucky",
            type: "Minor" as const,
            description: "A Hero with this talent is unusually lucky, and may reroll\none failed LUCK test each day. This reroll does not cost an\nextra LUCK point."
        },
        {
            name: "Mutant",
            type: "Minor" as const,
            description: "A Hero with this talent has lived in a radioactive wasteland,\nhas been exposed to cosmic radiation or some other\nmutagen. The Hero has 1D3 different mutations rolled on\nthe Mutations Table below.\n\n## Mutations Table\n\n| D6 | D6 | Mutation | Effect |\n|----|----|----------|--------|\n| 1 | 1 | Poisonous Bite | The Hero has poisonous fangs, and their bite inflicts a standard Poison as well as small bite damage. |\n| 1 | 2 | Breathe Fire | Hero can roll a D6 each Attack Round: a 1 or 2 means an opponent within 10' is burned for 1 STAMINA damage. |\n| 1 | 3 | Horns | Hero has a natural melee attack using the Horn damage table. |\n| 1 | 4 | Spikes | Hero is covered in spines. Any unarmed attacks on the character inflict 1 STAMINA damage to the attacker. Hero cannot wear a sealed suit. |\n| 1 | 5 | Wings | Roll D6 for type: 1-2 Bat wings, 3-4 Insect wings, 5-6 Bird wings. Hero can fly at the same speed that they can walk. |\n| 1 | 6 | Scaly skin | Heavily scaled skin counts as medium armour with no special skill required. |\n| 2 | 1 | Two Heads | Hero has two heads but one personality. Hero can use two special skills at the same time, can have two conversations, etc. |\n| 2 | 2 | Compound Eyes | Hero has a +1 to Awareness special skill tests. |\n| 2 | 3 | Animal Paw | Hero has a Small Claw attack, but cannot use weapons in that hand and has limited manual dexterity. |\n| 2 | 4 | Tentacles | The Hero has 1D3 prehensile tentacles growing from their head or torso. These are not strong or dextrous enough to use weapons. |\n| 2 | 5 | Giant Feet | The Hero has feet with a length equal to half of the Hero's height! The Hero has half normal movement rate but can walk across deep snow, marsh, etc. |\n| 2 | 6 | Slime Skin | The skin of the Hero constantly exudes a thick sticky slime. This counts as Light Armour. An enemy's melee weapon will get stuck on roll of 6 on 1D6. |\n| 3 | 1 | Extra Arm | The Hero has an extra arm growing from their torso. This can be used to make an extra weapon attack at half SKILL. |\n| 3 | 2 | Dark Vision | The Hero has eyes adapted to low light conditions. These eyes give poor vision in normal light but can see in all but total dark. |\n| 3 | 3 | Extra Eyes | The Hero has several extra eyes spread around the edge of their head. As long as these eyes are not obscured, the Hero cannot be surprised. |\n| 3 | 4 | Tail | The Hero has a heavy tail that provides an extra Melee attack, inflicting damage as per a Morning Star. |\n| 3 | 5 | Acid Saliva | The Hero may spit at an enemy in close combat. Target must roll under SKILL to avoid. A hit inflicts 1 STAMINA damage. |\n| 3 | 6 | Beak | The Hero has a large and sharp beak. This can be used to attack in combat (treat as a Large Bite). |\n| 4 | 1 | Clawed Legs | The Hero has large clawed feet. These claws add a +2 bonus to climbing any rough or natural surface and a +1 bonus to unarmed damage rolls when kicking. |\n| 4 | 2 | Sulphur Steamer | The hero vents noxious sulphurous gas, reducing enemy SKILL by 1 in hand to hand combat (as long as they have a sense of smell). |\n| 4 | 3 | Crab Claw | The Hero has a large claw in place of one hand. This can be used to attack as per Large Claw but cannot use weapons or operate systems. |\n| 4 | 4 | Regeneration | The Hero has a very rapid healing rate. Damage heals at the rate of 1 STAMINA point per 10 minutes. |\n| 4 | 5 | Carapace | The Hero has a heavy shell such as a crab or beetle might have. This counts as Heavy Armour but applies a -2 to physical maneuvers (not combat). |\n| 4 | 6 | Plague Carrier | This Hero is a reservoir for disease organisms, and can never be cured. Touching or biting another may pass on a disease. The carrier is immune to all diseases. |\n| 5 | 1 | Two Tails | The Hero has two muscular tails. They are not prehensile, but do add +2 to all balance maneuvers. |\n| 5 | 2 | Two Hearts | Hero has two separate beating hearts. Only one is required for survival, so Hero can survive a fatal Heart wound. |\n| 5 | 3 | Gills | Hero has functioning gills in addition to lungs. The Hero can breathe underwater but has no greater ability when swimming. |\n| 5 | 4 | Very Tall | Hero is 50% taller than normal, and has trouble fitting into normal clothing. |\n| 5 | 5 | Very Fat | The Hero is incredibly obese and has a penalty of -1 to SKILL. This does however count as Light Armour. |\n| 5 | 6 | Trunk | A prehensile Trunk grows from the Hero's face. It can be used to grab things and drink water, but cannot be used to attack with. |\n| 6 | 1 | Leg Tentacles | The Hero's legs have mutated into long tentacles. The Hero has half normal move but is unaffected by terrain and can even climb given suitable tentacle-holds. |\n| 6 | 2 | Hairy Skin | The Hero is covered in a thick layer of fur, and is now very cold resistant. The Hero can survive outside in temperatures well below freezing. |\n| 6 | 3 | Echo Sense | The Hero has echolocation but is also blind. The echolocation allows accurate detection of objects and beings, but the character cannot read, etc. |\n| 6 | 4 | Mouth Tentacles | The face of the Hero has tentacles growing all around the mouth and can eat without using their hands. |\n| 6 | 5 | Expanded Brain | The skull of the character swells to double size, but the Hero gains a +1 on all knowledge tests. |\n| 6 | 6 | Roll Twice | Roll twice on this table |"
        },
        {
            name: "Natural Leader",
            type: "Minor" as const,
            description: "This talent makes the Hero an instinctive leader and if a\nsuccessful leadership roll is made, NPC followers gain a\nbonus of +1 when carrying out the order. If the leadership\nroll is a critical success, the bonus is +3. The Director should\nrule on when this talent can be used on a case-by-case basis."
        },
        {
            name: "Power Leech",
            type: "Minor" as const,
            description: "A Hero with this talent can drain 1 PSI point from another\nsentient being with a touch. Non-Psionicists should be\nconsidered to have 1 PSI point each. Use of this talent\nrequires a full round of action and causes considerable (if\nbrief) pain to the target. Some planets have outlawed the use\nof this talent."
        },
        {
            name: "Reputation",
            type: "Minor" as const,
            description: "The Hero is famous (or infamous) due to something in their\nbackground. They may, by revealing their history, test their\nLUCK in social situations to get a useful reaction – whether\npositive or negative."
        },
        {
            name: "Robust",
            type: "Minor" as const,
            description: "The Hero is tough and recovers from wounds quickly.\nEating a meal recovers 3 STAMINA points and sleeping\nrecovers 5 STAMINA points. Normal rules on frequency of\neating and sleeping still apply."
        },
        {
            name: "Sidekick",
            type: "Minor" as const,
            description: "A Hero with this talent has an apprentice, ally, family\nmember, bodyguard, assistant, etc. This NPC (who will have\ncharacteristics and special skills lower than the Heroes) will\ngenerally be under the control of the player, but the Director\ncan take over this character at any time. Although the sidekick\nis loyal, they may be mislead, controlled, bribed or threatened\ninto acting against the party good."
        },
        {
            name: "Silver Tongued",
            type: "Minor" as const,
            description: "This talent gives the Hero a natural way with words and\ngains a +2 bonus to any Con, Bargain, Etiquette or\nLeadership special skill tests."
        },
        {
            name: "Status",
            type: "Minor" as const,
            description: "This Hero is of greater standing in society and has rank and\nstatus above that of most normal folk. The Hero has a social\nrank of 7 (or more if the Director so desires) and may also\nhave slightly more money at the start of the game. The Hero\nmay be able to leverage this status during the game, but may\nalso have obligations due to that rank."
        },
        {
            name: "Survivor",
            type: "Minor" as const,
            description: "This Hero seems to have an almost supernatural ability to\nstay alive in difficult environments. As long as it is possible\nto live (breathable atmosphere, source of food and water) the\ncharacter will cling on and find whatever is needed. If the\nHero also has the Survival special skill, they can support an\nextra person per point in the special skill without needing to\nroll."
        },
        {
            name: "Technical Genius",
            type: "Minor" as const,
            description: "This Hero may sacrifice a point of LUCK in order to gain a\n+4 bonus to one technical skill roll (Science, Engineering,\nMedical, etc)."
        },
    ]
};
