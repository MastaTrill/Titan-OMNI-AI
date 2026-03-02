// Constants for Titan-OMNI-AI
import { Theme, MaterialPreset, PhysicsEntity, Persona, Layer } from './types';
import { FunctionDeclaration, Type } from "@google/genai";

export const STORAGE_KEY = 'jarvis_astra_v25_omega';

export const PRESET_THEMES: Record<Persona, Theme> = {
  Standard: { 
    name: 'STARK_GENESIS', 
    accent: '#00e5ff', 
    bg: '#020617', 
    secondary: '#006064', 
    glow: 'rgba(0, 229, 255, 0.4)', 
    alert: '#ff4b2b' 
  },
  Tactical: { 
    name: 'MARK_WAR', 
    accent: '#ff4b2b', 
    bg: '#1a0505', 
    secondary: '#7f0000', 
    glow: 'rgba(255, 75, 43, 0.4)', 
    alert: '#ffea00' 
  },
  Researcher: { 
    name: 'HYDRA_UPLINK', 
    accent: '#39ff14', 
    bg: '#000d00', 
    secondary: '#004d00', 
    glow: 'rgba(57, 255, 20, 0.4)', 
    alert: '#00e5ff' 
  },
  Engineer: {
    name: 'FORGE_PROTOCOL',
    accent: '#ff9800',
    bg: '#1a0f00',
    secondary: '#804000',
    glow: 'rgba(255, 152, 0, 0.4)',
    alert: '#00e5ff'
  },
  Navigator: {
    name: 'COMPASS_ARRAY',
    accent: '#2196f3',
    bg: '#000a1a',
    secondary: '#004080',
    glow: 'rgba(33, 150, 243, 0.4)',
    alert: '#ffea00'
  },
  Analyst: {
    name: 'NEXUS_CORE',
    accent: '#9c27b0',
    bg: '#0f001a',
    secondary: '#4a0080',
    glow: 'rgba(156, 39, 176, 0.4)',
    alert: '#00e5ff'
  },
};

export const MATERIAL_PRESETS: Record<MaterialPreset, Partial<PhysicsEntity>> = {
  Tungsten: { 
    mass: 5000, 
    elasticity: 0.1, 
    friction: 0.8, 
    airResistance: 0.001, 
    buoyancy: 0.0, 
    tensileStrength: 0.95, 
    viscosity: 0.01 
  },
  Rubber: { 
    mass: 800, 
    elasticity: 0.95, 
    friction: 0.4, 
    airResistance: 0.01, 
    buoyancy: 0.6, 
    tensileStrength: 0.4, 
    viscosity: 0.05 
  },
  Ghost: { 
    mass: 10, 
    elasticity: 1.0, 
    friction: 0.0, 
    airResistance: 0.0, 
    buoyancy: 1.2, 
    tensileStrength: 0.1, 
    viscosity: 0.0 
  },
  Plasma: { 
    mass: 100, 
    elasticity: 0.5, 
    friction: 0.1, 
    airResistance: 0.05, 
    buoyancy: 0.8, 
    tensileStrength: 1.0, 
    viscosity: 0.2 
  },
  Default: { 
    mass: 1000, 
    elasticity: 0.8, 
    friction: 0.1, 
    airResistance: 0.005, 
    buoyancy: 0.5, 
    tensileStrength: 0.8, 
    viscosity: 0.05 
  },
  Obsidian: {
    mass: 2800,
    elasticity: 0.05,
    friction: 0.9,
    airResistance: 0.002,
    buoyancy: 0.1,
    tensileStrength: 0.2,
    viscosity: 0.01
  },
  Helium: {
    mass: 20,
    elasticity: 0.99,
    friction: 0.0,
    airResistance: 0.15,
    buoyancy: 1.8,
    tensileStrength: 0.01,
    viscosity: 0.001
  },
  Neutronium: {
    mass: 50000,
    elasticity: 0.01,
    friction: 0.99,
    airResistance: 0.0001,
    buoyancy: -0.5,
    tensileStrength: 1.0,
    viscosity: 0.0
  },
  Glass: {
    mass: 2500,
    elasticity: 0.15,
    friction: 0.2,
    airResistance: 0.003,
    buoyancy: 0.2,
    tensileStrength: 0.05,
    viscosity: 0.01
  },
  Liquid: {
    mass: 1000,
    elasticity: 0.0,
    friction: 0.05,
    airResistance: 0.08,
    buoyancy: 0.5,
    tensileStrength: 0.0,
    viscosity: 0.9
  },
  Titanium: {
    mass: 4500,
    elasticity: 0.3,
    friction: 0.6,
    airResistance: 0.002,
    buoyancy: 0.05,
    tensileStrength: 0.99,
    viscosity: 0.02
  },
  Cotton: {
    mass: 150,
    elasticity: 0.6,
    friction: 0.7,
    airResistance: 0.25,
    buoyancy: 0.9,
    tensileStrength: 0.15,
    viscosity: 0.1
  }
};

export const ENVIRONMENTAL_PRESETS: Record<string, Partial<Layer>> = {
  EARTH: {
    name: 'EARTH_STANDARD',
    gravity: { x: 0, y: 0.15 },
    atmDensity: 1.0,
    viscosity: 0.1,
    colorBias: '#00e5ff'
  },
  MOON: {
    name: 'LUNAR_LOW_G',
    gravity: { x: 0, y: 0.025 },
    atmDensity: 0.01,
    viscosity: 0.0,
    colorBias: '#9e9e9e'
  },
  JUPITER: {
    name: 'JOVIAN_CRUSH',
    gravity: { x: 0, y: 0.38 },
    atmDensity: 2.5,
    viscosity: 0.3,
    colorBias: '#ff9800'
  },
  UNDERWATER: {
    name: 'AQUATIC_DEEP',
    gravity: { x: 0, y: 0.05 },
    atmDensity: 3.0,
    viscosity: 0.9,
    colorBias: '#2196f3'
  },
  SPACE: {
    name: 'VOID_ZERO_G',
    gravity: { x: 0, y: 0 },
    atmDensity: 0.0,
    viscosity: 0.0,
    colorBias: '#9c27b0'
  },
  STORM: {
    name: 'TEMPEST_CHAOS',
    gravity: { x: 0, y: 0.15 },
    atmDensity: 1.2,
    viscosity: 0.1,
    wind: { x: 5, y: -2 },
    turbulence: 0.5,
    colorBias: '#607d8b'
  },
  VORTEX: {
    name: 'SINGULARITY_PULL',
    gravity: { x: 0, y: 0.1 },
    atmDensity: 1.0,
    viscosity: 0.2,
    gravityWells: [
      { x: 400, y: 300, strength: 50, radius: 300 }
    ],
    colorBias: '#e91e63'
  }
};

export const SAMPLE_SIMULATIONS = {
  GRAVITY_TEST: {
    name: 'Gravity Material Test',
    description: 'Compare how different materials fall',
    entities: [
      { material: 'Helium', shape: 'sphere', x: 100, y: 400 },
      { material: 'Cotton', shape: 'sphere', x: 200, y: 400 },
      { material: 'Rubber', shape: 'sphere', x: 300, y: 400 },
      { material: 'Default', shape: 'sphere', x: 400, y: 400 },
      { material: 'Tungsten', shape: 'sphere', x: 500, y: 400 },
      { material: 'Neutronium', shape: 'cube', x: 600, y: 400 }
    ]
  },
  SHAPE_SHOWCASE: {
    name: 'All Shapes Demo',
    description: 'Display all available entity shapes',
    entities: [
      { material: 'Glass', shape: 'sphere', x: 150, y: 200 },
      { material: 'Titanium', shape: 'cube', x: 250, y: 200 },
      { material: 'Plasma', shape: 'singularity', x: 350, y: 200 },
      { material: 'Rubber', shape: 'cylinder', x: 450, y: 200 },
      { material: 'Obsidian', shape: 'pyramid', x: 550, y: 200 },
      { material: 'Helium', shape: 'torus', x: 150, y: 350 },
      { material: 'Liquid', shape: 'capsule', x: 250, y: 350 }
    ]
  },
  TOWER_CHALLENGE: {
    name: 'Build a Tower',
    description: 'Stack different materials to test stability',
    entities: [
      { material: 'Titanium', shape: 'cube', x: 400, y: 500, vx: 0, vy: 0 },
      { material: 'Titanium', shape: 'cube', x: 400, y: 440, vx: 0, vy: 0 },
      { material: 'Titanium', shape: 'cube', x: 400, y: 380, vx: 0, vy: 0 },
      { material: 'Glass', shape: 'cube', x: 400, y: 320, vx: 0, vy: 0 },
      { material: 'Glass', shape: 'cube', x: 400, y: 260, vx: 0, vy: 0 },
      { material: 'Rubber', shape: 'sphere', x: 400, y: 200, vx: 0, vy: 0 }
    ]
  },
  ORBITAL_DANCE: {
    name: 'Orbital Mechanics',
    description: 'Create circular orbital patterns',
    entities: [
      { material: 'Plasma', shape: 'singularity', x: 400, y: 300, vx: 0, vy: 0 },
      { material: 'Tungsten', shape: 'sphere', x: 500, y: 300, vx: 0, vy: 5 },
      { material: 'Rubber', shape: 'sphere', x: 300, y: 300, vx: 0, vy: -5 },
      { material: 'Helium', shape: 'torus', x: 400, y: 200, vx: 5, vy: 0 },
      { material: 'Cotton', shape: 'capsule', x: 400, y: 400, vx: -5, vy: 0 }
    ],
    environment: 'SPACE'
  },
  PARTICLE_SHOW: {
    name: 'Particle Effects Demo',
    description: 'Showcase various particle effects',
    particles: [
      { x: 200, y: 300, type: 'spark', count: 30, color: '#00e5ff' },
      { x: 400, y: 300, type: 'explosion', count: 40, color: '#ff4b2b' },
      { x: 600, y: 300, type: 'smoke', count: 20, color: '#9e9e9e' }
    ]
  },
  CHAIN_REACTION: {
    name: 'Domino Chain Reaction',
    description: 'Watch a cascade of collisions',
    entities: [
      { material: 'Tungsten', shape: 'sphere', x: 100, y: 300, vx: 10, vy: 0, size: 40 },
      { material: 'Titanium', shape: 'cube', x: 200, y: 300, vx: 0, vy: 0, size: 35 },
      { material: 'Titanium', shape: 'cube', x: 270, y: 300, vx: 0, vy: 0, size: 35 },
      { material: 'Titanium', shape: 'cube', x: 340, y: 300, vx: 0, vy: 0, size: 35 },
      { material: 'Titanium', shape: 'cube', x: 410, y: 300, vx: 0, vy: 0, size: 35 },
      { material: 'Titanium', shape: 'cube', x: 480, y: 300, vx: 0, vy: 0, size: 35 },
      { material: 'Titanium', shape: 'cube', x: 550, y: 300, vx: 0, vy: 0, size: 35 },
      { material: 'Rubber', shape: 'sphere', x: 620, y: 300, vx: 0, vy: 0, size: 40 }
    ]
  },
  NEWTONS_CRADLE: {
    name: "Newton's Cradle",
    description: 'Demonstrate conservation of momentum',
    entities: [
      { material: 'Tungsten', shape: 'sphere', x: 200, y: 300, vx: 15, vy: 0, size: 50 },
      { material: 'Tungsten', shape: 'sphere', x: 300, y: 300, vx: 0, vy: 0, size: 50 },
      { material: 'Tungsten', shape: 'sphere', x: 400, y: 300, vx: 0, vy: 0, size: 50 },
      { material: 'Tungsten', shape: 'sphere', x: 500, y: 300, vx: 0, vy: 0, size: 50 },
      { material: 'Tungsten', shape: 'sphere', x: 600, y: 300, vx: 0, vy: 0, size: 50 }
    ]
  },
  FRICTION_RAMP: {
    name: 'Friction Test Ramp',
    description: 'Compare material friction on inclined surface',
    entities: [
      { material: 'Ghost', shape: 'sphere', x: 100, y: 150, vx: 0, vy: 0, size: 35 },
      { material: 'Helium', shape: 'sphere', x: 150, y: 150, vx: 0, vy: 0, size: 35 },
      { material: 'Rubber', shape: 'sphere', x: 200, y: 150, vx: 0, vy: 0, size: 35 },
      { material: 'Default', shape: 'sphere', x: 250, y: 150, vx: 0, vy: 0, size: 35 },
      { material: 'Titanium', shape: 'sphere', x: 300, y: 150, vx: 0, vy: 0, size: 35 },
      { material: 'Tungsten', shape: 'sphere', x: 350, y: 150, vx: 0, vy: 0, size: 35 }
    ],
    environment: 'EARTH'
  },
  CENTRIFUGE: {
    name: 'Centrifuge Simulator',
    description: 'Rotating platform with centrifugal force',
    entities: [
      { material: 'Plasma', shape: 'singularity', x: 400, y: 300, vx: 0, vy: 0, size: 60 },
      { material: 'Cotton', shape: 'sphere', x: 500, y: 300, vx: 0, vy: 8, size: 30 },
      { material: 'Rubber', shape: 'sphere', x: 300, y: 300, vx: 0, vy: -8, size: 30 },
      { material: 'Glass', shape: 'cube', x: 400, y: 200, vx: 8, vy: 0, size: 30 },
      { material: 'Liquid', shape: 'capsule', x: 400, y: 400, vx: -8, vy: 0, size: 30 },
      { material: 'Titanium', shape: 'cylinder', x: 470, y: 370, vx: 6, vy: 6, size: 25 },
      { material: 'Tungsten', shape: 'pyramid', x: 330, y: 230, vx: -6, vy: -6, size: 25 }
    ],
    environment: 'SPACE'
  },
  LIQUID_FLOW: {
    name: 'Viscous Liquid Flow',
    description: 'High-viscosity material pouring simulation',
    entities: [
      { material: 'Liquid', shape: 'sphere', x: 400, y: 100, vx: 0, vy: 0, size: 25 },
      { material: 'Liquid', shape: 'sphere', x: 420, y: 120, vx: 0, vy: 0, size: 25 },
      { material: 'Liquid', shape: 'sphere', x: 380, y: 120, vx: 0, vy: 0, size: 25 },
      { material: 'Liquid', shape: 'sphere', x: 400, y: 140, vx: 0, vy: 0, size: 25 },
      { material: 'Liquid', shape: 'capsule', x: 410, y: 160, vx: 0, vy: 0, size: 30 },
      { material: 'Liquid', shape: 'capsule', x: 390, y: 160, vx: 0, vy: 0, size: 30 },
      { material: 'Titanium', shape: 'cube', x: 400, y: 500, vx: 0, vy: 0, size: 150 }
    ],
    environment: 'UNDERWATER'
  }
};

export const INTERACTIVE_TUTORIALS = {
  PHYSICS_101: {
    name: 'Physics 101: Gravity',
    description: 'Learn about gravitational forces',
    steps: [
      { action: 'spawn_kinetic_node', args: { material: 'Tungsten', shape: 'sphere' }, delay: 0, message: 'Heavy objects fall faster in atmosphere' },
      { action: 'spawn_kinetic_node', args: { material: 'Helium', shape: 'sphere' }, delay: 2000, message: 'Light objects can float with buoyancy' },
      { action: 'set_tactical_marker', args: { text: 'OBSERVE FALL RATE', type: 'SCAN' }, delay: 4000, message: 'Notice the difference in fall rates' }
    ]
  },
  COLLISION_BASICS: {
    name: 'Collision Mechanics',
    description: 'Understand elastic vs inelastic collisions',
    steps: [
      { action: 'spawn_kinetic_node', args: { material: 'Rubber', shape: 'sphere' }, delay: 0, message: 'Rubber: High elasticity = bouncy' },
      { action: 'spawn_kinetic_node', args: { material: 'Tungsten', shape: 'cube' }, delay: 2000, message: 'Tungsten: Low elasticity = absorbs impact' },
      { action: 'apply_force_field', args: { direction: 'left', strength: 5 }, delay: 4000, message: 'Force applied - watch the bounces!' }
    ]
  },
  BUILDING_STABLE: {
    name: 'Building Stable Structures',
    description: 'Learn to construct stable towers',
    steps: [
      { action: 'create_contraption', args: { type: 'tower', scale: 1 }, delay: 0, message: 'Start with a heavy base (Tungsten)' },
      { action: 'set_tactical_marker', args: { text: 'BASE: HIGH MASS', type: 'DATA' }, delay: 2000, message: 'Heavy base provides stability' },
      { action: 'apply_force_field', args: { direction: 'right', strength: 2 }, delay: 4000, message: 'Test with light lateral force' }
    ]
  },
  ZERO_GRAVITY: {
    name: 'Zero Gravity Mechanics',
    description: 'Explore orbital mechanics in space',
    steps: [
      { action: 'toggle_environment_preset', args: { preset: 'SPACE' }, delay: 0, message: 'Activating zero-gravity environment' },
      { action: 'spawn_kinetic_node', args: { material: 'Plasma', shape: 'singularity' }, delay: 1500, message: 'Central massive body' },
      { action: 'spawn_kinetic_node', args: { material: 'Rubber', shape: 'sphere' }, delay: 3000, message: 'Orbiting satellite - needs tangential velocity' }
    ]
  }
};

export const jarvisTools: FunctionDeclaration[] = [
  {
    name: 'archive_insight',
    description: 'Store a fact into long-term memory lattice.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        fact: { type: Type.STRING }, 
        category: { type: Type.STRING } 
      }, 
      required: ['fact'] 
    }
  },
  {
    name: 'spawn_kinetic_node',
    description: 'Instantiate a holographic kinetic node with specified shape.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        material: { 
          type: Type.STRING, 
          enum: ['Tungsten', 'Rubber', 'Ghost', 'Plasma', 'Default', 'Obsidian', 'Helium', 'Neutronium', 'Glass', 'Liquid', 'Titanium', 'Cotton'] 
        },
        shape: {
          type: Type.STRING,
          enum: ['sphere', 'cube', 'singularity', 'cylinder', 'pyramid', 'torus', 'capsule'],
          description: 'Physical shape of the entity'
        },
        layer: { type: Type.STRING } 
      }, 
      required: ['material'] 
    }
  },
  {
    name: 'place_tactical_marker',
    description: 'Mark a real-world object in the AR view with a digital tag.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        x: { type: Type.NUMBER }, 
        y: { type: Type.NUMBER }, 
        text: { type: Type.STRING }, 
        type: { 
          type: Type.STRING, 
          enum: ['IDENT', 'WARN', 'DATA', 'TARGET', 'SCAN', 'THREAT', 'ALLY', 'OBJECTIVE', 'WAYPOINT', 'INTEL', 'HAZARD'],
          description: 'IDENT: Identify object, WARN: Warning marker, DATA: Data point, TARGET: Enemy/target, SCAN: Scan request, THREAT: Threat level, ALLY: Friendly unit, OBJECTIVE: Mission goal, WAYPOINT: Navigation point, INTEL: Intelligence data, HAZARD: Environmental danger'
        } 
      }, 
      required: ['x', 'y', 'text'] 
    }
  },
  {
    name: 'analyze_physics_state',
    description: 'Analyze current physics simulation state including velocities, collisions, and stress levels.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        metrics: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.STRING, 
            enum: ['velocity', 'stress', 'energy', 'collisions'] 
          } 
        } 
      }, 
      required: ['metrics'] 
    }
  },
  {
    name: 'create_entity_cluster',
    description: 'Spawn multiple connected physics entities in a geometric pattern.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        count: { type: Type.NUMBER, description: 'Number of entities (2-10)' }, 
        pattern: { 
          type: Type.STRING, 
          enum: ['circle', 'grid', 'line', 'spiral', 'random'], 
          description: 'Spatial arrangement pattern' 
        }, 
        material: { 
          type: Type.STRING, 
          enum: ['Tungsten', 'Rubber', 'Ghost', 'Plasma', 'Default', 'Obsidian', 'Helium', 'Neutronium', 'Glass', 'Liquid', 'Titanium', 'Cotton'] 
        }, 
        size: { type: Type.NUMBER, description: 'Entity size in pixels' } 
      }, 
      required: ['count', 'pattern', 'material'] 
    }
  },
  {
    name: 'modify_layer_gravity',
    description: 'Adjust gravity vector for a specific physics layer.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        layer: { type: Type.STRING, description: 'Layer ID' }, 
        gravityX: { type: Type.NUMBER, description: 'Horizontal gravity (-1 to 1)' }, 
        gravityY: { type: Type.NUMBER, description: 'Vertical gravity (-1 to 1)' } 
      }, 
      required: ['layer', 'gravityY'] 
    }
  },
  {
    name: 'capture_telemetry_snapshot',
    description: 'Record current system stats (FPS, entities, memory) for analysis.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        label: { type: Type.STRING, description: 'Snapshot label for reference' } 
      }, 
      required: ['label'] 
    }
  },
  {
    name: 'apply_force_field',
    description: 'Apply a directional force to all entities in the simulation.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        direction: { 
          type: Type.STRING, 
          enum: ['up', 'down', 'left', 'right', 'center', 'radial'], 
          description: 'Force direction' 
        }, 
        strength: { type: Type.NUMBER, description: 'Force magnitude (0-100)' }, 
        duration: { type: Type.NUMBER, description: 'Duration in seconds' } 
      }, 
      required: ['direction', 'strength'] 
    }
  },
  {
    name: 'toggle_time_dilation',
    description: 'Adjust simulation temporal scale for slow-motion or fast-forward effects.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        scale: { 
          type: Type.NUMBER, 
          description: 'Time scale multiplier (0.1 = slow, 1.0 = normal, 2.0 = fast)' 
        } 
      }, 
      required: ['scale'] 
    }
  },
  {
    name: 'create_contraption',
    description: 'Build a complex mechanical structure from multiple entities and constraints.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        type: { 
          type: Type.STRING, 
          enum: ['pendulum', 'catapult', 'tower', 'bridge', 'mobile'], 
          description: 'Contraption type' 
        }, 
        scale: { type: Type.NUMBER, description: 'Overall size scale (0.5-2.0)' } 
      }, 
      required: ['type'] 
    }
  },
  {
    name: 'scan_environment',
    description: 'Analyze the current video feed for objects, colors, and motion patterns.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        focus: { 
          type: Type.STRING, 
          enum: ['objects', 'colors', 'motion', 'faces', 'text', 'comprehensive'], 
          description: 'Analysis focus area' 
        } 
      }, 
      required: ['focus'] 
    }
  },
  {
    name: 'execute_sequence',
    description: 'Queue a series of timed actions to execute in sequence.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        actions: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: 'Array of action descriptions' 
        }, 
        interval: { type: Type.NUMBER, description: 'Seconds between actions' } 
      }, 
      required: ['actions'] 
    }
  },
  {
    name: 'set_environmental_effects',
    description: 'Configure wind, turbulence, and gravity wells for a physics layer.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        layer: { type: Type.STRING, description: 'Layer ID (DEFAULT if omitted)' },
        windX: { type: Type.NUMBER, description: 'Horizontal wind force (-10 to 10)' },
        windY: { type: Type.NUMBER, description: 'Vertical wind force (-10 to 10)' },
        turbulence: { type: Type.NUMBER, description: 'Random chaos level (0-1)' },
        gravityWell: {
          type: Type.OBJECT,
          description: 'Add a point gravity source',
          properties: {
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            strength: { type: Type.NUMBER, description: 'Attraction strength (0-100)' },
            radius: { type: Type.NUMBER, description: 'Effective radius in pixels' }
          }
        }
      },
      required: ['layer']
    }
  },
  {
    name: 'spawn_particle_effect',
    description: 'Create a visual particle effect (sparks, smoke, explosions, trails).',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        x: { type: Type.NUMBER, description: 'X position' },
        y: { type: Type.NUMBER, description: 'Y position' },
        type: {
          type: Type.STRING,
          enum: ['spark', 'smoke', 'explosion', 'trail'],
          description: 'Particle effect type'
        },
        count: { type: Type.NUMBER, description: 'Number of particles (1-50)' },
        color: { type: Type.STRING, description: 'Hex color (e.g., #ff0000)' }
      },
      required: ['x', 'y', 'type']
    }
  },
  {
    name: 'record_simulation',
    description: 'Start/stop recording the current simulation state for playback.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        action: {
          type: Type.STRING,
          enum: ['start', 'stop', 'save', 'clear'],
          description: 'Recording action'
        },
        name: { type: Type.STRING, description: 'Recording name for save' }
      },
      required: ['action']
    }
  },
  {
    name: 'playback_simulation',
    description: 'Load and playback a previously recorded simulation.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { 
        name: { type: Type.STRING, description: 'Recording name to load' },
        speed: { type: Type.NUMBER, description: 'Playback speed multiplier (0.1-5)' }
      },
      required: ['name']
    }
  }
];
