// Types for Titan-OMNI-AI

export interface Theme { 
  accent: string; 
  bg: string; 
  name: string; 
  secondary: string; 
  glow: string; 
  alert: string; 
}

export interface GroundingLink { 
  title?: string; 
  uri: string; 
  type: 'web' | 'maps'; 
  snippet?: string; 
}

export interface Message { 
  role: 'user' | 'jarvis' | 'system'; 
  text: string; 
  links?: GroundingLink[];
  asset?: { url: string; type: 'video' | 'image'; status: string };
  isStreaming?: boolean;
  isError?: boolean;
  diagnostic?: { text: string; detail: string; solution: string };
}

export interface Synapse { 
  id: string; 
  fact: string; 
  timestamp: string; 
  category: 'INTEL' | 'USER_PREF' | 'SYSTEM' | 'THREAT' | 'KINETIC';
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  colorBias: string;
  gravity: { x: number; y: number };
  atmDensity: number;
  viscosity: number;
  wind?: { x: number; y: number }; // Environmental wind force
  turbulence?: number; // Random force magnitude (0-1)
  gravityWells?: Array<{ x: number; y: number; strength: number; radius: number }>; // Point gravity sources
}

export interface EnvironmentBarrier {
  id: number;
  x: number; 
  y: number;
  w: number; 
  h: number;
  label?: string;
}

export interface TacticalMarker {
  id: number;
  x: number; 
  y: number;
  text: string;
  type: 'IDENT' | 'WARN' | 'DATA' | 'TARGET' | 'SCAN' | 'THREAT' | 'ALLY' | 'OBJECTIVE' | 'WAYPOINT' | 'INTEL' | 'HAZARD';
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number; // 0 to 1, decays over time
  color: string;
  type: 'spark' | 'smoke' | 'trail' | 'explosion';
}

export interface SimulationSnapshot {
  timestamp: number;
  entities: PhysicsEntity[];
  markers: TacticalMarker[];
  particles: Particle[];
  layers: Record<string, Layer>;
}

export type Mode = 'pro' | 'flash' | 'thinking';
export type Persona = 'Standard' | 'Tactical' | 'Researcher' | 'Engineer' | 'Navigator' | 'Analyst';
export type VisionFilter = 'normal' | 'thermal' | 'tactical' | 'night' | 'xray' | 'electromagnetic' | 'quantum' | 'infrared';

export interface PhysicsEntity {
  id: number;
  layerId: string;
  type: 'sphere' | 'cube' | 'singularity' | 'cylinder' | 'pyramid' | 'torus' | 'capsule';
  x: number; 
  y: number; 
  z: number;
  vx: number; 
  vy: number; 
  vz: number;
  size: number;
  mass: number;
  elasticity: number;
  friction: number;        
  damping: number;         
  airResistance: number;   
  viscosity: number;       
  tensileStrength: number; 
  buoyancy: number; 
  isDragging?: boolean;
  stress?: number; 
  history: number[]; // Kinetic energy history for charts
}

export type MaterialPreset = 'Tungsten' | 'Rubber' | 'Ghost' | 'Plasma' | 'Default' | 'Obsidian' | 'Helium' | 'Neutronium' | 'Glass' | 'Liquid' | 'Titanium' | 'Cotton';
