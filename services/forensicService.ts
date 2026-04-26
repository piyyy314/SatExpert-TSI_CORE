
/**
 * Calculates Shannon Entropy of a string.
 * High entropy (> 4.5 for URLs) often indicates obfuscation, 
 * randomized paths, or generated DGA domains.
 */
export const calculateEntropy = (data: string): number => {
  if (!data) return 0;
  
  const len = data.length;
  const frequencies: Record<string, number> = {};
  
  for (let i = 0; i < len; i++) {
    const char = data[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  let entropy = 0;
  Object.values(frequencies).forEach(count => {
    const p = count / len;
    entropy -= p * Math.log2(p);
  });
  
  return entropy;
};

/**
 * Normalizes entropy for URL-specific context.
 */
export const getUrlRiskFactor = (url: string): { score: number; level: 'LOW' | 'MED' | 'HIGH' } => {
  const entropy = calculateEntropy(url);
  let level: 'LOW' | 'MED' | 'HIGH' = 'LOW';
  
  if (entropy > 4.5) level = 'HIGH';
  else if (entropy > 3.8) level = 'MED';
  
  return { score: entropy, level };
};
