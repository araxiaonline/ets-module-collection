# ETS Module Collection

A comprehensive collection of World of Warcraft Eluna TypeScript (ETS) modules for AzerothCore servers. These modules add custom gameplay features, UI enhancements, and server management tools.

## 🎮 Available Modules

### 🖥️ User Interface (UI) Modules

#### **Bot Manager** (`UI/botmgr`)
Advanced bot management system with equipment handling and statistics.
- **Dependencies**: `constants`, `classes`
- **Features**: Bot equipment management, stat tracking, unit handling
- **Files**: `botmgr.client.ts`, `botmgr.server.ts`, `bot.ts`, `botUnit.ts`

#### **Gambler** (`UI/gambler`)
Interactive slot machine gambling system.
- **Dependencies**: `classes`
- **Features**: Slot machine gameplay, currency handling
- **Command**: `/gamble`
- **Files**: `gambler.client.ts`, `gambler.server.ts`

#### **Mythic Plus** (`UI/mythicplus`)
Comprehensive dungeon enhancement system with advancement mechanics.
- **Dependencies**: `classes`, `constants`
- **Features**: Custom spells, dungeon modifications, player advancement, mythic items
- **Files**: `mythicplus.client.ts`, `mythicplus.server.ts`, `advance.client.ts`, `advance.server.ts`, `mythic_*`

#### **Shared UI** (`UI/shared`)
Common UI utilities and components.
- **Dependencies**: None
- **Features**: Audio player client functionality
- **Files**: `audioplayer.client.ts`

### 🛠️ Core Classes (`classes`)
Essential utility classes used across modules.
- **Dependencies**: None
- **Components**:
  - `account.ts` - Account information handling
  - `group.ts` - Group size and management utilities
  - `itemdetails.ts` - Item information processing
  - `logger.ts` - Logging system
  - `mapzones.ts` - Map and zone utilities
  - `money.ts` - Currency conversion and handling
  - `server-utils.ts` - Server utility functions
  - `stats.ts` - Player statistics tracking
  - `triggers.ts` - Event trigger system
  - `ui-utils.ts` - User interface utilities

### ⚙️ Commands (`commands`)
Server administration commands.
- **Dependencies**: `classes`
- **Available**:
  - `set-xp-rate.ts` - Dynamic experience rate adjustment

### 📊 Constants (`constants`)
Shared constants and ID mappings.
- **Dependencies**: None
- **Components**:
  - `idmaps.ts` - Game object and item ID mappings

### 🎯 Events (`events`)
Server event handlers and modifications.
- **Dependencies**: `classes`
- **Available**:
  - `achievement-tokens.ts` - Achievement-based token rewards
  - `worgoblin-patch.ts` - Worgen/Goblin currency fixes

### 🏺 Game Objects (`gameobject`)
Interactive world objects.
- **Dependencies**: `classes`
- **Available**:
  - `gamblechest.ts` - Gambling chest mechanics
  - `windpeak.ts` - Windpeak-specific objects

### 🎲 Gameplay (`gameplay`)
Core gameplay modifications.
- **Dependencies**: `classes`
- **Available**:
  - `reputation-tabard.ts` - Reputation system enhancements

### 👑 GM Tools (`gm`)
Game Master utilities and tools.
- **Dependencies**: None
- **Available**:
  - `play-leeroy.ts` - Leeroy Jenkins easter egg
  - `test-hidden-channel.ts` - Hidden channel testing

### 🎒 Items (`items`)
Custom item behaviors and handlers.
- **Dependencies**: `classes`
- **Available**:
  - `badge-of-justice.ts` - Badge of Justice mechanics
  - `bonus-enchantment.ts` - Bonus enchantment system
  - `book-of-travel.ts` - Teleportation item
  - `darkmoon.ts` - Darkmoon Faire enhancements
  - `tokens.ts` - Token drop system for dungeon bosses
  - `vashj-fix.ts` - Lady Vashj encounter fixes

### 🤖 NPCs (`npcs`)
Non-player character enhancements.
- **Dependencies**: `classes`, `constants`
- **Available**:
  - `npcbot.ts` - NPC bot functionality
  - `soulswapper.ts` - Cross-character soulbound item transfer

### 🌐 Global Environment (`00_Envs`)
Essential global configurations and environment setup.
- **Dependencies**: None
- **Note**: Always included in builds
- **Files**: `global_envs.ts`

## 📥 How to Download Individual Modules

### For Server Administrators & Users

1. **Navigate to Actions**: Go to the [Actions tab](../../actions) in this repository
2. **Select Workflow**: Click on "Download Individual Module"
3. **Run Workflow**: Click "Run workflow" and configure your download:
   - **Module Category**: Choose from dropdown (e.g., `UI/gambler`, `items`, `classes`)
   - **Specific Module** *(optional)*: Enter a specific file name (e.g., `tokens.ts`)
   - **Include Dependencies**: ✅ Recommended - automatically includes required modules
4. **Download**: Once complete, download the generated artifact ZIP file
5. **Install**: Extract to your server's Eluna scripts directory

### Download Examples

- **Complete Gambler System**: Select `UI/gambler` + dependencies → Gets gambler + classes + global environment
- **Just Token System**: Select `items` + `tokens.ts` + dependencies → Gets tokens.ts + classes + global environment
- **Bot Manager**: Select `UI/botmgr` + dependencies → Gets bot manager + constants + classes + global environment
- **Everything**: Select `all-modules` → Gets complete module collection

### Installation Notes

- **Dependencies**: When enabled, automatically includes required shared modules
- **Global Environment**: `00_Envs` is always included (contains essential configurations)
- **Duplicates**: Safe to overwrite if downloading multiple modules separately
- **Compatibility**: Built for AzerothCore with Eluna scripting engine

## 🚀 Production Deployment

### Automated Deployment System

This repository uses GitHub Actions for automated building and deployment:

#### **Deployment Trigger**
- **When**: Pull Request merged from `dev` → `main` branch
- **What**: Builds all modules and deploys to production server
- **Where**: Deploys to `/home/bcarter/acore/scripts/ets` on production server

#### **Deployment Process**
1. **Build**: Compiles TypeScript to Lua using ETS build system
2. **Version**: Creates date-commit versioned build (e.g., `2024-08-26-abc1234`)
3. **Clean**: Removes all existing files from production directory
4. **Deploy**: Uploads compiled Lua files to production server
5. **Verify**: Confirms successful deployment
6. **Release**: Creates GitHub release with build artifacts

#### **Build Artifacts**
Each deployment creates:
- **`version.txt`**: Build version, date, and commit information
- **`changelog.txt`**: Recent commit history and changes
- **Compiled Lua Files**: All TypeScript modules converted to Lua
- **GitHub Release**: Tagged release with downloadable artifacts

#### **Server Requirements**
- **SSH Access**: Production server accessible via SSH key authentication
- **Path**: Clean deployment to `/home/bcarter/acore/scripts/ets`
- **Eluna**: AzerothCore server with Eluna scripting enabled

### Manual Deployment Commands

For development and testing:

```bash
# Development build and copy
npm run dev

# Development build and deploy
npm run deploy:dev

# Production build and deploy
npm run deploy:prod

# Watch and auto-deploy on changes
npm run watch:dev
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- TypeScript
- ETS (Eluna TypeScript) build system

### Installation
```bash
# Clone repository
git clone https://github.com/araxiaonline/ets-module-collection.git
cd ets-module-collection

# Install dependencies
npm install

# Configure environment
cp ets.env.example ets.env  # Configure your settings

# Build modules
npm run build
```

### Project Structure
```
modules/
├── 00_Envs/           # Global environment (always included)
├── UI/                # User interface modules
├── classes/           # Core utility classes
├── constants/         # Shared constants and mappings
├── events/            # Event handlers
├── gameobject/        # Interactive world objects
├── gameplay/          # Core gameplay modifications
├── gm/                # Game Master tools
├── items/             # Custom item behaviors
└── npcs/              # NPC enhancements
```

## 📖 Module Dependencies

The build system automatically handles dependencies:

- **UI Modules**: Require `classes` and/or `constants`
- **Feature Modules**: Most require `classes` for utility functions
- **Core Modules**: `classes`, `constants` have no dependencies
- **Global**: `00_Envs` always included in every build

## 🤝 Contributing

1. Fork the repository
2. Create feature branch from `dev`
3. Make your changes
4. Submit Pull Request to `dev` branch
5. Changes will be automatically deployed when merged to `main`

## 📄 License

This project is open source. Please check individual module files for specific licensing information.

## 🆘 Support

- **Issues**: Report bugs and feature requests in [Issues](../../issues)
- **Discussions**: Join community discussions in [Discussions](../../discussions)
- **Documentation**: Module-specific documentation available in source files

---

**Built for AzerothCore with ❤️ by the Araxia Online community**