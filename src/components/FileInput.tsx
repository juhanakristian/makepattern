import { useEffect, useRef, useState } from "preact/hooks";
import ImageIcon from "../assets/ImageIcon";

type Props = {
  onChange: (e: any) => void
}

export default function FileInput({ onChange }: Props) {

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <button className="bg-transparent" onClick={() => inputRef.current?.click()}>
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
  )

}
