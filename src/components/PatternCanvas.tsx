import { useEffect, useRef, useState } from "preact/hooks";
import Slider from "./Slider";
import { createFourWayReflectionTiling } from "../tiling/fourway";
import { createDiamondTiling } from "../tiling/diamond";
import { createFascadeTiling } from "../tiling/fascade";
import FileInput from "./FileInput";
import DownloadIcon from "../assets/DownloadIcon";

const getCanvasOffset = (canvas: HTMLCanvasElement, e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return { x, y };
};

type PatternType = "four-way" | "diamond" | "fascade";
export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [imageScale, setImageScale] = useState(1);
  const [angle, setAngle] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dataURL, setDataURL] = useState("");

  const [patternType, setPatternType] = useState<PatternType>("fascade");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uiRef = useRef<HTMLCanvasElement | null>(null);

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const size = 100 * scale;

    const buffer = document.createElement("canvas");
    buffer.width = size;
    buffer.height = size;
    const bufferContext = buffer.getContext("2d");
    if (!bufferContext) return;
    if (!uiRef.current) return;

    const ui = uiRef.current;
    ui.width = canvas.width;
    ui.height = canvas.height;
    const uiContext = ui.getContext("2d");
    if (!uiContext) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      context.save();
      context.scale(imageScale, imageScale);
      context.drawImage(img, 0, 0);
      context.restore();
    };

    uiContext.strokeStyle = "#ffffffaa";
    uiContext.fillStyle = "#00000066";
    uiContext.lineWidth = 1;
    uiContext.beginPath();
    uiContext.fillRect(offset.x, offset.y, size, size);
    uiContext.rect(offset.x, offset.y, size, size);
    // context.clearRect(0, 0, canvas.width, canvas.height);
    uiContext.stroke();

    bufferContext.drawImage(
      img,
      offset.x,
      offset.y,
      size,
      size,
      0,
      0,
      size,
      size
    );

    // const dataURL = createFourWayReflectionTiling(buffer);
    if (patternType === "four-way") {
      const dataURL = createFourWayReflectionTiling(buffer);
      setDataURL(dataURL);
      // const dataURL = createDiamondTiling(buffer);
    } else if (patternType === "diamond") {
      const dataURL = createDiamondTiling(buffer);
      setDataURL(dataURL);
    } else if (patternType === "fascade") {
      const dataURL = createFascadeTiling(buffer);
      setDataURL(dataURL);
    }
    // const dataURL = buffer.toDataURL();
  }, [image, scale, angle, offset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      const width = Math.min(imgWidth, 500);
      const scale = width / imgWidth;
      const height = imgHeight * scale;

      canvas.width = width;
      canvas.height = height;
      setImageScale(scale);
    };
  }, [image]);

  const handleImageUpload = (e: any) => {
    loadImage(e.target.files[0]);
  };
  const handleMouseDown = (e: MouseEvent) => {
    if (!canvasRef.current) return;

    // The initial position of the mouse.
    const lastPos = getCanvasOffset(canvasRef.current, e);
    const initialOffset = { ...offset };
    const startPos = { ...lastPos };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!canvasRef.current) return;

      // The new mouse position.
      const newPos = getCanvasOffset(canvasRef.current, e);

      // The change in position (delta).
      const dx = newPos.x - startPos.x;
      const dy = newPos.y - startPos.y;

      // The size of the square.
      const size = 100 * scale;

      // The new offset.
      const newOffset = {
        x: Math.max(
          0,
          Math.min(initialOffset.x + dx, canvasRef.current.width - size)
        ),
        y: Math.max(
          0,
          Math.min(initialOffset.y + dy, canvasRef.current.height - size)
        ),
      };

      setOffset(newOffset);
    };

    const handleMouseUp = () => {
      canvasRef.current?.removeEventListener("mousemove", handleMouseMove);
      canvasRef.current?.removeEventListener("mouseup", handleMouseUp);
    };

    canvasRef.current?.addEventListener("mousemove", handleMouseMove);
    canvasRef.current?.addEventListener("mouseup", handleMouseUp);
  };

  const fileURL = dataURL.replace("image/png", "image/octet-stream");

  return (
    <div
      id="background"
      className="w-full h-full flex justify-center items-center"
      style={{
        "--bg-image": `url('${dataURL}')`,
      }}
    >
      <div className="rounded-xl p-2 bg-white shadow-md">
        <div className="flex justify-between">
          <FileInput label="Choose image" onChange={handleImageUpload} />
          <a
            className="p-2 rounded-full hover:bg-gray-100"
            href={fileURL}
            download="pattern.png"
          >
            <DownloadIcon />
          </a>
        </div>
        <div style={{ position: "relative" }}>
          <canvas
            // className="w-full"
            ref={canvasRef}
            onMouseDown={handleMouseDown}
          />
          <canvas className="absolute top-0 pointer-events-none" ref={uiRef} />
        </div>
        <div className="p-2 flex flex-col gap-2">
          <Slider
            label="Scale"
            range={[0.1, 4]}
            step={0.01}
            value={scale}
            onChange={(value) => setScale(value)}
          />
        </div>
      </div>
    </div>
  );
}
