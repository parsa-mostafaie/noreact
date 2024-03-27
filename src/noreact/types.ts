import { VElem, instanceOfVElem, Props } from "./dom-def.js";

export type hookNameType = "effect" | "reducer";
export interface HookType {
  value: any;
  hookName: hookNameType;
  cb?: Function;
  cleanup?: Function;
  for?: VElem
}
export { VElem, instanceOfVElem };