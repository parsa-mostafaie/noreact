import { VElem, instanceOfVElem, Props } from "./dom-def";

export type hookNameType = "effect" | "reducer";
export interface HookType {
  value: any;
  hookName: hookNameType;
  cb?: Function;
  cleanup?: Function;
}
export { VElem, instanceOfVElem };