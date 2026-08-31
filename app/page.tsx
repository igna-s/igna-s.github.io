"use client";

import {
  ArrowRight,
  Check,
  ChefHat,
  CircleAlert,
  ClipboardList,
  Clock3,
  Contact,
  Flame,
  Gauge,
  GitBranch,
  Layers3,
  RotateCcw,
  Star,
  Trash2,
  Trophy,
  Users,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

type Station = "lobby" | "prep" | "grill" | "build";
type GameState = "intro" | "playing" | "served" | "failed" | "complete";
type DifficultyKey = "rookie" | "pro" | "master";

type Ingredient = { name: string; short: string; note: string; color: string };
type Project = {
  name: string; type: string; description: string; detail: string;
  ingredients: string[]; url: string; year: string;
};
type Customer = { name: string; role: string; line: string };
type GrillItem = { name: string; progress: number };

const difficulties = {
  rookie: { name: "APRENDIZ", subtitle: "Turno tranquilo", orderTime: 135, cookRate: 1.05, patienceDrain: .13, multiplier: 1 },
  pro: { name: "SERVICIO PRO", subtitle: "Ritmo de restaurante", orderTime: 105, cookRate: 1.5, patienceDrain: .2, multiplier: 1.5 },
  master: { name: "CHEF EJECUTIVO", subtitle: "Sin margen de error", orderTime: 80, cookRate: 2.15, patienceDrain: .29, multiplier: 2.25 },
} as const;

const ingredients: Ingredient[] = [
  { name:"LangGraph", short:"LG", note:"Agentes", color:"#ef7658" },
  { name:"FastAPI", short:"FA", note:"Backend", color:"#49c3a8" },
  { name:"React", short:"RE", note:"Frontend", color:"#62c9eb" },
  { name:"PostgreSQL", short:"PG", note:"Datos", color:"#7897c8" },
  { name:"Qiskit", short:"QK", note:"Quantum", color:"#947df4" },
  { name:"Qdrant", short:"QD", note:"Vectores", color:"#e9687b" },
  { name:"n8n", short:"N8", note:"Workflows", color:"#ef775f" },
  { name:"Ollama", short:"OL", note:"Local AI", color:"#cab083" },
  { name:"Gemini", short:"GE", note:"Multimodal", color:"#65a5f5" },
  { name:"Three.js", short:"3D", note:"Web 3D", color:"#d5b66f" },
  { name:"VRM", short:"VR", note:"Avatar", color:"#ca82d8" },
  { name:"Web Audio", short:"WA", note:"Realtime", color:"#ef9c59" },
  { name:"Python", short:"PY", note:"Core", color:"#e3b84a" },
  { name:"Autograd", short:"AG", note:"Gradientes", color:"#df6b54" },
  { name:"Backprop", short:"BP", note:"Learning", color:"#aa8de4" },
  { name:"LLMs", short:"LL", note:"Language", color:"#79b784" },
  { name:"Agents", short:"AI", note:"Planning", color:"#e67e55" },
  { name:"MI300X", short:"MX", note:"Inference", color:"#e54e47" },
  { name:"Serverless", short:"SV", note:"Cloud", color:"#91a7d1" },
  { name:"Unity", short:"UN", note:"Engine", color:"#d4d6d9" },
  { name:"C#", short:"C#", note:"Logic", color:"#a37bd5" },
  { name:"ShaderLab", short:"SL", note:"Shaders", color:"#65b98f" },
];

const projects: Project[] = [
  { name:"VaultMind AI", type:"AGENTE RAG BANCARIO", description:"Investigación financiera segura, trazable y multiagente.", detail:"Plataforma bancaria full-stack con investigación multiagente y recuperación semántica sobre documentos complejos.", ingredients:["LangGraph","FastAPI","React","PostgreSQL"], url:"https://github.com/igna-s/VaultMind-AI-RAG-Banking-Agent", year:"2026" },
  { name:"Qiskit RAG Migration", type:"QUANTUM × AI", description:"Modernización de código cuántico con documentación y retrieval.", detail:"Pipeline RAG que entiende cambios entre versiones de Qiskit y propone migraciones concretas sobre código legado.", ingredients:["Qiskit","Qdrant","n8n","Ollama"], url:"https://github.com/igna-s/Qiskit-RAG-Migration-Assistant", year:"2025" },
  { name:"Realtime AI Avatar", type:"LIVE AI EXPERIENCE", description:"Compañero 3D con voz y respuesta multimodal de baja latencia.", detail:"Experiencia voice-first con avatar VRM expresivo, escena 3D en tiempo real y modelos multimodales.", ingredients:["Gemini","Three.js","VRM","Web Audio"], url:"https://github.com/igna-s/Realtime_Avatar_AI_Companion", year:"2026" },
  { name:"Michigrad Engine", type:"AI FROM SCRATCH", description:"Autograd escalar para mirar debajo del deep learning.", detail:"Diferenciación automática, backpropagation y fundamentos de modelos de lenguaje construidos desde cero.", ingredients:["Python","Autograd","Backprop","LLMs"], url:"https://github.com/igna-s/Michigrad-Deep-Learning-From-Scratch", year:"2025" },
  { name:"Meridian AI Agent", type:"AMD HACKATHON", description:"Gestión de proyectos AI-first con inferencia acelerada.", detail:"Plataforma serverless de project management con agentes, experiencia React e inferencia AMD MI300X.", ingredients:["React","Agents","MI300X","Serverless"], url:"https://github.com/igna-s/Meridian-Ai-Agent", year:"2025" },
  { name:"Unity VR Simulation", type:"IMMERSIVE SYSTEMS", description:"Simulación inmersiva creada para investigación en UNLP.", detail:"Entorno de realidad virtual interactivo con lógica C#, shaders propios y diseño de interacción espacial.", ingredients:["Unity","C#","VRM","ShaderLab"], url:"https://github.com/igna-s/Unity-VR-Simulation-2024", year:"2024" },
];

const customers: Customer[] = [
  { name:"Valentina", role:"Product Lead", line:"Necesito algo inteligente, pero que pueda auditar cada respuesta." },
  { name:"Bruno", role:"Quantum Dev", line:"Mi código quedó en una versión vieja. ¿Podés modernizarlo?" },
  { name:"Mei", role:"Creative Technologist", line:"Quiero una experiencia que responda, hable y se sienta viva." },
  { name:"Malik", role:"ML Engineer", line:"Servime los fundamentos, sin frameworks que oculten la magia." },
  { name:"Tomás", role:"Startup Founder", line:"Tengo un equipo rápido. Necesito un agente que siga el ritmo." },
  { name:"Elena", role:"Research Director", line:"Busco una simulación inmersiva lista para experimentar." },
];

const ingredientMap = new Map(ingredients.map((item) => [item.name, item]));

function avatarStyle(index: number): CSSProperties {
  const column = index % 3;
  const row = Math.floor(index / 3);
  return { backgroundPosition: `${column * 50}% ${row * 100}%` };
}

function grillLabel(progress: number) {
  if (progress < 35) return "CRUDO";
  if (progress < 62) return "COCINANDO";
  if (progress <= 105) return "EN SU PUNTO";
  if (progress <= 122) return "¡RETIRAR YA!";
  return "QUEMADO";
}

export default function Home() {
  const [difficulty, setDifficulty] = useState<DifficultyKey>("pro");
  const [gameState, setGameState] = useState<GameState>("intro");
  const [station, setStation] = useState<Station>("lobby");
  const [orderIndex, setOrderIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [prep, setPrep] = useState<string[]>([]);
  const [grills, setGrills] = useState<Array<GrillItem | null>>([null,null,null,null]);
  const [cooked, setCooked] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [burnt, setBurnt] = useState(0);
  const [score, setScore] = useState(0);
  const [lastEarned, setLastEarned] = useState(0);
  const [patience, setPatience] = useState(100);
  const [timeLeft, setTimeLeft] = useState<number>(difficulties.pro.orderTime);
  const [sound, setSound] = useState(true);

  const settings = difficulties[difficulty];
  const project = projects[orderIndex];
  const customer = customers[orderIndex];
  const allPlaced = new Set([...prep, ...cooked, ...grills.flatMap((item) => item ? [item.name] : [])]);
  const pantry = useMemo(() => {
    const required = project.ingredients.map((name) => ingredientMap.get(name)!);
    const offset = (orderIndex * 3) % ingredients.length;
    const distractors = [...ingredients.slice(offset), ...ingredients.slice(0, offset)]
      .filter((item) => !project.ingredients.includes(item.name)).slice(0, 8);
    return [...required, ...distractors].sort((a,b) => (a.short.charCodeAt(0) + orderIndex * 5) % 11 - (b.short.charCodeAt(0) + orderIndex * 5) % 11);
  }, [orderIndex, project]);

  const tone = (frequency: number, duration=.08) => {
    if (!sound) return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.065, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + duration);
  };

  useEffect(() => {
    if (gameState !== "playing" || !accepted) return;
    const tick = window.setInterval(() => {
      setTimeLeft((value) => Math.max(0, value - .25));
      setPatience((value) => Math.max(0, value - settings.patienceDrain));
      setGrills((items) => items.map((item) => item ? { ...item, progress: Math.min(145, item.progress + settings.cookRate) } : null));
    }, 250);
    return () => window.clearInterval(tick);
  }, [accepted, gameState, settings]);

  useEffect(() => {
    if (gameState === "playing" && accepted && (timeLeft <= 0 || patience <= 0)) setGameState("failed");
  }, [accepted, gameState, patience, timeLeft]);

  const resetOrder = (index=orderIndex) => {
    setOrderIndex(index); setAccepted(false); setStation("lobby"); setPrep([]);
    setGrills([null,null,null,null]); setCooked([]); setMistakes(0); setBurnt(0);
    setPatience(100); setTimeLeft(difficulties[difficulty].orderTime); setGameState("playing");
  };

  const startShift = () => { setScore(0); resetOrder(0); };
  const takeOrder = () => { setAccepted(true); setStation("prep"); tone(520,.12); };

  const selectIngredient = (name: string) => {
    if (!accepted || allPlaced.has(name)) return;
    if (!project.ingredients.includes(name)) {
      setMistakes((value) => value + 1); setScore((value) => Math.max(0,value-50)); tone(150,.15); return;
    }
    setPrep((items) => [...items,name]); tone(430 + prep.length * 60);
  };

  const removePrep = (name: string) => setPrep((items) => items.filter((item) => item !== name));
  const addToGrill = (name: string) => {
    const open = grills.findIndex((item) => !item);
    if (open < 0) { tone(145,.15); return; }
    setPrep((items) => items.filter((item) => item !== name));
    setGrills((items) => items.map((item,index) => index === open ? { name, progress:0 } : item));
    tone(310,.1);
  };

  const collectGrill = (slot: number) => {
    const item = grills[slot]; if (!item) return;
    if (item.progress < 62) {
      setMistakes((value) => value + 1); setPrep((items) => [...items,item.name]); tone(160,.15);
    } else if (item.progress <= 122) {
      setCooked((items) => [...items,item.name]); setScore((value) => value + Math.round(180 * settings.multiplier)); tone(650,.12);
    } else {
      setMistakes((value) => value + 1); setBurnt((value) => value + 1); setScore((value) => Math.max(0,value-100)); tone(110,.2);
    }
    setGrills((items) => items.map((entry,index) => index === slot ? null : entry));
  };

  const serve = () => {
    if (cooked.length !== project.ingredients.length) return;
    const quality = Math.max(0, 1200 - mistakes * 130 - burnt * 170);
    const earned = Math.round((quality + Math.floor(timeLeft) * 8 + Math.floor(patience) * 5) * settings.multiplier);
    setLastEarned(earned); setScore((value) => value + earned); setGameState("served"); tone(780,.25);
  };

  const nextCustomer = () => {
    if (orderIndex === projects.length - 1) setGameState("complete");
    else resetOrder(orderIndex + 1);
  };

  const orderProgress = (prep.length + grills.filter(Boolean).length + cooked.length) / project.ingredients.length;
  const stars = Math.max(1, Math.min(3, 3 - Math.floor(mistakes / 2) - burnt));

  return (
    <main className="service-game">
      <div className="kitchen-bg" aria-hidden="true" /><div className="scene-vignette" aria-hidden="true" />

      <header className="service-header">
        <a className="brand" href="#game"><span><ChefHat size={21}/></span><b>IGNACIO&apos;S<br/><small>PROJECT KITCHEN</small></b></a>
        <div className="shift-hud">
          <span><small>PUNTOS</small><b>{score.toString().padStart(6,"0")}</b></span>
          <span><small>NIVEL</small><b>{settings.name}</b></span>
          <span className={timeLeft < 20 ? "danger" : ""}><small>ORDEN</small><b><Clock3 size={13}/> {Math.ceil(timeLeft)}s</b></span>
        </div>
        <div className="header-links">
          <button onClick={() => setSound((value) => !value)} aria-label="Alternar sonido">{sound ? <Volume2/> : <VolumeX/>}</button>
          <a href="https://github.com/igna-s" target="_blank" rel="noreferrer" aria-label="GitHub"><GitBranch/></a>
          <a href="https://www.linkedin.com/in/ignacio-andres-schwindt" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Contact/></a>
        </div>
      </header>

      <div className="customer-queue" aria-label="Fila de clientes">
        <div className="queue-label"><Users size={14}/><span>COLA<br/><b>{Math.max(0,projects.length-orderIndex-1)} ESPERANDO</b></span></div>
        {customers.map((person,index) => (
          <div key={person.name} className={`queue-person ${index === orderIndex ? "active" : ""} ${index < orderIndex ? "served" : ""}`}>
            <i style={avatarStyle(index)}>{index < orderIndex && <Check size={12}/>}</i><span>{person.name}</span>
          </div>
        ))}
        <div className="patience"><span>PACIENCIA DE {customer.name.toUpperCase()}</span><div><i style={{width:`${patience}%`}}/></div></div>
      </div>

      <nav className="station-nav" aria-label="Estaciones de la cocina">
        {([
          ["lobby","01",Users,"SALÓN"], ["prep","02",ClipboardList,"PREP"],
          ["grill","03",Flame,"PARRILLA"], ["build","04",Layers3,"ARMADO"],
        ] as const).map(([key,number,Icon,label]) => (
          <button key={key} onClick={() => setStation(key)} className={station === key ? "active" : ""} disabled={!accepted && key !== "lobby"}>
            <small>{number}</small><Icon size={17}/><span>{label}</span>
            {key === "grill" && grills.some(Boolean) && <i>{grills.filter(Boolean).length}</i>}
            {key === "build" && cooked.length > 0 && <i>{cooked.length}</i>}
          </button>
        ))}
      </nav>

      <section className="service-floor" id="game">
        <aside className={`order-ticket ${accepted ? "printed" : ""}`}>
          <div className="ticket-head"><span>ORDEN #{String(orderIndex+1).padStart(2,"0")}</span><b>{project.year}</b></div>
          <p>CLIENTE · {customer.name.toUpperCase()}</p><h1>{project.name}</h1><em>{project.type}</em>
          <div className="ticket-line"/>
          <span className="recipe-title">RECETA / COMPONENTES</span>
          {project.ingredients.map((name,index) => {
            const done = cooked.includes(name); const cooking = grills.some((item) => item?.name === name); const ready = prep.includes(name);
            return <div className={`ticket-item ${done ? "done" : cooking ? "cooking" : ready ? "ready" : ""}`} key={name}>
              <span>{done ? <Check size={12}/> : index+1}</span><b>{name}</b><small>{done ? "OK" : cooking ? "FUEGO" : ready ? "PREP" : "—"}</small>
            </div>;
          })}
          <div className="order-meter"><span>PROGRESO</span><b>{Math.round(orderProgress*100)}%</b><div><i style={{width:`${orderProgress*100}%`}}/></div></div>
        </aside>

        <section className={`station-scene station-${station}`}>
          {station === "lobby" && <div className="lobby-scene">
            <div className="counter-sign"><span>NOW SERVING</span><b>0{orderIndex+1}</b></div>
            <div className="customer-card">
              <div className="customer-avatar" style={avatarStyle(orderIndex)}><span className="mood">{patience > 65 ? "☺" : patience > 30 ? "•_•" : "!"}</span></div>
              <div className="speech"><span>{customer.role}</span><h2>Hola, soy {customer.name}.</h2><p>“{customer.line}”</p><div><b>PEDIDO</b><strong>{project.name}</strong><small>{project.description}</small></div></div>
            </div>
            {!accepted ? <button className="primary-action" onClick={takeOrder}><ClipboardList/> TOMAR PEDIDO <ArrowRight/></button> : <button className="primary-action" onClick={() => setStation("prep")}><Check/> PEDIDO TOMADO · IR A PREP <ArrowRight/></button>}
          </div>}

          {station === "prep" && <div className="prep-scene">
            <div className="scene-heading"><span><ClipboardList/> MISE EN PLACE</span><div><b>{prep.length}</b>/4 EN BANDEJA</div></div>
            <p className="scene-help">Seleccioná los cuatro componentes que aparecen en el ticket. Los incorrectos bajan la puntuación.</p>
            <div className="pantry-grid">{pantry.map((item) => {
              const used = allPlaced.has(item.name);
              return <button key={item.name} className={used ? "used" : ""} disabled={used} onClick={() => selectIngredient(item.name)} style={{"--ingredient":item.color} as CSSProperties}>
                <i>{used ? <Check size={17}/> : item.short}</i><span><b>{item.name}</b><small>{item.note}</small></span>
              </button>;
            })}</div>
            <div className="prep-tray"><span>BANDEJA DE PREPARACIÓN</span><div>{prep.length ? prep.map((name) => <button key={name} onClick={() => removePrep(name)}><b>{ingredientMap.get(name)?.short}</b>{name}<X size={11}/></button>) : <small>Elegí componentes de la despensa</small>}</div></div>
            <button className="next-station" disabled={!prep.length} onClick={() => setStation("grill")}>LLEVAR A PARRILLA <Flame size={17}/><ArrowRight size={17}/></button>
          </div>}

          {station === "grill" && <div className="grill-scene">
            <div className="scene-heading"><span><Flame/> LÍNEA CALIENTE</span><div><b>{grills.filter(Boolean).length}</b>/4 FUEGOS</div></div>
            <p className="scene-help">Llevá cada componente a la zona dorada y retiralo a tiempo. Si pasa de 122%, se quema.</p>
            <div className="grill-grid">{grills.map((item,index) => {
              const state = item ? grillLabel(item.progress) : "LIBRE";
              return <button key={index} className={`grill-slot ${item ? "occupied" : ""} ${item && item.progress > 122 ? "burned" : ""}`} onClick={() => item && collectGrill(index)}>
                <span className="grill-number">FUEGO 0{index+1}</span><div className="grill-bars"/>
                {item ? <><i className="heat-token" style={{"--ingredient":ingredientMap.get(item.name)?.color} as CSSProperties}>{ingredientMap.get(item.name)?.short}</i><b>{item.name}</b><strong>{state}</strong><div className="cook-track"><span className="sweet-zone"/><i style={{width:`${Math.min(100,item.progress/1.35)}%`}}/></div><small>{Math.round(item.progress)}% · CLICK PARA RETIRAR</small>{item.progress > 106 && <span className="smoke">•••</span>}</> : <><Flame className="empty-flame"/><b>DISPONIBLE</b><small>AGREGÁ UN COMPONENTE</small></>}
              </button>;
            })}</div>
            <div className="grill-bench"><span>LISTOS PARA COCINAR</span><div>{prep.length ? prep.map((name) => <button key={name} onClick={() => addToGrill(name)}><i style={{background:ingredientMap.get(name)?.color}}>{ingredientMap.get(name)?.short}</i>{name}<Flame size={13}/></button>) : <small>No hay componentes en prep</small>}</div></div>
            <button className="next-station" disabled={!cooked.length} onClick={() => setStation("build")}>IR A ARMADO <Layers3 size={17}/><ArrowRight size={17}/></button>
          </div>}

          {station === "build" && <div className="build-scene">
            <div className="scene-heading"><span><Layers3/> PASE Y ARMADO</span><div><b>{cooked.length}</b>/4 TERMINADOS</div></div>
            <p className="scene-help">Comprobá que el stack esté completo y serví el proyecto antes de agotar la paciencia del cliente.</p>
            <div className={`build-board ${cooked.length === 4 ? "complete" : ""}`}>
              <span className="blueprint-label">PROJECT BUILD · {project.year}</span><h2>{project.name}</h2><small>{project.type}</small>
              <div className="build-slots">{project.ingredients.map((name,index) => {
                const item = ingredientMap.get(name)!; const ready = cooked.includes(name);
                return <div key={name} className={ready ? "ready" : ""} style={{"--ingredient":item.color} as CSSProperties}><i>{ready ? item.short : `0${index+1}`}</i><b>{ready ? name : "PENDIENTE"}</b><small>{ready ? "COCCIÓN OK" : "EN COCINA"}</small></div>;
              })}</div>
              <div className="build-checks"><span><Check/> COMPONENTES</span><span className={burnt ? "bad" : ""}>{burnt ? <CircleAlert/> : <Check/>} COCCIÓN</span><span className={mistakes > 1 ? "bad" : ""}>{mistakes > 1 ? <CircleAlert/> : <Check/>} PRECISIÓN</span></div>
            </div>
            <button className="serve-project" disabled={cooked.length !== 4} onClick={serve}><UtensilsCrossed/> SERVIR {project.name.toUpperCase()} <ArrowRight/></button>
          </div>}
        </section>
      </section>

      <footer className="service-footer"><span>COMPUTER ENGINEER · UNLP</span><span>INGREDIENTES REALES · PROYECTOS REALES</span><span>BUENOS AIRES · 2026</span></footer>

      {gameState === "intro" && <section className="start-overlay">
        <div className="start-copy"><span>IGNACIO&apos;S PROJECT KITCHEN</span><h1>Tu próximo<br/>proyecto está<br/><em>en la cocina.</em></h1><p>Gestioná clientes, interpretá pedidos, prepará tecnologías y cociná cada stack en su punto exacto.</p></div>
        <div className="difficulty-panel"><span className="panel-kicker"><Gauge/> ELEGÍ EL NIVEL DEL TURNO</span>
          <div>{(Object.keys(difficulties) as DifficultyKey[]).map((key,index) => { const item=difficulties[key]; return <button key={key} className={difficulty === key ? "selected" : ""} onClick={() => {setDifficulty(key);setTimeLeft(item.orderTime)}}><small>0{index+1}</small><b>{item.name}</b><span>{item.subtitle}</span><div>{Array.from({length:index+1}).map((_,i)=><Flame key={i} size={13} fill="currentColor"/>)}</div><em>{item.orderTime}s · x{item.multiplier}</em></button>})}</div>
          <button className="open-kitchen" onClick={startShift}><ChefHat/> ABRIR LA COCINA <ArrowRight/></button><small>6 CLIENTES · 4 ESTACIONES · 1 TURNO</small>
        </div>
      </section>}

      {gameState === "served" && <section className="result-overlay"><div className="result-card">
        <div className="result-customer" style={avatarStyle(orderIndex)}/><span className="result-kicker"><Trophy/> ORDEN SERVIDA</span><h2>{project.name}</h2><p>{project.detail}</p>
        <div className="result-stars">{[0,1,2].map((item)=><Star key={item} fill={item < stars ? "currentColor" : "none"}/>)}</div>
        <div className="score-grid"><span><small>PUNTOS</small><b>+{lastEarned}</b></span><span><small>TIEMPO</small><b>{Math.ceil(timeLeft)}s</b></span><span><small>ERRORES</small><b>{mistakes}</b></span><span><small>QUEMADOS</small><b>{burnt}</b></span></div>
        <div className="result-actions"><a href={project.url} target="_blank" rel="noreferrer">VER REPOSITORIO <GitBranch/><ArrowRight/></a><button onClick={nextCustomer}>{orderIndex === projects.length-1 ? "CERRAR TURNO" : "SIGUIENTE CLIENTE"}<ArrowRight/></button></div>
      </div></section>}

      {gameState === "failed" && <section className="result-overlay"><div className="result-card failed"><CircleAlert size={40}/><span className="result-kicker">CLIENTE PERDIDO</span><h2>El servicio se demoró.</h2><p>{customer.name} agotó su paciencia. Reiniciá la orden, organizá mejor las estaciones y vigilá la parrilla.</p><button className="retry" onClick={() => resetOrder()}><RotateCcw/> REINTENTAR ORDEN</button></div></section>}

      {gameState === "complete" && <section className="result-overlay"><div className="result-card shift-complete"><Trophy size={45}/><span className="result-kicker">TURNO COMPLETADO</span><h2>Cocina cerrada.<br/>Portfolio servido.</h2><p>Atendiste los seis proyectos de Ignacio y conociste cada sistema desde sus componentes.</p><strong>{score.toString().padStart(6,"0")} PUNTOS</strong><div className="result-actions"><a href="https://github.com/igna-s" target="_blank" rel="noreferrer">EXPLORAR GITHUB <GitBranch/><ArrowRight/></a><button onClick={() => setGameState("intro")}>NUEVO TURNO <RotateCcw/></button></div></div></section>}
    </main>
  );
}
