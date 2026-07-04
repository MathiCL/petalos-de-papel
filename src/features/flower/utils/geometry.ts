export const LAYERS = [
  { capacity: 8, radius: 65 },
  { capacity: 10, radius: 100 },
  { capacity: 12, radius: 135 },
  { capacity: 15, radius: 170 }
];

export interface PetalGeometry {
  radius: number;
  angle: number;
  x: number;
  y: number;
  rotation: number;
}

export function calculatePetalGeometry(index: number, totalBooks: number, centerX = 200, centerY = 200): PetalGeometry {
  let capacitySum = 0;
  let layerIndex = 0;
  
  for (let l = 0; l < LAYERS.length; l++) {
    if (index < capacitySum + LAYERS[l].capacity) {
      layerIndex = l;
      break;
    }
    capacitySum += LAYERS[l].capacity;
  }

  if (layerIndex >= LAYERS.length) {
    layerIndex = LAYERS.length - 1;
  }

  const layer = LAYERS[layerIndex];
  
  const booksInThisLayer = Math.min(
    layer.capacity,
    Math.max(0, totalBooks - capacitySum)
  );
  
  const indexInLayer = index - capacitySum;
  
  const layerOffset = layerIndex * 15; 
  
  const angleDegrees = booksInThisLayer === 1 
    ? -90 + layerOffset 
    : (indexInLayer * (360 / booksInThisLayer)) - 90 + layerOffset;

  const angleRadians = angleDegrees * (Math.PI / 180);

  const x = centerX + layer.radius * Math.cos(angleRadians);
  const y = centerY + layer.radius * Math.sin(angleRadians);

  return {
    radius: layer.radius,
    angle: angleDegrees,
    x,
    y,
    rotation: angleDegrees + 90 
  };
}
