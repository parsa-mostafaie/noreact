import { VElem, noreactRoot } from "./types.js";

export const noreact = {
  h(type, props, ...children): VElem {
    return { type, props, children };
  },
  fragment(props, ...children): VElem {
    return noreact.h("", props, ...children);
  },
};

export function createRoot() {
  return new noreactRoot();
}

