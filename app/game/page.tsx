"use client";

import {
  ArrowLeft, ArrowRight, Check, ChefHat, CircleHelp, Clock3, Contact,
  GitBranch, Languages, Play, Settings, Sparkles, Volume2, VolumeX, X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { DIFFICULTIES, INGREDIENTS, RECIPES, ingredientById, type DifficultyKey } from "@/lib/game-data";
import { gameReducer, initialState, SAVE_KEY, type Action, type GameState } from "@/lib/game-state";
import { copy } from "@/lib/game-copy";
import { playSfx } from "@/lib/game-audio";
import GameScreenV2 from "../GameScreenV2";

export function GameMenu({ state, dispatch, hasSave }: { state: GameState; dispatch: (a: Action) => void; hasSave: boolean }) {
  const t = copy[state.language];
  const [panel, setPanel] = useState<"none" | "settings" | "credits">("none");
  const levels = [
    { index: 0, number: "01", es: "Inteligencia aplicada", en: "Applied intelligence", icon: "AI" },
    { index: 3, number: "02", es: "Sistemas desde cero", en: "Systems from scratch", icon: "SYS" },
    { index: 5, number: "03", es: "Mundo físico", en: "Physical world", icon: "HW" },
  ];

  return (
    <main className="title-screen">
      <div className="facade" aria-hidden="true" />
      <div className="title-shade" aria-hidden="true" />
      <header className="title-topbar">
        <Link href="/" className="title-back-home" title={t.backHome}>
          <ArrowLeft /> <span>{t.backHome}</span>
        </Link>
        <span className="title-brand-badge">
          <ChefHat /> <span>IGNACIO&apos;S DEV PIZZERIA</span>
        </span>
        <div className="lang-switch" aria-label={t.language}>
          <button className={state.language === "es" ? "active" : ""} onClick={() => dispatch({ type: "LANG", language: "es" })}>ES</button>
          <button className={state.language === "en" ? "active" : ""} onClick={() => dispatch({ type: "LANG", language: "en" })}>EN</button>
        </div>
      </header>

      <section className="title-card">
        <div className="sign-logo">
          <small>IGNACIO&apos;S</small>
          <h1>STACK <em>&amp;</em> SLICE</h1>
          <span>DEV PIZZERIA · PORTFOLIO GAME</span>
        </div>
        <p className="premise">“{t.premise}”</p>

        <div className="title-actions">
          <button className="button-primary" onClick={() => dispatch({ type: "START" })}>
            <Play />
            <span>{t.play}</span>
            <ArrowRight />
          </button>
          <div className={`secondary-actions ${hasSave ? "has-save" : ""}`}>
            {hasSave && (
              <button
                onClick={() => {
                  const stored = localStorage.getItem(SAVE_KEY);
                  if (stored) dispatch({ type: "RESUME", state: JSON.parse(stored) });
                }}
              >
                <Clock3 />
                <span>{t.resume}</span>
              </button>
            )}
            <button onClick={() => dispatch({ type: "PORTFOLIO" })}>
              <Sparkles />
              <span>{hasSave ? t.portfolio : t.portfolioQuick}</span>
            </button>
            <button onClick={() => setPanel("settings")}>
              <Settings />
              <span>{t.settings}</span>
            </button>
          </div>
        </div>
      </section>

      <aside className="level-panel">
        <div className="panel-label">
          <span>{t.selectLevel}</span>
          <b>{String(levels.findIndex((level) => level.index === state.recipeIndex) + 1).padStart(2, "0")}/03</b>
        </div>
        <div className="level-list">
          {levels.map((level) => (
            <button
              key={level.index}
              className={state.recipeIndex === level.index ? "active" : ""}
              onClick={() => dispatch({ type: "SELECT_LEVEL", index: level.index })}
            >
              <span>{level.number}</span>
              <i>{level.icon}</i>
              <b>{state.language === "es" ? level.es : level.en}</b>
              <small>{RECIPES[level.index].project}</small>
              <Check />
            </button>
          ))}
        </div>
        <div className="pace-label">{t.selectPace}</div>
        <div className="pace-switch">
          {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => (
            <button
              key={key}
              className={state.difficulty === key ? "active" : ""}
              onClick={() => dispatch({ type: "DIFFICULTY", difficulty: key })}
            >
              {DIFFICULTIES[key].label}
            </button>
          ))}
        </div>
        <button className="credits-link" onClick={() => setPanel("credits")}>
          <CircleHelp />
          {t.credits}
        </button>
      </aside>

      {panel !== "none" && (
        <div className="modal-backdrop">
          <section className="small-modal">
            <button className="modal-close" onClick={() => setPanel("none")} aria-label="Close">
              <X />
            </button>
            {panel === "settings" ? (
              <>
                <span className="eyebrow">{t.settings}</span>
                <h2>{state.language.toUpperCase()} / {state.sound ? "SFX ON" : "SFX OFF"}</h2>
                <div className="setting-row">
                  <Languages />
                  <span>{t.language}</span>
                  <button onClick={() => dispatch({ type: "LANG", language: state.language === "es" ? "en" : "es" })}>
                    {state.language === "es" ? "English" : "Español"}
                  </button>
                </div>
                <div className="setting-row">
                  {state.sound ? <Volume2 /> : <VolumeX />}
                  <span>{t.sound}</span>
                  <button onClick={() => dispatch({ type: "TOGGLE_SOUND" })}>
                    {state.sound ? "ON" : "OFF"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="eyebrow">{t.credits}</span>
                <h2>Stack &amp; Slice</h2>
                <p>{t.made}. Diseñado y desarrollado por Ignacio Schwindt.</p>
                <a href="mailto:ignacio.schwindt.dev@gmail.com">ignacio.schwindt.dev@gmail.com</a>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export function Portfolio({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const t = copy[state.language];
  return (
    <main className="portfolio-screen">
      <header className="portfolio-header">
        <div className="portfolio-header-nav">
          <button onClick={() => dispatch({ type: "CLOSE_PORTFOLIO" })}>
            <ArrowLeft />
            {t.back}
          </button>
          <Link href="/" className="portfolio-home-pill">
            <ChefHat size={14} />
            <span>{t.backHome}</span>
          </Link>
        </div>
        <div>
          <small>STACK &amp; SLICE</small>
          <b>IGNACIO SCHWINDT · COMPUTER ENGINEER</b>
        </div>
        <div className="portfolio-social">
          <Link href="/" title={t.backHome} style={{ display: "grid", placeItems: "center", width: 36, height: 36, border: "1px solid var(--line)", color: "#e5e9e5" }}>
            <ChefHat size={16} />
          </Link>
          <a href="https://github.com/igna-s" target="_blank" rel="noreferrer">
            <GitBranch size={16} />
          </a>
          <a href="https://www.linkedin.com/in/ignacio-andres-schwindt" target="_blank" rel="noreferrer">
            <Contact size={16} />
          </a>
        </div>
      </header>
      <section className="portfolio-hero">
        <span>QUICK PORTFOLIO / NO GAMEPLAY REQUIRED</span>
        <h1>{t.projects}</h1>
        <p>{t.premise}</p>
      </section>
      <section className="portfolio-grid">
        {RECIPES.map((recipe, index) => (
          <article key={recipe.id}>
            <div className="project-index">
              {String(index + 1).padStart(2, "0")}
              <span>{recipe.year}</span>
            </div>
            <small>{state.language === "es" ? recipe.subtitle : recipe.subtitleEn}</small>
            <h2>{recipe.project}</h2>
            <p>{state.language === "es" ? recipe.description : recipe.descriptionEn}</p>
            <div>
              {recipe.ingredientIds.map((id) => (
                <span key={id} style={{ "--dot": ingredientById.get(id)!.color } as CSSProperties}>
                  {ingredientById.get(id)!.name}
                </span>
              ))}
            </div>
            <a href={recipe.repo} target="_blank" rel="noreferrer">
              {t.viewCode}
              <ArrowRight />
            </a>
          </article>
        ))}
      </section>
      <section className="stack-marquee">
        <span>{t.stack}</span>
        {INGREDIENTS.map((item) => (
          <b key={item.id}>{item.name}</b>
        ))}
      </section>
    </main>
  );
}

export default function GamePage() {
  const [state, dispatch] = useReducer(gameReducer, { ...initialState, screen: "gameMenu" });
  const [hasSave, setHasSave] = useState(false);
  const previousOrderCount = useRef(state.openOrders.length);
  const ovenStages = useRef<Record<number, number>>({});
  const previousResult = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(SAVE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<GameState>;
      if (typeof parsed.recipeIndex === "number" && Array.isArray(parsed.placements)) {
        window.setTimeout(() => setHasSave(true), 0);
      } else {
        localStorage.removeItem(SAVE_KEY);
      }
    } catch {
      localStorage.removeItem(SAVE_KEY);
    }
  }, []);

  useEffect(() => {
    if (state.screen === "game" && state.station !== "result") {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      window.setTimeout(() => setHasSave(true), 0);
    }
  }, [state]);

  useEffect(() => {
    if (state.screen !== "game" || state.station === "result") return;
    const timer = window.setInterval(() => dispatch({ type: "TICK" }), 250);
    return () => window.clearInterval(timer);
  }, [state.screen, state.station]);

  useEffect(() => {
    const count = state.openOrders.length;
    if (state.sound && state.screen === "game" && count > previousOrderCount.current) {
      playSfx("ARRIVAL");
    }
    previousOrderCount.current = count;
  }, [state.openOrders.length, state.screen, state.sound]);

  useEffect(() => {
    for (const slot of state.ovenSlots) {
      const stage =
        slot.recipeIndex === null
          ? 0
          : slot.cook > 103
          ? 5
          : slot.cook >= 76
          ? 4
          : slot.cook >= 50
          ? 3
          : slot.cook >= 25
          ? 2
          : slot.cook > 0
          ? 1
          : 0;
      const previous = ovenStages.current[slot.slot] ?? 0;
      if (state.sound && stage > previous) {
        playSfx(stage === 5 ? "OVEN_BURNING" : stage === 4 ? "OVEN_READY" : "OVEN_PROGRESS");
      }
      ovenStages.current[slot.slot] = stage;
    }
  }, [state.ovenSlots, state.sound]);

  useEffect(() => {
    const showing = state.screen === "game" && state.station === "result" && Boolean(state.result);
    if (state.sound && showing && !previousResult.current) {
      playSfx((state.result?.stars ?? 0) >= 2 ? "RESULT_HIGH" : "RESULT_LOW");
    }
    previousResult.current = showing;
  }, [state.result, state.screen, state.sound, state.station]);

  const send = (action: Action) => {
    if (state.sound || action.type === "TOGGLE_SOUND") playSfx(action.type);
    dispatch(action);
  };

  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  useEffect(() => {
    if (state.screen === "home") {
      window.location.href = "/";
    }
  }, [state.screen]);

  if (state.screen === "portfolio") return <Portfolio state={state} dispatch={send} />;
  if (state.screen === "game") return <GameScreenV2 state={state} dispatch={send} />;
  return <GameMenu state={state} dispatch={send} hasSave={hasSave} />;
}
