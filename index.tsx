
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './src/styles.css';
import {
  GoogleGenAI,
  Modality,
  Type,
  FunctionDeclaration
} from "@google/genai";

// --- Types & Constants ---
interface Theme { accent: string; bg: string; name: string; secondary: string; glow: string; alert: string; }
interface GroundingLink { title?: string; uri: string; type: 'web' | 'maps'; snippet?: string; }
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
}

interface EnvironmentBarrier {
  id: number;
  x: number; y: number;
  w: number; h: number;
  label?: string;
}

interface TacticalMarker {
  id: number;
  x: number; y: number;
  text: string;
  type: 'IDENT' | 'WARN' | 'DATA';
}

type Mode = 'pro' | 'flash' | 'thinking';
type Persona = 'Standard' | 'Tactical' | 'Researcher';
type VisionFilter = 'normal' | 'thermal' | 'tactical' | 'night';

interface PhysicsEntity {
  id: number;
  layerId: string;
  type: 'sphere' | 'cube' | 'singularity';
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
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

type MaterialPreset = 'Tungsten' | 'Rubber' | 'Ghost' | 'Plasma' | 'Default';

const MATERIAL_PRESETS: Record<MaterialPreset, Partial<PhysicsEntity>> = {
  Tungsten: { mass: 5000, elasticity: 0.1, friction: 0.8, airResistance: 0.001, buoyancy: 0.0, tensileStrength: 0.95, viscosity: 0.01 },
  Rubber: { mass: 800, elasticity: 0.95, friction: 0.4, airResistance: 0.01, buoyancy: 0.6, tensileStrength: 0.4, viscosity: 0.05 },
  Ghost: { mass: 10, elasticity: 1.0, friction: 0.0, airResistance: 0.0, buoyancy: 1.2, tensileStrength: 0.1, viscosity: 0.0 },
  Plasma: { mass: 100, elasticity: 0.5, friction: 0.1, airResistance: 0.05, buoyancy: 0.8, tensileStrength: 1.0, viscosity: 0.2 },
  Default: { mass: 1000, elasticity: 0.8, friction: 0.1, airResistance: 0.005, buoyancy: 0.5, tensileStrength: 0.8, viscosity: 0.05 }
};

const STORAGE_KEY = 'jarvis_astra_v25_omega';
const PRESET_THEMES: Record<Persona, Theme> = {
  Standard: { name: 'STARK_GENESIS', accent: '#00e5ff', bg: '#020617', secondary: '#006064', glow: 'rgba(0, 229, 255, 0.4)', alert: '#ff4b2b' },
  Tactical: { name: 'MARK_WAR', accent: '#ff4b2b', bg: '#1a0505', secondary: '#7f0000', glow: 'rgba(255, 75, 43, 0.4)', alert: '#ffea00' },
  Researcher: { name: 'HYDRA_UPLINK', accent: '#39ff14', bg: '#000d00', secondary: '#004d00', glow: 'rgba(57, 255, 20, 0.4)', alert: '#00e5ff' },
};

// --- Utilities ---
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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

// --- Tools ---
const jarvisTools: FunctionDeclaration[] = [
  {
    name: 'archive_insight',
    description: 'Store a fact into long-term memory lattice.',
    parameters: { type: Type.OBJECT, properties: { fact: { type: Type.STRING }, category: { type: Type.STRING } }, required: ['fact'] }
  },
  {
    name: 'spawn_kinetic_node',
    description: 'Instantiate a holographic kinetic node.',
    parameters: { type: Type.OBJECT, properties: { material: { type: Type.STRING, enum: ['Tungsten', 'Rubber', 'Ghost', 'Plasma', 'Default'] }, layer: { type: Type.STRING } }, required: ['material'] }
  },
  {
    name: 'place_tactical_marker',
    description: 'Mark a real-world object in the AR view with a digital tag.',
    parameters: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, text: { type: Type.STRING }, type: { type: Type.STRING, enum: ['IDENT', 'WARN', 'DATA'] } }, required: ['x', 'y', 'text'] }
  }
];

// --- Sub-Components ---

const NeuralLattice = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let points = Array.from({ length: 30 }, () => ({ x: Math.random() * 300, y: Math.random() * 300, vx: (Math.random()-0.5), vy: (Math.random()-0.5) }));
    const frame = () => {
      ctx.clearRect(0,0, 300, 300);
      points.forEach((p, i) => {
        p.x = (p.x + p.vx + 300) % 300; p.y = (p.y + p.vy + 300) % 300;
        points.forEach((p2, j) => {
          if (i === j) return;
          const d = Math.sqrt((p.x-p2.x)**2 + (p.y-p2.y)**2);
          if (d < 50) {
            ctx.strokeStyle = `rgba(0, 229, 255, ${active ? 0.3 : 0.05})`;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
        });
      });
      requestAnimationFrame(frame);
    };
    const req = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(req);
  }, [active]);
  return <canvas ref={canvasRef} width={300} height={300} className="lattice-bg" />;
};

const TelemetryChart = ({ data, label, color }: { data: number[], label: string, color: string }) => (
  <div className="mini-chart">
    <div className="chart-label">{label}</div>
    <div className="chart-bars">
      {data.map((v, i) => (
        <div key={i} className="bar" style={{ height: `${Math.min(100, v)}%`, background: color }} />
      ))}
    </div>
  </div>
);

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
  markers = []
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entitiesRef = useRef<PhysicsEntity[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    entitiesRef.current = entities.map((e: PhysicsEntity) => ({
      ...e,
      stress: e.stress || 0,
      history: e.history || []
    }));
  }, [entities]);

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
            const a = ps[i], b = ps[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (a.size + b.size) / 2;
            if (dist < minDist) {
              const angle = Math.atan2(dy, dx);
              const overlap = minDist - dist;
              const impactVel = Math.sqrt((a.vx - b.vx) ** 2 + (a.vy - b.vy) ** 2);
              a.stress = Math.min(100, (a.stress || 0) + impactVel * (1 - a.tensileStrength));
              b.stress = Math.min(100, (b.stress || 0) + impactVel * (1 - b.tensileStrength));
              const mSum = a.mass + b.mass;
              const ax = (a.vx * (a.mass - b.mass) + (2 * b.mass * b.vx)) / mSum;
              const ay = (a.vy * (a.mass - b.mass) + (2 * b.mass * b.vy)) / mSum;
              const bx = (b.vx * (b.mass - a.mass) + (2 * a.mass * a.vx)) / mSum;
              const by = (b.vy * (b.mass - a.mass) + (2 * a.mass * a.vy)) / mSum;
              a.vx = ax * a.elasticity; a.vy = ay * a.elasticity;
              b.vx = bx * b.elasticity; b.vy = by * b.elasticity;
              a.x -= Math.cos(angle) * overlap / 2; a.y -= Math.sin(angle) * overlap / 2;
              b.x += Math.cos(angle) * overlap / 2; b.y += Math.sin(angle) * overlap / 2;
            }
          }
        }

        ps.forEach((p: PhysicsEntity) => {
          const env = layers[p.layerId] || layers.DEFAULT;
          if (p.isDragging) {
            p.vx = (mouseRef.current.x - p.x) * 0.2;
            p.vy = (mouseRef.current.y - p.y) * 0.2;
          } else {
            p.vx += env.gravity.x * stepSize;
            p.vy += env.gravity.y * stepSize;
            const depth = (p.y / height);
            const bForce = env.atmDensity * (p.size * p.buoyancy) * 0.4 * depth;
            p.vy -= bForce * stepSize;
            const drag = (p.airResistance * env.atmDensity) + (p.viscosity * env.viscosity) + p.damping;
            p.vx *= (1 - drag * stepSize);
            p.vy *= (1 - drag * stepSize);
          }
          p.x += p.vx * stepSize; p.y += p.vy * stepSize;
          p.stress = Math.max(0, (p.stress || 0) * 0.96);

          if (p.y > height) { p.y = height; p.vy *= -p.elasticity; }
          if (p.y < 0) { p.y = 0; p.vy *= -p.elasticity; }
          if (p.x > width) { p.x = width; p.vx *= -p.elasticity; }
          if (p.x < 0) { p.x = 0; p.vx *= -p.elasticity; }

          if (s === 0) {
            const ke = 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy) / 1000;
            p.history = [...p.history.slice(-19), ke];
          }
        });
      }

      ps.forEach((p: PhysicsEntity) => {
        const el = document.getElementById(`pe-${p.id}`);
        const layer = layers[p.layerId] || layers.DEFAULT;
        if (el) {
          const sVal = p.stress || 0;
          const pScale = 0.6 + (p.y / height);
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${pScale})`;
          el.style.borderColor = sVal > 25 ? '#ff4b2b' : (layer.colorBias || accent);
          el.style.boxShadow = `0 0 ${10 + sVal}px ${layer.colorBias || accent}`;
          el.classList.toggle('selected', p.id === selectedEntityId);
        }

        if (showVectors && p.id === selectedEntityId) {
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.strokeStyle = '#39ff14';
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 12, p.y + p.vy * 12);
          ctx.stroke();
        }
      });

      markers.forEach((m: TacticalMarker) => {
        ctx.strokeStyle = '#ff4b2b';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ff4b2b';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(m.text, m.x + 15, m.y + 4);
      });

      requestAnimationFrame(frame);
    };

    frame(); // Start the animation loop
    return () => {}; // No cancellation needed for recursive animation
  }, [accent, layers, selectedEntityId, temporalScale, subSteps, showVectors, markers]);

  return (
    <div className="physics-arena ar-overlay"
      onMouseDown={e => {
        const r = canvasRef.current!.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        let found = false;
        entitiesRef.current.forEach(p => {
          if (Math.sqrt((mx-p.x)**2 + (my-p.y)**2) < p.size + 20) { 
            onDragState(true); onSelectEntity(p.id); found = true;
            (p as any).isDragging = true;
          }
        });
        if (!found) onSelectEntity(null);
      }}
      onMouseUp={() => {
        entitiesRef.current.forEach(p => (p as any).isDragging = false);
        onDragState(false);
      }}
      onMouseMove={e => {
        const r = canvasRef.current!.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      }}
    >
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
      {entities.map((p: any) => (
        <div key={p.id} id={`pe-${p.id}`} className={`p-node ${p.type}`} style={{ width: p.size, height: p.size, borderColor: (layers[p.layerId] || layers.DEFAULT).colorBias }}>
          <div className="p-tag">v: {Math.sqrt(p.vx**2 + p.vy**2).toFixed(1)}</div>
        </div>
      ))}
    </div>
  );
};

const GlassPanel = ({ title, children, className = "", extraHeader }: any) => (
  <div className={`omni-glass ${className}`}>
    <div className="glass-head">
      <div className="orb" />
      <span className="label">{title}</span>
      {extraHeader}
    </div>
    <div className="glass-content">{children}</div>
    <div className="trim tl" /><div className="trim tr" /><div className="trim bl" /><div className="trim br" />
  </div>
);

// --- Fix missing components ---
const BiometricHandshake = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p: number) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="handshake-screen">
      <div className="center-orb">ASTRA</div>
      <div className="load-bar">
        <div className="fill" style={{ width: `${progress}%` }} />
      </div>
      <div style={{ fontSize: '10px', color: 'var(--accent)', opacity: 0.7, letterSpacing: '4px' }}>INITIALIZING_BIOMETRIC_HANDSHAKE...</div>
    </div>
  );
};

const SpectralReactor = ({ active, intensity, accent }: { active: boolean, intensity: number, accent: string }) => (
  <div className="spectral-reactor">
    <div className="reactor-ring" style={{ borderColor: accent }} />
    <div 
      className={`reactor-core ${active ? 'active' : ''}`} 
      style={{ 
        transform: `scale(${0.8 + intensity * 0.4})`,
        backgroundColor: accent,
        boxShadow: active ? `0 0 ${20 * intensity}px ${accent}` : 'none'
      }} 
    />
  </div>
);

// --- Main App ---
const App = () => {
  const [booted, setBooted] = useState(false);
  const [grounding, setGrounding] = useState<GroundingLink[]>([]);
  const [mode, setMode] = useState<Mode>('pro');
  const [persona, setPersona] = useState<Persona>('Standard');
  const [vision, setVision] = useState<VisionFilter>('normal');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const [temporalScale] = useState(1.0); // Remove setter if unused
  const [subSteps] = useState(4); // Remove setter if unused
  const [showVectors] = useState(true); // Remove setter if unused

  const [input, setInput] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
  const [markers, setMarkers] = useState<TacticalMarker[]>([]);
  const [layers, setLayers] = useState<Record<string, Layer>>({
    'DEFAULT': { id: 'DEFAULT', name: 'CORE_FIELD', visible: true, gravity: { x: 0, y: 0.15 }, atmDensity: 1.0, viscosity: 0.1, colorBias: '#00e5ff' }
  });
  const [physics, setPhysics] = useState<PhysicsEntity[]>([
    { id: 1, layerId: 'DEFAULT', type: 'sphere', x: 250, y: 150, z: 0, vx: 2, vy: 0, vz: 0, size: 50, mass: 1000, elasticity: 0.85, friction: 0.05, damping: 0.01, airResistance: 0.005, viscosity: 0.05, tensileStrength: 0.8, buoyancy: 0.5, stress: 0, history: [] }
  ]);

  const cameraRef = useRef<HTMLVideoElement>(null);
  const theme = useMemo(() => PRESET_THEMES[persona], [persona]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => { 
      if (cameraRef.current) cameraRef.current.srcObject = s; 
    }).catch(console.error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(synapses));
  }, [synapses]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--alert', theme.alert);
  }, [theme]);

  const captureFrame = useCallback(() => {
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (cameraRef.current && ctx) ctx.drawImage(cameraRef.current, 0, 0, 640, 480);
    return canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
  }, []);
  const handleTool = async (fc: { name: string; args: any }) => {
    switch (fc.name) {
      case 'archive_insight':
        const nSyn: Synapse = { id: Date.now().toString(), fact: fc.args.fact, category: fc.args.category || 'INTEL', timestamp: new Date().toLocaleTimeString() };
        setSynapses((prev: Synapse[]) => [nSyn, ...prev.slice(0, 15)]);
        return "MEMORY_ENCRYPTED";
      case 'spawn_kinetic_node':
        const mat = (fc.args.material as MaterialPreset) || 'Default';
        const layerId = fc.args.layer || 'DEFAULT';
        const id = Date.now();
        setPhysics((prev: PhysicsEntity[]) => [...prev, {
          id, layerId, type: 'sphere', x: 250, y: 150, z: 0, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, vz: 0, size: 50,
          ...MATERIAL_PRESETS[mat], stress: 0, history: []
        } as PhysicsEntity]);
        setSelectedEntityId(id);
        return "UNIT_INSTANTIATED";
      case 'place_tactical_marker':
        setMarkers((prev: TacticalMarker[]) => [...prev, { id: Date.now(), x: fc.args.x, y: fc.args.y, text: fc.args.text, type: fc.args.type || 'IDENT' }]);
        return "MARKER_STATIONED";
      default: return "ACKNOWLEDGED";
    }
  };
  const processInput = async (txt: string) => {
    if (!txt.trim() || isThinking) return;
    setMessages((prev: Message[]) => [...prev, { role: 'user', text: txt }]);
    setInput(''); setIsThinking(true);

    try {
      if (!process.env.API_KEY) {
        throw new Error('GEMINI_API_KEY not configured. Please set your API key.');
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = mode === 'thinking' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      const config: any = {
        tools: [{ functionDeclarations: jarvisTools }, { googleSearch: {} }],
        systemInstruction: `SOVEREIGN v25 - ASTRA Protocol. Persona: ${persona}. Control AR markers, kinetic nodes, and neural archives. Be efficient and authoritative.`
      };

      const res = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: txt }, { inlineData: { data: captureFrame(), mimeType: 'image/jpeg' } }] },
        config
      });

      const fcParts = res.candidates?.[0]?.content?.parts.filter(p => p.functionCall) || [];
      for (const fc of fcParts) await handleTool(fc.functionCall);

      const links = (res.candidates?.[0]?.groundingMetadata?.groundingChunks || []).map((c: any) => ({
          uri: c.web?.uri || '', title: c.web?.title || '', type: 'web' as const
      })).filter((l: GroundingLink) => !!l.uri);

      const responseText = res.text || "SYSTEM_ACK";
      setMessages((prev: Message[]) => [...prev, { role: 'jarvis', text: responseText, links }]);

      const tts = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: responseText }] }],
        config: { responseModalities: [Modality.AUDIO] }
      });
      const audio = tts.candidates?.[0]?.content?.parts[0]?.inlineData?.data;
      if (audio) {
        const ctx = new AudioContext();
        const buf = await decodeAudioData(decode(audio), ctx, 24000, 1);
        const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
        src.start(); setIsSpeaking(true); src.onended = () => setIsSpeaking(false);
      }
    } catch (e: any) { setMessages((p: Message[]) => [...p, { role: 'system', text: "Lattice error.", isError: true, diagnostic: { text: "ASTRA_ERR", detail: e.message, solution: "Verify uplink project keys." } }]); }
    finally { setIsThinking(false); }
  };
  const updateEntityVal = (id: number, prop: keyof PhysicsEntity, val: any) => {
    setPhysics((prev: PhysicsEntity[]) => prev.map((p: PhysicsEntity) => p.id === id ? { ...p, [prop]: val } : p));
  };

  const activeEntity = useMemo(() => physics.find(p => p.id === selectedEntityId), [physics, selectedEntityId]);

  if (!booted) return <BiometricHandshake onComplete={() => setBooted(true)} />;

  return (
    <div className={`omni-v25 vision-${vision} persona-${persona.toLowerCase()}`}>
      <div className="neural-overlay" />
      
      <header className="hud-top">
        <div className="sys-brand">
          <SpectralReactor active={isSpeaking} intensity={isSpeaking ? 1 : isThinking ? 0.6 : 0.1} accent={theme.accent} />
          <div className="title-stack">
            <h1>TITAN_SOVEREIGN_V25_ASTRA</h1>
            <div className="meta">NEURAL_NODES: {synapses.length} // KINETIC_UNITS: {physics.length} // THREAT_LEVEL: LOW</div>
          </div>
        </div>
        <div className="mode-selector">
          {(['flash', 'pro', 'thinking'] as Mode[]).map(m => (
            <button key={m} className={`mode-btn ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>{m.toUpperCase()}</button>
          ))}
          <div className="persona-cycle">
            {(['Standard', 'Tactical', 'Researcher'] as Persona[]).map(p => (
              <button key={p} className={`p-btn ${persona === p ? 'active' : ''}`} onClick={() => setPersona(p)}>{p[0]}</button>
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
                    <div className="s-meta">{s.timestamp} // {s.category}</div>
                    <div className="s-text">{s.fact}</div>
                  </div>
                ))}
            </div>
          </GlassPanel>

          <GlassPanel title="TELEMETRY_REALTIME">
            {activeEntity ? (
              <div>
                <TelemetryChart data={activeEntity.history.map((v: number) => v * 0.8)} label="STRESS_LOAD (σ)" color={theme.alert} />
                <TelemetryChart data={activeEntity.history} label="KINETIC_ENERGY (kJ)" color={theme.accent} />
              </div>
            ) : (
              <div className="empty">SELECT_NODE_FOR_TELEMETRY</div>
            )}
          </GlassPanel>
        </aside>

        <section className="hud-col center">
            <PhysicsArena
              accent={theme.accent}
              entities={physics}
              layers={layers}
              markers={markers}
              selectedEntityId={selectedEntityId}
              onSelectEntity={setSelectedEntityId}
              temporalScale={temporalScale}
              subSteps={subSteps}
              showVectors={showVectors}
              onDragState={() => {}}
            />
            
            {activeEntity && (
              <div className="entity-inspector">
                <div className="inspector-head">UNIT: {activeEntity.id}</div>
                <div className="inspector-body">
                  <div className="material-picker">
                      {(Object.keys(MATERIAL_PRESETS) as MaterialPreset[]).map((m: MaterialPreset) => (
                        <button key={m} onClick={() => setPhysics((p: PhysicsEntity[]) => p.map((x: PhysicsEntity) => x.id === activeEntity.id ? { ...x, ...MATERIAL_PRESETS[m] } : x))}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className="entity-controls">
                    <input type="range" min="100" max="10000" step="100" value={activeEntity.mass} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEntityVal(activeEntity.id, 'mass', parseFloat(e.target.value))} />
                    <label>MASS ({activeEntity.mass})</label>
                    <button className="del-btn" onClick={() => setPhysics((p: PhysicsEntity[]) => p.filter((x: PhysicsEntity) => x.id !== activeEntity.id))}>DISCHARGE_NODE</button>
                  </div>
                </div>
            )}
            {isThinking && <div className="think-label">ENVIRONMENT_SCANNING...</div>}
            <div className="ar-vignette" />
            <input value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && processInput(input)} placeholder="AWAITING SPATIAL COMMAND..." />
            <div className="prompt">ASTRA{'>'}</div>
          </section>

        <aside className="hud-col right">
          <GlassPanel title="SPATIAL_LAYERS">
            <div className="layer-list">
              {(Object.values(layers) as Layer[]).map((l: Layer) => (
                <div key={l.id} className="layer-item">
                  <div className="layer-row">
                    <span className="l-name">{l.name}</span>
                    <input type="color" value={l.colorBias} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLayers((p: Record<string, Layer>) => ({ ...p, [l.id]: { ...l, colorBias: e.target.value } }))} />
                  </div>
                  <input type="range" min="-0.5" max="0.5" step="0.01" value={l.gravity.y} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLayers((p: Record<string, Layer>) => ({ ...p, [l.id]: { ...l, gravity: { ...l.gravity, y: parseFloat(e.target.value) } } }))} />
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel title="GROUNDING_LINKS">
            {grounding.map((l: GroundingLink, i: number) => (
              <a key={i} href={l.uri} target="_blank" className="grounding-item">
                <span className="g-type">[LINK]</span>
                <span className="g-title">{l.title || l.uri}</span>
              </a>
            ))}
            {grounding.length === 0 && <div className="empty">NO_REMOTE_UPLINK</div>}
          </GlassPanel>
        </aside>
      </main>

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

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
