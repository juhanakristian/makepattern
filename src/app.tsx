import { useState } from "preact/hooks";
import PatternCanvas from "./components/PatternCanvas";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <PatternCanvas />
    </>
  );
}
