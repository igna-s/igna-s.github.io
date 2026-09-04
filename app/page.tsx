"use client";

import {
  ArrowLeft, ArrowRight, Check, ChefHat, CircleHelp, Clock3, Contact, Flame, GitBranch,
  Globe2, Languages, Minus, Pause, Play, Plus, RotateCcw, Scissors,
  Settings, Sparkles, Star, Store, Thermometer, Trash2, Trophy, UserRound,
  Volume2, VolumeX, Wind, X,
} from "lucide-react";
import type { CSSProperties, DragEvent as ReactDragEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DIFFICULTIES, INGREDIENTS, RECIPES, ingredientById, toppingSpriteById, type DifficultyKey, type Recipe } from "@/lib/game-data";
import { type Cut, type Placement } from "@/lib/game-engine";
import { gameReducer, initialState, isPrepComplete, SAVE_KEY, type Action, type GameState, type Language } from "@/lib/game-state";
import GameScreenV2 from "./GameScreenV2";

import { copy } from "@/lib/game-copy";

function avatarStyle(index:number):CSSProperties{return{backgroundPosition:`${(index%3)*50}% ${Math.floor(index/3)*100}%`}}
function spriteStyle(id:string):CSSProperties{
  const sprite=toppingSpriteById.get(id)!;
  const column=sprite.index%sprite.columns,row=Math.floor(sprite.index/sprite.columns);
  return {backgroundImage:`url('${sprite.sheet==="main"?"/toppings-sprite-v2.png":"/toppings-extra-v2.png"}')`,backgroundSize:`${sprite.columns*100}% ${sprite.rows*100}%`,backgroundPosition:`${sprite.columns===1?0:column/(sprite.columns-1)*100}% ${sprite.rows===1?0:row/(sprite.rows-1)*100}%`} as CSSProperties;
}
function FoodSprite({id,className=""}:{id:string;className?:string}){const item=ingredientById.get(id)!;return <span className={`food-sprite ${className}`} style={spriteStyle(id)} title={item.name} aria-label={item.name}/>}
function toppingStyle(point:Placement):CSSProperties{return{...spriteStyle(point.id),left:`${point.x}%`,top:`${point.y}%`,transform:`translate(-50%,-50%) rotate(${point.rotation}deg)`} as CSSProperties}

function Pizza({placements,sauce,cheese,cook=0,cuts=[],onPlace,onDropTopping,selected,mode="prep",onCutStart,onCutEnd}:{placements:Placement[];sauce:number;cheese:number;cook?:number;cuts?:Cut[];selected?:string|null;mode?:"prep"|"oven"|"cut";onPlace?:(x:number,y:number)=>void;onDropTopping?:(id:string,x:number,y:number)=>void;onCutStart?:(x:number,y:number)=>void;onCutEnd?:(x:number,y:number)=>void}){
  const ref=useRef<HTMLDivElement>(null);
  const coords=(event:{clientX:number;clientY:number})=>{const rect=ref.current!.getBoundingClientRect();return{x:(event.clientX-rect.left)/rect.width*100,y:(event.clientY-rect.top)/rect.height*100}};
  const drop=(event:ReactDragEvent)=>{event.preventDefault();const p=coords(event),id=event.dataTransfer.getData("text/topping");if(id&&Math.hypot(p.x-50,p.y-50)<46)onDropTopping?.(id,p.x,p.y)};
  const guides=selected?[[28,30],[70,34],[47,72]]:[];
  return <div className={`pizza-stage ${mode}`}><div ref={ref} className={`pizza ${cook>105?"overdone":""} ${selected?"is-placing":""}`} style={{"--sauce-alpha":sauce/100,"--cheese-alpha":cheese/100,"--bake":Math.min(1,cook/100)} as CSSProperties} onDragOver={event=>event.preventDefault()} onDrop={drop} onPointerDown={(event:ReactPointerEvent)=>{const p=coords(event);if(mode==="cut"){event.currentTarget.setPointerCapture(event.pointerId);onCutStart?.(p.x,p.y)}else if(mode==="prep"&&selected&&Math.hypot(p.x-50,p.y-50)<46)onPlace?.(p.x,p.y)}} onPointerUp={(event:ReactPointerEvent)=>{if(mode==="cut"){const p=coords(event);onCutEnd?.(p.x,p.y)}}} role="application" tabIndex={0} aria-label="Interactive pizza workspace" onKeyDown={event=>{if(event.key==="Enter"&&selected&&onPlace)onPlace(50+Math.cos(placements.length*2.3)*28,50+Math.sin(placements.length*2.3)*28)}}><div className="pizza-sauce"/><div className="pizza-cheese"/>{mode==="prep"&&guides.map(([x,y],index)=><i key={index} className="placement-guide" style={{left:`${x}%`,top:`${y}%`}}>{index+1}</i>)}{placements.map((point,index)=><span key={`${point.id}-${index}`} className="food-piece" style={toppingStyle(point)} title={ingredientById.get(point.id)!.name}/>) }<div className="bake-shade"/>{cuts.map((cut,index)=><i key={index} className="cut-line" style={{left:`${cut.x1}%`,top:`${cut.y1}%`,width:`${Math.hypot(cut.x2-cut.x1,cut.y2-cut.y1)}%`,transform:`rotate(${Math.atan2(cut.y2-cut.y1,cut.x2-cut.x1)*180/Math.PI}deg)`}}/>)}</div></div>
}

function RecipeRail({recipe,counts,sauce,cheese,language}:{recipe:Recipe;counts:number[];sauce:number;cheese:number;language:Language}){
  return <div className="recipe-rail"><div className="recipe-rail-title"><ClipboardIcon/><span>{language==="es"?"RECETA SIEMPRE VISIBLE":"ALWAYS-VISIBLE RECIPE"}</span><b>{recipe.project}</b></div><div className={`recipe-base ${sauce>=75?"done":""}`}><i>01</i><span>🍅</span><b>{language==="es"?"Salsa":"Sauce"}</b><small>{sauce}% / 75%</small></div><div className={`recipe-base ${cheese>=75?"done":""}`}><i>02</i><span>🧀</span><b>{language==="es"?"Queso":"Cheese"}</b><small>{cheese}% / 75%</small></div>{recipe.ingredientIds.map((id,index)=><div className={`recipe-chip ${counts[index]>=3?"done":""}`} key={id}><FoodSprite id={id}/><b>{ingredientById.get(id)!.name}</b><small>{counts[index]}/3</small>{counts[index]>=3&&<Check/>}</div>)}</div>
}
function ClipboardIcon(){return <span className="clipboard-mark">▤</span>}

type ProjectFilter = "all" | "ai" | "systems" | "interactive";
const projectCategories: Record<string, Exclude<ProjectFilter,"all">> = {
  vaultmind:"ai", qiskit:"ai", avatar:"interactive", michigrad:"systems",
  meridian:"ai", embedded:"systems", multitouch:"interactive", arcade:"interactive",
};

type DroneSimState = "unleveled" | "leveling" | "leveled" | "disturbed";

function PortfolioLanding({state,dispatch}:{state:GameState;dispatch:(a:Action)=>void}){
  const [filter,setFilter]=useState<ProjectFilter>("all");
  const [droneState,setDroneState]=useState<DroneSimState>("unleveled");
  const [droneTilt,setDroneTilt]=useState<number>(-7.5);
  const [consoleTilt,setConsoleTilt]=useState<number>(-1.5);
  const [droneMotors,setDroneMotors]=useState({m1:94,m2:63,m3:89,m4:62,pitch:"-7.4°",roll:"+4.1°"});
  const [windActive,setWindActive]=useState(false);

  const bridgeConsoleRef=useRef<HTMLDivElement>(null);
  const hasAutoLeveledRef=useRef<boolean>(false);
  const timersRef=useRef<NodeJS.Timeout[]>([]);
  const perturbDirectionRef=useRef<number>(1);

  const autoLevelDrone=()=>{
    timersRef.current.forEach(clearTimeout);
    timersRef.current=[];

    setDroneState("leveling");
    setDroneTilt(-1.8);
    setConsoleTilt(-0.3);
    setDroneMotors({m1:83,m2:74,m3:82,m4:75,pitch:"-1.8°",roll:"+0.9°"});

    const t=setTimeout(()=>{
      setDroneState("leveled");
      setDroneTilt(0);
      setConsoleTilt(0);
      setDroneMotors({m1:78,m2:76,m3:81,m4:79,pitch:"0.0°",roll:"0.0°"});
      setWindActive(false);
    },450);
    timersRef.current.push(t);
  };

  const triggerPerturbation=()=>{
    timersRef.current.forEach(clearTimeout);
    timersRef.current=[];
    hasAutoLeveledRef.current=true;

    const dir=perturbDirectionRef.current;
    perturbDirectionRef.current=-dir;

    const targetTilt=dir*8.2;
    const targetConsoleTilt=dir*1.3;

    setWindActive(true);
    setDroneState("disturbed");
    setDroneTilt(targetTilt);
    setConsoleTilt(targetConsoleTilt);

    if(dir>0){
      setDroneMotors({m1:62,m2:96,m3:65,m4:92,pitch:"+8.2°",roll:"-4.5°"});
    }else{
      setDroneMotors({m1:96,m2:62,m3:92,m4:65,pitch:"-8.2°",roll:"+4.5°"});
    }

    const t1=setTimeout(()=>{
      setWindActive(false);
      setDroneTilt(targetTilt*0.25);
      setConsoleTilt(targetConsoleTilt*0.25);
      setDroneMotors({m1:82,m2:80,m3:82,m4:79,pitch:dir>0?"+2.0°":"-2.0°",roll:"0.0°"});
    },480);

    const t2=setTimeout(()=>{
      setDroneState("leveled");
      setDroneTilt(0);
      setConsoleTilt(0);
      setDroneMotors({m1:78,m2:76,m3:81,m4:79,pitch:"0.0°",roll:"0.0°"});
    },950);

    timersRef.current.push(t1,t2);
  };

  useEffect(()=>{
    const el=bridgeConsoleRef.current;
    if(!el||hasAutoLeveledRef.current)return;

    const observer=new IntersectionObserver(
      (entries)=>{
        for(const entry of entries){
          const rect=entry.boundingClientRect;
          const vh=window.innerHeight||document.documentElement.clientHeight;
          const isFullyShown=(rect.top>=0&&rect.bottom<=vh+60)||entry.intersectionRatio>=0.55;
          if(isFullyShown&&!hasAutoLeveledRef.current){
            hasAutoLeveledRef.current=true;
            observer.disconnect();
            const delay=setTimeout(()=>{
              autoLevelDrone();
            },350);
            timersRef.current.push(delay);
          }
        }
      },
      {threshold:[0.3,0.55,0.8,1.0]}
    );

    observer.observe(el);
    return()=>{
      observer.disconnect();
      timersRef.current.forEach(clearTimeout);
    };
  },[]);

  const es=state.language==="es";
  const text=es?{
    navProjects:"Proyectos",navExpertise:"Especialidad",navGame:"Experiencia jugable",navContact:"Contacto",
    kicker:"Computer Engineer · IA · Sistemas · Interfaces",
    titleA:"Ingeniería que une",titleB:"modelos, software",titleC:"y mundo físico.",
    intro:"Diseño y construyo productos inteligentes de punta a punta: desde agentes y retrieval hasta sistemas embebidos, experiencias 3D y hardware interactivo.",
    viewProjects:"Ver proyectos",play:"Entrar al minijuego",source:"GitHub",bridgeTag:"La idea detrás del puente",bridgeTitle:"Software que piensa. Hardware que interactúa.",bridgeText:"Mi trabajo vive entre dos orillas: modelos y producto de un lado; señales, sensores y sistemas físicos del otro. La ingeniería es el puente que los vuelve una sola experiencia.",
    hl1:"IA aplicada sin fricción",hl2:"Firmware y tiempo real",hl3:"Arquitectura full-stack",hl4:"Interacción sensorial",
    droneTopTag:"00 / SISTEMA EN TIEMPO REAL",
    droneStatusNormal:"SISTEMA EN EQUILIBRIO",
    droneStatusWind:"COMPENSANDO RÁFAGA",
    droneStatusCalib:"CORRIGIENDO BALANCE",
    droneCardQuote:"El software calcula la corrección en microsegundos; el hardware actúa en el mundo físico para mantener el equilibrio.",
    droneSoftwareLabel:"Software",
    droneSoftwareNormal:"Control de balance",
    droneSoftwareWind:"Calcula corrección",
    droneSoftwareSubNormal:"Lazo cerrado",
    droneSoftwareSubWind:"Cálculo en ~2ms",
    droneHardwareLabel:"Hardware",
    droneHardwareNormal:"4 motores activos",
    droneHardwareWind:"Empuje diferencial",
    droneHardwareSubNormal:"Giro nominal",
    droneHardwareSubWind:"Compensando al 95%",
    droneStatusLabel:"Estado",
    droneStable:"Estable",
    droneCorrecting:"Estabilizando",
    droneStatusSubNormal:"Inclinación 0.0°",
    droneStatusSubWind:"Inclinación +3.8°",
    droneHubLabel:"SOFTWARE",
    droneHubNormal:"NIVELADO",
    droneHubWind:"CORRIGIENDO",
    droneCtaNormal:"Simular perturbación de viento",
    droneCtaWind:"Estabilizando sistema...",
    software:"Lógica de alto nivel",softwareText:"Agentes, RAG, productos full-stack e interfaces inteligentes.",hardware:"Señales de bajo nivel",hardwareText:"Sistemas embebidos, sensores, tiempo real e interacción física.",process:"Proceso",processTitle:"Explorar, diseñar, construir y validar.",
    selected:"Trabajo seleccionado",selectedNote:"Proyectos reales, decisiones técnicas concretas y código para explorar.",
    all:"Todos",ai:"IA + datos",systems:"Sistemas",interactive:"Interactivos",open:"Abrir repositorio",archive:"Ver los 8 proyectos",
    expertise:"Cómo trabajo",expertiseTitle:"Del prototipo a un sistema que se puede usar.",
    e1:"IA aplicada",e1d:"RAG, agentes, modelos locales y flujos trazables diseñados alrededor del problema real.",
    e2:"Producto full-stack",e2d:"APIs, datos e interfaces reunidos en experiencias claras, rápidas y mantenibles.",
    e3:"Ingeniería de sistemas",e3d:"Algoritmos, seguridad embebida y aprendizaje automático comprendidos desde sus fundamentos.",
    e4:"Computación interactiva",e4d:"3D en tiempo real, audio, sensores y hardware transformados en interfaces expresivas.",
    gameTag:"El portfolio también se puede jugar",gameTitle:"Stack & Slice",gameText:"Los clientes piden mis proyectos como recetas. Cada tecnología es un ingrediente: preparala, horneala sin quemarla y entregá el producto a tiempo.",gameCta:"Elegir nivel y jugar",gameAside:"8 pedidos · 28 ingredientes · 4 estaciones",
    contactTag:"¿Construimos algo?",contactTitle:"Disponible para conversar sobre ingeniería, IA y productos ambiciosos.",write:"Escribirme",skip:"Ir al contenido",language:"Cambiar idioma",built:"Diseñado y desarrollado por Ignacio Schwindt.",
  }:{
    navProjects:"Projects",navExpertise:"Expertise",navGame:"Playable experience",navContact:"Contact",
    kicker:"Computer Engineer · AI · Systems · Interfaces",
    titleA:"Engineering across",titleB:"models, software",titleC:"and the physical world.",
    intro:"I design and build intelligent products end to end—from agents and retrieval to embedded systems, 3D experiences, and interactive hardware.",
    viewProjects:"View projects",play:"Enter the mini-game",source:"GitHub",bridgeTag:"The thinking behind the bridge",bridgeTitle:"Software that thinks. Hardware that interacts.",bridgeText:"My work lives between two shores: models and product on one side; signals, sensors, and physical systems on the other. Engineering is the bridge that turns them into one experience.",
    hl1:"Frictionless applied AI",hl2:"Real-time & firmware",hl3:"Full-stack architecture",hl4:"Sensory interaction",
    droneTopTag:"00 / REAL-TIME SYSTEM",
    droneStatusNormal:"SYSTEM IN EQUILIBRIUM",
    droneStatusWind:"COMPENSATING GUST",
    droneStatusCalib:"CORRECTING BALANCE",
    droneCardQuote:"Software computes the correction in microseconds; hardware acts in the physical world to maintain balance.",
    droneSoftwareLabel:"Software",
    droneSoftwareNormal:"Balance control",
    droneSoftwareWind:"Computing correction",
    droneSoftwareSubNormal:"Closed loop",
    droneSoftwareSubWind:"Calculated in ~2ms",
    droneHardwareLabel:"Hardware",
    droneHardwareNormal:"4 active motors",
    droneHardwareWind:"Differential thrust",
    droneHardwareSubNormal:"Nominal spin",
    droneHardwareSubWind:"Compensating at 95%",
    droneStatusLabel:"Status",
    droneStable:"Stable",
    droneCorrecting:"Stabilizing",
    droneStatusSubNormal:"Tilt angle 0.0°",
    droneStatusSubWind:"Tilt angle +3.8°",
    droneHubLabel:"SOFTWARE",
    droneHubNormal:"LEVEL",
    droneHubWind:"ADJUSTING",
    droneCtaNormal:"Simulate wind gust perturbation",
    droneCtaWind:"Stabilizing system...",
    software:"High-level logic",softwareText:"Agents, RAG, full-stack products, and intelligent interfaces.",hardware:"Low-level signals",hardwareText:"Embedded systems, sensors, real time, and physical interaction.",process:"Process",processTitle:"Explore, design, build, and validate.",
    selected:"Selected work",selectedNote:"Real projects, concrete technical decisions, and code ready to explore.",
    all:"All",ai:"AI + data",systems:"Systems",interactive:"Interactive",open:"Open repository",archive:"View all 8 projects",
    expertise:"How I work",expertiseTitle:"From prototype to a system people can use.",
    e1:"Applied AI",e1d:"RAG, agents, local models, and traceable workflows designed around the actual problem.",
    e2:"Full-stack product",e2d:"APIs, data, and interfaces assembled into clear, fast, maintainable experiences.",
    e3:"Systems engineering",e3d:"Algorithms, embedded security, and machine learning understood from first principles.",
    e4:"Interactive computing",e4d:"Real-time 3D, audio, sensors, and hardware turned into expressive interfaces.",
    gameTag:"The portfolio is playable, too",gameTitle:"Stack & Slice",gameText:"Customers order my projects as recipes. Every technology is an ingredient: prep it, bake it without burning it, and ship the product on time.",gameCta:"Choose a level and play",gameAside:"8 orders · 28 ingredients · 4 stations",
    contactTag:"Shall we build something?",contactTitle:"Open to conversations about engineering, AI, and ambitious products.",write:"Email me",skip:"Skip to content",language:"Change language",built:"Designed and developed by Ignacio Schwindt.",
  };
  const filters:ProjectFilter[]=["all","ai","systems","interactive"];
  const labels={all:text.all,ai:text.ai,systems:text.systems,interactive:text.interactive};
  const visible=RECIPES.filter(recipe=>filter==="all"||projectCategories[recipe.id]===filter).slice(0,6);
  const expertise=[["01",text.e1,text.e1d],["02",text.e2,text.e2d],["03",text.e3,text.e3d],["04",text.e4,text.e4d]];
  return <div className="portfolio-home">
    <a className="skip-link" href="#main-content">{text.skip}</a>
    <header className="site-header">
      <a className="site-brand" href="#top" aria-label="Ignacio Schwindt — home"><span>IS</span><b>IGNACIO SCHWINDT</b></a>
      <nav aria-label={es?"Navegación principal":"Main navigation"}><a href="#projects">{text.navProjects}</a><a href="#expertise">{text.navExpertise}</a><a href="#game">{text.navGame}</a><a href="#contact">{text.navContact}</a></nav>
      <div className="site-actions"><button onClick={()=>dispatch({type:"LANG",language:es?"en":"es"})} aria-label={text.language}><Globe2/>{es?"EN":"ES"}</button><Link className="nav-game" href="/game/"><Play/>{es?"Jugar":"Play"}</Link></div>
    </header>
    <main id="main-content">
      <section className="portfolio-intro" id="top">
        <div className="intro-copy"><span className="portfolio-kicker"><i/> {text.kicker}</span><h1>{text.titleA}<br/><em>{text.titleB}</em><br/>{text.titleC}</h1><p>{text.intro}</p><div className="intro-actions"><a className="primary-link" href="#projects">{text.viewProjects}<ArrowRight/></a><Link className="intro-play-link" href="/game/"><Play/>{text.play}</Link><a href="https://github.com/igna-s" target="_blank" rel="noreferrer"><GitBranch/>{text.source}</a></div></div>
        <aside className="intro-console profile-console" aria-label={es?"Perfil profesional de Ignacio":"Ignacio's professional profile"}><div className="console-top"><span>GITHUB / @IGNA-S</span><i>ARGENTINA</i></div><div className="profile-image"><Image src="/github-avatar.png" alt={es?"Puente blanco sobre el río, imagen de perfil de Ignacio en GitHub":"White bridge over the river, Ignacio's GitHub profile image"} width={512} height={512} priority unoptimized/><span>{es?"CONECTAR ES CONSTRUIR":"CONNECTING IS BUILDING"}</span></div><p>{es?"Conecto ideas ambiciosas con ingeniería ejecutable.":"I connect ambitious ideas with executable engineering."}</p><div className="console-metrics"><span><b>{RECIPES.length}</b>{es?"proyectos":"projects"}</span><span><b>{INGREDIENTS.length}</b>{es?"tecnologías":"technologies"}</span><span><b>04</b>{es?"dominios":"domains"}</span></div><div className="console-line"/></aside>
      </section>
      <div className="domain-strip" aria-label={es?"Áreas de trabajo":"Areas of work"}><span>APPLIED AI</span><i/> <span>FULL-STACK</span><i/> <span>QUANTUM</span><i/> <span>EMBEDDED</span><i/> <span>INTERACTIVE SYSTEMS</span></div>
      <section className="bridge-section" aria-labelledby="bridge-title">
        <div className="bridge-copy">
          <div className="bridge-header">
            <span>00 / {text.bridgeTag}</span>
          </div>
          <div 
            ref={bridgeConsoleRef}
            className={`bridge-console ${windActive ? "is-windy" : ""} ${droneState !== "leveled" ? "is-active-sim" : ""}`}
            style={{ "--console-tilt": `${consoleTilt}deg` } as React.CSSProperties}
            onClick={triggerPerturbation}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { triggerPerturbation(); } }}
            aria-label={es ? "Simulador de dron: interacción entre software y hardware. Tocar para desestabilizar y ver la autocorrección." : "Drone simulator: software and hardware interaction. Tap to perturb and see auto-correction."}
          >
            <div className="console-top bridge-console-top">
              <div className="console-top-title">
                <span className="live-dot" />
                <b>{text.droneTopTag}</b>
              </div>
              <div className="console-top-status">
                <i className={droneState !== "leveled" ? "val-amber" : "val-green"}>
                  {droneState === "disturbed" 
                    ? text.droneStatusWind 
                    : (droneState === "unleveled" || droneState === "leveling" ? text.droneStatusCalib : text.droneStatusNormal)}
                </i>
              </div>
            </div>

            <div className="drone-sim-stage">
              {windActive && <div className="wind-gust" aria-hidden="true" />}
              
              <div 
                className="drone-airframe"
                style={{ "--drone-tilt": `${droneTilt}deg` } as React.CSSProperties}
              >
                <svg className="drone-arms-svg" viewBox="0 0 300 150" preserveAspectRatio="none" aria-hidden="true">
                  <line x1="50" y1="30" x2="250" y2="120" className="drone-arm" />
                  <line x1="250" y1="30" x2="50" y2="120" className="drone-arm" />
                  <line x1="150" y1="75" x2="50" y2="30" className={`signal-bus ${droneState !== "leveled" ? "surging" : ""}`} />
                  <line x1="150" y1="75" x2="250" y2="30" className={`signal-bus ${droneState !== "leveled" ? "surging" : ""}`} />
                  <line x1="150" y1="75" x2="50" y2="120" className={`signal-bus ${droneState !== "leveled" ? "surging" : ""}`} />
                  <line x1="150" y1="75" x2="250" y2="120" className={`signal-bus ${droneState !== "leveled" ? "surging" : ""}`} />
                </svg>

                {/* Motor 1: Front-Left (CW) */}
                <div className={`drone-motor motor-m1 ${droneTilt < -1 ? "surge-high" : (droneTilt > 1 ? "surge-low" : "")}`}>
                  <div className="rotor-disc rotor-cw">
                    <span className="rotor-blade" />
                  </div>
                  <div className="motor-hud">
                    <b>M1</b>
                    <span className="motor-pct">{droneMotors.m1}%</span>
                  </div>
                </div>

                {/* Motor 2: Front-Right (CCW) */}
                <div className={`drone-motor motor-m2 ${droneTilt > 1 ? "surge-high" : (droneTilt < -1 ? "surge-low" : "")}`}>
                  <div className="rotor-disc rotor-ccw">
                    <span className="rotor-blade" />
                  </div>
                  <div className="motor-hud">
                    <b>M2</b>
                    <span className="motor-pct">{droneMotors.m2}%</span>
                  </div>
                </div>

                {/* Center Flight Controller */}
                <div className={`drone-hub ${droneState !== "leveled" ? "hub-tilted" : ""}`}>
                  <div className="hub-gimbal">
                    <div 
                      className="gimbal-horizon" 
                      style={{ transform: `rotate(${-droneTilt * 1.6}deg)` }}
                    />
                    <div className="gimbal-reticle" />
                  </div>
                  <div className="hub-readout">
                    <b>{text.droneHubLabel}</b>
                    <small>{droneState !== "leveled" ? text.droneHubWind : text.droneHubNormal}</small>
                  </div>
                </div>

                {/* Motor 3: Rear-Left (CCW) */}
                <div className={`drone-motor motor-m3 ${droneTilt < -1 ? "surge-high" : (droneTilt > 1 ? "surge-low" : "")}`}>
                  <div className="rotor-disc rotor-ccw">
                    <span className="rotor-blade" />
                  </div>
                  <div className="motor-hud">
                    <b>M3</b>
                    <span className="motor-pct">{droneMotors.m3}%</span>
                  </div>
                </div>

                {/* Motor 4: Rear-Right (CW) */}
                <div className={`drone-motor motor-m4 ${droneTilt > 1 ? "surge-high" : (droneTilt < -1 ? "surge-low" : "")}`}>
                  <div className="rotor-disc rotor-cw">
                    <span className="rotor-blade" />
                  </div>
                  <div className="motor-hud">
                    <b>M4</b>
                    <span className="motor-pct">{droneMotors.m4}%</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="bridge-card-quote">“{text.droneCardQuote}”</p>

            <div className="console-metrics bridge-metrics">
              <span>
                <small>{text.droneSoftwareLabel}</small>
                <b>{droneState !== "leveled" ? text.droneSoftwareWind : text.droneSoftwareNormal}</b>
                <em>{droneState !== "leveled" ? text.droneSoftwareSubWind : text.droneSoftwareSubNormal}</em>
              </span>
              <span>
                <small>{text.droneHardwareLabel}</small>
                <b className="val-gold">{droneState !== "leveled" ? text.droneHardwareWind : text.droneHardwareNormal}</b>
                <em>{droneState !== "leveled" ? text.droneHardwareSubWind : text.droneHardwareSubNormal}</em>
              </span>
              <span>
                <small>{text.droneStatusLabel}</small>
                <b className={droneState !== "leveled" ? "val-amber" : "val-green"}>
                  <i className="status-ping" />
                  {droneState !== "leveled" ? text.droneCorrecting : text.droneStable}
                </b>
                <em>{droneState !== "leveled" ? `${es ? "Inclinación " : "Tilt angle "}${droneMotors.pitch}` : text.droneStatusSubNormal}</em>
              </span>
            </div>

            <div className="bridge-card-footer">
              <button 
                type="button" 
                className="bridge-sim-btn"
                onClick={(e) => { e.stopPropagation(); triggerPerturbation(); }}
                aria-label={droneState !== "leveled" ? text.droneCtaWind : text.droneCtaNormal}
              >
                <Wind size={14} />
                <span>{droneState !== "leveled" ? text.droneCtaWind : text.droneCtaNormal}</span>
              </button>
            </div>

            <div className="console-line" />
          </div>
          <div className="bridge-editorial">
            <h2 id="bridge-title">{text.bridgeTitle}</h2>
            <p>{text.bridgeText}</p>
            <div className="bridge-highlights">
              <span><i />{text.hl1}</span>
              <span><i />{text.hl2}</span>
              <span><i />{text.hl3}</span>
              <span><i />{text.hl4}</span>
            </div>
          </div>
        </div>
        <div className="bridge-system" aria-label={es?"Conexión entre software y hardware":"Connection between software and hardware"}><article><span>01</span><b>{text.software}</b><p>{text.softwareText}</p><div><i/>AI / LLM / WEB</div></article><div className="bridge-link" aria-hidden="true"><i/><span>ENGINEERING</span><i/></div><article><span>02</span><b>{text.hardware}</b><p>{text.hardwareText}</p><div><i/>EMBEDDED / IOT / RT</div></article></div></section>
      <section className="portfolio-projects" id="projects">
        <div className="section-heading"><div><span>01 / {text.selected}</span><h2>{text.selected}</h2></div><p>{text.selectedNote}</p></div>
        <div className="project-filters" role="group" aria-label={es?"Filtrar proyectos":"Filter projects"}>{filters.map(key=><button key={key} className={filter===key?"active":""} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{labels[key]}</button>)}</div>
        <div className="landing-project-grid">{visible.map(recipe=><article key={recipe.id}><div className="landing-project-head"><span>{String(RECIPES.indexOf(recipe)+1).padStart(2,"0")}</span><time>{recipe.year}</time></div><small>{es?recipe.subtitle:recipe.subtitleEn}</small><h3>{recipe.project}</h3><p>{es?recipe.description:recipe.descriptionEn}</p><div className="project-stack">{recipe.ingredientIds.map(id=><span key={id} style={{"--dot":ingredientById.get(id)!.color} as CSSProperties}>{ingredientById.get(id)!.name}</span>)}</div><a href={recipe.repo} target="_blank" rel="noreferrer" aria-label={`${text.open}: ${recipe.project}`}>{text.open}<ArrowRight/></a></article>)}</div>
        <button className="archive-button" onClick={()=>dispatch({type:"PORTFOLIO"})}>{text.archive}<ArrowRight/></button>
      </section>
      <section className="expertise-section" id="expertise"><div className="section-heading inverse"><div><span>02 / {text.expertise}</span><h2>{text.expertiseTitle}</h2></div><p>{es?"Trabajo entre disciplinas sin perder rigor técnico ni claridad de producto.":"I work across disciplines without losing technical rigor or product clarity."}</p></div><div className="expertise-grid">{expertise.map(([number,title,description])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section className="process-section"><div><span>03 / {text.process}</span><h2>{text.processTitle}</h2></div><ol>{(es?[["01","Explorar","Entender el problema, las restricciones y la experiencia deseada."],["02","Diseñar","Convertir incertidumbre en arquitectura y decisiones comprobables."],["03","Construir","Integrar software, modelos y hardware en un producto coherente."],["04","Validar","Medir, iterar y documentar para que el sistema pueda crecer."]]:[["01","Explore","Understand the problem, constraints, and intended experience."],["02","Design","Turn uncertainty into architecture and testable decisions."],["03","Build","Integrate software, models, and hardware into a coherent product."],["04","Validate","Measure, iterate, and document so the system can grow."]]).map(([n,title,description])=><li key={n}><span>{n}</span><b>{title}</b><p>{description}</p></li>)}</ol></section>
      <section className="game-feature" id="game"><div className="game-feature-art" role="img" aria-label={es?"Restaurante digital Stack and Slice":"Stack and Slice digital restaurant"}><span>PORTFOLIO GAME</span></div><div className="game-feature-copy"><span>{text.gameTag}</span><h2>{text.gameTitle}</h2><p>{text.gameText}</p><small>{text.gameAside}</small><Link className="game-feature-cta" href="/game/"><Play/>{text.gameCta}<ArrowRight/></Link></div></section>
      <section className="contact-section" id="contact"><span>{text.contactTag}</span><h2>{text.contactTitle}</h2><div><a className="contact-primary" href="mailto:ignacio.schwindt.dev@gmail.com"><Contact/>{text.write}</a><a href="https://github.com/igna-s" target="_blank" rel="noreferrer"><GitBranch/>GitHub</a><a href="https://www.linkedin.com/in/ignacio-andres-schwindt" target="_blank" rel="noreferrer"><Globe2/>LinkedIn</a></div><a className="contact-email" href="mailto:ignacio.schwindt.dev@gmail.com">ignacio.schwindt.dev@gmail.com</a></section>
    </main>
    <footer className="site-footer"><a className="site-brand" href="#top"><span>IS</span><b>IGNACIO SCHWINDT</b></a><p>{text.built}</p><span>© {new Date().getFullYear()}</span></footer>
  </div>
}

function GameMenu({state,dispatch,hasSave}:{state:GameState;dispatch:(a:Action)=>void;hasSave:boolean}){
  const t=copy[state.language];const[panel,setPanel]=useState<"none"|"settings"|"credits">("none");const levels=[{index:0,number:"01",es:"Inteligencia aplicada",en:"Applied intelligence",icon:"AI"},{index:3,number:"02",es:"Sistemas desde cero",en:"Systems from scratch",icon:"SYS"},{index:5,number:"03",es:"Mundo físico",en:"Physical world",icon:"HW"}];
  return <main className="title-screen"><div className="facade" aria-hidden="true"/><div className="title-shade" aria-hidden="true"/><header className="title-topbar"><button className="title-back-home" onClick={()=>dispatch({type:"HOME"})} title={t.backHome}><ArrowLeft/><span className="back-full">{t.backHome}</span><span className="back-short">Portfolio</span></button><span className="title-brand-badge"><ChefHat/> IGNACIO&apos;S DEV PIZZERIA</span><div className="lang-switch" aria-label={t.language}><button className={state.language==="es"?"active":""} onClick={()=>dispatch({type:"LANG",language:"es"})}>ES</button><button className={state.language==="en"?"active":""} onClick={()=>dispatch({type:"LANG",language:"en"})}>EN</button></div></header><section className="title-card"><div className="sign-logo"><small>IGNACIO&apos;S</small><h1>STACK <em>&amp;</em> SLICE</h1><span>DEV PIZZERIA · PORTFOLIO GAME</span></div><p className="premise">“{t.premise}”</p><p className="title-note">{t.homeNote}</p><div className="title-actions"><button className="button-primary" onClick={()=>dispatch({type:"START"})}><Play/>{t.play}<ArrowRight/></button><div className={`secondary-actions ${hasSave?"has-save":""}`}>{hasSave&&<button onClick={()=>{const stored=localStorage.getItem(SAVE_KEY);if(stored)dispatch({type:"RESUME",state:JSON.parse(stored)})}}><Clock3/>{t.resume}</button>}<button onClick={()=>dispatch({type:"PORTFOLIO"})}><Sparkles/>{t.portfolio}</button><button onClick={()=>setPanel("settings")}><Settings/>{t.settings}</button></div></div></section><aside className="level-panel"><div className="panel-label"><span>{t.selectLevel}</span><b>{String(levels.findIndex(level=>level.index===state.recipeIndex)+1).padStart(2,"0")}/03</b></div><div className="level-list">{levels.map(level=><button key={level.index} className={state.recipeIndex===level.index?"active":""} onClick={()=>dispatch({type:"SELECT_LEVEL",index:level.index})}><span>{level.number}</span><i>{level.icon}</i><b>{state.language==="es"?level.es:level.en}</b><small>{RECIPES[level.index].project}</small><Check/></button>)}</div><div className="pace-label">{t.selectPace}</div><div className="pace-switch">{(Object.keys(DIFFICULTIES) as DifficultyKey[]).map(key=><button key={key} className={state.difficulty===key?"active":""} onClick={()=>dispatch({type:"DIFFICULTY",difficulty:key})}>{DIFFICULTIES[key].label}</button>)}</div><button className="credits-link" onClick={()=>setPanel("credits")}><CircleHelp/>{t.credits}</button></aside>{panel!=="none"&&<div className="modal-backdrop"><section className="small-modal"><button className="modal-close" onClick={()=>setPanel("none")} aria-label="Close"><X/></button>{panel==="settings"?<><span className="eyebrow">{t.settings}</span><h2>{state.language.toUpperCase()} / {state.sound?"SFX ON":"SFX OFF"}</h2><div className="setting-row"><Languages/><span>{t.language}</span><button onClick={()=>dispatch({type:"LANG",language:state.language==="es"?"en":"es"})}>{state.language==="es"?"English":"Español"}</button></div><div className="setting-row">{state.sound?<Volume2/>:<VolumeX/>}<span>{t.sound}</span><button onClick={()=>dispatch({type:"TOGGLE_SOUND"})}>{state.sound?"ON":"OFF"}</button></div></>:<><span className="eyebrow">{t.credits}</span><h2>Stack &amp; Slice</h2><p>{t.made}. Diseñado y desarrollado por Ignacio Schwindt.</p><a href="mailto:ignacio.schwindt.dev@gmail.com">ignacio.schwindt.dev@gmail.com</a></>}</section></div>}</main>
}

function Portfolio({state,dispatch}:{state:GameState;dispatch:(a:Action)=>void}){const t=copy[state.language];return <main className="portfolio-screen"><header className="portfolio-header"><div className="portfolio-header-nav"><button onClick={()=>dispatch({type:"CLOSE_PORTFOLIO"})}><ArrowLeft/>{t.back}</button><button className="portfolio-home-pill" onClick={()=>dispatch({type:"HOME"})}><ChefHat size={14}/><span className="back-full">{t.backHome}</span><span className="back-short">Portfolio</span></button></div><div><small>STACK &amp; SLICE</small><b>IGNACIO SCHWINDT · COMPUTER ENGINEER</b></div><div className="portfolio-social"><a href="https://github.com/igna-s"><GitBranch/></a><a href="https://www.linkedin.com/in/ignacio-andres-schwindt"><Contact/></a></div></header><section className="portfolio-hero"><span>QUICK PORTFOLIO / NO GAMEPLAY REQUIRED</span><h1>{t.projects}</h1><p>{t.premise}</p></section><section className="portfolio-grid">{RECIPES.map((recipe,index)=><article key={recipe.id}><div className="project-index">{String(index+1).padStart(2,"0")}<span>{recipe.year}</span></div><small>{state.language==="es"?recipe.subtitle:recipe.subtitleEn}</small><h2>{recipe.project}</h2><p>{state.language==="es"?recipe.description:recipe.descriptionEn}</p><div>{recipe.ingredientIds.map(id=><span key={id} style={{"--dot":ingredientById.get(id)!.color} as CSSProperties}>{ingredientById.get(id)!.name}</span>)}</div><a href={recipe.repo} target="_blank" rel="noreferrer">{t.viewCode}<ArrowRight/></a></article>)}</section><section className="stack-marquee"><span>{t.stack}</span>{INGREDIENTS.map(item=><b key={item.id}>{item.name}</b>)}</section></main>}

// Kept as a compatibility fallback while saved v3 sessions migrate to the concurrent kitchen.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function GameScreen({state,dispatch}:{state:GameState;dispatch:(a:Action)=>void}){
  const t=copy[state.language],recipe=RECIPES[state.recipeIndex];const[cutStart,setCutStart]=useState<{x:number;y:number}|null>(null);const requiredCounts=recipe.ingredientIds.map(id=>state.placements.filter(point=>point.id===id).length);const prepReady=isPrepComplete(state);const pantry=useMemo(()=>{const required=recipe.ingredientIds.map(id=>ingredientById.get(id)!);const extras=INGREDIENTS.filter(item=>!recipe.ingredientIds.includes(item.id));return[...required,...extras.slice(state.recipeIndex,state.recipeIndex+5)]},[recipe,state.recipeIndex]);const cookLabel=state.cook<25?t.raw:state.cook<72?t.cooking:state.cook<=100?t.perfect:state.cook<=118?t.burning:t.burnt;const patience=state.patience/DIFFICULTIES[state.difficulty].patience*100;const place=(id:string,x:number,y:number)=>dispatch({type:"PLACE",placement:{id,x,y,rotation:Math.round(Math.random()*180)},correct:recipe.ingredientIds.includes(id)});const addAt=(x:number,y:number)=>{if(state.selected)place(state.selected,x,y)};
  return <main className="game-shell"><div className="kitchen-art" aria-hidden="true"/><div className="game-shade" aria-hidden="true"/><header className="game-header"><button className="game-brand" onClick={()=>dispatch({type:"HOME"})}><ChefHat/><span>STACK &amp; SLICE<small>IGNACIO&apos;S DEV PIZZERIA</small></span></button><div className="game-stats"><span><small>{t.total}</small><b>{state.shiftScore.toString().padStart(6,"0")}</b></span><span><small>{t.level}</small><b>{String(state.recipeIndex+1).padStart(2,"0")}</b></span><span><small>{t.patience}</small><b>{Math.max(0,Math.ceil(state.patience))}s</b></span></div><div className="game-tools"><button onClick={()=>dispatch({type:"LANG",language:state.language==="es"?"en":"es"})}><Globe2/><span>{state.language.toUpperCase()}</span></button><button onClick={()=>dispatch({type:"TOGGLE_SOUND"})}>{state.sound?<Volume2/>:<VolumeX/>}</button><button onClick={()=>dispatch({type:"PORTFOLIO"})}><Sparkles/><span>{t.portfolio}</span></button></div></header><div className="customer-strip"><div className="queue-title"><UserRound/><span>{RECIPES.length-state.recipeIndex-1}<small>{t.queue}</small></span></div>{RECIPES.slice(state.recipeIndex,state.recipeIndex+5).map((item,index)=><div className={`mini-customer ${index===0?"active":""}`} key={item.id}><i style={avatarStyle(item.customer.avatar)}/><span>{item.customer.name}</span></div>)}<div className="patience-meter"><span>{t.patience} · {recipe.customer.name}</span><div><i style={{width:`${patience}%`}}/></div></div></div><nav className="station-rail" aria-label="Game stations">{([["reception",Store,t.reception],["prep",ChefHat,t.prep],["oven",Flame,t.oven],["cut",Scissors,t.cut]] as const).map(([key,Icon,label],index)=><button key={key} className={state.station===key?"active":""} disabled={state.station!==key}><span>0{index+1}</span><Icon/><b>{label}</b>{state.station===key&&<i/>}</button>)}</nav><div className="game-floor"><aside className="ticket"><div className="ticket-top"><b>{t.order} #{String(state.recipeIndex+1).padStart(2,"0")}</b><span>{recipe.year}</span></div><small>CLIENT · {recipe.customer.name.toUpperCase()}</small><h1>{recipe.project}</h1><em>{state.language==="es"?recipe.subtitle:recipe.subtitleEn}</em><p>{state.language==="es"?recipe.description:recipe.descriptionEn}</p><div className="ticket-rule"/><b className="ticket-recipe">{t.requested}</b>{recipe.ingredientIds.map((id,index)=>{const item=ingredientById.get(id)!;const count=requiredCounts[index];return <div className={`ticket-component ${count>=3?"done":""}`} key={id}><span style={{"--component":item.color} as CSSProperties}>{item.glyph}</span><b>{item.name}</b><small>{count}/3</small></div>})}<div className="coverage"><span>{t.sauce}<b>{state.sauce}%</b></span><span>{t.cheese}<b>{state.cheese}%</b></span></div></aside><section className={`station-work station-${state.station}`}>
    {state.station==="reception"&&<div className="reception-scene">
      <div className="ambient-particles" aria-hidden="true">{Array.from({length:8},(_,index)=><i key={index}/>)}</div>
      <div className="incoming-orders"><span>{state.language==="es"?"PEDIDOS ENTRANTES":"INCOMING ORDERS"}</span>{RECIPES.slice(state.recipeIndex,state.recipeIndex+3).map((order,index)=><div className={index===0?"active":""} key={order.id}><b>#{String(state.recipeIndex+index+1).padStart(2,"0")}</b><i style={avatarStyle(order.customer.avatar)}/><span>{order.customer.name}<small>{order.project}</small></span>{index===0?<em>NOW</em>:<Clock3/>}</div>)}</div>
      <div className="customer-full" style={avatarStyle(recipe.customer.avatar)}><span className="customer-shadow"/></div><div className="speech-card"><span>{recipe.customer.role}</span><h2>{recipe.customer.name}</h2><blockquote>“{state.language==="es"?recipe.customer.quote:recipe.customer.quoteEn}”</blockquote><div><small>{t.requested}</small><b>{recipe.project}</b><p>{state.language==="es"?recipe.description:recipe.descriptionEn}</p><div className="speech-recipe">{recipe.ingredientIds.map(id=><span key={id}><FoodSprite id={id}/>{ingredientById.get(id)!.name}</span>)}</div></div><button className="main-action" onClick={()=>dispatch({type:"ACCEPT"})}>{t.accept}<ArrowRight/></button></div>
    </div>}
    {state.station==="prep"&&<div className="prep-scene">
      <div className="work-heading"><span><ChefHat/>{t.prep}</span><b>{prepReady?"READY":"MISE EN PLACE"}</b></div>
      <RecipeRail recipe={recipe} counts={requiredCounts} sauce={state.sauce} cheese={state.cheese} language={state.language}/>
      <p className="station-help">{t.prepHelp} <strong>{state.language==="es"?"Arrastrá una pieza o tocala y luego tocá la pizza.":"Drag a piece, or tap it and then tap the pizza."}</strong></p>
      <div className="prep-layout">
        <div className="pizza-zone"><Pizza placements={state.placements} sauce={state.sauce} cheese={state.cheese} selected={state.selected} onPlace={addAt} onDropTopping={place}/><div className="coverage-controls"><button onClick={()=>dispatch({type:"ADD_SAUCE"})} style={{"--fill":`${state.sauce}%`} as CSSProperties}><span>01</span><b>{t.sauce}</b><i/></button><button onClick={()=>dispatch({type:"ADD_CHEESE"})} style={{"--fill":`${state.cheese}%`} as CSSProperties}><span>02</span><b>{t.cheese}</b><i/></button></div></div>
        <div className="topping-bank"><div className="bank-title"><span>{t.toppings}</span><b>{state.selected?ingredientById.get(state.selected)!.name:(state.language==="es"?"ELEGÍ O ARRASTRÁ":"CHOOSE OR DRAG")}</b></div><div className="topping-grid">{pantry.map(item=><button key={item.id} draggable className={`${state.selected===item.id?"active":""} ${recipe.ingredientIds.includes(item.id)?"required":"decoy"}`} onDragStart={event=>{event.dataTransfer.setData("text/topping",item.id);dispatch({type:"SELECT_TOPPING",id:item.id})}} onClick={()=>dispatch({type:"SELECT_TOPPING",id:item.id})} style={{"--topping":item.color} as CSSProperties}><FoodSprite id={item.id}/><b>{item.name}</b><small>{recipe.ingredientIds.includes(item.id)?(state.language==="es"?"RECETA":"RECIPE"):"EXTRA"}</small><em>{state.placements.filter(point=>point.id===item.id).length}</em></button>)}</div><button className="undo-button" onClick={()=>dispatch({type:"UNDO"})} disabled={!state.placements.length}><RotateCcw/>{t.undo}</button></div>
      </div>
      <div className={`prep-status ${prepReady?"ready":""}`}><span>{prepReady?<Check/>:<Clock3/>}</span><div><b>{prepReady?(state.language==="es"?"RECETA COMPLETA":"RECIPE COMPLETE"):(state.language==="es"?"SEGUÍ LA COMANDA DE ARRIBA":"FOLLOW THE ORDER ABOVE")}</b><small>{state.language==="es"?"Salsa 75% · Queso 75% · 3 piezas de cada componente":"Sauce 75% · Cheese 75% · 3 pieces of each component"}</small></div></div>
      <button className="main-action station-action" onClick={()=>dispatch({type:"BAKE"})} disabled={!prepReady}><Flame/>{prepReady?t.bake:t.missing}<ArrowRight/></button>
    </div>}
    {state.station==="oven"&&<div className="oven-scene">
      <div className="work-heading"><span><Flame/>{t.oven}</span><b className={state.cook>100?"danger":""}>{cookLabel}</b></div>
      <RecipeRail recipe={recipe} counts={requiredCounts} sauce={state.sauce} cheese={state.cheese} language={state.language}/>
      <p className="station-help">{t.ovenHelp}</p><div className="oven-layout"><div className={`commercial-oven ${state.ovenActive?"on":""} ${state.cook>105?"smoking":""}`}><div className="oven-metal"><span>STACK &amp; SLICE · DECK 01</span><div className="oven-display"><small>CHAMBER</small><b>{state.temperature}°C</b><i>{state.ovenActive?"HEATING":"HOLD"}</i></div></div><div className="oven-window"><div className="oven-glow"/><div className="heat-waves"/><Pizza placements={state.placements} sauce={state.sauce} cheese={state.cheese} cook={state.cook} mode="oven"/>{state.cook>105&&<div className="oven-smoke">● ● ●</div>}</div><div className="oven-handle"/></div><aside className="oven-console"><Thermometer/><span>{t.heat}</span><b>{state.temperature}°</b><div className="temp-buttons"><button onClick={()=>dispatch({type:"TEMP",amount:-15})}><Minus/></button><button onClick={()=>dispatch({type:"TEMP",amount:15})}><Plus/></button></div><div className="cook-gauge"><span style={{height:`${Math.min(100,state.cook/1.25)}%`}}/><i className="sweet-spot"/><b>{Math.round(state.cook)}%</b></div><button onClick={()=>dispatch({type:"TOGGLE_OVEN"})}>{state.ovenActive?<><Pause/>{t.pause}</>:<><Play/>{t.resumeOven}</>}</button></aside></div><button className="main-action station-action" onClick={()=>dispatch({type:"TAKE_OUT"})} disabled={state.cook<45}><Scissors/>{t.remove}<ArrowRight/></button>
    </div>}
    {state.station==="cut"&&<div className="cut-scene">
      <div className="work-heading"><span><Scissors/>{t.cut}</span><b>{recipe.targetCuts} {t.slices}</b></div>
      <RecipeRail recipe={recipe} counts={requiredCounts} sauce={state.sauce} cheese={state.cheese} language={state.language}/>
      <p className="station-help">{t.cutHelp}</p><div className="cut-layout"><div className="cut-board"><Pizza placements={state.placements} sauce={state.sauce} cheese={state.cheese} cook={state.cook} cuts={state.cuts} mode="cut" onCutStart={(x,y)=>setCutStart({x,y})} onCutEnd={(x,y)=>{if(cutStart){dispatch({type:"ADD_CUT",cut:{x1:cutStart.x,y1:cutStart.y,x2:x,y2:y}});setCutStart(null)}}}/><span className="board-brand">STACK &amp; SLICE · MAPLE BOARD</span></div><aside className="cut-ticket"><Scissors/><small>CUT PLAN</small><b>{recipe.targetCuts}</b><span>{t.slices}</span><div>{state.cuts.map((_,index)=><i key={index}/>)}</div><button onClick={()=>dispatch({type:"AUTO_CUT"})}><Sparkles/>{t.precise}</button><button onClick={()=>dispatch({type:"RESTART_ORDER"})}><Trash2/>{t.restart}</button></aside></div><button className="main-action station-action" onClick={()=>dispatch({type:"FINISH"})} disabled={!state.cuts.length}><Check/>{t.deliver}<ArrowRight/></button>
    </div>}
    {state.station==="result"&&state.result&&<div className="result-scene"><div className="result-customer" style={avatarStyle(recipe.customer.avatar)}/><span className="eyebrow"><Trophy/>{t.result}</span><h2>{state.language==="es"?(state.result.stars===3?"Ingeniería perfecta.":state.result.stars===2?"Entrega sólida.":"Iteración publicada."):(state.result.stars===3?"Perfectly engineered.":state.result.stars===2?"Strong delivery.":"Iteration shipped.")}</h2><div className="result-stars">{[0,1,2].map(index=><Star key={index} fill={index<state.result!.stars?"currentColor":"none"}/>)}</div><div className="score-breakdown">{[[t.orderScore,state.result.order],[t.distribution,state.result.distribution],[t.bakeScore,state.result.bake],[t.cutScore,state.result.cut],[t.service,state.result.service]].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b><i><em style={{width:`${value}%`}}/></i></div>)}</div><div className="result-total"><span>{t.total}</span><b>+{state.result.total.toLocaleString()}</b></div><div className="result-actions"><a href={recipe.repo} target="_blank" rel="noreferrer"><GitBranch/>{t.openRepo}</a><button onClick={()=>dispatch({type:"NEXT"})}>{t.next}<ArrowRight/></button></div></div>}
    </section></div><footer className="game-footer"><span>{t.made}</span><span>{DIFFICULTIES[state.difficulty].name} · {recipe.project}</span><a href="mailto:ignacio.schwindt.dev@gmail.com">ignacio.schwindt.dev@gmail.com</a></footer></main>
}

type SfxCue=Action["type"]|"ARRIVAL"|"OVEN_PROGRESS"|"OVEN_READY"|"OVEN_BURNING"|"RESULT_LOW"|"RESULT_HIGH";
type Tone={frequency:number;delay?:number;duration?:number;gain?:number;wave?:OscillatorType;endFrequency?:number};

let sharedAudioContext:AudioContext|null=null;

function getAudioContext(){
  if(typeof window==="undefined")return null;
  const AudioCtor=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!AudioCtor)return null;
  if(!sharedAudioContext||sharedAudioContext.state==="closed")sharedAudioContext=new AudioCtor();
  if(sharedAudioContext.state==="suspended")void sharedAudioContext.resume();
  return sharedAudioContext;
}

function playNoise(context:AudioContext,start:number,duration=.1,gainValue=.025){
  const frames=Math.max(1,Math.floor(context.sampleRate*duration));
  const buffer=context.createBuffer(1,frames,context.sampleRate),data=buffer.getChannelData(0);
  for(let index=0;index<frames;index+=1)data[index]=(Math.random()*2-1)*(1-index/frames);
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
  source.buffer=buffer;filter.type="bandpass";filter.frequency.value=1450;filter.Q.value=.8;
  gain.gain.setValueAtTime(gainValue,start);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  source.connect(filter).connect(gain).connect(context.destination);source.start(start);source.stop(start+duration);
}

function playSfx(cue:SfxCue){
  if(cue==="TICK")return;
  const context=getAudioContext();if(!context)return;
  const patterns:Partial<Record<SfxCue,Tone[]>>={
    ACCEPT:[{frequency:392,duration:.12,wave:"triangle"},{frequency:523,delay:.1,duration:.18,wave:"triangle"}],
    PLACE:[{frequency:250,duration:.06,wave:"triangle",endFrequency:185}],
    ADD_SAUCE:[{frequency:135,duration:.16,wave:"sawtooth",endFrequency:92,gain:.025}],
    ADD_CHEESE:[{frequency:720,duration:.04,wave:"square",gain:.012},{frequency:910,delay:.05,duration:.04,wave:"square",gain:.01},{frequency:780,delay:.1,duration:.04,wave:"square",gain:.01}],
    BAKE:[{frequency:92,duration:.2,wave:"sine",endFrequency:58,gain:.05},{frequency:185,delay:.05,duration:.14,wave:"sawtooth",gain:.018}],
    TAKE_OUT:[{frequency:330,duration:.08,wave:"triangle"},{frequency:494,delay:.07,duration:.16,wave:"triangle"}],
    ADD_CUT:[{frequency:1180,duration:.055,wave:"sawtooth",endFrequency:520,gain:.018}],
    AUTO_CUT:[{frequency:420,duration:.06},{frequency:560,delay:.07,duration:.06},{frequency:700,delay:.14,duration:.1}],
    FINISH:[{frequency:523,duration:.1},{frequency:659,delay:.09,duration:.1},{frequency:784,delay:.18,duration:.22}],
    NEXT:[{frequency:587,duration:.08,wave:"triangle"},{frequency:880,delay:.09,duration:.16,wave:"triangle"}],
    SWITCH_ORDER:[{frequency:315,duration:.07,wave:"triangle",endFrequency:390}],NAV_STATION:[{frequency:220,duration:.045,wave:"square",gain:.014},{frequency:294,delay:.04,duration:.06,wave:"square",gain:.012}],
    RESTART_ORDER:[{frequency:260,duration:.08,wave:"triangle"},{frequency:175,delay:.08,duration:.15,wave:"triangle"}],TOGGLE_OVEN:[{frequency:110,duration:.18,wave:"sawtooth",endFrequency:165,gain:.025}],
    TOGGLE_SOUND:[{frequency:440,duration:.06},{frequency:660,delay:.07,duration:.12}],ARRIVAL:[{frequency:659,duration:.08,wave:"triangle"},{frequency:880,delay:.1,duration:.08,wave:"triangle"},{frequency:988,delay:.2,duration:.16,wave:"triangle"}],
    OVEN_PROGRESS:[{frequency:176,duration:.055,wave:"sine",gain:.018}],OVEN_READY:[{frequency:523,duration:.08},{frequency:784,delay:.1,duration:.16}],OVEN_BURNING:[{frequency:210,duration:.12,wave:"square",gain:.02},{frequency:175,delay:.16,duration:.12,wave:"square",gain:.02},{frequency:210,delay:.32,duration:.16,wave:"square",gain:.02}],
    RESULT_LOW:[{frequency:294,duration:.12,wave:"triangle"},{frequency:220,delay:.13,duration:.22,wave:"triangle"}],RESULT_HIGH:[{frequency:523,duration:.1},{frequency:659,delay:.1,duration:.1},{frequency:784,delay:.2,duration:.1},{frequency:1047,delay:.3,duration:.25}],
  };
  const pattern=patterns[cue]??[{frequency:285,duration:.055,wave:"triangle",gain:.018}];
  const now=context.currentTime+.015;
  pattern.forEach(tone=>{const oscillator=context.createOscillator(),gain=context.createGain(),start=now+(tone.delay??0),duration=tone.duration??.1;oscillator.type=tone.wave??"sine";oscillator.frequency.setValueAtTime(tone.frequency,start);oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency??tone.frequency,start+duration);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(tone.gain??.032,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);oscillator.connect(gain).connect(context.destination);oscillator.start(start);oscillator.stop(start+duration+.02)});
  if(["ADD_SAUCE","ADD_CHEESE","BAKE","TAKE_OUT","ADD_CUT","AUTO_CUT"].includes(cue))playNoise(context,now+.01,cue==="ADD_SAUCE"?.18:.08,cue==="BAKE"?.035:.018);
}

export default function Home(){
  const[state,dispatch]=useReducer(gameReducer,initialState);const[hasSave,setHasSave]=useState(false);
  const previousOrderCount=useRef(state.openOrders.length),ovenStages=useRef<Record<number,number>>({}),previousResult=useRef(false);
  useEffect(()=>{const stored=localStorage.getItem(SAVE_KEY);if(!stored)return;try{const parsed=JSON.parse(stored) as Partial<GameState>;if(typeof parsed.recipeIndex==="number"&&Array.isArray(parsed.placements))window.setTimeout(()=>setHasSave(true),0);else localStorage.removeItem(SAVE_KEY)}catch{localStorage.removeItem(SAVE_KEY)}},[]);
  useEffect(()=>{if(state.screen==="game"&&state.station!=="result"){localStorage.setItem(SAVE_KEY,JSON.stringify(state));window.setTimeout(()=>setHasSave(true),0)}},[state]);
  useEffect(()=>{if(state.screen!=="game"||state.station==="result")return;const timer=window.setInterval(()=>dispatch({type:"TICK"}),250);return()=>window.clearInterval(timer)},[state.screen,state.station]);
  useEffect(()=>{const count=state.openOrders.length;if(state.sound&&state.screen==="game"&&count>previousOrderCount.current)playSfx("ARRIVAL");previousOrderCount.current=count},[state.openOrders.length,state.screen,state.sound]);
  useEffect(()=>{for(const slot of state.ovenSlots){const stage=slot.recipeIndex===null?0:slot.cook>103?5:slot.cook>=76?4:slot.cook>=50?3:slot.cook>=25?2:slot.cook>0?1:0,previous=ovenStages.current[slot.slot]??0;if(state.sound&&stage>previous)playSfx(stage===5?"OVEN_BURNING":stage===4?"OVEN_READY":"OVEN_PROGRESS");ovenStages.current[slot.slot]=stage}},[state.ovenSlots,state.sound]);
  useEffect(()=>{const showing=state.screen==="game"&&state.station==="result"&&Boolean(state.result);if(state.sound&&showing&&!previousResult.current)playSfx((state.result?.stars??0)>=2?"RESULT_HIGH":"RESULT_LOW");previousResult.current=showing},[state.result,state.screen,state.sound,state.station]);
  const send=(action:Action)=>{if(state.sound||action.type==="TOGGLE_SOUND")playSfx(action.type);dispatch(action)};
  useEffect(()=>{document.documentElement.lang=state.language},[state.language]);
  if(state.screen==="home")return <PortfolioLanding state={state} dispatch={send}/>;
  if(state.screen==="gameMenu")return <GameMenu state={state} dispatch={send} hasSave={hasSave}/>;
  if(state.screen==="portfolio")return <Portfolio state={state} dispatch={send}/>;
  return <GameScreenV2 state={state} dispatch={send}/>;
}
