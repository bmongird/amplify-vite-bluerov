export const convertToLatLng = (x: number, y: number): [number, number] => {
  // conversion assuming 0,0 is at a specific lat/lng
  const originLat = 37.8120;
  const originLng = -122.4058;

  const earthRadius = 6378137; // meters

  const dn = y; // offset in north direction (latitude)
  const de = x; // offset in east direction (longitude)

  const dLat = dn / earthRadius;
  const dLon = de / (earthRadius * Math.cos(Math.PI * originLat / 180));
  const newLat = originLat + dLat * 180 / Math.PI;
  const newLng = originLng + dLon * 180 / Math.PI;

  return [newLat, newLng];
};
