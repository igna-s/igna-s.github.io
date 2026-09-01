export type DifficultyKey = "calm" | "service" | "rush";

export type Ingredient = {
  id: string;
  name: string;
  category: "ai" | "web" | "data" | "systems" | "creative" | "quantum";
  color: string;
  glyph: string;
};

export type Recipe = {
  id: string;
  project: string;
  subtitle: string;
  subtitleEn: string;
  description: string;
  descriptionEn: string;
  repo: string;
  year: string;
  ingredientIds: string[];
  customer: { name: string; role: string; quote: string; quoteEn: string; avatar: number };
  targetCuts: number;
};

export const DIFFICULTIES = {
  calm: { name: "Turno tranquilo", label: "Aprendiz", patience: 150, ovenRate: 0.72, multiplier: 1 },
  service: { name: "Servicio profesional", label: "Chef", patience: 115, ovenRate: 0.92, multiplier: 1.35 },
  rush: { name: "Hora pico", label: "Executive", patience: 85, ovenRate: 1.18, multiplier: 1.8 },
} as const;

export const INGREDIENTS: Ingredient[] = [
  { id: "langgraph", name: "LangGraph", category: "ai", color: "#f06f4d", glyph: "LG" },
  { id: "fastapi", name: "FastAPI", category: "web", color: "#26b99a", glyph: "FA" },
  { id: "react", name: "React", category: "web", color: "#59c8ef", glyph: "RE" },
  { id: "postgres", name: "PostgreSQL", category: "data", color: "#7294c2", glyph: "PG" },
  { id: "qiskit", name: "Qiskit", category: "quantum", color: "#825ee4", glyph: "QK" },
  { id: "qdrant", name: "Qdrant", category: "data", color: "#dc526b", glyph: "QD" },
  { id: "n8n", name: "n8n", category: "web", color: "#ef7659", glyph: "N8" },
  { id: "ollama", name: "Ollama", category: "ai", color: "#d0b07c", glyph: "OL" },
  { id: "gemini", name: "Gemini", category: "ai", color: "#589af0", glyph: "GE" },
  { id: "three", name: "Three.js", category: "creative", color: "#e4c164", glyph: "3D" },
  { id: "vrm", name: "VRM", category: "creative", color: "#c475d8", glyph: "VR" },
  { id: "webaudio", name: "Web Audio", category: "creative", color: "#ed9b51", glyph: "WA" },
  { id: "python", name: "Python", category: "systems", color: "#e2b844", glyph: "PY" },
  { id: "autograd", name: "Autograd", category: "ai", color: "#d8664f", glyph: "AG" },
  { id: "backprop", name: "Backprop", category: "ai", color: "#a988df", glyph: "BP" },
  { id: "llm", name: "LLMs", category: "ai", color: "#6eae79", glyph: "LL" },
  { id: "agents", name: "AI Agents", category: "ai", color: "#e17a4f", glyph: "AI" },
  { id: "mi300x", name: "MI300X", category: "systems", color: "#e04b45", glyph: "MX" },
  { id: "serverless", name: "Serverless", category: "web", color: "#8fa6cf", glyph: "SV" },
  { id: "unity", name: "Unity", category: "creative", color: "#d9dcdf", glyph: "UN" },
  { id: "csharp", name: "C#", category: "systems", color: "#9772cd", glyph: "C#" },
  { id: "shaderlab", name: "ShaderLab", category: "creative", color: "#5ab285", glyph: "SL" },
  { id: "embeddedc", name: "Embedded C", category: "systems", color: "#e8a445", glyph: "EC" },
  { id: "fsm", name: "Finite State Machine", category: "systems", color: "#e36155", glyph: "FSM" },
  { id: "esp8266", name: "ESP8266", category: "systems", color: "#5da8c6", glyph: "ES" },
  { id: "hx711", name: "HX711", category: "systems", color: "#d58f52", glyph: "HX" },
  { id: "pygame", name: "Pygame", category: "creative", color: "#88b75c", glyph: "PG" },
  { id: "grover", name: "Grover", category: "quantum", color: "#735bc9", glyph: "GR" },
];

export const RECIPES: Recipe[] = [
  {
    id: "vaultmind", project: "VaultMind AI", subtitle: "RAG bancario trazable", subtitleEn: "Traceable banking RAG", year: "2026",
    description: "Aplicación full-stack de conocimiento financiero con investigación multiagente, búsqueda y razonamiento en varios pasos.",
    descriptionEn: "Full-stack financial knowledge application with multi-agent research, search and multi-step reasoning.",
    repo: "https://github.com/igna-s/VaultMind-AI-RAG-Banking-Agent",
    ingredientIds: ["langgraph", "fastapi", "react", "postgres"], targetCuts: 6,
    customer: { name: "Valentina", role: "Product Lead", quote: "Necesito inteligencia, pero también poder auditar cada respuesta.", quoteEn: "I need intelligence, but I also need to audit every answer.", avatar: 0 },
  },
  {
    id: "qiskit", project: "Qiskit Migration", subtitle: "Quantum × Retrieval", subtitleEn: "Quantum × Retrieval", year: "2025",
    description: "Pipeline RAG para migrar código cuántico legado a versiones modernas de Qiskit con sugerencias contextuales.",
    descriptionEn: "RAG pipeline for migrating legacy quantum code to modern Qiskit versions with contextual suggestions.",
    repo: "https://github.com/igna-s/Qiskit-RAG-Migration-Assistant",
    ingredientIds: ["qiskit", "qdrant", "n8n", "ollama"], targetCuts: 8,
    customer: { name: "Bruno", role: "Quantum Developer", quote: "Mi código quedó atrás. Quiero modernizarlo sin perder el contexto.", quoteEn: "My code fell behind. I want to modernize it without losing context.", avatar: 1 },
  },
  {
    id: "avatar", project: "Realtime AI Avatar", subtitle: "Experiencia multimodal", subtitleEn: "Multimodal experience", year: "2026",
    description: "Interfaz de avatar VRM con Gemini, interacción por voz de baja latencia y escena 3D en tiempo real.",
    descriptionEn: "VRM avatar interface with Gemini, low-latency voice interaction and a real-time 3D scene.",
    repo: "https://github.com/igna-s/Realtime_Avatar_AI_Companion",
    ingredientIds: ["gemini", "three", "vrm", "webaudio"], targetCuts: 6,
    customer: { name: "Mei", role: "Creative Technologist", quote: "Quiero que responda, hable y se sienta realmente vivo.", quoteEn: "I want it to answer, speak and feel truly alive.", avatar: 2 },
  },
  {
    id: "michigrad", project: "Michigrad", subtitle: "Deep learning desde cero", subtitleEn: "Deep learning from scratch", year: "2025",
    description: "Motor de autograd escalar hecho desde cero para comprender diferenciación automática y backpropagation.",
    descriptionEn: "Scalar autograd engine built from scratch to understand automatic differentiation and backpropagation.",
    repo: "https://github.com/igna-s/Michigrad-Deep-Learning-From-Scratch",
    ingredientIds: ["python", "autograd", "backprop", "llm"], targetCuts: 4,
    customer: { name: "Malik", role: "ML Engineer", quote: "Servime los fundamentos; ningún framework debe ocultar la magia.", quoteEn: "Serve me the fundamentals; no framework should hide the magic.", avatar: 3 },
  },
  {
    id: "meridian", project: "Meridian AI Agent", subtitle: "Gestión de proyectos AI-first", subtitleEn: "AI-first project management", year: "2025",
    description: "Plataforma de gestión de proyectos con arquitectura serverless, React e inferencia acelerada sobre AMD MI300X.",
    descriptionEn: "Project management platform with serverless architecture, React and AMD MI300X accelerated inference.",
    repo: "https://github.com/igna-s/Meridian-Ai-Agent",
    ingredientIds: ["react", "agents", "mi300x", "serverless"], targetCuts: 8,
    customer: { name: "Tomás", role: "Startup Founder", quote: "Mi equipo va rápido. Necesito un agente capaz de seguir el ritmo.", quoteEn: "My team moves fast. I need an agent that can keep up.", avatar: 4 },
  },
  {
    id: "embedded", project: "Embedded Security CIAA", subtitle: "Seguridad en tiempo real", subtitleEn: "Real-time security", year: "2025",
    description: "Sistema embebido para EDU-CIAA con interrupciones, GPIO y lógica de máquina de estados finitos en C.",
    descriptionEn: "Embedded EDU-CIAA system with interrupts, GPIO and finite-state-machine logic in C.",
    repo: "https://github.com/igna-s/Embedded-Security-System-CIAA",
    ingredientIds: ["embeddedc", "fsm", "python"], targetCuts: 6,
    customer: { name: "Elena", role: "Systems Researcher", quote: "Tiene que reaccionar en tiempo real y seguir siendo verificable.", quoteEn: "It has to react in real time and remain verifiable.", avatar: 5 },
  },
  {
    id: "multitouch", project: "Multi-Touch Surface", subtitle: "Hardware interactivo", subtitleEn: "Interactive hardware", year: "2024",
    description: "Superficie multi-touch de bajo costo con ESP8266, celdas de carga HX711 y visualización de datos en tiempo real.",
    descriptionEn: "Low-cost multi-touch surface with ESP8266, HX711 load cells and real-time data visualization.",
    repo: "https://github.com/igna-s/Multi-Touch-Interactive-Surface",
    ingredientIds: ["esp8266", "hx711", "embeddedc", "react"], targetCuts: 4,
    customer: { name: "Noah", role: "Interaction Designer", quote: "Quiero que el mundo físico se convierta en una interfaz precisa.", quoteEn: "I want the physical world to become a precise interface.", avatar: 1 },
  },
  {
    id: "arcade", project: "Python Arcade Games", subtitle: "Sistemas de juego", subtitleEn: "Game systems", year: "2024",
    description: "Colección de minijuegos recreados con Python y Pygame para explorar loops, colisiones y diseño de interacción.",
    descriptionEn: "A collection of minigames recreated with Python and Pygame to explore loops, collisions and interaction design.",
    repo: "https://github.com/igna-s/Python-Arcade-Games",
    ingredientIds: ["python", "pygame", "fsm"], targetCuts: 6,
    customer: { name: "Sofía", role: "Game Designer", quote: "Busco controles claros, buen ritmo y sistemas que se entiendan jugando.", quoteEn: "I want clear controls, good pacing and systems you understand by playing.", avatar: 2 },
  },
];

export const ingredientById = new Map(INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]));

export type ToppingSprite = { sheet: "main" | "extra"; index: number; columns: number; rows: number };

export const toppingSpriteById = new Map<string, ToppingSprite>(
  INGREDIENTS.map((ingredient, index) => [
    ingredient.id,
    index < 24
      ? { sheet: "main" as const, index, columns: 6, rows: 4 }
      : { sheet: "extra" as const, index: index - 24, columns: 2, rows: 2 },
  ]),
);
