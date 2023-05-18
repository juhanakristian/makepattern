import { useEffect, useRef, useState } from "preact/hooks";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function RotaryDial({ value: initialValue, onChange }: Props) {
  const [value, setValue] = useState(0);

  const [dragStar, setDragStart] = useState({ x: 0, y: 0 });

  function handleMouseUp() {
    globalThis.removeEventListener("mouseup", handleMouseUp);
    globalThis.removeEventListener("mousemove", handleMouseMove);
  }

  function handleMouseDown(event: any) {
    event.preventDefault();

    setDragStart({ x: event.clientX, y: event.clientY });

    globalThis.addEventListener("mouseup", handleMouseUp);
    globalThis.addEventListener("mousemove", handleMouseMove);
  }

  function handleMouseMove(event: any) {
    event.preventDefault();

    const { x, y } = dragStar;
    const dx = event.clientX - x;
    const dy = event.clientY - y;

    // Calculate distance from mouse drag start to current mouse position
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Limit value to 0-360
    const limitedValue = (value + distance) % 360;
    setValue(limitedValue);
    onChange(limitedValue);
  }

  const size = 50;

  return (
    <div className="relative">
      <svg width={size} height={size} onMouseDown={handleMouseDown}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <g transform={`rotate(${value})`}>
            <circle
              cx={0}
              cy={0}
              r={size / 2 - 5}
              stroke="grey"
              stroke-width="1"
              fill="transparent"
              onMouseDown={handleMouseDown}
            />
            <line
              x1={0}
              y1={0}
              x2={size / 2 - 5}
              y2={0}
              stroke="gray"
              strokeWidth={3}
            />
            <circle cx={size / 2 - 5} cy={0} r={3} fill="gray" />
          </g>
          <line x1={0} y1={0} x2={size / 2 - 5} y2={0} stroke="lightgray" />
        </g>
      </svg>
      <input className="hidden" type="range" min="0" max="360" value={value} />
    </div>
  );
}
