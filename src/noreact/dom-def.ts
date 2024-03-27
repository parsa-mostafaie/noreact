export type Props = {
  key?: string;
  ref?: { current: HTMLElement };
  [id: string]: any;
};

export interface VElem {
  type: string | Function;
  props: Props;
  children: (VElem | any)[];
}

export function instanceOfVElem(object: any): object is VElem {
  return object.type || object.type === "";
}
