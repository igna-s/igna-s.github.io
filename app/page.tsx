"use client";

import {
  ArrowUpRight,
  Check,
  ChefHat,
  Clock3,
  Code2,
  Flame,
  GitBranch,
  Contact,
  RotateCcw,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

type Ingredient = { name: string; short: string; note: string; color: string };
type Project = {
  name: string;
  service: string;
  type: string;
  description: string;
  longDescription: string;
  ingredients: string[];
  url: string;
  year: string;
};
type GameState = "intro" | "playing" | "ready" | "served" | "failed";

const ingredients: Ingredient[] = [
  { name: "LangGraph", short: "LG", note: "Orquestación de agentes", color: "#f16b4a" },
  { name: "FastAPI", short: "FA", note: "Backend de alto rendimiento", color: "#39bca5" },
  { name: "React", short: "RE", note: "Interfaz de producto", color: "#60c7ef" },
  { name: "PostgreSQL", short: "PG", note: "Datos + pgvector", color: "#7192c5" },
  { name: "Qiskit", short: "QK", note: "Computación cuántica", color: "#8d79f6" },
  { name: "Qdrant", short: "QD", note: "Búsqueda vectorial", color: "#e96678" },
  { name: "n8n", short: "N8", note: "Flujos automatizados", color: "#ef735f" },
  { name: "Ollama", short: "OL", note: "Inferencia local", color: "#c5aa7c" },
  { name: "Gemini", short: "GE", note: "Inteligencia multimodal", color: "#65a5f6" },
  { name: "Three.js", short: "3D", note: "Escena tridimensional", color: "#d4b46f" },
  { name: "VRM", short: "VR", note: "Avatar interoperable", color: "#ca80d9" },
  { name: "Web Audio", short: "WA", note: "Voz en tiempo real", color: "#f29b53" },
  { name: "Python", short: "PY", note: "Núcleo del motor", color: "#e2b849" },
  { name: "Autograd", short: "AG", note: "Diferenciación automática", color: "#e66d56" },
  { name: "Backprop", short: "BP", note: "Gradientes desde cero", color: "#a68be5" },
  { name: "LLMs", short: "LL", note: "Fundamentos de lenguaje", color: "#78b883" },
];

const projects: Project[] = [
  {
    name: "VaultMind AI",
    service: "Plato de autor #01",
    type: "AGENTE RAG BANCARIO",
    description: "Un agente de investigación seguro para navegar conocimiento financiero complejo.",
    longDescription: "Plataforma bancaria full-stack con investigación multiagente, recuperación semántica y una experiencia React pensada para convertir documentos densos en respuestas trazables.",
    ingredients: ["LangGraph", "FastAPI", "React", "PostgreSQL"],
    url: "https://github.com/igna-s/VaultMind-AI-RAG-Banking-Agent",
    year: "2026",
  },
  {
    name: "Qiskit RAG Migration",
    service: "Menú cuántico #02",
    type: "QUANTUM × AI",
    description: "Un asistente que moderniza código Qiskit usando documentación, retrieval y agentes.",
    longDescription: "Pipeline RAG diseñado para entender cambios entre versiones de Qiskit, recuperar la documentación correcta y proponer migraciones concretas sobre código legado.",
    ingredients: ["Qiskit", "Qdrant", "n8n", "Ollama"],
    url: "https://github.com/igna-s/Qiskit-RAG-Migration-Assistant",
    year: "2025",
  },
  {
    name: "Realtime AI Avatar",
    service: "Especial en vivo #03",
    type: "LIVE AI EXPERIENCE",
    description: "Un compañero 3D con voz, memoria y respuesta multimodal de baja latencia.",
    longDescription: "Experiencia conversacional voice-first que combina un avatar VRM expresivo, escena 3D en tiempo real y modelos multimodales para que la interacción se sienta viva.",
    ingredients: ["Gemini", "Three.js", "VRM", "Web Audio"],
    url: "https://github.com/igna-s/Realtime_Avatar_AI_Companion",
    year: "2026",
  },
  {
    name: "Michigrad Engine",
    service: "Degustación técnica #04",
    type: "AI FROM SCRATCH",
    description: "Un motor de autograd escalar para revelar qué ocurre debajo del deep learning.",
    longDescription: "Implementación educativa de diferenciación automática, backpropagation y fundamentos de modelos de lenguaje construida desde cero, sin esconder la ingeniería detrás de frameworks.",
    ingredients: ["Python", "Autograd", "Backprop", "LLMs"],
    url: "https://github.com/igna-s/Michigrad-Deep-Learning-From-Scratch",
    year: "2025",
  },
];

const ingredientMap = new Map(ingredients.map((ingredient) => [ingredient.name, ingredient]));

export default function Home() {
  const [projectIndex, setProjectIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [served, setServed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);
  const [gameState, setGameState] = useState<GameState>("intro");
  const [soundOn, setSoundOn] = useState(true);

  const project = projects[projectIndex];
  const pantry = useMemo(() => {
    const required = project.ingredients.map((name) => ingredientMap.get(name)!);
    const distractors = ingredients
      .filter((item) => !project.ingredients.includes(item.name))
      .slice(projectIndex * 3, projectIndex * 3 + 4);
    return [...required, ...distractors].sort((a, b) =>
      ((a.name.charCodeAt(0) + projectIndex * 7) % 13) - ((b.name.charCodeAt(0) + projectIndex * 7) % 13),
    );
  }, [project, projectIndex]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = window.setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          setGameState("failed");
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [gameState]);

  const playTone = (frequency: number, duration = 0.08) => {
    if (!soundOn) return;
    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  const resetOrder = (index = projectIndex) => {
    setProjectIndex(index);
    setSelected([]);
    setMistakes(0);
    setTimeLeft(75);
    setGameState("playing");
  };

  const addIngredient = (ingredient: Ingredient) => {
    if (gameState !== "playing" || selected.includes(ingredient.name)) return;
    if (!project.ingredients.includes(ingredient.name)) {
      setMistakes((value) => value + 1);
      setScore((value) => Math.max(0, value - 75));
      playTone(155, 0.13);
      return;
    }
    const next = [...selected, ingredient.name];
    setSelected(next);
    setScore((value) => value + 250);
    playTone(420 + next.length * 80);
    if (next.length === project.ingredients.length) setGameState("ready");
  };

  const removeIngredient = (name: string) => {
    if (gameState !== "playing" && gameState !== "ready") return;
    setSelected((items) => items.filter((item) => item !== name));
    setGameState("playing");
    playTone(240);
  };

  const serveProject = () => {
    const bonus = timeLeft * 10 + Math.max(0, 500 - mistakes * 125);
    setScore((value) => value + bonus);
    setServed((value) => value + 1);
    setGameState("served");
    playTone(740, 0.22);
  };

  const nextOrder = () => resetOrder((projectIndex + 1) % projects.length);
  const rating = Math.max(1, Math.min(3, 3 - mistakes));
  const progress = selected.length / project.ingredients.length;

  return (
    <main className="kitchen-game">
      <div className="kitchen-photo" aria-hidden="true" />
      <div className="kitchen-shade" aria-hidden="true" />

      <header className="game-header">
        <a className="identity" href="#game" aria-label="Inicio del portfolio de Ignacio Schwindt">
          <span className="identity-seal"><ChefHat size={20} /></span>
          <span><b>IGNACIO&apos;S LAB</b><small>ENGINEERING, SERVED FRESH</small></span>
        </a>
        <div className="shift-stats" aria-label="Estadísticas de la partida">
          <span><small>PUNTOS</small><b>{score.toString().padStart(5, "0")}</b></span>
          <span><small>SERVIDOS</small><b>{served}/{projects.length}</b></span>
          <span className={timeLeft < 20 ? "urgent" : ""}><small>TIEMPO</small><b><Clock3 size={14} /> 00:{timeLeft.toString().padStart(2, "0")}</b></span>
        </div>
        <div className="header-actions">
          <span className="available"><i /> DISPONIBLE</span>
          <button onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "Silenciar juego" : "Activar sonido"}>
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <a href="https://github.com/igna-s" target="_blank" rel="noreferrer" aria-label="GitHub"><GitBranch size={18} /></a>
          <a href="https://www.linkedin.com/in/ignacio-andres-schwindt" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Contact size={18} /></a>
        </div>
      </header>

      <section className="game-board" id="game" aria-label="Minijuego de cocina del portfolio">
        <aside className="order-ticket">
          <div className="ticket-top"><span>ORDEN #{String(projectIndex + 1).padStart(2, "0")}</span><b>MESA DEV</b></div>
          <div className="ticket-pin" />
          <p className="ticket-service">{project.service}</p>
          <h1>{project.name}</h1>
          <span className="project-type">{project.type}</span>
          <p className="ticket-description">{project.description}</p>
          <div className="recipe-list">
            <span className="recipe-label">COMPONENTES DE LA RECETA</span>
            {project.ingredients.map((name, index) => (
              <div key={name} className={selected.includes(name) ? "done" : ""}>
                <span>{selected.includes(name) ? <Check size={13} /> : index + 1}</span><b>{name}</b>
              </div>
            ))}
          </div>
          <div className="ticket-footer">
            <span>PRECISIÓN</span>
            <div>{[0, 1, 2].map((star) => <Star key={star} size={16} fill={star < rating ? "currentColor" : "none"} />)}</div>
          </div>
        </aside>

        <section className="prep-station" aria-live="polite">
          <div className="station-heading"><span><Flame size={14} /> ESTACIÓN DE ENSAMBLADO</span><b>{Math.round(progress * 100)}%</b></div>
          <div className="progress-track"><i style={{ width: `${progress * 100}%` }} /></div>
          <div className={`assembly-board ${gameState === "ready" ? "is-ready" : ""}`}>
            <div className="board-grain" />
            <span className="board-title">BUILD BOARD <small>v{project.year}</small></span>
            <div className="component-slots">
              {project.ingredients.map((name, index) => {
                const item = ingredientMap.get(name)!;
                const active = selected.includes(name);
                return (
                  <button key={name} className={active ? "filled" : ""} onClick={() => active && removeIngredient(name)}
                    aria-label={active ? `Quitar ${name}` : `Espacio ${index + 1}: ${name}`}
                    style={{ "--ingredient": item.color } as CSSProperties}>
                    {active ? <><span>{item.short}</span><b>{item.name}</b><small><X size={11} /> quitar</small></> : <><span>0{index + 1}</span><b>COMPONENTE</b><small>vacío</small></>}
                  </button>
                );
              })}
            </div>
            <div className="board-status">
              {gameState === "ready" ? <><Check size={16} /> BUILD COMPLETO — LISTO PARA SERVIR</> : <>SELECCIONÁ LOS COMPONENTES CORRECTOS DE LA DESPENSA</>}
            </div>
          </div>
          <button className="serve-button" disabled={gameState !== "ready"} onClick={serveProject}>
            <span>{gameState === "ready" ? "SERVIR PROYECTO" : `${project.ingredients.length - selected.length} COMPONENTES PENDIENTES`}</span><ArrowUpRight size={20} />
          </button>
        </section>

        <aside className="pantry">
          <div className="pantry-title"><span>DESPENSA</span><small>Elegí con cuidado</small></div>
          <div className="ingredient-grid">
            {pantry.map((ingredient) => {
              const used = selected.includes(ingredient.name);
              return (
                <button key={ingredient.name} disabled={used || gameState !== "playing"} onClick={() => addIngredient(ingredient)}
                  style={{ "--ingredient": ingredient.color } as CSSProperties} className={used ? "used" : ""}>
                  <span>{used ? <Check size={18} /> : ingredient.short}</span><b>{ingredient.name}</b><small>{ingredient.note}</small>
                </button>
              );
            })}
          </div>
          <button className="reset-button" onClick={() => resetOrder()}><RotateCcw size={14} /> REINICIAR ORDEN</button>
        </aside>
      </section>

      <footer className="game-footer">
        <span><Code2 size={13} /> COMPUTER ENGINEER · UNLP</span>
        <span className="footer-center">PORTFOLIO INTERACTIVO — BUENOS AIRES, ARGENTINA</span>
        <span>SHIFT 08/26</span>
      </footer>

      {gameState === "intro" && (
        <section className="intro-screen" aria-labelledby="intro-title">
          <div className="intro-card">
            <span className="eyebrow">BIENVENIDO A MI COCINA DIGITAL</span>
            <h2 id="intro-title">Los proyectos<br />no se miran.<br /><em>Se cocinan.</em></h2>
            <p>Cada orden es un proyecto real. Elegí sus tecnologías, armá el stack correcto y servilo antes de que termine el turno.</p>
            <button onClick={() => resetOrder(0)}><ChefHat size={20} /> ABRIR LA COCINA <ArrowUpRight size={20} /></button>
            <div className="intro-meta"><span>4 ÓRDENES</span><span>8 COMPONENTES</span><span>75 SEGUNDOS</span></div>
          </div>
          <div className="chef-note"><span>CHEF / ENGINEER</span><b>IGNACIO<br />SCHWINDT</b><small>AI · FULL-STACK · IMMERSIVE SYSTEMS</small></div>
        </section>
      )}

      {gameState === "served" && (
        <section className="result-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title">
          <div className="result-card">
            <div className="result-badge"><Trophy size={29} /><span>ORDEN COMPLETADA</span></div>
            <span className="result-type">{project.type}</span>
            <h2 id="result-title">{project.name}</h2>
            <p>{project.longDescription}</p>
            <div className="result-stack">{project.ingredients.map((item) => <span key={item}><Check size={12} /> {item}</span>)}</div>
            <div className="result-score">
              <div><small>CALIDAD</small><b>{[0, 1, 2].map((star) => <Star key={star} size={21} fill={star < rating ? "currentColor" : "none"} />)}</b></div>
              <div><small>TIEMPO</small><b>00:{timeLeft.toString().padStart(2, "0")}</b></div>
              <div><small>ERRORES</small><b>{mistakes}</b></div>
            </div>
            <div className="result-actions">
              <a href={project.url} target="_blank" rel="noreferrer">VER PROYECTO REAL <GitBranch size={17} /><ArrowUpRight size={17} /></a>
              <button onClick={nextOrder}>{projectIndex === projects.length - 1 ? "VOLVER AL MENÚ" : "SIGUIENTE ORDEN"} <ArrowUpRight size={17} /></button>
            </div>
          </div>
        </section>
      )}

      {gameState === "failed" && (
        <section className="result-overlay" role="dialog" aria-modal="true" aria-labelledby="failed-title">
          <div className="result-card failed-card">
            <div className="result-badge"><Clock3 size={29} /><span>FIN DEL TURNO</span></div>
            <h2 id="failed-title">La orden se enfrió.</h2>
            <p>En una cocina profesional, cada segundo cuenta. Reiniciá la orden y encontrá los cuatro componentes del stack.</p>
            <button className="retry-button" onClick={() => resetOrder()}><RotateCcw size={17} /> INTENTAR DE NUEVO</button>
          </div>
        </section>
      )}
    </main>
  );
}
