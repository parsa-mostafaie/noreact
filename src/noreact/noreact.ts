import { VElem } from "./types.js";
import { noreactRoot } from "./noreact-dom.js";
import { __noreact__dom__currents__ as currents } from "./noreact-currents.js";
import { Props } from "./dom-def.js";

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

export const useState = (...args) =>
  currents.__current__root__.useState.call(currents.__current__root__, ...args);
export const useEffect = (...args) =>
  currents.__current__root__.useEffect.call(
    currents.__current__root__,
    ...args
  );
export const useRef = (...args) =>
  currents.__current__root__.useRef.call(currents.__current__root__, ...args);
export const useReducer = (...args) =>
  currents.__current__root__.useReducer.call(
    currents.__current__root__,
    ...args
  );
