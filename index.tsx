import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { GoogleGenAI, Modality } from '@google/genai';

// Import modular components
import ErrorBoundary from './src/components/ErrorBoundary';
import TelemetryChart from './src/components/TelemetryChart';
import GlassPanel from './src/components/GlassPanel';
import BiometricHandshake from './src/components/BiometricHandshake';
import SpectralReactor from './src/components/SpectralReactor';

// Import constants and types
import { MaterialPreset } from './src/types';
import {
  PRESET_THEMES,
  MATERIAL_PRESETS,
  ENVIRONMENTAL_PRESETS,
  SAMPLE_SIMULATIONS,
  INTERACTIVE_TUTORIALS,
  jarvisTools,
} from './src/constants';

// --- Types & Constants ---
interface GroundingLink {
  title?: string;
  uri: string;
  type: 'web' | 'maps';
  snippet?: string;
}
interface Message {
  role: 'user' | 'jarvis' | 'system';
  text: string;
  links?: GroundingLink[];
  asset?: { url: string; type: 'video' | 'image'; status: string };
  isStreaming?: boolean;
  isError?: boolean;
  diagnostic?: { text: string; detail: string; solution: string };
}
interface Synapse {
  id: string;
  fact: string;
  timestamp: string;
  category: 'INTEL' | 'USER_PREF' | 'SYSTEM' | 'THREAT' | 'KINETIC';
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  colorBias: string;
  gravity: { x: number; y: number };
  atmDensity: number;
  viscosity: number;
  wind?: { x: number; y: number };
  turbulence?: number;
  gravityWells?: Array<{
    x: number;
    y: number;
    strength: number;
    radius: number;
  }>;
}

interface TacticalMarker {
  id: number;
  x: number;
  y: number;
  text: string;
  type:
    | 'IDENT'
    | 'WARN'
    | 'DATA'
    | 'TARGET'
    | 'SCAN'
    | 'THREAT'
    | 'ALLY'
    | 'OBJECTIVE'
    | 'WAYPOINT'
    | 'INTEL'
    | 'HAZARD';
}

type Mode = 'pro' | 'flash' | 'thinking';
type Persona =
  | 'Standard'
  | 'Tactical'
  | 'Researcher'
  | 'Engineer'
  | 'Navigator'
  | 'Analyst';
type VisionFilter =
  | 'normal'
  | 'thermal'
  | 'tactical'
  | 'night'
  | 'xray'
  | 'electromagnetic'
  | 'quantum'
  | 'infrared';

interface PhysicsEntity {
  id: number;
  layerId: string;
  type:
    | 'sphere'
    | 'cube'
    | 'singularity'
    | 'cylinder'
    | 'pyramid'
    | 'torus'
    | 'capsule';
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
  material: MaterialPreset;
}

const STORAGE_KEY = 'jarvis_astra_v25_omega';

// --- Utilities ---
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++)
    bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Tools imported from src/constants ---

// --- PhysicsArena Component ---

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
  type: 'spark' | 'smoke' | 'trail' | 'explosion';
}

const PhysicsArena = ({
  accent,
  entities,
  onDragState,
  layers,
  selectedEntityId,
  onSelectEntity,
  temporalScale,
  subSteps = 4,
  showVectors = true,
  markers = [],
  particles = [],
}: {
  accent: string;
  entities: PhysicsEntity[];
  onDragState: (dragging: boolean) => void;
  layers: Record<string, Layer>;
  selectedEntityId: number | null;
  onSelectEntity: (id: number | null) => void;
  temporalScale: number;
  subSteps?: number;
  showVectors?: boolean;
  markers?: TacticalMarker[];
  particles?: Particle[];
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entitiesRef = useRef<PhysicsEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    entitiesRef.current = entities.map((e: PhysicsEntity) => ({
      ...e,
      stress: e.stress || 0,
      history: e.history || [],
    }));
  }, [entities]);

  // Resize canvas when container size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const width = canvas.width;
    const height = canvas.height;

    const stepSize = temporalScale / subSteps; // Define stepSize based on temporalScale and subSteps

    const frame = () => {
      ctx.clearRect(0, 0, width, height);

      const ps = entitiesRef.current;

      for (let s = 0; s < subSteps; s++) {
        for (let i = 0; i < ps.length; i++) {
          for (let j = i + 1; j < ps.length; j++) {
            const a = ps[i],
              b = ps[j];
            const dx = b.x - a.x,
              dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (a.size + b.size) / 2;
            if (dist < minDist) {
              const angle = Math.atan2(dy, dx);
              const overlap = minDist - dist;
              const impactVel = Math.sqrt(
                (a.vx - b.vx) ** 2 + (a.vy - b.vy) ** 2,
              );
              a.stress = Math.min(
                100,
                (a.stress || 0) + impactVel * (1 - a.tensileStrength),
              );
              b.stress = Math.min(
                100,
                (b.stress || 0) + impactVel * (1 - b.tensileStrength),
              );
              const mSum = a.mass + b.mass;
              const ax = (a.vx * (a.mass - b.mass) + 2 * b.mass * b.vx) / mSum;
              const ay = (a.vy * (a.mass - b.mass) + 2 * b.mass * b.vy) / mSum;
              const bx = (b.vx * (b.mass - a.mass) + 2 * a.mass * a.vx) / mSum;
              const by = (b.vy * (b.mass - a.mass) + 2 * a.mass * a.vy) / mSum;
              a.vx = ax * a.elasticity;
              a.vy = ay * a.elasticity;
              b.vx = bx * b.elasticity;
              b.vy = by * b.elasticity;
              a.x -= (Math.cos(angle) * overlap) / 2;
              a.y -= (Math.sin(angle) * overlap) / 2;
              b.x += (Math.cos(angle) * overlap) / 2;
              b.y += (Math.sin(angle) * overlap) / 2;
            }
          }
        }

        ps.forEach((p: PhysicsEntity) => {
          const env = layers[p.layerId] || layers.DEFAULT;
          if (p.isDragging) {
            p.vx = (mouseRef.current.x - p.x) * 0.2;
            p.vy = (mouseRef.current.y - p.y) * 0.2;
          } else {
            // Gravity
            p.vx += env.gravity.x * stepSize;
            p.vy += env.gravity.y * stepSize;

            // Buoyancy
            const depth = p.y / height;
            const bForce = env.atmDensity * (p.size * p.buoyancy) * 0.4 * depth;
            p.vy -= bForce * stepSize;

            // Wind
            if (env.wind) {
              p.vx += env.wind.x * stepSize;
              p.vy += env.wind.y * stepSize;
            }

            // Turbulence (random forces)
            if (env.turbulence && env.turbulence > 0) {
              const turbulenceForce = env.turbulence * 20;
              p.vx += (Math.random() - 0.5) * turbulenceForce * stepSize;
              p.vy += (Math.random() - 0.5) * turbulenceForce * stepSize;
            }

            // Gravity Wells (point attractors)
            if (env.gravityWells) {
              env.gravityWells.forEach((well) => {
                const dx = well.x - p.x;
                const dy = well.y - p.y;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq);
                if (dist < well.radius && dist > 0) {
                  const force = (well.strength * p.mass) / (distSq + 1);
                  p.vx += (dx / dist) * force * stepSize;
                  p.vy += (dy / dist) * force * stepSize;
                }
              });
            }

            // Drag
            const drag =
              p.airResistance * env.atmDensity +
              p.viscosity * env.viscosity +
              p.damping;
            p.vx *= 1 - drag * stepSize;
            p.vy *= 1 - drag * stepSize;
          }
          p.x += p.vx * stepSize;
          p.y += p.vy * stepSize;
          p.stress = Math.max(0, (p.stress || 0) * 0.96);

          if (p.y > height) {
            p.y = height;
            p.vy *= -p.elasticity;
          }
          if (p.y < 0) {
            p.y = 0;
            p.vy *= -p.elasticity;
          }
          if (p.x > width) {
            p.x = width;
            p.vx *= -p.elasticity;
          }
          if (p.x < 0) {
            p.x = 0;
            p.vx *= -p.elasticity;
          }

          if (s === 0) {
            const ke = (0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy)) / 1000;
            p.history = [...p.history.slice(-19), ke];
          }
        });
      }

      ps.forEach((p: PhysicsEntity) => {
        const el = document.getElementById(`pe-${p.id}`);
        const layer = layers[p.layerId] || layers.DEFAULT;
        if (el) {
          const sVal = p.stress || 0;
          const pScale = 0.6 + p.y / height;
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${pScale})`;
          el.style.borderColor =
            sVal > 25 ? '#ff4b2b' : layer.colorBias || accent;
          el.style.boxShadow = `0 0 ${10 + sVal}px ${layer.colorBias || accent}`;
          el.classList.toggle('selected', p.id === selectedEntityId);
        }

        if (showVectors && p.id === selectedEntityId) {
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.strokeStyle = '#39ff14';
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 12, p.y + p.vy * 12);
          ctx.stroke();
        }
      });

      markers.forEach((m: TacticalMarker) => {
        // Color mapping for tactical marker types
        const markerColors: Record<string, string> = {
          IDENT: '#00e5ff', // Cyan - identification
          WARN: '#ff9800', // Orange - warning
          DATA: '#2196f3', // Blue - data point
          TARGET: '#ff4b2b', // Red - enemy/target
          SCAN: '#9c27b0', // Purple - scanning
          THREAT: '#d32f2f', // Dark red - high threat
          ALLY: '#4caf50', // Green - friendly
          OBJECTIVE: '#ffc107', // Gold - mission goal
          WAYPOINT: '#03a9f4', // Light blue - navigation
          INTEL: '#ffeb3b', // Yellow - intelligence
          HAZARD: '#ff5722', // Dark orange - hazard
        };

        const color = markerColors[m.type] || '#ff4b2b';
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(m.text, m.x + 15, m.y + 4);
      });

      // Update and render particles
      particlesRef.current = particles
        .filter((p) => p.life > 0)
        .map((p) => {
          // Update particle physics
          p.x += p.vx * stepSize;
          p.y += p.vy * stepSize;
          p.vy += 0.3 * stepSize; // Gravity
          p.life -= 0.01; // Decay

          // Render particle
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;

          if (p.type === 'spark' || p.type === 'trail') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'smoke') {
            const smokeSize = p.size * (1 + (1 - p.life));
            ctx.beginPath();
            ctx.arc(p.x, p.y, smokeSize, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'explosion') {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            const explosionSize = p.size * (1.5 - p.life);
            ctx.arc(p.x, p.y, explosionSize, 0, Math.PI * 2);
            ctx.stroke();
          }

          return p;
        });
      ctx.globalAlpha = 1.0;

      requestAnimationFrame(frame);
    };

    frame(); // Start the animation loop
    return () => {}; // No cancellation needed for recursive animation
  }, [
    accent,
    layers,
    selectedEntityId,
    temporalScale,
    subSteps,
    showVectors,
    markers,
    particles,
  ]);

  return (
    <div
      className="physics-arena ar-overlay"
      onMouseDown={(e) => {
        const r = canvasRef.current!.getBoundingClientRect();
        const mx = e.clientX - r.left,
          my = e.clientY - r.top;
        let found = false;
        entitiesRef.current.forEach((p) => {
          if (Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2) < p.size + 20) {
            onDragState(true);
            onSelectEntity(p.id);
            found = true;
            (p as any).isDragging = true;
          }
        });
        if (!found) onSelectEntity(null);
      }}
      onMouseUp={() => {
        entitiesRef.current.forEach((p) => ((p as any).isDragging = false));
        onDragState(false);
      }}
      onMouseMove={(e) => {
        const r = canvasRef.current!.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      }}
    >
      <canvas ref={canvasRef} className="physics-canvas" />
      {entities.map((p: any) => (
        /* Inline style required for dynamic entity positioning via CSS custom properties */
        <div
          key={p.id}
          id={`pe-${p.id}`}
          className={`p-node ${p.type}`}
          style={
            {
              '--node-x': `${p.x}px`,
              '--node-y': `${p.y}px`,
              '--node-size': `${p.size}px`,
              '--node-border': (layers[p.layerId] || layers.DEFAULT).colorBias,
            } as React.CSSProperties
          }
        >
          <div className="p-tag">
            v: {Math.sqrt(p.vx ** 2 + p.vy ** 2).toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Main App ---
const App = () => {
  console.log('App component initializing...');

  const [booted, setBooted] = useState(false);
  const [grounding] = useState<GroundingLink[]>([]);
  const [mode, setMode] = useState<Mode>('pro');
  const [persona, setPersona] = useState<Persona>('Standard');
  const [vision, setVision] = useState<VisionFilter>('normal');
  const [recording, setRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const [temporalScale, setTemporalScale] = useState(1.0);
  const [subSteps] = useState(4);
  const [showVectors] = useState(true);

  const [input, setInput] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
  const [markers, setMarkers] = useState<TacticalMarker[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [recordedFrames, setRecordedFrames] = useState<any[]>([]);
  const [synapses, setSynapses] = useState<Synapse[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedContraptions, setSavedContraptions] = useState<
    Record<string, PhysicsEntity[]>
  >({});
  const [showPerformance, setShowPerformance] = useState(false);
  const [particleEditor, setParticleEditor] = useState({
    type: 'spark' as 'spark' | 'smoke' | 'trail' | 'explosion',
    color: '#00e5ff',
    count: 30,
  });
  const [tutorialState, setTutorialState] = useState<{
    isRunning: boolean;
    currentTutorial: string | null;
    currentStep: number;
  }>({
    isRunning: false,
    currentTutorial: null,
    currentStep: 0,
  });
  const [entityFilter, setEntityFilter] = useState({
    material: null as MaterialPreset | null,
    shape: null as PhysicsEntity['type'] | null,
    searchTerm: '',
  });
  const [selectedLayerId, setSelectedLayerId] = useState('DEFAULT');
  const [newLayerName, setNewLayerName] = useState('');
  const [layers, setLayers] = useState<Record<string, Layer>>({
    DEFAULT: {
      id: 'DEFAULT',
      name: 'CORE_FIELD',
      visible: true,
      gravity: { x: 0, y: 0.15 },
      atmDensity: 1.0,
      viscosity: 0.1,
      colorBias: '#00e5ff',
    },
  });
  const [physics, setPhysics] = useState<PhysicsEntity[]>([
    {
      id: 1,
      layerId: 'DEFAULT',
      type: 'sphere',
      x: 250,
      y: 150,
      z: 0,
      vx: 2,
      vy: 0,
      vz: 0,
      size: 50,
      mass: 1000,
      elasticity: 0.85,
      friction: 0.05,
      damping: 0.01,
      airResistance: 0.005,
      viscosity: 0.05,
      tensileStrength: 0.8,
      buoyancy: 0.5,
      stress: 0,
      history: [],
      material: 'Default',
    },
  ]);

  const cameraRef = useRef<HTMLVideoElement>(null);
  const theme = useMemo(() => PRESET_THEMES[persona], [persona]);

  const filteredPhysics = useMemo(() => {
    return physics.filter((entity) => {
      const materialMatch =
        !entityFilter.material ||
        entity.material?.toLowerCase() === entityFilter.material.toLowerCase();
      const shapeMatch =
        !entityFilter.shape || entity.type === entityFilter.shape;
      const searchMatch =
        !entityFilter.searchTerm ||
        entity.id.toString().includes(entityFilter.searchTerm) ||
        entity.material
          ?.toLowerCase()
          .includes(entityFilter.searchTerm.toLowerCase()) ||
        entity.type
          .toLowerCase()
          .includes(entityFilter.searchTerm.toLowerCase());
      return materialMatch && shapeMatch && searchMatch;
    });
  }, [physics, entityFilter]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        if (cameraRef.current) cameraRef.current.srcObject = s;
      })
      .catch(console.error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(synapses));
  }, [synapses]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--alert', theme.alert);
  }, [theme]);

  const captureFrame = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (cameraRef.current && ctx)
      ctx.drawImage(cameraRef.current, 0, 0, 640, 480);
    return canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
  }, []);
  const handleTool = async (fc: { name: string; args: any }) => {
    switch (fc.name) {
      case 'archive_insight':
        const nSyn: Synapse = {
          id: Date.now().toString(),
          fact: fc.args.fact,
          category: fc.args.category || 'INTEL',
          timestamp: new Date().toLocaleTimeString(),
        };
        setSynapses((prev: Synapse[]) => [nSyn, ...prev.slice(0, 15)]);
        return 'MEMORY_ENCRYPTED';
      case 'spawn_kinetic_node':
        const mat = (fc.args.material as MaterialPreset) || 'Default';
        const shape = (fc.args.shape as PhysicsEntity['type']) || 'sphere';
        const layerId = fc.args.layer || selectedLayerId;
        const id = Date.now();
        setPhysics((prev: PhysicsEntity[]) => [
          ...prev,
          {
            id,
            layerId,
            type: shape,
            x: 250,
            y: 150,
            z: 0,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            vz: 0,
            size: 50,
            ...MATERIAL_PRESETS[mat],
            stress: 0,
            history: [],
            material: mat,
          } as PhysicsEntity,
        ]);
        setSelectedEntityId(id);
        return `${shape.toUpperCase()}_INSTANTIATED`;
      case 'place_tactical_marker':
        setMarkers((prev: TacticalMarker[]) => [
          ...prev,
          {
            id: Date.now(),
            x: fc.args.x,
            y: fc.args.y,
            text: fc.args.text,
            type: fc.args.type || 'IDENT',
          },
        ]);
        return 'MARKER_STATIONED';

      case 'create_entity_cluster':
        const count = Math.min(fc.args.count || 5, 10);
        const pattern = fc.args.pattern || 'circle';
        const clusterMat = (fc.args.material as MaterialPreset) || 'Default';
        const clusterSize = fc.args.size || 40;
        const centerX = 400;
        const centerY = 300;
        const newEntities: PhysicsEntity[] = [];

        for (let i = 0; i < count; i++) {
          let x = centerX,
            y = centerY;
          if (pattern === 'circle') {
            const angle = (i / count) * Math.PI * 2;
            x = centerX + Math.cos(angle) * 100;
            y = centerY + Math.sin(angle) * 100;
          } else if (pattern === 'grid') {
            const cols = Math.ceil(Math.sqrt(count));
            x = centerX + ((i % cols) - cols / 2) * 80;
            y =
              centerY +
              (Math.floor(i / cols) - Math.floor(count / cols) / 2) * 80;
          } else if (pattern === 'line') {
            x = centerX + (i - count / 2) * 60;
            y = centerY;
          } else if (pattern === 'spiral') {
            const angle = i * 0.5;
            const radius = i * 15;
            x = centerX + Math.cos(angle) * radius;
            y = centerY + Math.sin(angle) * radius;
          } else {
            // random
            x = centerX + (Math.random() - 0.5) * 300;
            y = centerY + (Math.random() - 0.5) * 300;
          }

          newEntities.push({
            id: Date.now() + i,
            layerId: 'DEFAULT',
            type: 'sphere',
            x,
            y,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            size: clusterSize,
            ...MATERIAL_PRESETS[clusterMat],
            stress: 0,
            history: [],
            material: clusterMat,
          } as PhysicsEntity);
        }

        setPhysics((prev: PhysicsEntity[]) => [...prev, ...newEntities]);
        return `CLUSTER_${pattern.toUpperCase()}_SPAWNED`;

      case 'analyze_physics_state':
        const totalEntities = physics.length;
        const avgVelocity =
          physics.reduce(
            (sum, p) => sum + Math.sqrt(p.vx ** 2 + p.vy ** 2),
            0,
          ) / (totalEntities || 1);
        const highStress = physics.filter((p) => (p.stress || 0) > 20).length;
        const totalKE = physics.reduce(
          (sum, p) => sum + 0.5 * p.mass * (p.vx ** 2 + p.vy ** 2),
          0,
        );
        return `ENTITIES:${totalEntities} AVG_VEL:${avgVelocity.toFixed(1)} STRESS:${highStress} KE:${(totalKE / 1000).toFixed(1)}k`;

      case 'modify_layer_gravity':
        const targetLayer = fc.args.layer || 'DEFAULT';
        setLayers((prev: Record<string, Layer>) => ({
          ...prev,
          [targetLayer]: {
            ...(prev[targetLayer] || prev.DEFAULT),
            gravity: {
              x:
                fc.args.gravityX !== undefined
                  ? fc.args.gravityX
                  : prev[targetLayer]?.gravity.x || 0,
              y:
                fc.args.gravityY !== undefined
                  ? fc.args.gravityY
                  : prev[targetLayer]?.gravity.y || 0.15,
            },
          },
        }));
        return `GRAVITY_MODIFIED:${targetLayer}`;

      case 'set_environmental_effects':
        const envLayer = fc.args.layer || 'DEFAULT';
        setLayers((prev: Record<string, Layer>) => ({
          ...prev,
          [envLayer]: {
            ...(prev[envLayer] || prev.DEFAULT),
            wind:
              fc.args.windX !== undefined || fc.args.windY !== undefined
                ? {
                    x: fc.args.windX || 0,
                    y: fc.args.windY || 0,
                  }
                : prev[envLayer]?.wind,
            turbulence:
              fc.args.turbulence !== undefined
                ? fc.args.turbulence
                : prev[envLayer]?.turbulence,
            gravityWells: fc.args.gravityWell
              ? [...(prev[envLayer]?.gravityWells || []), fc.args.gravityWell]
              : prev[envLayer]?.gravityWells,
          },
        }));
        return 'ENVIRONMENT_CONFIGURED';

      case 'toggle_time_dilation':
        const timeScale = Math.max(0.1, Math.min(5, fc.args.scale || 1));
        setTemporalScale(timeScale);
        return `TIME_DILATION:${timeScale}x`;

      case 'spawn_particle_effect':
        const particleType = fc.args.type || 'spark';
        const particleCount = Math.min(fc.args.count || 20, 50);
        const particleColor = fc.args.color || '#00e5ff';
        const newParticles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
          newParticles.push({
            id: Date.now() + i,
            x: fc.args.x,
            y: fc.args.y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 3,
            size: particleType === 'smoke' ? 8 : 3,
            life: 1.0,
            color: particleColor,
            type: particleType as 'spark' | 'smoke' | 'trail' | 'explosion',
          });
        }

        setParticles((prev: Particle[]) => [...prev, ...newParticles]);
        return `${particleType.toUpperCase()}_EFFECT_SPAWNED`;

      case 'record_simulation':
        if (fc.args.action === 'start') {
          setRecording(true);
          setRecordedFrames([]);
          return 'RECORDING_STARTED';
        } else if (fc.args.action === 'stop') {
          setRecording(false);
          return `RECORDING_STOPPED:${recordedFrames.length}_FRAMES`;
        } else if (fc.args.action === 'clear') {
          setRecordedFrames([]);
          return 'RECORDING_CLEARED';
        }
        return 'ACKNOWLEDGED';

      case 'capture_telemetry_snapshot':
        return `SNAPSHOT:${fc.args.label}_CAPTURED`;

      case 'apply_force_field':
        const direction = fc.args.direction || 'down';
        const strength = fc.args.strength || 10;
        const forceEntities = physics.slice();

        forceEntities.forEach((p: PhysicsEntity) => {
          if (direction === 'up') {
            p.vy -= strength;
          } else if (direction === 'down') {
            p.vy += strength;
          } else if (direction === 'left') {
            p.vx -= strength;
          } else if (direction === 'right') {
            p.vx += strength;
          } else if (direction === 'center') {
            const dx = 400 - p.x;
            const dy = 300 - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              p.vx += (dx / dist) * strength;
              p.vy += (dy / dist) * strength;
            }
          } else if (direction === 'radial') {
            const dx = p.x - 400;
            const dy = p.y - 300;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              p.vx += (dx / dist) * strength;
              p.vy += (dy / dist) * strength;
            }
          }
        });

        setPhysics(forceEntities);
        return `FORCE_FIELD_${direction.toUpperCase()}_APPLIED`;

      case 'create_contraption':
        const contraptionType = fc.args.type || 'tower';
        const contraptionScale = fc.args.scale || 1.0;
        const contraptionEntities: PhysicsEntity[] = [];
        const baseId = Date.now();

        if (contraptionType === 'pendulum') {
          // Create pendulum: anchor + chain + bob
          contraptionEntities.push({
            id: baseId,
            layerId: 'DEFAULT',
            type: 'sphere',
            x: 400,
            y: 100,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            size: 20 * contraptionScale,
            ...MATERIAL_PRESETS.Tungsten,
            stress: 0,
            history: [],
            material: 'Tungsten',
          } as PhysicsEntity);
          contraptionEntities.push({
            id: baseId + 1,
            layerId: 'DEFAULT',
            type: 'sphere',
            x: 400,
            y: 250 * contraptionScale,
            z: 0,
            vx: 5,
            vy: 0,
            vz: 0,
            size: 40 * contraptionScale,
            ...MATERIAL_PRESETS.Tungsten,
            stress: 0,
            history: [],
            material: 'Tungsten',
          } as PhysicsEntity);
        } else if (contraptionType === 'catapult') {
          // Create catapult structure
          for (let i = 0; i < 3; i++) {
            contraptionEntities.push({
              id: baseId + i,
              layerId: 'DEFAULT',
              type: 'cube',
              x: 300 + i * 60 * contraptionScale,
              y: 400,
              z: 0,
              vx: 0,
              vy: 0,
              vz: 0,
              size: 50 * contraptionScale,
              ...MATERIAL_PRESETS.Titanium,
              stress: 0,
              history: [],
              material: 'Titanium',
            } as PhysicsEntity);
          }
          contraptionEntities.push({
            id: baseId + 3,
            layerId: 'DEFAULT',
            type: 'sphere',
            x: 360,
            y: 300,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            size: 40 * contraptionScale,
            ...MATERIAL_PRESETS.Rubber,
            stress: 0,
            history: [],
            material: 'Rubber',
          } as PhysicsEntity);
        } else if (contraptionType === 'tower') {
          // Create stable tower
          for (let i = 0; i < 6; i++) {
            const material =
              i < 2 ? 'Tungsten' : i < 4 ? 'Titanium' : 'Default';
            contraptionEntities.push({
              id: baseId + i,
              layerId: 'DEFAULT',
              type: 'cube',
              x: 400,
              y: 500 - i * 60 * contraptionScale,
              z: 0,
              vx: 0,
              vy: 0,
              vz: 0,
              size: 55 * contraptionScale,
              ...MATERIAL_PRESETS[material],
              stress: 0,
              history: [],
              material: material,
            } as PhysicsEntity);
          }
        } else if (contraptionType === 'bridge') {
          // Create bridge structure
          for (let i = 0; i < 5; i++) {
            contraptionEntities.push({
              id: baseId + i,
              layerId: 'DEFAULT',
              type: 'cube',
              x: 200 + i * 80 * contraptionScale,
              y: 300,
              z: 0,
              vx: 0,
              vy: 0,
              vz: 0,
              size: 40 * contraptionScale,
              ...MATERIAL_PRESETS.Titanium,
              stress: 0,
              history: [],
              material: 'Titanium',
            } as PhysicsEntity);
          }
        } else if (contraptionType === 'mobile') {
          // Create hanging mobile
          for (let i = 0; i < 4; i++) {
            contraptionEntities.push({
              id: baseId + i,
              layerId: 'DEFAULT',
              type: 'sphere',
              x: 350 + i * 50 * contraptionScale,
              y: 150 + i * 40 * contraptionScale,
              z: 0,
              vx: (Math.random() - 0.5) * 2,
              vy: 0,
              vz: 0,
              size: 30 * contraptionScale,
              ...MATERIAL_PRESETS.Default,
              stress: 0,
              history: [],
              material: 'Default',
            } as PhysicsEntity);
          }
        }

        setPhysics((prev: PhysicsEntity[]) => [
          ...prev,
          ...contraptionEntities,
        ]);
        return `CONTRAPTION_${contraptionType.toUpperCase()}_ASSEMBLED`;

      case 'scan_environment':
        const focus = fc.args.focus || 'comprehensive';
        const scanResults: string[] = [];

        if (focus === 'objects' || focus === 'comprehensive') {
          scanResults.push(`OBJECTS:${physics.length}_kinetic_nodes`);
          scanResults.push(`MARKERS:${markers.length}_tactical_points`);
        }
        if (focus === 'colors' || focus === 'comprehensive') {
          const uniqueLayers = Object.keys(layers).length;
          scanResults.push(`LAYERS:${uniqueLayers}_color_bias_active`);
        }
        if (focus === 'motion' || focus === 'comprehensive') {
          const movingEntities = physics.filter(
            (p) => Math.abs(p.vx) > 0.5 || Math.abs(p.vy) > 0.5,
          ).length;
          scanResults.push(`MOTION:${movingEntities}_entities_active`);
        }
        if (focus === 'comprehensive') {
          const avgEnergy =
            physics.reduce(
              (sum, p) => sum + 0.5 * p.mass * (p.vx ** 2 + p.vy ** 2),
              0,
            ) / (physics.length || 1);
          scanResults.push(`ENERGY:${(avgEnergy / 1000).toFixed(1)}k_avg`);
        }

        return `SCAN_${focus.toUpperCase()}_COMPLETE: ${scanResults.join(' | ')}`;

      case 'execute_sequence':
        const actions = fc.args.actions || [];
        const interval = fc.args.interval || 1;

        actions.forEach((action: string, index: number) => {
          setTimeout(
            () => {
              setMessages((prev: Message[]) => [
                ...prev,
                {
                  role: 'system',
                  text: `SEQUENCE[${index + 1}/${actions.length}]: ${action}`,
                },
              ]);
            },
            index * interval * 1000,
          );
        });

        return `SEQUENCE_QUEUED:${actions.length}_actions_${interval}s_interval`;

      case 'playback_simulation':
        const recordingName = fc.args.name || 'recording_1';
        const playbackSpeed = fc.args.speed || 1.0;

        if (recordedFrames.length > 0) {
          setTemporalScale(playbackSpeed);
          // Load first frame
          if (recordedFrames[0]?.entities) {
            setPhysics(recordedFrames[0].entities);
          }
          return `PLAYBACK_${recordingName}_STARTED:${recordedFrames.length}_frames_${playbackSpeed}x`;
        } else {
          return `PLAYBACK_ERROR:NO_RECORDING_FOUND`;
        }

      default:
        return 'ACKNOWLEDGED';
    }
  };
  const processInput = async (txt: string) => {
    if (!txt.trim() || isThinking) return;
    setMessages((prev: Message[]) => [...prev, { role: 'user', text: txt }]);
    setInput('');
    setIsThinking(true);

    try {
      if (!process.env.API_KEY) {
        throw new Error(
          'GEMINI_API_KEY not configured. Please set your API key.',
        );
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = mode === 'thinking' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
      const config: any = {
        tools: [{ functionDeclarations: jarvisTools }, { googleSearch: {} }],
        systemInstruction: `SOVEREIGN v25 - ASTRA Protocol. Persona: ${persona}. Control AR markers, kinetic nodes, and neural archives. Be efficient and authoritative.`,
      };

      const res = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { text: txt },
            { inlineData: { data: captureFrame(), mimeType: 'image/jpeg' } },
          ],
        },
        config,
      });

      const fcParts =
        res.candidates?.[0]?.content?.parts?.filter((p) => p.functionCall) ||
        [];
      for (const fc of fcParts) {
        if (fc.functionCall?.name) {
          await handleTool(fc.functionCall as { name: string; args: any });
        }
      }

      const links = (
        res.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      )
        .map((c: any) => ({
          uri: c.web?.uri || '',
          title: c.web?.title || '',
          type: 'web' as const,
        }))
        .filter((l: GroundingLink) => !!l.uri);

      const responseText = res.text || 'SYSTEM_ACK';
      setMessages((prev: Message[]) => [
        ...prev,
        { role: 'jarvis', text: responseText, links },
      ]);

      const tts = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: responseText }] }],
        config: { responseModalities: [Modality.AUDIO] },
      });
      const audio = tts.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audio) {
        const ctx = new AudioContext();
        const buf = await decodeAudioData(decode(audio), ctx, 24000, 1);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start();
        setIsSpeaking(true);
        src.onended = () => setIsSpeaking(false);
      }
    } catch (e: any) {
      setMessages((p: Message[]) => [
        ...p,
        {
          role: 'system',
          text: 'Lattice error.',
          isError: true,
          diagnostic: {
            text: 'ASTRA_ERR',
            detail: e.message,
            solution: 'Verify uplink project keys.',
          },
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };
  const updateEntityVal = (id: number, prop: keyof PhysicsEntity, val: any) => {
    setPhysics((prev: PhysicsEntity[]) =>
      prev.map((p: PhysicsEntity) => (p.id === id ? { ...p, [prop]: val } : p)),
    );
  };

  const loadEnvironmentPreset = (presetName: string) => {
    const preset =
      ENVIRONMENTAL_PRESETS[presetName as keyof typeof ENVIRONMENTAL_PRESETS];
    if (preset) {
      setLayers((prev: Record<string, Layer>) => ({
        ...prev,
        DEFAULT: {
          ...prev.DEFAULT,
          ...preset,
        },
      }));
      setMessages((prev: Message[]) => [
        ...prev,
        {
          role: 'system',
          text: `ENVIRONMENT_LOADED: ${presetName}`,
        },
      ]);
    }
  };

  const loadSampleSimulation = (simulationName: string) => {
    const simulation =
      SAMPLE_SIMULATIONS[simulationName as keyof typeof SAMPLE_SIMULATIONS];
    if (simulation) {
      // Load environment if specified
      if ('environment' in simulation && simulation.environment) {
        loadEnvironmentPreset(simulation.environment);
      }

      // Load entities if available
      if ('entities' in simulation && simulation.entities) {
        const newEntities: PhysicsEntity[] = simulation.entities.map(
          (entity: any, index: number) => ({
            id: Date.now() + index,
            layerId: 'DEFAULT',
            type: entity.shape || 'sphere',
            x: entity.x,
            y: entity.y,
            z: 0,
            vx: entity.vx || 0,
            vy: entity.vy || 0,
            vz: 0,
            size: entity.size || 50,
            mass: 1000,
            elasticity: 0.8,
            friction: 0.1,
            damping: 0.01,
            airResistance: 0.005,
            buoyancy: 0.5,
            tensileStrength: 0.8,
            viscosity: 0.05,
            ...MATERIAL_PRESETS[entity.material as MaterialPreset],
            stress: 0,
            history: [],
            material: entity.material as MaterialPreset,
          }),
        );

        setPhysics(newEntities);
      }

      // Load particles if available
      if ('particles' in simulation && simulation.particles) {
        const newParticles: Particle[] = [];
        simulation.particles.forEach((p: any) => {
          for (let i = 0; i < p.count; i++) {
            newParticles.push({
              id: Date.now() + i,
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 10,
              vy:
                (Math.random() - 0.5) * 10 -
                (particleEditor.type === 'explosion' ? 5 : 3),
              size: particleEditor.type === 'smoke' ? 8 : 3,
              life: 1.0,
              color: particleEditor.color,
              type: particleEditor.type,
            });
          }
        });
        setParticles(newParticles);
      }

      setMessages((prev: Message[]) => [
        ...prev,
        {
          role: 'system',
          text: `SIMULATION_LOADED: ${simulationName} (${simulation.description})`,
        },
      ]);
    }
  };

  const testAllMaterialShapeCombinations = () => {
    const materials = Object.keys(MATERIAL_PRESETS) as MaterialPreset[];
    const shapes: PhysicsEntity['type'][] = [
      'sphere',
      'cube',
      'singularity',
      'cylinder',
      'pyramid',
      'torus',
      'capsule',
    ];
    const testEntities: PhysicsEntity[] = [];
    let id = Date.now();

    // Create a grid of all 84 combinations (12 materials × 7 shapes)
    materials.forEach((material, matIndex) => {
      shapes.forEach((shape, shapeIndex) => {
        testEntities.push({
          id: id++,
          layerId: 'DEFAULT',
          type: shape,
          x: 50 + shapeIndex * 110,
          y: 50 + matIndex * 50,
          z: 0,
          vx: 0,
          vy: 0,
          vz: 0,
          size: 30,
          mass: 1000,
          elasticity: 0.8,
          friction: 0.1,
          damping: 0.01,
          airResistance: 0.005,
          buoyancy: 0.5,
          tensileStrength: 0.8,
          viscosity: 0.05,
          ...MATERIAL_PRESETS[material],
          stress: 0,
          history: [],
          material: material,
        });
      });
    });

    setPhysics(testEntities);
    setMessages((prev: Message[]) => [
      ...prev,
      {
        role: 'system',
        text: `COMPREHENSIVE_TEST: Spawned ${testEntities.length} entities (${materials.length} materials × ${shapes.length} shapes)`,
      },
    ]);

    return testEntities.length;
  };

  /**
   * Saves the current set of physics entities as a named "contraption" in the state.
   * @param {string} name - The name to save the contraption under.
   */
  const saveContraption = (name: string) => {
    if (physics.length > 0) {
      setSavedContraptions((prev) => ({
        ...prev,
        [name]: JSON.parse(JSON.stringify(physics)), // Deep copy
      }));
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          text: `CONTRAPTION_SAVED: "${name}" (${physics.length} entities)`,
        },
      ]);
    }
  };

  /**
   * Loads a previously saved contraption, replacing the current physics entities.
   * @param {string} name - The name of the contraption to load.
   */
  const loadContraption = (name: string) => {
    if (savedContraptions[name]) {
      const loadedEntities = savedContraptions[name].map((e, i) => ({
        ...e,
        id: Date.now() + i, // New IDs to avoid conflicts
        history: [],
      }));
      setPhysics(loadedEntities);
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          text: `CONTRAPTION_LOADED: "${name}" (${loadedEntities.length} entities)`,
        },
      ]);
    }
  };

  /**
   * Exports the entire current simulation state to a JSON file.
   */
  const exportSimulation = () => {
    const exportData = {
      version: 'v25',
      timestamp: new Date().toISOString(),
      entities: physics,
      layers: layers,
      markers: markers,
      synapses: synapses,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `titan-omni-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setMessages((prev) => [
      ...prev,
      {
        role: 'system',
        text: `SIMULATION_EXPORTED: ${physics.length} entities, ${
          Object.keys(layers).length
        } layers`,
      },
    ]);
  };

  /**
   * Imports a simulation state from a user-selected JSON file.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
   */
  const importSimulation = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.entities) setPhysics(importData.entities);
        if (importData.layers) setLayers(importData.layers);
        if (importData.markers) setMarkers(importData.markers);
        if (importData.synapses) setSynapses(importData.synapses);

        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            text: `SIMULATION_IMPORTED: ${
              importData.entities?.length || 0
            } entities loaded`,
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            text: `IMPORT_ERROR: Invalid file format`,
            isError: true,
          },
        ]);
      }
    };
    reader.readAsText(file);
  };

  /**
   * Spawns a particle effect at the center of the arena based on the particle editor settings.
   */
  const spawnParticleEffect = () => {
    const centerX = 400;
    const centerY = 300;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleEditor.count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 10,
        vy:
          (Math.random() - 0.5) * 10 -
          (particleEditor.type === 'explosion' ? 5 : 3),
        size: particleEditor.type === 'smoke' ? 8 : 3,
        life: 1.0,
        color: particleEditor.color,
        type: particleEditor.type,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
    setMessages((prev) => [
      ...prev,
      {
        role: 'system',
        text: `PARTICLE_EFFECT: ${particleEditor.count}x ${particleEditor.type.toUpperCase()} spawned`,
      },
    ]);
  };

  /**
   * Gathers and returns key performance metrics about the current simulation state.
   * @returns {object} An object containing performance metrics.
   */
  const getPerformanceMetrics = () => {
    const activeParticles = particles.filter((p) => p.life > 0.1).length;
    const movingEntities = physics.filter(
      (e) => Math.abs(e.vx) > 0.1 || Math.abs(e.vy) > 0.1,
    ).length;
    const totalEnergy = physics.reduce((sum, e) => {
      const kineticEnergy = 0.5 * e.mass * (e.vx * e.vx + e.vy * e.vy);
      return sum + kineticEnergy;
    }, 0);

    return {
      entities: physics.length,
      movingEntities,
      particles: particles.length,
      activeParticles,
      markers: markers.length,
      layers: Object.keys(layers).length,
      totalEnergy: Math.round(totalEnergy),
      temporalScale,
    };
  };

  /**
   * Starts and runs an interactive tutorial from a predefined set of steps.
   * @param {string} tutorialName - The key of the tutorial to run from INTERACTIVE_TUTORIALS.
   */
  const runTutorial = (tutorialName: string) => {
    const tutorial =
      INTERACTIVE_TUTORIALS[tutorialName as keyof typeof INTERACTIVE_TUTORIALS];
    if (!tutorial) return;

    setTutorialState({
      isRunning: true,
      currentTutorial: tutorialName,
      currentStep: 0,
    });

    setMessages((prev) => [
      ...prev,
      {
        role: 'system',
        text: `TUTORIAL_STARTED: ${tutorial.name}`,
      },
      {
        role: 'system',
        text: tutorial.description,
      },
    ]);

    // Execute tutorial steps sequentially
    tutorial.steps.forEach((step: any, index: number) => {
      setTimeout(() => {
        setTutorialState((prev) => ({
          ...prev,
          currentStep: index + 1,
        }));

        // Display step message
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            text: `[STEP ${index + 1}/${
              tutorial.steps.length
            }] ${step.message}`,
          },
        ]);

        // Execute the action by calling processInput
        processInput(`${step.action} ${JSON.stringify(step.args)}`);

        // If this is the last step, mark tutorial as complete
        if (index === tutorial.steps.length - 1) {
          setTimeout(() => {
            setTutorialState({
              isRunning: false,
              currentTutorial: null,
              currentStep: 0,
            });
            setMessages((prev) => [
              ...prev,
              {
                role: 'system',
                text: `TUTORIAL_COMPLETE: ${tutorial.name}`,
              },
            ]);
          }, 1000);
        }
      }, step.delay);
    });
  };

  /**
   * Stops the currently running interactive tutorial.
   */
  const stopTutorial = () => {
    setTutorialState({
      isRunning: false,
      currentTutorial: null,
      currentStep: 0,
    });
    setMessages((prev) => [
      ...prev,
      {
        role: 'system',
        text: 'TUTORIAL_STOPPED',
      },
    ]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          setRecording((prev) => !prev);
          e.preventDefault();
          break;
        case ' ':
          setTemporalScale((prev) => (prev > 0 ? 0 : 1));
          e.preventDefault();
          break;
        case 'delete':
          if (selectedEntityId !== null) {
            setPhysics((prev) => prev.filter((p) => p.id !== selectedEntityId));
            setSelectedEntityId(null);
          }
          e.preventDefault();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          const visionIndex = parseInt(e.key) - 1;
          const visions: VisionFilter[] = [
            'normal',
            'thermal',
            'tactical',
            'night',
            'xray',
            'electromagnetic',
            'quantum',
            'infrared',
          ];
          if (visionIndex < visions.length) {
            setVision(visions[visionIndex]);
          }
          e.preventDefault();
          break;
        case 's':
          const name = prompt('Enter contraption name:');
          if (name?.trim()) {
            saveContraption(name.trim());
          }
          e.preventDefault();
          break;
        case 'e':
          exportSimulation();
          e.preventDefault();
          break;
        case 'i':
          document.getElementById('import-file-input')?.click();
          e.preventDefault();
          break;
        case 'p':
          setShowPerformance((prev) => !prev);
          e.preventDefault();
          break;
        case '=':
        case '+':
          setTemporalScale((prev) => Math.min(prev + 0.1, 2));
          e.preventDefault();
          break;
        case '-':
        case '_':
          setTemporalScale((prev) => Math.max(prev - 0.1, 0.1));
          e.preventDefault();
          break;
        case 'escape':
          setSelectedEntityId(null);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntityId, saveContraption, exportSimulation]);

  const activeEntity = useMemo(
    () => physics.find((p) => p.id === selectedEntityId),
    [physics, selectedEntityId],
  );

  if (!booted) return <BiometricHandshake onComplete={() => setBooted(true)} />;

  return (
    <div
      className={`omni-v25 vision-${vision} persona-${persona.toLowerCase()}`}
    >
      <div className="neural-overlay" />

      <header className="hud-top">
        <div className="sys-brand">
          <SpectralReactor
            active={isSpeaking}
            intensity={isSpeaking ? 1 : isThinking ? 0.6 : 0.1}
            accent={theme.accent}
          />
          <div className="title-stack">
            <h1>TITAN_SOVEREIGN_V25_ASTRA</h1>
            <div className="meta">
              NEURAL_NODES: {synapses.length} // KINETIC_UNITS: {physics.length}{' '}
              // THREAT_LEVEL: LOW
            </div>
          </div>
        </div>
        <div className="mode-selector">
          {(['flash', 'pro', 'thinking'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`mode-btn ${mode === m ? 'active' : ''}`}
              onClick={() => setMode(m)}
            >
              {m.toUpperCase()}
            </button>
          ))}
          <div className="persona-cycle">
            {(
              [
                'Standard',
                'Tactical',
                'Researcher',
                'Engineer',
                'Navigator',
                'Analyst',
              ] as Persona[]
            ).map((p) => (
              <button
                key={p}
                type="button"
                className={`p-btn ${persona === p ? 'active' : ''}`}
                onClick={() => setPersona(p)}
                title={p}
              >
                {p[0]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="hud-grid">
        <aside className="hud-col left">
          <GlassPanel title="NEURAL_ARCHIVE">
            <div className="archive-wrap">
              {synapses.map((s: Synapse) => (
                <div key={s.id} className="synapse">
                  <div className="s-meta">
                    {s.timestamp} // {s.category}
                  </div>
                  <div className="s-text">{s.fact}</div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel title="SAMPLE_SIMULATIONS">
            <div className="simulation-grid">
              {Object.keys(SAMPLE_SIMULATIONS).map((simName) => (
                <button
                  key={simName}
                  type="button"
                  className="sim-btn"
                  onClick={() => loadSampleSimulation(simName)}
                  title={
                    SAMPLE_SIMULATIONS[
                      simName as keyof typeof SAMPLE_SIMULATIONS
                    ].description
                  }
                >
                  {simName.replace(/_/g, ' ')}
                </button>
              ))}
              <button
                type="button"
                className="sim-btn test-btn"
                onClick={() => testAllMaterialShapeCombinations()}
                title="Test all 84 material/shape combinations"
              >
                🧪 TEST ALL (84)
              </button>
            </div>
          </GlassPanel>

          <GlassPanel title="ENTITY_SEARCH_FILTER">
            <div className="search-filter-controls">
              <input
                type="text"
                placeholder="Search ID, material, shape..."
                className="search-input"
                value={entityFilter.searchTerm}
                onChange={(e) =>
                  setEntityFilter((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
              />
              <div className="filter-row">
                <select
                  className="filter-select"
                  value={entityFilter.material || ''}
                  onChange={(e) =>
                    setEntityFilter((prev) => ({
                      ...prev,
                      material: (e.target.value as MaterialPreset) || null,
                    }))
                  }
                  title="Filter by material"
                >
                  <option value="">All Materials</option>
                  {Object.keys(MATERIAL_PRESETS).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={entityFilter.shape || ''}
                  onChange={(e) =>
                    setEntityFilter((prev) => ({
                      ...prev,
                      shape: (e.target.value as PhysicsEntity['type']) || null,
                    }))
                  }
                  title="Filter by shape"
                >
                  <option value="">All Shapes</option>
                  {[
                    'sphere',
                    'cube',
                    'singularity',
                    'cylinder',
                    'pyramid',
                    'torus',
                    'capsule',
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-results">
                Showing {filteredPhysics.length} / {physics.length} entities
              </div>
            </div>
          </GlassPanel>

          <GlassPanel title="INTERACTIVE_TUTORIALS">
            <div className="tutorial-grid">
              {Object.keys(INTERACTIVE_TUTORIALS).map((tutName) => {
                const tutorial =
                  INTERACTIVE_TUTORIALS[
                    tutName as keyof typeof INTERACTIVE_TUTORIALS
                  ];
                return (
                  <button
                    key={tutName}
                    type="button"
                    className="tutorial-btn"
                    onClick={() => runTutorial(tutName)}
                    disabled={tutorialState.isRunning}
                    title={tutorial.description}
                  >
                    {tutorial.name}
                  </button>
                );
              })}
            </div>
            {tutorialState.isRunning && (
              <div className="tutorial-status">
                <div className="tutorial-progress">
                  STEP {tutorialState.currentStep} /{' '}
                  {INTERACTIVE_TUTORIALS[
                    tutorialState.currentTutorial as keyof typeof INTERACTIVE_TUTORIALS
                  ]?.steps.length || 0}
                </div>
                <button
                  type="button"
                  className="ctrl-btn stop-tutorial-btn"
                  onClick={stopTutorial}
                  title="Stop tutorial"
                >
                  ⏹ STOP
                </button>
              </div>
            )}
          </GlassPanel>

          <GlassPanel title="CONTRAPTION_LIBRARY">
            <div className="contraption-controls">
              <input
                type="text"
                placeholder="New contraption name..."
                className="contraption-input"
                id="contraption-name"
              />
              <button
                type="button"
                className="ctrl-btn save-btn"
                onClick={() => {
                  const input = document.getElementById(
                    'contraption-name',
                  ) as HTMLInputElement;
                  if (input?.value.trim()) {
                    saveContraption(input.value.trim());
                    input.value = '';
                  }
                }}
                title="Save current entities as contraption"
              >
                💾 SAVE
              </button>
            </div>
            <div className="contraption-list">
              {Object.keys(savedContraptions).map((name) => (
                <button
                  key={name}
                  type="button"
                  className="contraption-btn"
                  onClick={() => loadContraption(name)}
                  title={`Load ${name}`}
                >
                  {name} ({savedContraptions[name].length})
                </button>
              ))}
              {Object.keys(savedContraptions).length === 0 && (
                <div className="empty">NO_SAVED_CONTRAPTIONS</div>
              )}
            </div>
          </GlassPanel>

          <GlassPanel title="PARTICLE_EFFECT_EDITOR">
            <div className="particle-editor">
              <label className="editor-label">
                Type:
                <select
                  value={particleEditor.type}
                  onChange={(e) =>
                    setParticleEditor((prev) => ({
                      ...prev,
                      type: e.target.value as any,
                    }))
                  }
                  className="editor-select"
                >
                  <option value="spark">⚡ Spark</option>
                  <option value="explosion">💥 Explosion</option>
                  <option value="smoke">💨 Smoke</option>
                  <option value="trail">✨ Trail</option>
                </select>
              </label>
              <label className="editor-label">
                Color:
                <input
                  type="color"
                  value={particleEditor.color}
                  onChange={(e) =>
                    setParticleEditor((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  className="editor-color"
                />
              </label>
              <label className="editor-label">
                Count: {particleEditor.count}
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={particleEditor.count}
                  onChange={(e) =>
                    setParticleEditor((prev) => ({
                      ...prev,
                      count: parseInt(e.target.value),
                    }))
                  }
                  className="editor-slider"
                />
              </label>
              <button
                type="button"
                className="ctrl-btn spawn-particle-btn"
                onClick={spawnParticleEffect}
                title="Spawn particle effect at center"
              >
                🎆 SPAWN EFFECT
              </button>
            </div>
          </GlassPanel>

          <GlassPanel title="TELEMETRY_REALTIME">
            {activeEntity ? (
              <div>
                <TelemetryChart
                  data={activeEntity.history.map((v: number) => v * 0.8)}
                  label="STRESS_LOAD (σ)"
                  color={theme.alert}
                />
                <TelemetryChart
                  data={activeEntity.history}
                  label="KINETIC_ENERGY (kJ)"
                  color={theme.accent}
                />
              </div>
            ) : (
              <div className="empty">SELECT_NODE_FOR_TELEMETRY</div>
            )}
          </GlassPanel>
        </aside>

        <section className="hud-col center">
          <div className="arena-wrapper">
            <PhysicsArena
              accent={theme.accent}
              entities={filteredPhysics}
              layers={layers}
              markers={markers}
              particles={particles}
              selectedEntityId={selectedEntityId}
              onSelectEntity={setSelectedEntityId}
              temporalScale={temporalScale}
              subSteps={subSteps}
              showVectors={showVectors}
              onDragState={() => {}}
            />
          </div>

          {activeEntity && (
            <div className="entity-inspector">
              <div className="inspector-head">UNIT: {activeEntity.id}</div>
              <div className="inspector-body">
                <div className="material-picker">
                  {(Object.keys(MATERIAL_PRESETS) as MaterialPreset[]).map(
                    (m: MaterialPreset) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() =>
                          setPhysics((p: PhysicsEntity[]) =>
                            p.map((x: PhysicsEntity) =>
                              x.id === activeEntity.id
                                ? { ...x, ...MATERIAL_PRESETS[m] }
                                : x,
                            ),
                          )
                        }
                      >
                        {m}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="entity-controls">
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={activeEntity.mass}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateEntityVal(
                      activeEntity.id,
                      'mass',
                      parseFloat(e.target.value),
                    )
                  }
                  aria-label="Entity mass control"
                  title="Adjust entity mass"
                />
                <label>MASS ({activeEntity.mass})</label>
                <button
                  type="button"
                  className="del-btn"
                  onClick={() =>
                    setPhysics((p: PhysicsEntity[]) =>
                      p.filter((x: PhysicsEntity) => x.id !== activeEntity.id),
                    )
                  }
                >
                  DISCHARGE_NODE
                </button>
              </div>
            </div>
          )}
          {isThinking && (
            <div className="think-label">ENVIRONMENT_SCANNING...</div>
          )}
          <div className="input-strip">
            <div className="prompt">ASTRA{'>'}</div>
            <input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInput(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === 'Enter' && processInput(input)
              }
              placeholder="AWAITING SPATIAL COMMAND..."
            />
          </div>
        </section>

        <aside className="hud-col right">
          <GlassPanel title="SPATIAL_LAYERS">
            <div className="layer-controls">
              <input
                type="text"
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                placeholder="New layer name..."
                className="layer-input"
              />
              <button
                type="button"
                className="ctrl-btn add-layer-btn"
                onClick={() => {
                  if (newLayerName.trim()) {
                    const newId = `LAYER_${Date.now()}`;
                    setLayers((prev) => ({
                      ...prev,
                      [newId]: {
                        ...prev.DEFAULT,
                        id: newId,
                        name: newLayerName.trim().toUpperCase(),
                        colorBias: `#${Math.floor(
                          Math.random() * 16777215,
                        ).toString(16)}`,
                      },
                    }));
                    setNewLayerName('');
                  }
                }}
                title="Add a new spatial layer"
              >
                + ADD
              </button>
            </div>
            <div className="layer-list">
              {(Object.values(layers) as Layer[]).map((l: Layer) => (
                <div
                  key={l.id}
                  className={`layer-item ${
                    selectedLayerId === l.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedLayerId(l.id)}
                >
                  <div className="layer-row">
                    <span className="l-name">{l.name}</span>
                    <input
                      type="color"
                      value={l.colorBias}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLayers((p: Record<string, Layer>) => ({
                          ...p,
                          [l.id]: { ...l, colorBias: e.target.value },
                        }))
                      }
                      aria-label={`${l.name} color bias`}
                      title={`Adjust ${l.name} color`}
                    />
                    {l.id !== 'DEFAULT' && (
                      <button
                        type="button"
                        className="del-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newLayers = { ...layers };
                          delete newLayers[l.id];
                          setLayers(newLayers);
                          if (selectedLayerId === l.id) {
                            setSelectedLayerId('DEFAULT');
                          }
                        }}
                        title={`Delete layer ${l.name}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <input
                    type="range"
                    min="-0.5"
                    max="0.5"
                    step="0.01"
                    value={l.gravity.y}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLayers((p: Record<string, Layer>) => ({
                        ...p,
                        [l.id]: {
                          ...l,
                          gravity: {
                            ...l.gravity,
                            y: parseFloat(e.target.value),
                          },
                        },
                      }))
                    }
                    aria-label={`${l.name} gravity`}
                    title={`Adjust ${l.name} gravity`}
                  />
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel title="ENVIRONMENT_PRESETS">
            <div className="preset-grid">
              {Object.keys(ENVIRONMENTAL_PRESETS).map((presetName) => (
                <button
                  key={presetName}
                  type="button"
                  className="preset-btn"
                  onClick={() => loadEnvironmentPreset(presetName)}
                  title={`Load ${presetName} environment`}
                >
                  {presetName}
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel title="GROUNDING_LINKS">
            {grounding.map((l: GroundingLink, i: number) => (
              <a
                key={i}
                href={l.uri}
                target="_blank"
                className="grounding-item"
              >
                <span className="g-type">[LINK]</span>
                <span className="g-title">{l.title || l.uri}</span>
              </a>
            ))}
            {grounding.length === 0 && (
              <div className="empty">NO_REMOTE_UPLINK</div>
            )}
          </GlassPanel>

          <GlassPanel title="VISION_FILTERS">
            <div className="vision-grid">
              {(
                [
                  'normal',
                  'thermal',
                  'tactical',
                  'night',
                  'xray',
                  'electromagnetic',
                  'quantum',
                  'infrared',
                ] as VisionFilter[]
              ).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`vision-btn ${vision === v ? 'active' : ''}`}
                  onClick={() => setVision(v)}
                  title={`Switch to ${v} vision`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel title="RECORDING_CONTROLS">
            <div className="recording-controls">
              <div className="rec-status">
                {recording ? (
                  <span className="rec-active">
                    ⏺ RECORDING ({recordedFrames.length} frames)
                  </span>
                ) : (
                  <span className="rec-idle">
                    ⏹ STANDBY ({recordedFrames.length} frames)
                  </span>
                )}
              </div>
              <div className="rec-buttons">
                <button
                  type="button"
                  className={`ctrl-btn rec-btn ${recording ? 'active' : ''}`}
                  onClick={() => {
                    setRecording(!recording);
                    if (!recording) {
                      setRecordedFrames([]);
                    }
                  }}
                  title={recording ? 'Stop recording' : 'Start recording'}
                >
                  {recording ? '⏹ STOP' : '⏺ REC'}
                </button>
                <button
                  type="button"
                  className="ctrl-btn"
                  onClick={() => {
                    if (
                      recordedFrames.length > 0 &&
                      recordedFrames[0]?.entities
                    ) {
                      setPhysics(recordedFrames[0].entities);
                    }
                  }}
                  disabled={recordedFrames.length === 0}
                  title="Play recording"
                >
                  ▶ PLAY
                </button>
                <button
                  type="button"
                  className="ctrl-btn"
                  onClick={() => setRecordedFrames([])}
                  disabled={recordedFrames.length === 0}
                  title="Clear recording"
                >
                  🗑 CLEAR
                </button>
              </div>
            </div>
            {recordedFrames.length > 0 && !recording && (
              <div className="timeline-scrubber">
                <label>TIMELINE</label>
                <input
                  type="range"
                  min="0"
                  max={recordedFrames.length - 1}
                  defaultValue="0"
                  onChange={(e) => {
                    const frameIndex = parseInt(e.target.value);
                    if (recordedFrames[frameIndex]?.entities) {
                      setPhysics(recordedFrames[frameIndex].entities);
                    }
                  }}
                  title="Scrub through recorded frames"
                />
              </div>
            )}
          </GlassPanel>

          <GlassPanel title="EXPORT_IMPORT">
            <div className="export-controls">
              <button
                type="button"
                className="ctrl-btn export-btn"
                onClick={exportSimulation}
                disabled={physics.length === 0}
                title="Export simulation to JSON file"
              >
                💾 EXPORT
              </button>
              <label className="ctrl-btn import-btn">
                📁 IMPORT
                <input
                  id="import-file-input"
                  type="file"
                  accept=".json"
                  onChange={importSimulation}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </GlassPanel>

          <GlassPanel title="SPATIAL_LAYERS">
            <div className="layer-list">
              {(Object.values(layers) as Layer[]).map((l: Layer) => (
                <div key={l.id} className="layer-item">
                  <div className="layer-row">
                    <span className="l-name">{l.name}</span>
                    <input
                      type="color"
                      value={l.colorBias}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLayers((p: Record<string, Layer>) => ({
                          ...p,
                          [l.id]: { ...l, colorBias: e.target.value },
                        }))
                      }
                      aria-label={`${l.name} color bias`}
                      title={`Adjust ${l.name} color`}
                    />
                  </div>
                  <input
                    type="range"
                    min="-0.5"
                    max="0.5"
                    step="0.01"
                    value={l.gravity.y}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLayers((p: Record<string, Layer>) => ({
                        ...p,
                        [l.id]: {
                          ...l,
                          gravity: {
                            ...l.gravity,
                            y: parseFloat(e.target.value),
                          },
                        },
                      }))
                    }
                    aria-label={`${l.name} gravity`}
                    title={`Adjust ${l.name} gravity`}
                  />
                </div>
              ))}
            </div>
          </GlassPanel>
        </aside>
      </main>

      {showPerformance && (
        <div className="performance-dashboard">
          <div className="perf-header">
            <span>PERFORMANCE METRICS</span>
            <button
              type="button"
              className="perf-close"
              onClick={() => setShowPerformance(false)}
            >
              ✕
            </button>
          </div>
          {(() => {
            const metrics = getPerformanceMetrics();
            return (
              <div className="perf-grid">
                <div className="perf-item">
                  <span className="perf-label">Entities:</span>
                  <span className="perf-value">{metrics.entities}</span>
                </div>
                <div className="perf-item">
                  <span className="perf-label">Moving:</span>
                  <span className="perf-value">{metrics.movingEntities}</span>
                </div>
                <div className="perf-item">
                  <span className="perf-label">Particles:</span>
                  <span className="perf-value">{metrics.particles}</span>
                </div>
                <div className="perf-item">
                  <span className="perf-label">Active Particles:</span>
                  <span className="perf-value">{metrics.activeParticles}</span>
                </div>
                <div className="perf-item">
                  <span className="perf-label">Markers:</span>
                  <span className="perf-value">{metrics.markers}</span>
                </div>
                <div className="perf-item">
                  <span className="perf-label">Layers:</span>
                  <span className="perf-value">{metrics.layers}</span>
                </div>
                <div className="perf-item">
                  <span className="perf-label">Total Energy:</span>
                  <span className="perf-value">{metrics.totalEnergy} kJ</span>
                </div>
                <div className="perf-item">
                  <span className="perf-label">Time Scale:</span>
                  <span className="perf-value">
                    {metrics.temporalScale.toFixed(2)}x
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <button
        type="button"
        className="perf-toggle"
        onClick={() => setShowPerformance(!showPerformance)}
        title={showPerformance ? 'Hide metrics' : 'Show metrics'}
      >
        📊
      </button>

      <div className="telemetry-box">
        {messages.map((m: Message, i: number) => (
          <div key={i} className={`entry ${m.role}`}>
            <div className="entry-head">{m.role.toUpperCase()}</div>
            <div className="entry-content">{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Store root instance to avoid recreating on HMR
let root: ReturnType<typeof createRoot> | null = null;

const container = document.getElementById('root');
if (container) {
  try {
    console.log('Initializing Titan-OMNI-AI...');

    // Only create root once, reuse on HMR reloads
    if (!root) {
      root = createRoot(container);
    }

    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
    );
    console.log('App rendered successfully');
  } catch (error: any) {
    console.error('Failed to render app:', error);
    container.innerHTML = `
      <div style="color: red; padding: 20px; background: black; font-family: monospace;">
        <h2>TITAN-OMNI-AI ERROR</h2>
        <p>Failed to initialize: ${error.message}</p>
        <p>Check console for details</p>
      </div>
    `;
  }
} else {
  console.error('Root element not found');
}
