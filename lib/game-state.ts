import { DIFFICULTIES, RECIPES, type DifficultyKey } from "./game-data.ts";
import { scoreOrder, type Cut, type Placement, type ScoreBreakdown } from "./game-engine.ts";

export type Language = "es" | "en";
export type Screen = "home" | "gameMenu" | "game" | "portfolio";
export type Station = "reception" | "prep" | "oven" | "cut" | "result";

export type OrderProgress = {
  station: Station;
  patience: number;
  sauce: number;
  cheese: number;
  selected: string | null;
  placements: Placement[];
  temperature: number;
  cook: number;
  ovenActive: boolean;
  cuts: Cut[];
  mistakes: number;
  result: ScoreBreakdown | null;
};

export type OvenSlot = {
  slot: number;
  recipeIndex: number | null;
  cook: number;
  temperature: number;
  active: boolean;
};

export type GameState = OrderProgress & {
  screen: Screen;
  previousScreen: "home" | "gameMenu" | "game";
  language: Language;
  difficulty: DifficultyKey;
  recipeIndex: number;
  shiftScore: number;
  sound: boolean;
  openOrders: number[];
  completedOrders: number[];
  orderProgress: Record<number, OrderProgress>;
  ovenSlots: OvenSlot[];
  arrivalClock: number;
  nextArrivalIndex: number;
};

export type Action =
  | {type:"LANG";language:Language}|{type:"DIFFICULTY";difficulty:DifficultyKey}|{type:"SELECT_LEVEL";index:number}
  | {type:"GAME_MENU"}|{type:"START"}|{type:"RESUME";state:GameState}|{type:"HOME"}|{type:"PORTFOLIO"}|{type:"CLOSE_PORTFOLIO"}|{type:"TOGGLE_SOUND"}
  | {type:"SWITCH_ORDER";index:number}|{type:"NAV_STATION";station:Exclude<Station,"result">}|{type:"ACCEPT"}
  | {type:"ADD_SAUCE"}|{type:"ADD_CHEESE"}|{type:"SELECT_TOPPING";id:string}|{type:"PLACE";placement:Placement;correct:boolean}
  | {type:"UNDO"}|{type:"BAKE"}|{type:"TEMP";amount:number}|{type:"TOGGLE_OVEN"}|{type:"TICK"}|{type:"TAKE_OUT"}
  | {type:"ADD_CUT";cut:Cut}|{type:"AUTO_CUT"}|{type:"FINISH"}|{type:"NEXT"}|{type:"RESTART_ORDER"};

export const SAVE_KEY="stack-and-slice-save-v4";

const emptyOvens=():OvenSlot[]=>Array.from({length:3},(_,slot)=>({slot,recipeIndex:null,cook:0,temperature:275,active:false}));
const blankOrder=(difficulty:DifficultyKey):OrderProgress=>({
  station:"reception",patience:DIFFICULTIES[difficulty].patience,sauce:0,cheese:0,selected:null,
  placements:[],temperature:275,cook:0,ovenActive:false,cuts:[],mistakes:0,result:null,
});

export const initialState:GameState={
  ...blankOrder("service"),screen:"home",previousScreen:"home",language:"en",difficulty:"service",
  recipeIndex:0,shiftScore:0,sound:true,openOrders:[0],completedOrders:[],orderProgress:{},
  ovenSlots:emptyOvens(),arrivalClock:0,nextArrivalIndex:1,
};

const snapshot=(state:GameState):OrderProgress=>({
  station:state.station,patience:state.patience,sauce:state.sauce,cheese:state.cheese,selected:state.selected,
  placements:state.placements,temperature:state.temperature,cook:state.cook,ovenActive:state.ovenActive,
  cuts:state.cuts,mistakes:state.mistakes,result:state.result,
});

const hydrate=(state:GameState,index:number,progress:Record<number,OrderProgress>):GameState=>{
  const base=progress[index]??blankOrder(state.difficulty);
  const oven=state.ovenSlots.find(slot=>slot.recipeIndex===index);
  return {...state,...base,recipeIndex:index,cook:oven?.cook??base.cook,temperature:oven?.temperature??base.temperature,ovenActive:oven?.active??base.ovenActive,orderProgress:progress};
};

const persist=(state:GameState)=>({...state.orderProgress,[state.recipeIndex]:snapshot(state)});
const nextRecipe=(from:number,blocked:number[])=>{
  for(let step=1;step<=RECIPES.length;step+=1){const index=(from+step)%RECIPES.length;if(!blocked.includes(index))return index}
  return(from+1)%RECIPES.length;
};
export const arrivalInterval=(difficulty:DifficultyKey)=>difficulty==="rush"?20:difficulty==="service"?28:38;

function startShift(state:GameState):GameState{
  const first=state.recipeIndex;
  return {...state,...blankOrder(state.difficulty),screen:"game",previousScreen:"game",recipeIndex:first,shiftScore:0,
    openOrders:[first],completedOrders:[],orderProgress:{[first]:blankOrder(state.difficulty)},ovenSlots:emptyOvens(),
    arrivalClock:0,nextArrivalIndex:(first+1)%RECIPES.length};
}

export function gameReducer(state:GameState,action:Action):GameState{
  const recipe=RECIPES[state.recipeIndex];
  switch(action.type){
    case"LANG":return{...state,language:action.language};
    case"DIFFICULTY":return{...state,difficulty:action.difficulty,patience:DIFFICULTIES[action.difficulty].patience};
    case"SELECT_LEVEL":return{...state,recipeIndex:action.index,nextArrivalIndex:(action.index+1)%RECIPES.length};
    case"GAME_MENU":return{...state,screen:"gameMenu",previousScreen:"gameMenu"};
    case"START":return startShift(state);
    case"RESUME":return{...initialState,...action.state,screen:"game",previousScreen:"game",ovenSlots:action.state.ovenSlots??emptyOvens(),openOrders:action.state.openOrders??[action.state.recipeIndex],orderProgress:action.state.orderProgress??{}};
    case"HOME":return{...state,screen:"home",previousScreen:"home"};
    case"PORTFOLIO":return state.screen==="gameMenu"?{...state,screen:"home",previousScreen:"home"}:{...state,previousScreen:state.screen==="game"?"game":"home",screen:"portfolio"};
    case"CLOSE_PORTFOLIO":return{...state,screen:state.previousScreen};
    case"TOGGLE_SOUND":return{...state,sound:!state.sound};
    case"SWITCH_ORDER":{
      if(!state.openOrders.includes(action.index)||action.index===state.recipeIndex)return state;
      const progress=persist(state);return hydrate(state,action.index,progress);
    }
    case"NAV_STATION":{
      const progress=persist(state);
      const candidate=state.openOrders.find(index=>progress[index]?.station===action.station);
      return candidate===undefined?state:hydrate(state,candidate,progress);
    }
    case"ACCEPT":return{...state,station:"prep"};
    case"ADD_SAUCE":return{...state,sauce:Math.min(100,state.sauce+25)};
    case"ADD_CHEESE":return{...state,cheese:Math.min(100,state.cheese+25)};
    case"SELECT_TOPPING":return{...state,selected:action.id};
    case"PLACE":return{...state,placements:[...state.placements,action.placement].slice(-80),mistakes:state.mistakes+(action.correct?0:1)};
    case"UNDO":return{...state,placements:state.placements.slice(0,-1)};
    case"BAKE":{
      const free=state.ovenSlots.find(slot=>slot.recipeIndex===null);
      if(!free)return state;
      const ovenSlots=state.ovenSlots.map(slot=>slot.slot===free.slot?{...slot,recipeIndex:state.recipeIndex,cook:0,temperature:state.temperature,active:true}:slot);
      return{...state,station:"oven",cook:0,ovenActive:true,ovenSlots};
    }
    case"TEMP":{
      const value=Math.max(190,Math.min(340,state.temperature+action.amount));
      return{...state,temperature:value,ovenSlots:state.ovenSlots.map(slot=>slot.recipeIndex===state.recipeIndex?{...slot,temperature:value}:slot)};
    }
    case"TOGGLE_OVEN":return{...state,ovenActive:!state.ovenActive,ovenSlots:state.ovenSlots.map(slot=>slot.recipeIndex===state.recipeIndex?{...slot,active:!slot.active}:slot)};
    case"TICK":{
      if(state.screen!=="game"||state.station==="result")return state;
      const drain=state.difficulty==="rush"?.24:state.difficulty==="service"?.17:.11;
      const currentProgress=snapshot(state);
      const progress={...state.orderProgress,[state.recipeIndex]:currentProgress};
      for(const index of state.openOrders){const item=progress[index]??blankOrder(state.difficulty);if(item.station!=="result")progress[index]={...item,patience:Math.max(0,item.patience-drain)}}
      const ovenSlots=state.ovenSlots.map(slot=>slot.recipeIndex!==null&&slot.active?{...slot,cook:Math.min(145,slot.cook+Math.max(.08,(slot.temperature-175)/100)*DIFFICULTIES[state.difficulty].ovenRate*.42)}:slot);
      const activeOven=ovenSlots.find(slot=>slot.recipeIndex===state.recipeIndex);
      let openOrders=state.openOrders,arrivalClock=state.arrivalClock+.25,nextArrivalIndex=state.nextArrivalIndex;
      if(arrivalClock>=arrivalInterval(state.difficulty)&&openOrders.length<5&&state.completedOrders.length+openOrders.length<RECIPES.length){
        const blocked=[...openOrders,...state.completedOrders];const arriving=blocked.includes(nextArrivalIndex)?nextRecipe(nextArrivalIndex,blocked):nextArrivalIndex;
        openOrders=[...openOrders,arriving];progress[arriving]=blankOrder(state.difficulty);nextArrivalIndex=nextRecipe(arriving,[...openOrders,...state.completedOrders]);arrivalClock=0;
      }
      const active=progress[state.recipeIndex]??currentProgress;
      return{...state,...active,patience:active.patience,cook:activeOven?.cook??state.cook,temperature:activeOven?.temperature??state.temperature,ovenActive:activeOven?.active??state.ovenActive,orderProgress:progress,ovenSlots,openOrders,arrivalClock,nextArrivalIndex};
    }
    case"TAKE_OUT":{
      const oven=state.ovenSlots.find(slot=>slot.recipeIndex===state.recipeIndex);
      if(!oven)return state;
      return{...state,station:"cut",cook:oven.cook,ovenActive:false,ovenSlots:state.ovenSlots.map(slot=>slot.slot===oven.slot?{...slot,recipeIndex:null,cook:0,active:false}:slot)};
    }
    case"ADD_CUT":return{...state,cuts:[...state.cuts,action.cut].slice(0,8)};
    case"AUTO_CUT":{const lines=Math.max(1,recipe.targetCuts/2);return{...state,cuts:Array.from({length:lines},(_,index)=>{const angle=Math.PI*index/lines;return{x1:50-Math.cos(angle)*47,y1:50-Math.sin(angle)*47,x2:50+Math.cos(angle)*47,y2:50+Math.sin(angle)*47}})}}
    case"FINISH":{
      const result=scoreOrder({required:recipe.ingredientIds,placements:state.placements,sauce:state.sauce,cheese:state.cheese,cook:state.cook,cuts:state.cuts,targetCuts:recipe.targetCuts,patience:(state.patience/DIFFICULTIES[state.difficulty].patience)*100,mistakes:state.mistakes,multiplier:DIFFICULTIES[state.difficulty].multiplier});
      return{...state,station:"result",result,shiftScore:state.shiftScore+result.total};
    }
    case"NEXT":{
      const completedOrders=state.completedOrders.includes(state.recipeIndex)?state.completedOrders:[...state.completedOrders,state.recipeIndex];
      let openOrders=state.openOrders.filter(index=>index!==state.recipeIndex);let nextArrivalIndex=state.nextArrivalIndex;
      const progress={...persist(state)};delete progress[state.recipeIndex];
      if(!openOrders.length&&completedOrders.length<RECIPES.length){const next=nextRecipe(state.recipeIndex,completedOrders);openOrders=[next];progress[next]=blankOrder(state.difficulty);nextArrivalIndex=nextRecipe(next,[...completedOrders,next])}
      if(!openOrders.length)return{...state,screen:"gameMenu",previousScreen:"gameMenu",completedOrders,openOrders,orderProgress:progress};
      return hydrate({...state,completedOrders,openOrders,nextArrivalIndex,arrivalClock:0},openOrders[0],progress);
    }
    case"RESTART_ORDER":{
      const reset=blankOrder(state.difficulty);const progress={...state.orderProgress,[state.recipeIndex]:reset};
      return{...state,...reset,orderProgress:progress,ovenSlots:state.ovenSlots.map(slot=>slot.recipeIndex===state.recipeIndex?{...slot,recipeIndex:null,cook:0,active:false}:slot)};
    }
    default:return state;
  }
}

export function isPrepComplete(state:GameState){const recipe=RECIPES[state.recipeIndex];return state.sauce>=75&&state.cheese>=75&&recipe.ingredientIds.every(id=>state.placements.filter(point=>point.id===id).length>=3)}
