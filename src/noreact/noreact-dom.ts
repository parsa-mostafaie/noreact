import { VElem, hookNameType, HookType, instanceOfVElem } from "./types.js";
import { __noreact__dom__currents__ as currents } from "./noreact-currents.js";
import { setAttr } from "./dom-def.js";

// Returns true if two arrays `a` and `b` are different.
const changed = (a, b) => a == b || b.some((arg, i) => arg !== a[i]);

export class noreactRoot {
  container: HTMLElement;
  root: VElem;

  private waiting: any = { current: false };
  // HOOKS
  private _hooks_: { arr: HookType[]; index: number; key: string | null }[] =
    [];
  private get hooks() {
    return this.HOOKARR().arr;
  }
  private get hookIndex() {
    return this.HOOKARR().index;
  }

  private set hookIndex(val) {
    this.HOOKARR().index = val;
  }

  private resetHookIndex() {
    for (let h of this._hooks_) {
      h.index = 0;
    }
  }

  private HOOKARR(): { index: number; arr: HookType[]; key: string | null } {
    const key = (this.current_rendering.props ?? { key: null }).key;
    function NEW() {
      this._hooks_.push({ arr: [], key: key, index: 0 });
      return this._hooks_[this._hooks_.length - 1];
    }
    return this._hooks_.find((h) => (h.key ?? null) === key) ?? NEW.call(this);
  }

  private current_rendering: VElem = null;
  private HOOK<T>(value: T, hname: hookNameType): HookType {
    let hook = this.hooks[this.hookIndex++];
    if (!hook) {
      hook = { value, hookName: hname };
      this.hooks.push(hook);
    }
    if (hook.hookName != hname) {
      throw (
        "HookName: `" +
        hname +
        "` in this render is not equal to `" +
        hook.hookName +
        "` in prev render"
      );
    }

    return hook;
  }
  // END HOOK

  private wait(callback: Function, thisArg) {
    return (...args) => {
      this.waiting.current = true;
      let res = callback.call(thisArg, ...args);
      this.waiting.current = false;
      return res;
    };
  }
  private render(velem: VElem | any, old: VElem | any = undefined): void {
    if (!velem) {
      return this.render({ type: "" });
    }
    let domEl: any;

    // 0. Check the type of el
    //    if not a VElem we need to handle it like text node.
    if (!instanceOfVElem(velem)) {
      if (velem instanceof Array) {
        return this.render({ type: "", children: velem });
      }
      // create an actual Text Node
      domEl = document.createTextNode(velem.toString());
      // No children for text so we return.
      return domEl;
    }
    // We Sure velem is An VElem
    velem = velem as VElem;
    let prevEl: VElem = this.current_rendering;
    this.current_rendering = velem;

    if (typeof velem.type == "function") {
      let call = velem.type.call(this, velem.props, ...velem.children);
      return this.render(call);
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
        setAttr.call(this, prop, propVal, domEl);
      });
    }
    // 3. Handle creating the Children.
    if (velem.children && velem.children.length > 0) {
      // When child is rendered, the container will be
      // the domEl we created here.
      const c = velem.children.map((node) => this.render(node));
      domEl.append(...c);
    }

    Object.values(this.hooks)
      .filter((hook) => hook.hookName == "effect") // filter effects
      .filter((hook) => hook.cb) // changeds
      .forEach((h) => {
        h.cleanup = h.cb.call(this);
        h.cb = null;
      });
    this.current_rendering = prevEl;
    return domEl;
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
    this.resetHookIndex();
    this.container.appendChild(this.wait(this.render, this)(this.root));
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
    const hook = this.HOOK(deps, "effect");
    if (changed(hook.value, deps)) {
      hook.value = deps;
      hook.cb = cb;
    } else {
      hook.cb = null;
    }
  }
  useId(remember) {
    const id = "id" + new Date().getTime();
    return id;
  }
}
