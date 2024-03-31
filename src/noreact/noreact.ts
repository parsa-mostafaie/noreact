import { VElem } from "./types.js";
import { noreactRoot } from "./noreact-dom.js";
import { Props } from "./dom-def.js";
import * as hooks from "./hooks.js";

export const noreact = {
  h(type, props: Props, ...children): VElem {
    return { type, props, children };
  },
  fragment(props, ...children): VElem {
    return noreact.h("", props, ...children);
  },
};

export function createRoot() {
  return new noreactRoot();
}

export const useEffect = hooks.useEffect;
export const useId = hooks.useId;
export const useReducer = hooks.useReducer;
export const useRef = hooks.useRef;
export const useState = hooks.useState;
