import { useState } from "preact/hooks";
import PatternCanvas from "./components/PatternCanvas";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-full w-full flex justify-center items-center">
      <PatternCanvas />
    </div>
  );
}
