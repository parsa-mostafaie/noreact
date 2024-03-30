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
  return object && (object.type || object.type === "");
}

export function setAttr(prop, propVal, domEl) {
  if (prop.startsWith("on")) {
    if (typeof propVal != "function") {
      throw "Invalid EventListener; EventListener Should Be A function";
    }
    domEl.addEventListener(
      prop.slice(2).toLowerCase(),
      this.wait(propVal, this)
    );
  } else if (prop == "className") {
    domEl.classList.add(
      ...(Array.isArray(propVal) ? propVal : propVal.split(" "))
    );
  } else if (prop == "css") {
    let cssS = propVal;

    if (typeof cssS == "string") {
      domEl.style.cssText = cssS;
    } else if (typeof cssS == "object") {
      for (let cssProp in cssS) {
        domEl.style[cssProp] = cssS[cssProp];
      }
    } else {
      throw "Invalid 'css' prop";
    }
  } else {
    domEl.setAttribute(prop, propVal);
  }
}

export function remAttr(prop, propVal, domEl) {
  if (prop.startsWith("on")) {
    throw new Error("NOREACT-REMATTR-ERR EventListeners does'nt can REMOVE");
  } else if (prop == "className") {
    domEl.classList.remove(
      ...(Array.isArray(propVal) ? propVal : propVal.split(" "))
    );
  } else if (prop == "css") {
    let cssS = propVal;

    if (typeof cssS == "string") {
      domEl.style.cssText = "";
    } else if (typeof cssS == "object") {
      for (let cssProp in cssS) {
        domEl.style[cssProp] = "";
      }
    }
  } else {
    domEl.setAttribute(prop, propVal);
  }
}
