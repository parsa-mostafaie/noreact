import { VElem, hookNameType, HookType, instanceOfVElem } from "./types.js";

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
    velem: VElem | any,
    container?: HTMLElement | DocumentFragment
  ) {
    let domEl: any;
    container = container || this.container;
    // 0. Check the type of el
    //    if not a VElem we need to handle it like text node.
    if (!instanceOfVElem(velem)) {
      // create an actual Text Node
      domEl = document.createTextNode(velem.toString());
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
          domEl.addEventListener(prop.slice(2).toLowerCase(), async (e) => {
            this.waiting.current = true;
            await propVal.call(this, e);
            this.waiting.current = false;
          });
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
    container.appendChild(domEl);
  }
  private rerender() {
    if (this.waiting.current) {
      let rr = this.rerender;
      let th = this;
      if (this.waiting.proxy) return;
      this.waiting = new Proxy(this.waiting, {
        set(target, p, newValue, receiver) {
          target[p] = newValue;
          if (p == "current" && newValue == false) {
            this.waiting = { current: false };
            rr.call(th);
          }
          return true;
        },
      });
      this.waiting.proxy = true;
      return;
    }
    this.container.innerHTML = "";
    this.hookIndex = 0;
    this.render(this.root);
  }
  mount(root, container): noreactRoot {
    this.container = container;
    this.root = root;
    this.rerender();
    return this;
  }
  private hooks: HookType[] = [];
  private hookIndex: number = 0;
  private waiting: any = { current: false };
  useReducer(reducer, initialState: any): [any, Function] {
    const hook: HookType = this.HOOK(initialState, "reducer");
    const dispatch = (action) => {
      hook.value = reducer(hook.value, action);
      this.rerender();
    };
    return [hook.value, dispatch];
  }
  useState(initialState): [any, Function] {
    const gv = (_, v) => (typeof v == "function" ? v(_) : v);
    return this.useReducer(gv, initialState);
  }
  useRef(initialValue) {
    const [ref, unused] = this.useState({ current: initialValue });
    return ref;
  }
}
