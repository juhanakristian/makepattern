export function createDiamondTiling(sourceCanvas: HTMLCanvasElement): string {
  // Create a temporary canvas element
  const destinationCanvas = document.createElement("canvas");
  const destinationCtx = destinationCanvas.getContext("2d");

  // Check if the destination context is null
  if (!destinationCtx) {
    throw new Error("Failed to create 2D rendering context.");
  }

  // Define the size of the source image
  const imageSize = sourceCanvas.width;

  // Set the dimensions of the destination canvas to match the tiled image size
  destinationCanvas.width = imageSize;
  destinationCanvas.height = imageSize;

  // Calculate the size of each triangle quadrant
  const quadrantSize = Math.ceil(imageSize / 2);

  // Clear the destination canvas
  destinationCtx.clearRect(0, 0, imageSize, imageSize);

  // Draw the top-left triangle quadrant
  destinationCtx.save();
  destinationCtx.beginPath();
  destinationCtx.moveTo(0, 0);
  destinationCtx.lineTo(quadrantSize, 0);
  destinationCtx.lineTo(0, quadrantSize);
  destinationCtx.closePath();
  destinationCtx.clip();
  destinationCtx.drawImage(sourceCanvas, 0, 0, quadrantSize, quadrantSize);
  destinationCtx.restore();

  // Draw the top-right triangle quadrant
  destinationCtx.save();
  destinationCtx.translate(quadrantSize, 0);
  destinationCtx.scale(-1, 1);
  destinationCtx.beginPath();
  destinationCtx.moveTo(0, 0);
  destinationCtx.lineTo(quadrantSize, 0);
  destinationCtx.lineTo(0, quadrantSize);
  destinationCtx.closePath();
  destinationCtx.clip();
  destinationCtx.drawImage(sourceCanvas, 0, 0, quadrantSize, quadrantSize);
  destinationCtx.restore();

  // Draw the bottom-left triangle quadrant
  destinationCtx.save();
  destinationCtx.translate(0, quadrantSize);
  destinationCtx.scale(1, -1);
  destinationCtx.beginPath();
  destinationCtx.moveTo(0, 0);
  destinationCtx.lineTo(quadrantSize, 0);
  destinationCtx.lineTo(0, quadrantSize);
  destinationCtx.closePath();
  destinationCtx.clip();
  destinationCtx.drawImage(sourceCanvas, 0, 0, quadrantSize, quadrantSize);
  destinationCtx.restore();

  // Draw the bottom-right triangle quadrant
  destinationCtx.save();
  destinationCtx.translate(quadrantSize, quadrantSize);
  destinationCtx.scale(-1, -1);
  destinationCtx.beginPath();
  destinationCtx.moveTo(0, 0);
  destinationCtx.lineTo(quadrantSize, 0);
  destinationCtx.lineTo(0, quadrantSize);
  destinationCtx.closePath();
  destinationCtx.clip();
  destinationCtx.drawImage(sourceCanvas, 0, 0, quadrantSize, quadrantSize);
  destinationCtx.restore();

  // Generate a Data URL for the tiling image
  const dataURL = destinationCanvas.toDataURL();

  // Return the Data URL
  return dataURL;
}
