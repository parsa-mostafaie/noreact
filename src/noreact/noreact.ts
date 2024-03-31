import { VElem } from "./types";
import { noreactRoot } from "./noreact-dom";
import { Props } from "./dom-def";
import * as hooks from "./hooks";

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
