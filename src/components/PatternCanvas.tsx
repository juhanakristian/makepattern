import { useEffect, useRef, useState } from "preact/hooks";
import Slider from "./Slider";
import { createFourWayReflectionTiling } from "../tiling/fourway";

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [angle, setAngle] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dataURL, setDataURL] = useState("");
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

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
      context.drawImage(img, 0, 0);
    };

    uiContext.strokeStyle = "red";
    uiContext.beginPath();
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

    const dataURL = createFourWayReflectionTiling(buffer);
    // const dataURL = buffer.toDataURL();
    setDataURL(dataURL);
  }, [image, scale, angle, offset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      setImageWidth(imgWidth);
      setImageHeight(imgHeight);

      canvas.width = Math.min(imgWidth, 500);
      canvas.height = Math.min(imgHeight, 500);
    };
  }, [image]);

  const handleImageUpload = (e: any) => {
    loadImage(e.target.files[0]);
  };

  const handleMouseDown = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const startX = clientX - offset.x;
    const startY = clientY - offset.y;
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const { clientX, clientY } = e;
      const offsetX = clientX - startX;
      const offsetY = clientY - startY;

      const size = 100 * scale;
      const offset = {
        x: Math.max(0, Math.min(offsetX, canvasRef.current!.width - size)),
        y: Math.max(0, Math.min(offsetY, canvasRef.current!.height - size)),
      };

      setOffset(offset);
    };

    const handleMouseUp = () => {
      canvasRef.current?.removeEventListener("mousemove", handleMouseMove);
      canvasRef.current?.removeEventListener("mouseup", handleMouseUp);
    };
    canvasRef.current?.addEventListener("mousemove", handleMouseMove);
    canvasRef.current?.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      id="background"
      className="w-full h-full flex justify-center items-center"
      style={{
        "--bg-image": `url('${dataURL}')`,
      }}
    >
      <div className="w-96  rounded-xl p-2 bg-white shadow-md">
        <input
          className=""
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <div style={{ position: "relative" }}>
          <canvas
            className="w-full"
            ref={canvasRef}
            onMouseDown={handleMouseDown}
          />
          <canvas
            className="absolute top-0 w-full pointer-events-none"
            ref={uiRef}
          />
        </div>
        <div className="p-2 flex flex-col gap-2">
          <Slider
            label="Rotation"
            range={[0, 360]}
            step={1}
            value={angle}
            onChange={(value) => setAngle(value)}
          />
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
