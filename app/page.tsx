"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Stars } from "@react-three/drei";
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

export default function Home() {
  const [selected, setSelected] = useState(0);
  const project = projects[selected];
  const navigate = (direction: number) =>
    setSelected((current) => (current + direction + projects.length) % projects.length);

  return (
    <main className="game-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Inicio">
          <span className="brand-mark">IS</span>
          <span><b>IGNACIO SCHWINDT</b><small>COMPUTER ENGINEER · ARGENTINA</small></span>
        </a>
        <div className="top-actions">
          <span className="availability"><i /> OPEN TO BUILD</span>
          <a href="https://github.com/igna-s" target="_blank" rel="noreferrer" aria-label="GitHub de Ignacio"><Code2 size={18} /></a>
          <a href="https://www.linkedin.com/in/ignacio-andres-schwindt" target="_blank" rel="noreferrer" aria-label="LinkedIn de Ignacio"><Contact size={18} /></a>
        </div>
      </header>

      <section className="game-stage" id="top">
        <div className="scene-layer" aria-label="Escena 3D interactiva con los proyectos principales de Ignacio">
          <OrbitScene selected={selected} onSelect={setSelected} />
        </div>
        <div className="stage-gradient" />
        <div className="intro-copy">
          <div className="mode-label"><Sparkles size={14} /> PROTOTYPE 01 / 03</div>
          <h1>PROJECT<br /><em>ORBIT</em></h1>
          <p>Race through a career built between <strong>high-level intelligence</strong> and <strong>low-level signals.</strong></p>
        </div>

        <div className="project-dock">
          <div className="dock-index">0{selected + 1}<span>/ 0{projects.length}</span></div>
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
          <div><MousePointer2 size={14} /><span>CLICK A PLANET<br /><b>OR USE CONTROLS</b></span></div>
          <button onClick={() => navigate(1)} aria-label="Proyecto siguiente"><ChevronRight /></button>
        </div>
        <div className="sector-label"><span>SECTOR</span><b>{project.eyebrow}</b></div>
      </section>

      <footer className="statusbar">
        <span>UNLP // MACHINES LIKE ME</span><span className="status-center">3D PORTFOLIO EXPERIMENT</span><span>BUILD 2026.08</span>
      </footer>
    </main>
  );
}
