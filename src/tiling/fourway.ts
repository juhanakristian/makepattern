export function createFourWayReflectionTiling(
  sourceCanvas: HTMLCanvasElement
): string {
  // Create a temporary canvas element
  const destinationCanvas = document.createElement("canvas");
  const destinationCtx = destinationCanvas.getContext("2d");
  if (!destinationCtx)
    throw new Error("Could not create 2D context for destination canvas");

  // Define the size of the source image
  const imageSize = sourceCanvas.width;

  // Calculate the size of each quadrant
  const quadrantSize = imageSize / 2;

  // Set the dimensions of the destination canvas to match the tiled image size
  destinationCanvas.width = imageSize;
  destinationCanvas.height = imageSize;

  // Loop through each quadrant
  for (let i = 0; i < 4; i++) {
    // Calculate the position and transformation for the quadrant
    const offsetX = i % 2 === 0 ? 0 : quadrantSize;
    const offsetY = i < 2 ? 0 : quadrantSize;
    const scaleX = i % 2 === 0 ? 1 : -1;
    const scaleY = i < 2 ? 1 : -1;

    // Draw the mirrored quadrant on the destination canvas
    destinationCtx.save();
    destinationCtx.scale(scaleX, scaleY);
    destinationCtx.drawImage(
      sourceCanvas,
      offsetX,
      offsetY,
      quadrantSize,
      quadrantSize,
      offsetX * scaleX,
      offsetY * scaleY,
      quadrantSize * scaleX,
      quadrantSize * scaleY
    );
    destinationCtx.restore();
  }

  // Generate a Data URL for the tiling image
  const dataURL = destinationCanvas.toDataURL();

  // Return the Data URL
  return dataURL;
}
