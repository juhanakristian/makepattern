type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  range: [number, number];
  step: number;
};

export default function Slider({ label, value, onChange, range, step }: Props) {
  const id = label.toLowerCase();
  return (
    <div className="py-1 w-full flex flex-col">
      <label
        className="font-sans  text-sm font-medium text-gray-500 pb-1"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        id={id}
        type="range"
        min={range[0]}
        max={range[1]}
        step={step}
        value={value}
        onInput={(e: any) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
