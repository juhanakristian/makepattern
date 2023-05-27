import { useEffect, useRef, useState } from "preact/hooks";
import Slider from "./Slider";

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [angle, setAngle] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dataURL, setDataURL] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const img = new Image();
    img.src = image;
    img.onload = () => {
      context.drawImage(img, 0, 0);
    };

    function rotatePointClockwise(
      x: number,
      y: number,
      cx: number,
      cy: number,
      angleDegrees: number
    ) {
      // Convert the angle from degrees to radians
      const angleRadians = angleDegrees * (Math.PI / 180);

      // Translate the point to the origin
      const translatedX = x - cx;
      const translatedY = y - cy;

      // Apply the rotation
      const rotatedX =
        translatedX * Math.cos(angleRadians) +
        translatedY * Math.sin(angleRadians);
      const rotatedY =
        -translatedX * Math.sin(angleRadians) +
        translatedY * Math.cos(angleRadians);

      // Translate the point back to its original position
      const finalX = rotatedX + cx;
      const finalY = rotatedY + cy;

      // Return the rotated coordinates as an object
      return { x: finalX, y: finalY };
    }
    const x1 = offset.x;
    const y1 = offset.y;
    const x2 = offset.x + size;
    const y2 = offset.y + size;

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    const p1 = rotatePointClockwise(x1, y1, centerX, centerY, angle);
    const p2 = rotatePointClockwise(x2, y1, centerX, centerY, angle);
    const p3 = rotatePointClockwise(x2, y2, centerX, centerY, angle);
    const p4 = rotatePointClockwise(x1, y2, centerX, centerY, angle);

    bufferContext.beginPath();
    bufferContext.moveTo(p1.x, p1.y);
    bufferContext.lineTo(p2.x, p2.y);
    bufferContext.lineTo(p3.x, p3.y);
    bufferContext.lineTo(p4.x, p4.y);
    bufferContext.closePath();
    bufferContext.stroke();
    bufferContext.clip();

    bufferContext.drawImage(canvas, 0, 0, size, size);

    const dataURL = buffer.toDataURL();
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

      const canvasWidth = canvas.offsetWidth;
      const canvasHeight = canvas.offsetHeight;
      const ratio = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const center = { x: canvasWidth / 2, y: canvasHeight / 2 };
      setOffset({
        x: center.x - (imgWidth * ratio) / 2,
        y: center.y - (imgHeight * ratio) / 2,
      });
      setScale(ratio);
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

      setOffset({ x: offsetX, y: offsetY });
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
