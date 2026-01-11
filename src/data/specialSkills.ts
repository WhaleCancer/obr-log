// Special Skills data extracted from SpecialSkills components
// Auto-generated master list of all available special skills

export type SpecialSkillCategory = 'Combat' | 'Movement' | 'Stealth' | 'Knowledge' | 'Science' | 'Psionic';

export type SpecialSkill = {
    name: string;
    category: SpecialSkillCategory;
    description: string;
};

export const specialSkills: SpecialSkill[] = [
    // Combat Special Skills
    { name: "Armor", category: "Combat", description: "Training in wearing and using Starfleet combat armor, environmental suits, and personal protective equipment. This skill ensures armor provides maximum protection without hindering movement or combat effectiveness." },
    { name: "Brawling", category: "Combat", description: "Hand-to-hand combat using fists, kicks, and grappling techniques. Essential when phasers fail or close-quarters combat prevents ranged weapons. Covers Starfleet martial arts and improvised combat." },
    { name: "Firearms - Heavy", category: "Combat", description: "Operating the photon mortar, an extremely heavy energy weapon requiring significant strength and training. This massive weapon inflicts devastating damage but is difficult to transport and deploy." },
    { name: "Firearms - Light", category: "Combat", description: "Proficiency with hand-held energy weapons including type I and II phasers, phaser rifles, disruptor pistols, and compact beam weapons. Essential for Starfleet security and away team operations." },
    { name: "Firearms - Vehicle", category: "Combat", description: "Operating mounted weapons on shuttlecraft, ground vehicles, and defensive installations. Covers phaser emplacements, torpedo launchers, and automated defense systems." },
    { name: "Melee Weapons", category: "Combat", description: "Combat proficiency with bladed and impact weapons including bat'leths, mek'leths, lirpas, and Starfleet combat knives. Useful when phasers are unavailable or during ceremonial combat." },
    { name: "Starship Gunnery", category: "Combat", description: "Operating starship weapon systems including phaser banks and photon torpedo launchers. Requires understanding of targeting, weapon arcs, and coordination with tactical systems." },
    { name: "Thrown", category: "Combat", description: "Accurately throwing projectiles including grenades, knives, and improvised weapons. Useful for ranged attacks when energy weapons are unavailable or for creating tactical advantages." },
    
    // Movement Special Skills
    { name: "Acrobatics", category: "Movement", description: "Gymnastic agility and coordination for navigating complex environments. Essential for zero-gravity work, shipboard maintenance, and evading obstacles. Enables tightrope work, swinging across gaps, and maintaining balance in unstable conditions." },
    { name: "Climb", category: "Movement", description: "Proficiency in scaling vertical surfaces including ship hulls, building exteriors, and natural rock faces. Essential for away team missions requiring access to difficult locations or emergency escape situations." },
    { name: "Dodge", category: "Movement", description: "Evasive maneuvering to avoid incoming phaser fire, explosions, and physical attacks. This skill allows characters to reduce or avoid damage by not being where the attack is aimed. Essential for combat survival." },
    { name: "Jump", category: "Movement", description: "Skill in leaping across gaps, obstacles, and hazards. Covers long jumps, high jumps, and precision landings. Useful in shipboard combat and planetary exploration where mobility can mean survival." },
    { name: "Pilot - Air", category: "Movement", description: "Proficiency in operating atmospheric flight vehicles including shuttlecraft in atmosphere, aircars, and various aircraft. Essential for planetary operations, aerial reconnaissance, and atmospheric transport missions. Includes evasive maneuvers and precision flying." },
    { name: "Pilot - Ground", category: "Movement", description: "Operating ground vehicles including hovercraft, wheeled transports, tracked vehicles, and walking mechs. Essential for planetary surface operations and base transportation. Covers various propulsion systems and vehicle types." },
    { name: "Pilot - Space", category: "Movement", description: "Operating spacecraft from small fighters to massive starships. Essential for navigation, maneuvering, and combat operations in space. Requires understanding of inertial dampeners, warp drive systems, and tactical maneuvering. The most prestigious piloting skill in Starfleet." },
    { name: "Pilot - Water", category: "Movement", description: "Operating watercraft including surface vessels, submarines, and aquatic transports. Essential for missions on water worlds and aquatic environments. Covers both surface and underwater navigation and vehicle operation." },
    { name: "Ride", category: "Movement", description: "Proficiency in riding alien mounts and domesticated creatures for transportation. Useful on primitive worlds or when vehicles are unavailable. Covers various mount types and riding techniques across different planetary environments." },
    { name: "Run", category: "Movement", description: "Sustained running ability for pursuit, evasion, and rapid movement across terrain. Essential for away team members who may need to escape danger or cover ground quickly during missions." },
    { name: "Swim", category: "Movement", description: "Aquatic mobility for navigating water environments. Essential for missions involving oceans, lakes, or flooded areas. Covers efficient swimming techniques, endurance, and underwater movement. Critical when aquatic vehicles fail or are unavailable." },
    
    // Stealth Special Skills
    { name: "Awareness", category: "Stealth", description: "Heightened perception and intuition for detecting threats, hidden objects, and suspicious activities. Essential for spotting ambushes, noticing concealed enemies, and identifying anomalies. Covers all senses including visual, auditory, and instinctual detection." },
    { name: "Disguise", category: "Stealth", description: "Proficiency in altering appearance, voice, and mannerisms to blend in with different cultures or impersonate others. Essential for undercover operations and infiltration missions. Covers makeup, prosthetics, holographic disguises, and cultural adaptation." },
    { name: "Locks", category: "Stealth", description: "Skill in bypassing security systems including mechanical locks, electronic keypads, biometric scanners, and encrypted access panels. Essential for infiltration, rescue operations, and accessing restricted areas. Requires knowledge of various security technologies across different species and civilizations." },
    { name: "Sleight of Hand", category: "Stealth", description: "Dexterity and precision for pickpocketing, palming objects, and performing covert manipulations. Useful for planting trackers, swapping items, accessing systems unnoticed, or acquiring information. Essential for intelligence operations and covert missions." },
    { name: "Sneak", category: "Stealth", description: "Proficiency in moving silently, remaining concealed, and avoiding detection. Essential for infiltration, reconnaissance, and stealth operations. Covers moving quietly through ship corridors, hiding in shadows, and evading security sensors and patrols." },
    { name: "Traps", category: "Stealth", description: "Understanding of security systems, traps, and hazard detection. Covers identifying pressure plates, proximity sensors, energy fields, and mechanical traps. Essential for safely navigating ancient ruins, enemy installations, and booby-trapped locations. Includes knowledge of disarming techniques and trap placement strategies across different cultures and technologies." },
    
    // Knowledge Special Skills
    { name: "Animal Skills", category: "Knowledge", description: "Knowledge of caring for and managing alien animals and domesticated creatures. Essential for transporting livestock, encountering wild alien species, and tending to mounts. Covers animal behavior, biology, and handling techniques across different planetary environments." },
    { name: "Astronavigation", category: "Knowledge", description: "Skill in plotting courses through space using star charts, navigational beacons, and stellar references. Essential for interstellar travel and avoiding hazards like black holes, nebulae, and gravitational anomalies. Critical for long-range missions across star systems and sectors." },
    { name: "Bargain", category: "Knowledge", description: "Negotiation and persuasion skills for trading, diplomacy, and conflict resolution. Essential for commerce, bartering with alien species, and achieving peaceful outcomes. Covers cultural understanding, value assessment, and verbal persuasion techniques." },
    { name: "Bureaucracy", category: "Knowledge", description: "Understanding of administrative procedures, regulations, and official protocols. Essential for navigating Starfleet paperwork, securing permits, accessing restricted facilities, and dealing with government institutions across different cultures and jurisdictions." },
    { name: "Communications", category: "Knowledge", description: "Proficiency in operating communication systems including subspace transmitters, hailing frequencies, and long-range comms. Essential for establishing contact with alien vessels, tracking distress signals, and coordinating fleet operations. Covers various communication protocols and technologies." },
    { name: "Computers", category: "Knowledge", description: "Proficiency in programming, operating, and repairing computer systems. Covers ship computers, handheld devices, and AI systems. Essential for data analysis, system repairs, and when necessary, bypassing security protocols. Includes knowledge of various operating systems and programming languages." },
    { name: "Engineering", category: "Knowledge", description: "Technical knowledge for maintaining and repairing starships, vehicles, and systems. Essential for fixing energy converters, hull plating, plasma systems, and jury-rigging solutions. Covers all vehicle types and critical for keeping vessels operational during missions." },
    { name: "Etiquette", category: "Knowledge", description: "Understanding of cultural customs, social protocols, and proper behavior across different species and civilizations. Essential for diplomatic missions, avoiding cultural offenses, and building positive relationships. Critical for Starfleet officers interacting with alien cultures." },
    { name: "Evaluate", category: "Knowledge", description: "Skill in appraising the value of items, technology, and resources on the market. Essential for salvage operations, trading, and determining worth of artifacts or equipment. Covers various markets and economies across different worlds and civilizations." },
    { name: "Languages", category: "Knowledge", description: "Proficiency in speaking and reading additional languages beyond the common tongue. Essential for direct communication with alien species, understanding ancient texts, and cultural immersion. Each rank allows mastery of one additional language of choice." },
    { name: "Law", category: "Knowledge", description: "Knowledge of legal systems, regulations, and jurisdictional laws across different governments and cultures. Essential for staying within legal boundaries, understanding rights and obligations, and navigating complex legal situations. Covers Federation law and various alien legal systems." },
    { name: "Leadership", category: "Knowledge", description: "Ability to inspire, command, and coordinate team members. Essential for tactical operations, crew management, and achieving mission objectives. Covers delegation, morale maintenance, and crisis leadership. Critical for officers and away team leaders." },
    { name: "Medicine", category: "Knowledge", description: "Medical knowledge for treating injuries and illnesses. Essential for battlefield medicine, alien physiology, and emergency care. Covers diagnosis, treatment, and surgery for various species. Critical for away team medics and shipboard medical officers." },
    { name: "Planetary Navigation", category: "Knowledge", description: "Ability to determine position and navigate on planetary surfaces using star charts, coordinates, and landmarks. Essential for exploration of unmapped worlds, finding bearings without satellite assistance, and surface operations. Critical for away team missions on new planets." },
    { name: "Sensors", category: "Knowledge", description: "Proficiency in operating sensor arrays and scanners for detection and analysis. Covers handheld tricorders, starship sensors, and specialized scanning equipment. Essential for identifying life forms, detecting energy signatures, analyzing materials, and surveying planetary environments." },
    { name: "Survival", category: "Knowledge", description: "Ability to survive in hostile environments with minimal resources. Essential when technology fails or during emergency situations. Covers finding food and water, building shelter, avoiding hazards, and basic survival techniques. Critical for crash landings and extended away missions. Can aid in emergency space survival situations." },
    { name: "Trade Knowledge", category: "Knowledge", description: "Understanding of commerce, markets, and economic systems across different worlds and civilizations. Essential for identifying profitable trade routes, understanding supply and demand, and conducting business with alien species. Covers commodities, currencies, and trade regulations." },
    
    // Science Special Skills
    { name: "Archaeology", category: "Science", description: "Study of ancient civilizations through artifacts, ruins, and historical evidence. Essential for understanding lost cultures, deciphering ancient technologies, and preserving historical knowledge. Covers excavation techniques, artifact analysis, and cultural interpretation." },
    { name: "Biology", category: "Science", description: "Study of living organisms including anatomy, physiology, and evolution. Covers both familiar and alien life forms, making the Hero a xenobiologist. Essential for medical diagnosis, understanding alien species, and biological research across different worlds." },
    { name: "Botany", category: "Science", description: "Study of plant life across different worlds and environments. Covers identification, cultivation, and properties of alien flora. Essential for agriculture, identifying edible or dangerous plants, and understanding planetary ecosystems." },
    { name: "Chemistry", category: "Science", description: "Study of matter, molecular structure, and chemical reactions. Essential for synthesizing compounds, analyzing substances, creating medicines, and understanding material properties. Useful for forensic analysis and scientific research." },
    { name: "Ecology", category: "Science", description: "Study of ecosystems and the relationships between organisms and their environments. Essential for understanding planetary biospheres, environmental hazards, and ecosystem stability. Useful for terraforming assessment and environmental protection missions." },
    { name: "Geology", category: "Science", description: "Study of planetary structure, formation, and geological processes. Essential for assessing planetary stability, identifying mineral resources, and understanding geological hazards. Useful for mining operations and planetary survey missions." },
    { name: "Meteorology", category: "Science", description: "Study of atmospheric conditions, weather patterns, and climate systems. Essential for predicting weather hazards, understanding atmospheric composition, and planning operations based on environmental conditions. Useful for planetary exploration and colonization." },
    { name: "Oceanography", category: "Science", description: "Study of oceanic systems including currents, tides, and marine ecosystems. Essential for missions involving water worlds, underwater exploration, and understanding marine environments. Covers both familiar and alien aquatic systems." },
    { name: "Physics", category: "Science", description: "Study of fundamental physical laws including matter, spacetime, energy, and forces. Essential for understanding warp drive, subspace theory, and advanced technologies. Critical for theoretical research and engineering applications." },
    { name: "Zoology", category: "Science", description: "Study of animal life including behavior, ecology, evolution, and anatomy. Covers both familiar and alien species. Essential for understanding animal behavior, identifying dangerous creatures, and xenozoological research. Useful for exploration and wildlife encounters." },
    
    // Psionic Special Skills - extracted from component
    // Note: Psionic skills are shown in the PsionicSpecialSkills component but may not have explicit descriptions
    // They typically include the 8 psionic powers per tradition
];

// Helper function to get all skills by category
export function getSkillsByCategory(category: SpecialSkillCategory): SpecialSkill[] {
    return specialSkills.filter(skill => skill.category === category);
}

// Helper function to get all skill names
export function getAllSkillNames(): string[] {
    return specialSkills.map(skill => skill.name);
}

// Helper function to find a skill by name
export function findSkillByName(name: string): SpecialSkill | undefined {
    return specialSkills.find(skill => skill.name === name);
}
