
export function findLayer(layers: any[], pathParts: string[]): any {
  if (pathParts.length === 0) return layers;
  const [current, ...rest] = pathParts;
  const found = layers.find((layer: any) => layer.name === current);
  if (!found) return null;
  if (rest.length === 0) return found;
  return findLayer(found.children || [], rest);
}
