import { noreact, createRoot } from "../noreact/noreact";

function App() {
  const [state, setState] = this.useState(0);
  console.log(state);
  return (
    <>
      <div>{state}</div>
      <button onClick={() => setState(s=>s+1)}>Count +</button>
    </>
  );
}

createRoot().mount(<App />, document.getElementById("app"));
