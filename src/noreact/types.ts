export interface VElem {
  type: string | Function;
  props: any[];
  children: any[];
}

export type hookNameType = "effect" | "reducer";
export interface HookType {
  value: any;
  hookName: hookNameType;
}

export class noreactRoot {
  container: HTMLElement;
  root: VElem;
  private HOOK(value, hname: hookNameType) {
    let hook = this.hooks[this.hookIndex++];
    if (!hook) {
      hook = { value, hookName: hname };
      this.hooks.push(hook);
    }
    return hook;
  }
  private render(
    velem: VElem | string | number | boolean,
    container?: HTMLElement,
    returnEl: Boolean = false
  ) {
    let domEl;
    container = container || this.container;
    // 0. Check the type of el
    //    if string we need to handle it like text node.
    if (['string', 'number', 'boolean'].includes(typeof velem)) {
      // create an actual Text Node
      domEl = document.createTextNode(velem + "");
      container.appendChild(domEl);
      // No children for text so we return.
      return;
    }

    // We Sure velem is An VElem
    velem = velem as VElem;

    if (typeof velem.type == "function") {
      let call = velem.type.call(this, velem.props, ...velem.children);
      return this.render(call, container);
    }

    // 1. First create the document node corresponding el
    domEl = velem.type
      ? document.createElement(velem.type)
      : document.createDocumentFragment();
    // 2. Set the props on domEl
    let elProps = velem.props ? Object.keys(velem.props) : null;
    if (elProps && elProps.length > 0 && velem.type) {
      elProps.forEach((prop) => {
        let propVal = (velem as VElem).props[prop];
        if (prop.startsWith("on")) {
          if (typeof propVal != "function") {
            throw "invalid EventListener";
          }
          domEl.addEventListener(prop.slice(2).toLowerCase(), (e) =>
            propVal.call(this, e)
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
      });
    }
    // 3. Handle creating the Children.
    if (velem.children && velem.children.length > 0) {
      // When child is rendered, the container will be
      // the domEl we created here.
      velem.children.forEach((node) => this.render(node, domEl));
    }
    // 4. append the DOM node to the container.
    if (!returnEl) container.appendChild(domEl);
    else return domEl;
  }
  private rerender() {
    this.container.innerHTML = "";
    this.render(this.root);
    this.hookIndex = 0;
  }
  mount(root, container) {
    this.container = container;
    this.root = root;
    this.rerender();
    return this;
  }
  private hooks: HookType[] = [];
  private hookIndex = 0;
  useReducer(reducer, initialState: any) {
    const hook = this.HOOK(initialState, "reducer");
    const dispatch = (action) => {
      hook.value = reducer(hook.value, action);
      this.rerender();
    };
    return [hook.value, dispatch];
  }
  useState(initialState) {
    const gv = (_, v) => (typeof v == "function" ? v(_) : v);
    return this.useReducer(gv, initialState);
  }
}
