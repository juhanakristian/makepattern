import { useRef } from "preact/hooks";
import ImageIcon from "../assets/ImageIcon";

type Props = {
  label: string;
  onChange: (e: any) => void;
};

export default function FileInput({ label, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <label hidden htmlFor="image">
        {label}
      </label>
      <button
        name="image"
        className="p-2 rounded-full hover:bg-gray-100"
        onClick={() => inputRef.current?.click()}
      >
        <ImageIcon />
      </button>
      <input
        ref={inputRef}
        hidden
        className="hidden"
        type="file"
        accept="image/*"
        onChange={onChange}
      />
    </>
  );
}
