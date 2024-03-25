import { VElem } from "./types";

export const noreact = {
  h(type, props, ...childs): VElem {
    return { type, props, childs };
  },
};
