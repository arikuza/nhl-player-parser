// Convert height from feet'inches" format to centimeters
export function heightToCm(height: string): number {
  // Parse format like "6'2"", "6'2", "6' 2"", or "6' 0""
  const match = height.match(/(\d+)'\s*(\d+)"?/);
  if (!match) return 0;

  const feet = parseInt(match[1]);
  const inches = parseInt(match[2]);

  // Convert to cm (1 foot = 30.48 cm, 1 inch = 2.54 cm)
  return Math.round(feet * 30.48 + inches * 2.54);
}

// Convert weight from pounds to kilograms
export function weightToKg(weight: string): number {
  // Parse format like "210 lbs", "210 lb", "210" etc.
  const pounds = parseInt(weight.replace(/[^\d]/g, ''));
  if (isNaN(pounds)) return 0;

  // Convert to kg (1 pound = 0.453592 kg)
  return Math.round(pounds * 0.453592);
}

// Format height with both imperial and metric
export function formatHeight(height: string): string {
  const cm = heightToCm(height);
  if (cm === 0) return height;
  return `${height} (${cm} cm)`;
}

// Format weight with both imperial and metric
export function formatWeight(weight: string): string {
  const kg = weightToKg(weight);
  if (kg === 0) return weight;

  // Clean up the original weight string - remove all variations of lbs/lb
  let cleanWeight = weight.trim();
  cleanWeight = cleanWeight.replace(/\s*lbs?\s*/gi, '').trim();
  cleanWeight = cleanWeight.replace(/\s*lb\s*/gi, '').trim();

  return `${cleanWeight} lbs (${kg} kg)`;
}