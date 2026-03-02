<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Titan-OMNI-AI Sovereign v25

A high-fidelity JARVIS-like AI command center with real-time audio, video, and kinetic memory integration powered by Google Gemini AI.

## ✨ Features

### 🤖 AI Integration

- **Google Gemini AI**: Full streaming chat integration with 17 functional AI tools
- **Three AI Modes**: Pro, Flash, and Thinking for different use cases
- **17 AI Tools**: Spawn entities, create contraptions, apply forces, record simulations, and more

### 🎨 Six Persona Themes

- **Standard** (STARK_GENESIS) - Cyan theme, balanced assistant
- **Tactical** (MARK_WAR) - Red theme, mission-focused combat mode
- **Researcher** (HYDRA_UPLINK) - Green theme, deep analysis
- **Engineer** (FORGE_PROTOCOL) - Orange theme, technical focus
- **Navigator** (COMPASS_ARRAY) - Blue theme, exploration mode
- **Analyst** (NEXUS_CORE) - Purple theme, data analysis

### 🌍 Physics Engine

- **Real-Time Simulation**: 60 FPS physics with collision detection
- **12 Material Presets**: Tungsten, Rubber, Ghost, Plasma, Titanium, Neutronium, Obsidian, Glass, Helium, Cotton, Liquid, Default
- **7 Entity Shapes**: Sphere, Cube, Singularity, Cylinder, Pyramid, Torus, Capsule
- **Multi-Layer System**: Independent gravity, atmosphere, and environmental effects per layer
- **Advanced Physics**: Buoyancy, air resistance, damping, elasticity, friction, tensile strength

### 🎭 Vision Filters

- **8 Vision Modes**: Normal, Thermal, Tactical, Night, XRay, Electromagnetic, Quantum, Infrared
- **Real-Time Switching**: One-click vision mode changes
- **CSS Filter Effects**: Each mode has unique visual styling

### 🌐 Environmental Presets

- **7 Preset Environments**: EARTH, MOON, JUPITER, UNDERWATER, SPACE, STORM, VORTEX
- **Dynamic Physics**: Gravity, atmosphere density, wind, turbulence, gravity wells
- **One-Click Loading**: Instantly switch between planetary environments

### 🎬 Recording & Playback

- **Frame Recording**: Capture simulation states in real-time
- **Playback Controls**: Play, stop, and clear recorded simulations
- **Frame Counter**: Track recording duration
- **Speed Control**: Adjust playback temporal scale

### 💾 Data Management

- **Export System**: Save entire simulations to JSON (entities, layers, markers, synapses)
- **Import System**: Load saved simulations from file
- **Contraption Library**: Save and load custom entity configurations
- **Persistent Storage**: Browser-based state management

### 🎆 Particle Effects

- **4 Particle Types**: Spark, Explosion, Smoke, Trail
- **Custom Editor**: Adjust type, color, and count (10-100)
- **Real-Time Spawning**: Create effects on demand
- **Physics Integration**: Particles affected by gravity and wind

### 📊 Performance Monitoring

- **Live Metrics Dashboard**: Entity count, particle count, energy calculations
- **Floating Overlay**: Toggle performance stats anytime
- **Real-Time Updates**: Track moving entities, active particles, layer count
- **Energy Display**: Total kinetic energy in kilojoules

### 🎮 Sample Simulations

- **10 Pre-Built Demos**: Including Gravity Test, Newton's Cradle, Tower Challenge, Chain Reaction
- **Interactive Tutorials**: 4 educational scenarios (Physics 101, Collision Basics, etc.)
- **Comprehensive Testing**: 84-entity test grid (12 materials × 7 shapes)

### 📡 AR & Telemetry

- **Tactical Markers**: 11 marker types (IDENT, WARN, TARGET, SCAN, etc.)
- **Neural Memory Lattice**: Long-term fact storage with categorization
- **Real-Time Charts**: Stress load and kinetic energy telemetry
- **Grounding Links**: External reference integration

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MastaTrill/Titan-OMNI-AI.git
   cd Titan-OMNI-AI
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure your API key**

   Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and add your Gemini API key:

   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to: `http://localhost:3000/Titan-OMNI-AI/`

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 🏗️ Project Structure

```
Titan-OMNI-AI/
├── src/
│   ├── components/      # Modular React components
│   │   ├── ErrorBoundary.tsx
│   │   ├── NeuralLattice.tsx
│   │   ├── TelemetryChart.tsx
│   │   ├── GlassPanel.tsx
│   │   ├── BiometricHandshake.tsx
│   │   └── SpectralReactor.tsx
│   ├── types.ts         # TypeScript interfaces and type definitions
│   ├── constants.ts     # Presets, simulations, tutorials, and app constants (700+ lines)
│   └── utils.ts         # Utility functions
├── index.tsx           # Main application component (2129 lines)
├── styles.css          # Global glassmorphism styles (1085+ lines)
├── index.html          # HTML entry point
├── vite.config.ts      # Vite configuration
├── .env.local          # Your API keys (git-ignored)
└── .env.example        # Environment template
```

**Key Files:**

- **src/constants.ts**: Material presets, environmental settings, sample simulations, interactive tutorials
- **index.tsx**: Main application with physics engine, AI integration, and complete UI
- **styles.css**: Themed styling system with cyan/red/green/orange/blue/purple palettes

## 🎮 Usage

### Persona Modes

Switch between six distinct personas, each with unique visual themes and AI personalities:

- **Standard** (S) - Cyan theme, balanced assistant mode
- **Tactical** (T) - Red theme, mission-focused combat mode
- **Researcher** (R) - Green theme, deep analysis mode
- **Engineer** (E) - Orange theme, technical focus
- **Navigator** (N) - Blue theme, exploration mode
- **Analyst** (A) - Purple theme, data analysis

### AI Modes

- **Pro** - Advanced reasoning and creativity
- **Flash** - Fast responses for quick tasks
- **Thinking** - Deep analysis with extended chain-of-thought

### Physics Controls

**Basic Entity Management:**

- **Spawn Nodes**: Click "Spawn Node" to create physics entities
- **Select**: Click any entity in the canvas to select it
- **Drag**: Click and drag selected entities to reposition
- **Material Presets**: 12 materials (Tungsten, Rubber, Ghost, Plasma, etc.)
- **Shape Selection**: 7 shapes (Sphere, Cube, Singularity, Cylinder, Pyramid, Torus, Capsule)
- **Delete**: Click "Remove Selected" to delete chosen entity

**Environmental Presets:**

- **EARTH**: Standard gravity (0.15), normal atmosphere
- **MOON**: Low gravity (0.025), thin atmosphere
- **JUPITER**: High gravity (0.4), dense atmosphere
- **UNDERWATER**: Medium gravity, high viscosity and buoyancy
- **SPACE**: Zero gravity, rotational gravity wells
- **STORM**: Wind and turbulence effects
- **VORTEX**: Circular wind patterns with gravity wells

**Sample Simulations:**
Load 10 pre-built physics demonstrations:

1. **Gravity Test**: Basic falling objects
2. **Collision Demo**: Elasticity testing
3. **Orbital**: Singularity orbit mechanics
4. **Tower Challenge**: Stability testing
5. **Pendulum**: Harmonic motion
6. **Chain Reaction**: Domino cascade effect
7. **Newton's Cradle**: Momentum conservation
8. **Friction Ramp**: Material friction comparison
9. **Centrifuge**: Rotational physics
10. **Liquid Flow**: Viscosity demonstration

**Layer Manager:**

- Adjust gravity (X and Y components)
- Set atmosphere density
- Control viscosity for fluid simulation
- Each layer has independent physics

### Vision Filters

Switch between 8 real-time visual modes:

- **Normal**: Standard view
- **Thermal**: Heat-based color mapping
- **Tactical**: High-contrast mission mode
- **Night**: Low-light enhancement
- **XRay**: Transparency effects
- **Electromagnetic**: Energy field visualization
- **Quantum**: Particle wave effects
- **Infrared**: Thermal radiation view

### Recording & Playback

**Frame Recording:**

1. Click **REC** to start recording frames
2. Interact with simulation (recording captures at 60 FPS)
3. Click **STOP** to end recording
4. Click **PLAY** to watch playback
5. Click **CLEAR** to reset recording buffer

**Export/Import:**

- **EXPORT**: Save entire simulation to JSON file (entities, layers, markers, synapses)
- **IMPORT**: Load previously saved simulation from file

### Contraption Library

**Save Custom Builds:**

1. Create your entity configuration
2. Enter a name in the input field
3. Click **SAVE** to store contraption
4. View saved contraptions in the scrollable list
5. Click any saved name to load instantly

### Particle Effects

**Custom Particle System:**

1. Open **PARTICLE EFFECT EDITOR**
2. Select particle type (✨ Spark, 💥 Explosion, 💨 Smoke, 🌀 Trail)
3. Choose color with color picker
4. Adjust count (10-100 particles)
5. Click **SPAWN EFFECT** to create burst at center

### Performance Dashboard

**Real-Time Metrics:**

- Total entities and moving entities
- Particle count and active particles
- Marker and layer counts
- Total kinetic energy (kJ)
- Time scale multiplier

Click the **📊** button (top-right) to toggle dashboard visibility.

### AI Tool Commands

Ask the AI to perform advanced actions:

**Entity Manipulation:**

- "Create a tower of 5 titanium cubes"
- "Add a tungsten sphere with 10 velocity"
- "Apply force to the selected entity"

**Physics Control:**

- "Add a gravity well in the center"
- "Enable wind in the current layer"
- "Set temporal scale to 0.5"

**Environment:**

- "Load the Moon environment"
- "Switch to underwater preset"
- "Load Newton's Cradle simulation"

**Analysis:**

- "Scan the environment for unstable entities"
- "Show me the stress analysis"
- "Record the next 5 seconds"

**Advanced:**

- "Create a contraption with 3 layers"
- "Execute a chain reaction sequence"
- "Playback the last recording"

## 🛠️ Recent Improvements

**Core Features:**
✅ 17 fully functional AI tool handlers  
✅ 8-mode vision filter system with themed UI  
✅ Complete recording/playback system with frame counter  
✅ Export/Import system with JSON metadata  
✅ Contraption library with save/load functionality  
✅ Particle effect editor with 4 types and customization  
✅ Performance dashboard with 8 real-time metrics  
✅ 5 new sample simulations (Chain Reaction, Newton's Cradle, Friction Ramp, Centrifuge, Liquid Flow)  
✅ 4 interactive tutorial structures with step-by-step guides

**Development Quality:**
✅ Created modular component architecture  
✅ Fixed all code quality issues  
✅ Added comprehensive TypeScript types  
✅ Proper environment configuration  
✅ Enhanced developer experience with detailed logging

**UI Enhancements:**
✅ 6 persona themes (added Engineer, Navigator, Analyst)  
✅ 7 environmental presets with one-click loading  
✅ Enhanced CSS with ~1085 lines of themed styling  
✅ Glassmorphism design with hover effects  
✅ Responsive controls with visual feedback

## 🔧 Tech Stack

- **React 19.2.3** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 6.2.0** - Build tool
- **Google Gemini AI** - AI capabilities
- **CSS3** - Custom styling

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Some dynamic styles remain inline (necessary for runtime props)
- Security vulnerabilities in minimatch & rollup (run `npm audit fix`)

## 🔗 Links

- AI Studio: [View Project](https://ai.studio/apps/drive/1CawHvJm4Rh4WiBI97NT3o-ccxDUHTd_Q)
- GitHub: [Repository](https://github.com/MastaTrill/Titan-OMNI-AI)

---

<div align="center">
Made with ⚡ by MastaTrill
</div>
