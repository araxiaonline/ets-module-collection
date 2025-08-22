import { Logger } from "./logger";

const logger = new Logger("MapZones");

// Base Game map difficulties
export enum MapDifficulties {
    NORMAL = 1,
    HEROIC = 2,
}

export enum MapTypes {
    DUNGEON = 1,
    RAID = 2,
}

export enum MapNames {
    // Classic WoW dungeons
    RAGEFIRE_CHASM = 'ragefire_chasm',
    WAILING_CAVERNS = 'wailing_caverns',
    DEADMINES = 'deadmines',
    SHADOWFANG_KEEP = 'shadowfang_keep',
    STOCKADE = 'stockade',
    BLACKFATHOM_DEEPS = 'blackfathom_deeps',
    GNOMEREGAN = 'gnomeregan',
    RAZORFEN_KRAUL = 'razorfen_kraul',
    SCARLET_MONASTERY = 'scarlet_monastery',
    SCHOLOMANCE = 'scholomance',
    SUNKEN_TEMPLE = 'sunken_temple',
    RAZORFEN_DOWNS = 'razorfen_downs',
    ULDAMAN = 'uldaman',
    STRATHOLME = 'stratholme',
    BLACKROCK_SPIRE_LOWER = 'blackrock_spire_lower',
    BLACKROCK_SPIRE_UPPER = 'blackrock_spire_upper',
    DIRE_MAUL = 'dire_maul',
    ZUL_FARRAK = 'zul_farrak',
    MARAUDON = 'maraudon',
    TEMPLE_ATAL_HAKKAR = 'temple_atal_hakkar',
    BLACKROCK_DEPTHS = 'blackrock_depths',

    // Classic WoW raids
    MOLTEN_CORE = 'molten_core',
    BLACKWING_LAIR = 'blackwing_lair',
    RUINS_OF_AHNQIRAJ = 'ruins_of_ahnqiraj',
    TEMPLE_OF_AHNQIRAJ = 'temple_of_ahnqiraj',
    ZUL_GURUB = 'zul_gurub',
    ONYXIAS_LAIR = 'onyxias_lair',
    EMERALD_DREAM = 'emerald_dream',

    // The Burning Crusade dungeons
    SHATTERED_HALLS = 'shattered_halls',
    BLOOD_FURNACE = 'blood_furnace',
    HELLFIRE_RAMPARTS = 'hellfire_ramparts',
    STEAMVAULTS = 'steamvaults',
    UNDERBOG = 'underbog',
    SLAVE_PENS = 'slave_pens',
    MANA_TOMBS = 'mana_tombs',
    AUCHENAI_CRYPTS = 'auchenai_crypts',
    SETHEKK_HALLS = 'sethekk_halls',
    SHADOW_LABYRINTH = 'shadow_labyrinth',
    OLD_HILLSBRAD = 'old_hillsbrad',
    BOTANICA = 'botanica',
    MECHANAR = 'mechanar',
    ARCATRAZ = 'arcatraz',
    MAGISTERS_TERRACE = 'magisters_terrace',
    BLACK_MORASS = 'black_morass',

    // The Burning Crusade raids
    KARAZHAN = 'karazhan',
    GRUULS_LAIR = 'gruuls_lair',
    MAGTHERIDONS_LAIR = 'magtheridons_lair',
    SERPENTSHRINE_CAVERN = 'serpentshrine_cavern',
    TEMPEST_KEEP = 'tempest_keep',
    MOUNT_HYJAL = 'mount_hyjal',
    BLACK_TEMPLE = 'black_temple',
    SUNWELL_PLATEAU = 'sunwell_plateau',
    ZUL_AMAN = 'zul_aman',

    // Wrath of the Lich King dungeons
    UTGARDE_KEEP = 'utgarde_keep',
    UTGARDE_PINNACLE = 'utgarde_pinnacle',
    AHNKAHET = 'ahnkahet',
    NEXUS = 'nexus',
    CULLING_STRATHOLME = 'culling_stratholme',
    DRAK_THARON = 'drak_tharon',
    AZJOL_NERUB = 'azjol_nerub',
    VIOLET_HOLD = 'violet_hold',
    GUNDRAK = 'gundrak',
    HALLS_OF_STONE = 'halls_of_stone',
    HALLS_OF_LIGHTNING = 'halls_of_lightning',
    OCULUS = 'oculus',
    TRIAL_OF_CHAMPION = 'trial_of_champion',
    FORGE_OF_SOULS = 'forge_of_souls',
    PIT_OF_SARON = 'pit_of_saron',
    HALLS_OF_REFLECTION = 'halls_of_reflection',

    // Wrath of the Lich King raids
    NAXXRAMAS = 'naxxramas',
    OBSIDIAN_SANCTUM = 'obsidian_sanctum',
    EYE_OF_ETERNITY = 'eye_of_eternity',
    ULDUAR = 'ulduar',
    TRIAL_OF_CRUSADER = 'trial_of_crusader',
    VAULT_OF_ARCHAVON = 'vault_of_archavon',
    ICECROWN_CITADEL = 'icecrown_citadel',
    RUBY_SANCTUM = 'ruby_sanctum'
}

export const MapIds: Record<MapNames, number> = {
    // Classic WoW dungeons
    [MapNames.RAGEFIRE_CHASM]: 389,
    [MapNames.WAILING_CAVERNS]: 43,
    [MapNames.DEADMINES]: 36,
    [MapNames.SHADOWFANG_KEEP]: 33,
    [MapNames.STOCKADE]: 34,
    [MapNames.BLACKFATHOM_DEEPS]: 48,
    [MapNames.GNOMEREGAN]: 90,
    [MapNames.RAZORFEN_KRAUL]: 47,
    [MapNames.SCARLET_MONASTERY]: 189,
    [MapNames.SCHOLOMANCE]: 289,
    [MapNames.SUNKEN_TEMPLE]: 109,
    [MapNames.RAZORFEN_DOWNS]: 129,
    [MapNames.ULDAMAN]: 70,
    [MapNames.STRATHOLME]: 329,
    [MapNames.BLACKROCK_SPIRE_LOWER]: 229,
    [MapNames.BLACKROCK_SPIRE_UPPER]: 230,
    [MapNames.DIRE_MAUL]: 429,
    [MapNames.ZUL_FARRAK]: 209,
    [MapNames.MARAUDON]: 349,
    [MapNames.TEMPLE_ATAL_HAKKAR]: 269,
    [MapNames.BLACKROCK_DEPTHS]: 230,

    // Classic WoW raids
    [MapNames.MOLTEN_CORE]: 409,
    [MapNames.BLACKWING_LAIR]: 469,
    [MapNames.RUINS_OF_AHNQIRAJ]: 509,
    [MapNames.TEMPLE_OF_AHNQIRAJ]: 531,
    [MapNames.ZUL_GURUB]: 309,
    [MapNames.ONYXIAS_LAIR]: 249,
    [MapNames.EMERALD_DREAM]: 169,

    // The Burning Crusade dungeons
    [MapNames.SHATTERED_HALLS]: 540,
    [MapNames.BLOOD_FURNACE]: 542,
    [MapNames.HELLFIRE_RAMPARTS]: 543,
    [MapNames.STEAMVAULTS]: 545,
    [MapNames.UNDERBOG]: 546,
    [MapNames.SLAVE_PENS]: 547,
    [MapNames.MANA_TOMBS]: 557,
    [MapNames.AUCHENAI_CRYPTS]: 558,
    [MapNames.SETHEKK_HALLS]: 556,
    [MapNames.SHADOW_LABYRINTH]: 555,
    [MapNames.OLD_HILLSBRAD]: 560,
    [MapNames.BOTANICA]: 553,
    [MapNames.MECHANAR]: 554,
    [MapNames.ARCATRAZ]: 552,
    [MapNames.MAGISTERS_TERRACE]: 585,
    [MapNames.BLACK_MORASS]: 269,

    // The Burning Crusade raids
    [MapNames.KARAZHAN]: 532,
    [MapNames.GRUULS_LAIR]: 565,
    [MapNames.MAGTHERIDONS_LAIR]: 544,
    [MapNames.SERPENTSHRINE_CAVERN]: 548,
    [MapNames.TEMPEST_KEEP]: 550,
    [MapNames.MOUNT_HYJAL]: 534,
    [MapNames.BLACK_TEMPLE]: 564,
    [MapNames.SUNWELL_PLATEAU]: 580,
    [MapNames.ZUL_AMAN]: 568,

    // Wrath of the Lich King dungeons
    [MapNames.UTGARDE_KEEP]: 574,
    [MapNames.UTGARDE_PINNACLE]: 575,
    [MapNames.AHNKAHET]: 619,
    [MapNames.NEXUS]: 576,
    [MapNames.CULLING_STRATHOLME]: 595,
    [MapNames.DRAK_THARON]: 600,
    [MapNames.AZJOL_NERUB]: 601,
    [MapNames.VIOLET_HOLD]: 608,
    [MapNames.GUNDRAK]: 604,
    [MapNames.HALLS_OF_STONE]: 599,
    [MapNames.HALLS_OF_LIGHTNING]: 602,
    [MapNames.OCULUS]: 578,
    [MapNames.TRIAL_OF_CHAMPION]: 650,
    [MapNames.FORGE_OF_SOULS]: 632,
    [MapNames.PIT_OF_SARON]: 658,
    [MapNames.HALLS_OF_REFLECTION]: 668,

    // Wrath of the Lich King raids
    [MapNames.NAXXRAMAS]: 533,
    [MapNames.OBSIDIAN_SANCTUM]: 615,
    [MapNames.EYE_OF_ETERNITY]: 616,
    [MapNames.ULDUAR]: 603,
    [MapNames.TRIAL_OF_CRUSADER]: 649,
    [MapNames.VAULT_OF_ARCHAVON]: 624,
    [MapNames.ICECROWN_CITADEL]: 631,
    [MapNames.RUBY_SANCTUM]: 724
};

export const DungeonLevels: Record<MapNames, number> = {
    // Classic WoW dungeons
    [MapNames.RAGEFIRE_CHASM]: 18,
    [MapNames.WAILING_CAVERNS]: 25,
    [MapNames.DEADMINES]: 23,
    [MapNames.SHADOWFANG_KEEP]: 30,
    [MapNames.STOCKADE]: 30,
    [MapNames.BLACKFATHOM_DEEPS]: 32,
    [MapNames.GNOMEREGAN]: 38,
    [MapNames.RAZORFEN_KRAUL]: 40,
    [MapNames.SCARLET_MONASTERY]: 45,
    [MapNames.SCHOLOMANCE]: 60,
    [MapNames.SUNKEN_TEMPLE]: 60,
    [MapNames.RAZORFEN_DOWNS]: 33,
    [MapNames.ULDAMAN]: 40,
    [MapNames.STRATHOLME]: 60,
    [MapNames.BLACKROCK_SPIRE_LOWER]: 60,
    [MapNames.BLACKROCK_SPIRE_UPPER]: 60,
    [MapNames.DIRE_MAUL]: 60,
    [MapNames.ZUL_FARRAK]: 50,
    [MapNames.MARAUDON]: 55,
    [MapNames.TEMPLE_ATAL_HAKKAR]: 57,
    [MapNames.BLACKROCK_DEPTHS]: 60,

    // Classic WoW raids
    [MapNames.MOLTEN_CORE]: 60,
    [MapNames.BLACKWING_LAIR]: 60,
    [MapNames.RUINS_OF_AHNQIRAJ]: 60,
    [MapNames.TEMPLE_OF_AHNQIRAJ]: 60,
    [MapNames.ZUL_GURUB]: 60,
    [MapNames.ONYXIAS_LAIR]: 60,
    [MapNames.EMERALD_DREAM]: 60,

    // The Burning Crusade dungeons
    [MapNames.SHATTERED_HALLS]: 70,
    [MapNames.BLOOD_FURNACE]: 65,
    [MapNames.HELLFIRE_RAMPARTS]: 62,
    [MapNames.STEAMVAULTS]: 64,
    [MapNames.UNDERBOG]: 65,
    [MapNames.SLAVE_PENS]: 64,
    [MapNames.MANA_TOMBS]: 66,
    [MapNames.AUCHENAI_CRYPTS]: 67,
    [MapNames.SETHEKK_HALLS]: 70,
    [MapNames.SHADOW_LABYRINTH]: 70,
    [MapNames.OLD_HILLSBRAD]: 68,
    [MapNames.BOTANICA]: 70,
    [MapNames.MECHANAR]: 70,
    [MapNames.ARCATRAZ]: 70,
    [MapNames.MAGISTERS_TERRACE]: 70,
    [MapNames.BLACK_MORASS]: 70,

    // The Burning Crusade raids
    [MapNames.KARAZHAN]: 70,
    [MapNames.GRUULS_LAIR]: 70,
    [MapNames.MAGTHERIDONS_LAIR]: 70,
    [MapNames.SERPENTSHRINE_CAVERN]: 70,
    [MapNames.TEMPEST_KEEP]: 70,
    [MapNames.MOUNT_HYJAL]: 70,
    [MapNames.BLACK_TEMPLE]: 70,
    [MapNames.SUNWELL_PLATEAU]: 70,
    [MapNames.ZUL_AMAN]: 70,

    // Wrath of the Lich King dungeons
    [MapNames.UTGARDE_KEEP]: 72,
    [MapNames.UTGARDE_PINNACLE]: 76,
    [MapNames.AHNKAHET]: 75,
    [MapNames.NEXUS]: 73,
    [MapNames.CULLING_STRATHOLME]: 80,
    [MapNames.DRAK_THARON]: 76,
    [MapNames.AZJOL_NERUB]: 75,
    [MapNames.VIOLET_HOLD]: 77,
    [MapNames.GUNDRAK]: 78,
    [MapNames.HALLS_OF_STONE]: 78,
    [MapNames.HALLS_OF_LIGHTNING]: 80,
    [MapNames.OCULUS]: 78,
    [MapNames.TRIAL_OF_CHAMPION]: 80,
    [MapNames.FORGE_OF_SOULS]: 80,
    [MapNames.PIT_OF_SARON]: 80,
    [MapNames.HALLS_OF_REFLECTION]: 80,

    // Wrath of the Lich King raids
    [MapNames.NAXXRAMAS]: 80,
    [MapNames.OBSIDIAN_SANCTUM]: 80,
    [MapNames.EYE_OF_ETERNITY]: 80,
    [MapNames.ULDUAR]: 80,
    [MapNames.TRIAL_OF_CRUSADER]: 80,
    [MapNames.VAULT_OF_ARCHAVON]: 80,
    [MapNames.ICECROWN_CITADEL]: 80,
    [MapNames.RUBY_SANCTUM]: 80
};

// Boss info
export type Boss = {
    entry: number;
    name: string;
    location: string;
    isFinalBoss?: boolean;
}

export const Bosses: Boss[] = [
    // Classic WoW dungeons
    { entry: 11520, name: "Taragaman the Hungerer", location: "Ragefire Chasm" },
    { entry: 3654, name: "Mutanus the Devourer", location: "Wailing Caverns", isFinalBoss: true },
    { entry: 639, name: "Edwin VanCleef", location: "The Deadmines", isFinalBoss: true },
    { entry: 4275, name: "Archmage Arugal", location: "Shadowfang Keep", isFinalBoss: true },
    { entry: 4829, name: "Aku'mai", location: "Blackfathom Deeps", isFinalBoss: true },
    { entry: 1716, name: "Bazil Thredd", location: "Stormwind Stockade", isFinalBoss: true },
    { entry: 7800, name: "Mekgineer Thermaplugg", location: "Gnomeregan", isFinalBoss: true },
    { entry: 4421, name: "Charlga Razorflank", location: "Razorfen Kraul", isFinalBoss: true },
    { entry: 4543, name: "Bloodmage Thalnos", location: "Scarlet Monastery Graveyard", isFinalBoss: true },
    { entry: 6487, name: "Arcanist Doan", location: "Scarlet Monastery Library", isFinalBoss: true },
    { entry: 3975, name: "Herod", location: "Scarlet Monastery Armory", isFinalBoss: true },
    { entry: 3977, name: "High Inquisitor Whitemane", location: "Scarlet Monastery Cathedral", isFinalBoss: true },
    { entry: 7358, name: "Amnennar the Coldbringer", location: "Razorfen Downs", isFinalBoss: true },
    { entry: 2748, name: "Archaedas", location: "Uldaman", isFinalBoss: true },
    { entry: 7267, name: "Chief Ukorz Sandscalp", location: "Zul'Farrak", isFinalBoss: true },
    { entry: 12201, name: "Princess Theradras", location: "Maraudon", isFinalBoss: true },
    { entry: 8443, name: "Avatar of Hakkar", location: "Sunken Temple", isFinalBoss: true },
    { entry: 9019, name: "Emperor Dagran Thaurissan", location: "Blackrock Depths", isFinalBoss: true },
    { entry: 9568, name: "Overlord Wyrmthalak", location: "Lower Blackrock Spire", isFinalBoss: true },
    { entry: 10363, name: "General Drakkisath", location: "Upper Blackrock Spire", isFinalBoss: true },
    { entry: 11492, name: "Alzzin the Wildshaper", location: "Dire Maul East", isFinalBoss: true },
    { entry: 11489, name: "Tendris Warpwood", location: "Dire Maul West", isFinalBoss: true },
    { entry: 11501, name: "King Gordok", location: "Dire Maul North", isFinalBoss: true },
    { entry: 10440, name: "Baron Rivendare", location: "Stratholme Undead Side", isFinalBoss: true },
    { entry: 10813, name: "Balnazzar", location: "Stratholme Live Side", isFinalBoss: true },
    { entry: 1853, name: "Darkmaster Gandling", location: "Scholomance", isFinalBoss: true },

    // The Burning Crusade dungeons
    { entry: 17307, name: "Vazruden", location: "Hellfire Ramparts" },
    { entry: 17536, name: "Nazan", location: "Hellfire Ramparts", isFinalBoss: true },
    { entry: 17377, name: "Keli'dan the Breaker", location: "The Blood Furnace", isFinalBoss: true },
    { entry: 16808, name: "Warchief Kargath Bladefist", location: "The Shattered Halls", isFinalBoss: true },
    { entry: 17942, name: "Quagmirran", location: "The Slave Pens", isFinalBoss: true },
    { entry: 17826, name: "Swamplord Musel'ek", location: "The Underbog", isFinalBoss: true },
    { entry: 17798, name: "Warlord Kalithresh", location: "The Steamvault", isFinalBoss: true },
    { entry: 18344, name: "Nexus-Prince Shaffar", location: "Mana-Tombs", isFinalBoss: true },
    { entry: 18373, name: "Exarch Maladaar", location: "Auchenai Crypts", isFinalBoss: true },
    { entry: 18473, name: "Talon King Ikiss", location: "Sethekk Halls", isFinalBoss: true },
    { entry: 18708, name: "Murmur", location: "Shadow Labyrinth", isFinalBoss: true },
    { entry: 19220, name: "Pathaleon the Calculator", location: "The Mechanar", isFinalBoss: true },
    { entry: 17977, name: "Warp Splinter", location: "The Botanica", isFinalBoss: true },
    { entry: 20912, name: "Harbinger Skyriss", location: "The Arcatraz", isFinalBoss: true },
    { entry: 17881, name: "Aeonus", location: "The Black Morass", isFinalBoss: true },
    { entry: 18096, name: "Epoch Hunter", location: "Old Hillsbrad Foothills", isFinalBoss: true },
    { entry: 24664, name: "Kael'thas Sunstrider", location: "Magisters' Terrace", isFinalBoss: true },

    // The Burning Crusade raids
    { entry: 22887, name: "Attumen the Huntsman", location: "Karazhan" },
    { entry: 22888, name: "Moroes", location: "Karazhan" },
    { entry: 22889, name: "Maiden of Virtue", location: "Karazhan" },
    { entry: 22890, name: "The Big Bad Wolf", location: "Karazhan" },
    { entry: 22891, name: "The Crone", location: "Karazhan" },
    { entry: 22892, name: "Romulo", location: "Karazhan" },
    { entry: 22893, name: "Julianne", location: "Karazhan" },
    { entry: 22894, name: "The Curator", location: "Karazhan" },
    { entry: 22895, name: "Terestian Illhoof", location: "Karazhan" },
    { entry: 22896, name: "Shade of Aran", location: "Karazhan" },
    { entry: 22897, name: "Netherspite", location: "Karazhan" },
    { entry: 22898, name: "Chess Event", location: "Karazhan" },
    { entry: 22899, name: "Prince Malchezaar", location: "Karazhan", isFinalBoss: true },
    { entry: 22900, name: "Nightbane", location: "Karazhan" },
    { entry: 22901, name: "Gruul the Dragonkiller", location: "Gruul's Lair", isFinalBoss: true },
    { entry: 22902, name: "Magtheridon", location: "Magtheridon's Lair", isFinalBoss: true },
    { entry: 22903, name: "Lady Vashj", location: "Serpentshrine Cavern", isFinalBoss: true },
    { entry: 22904, name: "Kael'thas Sunstrider", location: "The Eye", isFinalBoss: true },
    { entry: 22905, name: "Al'ar", location: "The Eye", isFinalBoss: true },
    { entry: 22906, name: "Solarian", location: "The Eye", isFinalBoss: true },
    { entry: 22907, name: "Void Reaver", location: "The Eye", isFinalBoss: true },
    { entry: 22908, name: "High Astromancer Solarian", location: "The Eye", isFinalBoss: true },
    { entry: 22909, name: "Kael'thas Sunstrider", location: "The Eye", isFinalBoss: true },
    { entry: 22910, name: "Rage Winterchill", location: "Mount Hyjal", isFinalBoss: true },
    { entry: 22911, name: "Anetheron", location: "Mount Hyjal", isFinalBoss: true },
    { entry: 22912, name: "Kaz'rogal", location: "Mount Hyjal", isFinalBoss: true },
    { entry: 22913, name: "Azgalor", location: "Mount Hyjal", isFinalBoss: true },
    { entry: 22914, name: "Archimonde", location: "Mount Hyjal", isFinalBoss: true },
    { entry: 22915, name: "Najentus", location: "Black Temple", isFinalBoss: true },
    { entry: 22916, name: "Supremus", location: "Black Temple", isFinalBoss: true },
    { entry: 22917, name: "Shade of Akama", location: "Black Temple", isFinalBoss: true },
    { entry: 22918, name: "Teron Gorefiend", location: "Black Temple", isFinalBoss: true },
    { entry: 22919, name: "Gurtogg Bloodboil", location: "Black Temple", isFinalBoss: true },
    { entry: 22920, name: "Reliquary of Souls", location: "Black Temple", isFinalBoss: true },
    { entry: 22921, name: "Mother Shahraz", location: "Black Temple", isFinalBoss: true },
    { entry: 22922, name: "The Illidari Council", location: "Black Temple", isFinalBoss: true },
    { entry: 22923, name: "Illidan Stormrage", location: "Black Temple", isFinalBoss: true },
    { entry: 22924, name: "Kalecgos", location: "Sunwell Plateau", isFinalBoss: true },
    { entry: 22925, name: "Brutallus", location: "Sunwell Plateau", isFinalBoss: true },
    { entry: 22926, name: "Felmyst", location: "Sunwell Plateau", isFinalBoss: true },
    { entry: 22927, name: "Eredar Twins", location: "Sunwell Plateau", isFinalBoss: true },
    { entry: 22928, name: "M'uru", location: "Sunwell Plateau", isFinalBoss: true },
    { entry: 22929, name: "Kil'jaeden", location: "Sunwell Plateau", isFinalBoss: true },

    // Wrath of the Lich King dungeons
    { entry: 23954, name: "Ingvar the Plunderer", location: "Utgarde Keep", isFinalBoss: true },
    { entry: 26723, name: "Keristrasza", location: "The Nexus", isFinalBoss: true },
    { entry: 29120, name: "Anub'arak", location: "Azjol-Nerub", isFinalBoss: true },
    { entry: 29311, name: "Herald Volazj", location: "Ahn'kahet: The Old Kingdom", isFinalBoss: true },
    { entry: 26632, name: "The Prophet Tharon'ja", location: "Drak'Tharon Keep", isFinalBoss: true },
    { entry: 31134, name: "Cyanigosa", location: "Violet Hold", isFinalBoss: true },
    { entry: 29306, name: "Gal'darah", location: "Gundrak", isFinalBoss: true },
    { entry: 27978, name: "Sjonnir the Ironshaper", location: "Halls of Stone", isFinalBoss: true },
    { entry: 28923, name: "Loken", location: "Halls of Lightning", isFinalBoss: true },
    { entry: 27656, name: "Ley-Guardian Eregos", location: "The Oculus", isFinalBoss: true },
    { entry: 26533, name: "Mal'Ganis", location: "Culling of Stratholme", isFinalBoss: true },
    { entry: 26861, name: "King Ymiron", location: "Utgarde Pinnacle", isFinalBoss: true },
    { entry: 35451, name: "The Black Knight", location: "Trial of the Champion", isFinalBoss: true },
    { entry: 36502, name: "Devourer of Souls", location: "Forge of Souls", isFinalBoss: true },
    { entry: 36658, name: "Scourgelord Tyrannus", location: "Pit of Saron", isFinalBoss: true },
    { entry: 37226, name: "The Lich King", location: "Halls of Reflection", isFinalBoss: true },

    // Wrath of the Lich King raids
    { entry: 29341, name: "Anub'Rekhan", location: "Naxxramas", isFinalBoss: true },
    { entry: 29342, name: "Grand Widow Faerlina", location: "Naxxramas", isFinalBoss: true },
    { entry: 29343, name: "Maexxna", location: "Naxxramas", isFinalBoss: true },
    { entry: 29344, name: "Noth the Plaguebringer", location: "Naxxramas", isFinalBoss: true },
    { entry: 29345, name: "Heigan the Unclean", location: "Naxxramas", isFinalBoss: true },
    { entry: 29346, name: "Loatheb", location: "Naxxramas", isFinalBoss: true },
    { entry: 29347, name: "Instructor Razuvious", location: "Naxxramas", isFinalBoss: true },
    { entry: 29348, name: "Gothik the Harvester", location: "Naxxramas", isFinalBoss: true },
    { entry: 29349, name: "The Four Horsemen", location: "Naxxramas", isFinalBoss: true },
    { entry: 29350, name: "Patchwerk", location: "Naxxramas", isFinalBoss: true },
    { entry: 29351, name: "Grobbulus", location: "Naxxramas", isFinalBoss: true },
    { entry: 29352, name: "Gluth", location: "Naxxramas", isFinalBoss: true },
    { entry: 29353, name: "Thaddius", location: "Naxxramas", isFinalBoss: true },
    { entry: 29354, name: "Sapphiron", location: "Naxxramas", isFinalBoss: true },
    { entry: 29355, name: "Kel'Thuzad", location: "Naxxramas", isFinalBoss: true },
    { entry: 29356, name: "Sartharion", location: "Obsidian Sanctum", isFinalBoss: true },
    { entry: 29357, name: "Malygos", location: "Eye of Eternity", isFinalBoss: true },
    { entry: 29358, name: "Ignis the Furnace Master", location: "Ulduar", isFinalBoss: true },
    { entry: 29359, name: "XT-002 Deconstructor", location: "Ulduar", isFinalBoss: true },
    { entry: 29360, name: "Kologarn", location: "Ulduar", isFinalBoss: true },
    { entry: 29361, name: "Auriaya", location: "Ulduar", isFinalBoss: true },
    { entry: 29362, name: "Hodir", location: "Ulduar", isFinalBoss: true },
    { entry: 29363, name: "Thorim", location: "Ulduar", isFinalBoss: true },
    { entry: 29364, name: "Freya", location: "Ulduar", isFinalBoss: true },
    { entry: 29365, name: "Mimiron", location: "Ulduar", isFinalBoss: true },
    { entry: 29366, name: "General Vezax", location: "Ulduar", isFinalBoss: true },
    { entry: 29367, name: "Yogg-Saron", location: "Ulduar", isFinalBoss: true },
    { entry: 29368, name: "The Northrend Beasts", location: "Trial of the Crusader", isFinalBoss: true },
    { entry: 29369, name: "Lord Jaraxxus", location: "Trial of the Crusader", isFinalBoss: true },
    { entry: 29370, name: "The Faction Champions", location: "Trial of the Crusader", isFinalBoss: true },
    { entry: 29371, name: "Twin Val'kyr", location: "Trial of the Crusader", isFinalBoss: true },
    { entry: 29372, name: "Anub'arak", location: "Trial of the Crusader", isFinalBoss: true },
    { entry: 29373, name: "Onyxia", location: "Onyxia's Lair", isFinalBoss: true },
    { entry: 29374, name: "Lord Marrowgar", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29375, name: "Lady Deathwhisper", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29376, name: "Gunship Battle", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29377, name: "Deathbringer Saurfang", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29378, name: "Festergut", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29379, name: "Rotface", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29380, name: "Professor Putricide", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29381, name: "Blood-Queen Lana'thel", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29382, name: "Valithria Dreamwalker", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29383, name: "Sindragosa", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29384, name: "The Lich King", location: "Icecrown Citadel", isFinalBoss: true },
    { entry: 29385, name: "Halion", location: "Ruby Sanctum", isFinalBoss: true },

    // Molten Core
    { entry: 12118, name: "Lucifron", location: "Molten Core" },
    { entry: 11982, name: "Magmadar", location: "Molten Core" },
    { entry: 12259, name: "Gehennas", location: "Molten Core" },
    { entry: 12057, name: "Garr", location: "Molten Core" },
    { entry: 12264, name: "Shazzrah", location: "Molten Core" },
    { entry: 12056, name: "Baron Geddon", location: "Molten Core" },
    { entry: 12098, name: "Sulfuron Harbinger", location: "Molten Core" },
    { entry: 11988, name: "Golemagg the Incinerator", location: "Molten Core" },
    { entry: 12018, name: "Majordomo Executus", location: "Molten Core" },
    { entry: 11502, name: "Ragnaros", location: "Molten Core", isFinalBoss: true },

    // Blackwing Lair
    { entry: 12435, name: "Razorgore the Untamed", location: "Blackwing Lair" },
    { entry: 13020, name: "Vaelastrasz the Corrupt", location: "Blackwing Lair" },
    { entry: 12017, name: "Broodlord Lashlayer", location: "Blackwing Lair" },
    { entry: 11983, name: "Firemaw", location: "Blackwing Lair" },
    { entry: 14601, name: "Ebonroc", location: "Blackwing Lair" },
    { entry: 11981, name: "Flamegor", location: "Blackwing Lair" },
    { entry: 14020, name: "Chromaggus", location: "Blackwing Lair" },
    { entry: 11583, name: "Nefarian", location: "Blackwing Lair", isFinalBoss: true },

    // Ruins of Ahn'Qiraj
    { entry: 15348, name: "Kurinnaxx", location: "Ruins of Ahn'Qiraj" },
    { entry: 15341, name: "General Rajaxx", location: "Ruins of Ahn'Qiraj" },
    { entry: 15340, name: "Moam", location: "Ruins of Ahn'Qiraj" },
    { entry: 15370, name: "Buru the Gorger", location: "Ruins of Ahn'Qiraj" },
    { entry: 15369, name: "Ayamiss the Hunter", location: "Ruins of Ahn'Qiraj" },
    { entry: 15339, name: "Ossirian the Unscarred", location: "Ruins of Ahn'Qiraj", isFinalBoss: true },

    // Temple of Ahn'Qiraj
    { entry: 15263, name: "The Prophet Skeram", location: "Temple of Ahn'Qiraj" },
    { entry: 15516, name: "Battleguard Sartura", location: "Temple of Ahn'Qiraj" },
    { entry: 15510, name: "Fankriss the Unyielding", location: "Temple of Ahn'Qiraj" },
    { entry: 15509, name: "Princess Huhuran", location: "Temple of Ahn'Qiraj" },
    { entry: 15275, name: "Emperor Vek'lor", location: "Temple of Ahn'Qiraj" },
    { entry: 15276, name: "Emperor Vek'nilash", location: "Temple of Ahn'Qiraj" },
    { entry: 15727, name: "C'Thun", location: "Temple of Ahn'Qiraj", isFinalBoss: true },

    // Zul'Gurub
    { entry: 14517, name: "High Priestess Jeklik", location: "Zul'Gurub" },
    { entry: 14507, name: "High Priest Venoxis", location: "Zul'Gurub" },
    { entry: 14510, name: "High Priestess Mar'li", location: "Zul'Gurub" },
    { entry: 14509, name: "High Priest Thekal", location: "Zul'Gurub" },
    { entry: 14515, name: "High Priestess Arlokk", location: "Zul'Gurub" },
    { entry: 14834, name: "Hakkar the Soulflayer", location: "Zul'Gurub", isFinalBoss: true },
    { entry: 11382, name: "Bloodlord Mandokir", location: "Zul'Gurub" },
    { entry: 11380, name: "Jin'do the Hexxer", location: "Zul'Gurub" },
    { entry: 15114, name: "Gahz'ranka", location: "Zul'Gurub" },
    { entry: 15082, name: "Renataki", location: "Zul'Gurub" },
    { entry: 15083, name: "Grilek", location: "Zul'Gurub" },
    { entry: 15084, name: "Hazza'rah", location: "Zul'Gurub" },
    { entry: 15085, name: "Wushoolay", location: "Zul'Gurub" },

    // Karazhan
    { entry: 16152, name: "Attumen the Huntsman", location: "Karazhan" },
    { entry: 15687, name: "Moroes", location: "Karazhan" },
    { entry: 16457, name: "Maiden of Virtue", location: "Karazhan" },
    { entry: 17521, name: "The Big Bad Wolf", location: "Karazhan" },
    { entry: 18168, name: "The Crone", location: "Karazhan" },
    { entry: 17533, name: "Romulo", location: "Karazhan" },
    { entry: 17534, name: "Julianne", location: "Karazhan" },
    { entry: 15691, name: "The Curator", location: "Karazhan" },
    { entry: 15688, name: "Terestian Illhoof", location: "Karazhan" },
    { entry: 16524, name: "Shade of Aran", location: "Karazhan" },
    { entry: 15689, name: "Netherspite", location: "Karazhan" },
    { entry: 16816, name: "Chess Event", location: "Karazhan" },
    { entry: 15690, name: "Prince Malchezaar", location: "Karazhan", isFinalBoss: true },
    { entry: 17225, name: "Nightbane", location: "Karazhan" }
];

// Quickly check if a creature is a final boss
export const FinalBossIDs = new Set(Bosses.filter(b => b.isFinalBoss).map(b => b.entry));

// Example usage:
export function isFinalBoss(entry: number): boolean {
  return FinalBossIDs.has(entry);
}

// Look up by name
export const BossesByName = Object.fromEntries(
  Bosses.map(b => [b.name.toLowerCase(), b])
);

// Example usage:
export function getBossByName(name: string): Boss | undefined {
  return BossesByName[name.toLowerCase()];
}

// For backward compatibility
export const BossIDs: Record<number, boolean> = Object.fromEntries(
  Bosses.map(b => [b.entry, true])
);

export function isBossDbCheck(entry: number): boolean {
    const sql = `
    select distinct entry
    from acore_world.creature_template ct
    left join creature c on ct.entry = c.id1
    left join map_dbc m on c.map = m.ID
     where
         (ct.\`rank\` = 3 and InstanceType > 0)
         OR (ct.\`rank\` = 3 and ct.ScriptName like 'boss_%')
         OR (ExpansionID = 1 and ct.ScriptName like '%boss%')
         OR (m.InstanceType = 1 and ExperienceModifier = 2)
         and entry = ${entry}`;

    const result = WorldDBQuery(sql);
    if(result) {
        return true;
    }
    return false;
}
