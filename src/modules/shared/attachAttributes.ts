export function attachAttributes(
  layerData: { attributes?: Record<string, any> },
  gameObject: { [key: string]: any } 
): void {
  if (layerData.hasOwnProperty("attributes")) {
    gameObject.attributes = layerData.attributes;
  }
}