const panel = document.querySelector(".panel");
// tabButtons will be populated after DOM is ready
let tabButtons = [];
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
const newButton = document.querySelector('[data-action="new"]');
const getGradeSelects = () =>
  Array.from(document.querySelectorAll('[data-role="grade-select"]'));
const getBackgroundSelects = () =>
  Array.from(document.querySelectorAll('[data-role="background-select"]'));
const getStatsBadges = () =>
  Array.from(document.querySelectorAll('[data-role="stats-badges"]'));
const getDerivedStatsBadges = () =>
  Array.from(document.querySelectorAll('[data-role="derived-stats-badges"]'));
const getStatsHeaderActions = () =>
  Array.from(document.querySelectorAll('[data-role="stats-header-actions"]'));
const getSkillsLists = () =>
  Array.from(document.querySelectorAll('[data-role="skills-list"]'));
const getFeaturesLists = () =>
  Array.from(document.querySelectorAll('[data-role="features-list"]'));
const getFeatureCategoryPickers = () =>
  Array.from(document.querySelectorAll('[data-role="feature-category-picker"]'));
const getFeatureListPickers = () =>
  Array.from(document.querySelectorAll('[data-role="feature-list-picker"]'));
const getSkillCategoryPickers = () =>
  Array.from(document.querySelectorAll('[data-role="skill-category-picker"]'));
const getSkillListPickers = () =>
  Array.from(document.querySelectorAll('[data-role="skill-list-picker"]'));
const getSkillAddButtons = () =>
  Array.from(document.querySelectorAll('[data-role="skill-add"]'));
const getSkillAdjusters = () =>
  Array.from(document.querySelectorAll('[data-role="skill-adjust"]'));
const getSkillRemovers = () =>
  Array.from(document.querySelectorAll('[data-role="skill-remove"]'));

let baseCharacteristics = {
  BODY: 4,
  MIND: 4,
  LUCK: 8,
};
let statPointsByGrade = {};
let statCostsByStat = {};
let currentStatModifiers = {};
let gradeMaxBonusesByGrade = {};
let backgroundSourceCache = null;
let skills = [];
let backgroundSkillModifiers = new Map();
let skillRanks = new Map();
let purchasedSkills = new Set();
let skillPointsByGrade = {};
let featurePointsByGrade = {};
let maxSkillRanksByGrade = {};
let purchasedFeatures = new Set(); // Features purchased with feature points (separate from background features)
let backgroundFeatures = [];
let featureSelections = new Map(); // Store selections for features that require them (e.g., Hunter enemy type)
let featuresMap = new Map(); // Map of feature ID -> feature definition
let currentBackgroundName = "";
const PLAYER_TABS_SELECTOR = '[data-role="player-tabs"]';
const METADATA_KEY = "affStarTrek.characters";
const PERSIST_DEBOUNCE_MS = 400;
let obrReady = false;
let isDm = false;
let localPlayerId = null;
let activePlayerId = null;
let cachedPlayers = [];
let persistenceReady = false;
let isApplyingRemote = false;
let persistTimer = null;
const statBadgeMaps = new Map();
const statState = new Map();
const activePanelKey = () =>
  panel?.dataset.activeTab || "sheet";
const getPlayerTabsContainer = () =>
  document.querySelector(PLAYER_TABS_SELECTOR);

const getCharactersFromMetadata = (metadata) => {
  const raw = metadata?.[METADATA_KEY];
  if (!raw || typeof raw !== "object") return {};
  return raw;
};

const schedulePersist = () => {
  if (!persistenceReady || isApplyingRemote || !obrReady || !activePlayerId) return;
  if (persistTimer) {
    window.clearTimeout(persistTimer);
  }
  persistTimer = window.setTimeout(() => {
    persistTimer = null;
    persistCharacter().catch((error) => {
      console.error("Error persisting character:", error);
    });
  }, PERSIST_DEBOUNCE_MS);
};

const persistCharacter = async () => {
  if (!obrReady || !activePlayerId || !window.OBR?.room?.getMetadata) return;
  const characterData = buildCharacterData();
  const metadata = await window.OBR.room.getMetadata();
  const characters = getCharactersFromMetadata(metadata);
  const next = {
    ...characters,
    [activePlayerId]: characterData,
  };
  await window.OBR.room.setMetadata({
    ...metadata,
    [METADATA_KEY]: next,
  });
};

const getSelfPlayer = async () => {
  if (window.OBR?.player?.getSelf) {
    return window.OBR.player.getSelf();
  }
  const id = await window.OBR?.player?.getId?.();
  const name = await window.OBR?.player?.getName?.();
  const role = await window.OBR?.player?.getRole?.();
  return { id, name, role };
};

const getAllPlayers = async (self) => {
  if (window.OBR?.party?.getPlayers) {
    return window.OBR.party.getPlayers();
  }
  return self ? [self] : [];
};

const renderPlayerTabs = (players, activeId) => {
  const container = getPlayerTabsContainer();
  if (!container) return;
  container.innerHTML = "";
  players.forEach((player) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `player-tab${player.id === activeId ? " is-active" : ""}`;
    button.dataset.playerId = player.id;
    button.textContent = player.name || "Unknown Player";
    button.addEventListener("click", () => {
      if (player.id === activePlayerId) return;
      switchActivePlayer(player.id);
    });
    container.appendChild(button);
  });
};

const loadCharacterForPlayer = async (playerId) => {
  if (!obrReady || !playerId || !window.OBR?.room?.getMetadata) return false;
  const metadata = await window.OBR.room.getMetadata();
  const characters = getCharactersFromMetadata(metadata);
  const data = characters[playerId];
  isApplyingRemote = true;
  try {
    if (data) {
      await applyCharacterData(data);
      return true;
    }
    resetCharacter();
    return false;
  } finally {
    isApplyingRemote = false;
  }
};

const switchActivePlayer = async (playerId) => {
  if (persistenceReady && activePlayerId && activePlayerId !== playerId) {
    if (persistTimer) {
      window.clearTimeout(persistTimer);
      persistTimer = null;
    }
    await persistCharacter();
  }
  activePlayerId = playerId;
  if (isDm) {
    renderPlayerTabs(cachedPlayers, activePlayerId);
  }
  await loadCharacterForPlayer(activePlayerId);
};

const initObrContext = async () => {
  if (!window.OBR?.onReady) return false;
  await window.OBR.onReady();
  obrReady = true;
  const self = await getSelfPlayer();
  localPlayerId = self?.id || null;
  const role = (self?.role || "").toString().toLowerCase();
  isDm = role === "gm" || role === "dm";
  cachedPlayers = await getAllPlayers(self);
  activePlayerId = localPlayerId;

  const playerTabs = getPlayerTabsContainer();
  if (playerTabs) {
    if (isDm) {
      renderPlayerTabs(cachedPlayers, activePlayerId);
      playerTabs.hidden = false;
    } else {
      playerTabs.hidden = true;
    }
  }

  if (window.OBR?.party?.onChange) {
    window.OBR.party.onChange((players) => {
      cachedPlayers = players;
      if (isDm) {
        renderPlayerTabs(cachedPlayers, activePlayerId);
      }
    });
  }

  const loaded = await loadCharacterForPlayer(activePlayerId);
  persistenceReady = true;
  return loaded;
};
const skillCategoryEmojis = {
  Combat: "⚔️",
  Movement: "🏃",
  Stealth: "🕵️",
  Knowledge: "📚",
  Science: "🧪",
  Speech: "💬",
  Psionic: "🔮",
  Pilot: "✈️",
  Language: "🗣️",
};

// Category order: Combat, Psionic, Movement, Pilot, Stealth, Knowledge, Science, Language
const skillCategoryOrder = ["Combat", "Psionic", "Movement", "Pilot", "Stealth", "Knowledge", "Science", "Speech", "Language"];
let defaultGradeValue = "Uncommon";
let defaultBackgroundValue = "";
const gradeColors = {
  Poor: "#9d9d9d",
  Common: "#ffffff",
  Uncommon: "#1eff00",
  Rare: "#0070dd",
  Epic: "#a335ee",
  Legendary: "#ff8000",
  Mythic: "#e6cc80",
};
const defaultStatPoints = {
  Poor: 5,
  Common: 6,
  Uncommon: 7,
  Rare: 8,
  Epic: 9,
  Legendary: 10,
  Mythic: 11,
};
const defaultGradeMaxBonuses = {
  Poor: { BODY: 1, LUCK: 3, MIND: 1 },
  Common: { BODY: 2, LUCK: 3, MIND: 2 },
  Uncommon: { BODY: 3, LUCK: 3, MIND: 3 },
  Rare: { BODY: 4, LUCK: 3, MIND: 4 },
  Epic: { BODY: 5, LUCK: 3, MIND: 5 },
  Legendary: { BODY: 6, LUCK: 3, MIND: 6 },
  Mythic: { BODY: 7, LUCK: 3, MIND: 7 },
};
gradeMaxBonusesByGrade = { ...defaultGradeMaxBonuses };
const statColorScale = [
  gradeColors.Poor,
  gradeColors.Common,
  gradeColors.Uncommon,
  gradeColors.Rare,
  gradeColors.Epic,
  gradeColors.Legendary,
  gradeColors.Mythic,
];
const updateTabInteractivity = () => {
  const activeTab = activePanelKey();
  const gradeEnabled = activeTab === "edit";
  const backgroundEnabled = activeTab === "edit";
  const shouldShowPoints = activeTab === "edit";
  getGradeSelects().forEach((select) => {
    select.disabled = !gradeEnabled;
  });
  getBackgroundSelects().forEach((select) => {
    select.disabled = !backgroundEnabled;
  });
  // Stat points are now in the header, no need to hide/show badges
  // + SKILL button removed
  // Feature points are now in the header, update them when tab changes
  updateFeaturePointsBadge();
  getSkillCategoryPickers().forEach((picker) => {
    if (!shouldShowPoints) {
      picker.hidden = true;
    }
  });
  getSkillListPickers().forEach((picker) => {
    if (!shouldShowPoints) {
      picker.hidden = true;
    }
  });
  // Stat adjustment is now via click on badges, no separate buttons
  const statBadgesAdjustable = Array.from(
    document.querySelectorAll('[data-role="stat-badge-adjustable"]')
  );
  statBadgesAdjustable.forEach((badge) => {
    badge.style.cursor = shouldShowPoints ? "pointer" : "default";
  });
  // Skill adjustment is now via click on badges, no separate buttons
  if (shouldShowPoints) {
    updateStatPointsBadges();
    updateAdjusterStates();
  }
};

const resizePopover = () => {
  try {
    const targetWidth = Math.floor(window.screen.availWidth / 3);
    const targetHeight = Math.floor(window.screen.availHeight);

    if (Number.isFinite(targetWidth) && Number.isFinite(targetHeight)) {
      window.resizeTo(targetWidth, targetHeight);
      window.moveTo(0, 0);
    }
  } catch (error) {
    // Popover resize can be blocked; keep layout styles as fallback.
    if (panel) {
      panel.dataset.resizeFailed = "true";
    }
  }
};

window.addEventListener("load", async () => {
  resizePopover();
  mirrorTabPanels();
  await loadBaseCharacteristics();
  await loadStatCosts();
  await loadStatPoints();
  await loadStatsBadges();
  await loadFeatures();
  await loadSkills();
  await loadSkillPoints();
  await loadGradeOptions();
  await loadBackgroundOptions();
  attachBackgroundListeners();
  attachGradeListeners();
  const loadedFromMetadata = await initObrContext();
  if (!loadedFromMetadata) {
    const firstBackground = getBackgroundSelects()[0]?.value || defaultBackgroundValue;
    await updateStatsForBackground(firstBackground);
    renderSkills();
    updateSkillPointsBadge();
    updateFeaturePointsBadge();
  }
  updateTabInteractivity();
  updateStatPointsBadges();
  
  // Update tabButtons now that DOM is ready
  tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  
  // Diagnostic: Log all tab buttons found in DOM
  console.log(`[DEBUG] Found ${tabButtons.length} tab buttons:`, tabButtons.map(btn => ({
    action: btn.dataset.action,
    tab: btn.dataset.tab,
    title: btn.title,
    visible: btn.offsetParent !== null,
    display: window.getComputedStyle(btn).display,
    element: btn
  })));
  
  // Set up tab button listeners after DOM is ready
  const buttons = tabButtons;
  buttons.forEach((button) => {
    const tab = button.dataset.tab;
    // Only add tab switching listener to buttons with data-tab attribute
    if (tab) {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        setActiveTab(tab);
      });
    }
  });
  
  // Set up NEW button listener
  const newBtn = document.querySelector('[data-action="new"]');
  if (newBtn) {
    newBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      const confirmed = window.confirm(
        "This will clear the current character. Continue?"
      );
      if (!confirmed) return;
      resetCharacter();
    });
  }
  
  // Set up SAVE button listener
  const saveBtn = document.querySelector('[data-action="save"]');
  if (saveBtn) {
    console.log("[DEBUG] Save button found and listener attached", saveBtn);
    console.log("[DEBUG] Save button computed styles:", {
      display: window.getComputedStyle(saveBtn).display,
      visibility: window.getComputedStyle(saveBtn).visibility,
      opacity: window.getComputedStyle(saveBtn).opacity,
      width: window.getComputedStyle(saveBtn).width,
      height: window.getComputedStyle(saveBtn).height
    });
    saveBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      console.log("[DEBUG] Save button clicked!");
      saveCharacter();
    });
  } else {
    console.error("[DEBUG] Save button NOT FOUND in DOM!");
    console.error("[DEBUG] All buttons with data-action:", document.querySelectorAll('[data-action]'));
  }
  
  // Set up LOAD button listener
  const loadBtn = document.querySelector('[data-action="load"]');
  if (loadBtn) {
    console.log("[DEBUG] Load button found and listener attached", loadBtn);
    console.log("[DEBUG] Load button computed styles:", {
      display: window.getComputedStyle(loadBtn).display,
      visibility: window.getComputedStyle(loadBtn).visibility,
      opacity: window.getComputedStyle(loadBtn).opacity,
      width: window.getComputedStyle(loadBtn).width,
      height: window.getComputedStyle(loadBtn).height
    });
    loadBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      console.log("[DEBUG] Load button clicked!");
      loadCharacter();
    });
  } else {
    console.error("[DEBUG] Load button NOT FOUND in DOM!");
    console.error("[DEBUG] All buttons with data-action:", document.querySelectorAll('[data-action]'));
  }
});
window.addEventListener("resize", () => {
  if (panel) {
    panel.style.height = `${window.innerHeight}px`;
  }
});

const parseStringList = (text) => {
  const matches = text.match(/"([^"]+)"/g) || [];
  return matches.map((item) => item.slice(1, -1));
};

const parseNumberMap = (blockText) => {
  const entries = {};
  const matches = blockText.matchAll(/(?:"([^"]+)"|([A-Z_]+))\s*:\s*(-?\d+)/g);
  for (const match of matches) {
    const key = match[1] || match[2];
    if (key) {
      entries[key] = Number(match[3]);
    }
  }
  return entries;
};

const extractObjectBlock = (text, startIndex) => {
  const braceStart = text.indexOf("{", startIndex);
  if (braceStart === -1) return null;
  let depth = 0;
  for (let i = braceStart; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(braceStart + 1, i);
      }
    }
  }
  return null;
};

const loadBaseCharacteristics = async () => {
  try {
    const response = await fetch("./data/statsMaxValuesByQuality.ts");
    const text = await response.text();
    const match = text.match(/baseCharacteristics\s*=\s*\{([\s\S]*?)\}/);
    if (!match) return;
    const parsed = parseNumberMap(match[1]);
    baseCharacteristics = {
      BODY: parsed.BODY ?? baseCharacteristics.BODY,
      MIND: parsed.MIND ?? baseCharacteristics.MIND,
      LUCK: parsed.LUCK ?? baseCharacteristics.LUCK,
    };
    const parsedBonuses = parseGradeMaxBonusesFromText(text);
    gradeMaxBonusesByGrade = Object.keys(parsedBonuses).length === 0
      ? { ...defaultGradeMaxBonuses }
      : parsedBonuses;
  } catch (error) {
    // Keep defaults if parsing fails.
    gradeMaxBonusesByGrade = { ...defaultGradeMaxBonuses };
  }
};

const parseGradeMaxBonusesFromText = (text) => {
  const startIndex = text.indexOf("statsMaxValuesByQuality");
  if (startIndex === -1) return {};
  const blockText = extractObjectBlock(text, startIndex);
  if (!blockText) return {};

  const result = {};
  const quote = '"';
  const findMatchingBrace = (s, braceStart) => {
    let depth = 0;
    for (let i = braceStart; i < s.length; i += 1) {
      if (s[i] === "{") depth += 1;
      if (s[i] === "}") {
        depth -= 1;
        if (depth === 0) return i;
      }
    }
    return -1;
  };

  let idx = 0;
  while (idx < blockText.length) {
    const keyStart = blockText.indexOf(quote, idx);
    if (keyStart === -1) break;
    const keyEnd = blockText.indexOf(quote, keyStart + 1);
    if (keyEnd === -1) break;
    const grade = blockText.slice(keyStart + 1, keyEnd);
    const braceStart = blockText.indexOf("{", keyEnd);
    if (braceStart === -1) break;
    const braceEnd = findMatchingBrace(blockText, braceStart);
    if (braceEnd === -1) break;
    const bonusBlock = blockText.slice(braceStart + 1, braceEnd);
    if (grade) {
      result[grade] = parseNumberMap(bonusBlock);
    }
    idx = braceEnd + 1;
  }

  return result;
};

const loadStatCosts = async () => {
  try {
    const response = await fetch("./data/statCosts.ts", { cache: "no-store" });
    const text = await response.text();
    const match = text.match(/statCosts\s*(?::[^=]+)?=\s*\{([\s\S]*?)\}/);
    if (!match) return;
    statCostsByStat = parseNumberMap(match[1]);
  } catch (error) {
    statCostsByStat = {};
  }
};

const loadStatPoints = async () => {
  try {
    const response = await fetch("./data/statPoints.ts", { cache: "no-store" });
    const text = await response.text();
    const match = text.match(/statPointsByGrade\s*(?::[^=]+)?=\s*\{([\s\S]*?)\}/);
    if (!match) {
      statPointsByGrade = parseNumberMap(text);
    } else {
      statPointsByGrade = parseNumberMap(match[1]);
    }
    if (Object.keys(statPointsByGrade).length === 0) {
      statPointsByGrade = { ...defaultStatPoints };
    }
  } catch (error) {
    statPointsByGrade = { ...defaultStatPoints };
  }
};

const loadGradeOptions = async () => {
  const selects = getGradeSelects();
  if (selects.length === 0) return;
  try {
    const response = await fetch("./data/grades.ts", { cache: "no-store" });
    const text = await response.text();
    const listMatch = text.match(/gradeOptions\s*=\s*\[([\s\S]*?)\]/);
    const options = listMatch ? parseStringList(listMatch[1]) : [];
    if (options.length === 0) {
      throw new Error("No grade options found");
    }
    selects.forEach((select) => {
      select.innerHTML = "";
      options.forEach((grade) => {
        const option = document.createElement("option");
        option.value = grade;
        option.textContent = grade;
        select.appendChild(option);
      });
      if (!select.value && options.length > 0) {
        defaultGradeValue = options.includes("Uncommon") ? "Uncommon" : options[0];
        select.value = defaultGradeValue;
      }
    });
    if (options.length > 0 && !defaultGradeValue) {
      defaultGradeValue = options[0];
    }
    syncSelectValues("grade", selects[0]?.value || defaultGradeValue);
  } catch (error) {
    selects.forEach((select) => {
      select.innerHTML = "<option>Grades unavailable</option>";
    });
  }
};

const loadBackgroundOptions = async () => {
  const selects = getBackgroundSelects();
  if (selects.length === 0) return;
  try {
    const response = await fetch("./data/backgrounds.ts", { cache: "no-store" });
    const text = await response.text();
    const matches = Array.from(text.matchAll(/"([^"]+)":\s*\{/g));
    const options = matches.map((match) => match[1]).sort();
    if (options.length === 0) {
      throw new Error("No background options found");
    }
    selects.forEach((select) => {
      select.innerHTML = "";
      options.forEach((background) => {
        const option = document.createElement("option");
        option.value = background;
        option.textContent = background;
        select.appendChild(option);
      });
    });
    if (options.length > 0) {
      defaultBackgroundValue = options[0];
    }
  } catch (error) {
    selects.forEach((select) => {
      select.innerHTML = "<option>Backgrounds unavailable</option>";
    });
  }
};

const getBackgroundBlock = async (backgroundName) => {
  if (!backgroundSourceCache) {
    const response = await fetch("./data/backgrounds.ts", { cache: "no-store" });
    backgroundSourceCache = await response.text();
  }
  const escaped = backgroundName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = backgroundSourceCache.match(new RegExp(`"${escaped}"\\s*:\\s*\\{`));
  if (!match || match.index === undefined) return null;
  return extractObjectBlock(backgroundSourceCache, match.index);
};

const getBackgroundModifiers = async (backgroundName) => {
  const block = await getBackgroundBlock(backgroundName);
  if (!block) return {};

  const modifiersBlockMatch = block.match(/statModifiers\s*:\s*\{/);
  if (modifiersBlockMatch) {
    const modifiersBlock = extractObjectBlock(block, modifiersBlockMatch.index);
    if (modifiersBlock) {
      return parseNumberMap(modifiersBlock);
    }
  }

  const baseBlockMatch = block.match(/baseCharacteristics\s*:\s*\{/);
  if (baseBlockMatch) {
    const baseBlock = extractObjectBlock(block, baseBlockMatch.index);
    if (baseBlock) {
      const base = parseNumberMap(baseBlock);
      const bodyBase = base.SKILL ?? base.BODY ?? 0;
      const mindBase = base.PSIONICS ?? base.MIND ?? 0;
      return {
        BODY: bodyBase - baseCharacteristics.BODY,
        MIND: mindBase - baseCharacteristics.MIND,
        LUCK: (base.LUCK ?? 0) - baseCharacteristics.LUCK,
        HEALTH: (base.STAMINA ?? 0) - bodyBase * 2,
      };
    }
  }

  return {};
};

const parseFeatureList = (blockText) => {
  const features = [];
  if (!blockText) return features;

  const objectBlocks = blockText.match(/\{[\s\S]*?\}/g) || [];
  objectBlocks.forEach((block) => {
    const nameMatch = block.match(/name\s*:\s*"([^"]+)"/);
    const variantMatch = block.match(/variantId\s*:\s*"([^"]+)"/);
    if (nameMatch) {
      features.push({
        id: nameMatch[1],
        name: nameMatch[1],
        variantId: variantMatch ? variantMatch[1] : undefined,
        isChoice: Boolean(variantMatch),
      });
    }
  });

  const textWithoutObjects = blockText.replace(/\{[\s\S]*?\}/g, "");
  parseStringList(textWithoutObjects).forEach((id) => {
    features.push({ id });
  });

  return features;
};

const getBackgroundFeatures = async (backgroundName) => {
  const block = await getBackgroundBlock(backgroundName);
  if (!block) return [];
  const featuresMatch = block.match(/features\s*:\s*\[([\s\S]*?)\]/);
  if (!featuresMatch) return [];
  return parseFeatureList(featuresMatch[1]);
};

const loadFeatures = async () => {
  try {
    const response = await fetch("./data/features.ts", { cache: "no-store" });
    const text = await response.text();
    featuresMap.clear();
    
    // Extract each feature object from the features array
    // Match: { id: '...', name: '...', ... }
    // Use a more robust approach: find opening brace, then match until the matching closing brace
    const featureBlockRegex = /\{\s*id:\s*['"]([^'"]+)['"]/g;
    let blockMatch;
    let loadedCount = 0;
    
    while ((blockMatch = featureBlockRegex.exec(text)) !== null) {
      const startPos = blockMatch.index;
      const id = blockMatch[1];
      
      if (!id) continue;
      
      // Find the matching closing brace for this feature object
      let braceCount = 0;
      let inString = false;
      let stringChar = null;
      let endPos = startPos;
      
      for (let i = startPos; i < text.length; i++) {
        const char = text[i];
        const prevChar = i > 0 ? text[i - 1] : '';
        
        // Handle string escaping
        if (prevChar === '\\' && inString) {
          continue;
        }
        
        // Toggle string state
        if ((char === '"' || char === "'") && !inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar && inString) {
          inString = false;
          stringChar = null;
        }
        
        // Count braces (only when not in string)
        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              endPos = i + 1;
              break;
            }
          }
        }
      }
      
      const block = text.substring(startPos, endPos);
      
      const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
      const emojiMatch = block.match(/emoji:\s*['"]([^'"]+)['"]/);
      const exclusiveCategoryMatch = block.match(/exclusiveCategory:\s*['"]([^'"]+)['"]/);
      // Description can contain quotes, so we need to match the entire string including escaped quotes
      const descriptionMatch = block.match(/description:\s*['"]([^'"]*(?:\\.[^'"]*)*)['"]/);
      
      const name = nameMatch ? nameMatch[1] : formatFeatureName(id);
      const emoji = emojiMatch ? emojiMatch[1] : "";
      const description = descriptionMatch ? descriptionMatch[1].replace(/\\'/g, "'").replace(/\\"/g, '"') : "";
      const exclusiveCategory = exclusiveCategoryMatch ? exclusiveCategoryMatch[1] : null;
      // Extract cost field
      const costMatch = block.match(/cost:\s*(-?\d+)/);
      const cost = costMatch ? Number(costMatch[1]) : 0;
      // Extract costType field
      const costTypeMatch = block.match(/costType:\s*['"]([^'"]+)['"]/);
      const costType = costTypeMatch ? costTypeMatch[1] : "none";
      // Extract type field
      const typeMatch = block.match(/type:\s*['"]([^'"]+)['"]/);
      const type = typeMatch ? typeMatch[1] : "talent";
      // Extract mindValue field
      const mindValueMatch = block.match(/mindValue:\s*(\d+)/);
      const mindValue = mindValueMatch ? Number(mindValueMatch[1]) : null;
      // Extract grade field
      const gradeMatch = block.match(/grade:\s*['"]([^'"]+)['"]/);
      const grade = gradeMatch ? gradeMatch[1] : null;
      // Extract category field
      const categoryMatch = block.match(/category:\s*['"]([^'"]+)['"]/);
      const category = categoryMatch ? categoryMatch[1] : null;
      // Extract skillBonuses field (e.g., skillBonuses: { 'Acrobatics': 1 })
      let skillBonuses = null;
      const skillBonusesMatch = block.match(/skillBonuses:\s*\{([^}]+)\}/);
      if (skillBonusesMatch) {
        skillBonuses = {};
        const bonusesText = skillBonusesMatch[1];
        const bonusEntries = bonusesText.matchAll(/(?:['"])([^'"]+)(?:['"])\s*:\s*(\d+)/g);
        for (const entry of bonusEntries) {
          skillBonuses[entry[1]] = Number(entry[2]);
        }
      }
      
      featuresMap.set(id, {
        id,
        name,
        emoji,
        description,
        exclusiveCategory,
        cost,
        costType,
        type,
        mindValue,
        grade,
        category,
        skillBonuses
      });
      loadedCount++;
    }
    console.log(`Loaded ${loadedCount} features, ${featuresMap.size} total in map`);
    const purchasableCount = Array.from(featuresMap.values()).filter(f => f.costType === 'feature-points').length;
    console.log(`Found ${purchasableCount} features with costType 'feature-points'`);
  } catch (error) {
    console.error("Error loading features:", error);
    featuresMap.clear();
  }
};

const loadSkills = async () => {
  try {
    const response = await fetch("./data/skills.ts", { cache: "no-store" });
    const text = await response.text();
    const matches = Array.from(
      text.matchAll(/\{\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)"(?:,[^\n]*?emoji:\s*"([^"]+)")?/g)
    );
    skills = matches.map((match) => ({
      name: match[1],
      category: match[2],
      emoji: match[3] || "",
    }));
    populateSkillPickers();
    renderSkills();
  } catch (error) {
    skills = [];
  }
};

const loadSkillPoints = async () => {
  try {
    const response = await fetch("./data/skillPoints.ts", { cache: "no-store" });
    const text = await response.text();
    const pointsMatch = text.match(/skillPoints\s*(?::[^=]+)?=\s*\{([\s\S]*?)\}/);
    const maxMatch = text.match(/maxSkillRanks\s*(?::[^=]+)?=\s*\{([\s\S]*?)\}/);
    if (pointsMatch) {
      skillPointsByGrade = parseNumberMap(pointsMatch[1]);
    }
    if (maxMatch) {
      maxSkillRanksByGrade = parseNumberMap(maxMatch[1]);
    }
  } catch (error) {
    skillPointsByGrade = {};
    maxSkillRanksByGrade = {};
  }
  
  // Load feature points
  try {
    const featurePointsResponse = await fetch("./data/featurePoints.ts?t=" + Date.now(), { cache: "no-store" });
    if (featurePointsResponse.ok) {
      const featurePointsText = await featurePointsResponse.text();
      const featurePointsMatch = featurePointsText.match(/featurePoints\s*(?::[^=]+)?=\s*\{([\s\S]*?)\}/);
      if (featurePointsMatch) {
        featurePointsByGrade = parseNumberMap(featurePointsMatch[1]);
      }
    }
  } catch (error) {
    // Fallback to default values
  }
  if (Object.keys(featurePointsByGrade).length === 0) {
    featurePointsByGrade = {
      "Poor": 0,
      "Common": 2,
      "Uncommon": 4,
      "Rare": 6,
      "Epic": 8,
      "Legendary": 10,
      "Mythic": 12,
    };
  }
};

const updateSkillPointsBadge = () => {
  const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
  const totalPoints = skillPointsByGrade[currentGrade] ?? 0;
  const spentPoints = getSkillSpentPoints();
  
  // Update the SKILLS header title in all tab panels
  const skillsTitles = Array.from(document.querySelectorAll('[data-role="skills-title"]'));
  skillsTitles.forEach((title) => {
    const panel = title.closest(".tab-panel");
    const panelKey = panel?.dataset?.tabPanel;
    if (panelKey === "sheet" || panelKey === "level-up") {
      title.textContent = "SKILLS";
      return;
    }
    title.textContent = `SKILLS (${formatPointsDecimal(spentPoints)}/${formatPointsDecimal(totalPoints)})`;
  });
  
  // Update inline skill points in picker modals
  const inlineBadges = Array.from(
    document.querySelectorAll('[data-role="skill-points-inline"] .stat-value')
  );
  inlineBadges.forEach((valueEl) => {
    valueEl.textContent = `${formatPointsDecimal(spentPoints)}/${formatPointsDecimal(totalPoints)}`;
  });
};

const getSkillCost = (category) => {
  if (category === "Combat" || category === "Psionic") return 2;
  if (category === "Science") return 0.5;
  if (category === "Language") return 0.25;
  return 1;
};

const formatCostAsFraction = (cost) => {
  if (cost === 0.25) return "¼";
  if (cost === 0.5) return "½";
  if (cost === 1) return "1";
  if (cost === 2) return "2";
  // For other values, try to find a fraction
  if (Number.isInteger(cost)) return String(cost);
  // Convert decimal to fraction
  const tolerance = 0.001;
  for (let denom = 1; denom <= 100; denom++) {
    for (let num = 1; num < denom; num++) {
      const fraction = num / denom;
      if (Math.abs(cost - fraction) < tolerance) {
        return `${num}/${denom}`;
      }
    }
  }
  return cost.toFixed(2);
};

const getSkillColor = (total) => {
  if (total <= 0) return null;
  if (total === 1) return "#ffffff";
  if (total === 2) return "#1eff00";
  if (total === 3) return "#0070dd";
  if (total === 4) return "#a335ee";
  if (total === 5) return "#e6cc80";
  return "#ffd100";
};

const formatPoints = (value) => {
  if (Number.isInteger(value)) return String(value);
  // Check for common fractions
  const tolerance = 0.001;
  if (Math.abs(value % 0.25) < tolerance) {
    const quarters = Math.round(value / 0.25);
    if (quarters % 4 === 0) return String(quarters / 4);
    if (quarters % 2 === 0) return `${quarters / 2}/2`;
    return `${quarters}/4`;
  }
  if (Math.abs(value % 0.5) < tolerance) {
    const halves = Math.round(value / 0.5);
    if (halves % 2 === 0) return String(halves / 2);
    return `${halves}/2`;
  }
  return value.toFixed(2);
};

const formatPointsDecimal = (value) => {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
};

const getSkillCategoryForName = (name) => {
  const skillInfo = skills.find((skill) => skill.name === name);
  if (skillInfo?.category) return skillInfo.category;
  const backgroundInfo = backgroundSkillModifiers.get(name);
  return backgroundInfo?.category || "Skill";
};

const getSkillsAtOrAboveRank = (rank) => {
  let count = 0;
  skillRanks.forEach((value) => {
    if (value >= rank) count += 1;
  });
  return count;
};

const canIncreaseSkill = (name, currentRank) => {
  const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
  const maxRank = maxSkillRanksByGrade[currentGrade] ?? 0;
  const category = getSkillCategoryForName(name);
  const cost = getSkillCost(category);
  const remainingPoints = getSkillRemainingPoints();
  const targetRank = currentRank + 1;

  if (targetRank > maxRank) {
    return { allowed: false, reason: `Max rank ${maxRank} for grade`, cost };
  }
  if (remainingPoints < cost) {
    return { allowed: false, reason: "Not enough skill points", cost };
  }
  if (targetRank > 1) {
    const requiredRank = targetRank - 1;
    const count = getSkillsAtOrAboveRank(requiredRank);
    if (count < 2) {
      return {
        allowed: false,
        reason: `Need two rank ${requiredRank} skills first`,
        cost,
      };
    }
  }
  return { allowed: true, reason: `Cost to increase: ${cost}`, cost };
};

const getSkillSpentPoints = () => {
  let total = 0;
  skillRanks.forEach((rank, name) => {
    const category = getSkillCategoryForName(name);
    total += rank * getSkillCost(category);
  });
  return total;
};

const getFeatureSpentPoints = () => {
  let total = 0;
  purchasedFeatures.forEach((featureId) => {
    const featureDef = featuresMap.get(featureId);
    if (featureDef && featureDef.costType === "feature-points") {
      total += featureDef.cost || 0;
    }
  });
  return total;
};

const updateFeaturePointsBadge = () => {
  try {
    const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
    const totalPoints = featurePointsByGrade[currentGrade] ?? 0;
    const spentPoints = getFeatureSpentPoints();
    
    // Update the FEATURES header title in all tab panels (only show in edit mode)
    const featuresTitles = Array.from(document.querySelectorAll('[data-role="features-title"]'));
    const isEditMode = activePanelKey() === "edit";
    featuresTitles.forEach((title) => {
      if (isEditMode) {
        title.textContent = `FEATURES (${spentPoints}/${totalPoints})`;
      } else {
        title.textContent = "FEATURES";
      }
    });
    
    // Update inline feature points in picker modals
    const inlineBadges = Array.from(
      document.querySelectorAll('[data-role="feature-points-inline"] .stat-value')
    );
    inlineBadges.forEach((valueEl) => {
      if (valueEl) valueEl.textContent = `${spentPoints}/${totalPoints}`;
    });
  } catch (error) {
    // Silently fail if badge elements don't exist yet
    console.error("Error updating feature points badge:", error);
  }
};

const getAllOwnedFeatures = () => {
  const owned = new Set();
  // Add background features
  if (backgroundFeatures) {
    backgroundFeatures.forEach((feature) => {
      const featureId = typeof feature === "string" ? feature : feature.id;
      owned.add(featureId);
    });
  }
  // Add purchased features
  purchasedFeatures.forEach((featureId) => {
    owned.add(featureId);
  });
  return owned;
};

const canPurchaseFeature = (featureId) => {
  const featureDef = featuresMap.get(featureId);
  if (!featureDef) return { allowed: false, reason: "Feature not found" };
  
  // Check if already owned
  const owned = getAllOwnedFeatures();
  if (owned.has(featureId)) {
    return { allowed: false, reason: "Already owned" };
  }
  
  // Check cost type
  if (featureDef.costType !== "feature-points") {
    return { allowed: false, reason: "Not purchasable with feature points" };
  }
  
  // Exclusive category logic removed - features can now coexist
  
  // Check if enough points
  const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
  const totalPoints = featurePointsByGrade[currentGrade] ?? 0;
  const spentPoints = getFeatureSpentPoints();
  const cost = featureDef.cost || 0;
  const remainingPoints = totalPoints - spentPoints;
  
  if (remainingPoints < cost) {
    return { allowed: false, reason: "Not enough feature points", cost };
  }
  
  return { allowed: true, reason: `Cost: ${cost} feature points`, cost };
};

const purchaseFeature = (featureId, selection = null) => {
  const status = canPurchaseFeature(featureId);
  if (status.allowed) {
    purchasedFeatures.add(featureId);
    if (selection !== null) {
      featureSelections.set(featureId, selection);
    }
    renderFeatures();
    updateFeaturePointsBadge();
    populateFeatureCategoryPicker();
    schedulePersist();
    return true;
  }
  return false;
};

const showFeatureSelectionPopup = (featureId) => {
  const featureDef = featuresMap.get(featureId);
  if (!featureDef || !featureDef.requiresSelection) return false;
  
  const picker = document.querySelector('[data-role="feature-selection-picker"]');
  if (!picker) return false;
  
  const titleEl = picker.querySelector('[data-role="feature-selection-title"]');
  const bodyEl = picker.querySelector('[data-role="feature-selection-body"]');
  
  if (!titleEl || !bodyEl) return false;
  
  // Store the feature ID for when they confirm
  picker.dataset.featureId = featureId;
  
  // Set title
  titleEl.textContent = `Select ${featureDef.name} Option`;
  
  // Clear and populate body based on selection type
  bodyEl.innerHTML = "";
  
  if (featureDef.selectionType === "enemy-type") {
    // Create dropdown for enemy types
    const label = document.createElement("label");
    label.style.display = "block";
    label.style.marginBottom = "1rem";
    label.innerHTML = `<span style="display: block; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.9);">Select Enemy Type:</span>`;
    
    const select = document.createElement("select");
    select.className = "field__control";
    select.style.width = "100%";
    select.dataset.role = "enemy-type-select";
    
    // Common enemy types (can be expanded)
    const enemyTypes = [
      "Goblin", "Hill Giant", "Marsh Goblin", "Mountain Giant", "Orc", "Troll",
      "Dragon", "Demon", "Undead", "Beast", "Alien", "Robot", "Android",
      "Klingon", "Romulan", "Cardassian", "Borg", "Other"
    ];
    
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Select Enemy Type --";
    select.appendChild(defaultOption);
    
    enemyTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    });
    
    label.appendChild(select);
    bodyEl.appendChild(label);
  }
  
  picker.hidden = false;
  return true;
};

const closeFeatureSelectionPopup = () => {
  const picker = document.querySelector('[data-role="feature-selection-picker"]');
  if (picker) {
    picker.hidden = true;
    picker.dataset.featureId = "";
  }
};

const removeFeature = (featureId) => {
  if (purchasedFeatures.has(featureId)) {
    purchasedFeatures.delete(featureId);
    featureSelections.delete(featureId); // Also remove any selection
    renderFeatures();
    updateFeaturePointsBadge();
    populateFeatureCategoryPicker();
    schedulePersist();
    return true;
  }
  return false;
};

const getFeatureTypeEmoji = (type) => {
  const typeEmojis = {
    talent: "⭐",
    drawback: "⚠️",
    mutation: "🧬",
    cyberware: "🔧",
    "neutral-feature": "✨",
    "racial-talent": "👤"
  };
  return typeEmojis[type] || "✨";
};

const getFeatureTypeLabel = (type) => {
  const typeLabels = {
    talent: "Talents",
    drawback: "Drawbacks",
    mutation: "Mutations",
    cyberware: "Cyberware",
    "neutral-feature": "Neutral Features",
    "racial-talent": "Racial Talents"
  };
  return typeLabels[type] || type;
};

const populateFeatureCategoryPicker = () => {
  // Get all unique categories from purchasable features (using skill categories)
  const categories = new Set();
  let purchasableCount = 0;
  featuresMap.forEach((featureDef, featureId) => {
    if (featureDef.costType === "feature-points") {
      purchasableCount++;
      const category = featureDef.category || skillCategoryOrder[0];
      if (skillCategoryOrder.includes(category)) {
        categories.add(category);
      }
    }
  });
  
  // Sort categories by skill category order
  const sortedCategories = Array.from(categories).sort((a, b) => {
    const aIndex = skillCategoryOrder.indexOf(a);
    const bIndex = skillCategoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  getFeatureCategoryPickers().forEach((picker) => {
    const categoryGrid = picker.querySelector('[data-role="feature-category-buttons"]');
    if (!(categoryGrid instanceof HTMLElement)) {
      return;
    }
    categoryGrid.innerHTML = "";
    
    sortedCategories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "skill-category-button";
      button.dataset.role = "feature-category-button";
      button.dataset.category = category;
      const emoji = skillCategoryEmojis[category] || "✨";
      
      // Count available features in this category (not already purchased)
      const availableFeatures = Array.from(featuresMap.entries()).filter(([featureId, featureDef]) => {
        if (featureDef.costType !== "feature-points") return false;
        const featureCategory = featureDef.category || skillCategoryOrder[0];
        if (featureCategory !== category) return false;
        // Don't count features that are already purchased
        return !purchasedFeatures.has(featureId);
      });
      const featureCount = availableFeatures.length;
      
      button.innerHTML = `<span class="skill-emoji">${emoji}</span><span>${category}</span><span class="skill-cost">(${featureCount} feature${featureCount !== 1 ? 's' : ''})</span>`;
      categoryGrid.appendChild(button);
    });
  });
  updateFeaturePointsBadge();
};

const populateFeatureListPicker = (category) => {
  getFeatureListPickers().forEach((picker) => {
    const featureList = picker.querySelector('[data-role="feature-list"]');
    if (!(featureList instanceof HTMLElement)) {
      return;
    }
    featureList.innerHTML = "";
    
    // Get all purchasable features of this category
    const purchasableFeatures = [];
    featuresMap.forEach((featureDef, featureId) => {
      if (featureDef.costType === "feature-points") {
        const featureCategory = featureDef.category || skillCategoryOrder[0];
        if (featureCategory === category) {
          purchasableFeatures.push({ id: featureId, ...featureDef });
        }
      }
    });
    
    // Sort by name
    purchasableFeatures.sort((a, b) => a.name.localeCompare(b.name));
    
    purchasableFeatures.forEach((feature) => {
      const purchaseStatus = canPurchaseFeature(feature.id);
      const isDisabled = !purchaseStatus.allowed;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "skill-picker-item";
      if (isDisabled) {
        button.classList.add("skill-picker-item--disabled");
        button.disabled = true;
      }
      button.dataset.role = "feature-item";
      button.dataset.feature = feature.id;
      
      const costText = feature.cost !== undefined ? `${feature.cost >= 0 ? '+' : ''}${feature.cost}` : "0";
      const emoji = feature.emoji || "✨";
      
      // Combine purchase status reason and description for tooltip
      const tooltipParts = [];
      if (purchaseStatus.reason) {
        tooltipParts.push(purchaseStatus.reason);
      }
      if (feature.description) {
        tooltipParts.push(feature.description);
      }
      button.title = tooltipParts.join("\n\n");
      
      button.innerHTML = `
        <div class="skill-picker-item-title">
          <span class="skill-emoji">${emoji}</span>
          <span>${feature.name}</span>
          <span style="margin-left: auto; color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">${costText} pts</span>
        </div>
      `;
      featureList.appendChild(button);
    });
  });
  updateFeaturePointsBadge();
};

const openFeaturePicker = () => {
  getFeatureCategoryPickers().forEach((picker) => {
    picker.hidden = false;
  });
  populateFeatureCategoryPicker();
};

const closeFeaturePicker = () => {
  getFeatureCategoryPickers().forEach((picker) => {
    picker.hidden = true;
  });
  getFeatureListPickers().forEach((picker) => {
    picker.hidden = true;
  });
};

const getSkillRemainingPoints = () => {
  const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
  const totalPoints = skillPointsByGrade[currentGrade] ?? 0;
  const spentPoints = getSkillSpentPoints();
  return totalPoints - spentPoints;
};

const getBackgroundSkillModifiers = async (backgroundName) => {
  const block = await getBackgroundBlock(backgroundName);
  if (!block) return new Map();
  const match = block.match(/skillModifiers\s*:\s*\[([\s\S]*?)\]/);
  if (!match) return new Map();
  const entries = Array.from(
    match[1].matchAll(/\{\s*name:\s*"([^"]+)",\s*section:\s*"([^"]+)",\s*modifier:\s*(-?\d+)\s*\}/g)
  );
  const sectionMap = {
    combat: "Combat",
    movement: "Movement",
    stealth: "Stealth",
    knowledge: "Knowledge",
    science: "Science",
    psionic: "Psionic",
  };
  const result = new Map();
  entries.forEach((entry) => {
    const name = entry[1];
    const section = entry[2];
    const modifier = Number(entry[3]);
    const category = sectionMap[section] || section;
    result.set(name, { modifier, category });
  });
  return result;
};

const calculateMoveFromLegFeatures = (features) => {
  if (!features || features.length === 0) return 4; // Default
  let baseMove = 4; // Default for humanoid legs
  let hasTrotterFeet = false;
  
  for (const feature of features) {
    const featureId = typeof feature === "string" ? feature : feature.id;
    if (featureId === "hexapod-crystalline") {
      return 5; // Crystalline hexapod sets MOVE to 5
    }
    if (featureId === "legs-humanoid") {
      baseMove = 4;
    }
    if (featureId === "feet-trotter") {
      hasTrotterFeet = true;
    }
  }
  
  // Trotter feet reduce MOVE by 1
  if (hasTrotterFeet) {
    baseMove -= 1;
  }
  
  return baseMove;
};

const updateStatsForBackground = async (backgroundName) => {
  if (!backgroundName || statBadgeMaps.size === 0) return;
  // Force refresh to pick up background changes
  backgroundSourceCache = null;
  currentBackgroundName = backgroundName;
  const modifiers = await getBackgroundModifiers(backgroundName);
  currentStatModifiers = modifiers;
  backgroundSkillModifiers = await getBackgroundSkillModifiers(backgroundName);
  backgroundFeatures = await getBackgroundFeatures(backgroundName);
  
  // Check for brain feature to set initial MIND
  let mindFromBrain = null;
  if (backgroundFeatures) {
    for (const feature of backgroundFeatures) {
      const featureId = typeof feature === "string" ? feature : feature.id;
      const featureDef = featuresMap.get(featureId);
      if (featureDef && featureDef.exclusiveCategory === "brain" && featureDef.mindValue !== null && featureDef.mindValue !== undefined) {
        mindFromBrain = featureDef.mindValue;
        break;
      }
    }
  }
  // Also check purchased features for brain
  if (mindFromBrain === null) {
    purchasedFeatures.forEach((featureId) => {
      const featureDef = featuresMap.get(featureId);
      if (featureDef && featureDef.exclusiveCategory === "brain" && featureDef.mindValue !== null && featureDef.mindValue !== undefined) {
        mindFromBrain = featureDef.mindValue;
      }
    });
  }
  
  const body = baseCharacteristics.BODY + (modifiers.BODY ?? 0);
  const mind = mindFromBrain !== null ? mindFromBrain : (baseCharacteristics.MIND + (modifiers.MIND ?? 0));
  const luck = baseCharacteristics.LUCK + (modifiers.LUCK ?? 0);
  const move = calculateMoveFromLegFeatures(backgroundFeatures);
  const power = mind * 2;
  const attacks = modifiers.ATTACKS ?? 0;
  
  // Check for health multiplier from features (default is 2)
  let healthMultiplier = 2;
  const allOwnedFeatures = getAllOwnedFeatures();
  allOwnedFeatures.forEach((featureId) => {
    const featureDef = featuresMap.get(featureId);
    if (featureDef?.healthMultiplier) {
      healthMultiplier = featureDef.healthMultiplier;
    }
  });
  
  const health = body * healthMultiplier + (modifiers.HEALTH ?? 0);

  const nextInitials = {
    BODY: body,
    MIND: mind,
    LUCK: luck,
    MOVE: move,
    POWER: power,
    ATTACKS: attacks,
    HEALTH: health,
  };

  Object.entries(nextInitials).forEach(([name, initial]) => {
    const previous = statState.get(name);
    const previousInitial = previous ? previous.initial : initial;
    const previousCurrent = previous ? previous.current : initial;
    const delta = initial - previousInitial;
    const current = previousCurrent + delta;
    statState.set(name, { initial, current });

    statBadgeMaps.forEach((map) => {
      const valueEl = map.get(name);
      if (valueEl) {
        valueEl.textContent = `${current}/${initial}`;
      }
    });
  });
  updateStatPointsBadges();
  updateAdjusterStates();
  renderSkills();
  renderFeatures();
  populateFeatureCategoryPicker();
  updateSkillPointsBadge();
  updateFeaturePointsBadge();
  populateSkillPickers();
};

const getStatInitial = (name) => {
  return statState.get(name)?.initial ?? 0;
};

const setStatState = (name, initial) => {
  const previous = statState.get(name);
  const previousInitial = previous ? previous.initial : initial;
  const previousCurrent = previous ? previous.current : initial;
  const delta = initial - previousInitial;
  const current = previousCurrent + delta;
  statState.set(name, { initial, current });
  statBadgeMaps.forEach((map) => {
    const valueEl = map.get(name);
    if (valueEl) {
      valueEl.textContent = `${current}/${initial}`;
      applyStatBadgeColor(valueEl, name, initial);
    }
  });
  schedulePersist();
};

const getStatColorIndex = (statName, value) => {
  if (statName === "BODY" || statName === "MIND") {
    if (value <= 5) return 0;
    return Math.min(6, value - 5);
  }
  if (statName === "LUCK") {
    if (value <= 8) return 0;
    return Math.min(6, value - 8);
  }
  if (statName === "HEALTH" || statName === "POWER") {
    if (value <= 11) return 0;
    const index = Math.floor((value - 12) / 2) + 1;
    return Math.min(6, Math.max(0, index));
  }
  return null;
};

const applyStatBadgeColor = (valueEl, statName, value) => {
  const badge = valueEl.closest(".stat-badge");
  if (!badge) return;
  const index = getStatColorIndex(statName, value);
  const grade = getGradeSelects()[0]?.value;
  const gradeColor = grade ? gradeColors[grade] : null;
  if (index === null) {
    if (["ATTACKS", "MOVE"].includes(statName)) {
      badge.style.borderColor = "#ffffff";
      badge.style.color = "#ffffff";
      return;
    }
    badge.style.borderColor = gradeColor || "";
    badge.style.color = gradeColor || "";
    return;
  }
  const color = statColorScale[index] || gradeColors.Poor;
  badge.style.borderColor = color;
  badge.style.color = color;
};

const refreshStatBadgeColors = () => {
  statBadgeMaps.forEach((map) => {
    map.forEach((valueEl, statName) => {
      const currentInitial = statState.get(statName)?.initial ?? 0;
      applyStatBadgeColor(valueEl, statName, currentInitial);
    });
  });
};

const getSkillBaseStat = (skillName) => {
  const skillInfo = skills.find((s) => s.name === skillName);
  if (!skillInfo) return null;
  
  const category = skillInfo.category;
  if (category === "Language") {
    // Languages don't use any stat as base
    return null;
  }
  
  if (category === "Combat" || category === "Stealth" || category === "Movement" || category === "Pilot") {
    // These skills use BODY as their base
    return "BODY";
  } else {
    // Knowledge, Science, Psionic use MIND as their base
    return "MIND";
  }
};

const recomputeDerivedStats = () => {
  // getStatInitial already includes skill bonuses, so we use it directly
  const body = getStatInitial("BODY");
  const mind = getStatInitial("MIND");
  
  // Check for health multiplier from features (default is 2)
  let healthMultiplier = 2;
  const allOwnedFeatures = getAllOwnedFeatures();
  allOwnedFeatures.forEach((featureId) => {
    const featureDef = featuresMap.get(featureId);
    if (featureDef?.healthMultiplier) {
      healthMultiplier = featureDef.healthMultiplier;
    }
  });
  
  const health = body * healthMultiplier + (currentStatModifiers.HEALTH ?? 0);
  const power = mind * 2;
  const move = calculateMoveFromLegFeatures(backgroundFeatures);
  setStatState("HEALTH", health);
  setStatState("POWER", power);
  setStatState("MOVE", move);
  setStatState("ATTACKS", currentStatModifiers.ATTACKS ?? 0);
};

const getSpentPoints = () => {
  const adjustables = ["BODY", "MIND", "LUCK"];
  return adjustables.reduce((total, statName) => {
    const base = baseCharacteristics[statName] ?? 0;
    const modifier = currentStatModifiers[statName] ?? 0;
    const currentInitial = getStatInitial(statName);
    const cost = statCostsByStat[statName] ?? 0;
    // Spending is the difference between current initial and (base + modifier)
    const baseWithModifier = base + modifier;
    const delta = Math.max(0, currentInitial - baseWithModifier);
    return total + delta * cost;
  }, 0);
};

const updateStatPointsBadges = () => {
  const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
  if (!currentGrade) return;
  const totalPoints = statPointsByGrade[currentGrade] ?? 0;
  const spentPoints = getSpentPoints();
  const statsTitles = Array.from(document.querySelectorAll('[data-role="stats-title"]'));
  statsTitles.forEach((title) => {
    const panel = title.closest(".tab-panel");
    const panelKey = panel?.dataset?.tabPanel;
    if (panelKey === "sheet" || panelKey === "level-up") {
      title.textContent = "STATS";
      return;
    }
    title.textContent = `STATS (${spentPoints}/${totalPoints})`;
  });
};

const updateAdjusterStates = () => {
  // Update tooltips for stat badges to show if they can be increased/decreased
  const statBadges = Array.from(
    document.querySelectorAll('[data-role="stat-badge-adjustable"]')
  );
  const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
  const totalPoints = statPointsByGrade[currentGrade] ?? 0;
  const spentPoints = getSpentPoints();
  const remaining = totalPoints - spentPoints;
  const gradeBonuses =
    gradeMaxBonusesByGrade[currentGrade] ||
    defaultGradeMaxBonuses[currentGrade] ||
    {};
  
  statBadges.forEach((badge) => {
    const stat = badge.dataset.stat;
    if (!stat) return;
    const base = baseCharacteristics[stat] ?? 0;
    const currentInitial = getStatInitial(stat);
    const cost = statCostsByStat[stat] ?? 0;
    const bonusCap = gradeBonuses[stat] ?? gradeBonuses.MIND ?? 0;
    const maxValue = base + bonusCap;
    const minValue = base;
    
    const canIncrease = remaining >= cost && currentInitial < maxValue;
    const canDecrease = currentInitial > minValue;
    
    let tooltip = `${stat}: ${currentInitial}/${currentInitial}`;
    if (canIncrease) {
      tooltip += `\n\nLeft click: Increase (cost: ${cost} pts)`;
    } else if (currentInitial >= maxValue) {
      tooltip += `\n\nCannot increase: Maximum value reached (${maxValue})`;
    } else {
      tooltip += `\n\nCannot increase: Insufficient stat points (need ${cost}, have ${remaining})`;
    }
    if (canDecrease) {
      tooltip += `\n\nRight click: Decrease`;
    } else {
      tooltip += `\n\nCannot decrease: Minimum value (${minValue})`;
    }
    badge.title = tooltip;
  });
};

const loadStatsBadges = async () => {
  const badgeContainers = getStatsBadges();
  if (badgeContainers.length === 0) return;
  try {
    const indexResponse = await fetch("./characteristics/index.json", { cache: "no-store" });
    const indexData = await indexResponse.json();
    const files = indexData.files || indexData;

    const stats = [];
    for (const file of files) {
      const cleanPath = String(file).replace(/^characteristics\//, "");
      const response = await fetch(`./characteristics/${cleanPath}`, { cache: "no-store" });
      if (!response.ok) continue;
      const data = await response.json();
      stats.push(data);
    }

    const baseStatsOrder = ["BODY", "MIND", "LUCK"];
    const derivedStatsOrder = ["HEALTH", "POWER", "ATTACKS", "MOVE"];
    const allStatsOrder = [...baseStatsOrder, ...derivedStatsOrder];
    
    stats.sort((a, b) => {
      const aIndex = allStatsOrder.indexOf(a.name);
      const bIndex = allStatsOrder.indexOf(b.name);
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }
      return a.name.localeCompare(b.name);
    });
    
    // Separate base stats and derived stats
    const baseStats = stats.filter((s) => baseStatsOrder.includes(s.name));
    const derivedStats = stats.filter((s) => derivedStatsOrder.includes(s.name));
    
    // Clear base stats containers
    badgeContainers.forEach((container, index) => {
      container.innerHTML = "";
      statBadgeMaps.set(index, new Map());
    });
    
    // Clear derived stats containers
    const derivedBadgeContainers = getDerivedStatsBadges();
    derivedBadgeContainers.forEach((container) => {
      container.innerHTML = "";
    });
    
    statState.clear();
    
    // Render base stats
    baseStats.forEach((stat) => {
      badgeContainers.forEach((container, index) => {
        const badge = document.createElement("div");
        badge.className = "stat-badge";
        badge.dataset.statName = stat.name;
        badge.innerHTML = `
          <span class="stat-emoji">${stat.emoji || "⭐"}</span>
          <span class="stat-name">${stat.name}</span>
          <span class="stat-value">0/0</span>
        `;
        if (["BODY", "MIND", "LUCK"].includes(stat.name)) {
          badge.dataset.role = "stat-badge-adjustable";
          badge.dataset.stat = stat.name;
          badge.style.cursor = "pointer";
        }
        const valueEl = badge.querySelector(".stat-value");
        if (valueEl) {
          const map = statBadgeMaps.get(index);
          map?.set(stat.name, valueEl);
          statState.set(stat.name, { initial: 0, current: 0 });
        }
        container.appendChild(badge);
      });
    });
    
    // Add XP badge to base stats
    badgeContainers.forEach((container, index) => {
      const xpBadge = document.createElement("div");
      xpBadge.className = "stat-badge stat-badge--xp";
      xpBadge.dataset.role = "stat-xp";
      xpBadge.innerHTML = `
        <span class="stat-emoji">✨</span>
        <span class="stat-name">XP</span>
        <span class="stat-value">0</span>
      `;
      container.appendChild(xpBadge);
    });
    
    // Render derived stats
    derivedStats.forEach((stat) => {
      derivedBadgeContainers.forEach((container, index) => {
        const badge = document.createElement("div");
        badge.className = "stat-badge";
        badge.dataset.statName = stat.name;
        badge.innerHTML = `
          <span class="stat-emoji">${stat.emoji || "⭐"}</span>
          <span class="stat-name">${stat.name}</span>
          <span class="stat-value">0/0</span>
        `;
        const valueEl = badge.querySelector(".stat-value");
        if (valueEl) {
          const map = statBadgeMaps.get(index);
          map?.set(stat.name, valueEl);
          statState.set(stat.name, { initial: 0, current: 0 });
        }
        container.appendChild(badge);
      });
    });
  } catch (error) {
    badgeContainers.forEach((container) => {
      container.innerHTML = "<p>Stats unavailable.</p>";
    });
  }
};

const populateSkillPickers = () => {
  const categories = Array.from(new Set(skills.map((s) => s.category))).sort((a, b) => {
    const aIndex = skillCategoryOrder.indexOf(a);
    const bIndex = skillCategoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  getSkillCategoryPickers().forEach((picker) => {
    const categoryGrid = picker.querySelector('[data-role="skill-category-buttons"]');
    if (!(categoryGrid instanceof HTMLElement)) {
      return;
    }
    categoryGrid.innerHTML = "";
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "skill-category-button";
      button.dataset.role = "skill-category-button";
      button.dataset.category = category;
      const emoji = skillCategoryEmojis[category] || "✨";
      const cost = getSkillCost(category);
      const costText = formatCostAsFraction(cost);
      // Count only available skills (not already purchased, and respecting dependencies)
      const availableSkills = skills.filter((s) => {
        if (s.category !== category) return false;
        // Don't count skills that are already purchased
        const hasRank = (skillRanks.get(s.name) || 0) > 0 || purchasedSkills.has(s.name);
        return !hasRank;
      });
      const skillCount = availableSkills.length;
      button.innerHTML = `<span class="skill-emoji">${emoji}</span><span>${category}</span><span class="skill-cost">(${costText} Pts) - ${skillCount} skill${skillCount !== 1 ? 's' : ''}</span>`;
      categoryGrid.appendChild(button);
    });
  });
};

const populateSkillList = (category) => {
  getSkillListPickers().forEach((picker) => {
    const skillList = picker.querySelector('[data-role="skill-list"]');
    if (!(skillList instanceof HTMLElement)) {
      return;
    }
    picker.dataset.selectedCategory = category;
    const filteredSkills = skills.filter((s) => {
      if (s.category !== category) return false;
      return true;
    });
    skillList.innerHTML = "";
    filteredSkills.forEach((skill) => {
      // Get current rank and modifier for this skill
      const rank = skillRanks.get(skill.name) || 0;
      const backgroundMod = backgroundSkillModifiers.get(skill.name)?.modifier || 0;
      
      // Get feature-based modifiers
      let featureMod = 0;
      const ownedFeatures = getAllOwnedFeatures();
      ownedFeatures.forEach((featureId) => {
        const featureDef = featuresMap.get(featureId);
        if (featureDef && featureDef.skillBonuses && featureDef.skillBonuses[skill.name]) {
          featureMod += featureDef.skillBonuses[skill.name];
        }
      });
      
      const modifier = backgroundMod + featureMod;
      const rankModText = `${rank}/${modifier > 0 ? "+" : ""}${modifier}`;
      
      const button = document.createElement("button");
      button.type = "button";
      button.className = "skill-picker-item";
      button.dataset.role = "skill-item-picker";
      button.dataset.skill = skill.name;
      button.style.cursor = "pointer";
      
      // Calculate if can add/increase
      const increaseStatus = canIncreaseSkill(skill.name, rank);
      const canIncrease = increaseStatus.allowed;
      const canDecrease = rank > 0;
      const tooltipText = skill.description || "";
      const actionText = canIncrease ? `Left click: Add/increase (cost: ${increaseStatus.cost} pts)` : increaseStatus.reason;
      const decreaseText = canDecrease ? `Right click: Decrease rank` : "";
      const tooltipLines = tooltipText ? [tooltipText] : [];
      if (actionText) tooltipLines.push(actionText);
      if (decreaseText) tooltipLines.push(decreaseText);
      button.title = tooltipLines.join("\n\n");
      
      // Color based on rank (0 = grey, 1+ = color scale)
      let skillColor;
      if (rank === 0) {
        skillColor = "#9d9d9d"; // grey
      } else {
        skillColor = getSkillColor(rank);
      }
      button.style.borderColor = skillColor;
      button.style.color = skillColor;
      
      button.innerHTML = `
        <div class="skill-picker-item-title">
          <span class="skill-emoji">${skill.emoji || "✨"}</span>
          <span>${skill.name}</span>
          <span style="margin-left: auto; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">${rankModText}</span>
        </div>
        <div class="skill-picker-item-desc">${skill.description || ""}</div>
      `;
      skillList.appendChild(button);
    });
  });
};

const renderSkills = () => {
  const lists = getSkillsLists();
  if (lists.length === 0) return;
  lists.forEach((list) => {
    list.innerHTML = "";
  });

  // Ensure features are rendered first so we know if psionics are allowed
  renderFeatures();

  const combined = new Map();
  backgroundSkillModifiers.forEach((value, name) => {
    combined.set(name, {
      name,
      modifier: value.modifier,
      category: value.category,
      rank: 0,
      emoji: "",
    });
  });
  
  // Add feature-based skill modifiers
  const ownedFeatures = getAllOwnedFeatures();
  ownedFeatures.forEach((featureId) => {
    const featureDef = featuresMap.get(featureId);
    if (featureDef && featureDef.skillBonuses) {
      Object.entries(featureDef.skillBonuses).forEach(([skillName, bonus]) => {
        const existing = combined.get(skillName) || { name: skillName, modifier: 0, category: "", rank: 0, emoji: "" };
        existing.modifier = (existing.modifier || 0) + bonus;
        combined.set(skillName, existing);
      });
    }
  });
  
  skillRanks.forEach((rank, name) => {
    const existing = combined.get(name) || { name, modifier: 0, category: "", rank: 0, emoji: "" };
    combined.set(name, { ...existing, rank });
  });

  const listItems = Array.from(combined.values()).filter((skill) => {
    const isPurchased = purchasedSkills.has(skill.name);
    if (skill.modifier === 0 && skill.rank <= 0 && !isPurchased) return false;
    return true;
  });

  // Group skills by category
  const skillsByCategory = new Map();
  listItems.forEach((skill) => {
    const skillInfo = skills.find((s) => s.name === skill.name);
    const category = skillInfo?.category || skill.category || "Skill";
    if (!skillsByCategory.has(category)) {
      skillsByCategory.set(category, []);
    }
    skillsByCategory.get(category).push(skill);
  });

  // Sort skills within each category
  skillsByCategory.forEach((categorySkills) => {
    categorySkills.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Get all categories that exist in skills but aren't in the order list
  const extraCategories = Array.from(skillsByCategory.keys()).filter(
    (cat) => !skillCategoryOrder.includes(cat)
  ).sort((a, b) => a.localeCompare(b));

  // Render all categories in order, even if they have no skills
  skillCategoryOrder.forEach((category) => {
    const categorySkills = skillsByCategory.get(category) || [];
    const categoryEmoji = skillCategoryEmojis[category] || "✨";

    lists.forEach((list, index) => {
      // Only show category badges in edit mode, not in sheet mode
      const isSheetView = index === 0 || activePanelKey() === "sheet";
      if (!isSheetView) {
        // Add category badge (always show, even if no skills)
        const categoryBadge = document.createElement("div");
        categoryBadge.className = "skill-category-badge";
        categoryBadge.title = category;
        categoryBadge.dataset.role = "skill-category-badge";
        categoryBadge.dataset.category = category;
        categoryBadge.style.cursor = "pointer";
        categoryBadge.innerHTML = `
          <span class="skill-category-emoji">${categoryEmoji}</span>
        `;
        list.appendChild(categoryBadge);
      }
    });

    // Only render skills if there are any in this category
    categorySkills.forEach((skill) => {
      const skillInfo = skills.find((s) => s.name === skill.name);
      const emoji = skillInfo?.emoji || "";
      const category = skillInfo?.category || skill.category || "Skill";
      const description = skillInfo?.description || "";
      const rank = skill.rank || 0;
      const modifier = skill.modifier || 0;
      const rankModText = `${rank}/${modifier > 0 ? "+" : ""}${modifier}`;
      const increaseStatus = canIncreaseSkill(skill.name, skill.rank);
      const canIncrease = increaseStatus.allowed;
      const canDecrease = skill.rank > 0;
      const increaseTitle = canIncrease ? `Cost to increase: ${increaseStatus.cost}` : increaseStatus.reason;
      const decreaseTitle = canDecrease ? "Decrease rank" : "No rank to remove";

      lists.forEach((list, index) => {
        const badge = document.createElement("div");
        badge.className = "skill-badge";
        const isSheetView = index === 0 || activePanelKey() === "sheet";
        const rank = skill.rank || 0;
        const modifier = skill.modifier || 0;

        // Get the base stat for this skill (BODY or MIND)
        const baseStatName = getSkillBaseStat(skill.name);
        let baseStatValue = 0;
        if (baseStatName) {
          baseStatValue = getStatInitial(baseStatName);
        }

        // Total = base stat + modifier + ranks
        const total = baseStatValue + modifier + rank;

        // Build tooltip with description and calculation
        const calcParts = [];
        if (baseStatName) calcParts.push(`${baseStatName} ${baseStatValue}`);
        if (modifier !== 0) {
          const modSign = modifier > 0 ? "+" : "";
          calcParts.push(`Modifier ${modSign}${modifier}`);
        }
        if (rank > 0) calcParts.push(`Rank ${rank}`);
        const calcText =
          calcParts.length > 0
            ? `\n\nCalculation: ${calcParts.join(" + ")} = ${total}`
            : `\n\nTotal: ${total}`;
        const safeDescription = description ? description.replace(/`/g, "'") : "";
        const tooltipText = safeDescription
          ? `${safeDescription}${calcText}`
          : `${category} Skill${calcText}`;

        if (isSheetView) {
          badge.innerHTML = `
          <span class="stat-emoji">${emoji}</span>
          <span class="stat-name">${skill.name}</span>
          <span class="skill-badge-total">${total}</span>
        `;
        } else {
          // Add data attributes to badge for click handling
          badge.dataset.role = "skill-badge";
          badge.dataset.skill = skill.name;
          badge.style.cursor = "pointer";
          badge.title = tooltipText + (canIncrease ? `\n\nLeft click: ${increaseTitle}` : "") + (canDecrease ? `\n\nRight click: ${decreaseTitle}` : "");

          badge.innerHTML = `
          <span class="stat-emoji">${emoji}</span>
          <span class="stat-name">${skill.name}</span>
          <span class="skill-badge-rank-mod">${rankModText}</span>
        `;
        }

        // Color based on total in SHEET view (starting at 7 = white), ranks only in EDIT view
        let colorValue;
        let color;
        if (isSheetView) {
          // In SHEET view, 6 and below = grey, 7 = white, 8 = green, etc.
          if (total <= 6) {
            color = "#9d9d9d"; // grey
          } else {
            colorValue = total - 6;
            color = getSkillColor(colorValue);
          }
        } else {
          // In EDIT view, use ranks directly (1 = white, 2 = green, etc.)
          colorValue = rank;
          color = getSkillColor(colorValue);
        }
        if (color) {
          badge.style.borderColor = color;
          badge.style.color = color;
        }
        badge.title = tooltipText;
        list.appendChild(badge);
      });
    });
  });

  // Render any extra categories that aren't in the order list
  extraCategories.forEach((category) => {
    const categorySkills = skillsByCategory.get(category) || [];
    const categoryEmoji = skillCategoryEmojis[category] || "✨";

    lists.forEach((list, index) => {
      // Only show category badges in edit mode, not in sheet mode
      const isSheetView = index === 0 || activePanelKey() === "sheet";
      if (!isSheetView) {
        // Add category badge
        const categoryBadge = document.createElement("div");
        categoryBadge.className = "skill-category-badge";
        categoryBadge.title = category;
        categoryBadge.dataset.role = "skill-category-badge";
        categoryBadge.dataset.category = category;
        categoryBadge.style.cursor = "pointer";
        categoryBadge.innerHTML = `
          <span class="skill-category-emoji">${categoryEmoji}</span>
        `;
        list.appendChild(categoryBadge);
      }
    });

    // Render skills in this category (same logic as above)
    categorySkills.forEach((skill) => {
      const skillInfo = skills.find((s) => s.name === skill.name);
      const emoji = skillInfo?.emoji || "";
      const category = skillInfo?.category || skill.category || "Skill";
      const description = skillInfo?.description || "";
      const rank = skill.rank || 0;
      const modifier = skill.modifier || 0;
      const rankModText = `${rank}/${modifier > 0 ? "+" : ""}${modifier}`;
      const increaseStatus = canIncreaseSkill(skill.name, skill.rank);
      const canIncrease = increaseStatus.allowed;
      const canDecrease = skill.rank > 0;
      const increaseTitle = canIncrease ? `Cost to increase: ${increaseStatus.cost}` : increaseStatus.reason;
      const decreaseTitle = canDecrease ? "Decrease rank" : "No rank to remove";

      lists.forEach((list, index) => {
        const badge = document.createElement("div");
        badge.className = "skill-badge";
        const isSheetView = index === 0 || activePanelKey() === "sheet";
        const rank = skill.rank || 0;
        const modifier = skill.modifier || 0;

        // Get the base stat for this skill (BODY or MIND)
        const baseStatName = getSkillBaseStat(skill.name);
        let baseStatValue = 0;
        if (baseStatName) {
          baseStatValue = getStatInitial(baseStatName);
        }

        // Total = base stat + modifier + ranks
        const total = baseStatValue + modifier + rank;

        // Build tooltip with description and calculation
        const calcParts = [];
        if (baseStatName) calcParts.push(`${baseStatName} ${baseStatValue}`);
        if (modifier !== 0) {
          const modSign = modifier > 0 ? "+" : "";
          calcParts.push(`Modifier ${modSign}${modifier}`);
        }
        if (rank > 0) calcParts.push(`Rank ${rank}`);
        const calcText =
          calcParts.length > 0
            ? `\n\nCalculation: ${calcParts.join(" + ")} = ${total}`
            : `\n\nTotal: ${total}`;
        const safeDescription = description ? description.replace(/`/g, "'") : "";
        const tooltipText = safeDescription
          ? `${safeDescription}${calcText}`
          : `${category} Skill${calcText}`;

        if (isSheetView) {
          badge.innerHTML = `
            <span class="stat-emoji">${emoji}</span>
            <span class="stat-name">${skill.name}</span>
            <span class="stat-value">${total}</span>
          `;
          // Color based on total (7 = white, 8 = green, etc.)
          const color = getSkillColor(total, true);
          if (color) {
            badge.style.borderColor = color;
            badge.style.color = color;
          }
        } else { // EDIT view
          badge.dataset.role = "skill-badge";
          badge.dataset.skill = skill.name;
          badge.style.cursor = "pointer";
          badge.title = tooltipText + (canIncrease ? `\n\nLeft click: ${increaseTitle}` : "") + (canDecrease ? `\n\nRight click: ${decreaseTitle}` : "");

          badge.innerHTML = `
            <span class="stat-emoji">${emoji}</span>
            <span class="stat-name">${skill.name}</span>
            <span class="skill-badge-rank-mod">${rankModText}</span>
          `;
          // Color based on rank in edit view
          const color = getSkillColor(rank, false);
          if (color) {
            badge.style.borderColor = color;
            badge.style.color = color;
          }
        }
        badge.title = tooltipText;
        list.appendChild(badge);
      });
    });
  });
};

const formatFeatureName = (featureId) => {
  if (!featureId) return "";
  return featureId
    .replace(/[\/_]+/g, " ")
    .replace(/[-]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
};

const normalizeFeatureKey = (value) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[\/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getFeatureGroup = (featureId) => {
  if (!featureId) return null;
  const groupPrefixes = [
    "skin-color",
    "blood",
    "brain",
    "ears",
    "hands",
    "nose",
    "jaw",
    "skull",
    "hair",
    "vision",
    "light",
    "sunlight",
    "scaly-skin",
    "tail",
    "antennae",
    "arms",
    "legs",
    "feet",
    "extra-arm",
    "appearance",
  ];
  const normalized = featureId.toLowerCase();
  const match = groupPrefixes.find((prefix) => normalized.startsWith(prefix));
  return match || null;
};

const getFeatureColor = (cost, grade, featureDef) => {
  if (!featureDef) {
    // Fallback if no feature definition
    if (cost === 0) return "#ffffff";
    if (cost < 0) return gradeColors.Poor;
    if (cost <= 2) return gradeColors.Poor;
    if (cost <= 4) return gradeColors.Uncommon;
    if (cost <= 6) return gradeColors.Rare;
    if (cost <= 8) return gradeColors.Epic;
    if (cost <= 10) return gradeColors.Legendary;
    return gradeColors.Mythic;
  }

  // Specific feature color overrides
  const featureId = featureDef.id;
  
  // Blind and nearsighted eyes are always grey
  if (featureId === 'eye-left-blind' || featureId === 'eye-right-blind' || featureId === 'eye-left-nearsighted' || featureId === 'eye-right-nearsighted') {
    return gradeColors.Poor; // Grey
  }
  
  // Humanoid features that should be white
  if (featureId === 'ear-left-humanoid' || featureId === 'nose-humanoid' || featureId === 'teeth-humanoid' || featureId === 'skull-humanoid' ||
      featureId === 'arm-left-humanoid' || featureId === 'arm-right-humanoid' ||
      featureId === 'leg-left-humanoid' || featureId === 'leg-right-humanoid' ||
      featureId === 'hand-left-humanoid' || featureId === 'hand-right-humanoid' ||
      featureId === 'foot-left-humanoid' || featureId === 'foot-right-humanoid') {
    return "#ffffff"; // White
  }
  
  // Universal translator should be green
  if (featureId === 'ear-right-universal-translator') {
    return gradeColors.Uncommon; // Green
  }
  
  // Andorian antennae should be green
  if (featureId === 'antennae-andorian-left' || featureId === 'antennae-andorian-right') {
    return gradeColors.Uncommon; // Green
  }

  // Andorian brain should be white
  if (featureId === 'brain-andorian') {
    return "#ffffff"; // White
  }
  
  // Humanoid right ear should be grey (if it exists)
  if (featureId === 'ear-right-humanoid') {
    return gradeColors.Poor; // Grey
  }
  
  // If feature has a grade specified, use that grade's color
  if (grade && gradeColors[grade]) {
    return gradeColors[grade];
  }
  
  // Default cost-based coloring
  if (cost === 0) return "#ffffff"; // White for 0 cost
  if (cost < 0) return gradeColors.Poor; // Grey for negative costs (drawbacks)
  // Map positive costs to grade colors
  // 1-2 = Poor, 3-4 = Uncommon, 5-6 = Rare, 7-8 = Epic, 9-10 = Legendary, 11+ = Mythic
  if (cost <= 2) return gradeColors.Poor;
  if (cost <= 4) return gradeColors.Uncommon;
  if (cost <= 6) return gradeColors.Rare;
  if (cost <= 8) return gradeColors.Epic;
  if (cost <= 10) return gradeColors.Legendary;
  return gradeColors.Mythic;
};

const getFeatureEmoji = (featureId, featureName) => {
  const normalized = (featureId || featureName || "").toLowerCase();
  if (normalized.includes("blood")) return "🩸";
  if (normalized.includes("brain")) return "🧠";
  if (normalized.includes("ears")) return "👂";
  if (normalized.includes("hands")) return "✋";
  if (normalized.includes("nose")) return "👃";
  if (normalized.includes("jaw")) return "🦷";
  if (normalized.includes("skull")) return "💀";
  if (normalized.includes("skin color") || normalized.includes("skin-color")) return "🎨";
  if (normalized.includes("hair")) return "💇";
  if (normalized.includes("vision")) return "👁️";
  if (normalized.includes("sunlight")) return "☀️";
  if (normalized.includes("light")) return "💡";
  if (normalized.includes("scaly")) return "🦎";
  if (normalized.includes("tail")) return "🦊";
  if (normalized.includes("antennae")) return "🪲";
  if (normalized.includes("extra arm")) return "🦾";
  if (normalized.includes("arm") || normalized.includes("strong")) return "💪";
  if (normalized.includes("leg")) return "🦵";
  if (normalized.includes("paw")) return "🐾";
  if (normalized.includes("trotter") || normalized.includes("pig")) return "🐷";
  if (normalized.includes("bat")) return "🦇";
  if (normalized.includes("ugly")) return "😬";
  if (normalized.includes("secret identity")) return "🕵️";
  if (normalized.includes("psionic") || normalized.includes("psionics")) return "🔮";
  return "✨";
};

const renderFeatures = () => {
  const lists = getFeaturesLists();
  if (lists.length === 0) return;
  lists.forEach((list) => {
    list.innerHTML = "";
  });

  // Combine background and purchased features
  const allFeatures = [];
  
  // Add background features
  if (backgroundFeatures && backgroundFeatures.length > 0) {
    backgroundFeatures.forEach((feature) => {
      allFeatures.push({ feature, isPurchased: false });
    });
  }
  
  // Add purchased features
  purchasedFeatures.forEach((featureId) => {
    allFeatures.push({ feature: featureId, isPurchased: true });
  });

  // Group features by skill category (matching skill categories)
  const featuresByCategory = new Map();
  allFeatures.forEach(({ feature, isPurchased }) => {
    const featureId = typeof feature === "string" ? feature : feature.id;
    const featureDef = featuresMap.get(featureId);
    // Use skill category if available, otherwise default to first skill category
    const category = featureDef?.category || skillCategoryOrder[0];
    if (!featuresByCategory.has(category)) {
      featuresByCategory.set(category, []);
    }
    featuresByCategory.get(category).push({ feature, isPurchased });
  });

  // Sort features within each category
  featuresByCategory.forEach((categoryFeatures) => {
    categoryFeatures.sort((a, b) => {
      const aId = typeof a.feature === "string" ? a.feature : a.feature.id;
      const bId = typeof b.feature === "string" ? b.feature : b.feature.id;
      const aDef = featuresMap.get(aId);
      const bDef = featuresMap.get(bId);
      const aName = aDef?.name || aId;
      const bName = bDef?.name || bId;
      return aName.localeCompare(bName);
    });
  });

  // Get all categories that exist in features but aren't in the order list
  const extraCategories = Array.from(featuresByCategory.keys()).filter(
    (cat) => !skillCategoryOrder.includes(cat)
  ).sort((a, b) => a.localeCompare(b));

  // Render all skill categories in order, even if they have no features
  skillCategoryOrder.forEach((category) => {
    const categoryFeatures = featuresByCategory.get(category) || [];
    const categoryEmoji = skillCategoryEmojis[category] || "✨";

    lists.forEach((list, index) => {
      // Only show category badges in edit mode, not in sheet mode
      const isSheetView = index === 0 || activePanelKey() === "sheet";
      if (!isSheetView) {
        // Add category badge (always show, even if no features) - clickable to add features
        const categoryBadge = document.createElement("div");
        categoryBadge.className = "skill-category-badge";
        categoryBadge.title = category;
        categoryBadge.dataset.role = "feature-category-badge";
        categoryBadge.dataset.category = category;
        categoryBadge.style.cursor = "pointer";
        categoryBadge.innerHTML = `
          <span class="skill-category-emoji">${categoryEmoji}</span>
        `;
        list.appendChild(categoryBadge);
      }

      // Add features in this category
      categoryFeatures.forEach(({ feature, isPurchased }) => {
        const featureId = typeof feature === "string" ? feature : feature.id;
        // Look up feature definition from featuresMap
        const featureDef = featuresMap.get(featureId);
        
        // Use feature definition if available, otherwise fall back to formatting
        const featureName = featureDef?.name || (
          typeof feature === "string"
            ? formatFeatureName(feature)
            : feature.name || formatFeatureName(featureId)
        );
        const emoji = featureDef?.emoji || getFeatureEmoji(featureId, featureName);
        const description = featureDef?.description || "";
        const cost = featureDef?.cost ?? 0;
        const grade = featureDef?.grade || null;
        const featureColor = getFeatureColor(cost, grade, featureDef);
        const tooltipLines = [isPurchased ? "Purchased feature" : "Background feature"];
        const normalizedId = normalizeFeatureKey(featureId);
        const normalizedName = normalizeFeatureKey(featureName);
        if (description) {
          tooltipLines.push(description);
        }
        
        // Check if feature has a selection (e.g., Hunter enemy type)
        const selection = featureSelections.get(featureId);
        let displayName = featureName || featureId;
        if (selection) {
          displayName += ` (${selection})`;
          tooltipLines.push(`Selected: ${selection}`);
        }
        
        const tooltipText = tooltipLines.join("\n");

        const badge = document.createElement("div");
        badge.className = "feature-badge";
        badge.title = tooltipText;
        badge.style.borderColor = featureColor;
        badge.style.color = featureColor;
        
        // Add trash button for purchased features
        const removeButton = isPurchased ? '<button type="button" class="feature-remove" data-role="feature-remove" data-feature="' + featureId.replace(/"/g, '&quot;') + '" title="Remove feature">🗑️</button>' : '';
        
        badge.innerHTML = `
          <span class="feature-emoji">${emoji}</span>
          <span class="feature-name">${displayName}</span>
          ${removeButton}
        `;
        list.appendChild(badge);
      });
    });
  });

  // Render any extra categories that aren't in the order list
  extraCategories.forEach((category) => {
    const categoryFeatures = featuresByCategory.get(category) || [];
    const categoryEmoji = skillCategoryEmojis[category] || "✨";

    lists.forEach((list, index) => {
      // Only show category badges in edit mode, not in sheet mode
      const isSheetView = index === 0 || activePanelKey() === "sheet";
      if (!isSheetView) {
        // Add category badge
        const categoryBadge = document.createElement("div");
        categoryBadge.className = "skill-category-badge";
        categoryBadge.title = category;
        categoryBadge.dataset.role = "feature-category-badge";
        categoryBadge.dataset.category = category;
        categoryBadge.style.cursor = "pointer";
        categoryBadge.innerHTML = `
          <span class="skill-category-emoji">${categoryEmoji}</span>
        `;
        list.appendChild(categoryBadge);
      }

      // Render features in this category (same logic as above)
      categoryFeatures.forEach(({ feature, isPurchased }) => {
        const featureId = typeof feature === "string" ? feature : feature.id;
        // Look up feature definition from featuresMap
        const featureDef = featuresMap.get(featureId);
        
        // Use feature definition if available, otherwise fall back to formatting
        const featureName = featureDef?.name || (
          typeof feature === "string"
            ? formatFeatureName(feature)
            : feature.name || formatFeatureName(featureId)
        );
        const emoji = featureDef?.emoji || getFeatureEmoji(featureId, featureName);
        const description = featureDef?.description || "";
        const cost = featureDef?.cost ?? 0;
        const grade = featureDef?.grade || null;
        const featureColor = getFeatureColor(cost, grade, featureDef);
        const tooltipLines = [isPurchased ? "Purchased feature" : "Background feature"];
        const normalizedId = normalizeFeatureKey(featureId);
        const normalizedName = normalizeFeatureKey(featureName);
        if (description) {
          tooltipLines.push(description);
        }
        
        // Check if feature has a selection (e.g., Hunter enemy type)
        const selection = featureSelections.get(featureId);
        let displayName = featureName || featureId;
        if (selection) {
          displayName += ` (${selection})`;
          tooltipLines.push(`Selected: ${selection}`);
        }
        
        const tooltipText = tooltipLines.join("\n");

        const badge = document.createElement("div");
        badge.className = "feature-badge";
        badge.title = tooltipText;
        badge.style.borderColor = featureColor;
        badge.style.color = featureColor;
        
        // Add trash button for purchased features
        const removeButton = isPurchased ? '<button type="button" class="feature-remove" data-role="feature-remove" data-feature="' + featureId.replace(/"/g, '&quot;') + '" title="Remove feature">🗑️</button>' : '';
        
        badge.innerHTML = `
          <span class="feature-emoji">${emoji}</span>
          <span class="feature-name">${displayName}</span>
          ${removeButton}
        `;
        list.appendChild(badge);
      });
    });
  });
};

const setActiveTab = (tabId) => {
  if (!panel) return;
  panel.dataset.activeTab = tabId;
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabId);
  });
  tabPanels.forEach((panelEl) => {
    panelEl.classList.toggle("is-active", panelEl.dataset.tabPanel === tabId);
  });
  updateTabInteractivity();
  refreshStatBadgeColors();
  renderSkills();
  renderFeatures();
};

// Tab button and NEW button listeners will be set up in window load event

const syncSelectValues = (role, value) => {
  const selects = role === "grade" ? getGradeSelects() : getBackgroundSelects();
  selects.forEach((select) => {
    if (select.value !== value) {
      select.value = value;
    }
  });
  if (role === "grade") {
    applyGradeStyles();
    refreshStatBadgeColors();
    updateStatPointsBadges();
    updateAdjusterStates();
    updateSkillPointsBadge();
    updateFeaturePointsBadge();
    populateFeatureCategoryPicker();
  }
  schedulePersist();
};

const applyGradeStyles = () => {
  const currentGrade = getGradeSelects()[0]?.value;
  const color = currentGrade ? gradeColors[currentGrade] : null;
  getGradeSelects().forEach((select) => {
    if (color) {
      select.style.color = color;
      select.style.borderColor = color;
      select.style.boxShadow = `0 0 0 1px ${color}33`;
    } else {
      select.style.color = "";
      select.style.borderColor = "";
      select.style.boxShadow = "";
    }
  });
};

const attachBackgroundListeners = () => {
  getBackgroundSelects().forEach((select) => {
    select.addEventListener("change", () => {
      if (select.disabled) return;
      syncSelectValues("background", select.value);
      updateStatsForBackground(select.value);
    });
  });
};

const attachGradeListeners = () => {
  getGradeSelects().forEach((select) => {
    select.addEventListener("change", () => {
      if (select.disabled) return;
      syncSelectValues("grade", select.value);
    });
  });
};

const mirrorTabPanels = () => {
  const sheetPanel = document.querySelector('[data-tab-panel="sheet"]');
  if (!sheetPanel) return;
  tabPanels.forEach((panelEl) => {
    if (panelEl.dataset.tabPanel !== "sheet") {
      panelEl.innerHTML = sheetPanel.innerHTML;
    }
  });
  populateSkillPickers();
  renderSkills();
};

const resetCharacter = () => {
  purchasedSkills.clear();
  skillRanks.clear();
  purchasedFeatures.clear();
  featureSelections.clear();
  if (defaultGradeValue) {
    syncSelectValues("grade", defaultGradeValue);
  }
  if (defaultBackgroundValue) {
    syncSelectValues("background", defaultBackgroundValue);
  }
  updateStatsForBackground(
    getBackgroundSelects()[0]?.value || defaultBackgroundValue
  );
  renderSkills();
  updateSkillPointsBadge();
  updateFeaturePointsBadge();
  schedulePersist();
};

const buildCharacterData = () => {
  const gradeSelect = getGradeSelects()[0];
  const backgroundSelect = getBackgroundSelects()[0];

  return {
    version: 1,
    grade: gradeSelect?.value || defaultGradeValue,
    background: backgroundSelect?.value || defaultBackgroundValue,
    baseCharacteristics: { ...baseCharacteristics },
    currentStatModifiers: { ...currentStatModifiers },
    skillRanks: Array.from(skillRanks.entries()),
    purchasedSkills: Array.from(purchasedSkills),
    purchasedFeatures: Array.from(purchasedFeatures),
    featureSelections: Array.from(featureSelections.entries()),
    statState: Array.from(statState.entries()),
    currentBackgroundName,
  };
};

const applyCharacterData = async (characterData) => {
  if (!characterData || typeof characterData !== "object") {
    throw new Error("Invalid character data.");
  }

  // Restore basic values
  if (characterData.grade) {
    syncSelectValues("grade", characterData.grade);
  }
  if (characterData.background) {
    syncSelectValues("background", characterData.background);
  }

  // Restore characteristics and modifiers
  if (characterData.baseCharacteristics) {
    Object.assign(baseCharacteristics, characterData.baseCharacteristics);
  }
  if (characterData.currentStatModifiers) {
    Object.assign(currentStatModifiers, characterData.currentStatModifiers);
  }

  // Restore Maps and Sets
  if (characterData.skillRanks) {
    skillRanks.clear();
    characterData.skillRanks.forEach(([key, value]) => {
      skillRanks.set(key, value);
    });
  }
  if (characterData.purchasedSkills) {
    purchasedSkills.clear();
    characterData.purchasedSkills.forEach((skill) => {
      purchasedSkills.add(skill);
    });
  }
  if (characterData.purchasedFeatures) {
      purchasedFeatures.clear();
      characterData.purchasedFeatures.forEach((feature) => {
        purchasedFeatures.add(feature);
      });
    }
  if (characterData.featureSelections) {
    featureSelections.clear();
    characterData.featureSelections.forEach(([key, value]) => {
      featureSelections.set(key, value);
    });
  }
  if (characterData.statState) {
    statState.clear();
    characterData.statState.forEach(([key, value]) => {
      statState.set(key, value);
    });
  }

  if (characterData.currentBackgroundName) {
    currentBackgroundName = characterData.currentBackgroundName;
  }

  // Update UI
  await updateStatsForBackground(
    getBackgroundSelects()[0]?.value || defaultBackgroundValue
  );
  renderSkills();
  updateSkillPointsBadge();
  updateFeaturePointsBadge();
};

const saveCharacter = async () => {
  try {
    const characterData = buildCharacterData();
    const json = JSON.stringify(characterData, null, 2);
    const suggestedName = `aff-star-trek-${characterData.background || "character"}.json`;

    let saved = false;
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: [
            {
              description: "JSON",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        saved = true;
      } catch (error) {
        if (error?.name === "AbortError") return;
        if (error?.name !== "SecurityError") {
          throw error;
        }
      }
    }

    if (!saved) {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = suggestedName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    // Show brief feedback
    const saveBtn = document.querySelector('[data-action="save"]');
    if (saveBtn) {
      const originalTitle = saveBtn.title;
      saveBtn.title = "SAVED!";
      setTimeout(() => {
        saveBtn.title = originalTitle;
      }, 1000);
    }
  } catch (error) {
    if (error?.name === "AbortError") return;
    console.error("Error saving character:", error);
    alert("Failed to save character: " + error.message);
  }
};

const loadCharacter = async () => {
  try {
    let file = null;
    if (window.showOpenFilePicker) {
      try {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: "JSON",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        file = await handle.getFile();
      } catch (error) {
        if (error?.name === "AbortError") return;
        if (error?.name !== "SecurityError") {
          throw error;
        }
      }
    } else {
      file = await new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json,.json";
        input.addEventListener(
          "change",
          () => {
            resolve(input.files?.[0] || null);
          },
          { once: true }
        );
        input.click();
      });
    }

    if (!file) {
      file = await new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json,.json";
        input.addEventListener(
          "change",
          () => {
            resolve(input.files?.[0] || null);
          },
          { once: true }
        );
        input.click();
      });
    }

    if (!file) return;
    const text = await file.text();
    const characterData = JSON.parse(text);
    await applyCharacterData(characterData);
    schedulePersist();

    // Show brief feedback
    const loadBtn = document.querySelector('[data-action="load"]');
    if (loadBtn) {
      const originalTitle = loadBtn.title;
      loadBtn.title = "LOADED!";
      setTimeout(() => {
        loadBtn.title = originalTitle;
      }, 1000);
    }
  } catch (error) {
    if (error?.name === "AbortError") return;
    console.error("Error loading character:", error);
    alert("Failed to load character: " + error.message);
  }
};

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  
  // Don't interfere with tab button clicks
  if (target.closest(".tab-button")) return;
  
  // Handle click on feature category badge (in main view) or button (in picker)
  const featureCategoryBadge = target.closest('[data-role="feature-category-badge"]');
  if (featureCategoryBadge && activePanelKey() === "edit") {
    const category = featureCategoryBadge.dataset.category;
    if (category) {
      // Open the feature list picker directly for this category
      const section = featureCategoryBadge.closest(".features-section");
      const listPicker = section?.querySelector('[data-role="feature-list-picker"]');
      if (listPicker) {
        populateFeatureListPicker(category);
        listPicker.hidden = false;
      }
    }
    return;
  }
  const featureCategoryButton = target.closest('[data-role="feature-category-button"]');
  if (featureCategoryButton) {
    const picker = featureCategoryButton.closest('[data-role="feature-category-picker"]');
    const category = featureCategoryButton.dataset.category;
    if (picker && category) {
      picker.hidden = true;
      const listPicker = picker
        .closest(".features-section")
        ?.querySelector('[data-role="feature-list-picker"]');
      if (listPicker) {
        populateFeatureListPicker(category);
        listPicker.hidden = false;
      }
    }
    return;
  }
  const featureBack = target.closest('[data-role="feature-back"]');
  if (featureBack) {
    const picker = featureBack.closest('[data-role="feature-list-picker"]');
    if (picker) {
      picker.hidden = true;
      const categoryPicker = picker
        .closest(".features-section")
        ?.querySelector('[data-role="feature-category-picker"]');
      if (categoryPicker) {
        categoryPicker.hidden = false;
      }
    }
    return;
  }
  const featureCancel = target.closest('[data-role="feature-cancel"]');
  if (featureCancel) {
    const section = featureCancel.closest(".features-section");
    const categoryPicker = section?.querySelector('[data-role="feature-category-picker"]');
    const listPicker = section?.querySelector('[data-role="feature-list-picker"]');
    if (categoryPicker) categoryPicker.hidden = true;
    if (listPicker) listPicker.hidden = true;
    return;
  }
  const featureItem = target.closest('[data-role="feature-item"]');
  if (featureItem) {
    const featureId = featureItem.dataset.feature;
    if (featureId) {
      const featureDef = featuresMap.get(featureId);
      // Check if feature requires a selection
      if (featureDef?.requiresSelection) {
        // Show selection popup instead of purchasing directly
        const section = featureItem.closest(".features-section");
        const categoryPicker = section?.querySelector('[data-role="feature-category-picker"]');
        const listPicker = section?.querySelector('[data-role="feature-list-picker"]');
        if (categoryPicker) categoryPicker.hidden = true;
        if (listPicker) listPicker.hidden = true;
        showFeatureSelectionPopup(featureId);
      } else {
        purchaseFeature(featureId);
        const section = featureItem.closest(".features-section");
        const categoryPicker = section?.querySelector('[data-role="feature-category-picker"]');
        const listPicker = section?.querySelector('[data-role="feature-list-picker"]');
        if (categoryPicker) categoryPicker.hidden = true;
        if (listPicker) listPicker.hidden = true;
      }
    }
    return;
  }
  
  // Handle feature selection confirm
  const featureSelectionConfirm = target.closest('[data-role="feature-selection-confirm"]');
  if (featureSelectionConfirm) {
    const picker = featureSelectionConfirm.closest('[data-role="feature-selection-picker"]');
    const featureId = picker?.dataset.featureId;
    if (featureId) {
      const select = picker.querySelector('[data-role="enemy-type-select"]');
      if (select && select.value) {
        purchaseFeature(featureId, select.value);
        closeFeatureSelectionPopup();
        // Also close the feature list picker
        const section = picker.closest(".features-section");
        const categoryPicker = section?.querySelector('[data-role="feature-category-picker"]');
        const listPicker = section?.querySelector('[data-role="feature-list-picker"]');
        if (categoryPicker) categoryPicker.hidden = true;
        if (listPicker) listPicker.hidden = true;
      }
    }
    return;
  }
  
  // Handle feature selection cancel
  const featureSelectionCancel = target.closest('[data-role="feature-selection-cancel"]');
  if (featureSelectionCancel) {
    closeFeatureSelectionPopup();
    return;
  }
  const featureRemove = target.closest('[data-role="feature-remove"]');
  if (featureRemove) {
    const featureId = featureRemove.dataset.feature;
    if (featureId) {
      removeFeature(featureId);
    }
    return;
  }
  // Handle click on skill category badge (in the skills list)
  const skillCategoryBadge = target.closest('[data-role="skill-category-badge"]');
  if (skillCategoryBadge) {
    const category = skillCategoryBadge.dataset.category;
    if (category) {
      const section = skillCategoryBadge.closest(".skills-section");
      const categoryPicker = section?.querySelector('[data-role="skill-category-picker"]');
      const listPicker = section?.querySelector('[data-role="skill-list-picker"]');
      
      // Open category picker first, then immediately open the list picker for this category
      if (categoryPicker && listPicker) {
        populateSkillList(category);
        categoryPicker.hidden = true;
        listPicker.hidden = false;
      }
    }
    return;
  }
  
  const skillCategoryButton = target.closest('[data-role="skill-category-button"]');
  if (skillCategoryButton) {
    const picker = skillCategoryButton.closest('[data-role="skill-category-picker"]');
    const category = skillCategoryButton.dataset.category;
    if (picker && category) {
      picker.hidden = true;
      const listPicker = picker
        .closest(".skills-section")
        ?.querySelector('[data-role="skill-list-picker"]');
      if (listPicker) {
        populateSkillList(category);
        listPicker.hidden = false;
      }
    }
    return;
  }
  const skillDone = target.closest('[data-role="skill-done"]');
  if (skillDone) {
    const section = skillDone.closest(".skills-section");
    const categoryPicker = section?.querySelector('[data-role="skill-category-picker"]');
    const listPicker = section?.querySelector('[data-role="skill-list-picker"]');
    if (categoryPicker) categoryPicker.hidden = true;
    if (listPicker) listPicker.hidden = true;
    return;
  }
  const skillCancel = target.closest('[data-role="skill-cancel"]');
  if (skillCancel) {
    const section = skillCancel.closest(".skills-section");
    const categoryPicker = section?.querySelector('[data-role="skill-category-picker"]');
    const listPicker = section?.querySelector('[data-role="skill-list-picker"]');
    if (categoryPicker) categoryPicker.hidden = true;
    if (listPicker) listPicker.hidden = true;
    return;
  }
  // Handle skill items in the picker (click to add/increase skill)
  const skillItemPicker = target.closest('[data-role="skill-item-picker"]');
  if (skillItemPicker) {
    const section = skillItemPicker.closest(".skills-section");
    const skillName = skillItemPicker.dataset.skill;
    if (skillName) {
      const existing = skillRanks.get(skillName) || 0;
      const increaseStatus = canIncreaseSkill(skillName, existing);
      if (increaseStatus.allowed) {
        skillRanks.set(skillName, existing + 1);
        purchasedSkills.add(skillName);
      }
      renderSkills();
      updateSkillPointsBadge();
      updateFeaturePointsBadge();
      populateSkillPickers();
      const listPicker = section?.querySelector('[data-role="skill-list-picker"]');
      if (listPicker && listPicker.dataset.selectedCategory) {
        // Keep picker open and refresh the list
        populateSkillList(listPicker.dataset.selectedCategory);
      }
      schedulePersist();
    }
    return;
  }
  
  const skillItem = target.closest('[data-role="skill-item"]');
  if (skillItem) {
    const section = skillItem.closest(".skills-section");
    const skillName = skillItem.dataset.skill;
    if (skillName) {
      const existing = skillRanks.get(skillName) || 0;
      const increaseStatus = canIncreaseSkill(skillName, existing);
      if (increaseStatus.allowed) {
        skillRanks.set(skillName, existing + 1);
        purchasedSkills.add(skillName);
      }
      renderSkills();
      updateSkillPointsBadge();
      updateFeaturePointsBadge();
      populateSkillPickers();
      const listPicker = section?.querySelector('[data-role="skill-list-picker"]');
      if (listPicker) {
        listPicker.hidden = true;
      }
      schedulePersist();
    }
    return;
  }
  // Handle left click on stat badge (increase) - BODY, MIND, LUCK only
  const statBadge = target.closest('[data-role="stat-badge-adjustable"]');
  if (statBadge && activePanelKey() === "edit") {
    const stat = statBadge.dataset.stat;
    if (!stat) return;
    const base = baseCharacteristics[stat] ?? 0;
    const currentInitial = getStatInitial(stat);
    const cost = statCostsByStat[stat] ?? 0;
    const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
    const totalPoints = statPointsByGrade[currentGrade] ?? 0;
    const spentPoints = getSpentPoints();
    const remaining = totalPoints - spentPoints;
    const gradeBonuses =
      gradeMaxBonusesByGrade[currentGrade] ||
      defaultGradeMaxBonuses[currentGrade] ||
      {};
    const bonusCap = gradeBonuses[stat] ?? gradeBonuses.MIND ?? 0;
    const maxValue = base + bonusCap;
    
    if (remaining < cost || currentInitial >= maxValue) return;
    
    setStatState(stat, currentInitial + 1);
    recomputeDerivedStats();
    updateStatPointsBadges();
    updateAdjusterStates();
    populateFeatureCategoryPicker();
    return;
  }
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  
  // Handle left click on skill badge (increase)
  const skillBadge = target.closest('[data-role="skill-badge"]');
  if (skillBadge && activePanelKey() === "edit") {
    const skillName = skillBadge.dataset.skill;
    if (!skillName) return;
    const currentRank = skillRanks.get(skillName) || 0;
    const increaseStatus = canIncreaseSkill(skillName, currentRank);
    if (!increaseStatus.allowed) return;
    skillRanks.set(skillName, currentRank + 1);
    purchasedSkills.add(skillName);
    renderSkills();
    updateSkillPointsBadge();
    updateFeaturePointsBadge();
    populateSkillPickers();
    schedulePersist();
    return;
  }
});

// Handle right click on stat badge (decrease) - BODY, MIND, LUCK only
document.addEventListener("contextmenu", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  
  const statBadge = target.closest('[data-role="stat-badge-adjustable"]');
  if (statBadge && activePanelKey() === "edit") {
    event.preventDefault(); // Prevent context menu
    const stat = statBadge.dataset.stat;
    if (!stat) return;
    const base = baseCharacteristics[stat] ?? 0;
    const currentInitial = getStatInitial(stat);
    
    if (currentInitial <= base) return;
    
    setStatState(stat, currentInitial - 1);
    recomputeDerivedStats();
    updateStatPointsBadges();
    updateAdjusterStates();
    populateFeatureCategoryPicker();
    return;
  }
  
  // Handle right click on skill badge (decrease)
  const skillBadge = target.closest('[data-role="skill-badge"]');
  if (skillBadge && activePanelKey() === "edit") {
    event.preventDefault(); // Prevent context menu
    const skillName = skillBadge.dataset.skill;
    if (!skillName) return;
    const currentRank = skillRanks.get(skillName) || 0;
    if (currentRank <= 0) return;
    
    const newRank = currentRank - 1;
    skillRanks.set(skillName, newRank);
    purchasedSkills.add(skillName);
    
    // If rank is now 0, check if we should delete the skill
    if (newRank === 0) {
      // Check background modifier
      const backgroundModifier = backgroundSkillModifiers.get(skillName)?.modifier || 0;
      
      // Check feature-based modifiers
      let featureModifier = 0;
      const ownedFeatures = getAllOwnedFeatures();
      ownedFeatures.forEach((featureId) => {
        const featureDef = featuresMap.get(featureId);
        if (featureDef && featureDef.skillBonuses && featureDef.skillBonuses[skillName]) {
          featureModifier += featureDef.skillBonuses[skillName];
        }
      });
      
      const totalModifier = backgroundModifier + featureModifier;
      // Delete if no rank and no modifier
      if (totalModifier === 0) {
        skillRanks.delete(skillName);
        purchasedSkills.delete(skillName);
      }
    }
    
    renderSkills();
    updateSkillPointsBadge();
    updateFeaturePointsBadge();
    populateSkillPickers();
    schedulePersist();
    return;
  }
  
  // Handle right click on skill item in picker (decrease rank)
  const skillItemPicker = target.closest('[data-role="skill-item-picker"]');
  if (skillItemPicker) {
    event.preventDefault(); // Prevent context menu
    const skillName = skillItemPicker.dataset.skill;
    if (!skillName) return;
    const currentRank = skillRanks.get(skillName) || 0;
    if (currentRank <= 0) return;
    
    const newRank = currentRank - 1;
    skillRanks.set(skillName, newRank);
    
    // If rank is now 0, check if we should delete the skill
    if (newRank === 0) {
      // Check background modifier
      const backgroundModifier = backgroundSkillModifiers.get(skillName)?.modifier || 0;
      
      // Check feature-based modifiers
      let featureModifier = 0;
      const ownedFeatures = getAllOwnedFeatures();
      ownedFeatures.forEach((featureId) => {
        const featureDef = featuresMap.get(featureId);
        if (featureDef && featureDef.skillBonuses && featureDef.skillBonuses[skillName]) {
          featureModifier += featureDef.skillBonuses[skillName];
        }
      });
      
      const totalModifier = backgroundModifier + featureModifier;
      // Delete if no rank and no modifier
      if (totalModifier === 0) {
        skillRanks.delete(skillName);
        purchasedSkills.delete(skillName);
      } else {
        // Keep in purchasedSkills if it has a modifier
        purchasedSkills.delete(skillName);
      }
    } else {
      // Still has rank, keep in purchasedSkills
      purchasedSkills.add(skillName);
    }
    
    renderSkills();
    updateSkillPointsBadge();
    updateFeaturePointsBadge();
    populateSkillPickers();
    const picker = skillItemPicker.closest('[data-role="skill-list-picker"]');
    if (picker && picker.dataset.selectedCategory) {
      populateSkillList(picker.dataset.selectedCategory); // Refresh list to show updated ranks/colors
    }
    schedulePersist();
    return;
  }
  
});

