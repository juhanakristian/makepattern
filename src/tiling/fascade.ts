export function createFascadeTiling(sourceCanvas: HTMLCanvasElement): string {
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
  const destinationWidth = imageSize * 2;
  const destinationHeight = imageSize * 2;

  destinationCanvas.width = destinationWidth;
  destinationCanvas.height = destinationHeight;

  const quadrantSize = imageSize;

  // Clear the destination canvas
  destinationCtx.clearRect(0, 0, destinationWidth, destinationHeight);

  // Loop through each quadrant
  for (let i = 0; i < 4; i++) {
    // Calculate the position and transformation for the quadrant
    const scaleX = i % 2 === 0 ? 1 : -1;
    const scaleY = i < 2 ? 1 : -1;
    const destinationOffsetX = i % 2 === 0 ? 0 : quadrantSize;
    const destinationOffsetY = i < 2 ? 0 : quadrantSize;

    // Draw the mirrored quadrant on the destination canvas
    destinationCtx.save();
    destinationCtx.scale(scaleX, scaleY);
    destinationCtx.drawImage(
      sourceCanvas,
      0,
      0,
      quadrantSize,
      quadrantSize,
      destinationOffsetX * scaleX * 2, // multiply by 2 to account for scaling
      destinationOffsetY * scaleY * 2, // multiply by 2 to account for scaling
      quadrantSize,
      quadrantSize
    );
    destinationCtx.restore();
  }

  // Generate a Data URL for the tiling image
  const dataURL = destinationCanvas.toDataURL();

  // Return the Data URL
  return dataURL;
}
