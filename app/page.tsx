"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sparkles as ThreeSparkles, Stars } from "@react-three/drei";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Code2,
  Contact,
  MousePointer2,
  Sparkles,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Project = {
  name: string;
  eyebrow: string;
  description: string;
  stack: string[];
  color: string;
  accent: string;
  position: [number, number, number];
  size: number;
  url: string;
};

type GameMode = "orbit" | "garden" | "kitchen";

const projects: Project[] = [
  {
    name: "Qiskit RAG",
    eyebrow: "QUANTUM × AI",
    description:
      "A migration assistant that combines release notes, vector search and LLMs to refactor legacy Qiskit code.",
    stack: ["Qiskit", "n8n", "Qdrant", "LLMs"],
    color: "#6d5dfc",
    accent: "#a99eff",
    position: [-5.8, 1.5, -1.5],
    size: 1.25,
    url: "https://github.com/igna-s/Qiskit-RAG-Migration-Assistant",
  },
  {
    name: "Realtime AI Avatar",
    eyebrow: "LIVE AI",
    description:
      "A voice-first 3D assistant powered by Gemini, with a customizable VRM avatar, memory and low-latency interaction.",
    stack: ["Gemini", "VRM", "Voice", "Realtime"],
    color: "#ff4f9a",
    accent: "#ff9ec7",
    position: [-2.8, -1.65, 0],
    size: 1.05,
    url: "https://github.com/igna-s/Realtime_Avatar_AI_Companion",
  },
  {
    name: "AI Video Pipeline",
    eyebrow: "GENERATIVE MEDIA",
    description:
      "A local pipeline that turns an idea into video, audio, subtitles, music and a talking-head avatar.",
    stack: ["Local AI", "Video", "Audio", "Python"],
    color: "#ff8a3d",
    accent: "#ffc27d",
    position: [0.9, 2.05, -0.6],
    size: 1.08,
    url: "https://github.com/igna-s/AI-Video-Generation-Pipeline",
  },
  {
    name: "Unity VR Simulation",
    eyebrow: "IMMERSIVE SYSTEMS",
    description:
      "An interactive virtual-reality environment built in Unity and C# for the LIDI at UNLP.",
    stack: ["Unity", "C#", "VR", "ShaderLab"],
    color: "#24c8bc",
    accent: "#8af5e9",
    position: [4.35, 0.35, -1.15],
    size: 1.2,
    url: "https://github.com/igna-s/Unity-VR-Simulation-2024",
  },
  {
    name: "Michigrad Engine",
    eyebrow: "AI FROM SCRATCH",
    description:
      "A scalar autograd engine and LLM fundamentals built from scratch to expose what happens beneath deep-learning frameworks.",
    stack: ["Python", "Autograd", "Backprop", "LLMs"],
    color: "#c9ff4a",
    accent: "#edffae",
    position: [6.2, -2.25, -2.2],
    size: 0.92,
    url: "https://github.com/igna-s/Michigrad-Deep-Learning-From-Scratch",
  },
];

const gardenProjects: Project[] = [
  {
    name: "Embedded Security CIAA",
    eyebrow: "REAL-TIME EMBEDDED",
    description: "A real-time security system for the EDU-CIAA ARM Cortex-M4, built with interrupts, GPIO control and finite-state logic in C.",
    stack: ["C", "ARM", "FSM", "GPIO"],
    color: "#70e278",
    accent: "#c6ff89",
    position: [-4.5, -1.4, 0],
    size: 1,
    url: "https://github.com/igna-s/Embedded-Security-System-CIAA",
  },
  {
    name: "Multitouch Surface",
    eyebrow: "IOT × HARDWARE",
    description: "A low-cost interactive surface using an ESP8266 and HX711 load cells to visualize pressure in real time.",
    stack: ["ESP8266", "HX711", "IoT", "Sensors"],
    color: "#3ed7b9",
    accent: "#9effe9",
    position: [-1.45, -1.4, 0],
    size: 1,
    url: "https://github.com/igna-s?tab=repositories&q=HX711",
  },
  {
    name: "ICPC Regional 2025",
    eyebrow: "COMPETITIVE PROGRAMMING",
    description: "Algorithms and solutions from the ICPC South America South Regionals: graphs, dynamic programming and data structures in C++.",
    stack: ["C++", "Graphs", "DP", "ICPC"],
    color: "#f1c653",
    accent: "#fff0a3",
    position: [1.65, -1.4, 0],
    size: 1,
    url: "https://github.com/igna-s/ICPC-Regional-Finals-2025",
  },
  {
    name: "UNLP Coursework",
    eyebrow: "COMPUTER ENGINEERING",
    description: "A living archive of assignments, laboratories and notes from the Computer Engineering degree at UNLP.",
    stack: ["UNLP", "C", "Systems", "Labs"],
    color: "#8f9dff",
    accent: "#cbd0ff",
    position: [4.7, -1.4, 0],
    size: 1,
    url: "https://github.com/igna-s/University-Coursework-Archive",
  },
];

const kitchenProjects: Project[] = [
  {
    name: "VaultMind AI",
    eyebrow: "FULL-STACK AI AGENT",
    description: "A banking RAG platform with a LangGraph research agent, FastAPI, React and PostgreSQL with pgvector.",
    stack: ["LangGraph", "FastAPI", "React", "pgvector"],
    color: "#f55669",
    accent: "#ffa0ad",
    position: [-4.4, 0.25, 0],
    size: 1,
    url: "https://github.com/igna-s/VaultMind-AI-RAG-Banking-Agent",
  },
  {
    name: "Qiskit Migration RAG",
    eyebrow: "QUANTUM RECIPE",
    description: "Official documentation, embeddings, vector retrieval and LLM agents combined to migrate quantum code.",
    stack: ["Qiskit", "Qdrant", "n8n", "Ollama"],
    color: "#836fff",
    accent: "#c0b6ff",
    position: [-1.7, 2.4, 0],
    size: 1,
    url: "https://github.com/igna-s/Qiskit-RAG-Migration-Assistant",
  },
  {
    name: "Meridian AI Agent",
    eyebrow: "AMD HACKATHON",
    description: "An AI-first project-management platform with a serverless React architecture and AMD MI300X inference.",
    stack: ["React", "Agents", "MI300X", "Serverless"],
    color: "#ff9d45",
    accent: "#ffd49a",
    position: [1.7, 2.4, 0],
    size: 1,
    url: "https://github.com/igna-s/Meridian-Ai-Agent",
  },
  {
    name: "Google MLSys Track",
    eyebrow: "SYSTEMS OPTIMIZATION",
    description: "A C++ competition submission focused on scheduling and optimization problems for machine-learning systems.",
    stack: ["C++", "MLSys", "Scheduling", "Optimization"],
    color: "#39d9ce",
    accent: "#a6fff8",
    position: [4.4, 0.25, 0],
    size: 1,
    url: "https://github.com/igna-s/MLSys",
  },
];

function Planet({
  project,
  index,
  selected,
  onSelect,
}: {
  project: Project;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const planet = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (planet.current) planet.current.rotation.y += delta * (0.18 + index * 0.035);
    if (group.current) {
      group.current.position.y =
        project.position[1] + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.12;
      const target = selected ? 1.13 : 1;
      group.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
    }
  });

  return (
    <group ref={group} position={project.position}>
      <Float speed={1.5 + index * 0.15} rotationIntensity={0.12} floatIntensity={0.12}>
        <mesh
          ref={planet}
          onPointerDown={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
          castShadow
        >
          <icosahedronGeometry args={[project.size, index % 2 ? 5 : 3]} />
          <meshStandardMaterial
            color={project.color}
            roughness={0.58}
            metalness={0.1}
            emissive={project.color}
            emissiveIntensity={selected ? 0.32 : 0.09}
          />
        </mesh>

        {index % 2 === 0 && (
          <mesh rotation={[Math.PI / 2.5, 0.25, 0]}>
            <torusGeometry args={[project.size * 1.42, 0.045, 12, 96]} />
            <meshBasicMaterial color={project.accent} transparent opacity={0.7} />
          </mesh>
        )}

        <mesh scale={selected ? 1.55 : 1.34}>
          <sphereGeometry args={[project.size, 28, 28]} />
          <meshBasicMaterial
            color={project.accent}
            transparent
            opacity={selected ? 0.12 : 0.035}
            side={THREE.BackSide}
          />
        </mesh>

        {selected && (
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -project.size * 1.42, 0]}>
            <ringGeometry args={[project.size * 0.55, project.size * 0.72, 48]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.82} side={THREE.DoubleSide} />
          </mesh>
        )}
      </Float>
    </group>
  );
}

function Racer({ target }: { target: Project }) {
  const ship = useRef<THREE.Group>(null);
  const current = useRef(new THREE.Vector3(-7.4, -3, 2));
  const destination = useMemo(
    () => new THREE.Vector3(target.position[0] - 1.15, target.position[1] - 1.15, 1.2),
    [target],
  );

  useFrame((state) => {
    if (!ship.current) return;
    current.current.lerp(destination, 0.035);
    ship.current.position.copy(current.current);
    ship.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.08 - 0.2;
    ship.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.08;
  });

  return (
    <group ref={ship} scale={0.48}>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.65, 2.35, 5]} />
        <meshStandardMaterial color="#eef1ff" metalness={0.72} roughness={0.2} />
      </mesh>
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.29, 0.82, 18]} />
        <meshBasicMaterial color="#7cffdf" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.1, 0.42, 0]} rotation={[0, 0, -0.42]}>
        <boxGeometry args={[0.9, 0.12, 0.95]} />
        <meshStandardMaterial color="#8b7cff" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0.1, -0.42, 0]} rotation={[0, 0, 0.42]}>
        <boxGeometry args={[0.9, 0.12, 0.95]} />
        <meshStandardMaterial color="#8b7cff" metalness={0.55} roughness={0.3} />
      </mesh>
    </group>
  );
}

function OrbitScene({ selected, onSelect }: { selected: number; onSelect: (index: number) => void }) {
  const route = useMemo(
    () => projects.map((project) => new THREE.Vector3(...project.position)),
    [],
  );

  return (
    <Canvas camera={{ position: [0, 0.15, 12], fov: 49 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={["#060613"]} />
      <fog attach="fog" args={["#060613", 13, 26]} />
      <ambientLight intensity={0.8} color="#9ba6ff" />
      <directionalLight position={[5, 7, 8]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-6, -2, 5]} intensity={38} distance={18} color="#795cff" />
      <pointLight position={[6, 3, 3]} intensity={28} distance={15} color="#38e8ca" />
      <Stars radius={80} depth={30} count={1400} factor={2.4} saturation={0.35} fade speed={0.35} />
      <Line points={route} color="#8e82ff" lineWidth={1.5} transparent opacity={0.34} dashed dashSize={0.22} gapSize={0.16} />
      {projects.map((project, index) => (
        <Planet key={project.name} project={project} index={index} selected={selected === index} onSelect={() => onSelect(index)} />
      ))}
      <Racer target={projects[selected]} />
    </Canvas>
  );
}

function PlantStation({
  project,
  index,
  selected,
  grown,
  onActivate,
}: {
  project: Project;
  index: number;
  selected: boolean;
  grown: boolean;
  onActivate: () => void;
}) {
  const plant = useRef<THREE.Group>(null);
  const growth = useRef(grown ? 1 : 0.08);

  useFrame((state) => {
    growth.current = THREE.MathUtils.lerp(growth.current, grown ? 1 : 0.08, 0.04);
    if (plant.current) {
      plant.current.scale.y = growth.current;
      plant.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.3 + index) * 0.035;
    }
  });

  return (
    <group position={project.position}>
      <mesh
        onPointerDown={(event) => {
          event.stopPropagation();
          onActivate();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "default")}
      >
        <cylinderGeometry args={[0.78, 0.58, 1.15, 12]} />
        <meshStandardMaterial color={selected ? project.color : "#384d45"} roughness={0.74} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <torusGeometry args={[0.7, 0.13, 8, 32]} />
        <meshStandardMaterial color={project.accent} roughness={0.55} />
      </mesh>
      <group ref={plant} position={[0, 0.52, 0]}>
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.075, 0.11, 2.2, 8]} />
          <meshStandardMaterial color="#6fdc79" roughness={0.62} />
        </mesh>
        {[-1, 1].map((side, leaf) => (
          <mesh key={side} position={[side * 0.45, 0.8 + leaf * 0.75, 0]} rotation={[0, 0, side * 0.58]} scale={[0.58, 0.2, 0.38]}>
            <sphereGeometry args={[1, 18, 14]} />
            <meshStandardMaterial color={leaf ? project.color : "#58c86a"} roughness={0.6} />
          </mesh>
        ))}
        <Float speed={2.2} rotationIntensity={0.5} floatIntensity={0.22}>
          <mesh position={[0, 2.25, 0]}>
            <octahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial color={project.accent} emissive={project.color} emissiveIntensity={0.35} roughness={0.35} />
          </mesh>
        </Float>
      </group>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.59, 0]}>
          <ringGeometry args={[0.95, 1.08, 42]} />
          <meshBasicMaterial color={project.accent} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function GreenhouseScene({
  selected,
  grown,
  onActivate,
}: {
  selected: number;
  grown: Set<number>;
  onActivate: (index: number) => void;
}) {
  return (
    <Canvas camera={{ position: [0, 4.2, 11.5], fov: 48 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
      <color attach="background" args={["#06130f"]} />
      <fog attach="fog" args={["#06130f", 12, 24]} />
      <ambientLight intensity={1.15} color="#9cebbd" />
      <directionalLight position={[-5, 9, 7]} intensity={2.7} color="#eaffcf" />
      <pointLight position={[5, 3, 5]} intensity={32} distance={16} color="#48ffc8" />
      <ThreeSparkles count={110} scale={[15, 8, 5]} size={1.7} speed={0.24} color="#a7ffb9" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.02, 0]} receiveShadow>
        <planeGeometry args={[30, 18, 20, 20]} />
        <meshStandardMaterial color="#0f251e" roughness={0.94} />
      </mesh>
      <gridHelper args={[28, 28, "#2c7c60", "#173d32"]} position={[0, -2, 0]} />
      <mesh position={[0, 1.2, -4.2]}>
        <boxGeometry args={[13.5, 7, 0.08]} />
        <meshStandardMaterial color="#4f9a80" transparent opacity={0.1} />
      </mesh>
      {gardenProjects.map((project, index) => (
        <PlantStation
          key={project.name}
          project={project}
          index={index}
          selected={selected === index}
          grown={grown.has(index)}
          onActivate={() => onActivate(index)}
        />
      ))}
    </Canvas>
  );
}

function IngredientOrb({
  project,
  index,
  selected,
  added,
  onActivate,
}: {
  project: Project;
  index: number;
  selected: boolean;
  added: boolean;
  onActivate: () => void;
}) {
  const item = useRef<THREE.Group>(null);
  const home = useMemo(() => new THREE.Vector3(...project.position), [project.position]);
  const target = useMemo(() => new THREE.Vector3((index - 1.5) * 0.35, -0.45 + index * 0.1, 0.25), [index]);

  useFrame((state) => {
    if (!item.current) return;
    item.current.position.lerp(added ? target : home, added ? 0.045 : 0.035);
    item.current.rotation.y += 0.012 + index * 0.003;
    item.current.rotation.x = Math.sin(state.clock.elapsedTime + index) * 0.14;
    const scale = added ? 0.58 : selected ? 1.14 : 1;
    item.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.07);
  });

  return (
    <group ref={item} position={project.position}>
      <Float speed={1.8 + index * 0.2} floatIntensity={0.25} rotationIntensity={0.15}>
        <mesh
          onPointerDown={(event) => {
            event.stopPropagation();
            onActivate();
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "default")}
        >
          {index === 0 && <dodecahedronGeometry args={[0.8, 0]} />}
          {index === 1 && <torusKnotGeometry args={[0.55, 0.18, 80, 10]} />}
          {index === 2 && <octahedronGeometry args={[0.88, 1]} />}
          {index === 3 && <capsuleGeometry args={[0.48, 0.9, 8, 16]} />}
          <meshStandardMaterial color={project.color} emissive={project.color} emissiveIntensity={selected ? 0.38 : 0.13} roughness={0.32} metalness={0.28} />
        </mesh>
        <mesh scale={1.28}>
          <sphereGeometry args={[0.82, 18, 18]} />
          <meshBasicMaterial color={project.accent} transparent opacity={selected ? 0.1 : 0.025} side={THREE.BackSide} />
        </mesh>
      </Float>
    </group>
  );
}

function Reactor({ complete }: { complete: boolean }) {
  const core = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (core.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * (complete ? 5 : 2)) * 0.08;
      core.current.scale.setScalar(pulse);
      core.current.rotation.y += complete ? 0.03 : 0.012;
    }
  });
  return (
    <group position={[0, -1, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.65, 0.3, 18, 80]} />
        <meshStandardMaterial color="#34364a" metalness={0.72} roughness={0.25} />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.92, 2]} />
        <meshStandardMaterial color={complete ? "#fff08a" : "#765fff"} emissive={complete ? "#ff9c38" : "#6048ff"} emissiveIntensity={1.5} roughness={0.2} />
      </mesh>
      {[0, 1, 2].map((ring) => (
        <mesh key={ring} rotation={[Math.PI / 2, ring * 0.6, ring * 0.35]} scale={1 + ring * 0.28}>
          <torusGeometry args={[1.18, 0.025, 8, 64]} />
          <meshBasicMaterial color={complete ? "#ffe46a" : "#a896ff"} transparent opacity={0.55 - ring * 0.12} />
        </mesh>
      ))}
    </group>
  );
}

function KitchenScene({
  selected,
  added,
  onActivate,
}: {
  selected: number;
  added: Set<number>;
  onActivate: (index: number) => void;
}) {
  return (
    <Canvas camera={{ position: [0, 1.4, 11.8], fov: 47 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
      <color attach="background" args={["#120810"]} />
      <fog attach="fog" args={["#120810", 13, 24]} />
      <ambientLight intensity={0.9} color="#ffb49d" />
      <directionalLight position={[5, 8, 7]} intensity={2.5} color="#fff1d2" />
      <pointLight position={[0, -0.5, 4]} intensity={added.size === 4 ? 72 : 34} distance={15} color={added.size === 4 ? "#ffd84e" : "#9d72ff"} />
      <ThreeSparkles count={130} scale={[15, 8, 5]} size={1.8} speed={0.35} color="#ffbd79" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.3, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#24121e" roughness={0.9} />
      </mesh>
      <gridHelper args={[28, 28, "#713a5b", "#3e2034"]} position={[0, -2.29, 0]} />
      <Reactor complete={added.size === kitchenProjects.length} />
      {kitchenProjects.map((project, index) => (
        <IngredientOrb
          key={project.name}
          project={project}
          index={index}
          selected={selected === index}
          added={added.has(index)}
          onActivate={() => onActivate(index)}
        />
      ))}
    </Canvas>
  );
}

export default function Home() {
  const [mode, setMode] = useState<GameMode>("orbit");
  const [selected, setSelected] = useState(0);
  const [grown, setGrown] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState<Set<number>>(new Set());

  const currentProjects = mode === "orbit" ? projects : mode === "garden" ? gardenProjects : kitchenProjects;
  const project = currentProjects[selected] ?? currentProjects[0];
  const modeCopy = {
    orbit: {
      label: "PROTOTYPE 01 / 03",
      first: "PROJECT",
      second: "ORBIT",
      body: <>Race through a career built between <strong>high-level intelligence</strong> and <strong>low-level signals.</strong></>,
      hint: "CLICK A PLANET",
      action: "SELECT",
    },
    garden: {
      label: "PROTOTYPE 02 / 03",
      first: "CODE",
      second: "GARDEN",
      body: <>Grow systems from the ground up. Every plant turns <strong>engineering fundamentals</strong> into something alive.</>,
      hint: "TAP A POT TO GROW",
      action: "WATER",
    },
    kitchen: {
      label: "PROTOTYPE 03 / 03",
      first: "STACK",
      second: "KITCHEN",
      body: <>Combine the right technologies, activate the reactor and cook a <strong>full-stack AI system</strong> from raw ingredients.</>,
      hint: "ADD ALL INGREDIENTS",
      action: "ADD",
    },
  }[mode];

  const changeMode = (next: GameMode) => {
    setMode(next);
    setSelected(0);
  };

  const navigate = (direction: number) =>
    setSelected((current) => (current + direction + currentProjects.length) % currentProjects.length);

  const activate = (index: number) => {
    setSelected(index);
    if (mode === "garden") setGrown((current) => new Set(current).add(index));
    if (mode === "kitchen") setAdded((current) => new Set(current).add(index));
  };

  return (
    <main className="game-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Inicio">
          <span className="brand-mark">IS</span>
          <span><b>IGNACIO SCHWINDT</b><small>COMPUTER ENGINEER · ARGENTINA</small></span>
        </a>
        <nav className="mode-switcher" aria-label="Elegir prototipo 3D">
          <button className={mode === "orbit" ? "active" : ""} onClick={() => changeMode("orbit")} aria-pressed={mode === "orbit"}><span>01</span> ORBIT</button>
          <button className={mode === "garden" ? "active" : ""} onClick={() => changeMode("garden")} aria-pressed={mode === "garden"}><span>02</span> GARDEN</button>
          <button className={mode === "kitchen" ? "active" : ""} onClick={() => changeMode("kitchen")} aria-pressed={mode === "kitchen"}><span>03</span> KITCHEN</button>
        </nav>
        <div className="top-actions">
          <span className="availability"><i /> OPEN TO BUILD</span>
          <a href="https://github.com/igna-s" target="_blank" rel="noreferrer" aria-label="GitHub de Ignacio"><Code2 size={18} /></a>
          <a href="https://www.linkedin.com/in/ignacio-andres-schwindt" target="_blank" rel="noreferrer" aria-label="LinkedIn de Ignacio"><Contact size={18} /></a>
        </div>
      </header>

      <section className={`game-stage mode-${mode}`} id="top">
        <div className="scene-layer" aria-label="Escena 3D interactiva con los proyectos principales de Ignacio">
          {mode === "orbit" && <OrbitScene selected={selected} onSelect={setSelected} />}
          {mode === "garden" && <GreenhouseScene selected={selected} grown={grown} onActivate={activate} />}
          {mode === "kitchen" && <KitchenScene selected={selected} added={added} onActivate={activate} />}
        </div>
        <div className="stage-gradient" />
        <div className="intro-copy">
          <div className="mode-label"><Sparkles size={14} /> {modeCopy.label}</div>
          <h1>{modeCopy.first}<br /><em>{modeCopy.second}</em></h1>
          <p>{modeCopy.body}</p>
        </div>

        <div className="project-dock">
          <div className="dock-index">0{selected + 1}<span>/ 0{currentProjects.length}</span></div>
          <div className="dock-content">
            <div className="dock-eyebrow">{project.eyebrow}</div>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <div className="stack-row">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
          </div>
          <a className="launch-link" href={project.url} target="_blank" rel="noreferrer">VIEW REPO <ArrowUpRight size={17} /></a>
        </div>

        <div className="game-controls">
          <button onClick={() => navigate(-1)} aria-label="Proyecto anterior"><ChevronLeft /></button>
          {mode === "orbit" ? (
            <div><MousePointer2 size={14} /><span>{modeCopy.hint}<br /><b>OR USE CONTROLS</b></span></div>
          ) : (
            <button className="action-control" onClick={() => activate(selected)} aria-label={`${modeCopy.action} ${project.name}`}>
              {modeCopy.action}
            </button>
          )}
          <button onClick={() => navigate(1)} aria-label="Proyecto siguiente"><ChevronRight /></button>
        </div>

        <div className="quest-card">
          {mode === "orbit" && <><span>RACE STOPS</span><b>{projects.length}</b><small>Choose a destination</small></>}
          {mode === "garden" && <><span>PROJECTS GROWN</span><b>{grown.size} / {gardenProjects.length}</b><small>{grown.size === gardenProjects.length ? "Garden complete ✓" : modeCopy.hint}</small></>}
          {mode === "kitchen" && <><span>STACK INGREDIENTS</span><b>{added.size} / {kitchenProjects.length}</b><small>{added.size === kitchenProjects.length ? "System compiled ✓" : modeCopy.hint}</small>{added.size > 0 && <button onClick={() => setAdded(new Set())}>RESET</button>}</>}
        </div>
        <div className="sector-label"><span>SECTOR</span><b>{project.eyebrow}</b></div>
      </section>

      <footer className="statusbar">
        <span>UNLP // MACHINES LIKE ME</span><span className="status-center">3D PORTFOLIO EXPERIMENT</span><span>BUILD 2026.08</span>
      </footer>
    </main>
  );
}
