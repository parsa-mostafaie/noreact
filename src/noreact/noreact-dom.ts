import { VElem, hookNameType, HookType, instanceOfVElem } from "./types.js";
import { __noreact__dom__currents__ as currents } from "./noreact-currents.js";

export class noreactRoot {
  container: HTMLElement;
  root: VElem;

  private hooks: HookType[] = [];
  private hookIndex: number = 0;
  private waiting: any = { current: false };

  private current_rendering: VElem = null;
  private HOOK<T>(value: T, hname: hookNameType): HookType {
    let hook = this.hooks[this.hookIndex++];
    if (!hook) {
      hook = { value, hookName: hname };
      this.hooks.push(hook);
    }
    return hook;
  }
  private wait(callback: Function, thisArg) {
    return (...args) => {
      this.waiting.current = true;
      let res = callback.call(thisArg, ...args);
      this.waiting.current = false;
      return res;
    };
  }
  private render(
    velem: VElem | any,
    container?: HTMLElement | DocumentFragment
  ): void {
    let domEl: any;
    container = container || this.container;
    // 0. Check the type of el
    //    if not a VElem we need to handle it like text node.
    if (!instanceOfVElem(velem)) {
      if (velem instanceof Array) {
        velem.map((item) => this.render(item, container));
        return;
      }
      // create an actual Text Node
      domEl = document.createTextNode(velem.toString());
      container.appendChild(domEl);
      // No children for text so we return.
      return;
    }
    // We Sure velem is An VElem
    velem = velem as VElem;
    let prevEl: VElem = this.current_rendering;
    this.current_rendering = velem;

    if (typeof velem.type == "function") {
      let call = velem.type.call(this, velem.props, ...velem.children);
      this.render(call, container);
    } else {
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
        });
      }
      // 3. Handle creating the Children.
      if (velem.children && velem.children.length > 0) {
        // When child is rendered, the container will be
        // the domEl we created here.
        velem.children.forEach((node) => this.render(node, domEl));
      } // 4. append the DOM node to the container.
      container.appendChild(domEl);
    }

    Object.values(this.hooks)
      .filter((hook) => hook.hookName == "effect") // filter effects
      .filter((hook) => hook.for == velem) // filter for current
      .filter((hook) => hook.cb) // changeds
      .forEach((h) => {
        h.cleanup = h.cb.call(this);
        h.cb = null;
      });
    this.current_rendering = prevEl;
  }
  private rerender() {
    if (this.waiting.current) {
      if (this.waiting.proxy) return;
      let rr = this.rerender;
      let th = this;
      let prox = new Proxy(this.waiting, {
        set(target, p, newValue, receiver) {
          target[p] = newValue;
          if (th.waiting.current == false) {
            th.waiting = { current: false };
            th.waiting.proxy = false;
            rr.call(th);
          }
          return true;
        },
      });
      this.waiting = prox;
      this.waiting.proxy = true;
      return;
    }
    currents.__current__root__ = this;
    this.container.innerHTML = "";
    this.hookIndex = 0;
    this.wait(this.render, this)(this.root);
    currents.__current__root__ = null;
  }
  mount(root, container): noreactRoot {
    this.container = container;
    this.root = root;
    this.rerender();
    return this;
  }
  useReducer<T>(reducer, initialState: T): [T, (action: any) => void] {
    const hook: HookType = this.HOOK(initialState, "reducer");
    const dispatch = (action) => {
      hook.value = reducer(hook.value, action);
      this.rerender();
    };
    return [hook.value, dispatch];
  }
  useState<T>(initialState: T): [T, (action: any) => void] {
    const gv = (_, v) => (typeof v == "function" ? v(_) : v);
    return this.useReducer(gv, initialState);
  }
  useRef<T>(initialValue: T): { current: T } {
    const [ref, unused] = this.useState({ current: initialValue });
    return ref;
  }
  useEffect(cb: () => Function, deps: any[]) {
    // Returns true if two arrays `a` and `b` are different.
    const changed = (a, b) => a == b || b.some((arg, i) => arg !== a[i]);

    const hook = this.HOOK(deps, "effect");
    hook.for = this.current_rendering;
    if (changed(hook.value, deps)) {
      hook.value = deps;
      hook.cb = cb;
    } else {
      hook.cb = null;
    }
  }
}
