import { DIFFICULTIES, RECIPES, type DifficultyKey } from "./game-data.ts";
import { scoreOrder, type Cut, type Placement, type ScoreBreakdown } from "./game-engine.ts";

export type Language = "es" | "en";
export type Screen = "home" | "game" | "portfolio";
export type Station = "reception" | "prep" | "oven" | "cut" | "result";
export type GameState = { screen:Screen; previousScreen:"home"|"game"; station:Station; language:Language; difficulty:DifficultyKey; recipeIndex:number; shiftScore:number; patience:number; sauce:number; cheese:number; selected:string|null; placements:Placement[]; temperature:number; cook:number; ovenActive:boolean; cuts:Cut[]; mistakes:number; result:ScoreBreakdown|null; sound:boolean };
export type Action =
  | {type:"LANG";language:Language}|{type:"DIFFICULTY";difficulty:DifficultyKey}|{type:"SELECT_LEVEL";index:number}
  | {type:"START"}|{type:"RESUME";state:GameState}|{type:"HOME"}|{type:"PORTFOLIO"}|{type:"CLOSE_PORTFOLIO"}|{type:"TOGGLE_SOUND"}|{type:"ACCEPT"}
  | {type:"ADD_SAUCE"}|{type:"ADD_CHEESE"}|{type:"SELECT_TOPPING";id:string}|{type:"PLACE";placement:Placement;correct:boolean}
  | {type:"UNDO"}|{type:"BAKE"}|{type:"TEMP";amount:number}|{type:"TOGGLE_OVEN"}|{type:"TICK"}|{type:"TAKE_OUT"}
  | {type:"ADD_CUT";cut:Cut}|{type:"AUTO_CUT"}|{type:"FINISH"}|{type:"NEXT"}|{type:"RESTART_ORDER"};

export const SAVE_KEY="stack-and-slice-save-v3";
export const initialState:GameState={screen:"home",previousScreen:"home",station:"reception",language:"es",difficulty:"service",recipeIndex:0,shiftScore:0,patience:DIFFICULTIES.service.patience,sauce:0,cheese:0,selected:null,placements:[],temperature:275,cook:0,ovenActive:false,cuts:[],mistakes:0,result:null,sound:true};

function freshRound(state:GameState,index=state.recipeIndex):GameState{return{...state,screen:"game",previousScreen:"game",station:"reception",recipeIndex:index,patience:DIFFICULTIES[state.difficulty].patience,sauce:0,cheese:0,selected:null,placements:[],temperature:275,cook:0,ovenActive:false,cuts:[],mistakes:0,result:null}}

export function gameReducer(state:GameState,action:Action):GameState{
  const recipe=RECIPES[state.recipeIndex];
  switch(action.type){
    case"LANG":return{...state,language:action.language};
    case"DIFFICULTY":return{...state,difficulty:action.difficulty,patience:DIFFICULTIES[action.difficulty].patience};
    case"SELECT_LEVEL":return{...state,recipeIndex:action.index};
    case"START":return freshRound({...state,shiftScore:0});
    case"RESUME":return{...initialState,...action.state,screen:"game",previousScreen:"game"};
    case"HOME":return{...state,screen:"home",previousScreen:"home"};
    case"PORTFOLIO":return{...state,previousScreen:state.screen==="game"?"game":"home",screen:"portfolio"};
    case"CLOSE_PORTFOLIO":return{...state,screen:state.previousScreen};
    case"TOGGLE_SOUND":return{...state,sound:!state.sound};
    case"ACCEPT":return{...state,station:"prep"};
    case"ADD_SAUCE":return{...state,sauce:Math.min(100,state.sauce+25)};
    case"ADD_CHEESE":return{...state,cheese:Math.min(100,state.cheese+25)};
    case"SELECT_TOPPING":return{...state,selected:action.id};
    case"PLACE":return{...state,placements:[...state.placements,action.placement].slice(-80),mistakes:state.mistakes+(action.correct?0:1)};
    case"UNDO":return{...state,placements:state.placements.slice(0,-1)};
    case"BAKE":return{...state,station:"oven",ovenActive:true};
    case"TEMP":return{...state,temperature:Math.max(190,Math.min(340,state.temperature+action.amount))};
    case"TOGGLE_OVEN":return{...state,ovenActive:!state.ovenActive};
    case"TICK":{if(state.screen!=="game"||state.station==="result")return state;const drain=state.station==="reception"?0:state.difficulty==="rush"?.24:state.difficulty==="service"?.17:.11;const heat=state.ovenActive&&state.station==="oven"?Math.max(.1,(state.temperature-175)/100)*DIFFICULTIES[state.difficulty].ovenRate:0;return{...state,patience:Math.max(0,state.patience-drain),cook:Math.min(140,state.cook+heat)}}
    case"TAKE_OUT":return{...state,station:"cut",ovenActive:false};
    case"ADD_CUT":return{...state,cuts:[...state.cuts,action.cut].slice(0,8)};
    case"AUTO_CUT":{const lines=Math.max(1,recipe.targetCuts/2);return{...state,cuts:Array.from({length:lines},(_,index)=>{const angle=Math.PI*index/lines;return{x1:50-Math.cos(angle)*47,y1:50-Math.sin(angle)*47,x2:50+Math.cos(angle)*47,y2:50+Math.sin(angle)*47}})}}
    case"FINISH":{const result=scoreOrder({required:recipe.ingredientIds,placements:state.placements,sauce:state.sauce,cheese:state.cheese,cook:state.cook,cuts:state.cuts,targetCuts:recipe.targetCuts,patience:(state.patience/DIFFICULTIES[state.difficulty].patience)*100,mistakes:state.mistakes,multiplier:DIFFICULTIES[state.difficulty].multiplier});return{...state,station:"result",result,shiftScore:state.shiftScore+result.total}}
    case"NEXT":return freshRound(state,(state.recipeIndex+1)%RECIPES.length);
    case"RESTART_ORDER":return freshRound(state);
    default:return state;
  }
}

export function isPrepComplete(state:GameState){const recipe=RECIPES[state.recipeIndex];return state.sauce>=75&&state.cheese>=75&&recipe.ingredientIds.every(id=>state.placements.filter(point=>point.id===id).length>=3)}
