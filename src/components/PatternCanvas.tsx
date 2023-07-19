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
  const [scale, setScale] = useState(0.5);
  const [imageScale, setImageScale] = useState(1);
  const [angle, setAngle] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dataURL, setDataURL] = useState("");

  const [patternType, setPatternType] = useState<PatternType>("fascade");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uiRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function defaultImage() {
      const data = await fetch("leaves.webp").then((res) => res.blob());

      const metadata = {
        type: "image/webp",
      };
      const file = new File([data], "leaves.webp", metadata);
      // Load the default image.
      const reader = new FileReader();

      reader.onload = (e) => {
        setImage(e.target?.result as string);
        // Hack to refresh the canvas.
        setTimeout(() => {
          setScale(1);
        }, 10);
      };
      reader.readAsDataURL(file);
    }
    defaultImage();
  }, []);

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    // Load the default image.
    const reader = new FileReader();

    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(new File([new Uint8Array(0)], "default.png"));
  }, []);

  useEffect(() => {
    console.log("image");
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
    if (!image || image.length < 10) return;

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
    uiContext.stroke();

    console.log("imageScale", imageScale);
    bufferContext.drawImage(
      img,
      offset.x * (1 / imageScale),
      offset.y * (1 / imageScale),
      size * (1 / imageScale),
      size * (1 / imageScale),
      0,
      0,
      size,
      size
    );

    if (patternType === "four-way") {
      const dataURL = createFourWayReflectionTiling(buffer);
      setDataURL(dataURL);
    } else if (patternType === "diamond") {
      const dataURL = createDiamondTiling(buffer);
      setDataURL(dataURL);
    } else if (patternType === "fascade") {
      const dataURL = createFascadeTiling(buffer);
      setDataURL(dataURL);
    }
  }, [image, scale, angle, offset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    if (!image || image.length < 10) return;
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
        "--bg-image":
          dataURL && dataURL.length > 0 ? `url('${dataURL}')` : undefined,
      }}
    >
      <div className="rounded-xl p-2 bg-white shadow-md">
        <div className="flex justify-between items-center">
          <FileInput label="Choose image" onChange={handleImageUpload} />
          <h1 className="text-lg font-600">makepattern.io</h1>
          <a
            className="p-2 rounded-full hover:bg-gray-100"
            href={fileURL}
            download="pattern.png"
          >
            <DownloadIcon />
          </a>
        </div>
        <div style={{ position: "relative" }}>
          <canvas ref={canvasRef} onMouseDown={handleMouseDown} />
          <canvas className="absolute top-0 pointer-events-none" ref={uiRef} />
        </div>
        <div className="p-2 flex flex-col gap-2">
          <Slider
            label="Size"
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
