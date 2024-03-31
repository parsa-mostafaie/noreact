export const useState = (...args) => cr().useState.call(cr(), ...args);
export const useEffect = (...args) => cr().useEffect.call(cr(), ...args);
export const useRef = (...args) => cr().useRef.call(cr(), ...args);
export const useReducer = (...args) => cr().useReducer.call(cr(), ...args);
export const useId = (...args) => cr().useId.call(cr(), ...args);

function cr() {
  return currents.__current__root__;
}

import { __noreact__dom__currents__ as currents } from "./noreact-currents.js";
