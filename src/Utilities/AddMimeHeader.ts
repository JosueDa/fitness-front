export const addMimeHeader = (base64: string): string => {
  const prefix = base64.slice(0, 10);

  if (prefix.startsWith('iVBOR')) return `data:image/png;base64,${base64}`;
  if (prefix.startsWith('/9j/')) return `data:image/jpeg;base64,${base64}`;
  if (prefix.startsWith('R0lGOD')) return `data:image/gif;base64,${base64}`;
  if (prefix.startsWith('UklGR')) return `data:image/webp;base64,${base64}`;

  return `data:application/octet-stream;base64,${base64}`;
};

