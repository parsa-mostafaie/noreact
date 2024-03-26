export interface VElem {
  type: string | Function;
  props: any[];
  children: VElem[] | any[];
}

export type hookNameType = "effect" | "reducer";
export interface HookType {
  value: any;
  hookName: hookNameType;
}

export function instanceOfVElem(object: any): object is VElem {
  return object.type || object.type === "";
}

