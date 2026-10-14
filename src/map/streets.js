// Segment clipping keeps roads on the terrain, including diagonal roads at its edges.
export function clipRoad(a, b, width, height, padding = 120) {
  let lo = 0,
    hi = 1;
  const dx = b.x - a.x,
    dy = b.y - a.y;
  for (const [p, q] of [
    [-dx, a.x - padding],
    [dx, width - padding - a.x],
    [-dy, a.y - padding],
    [dy, height - padding - a.y],
  ]) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) lo = Math.max(lo, r);
    else hi = Math.min(hi, r);
    if (lo > hi) return null;
  }
  return [
    { x: a.x + lo * dx, y: a.y + lo * dy },
    { x: a.x + hi * dx, y: a.y + hi * dy },
  ];
}
export function drawStreets(scene, map) {
  if (map.roadTexture && scene.textures.exists(map.roadTexture)) {
    const layer = scene.add.container(0, 0).setDepth(-50);
    const source = scene.textures.get(map.roadTexture).getSourceImage();
    for (const road of map.roads ?? []) {
      const [a, b] = road.points;
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const height = road.width * 1.7;
      const strip = scene.add.tileSprite((a.x+b.x)/2, (a.y+b.y)/2, length, height, map.roadTexture)
        .setRotation(Math.atan2(b.y-a.y,b.x-a.x));
      strip.tileScaleX = strip.tileScaleY = height / source.height;
      layer.add(strip);
    }
    return layer;
  }
  const g = scene.add.graphics().setDepth(-50),
    paths = [];
  for (const road of map.roads ?? []) {
    const points = clipRoad(
      road.points[0],
      road.points[1],
      map.width,
      map.height,
    );
    if (points) paths.push({ ...road, points });
  }
  for (const [color, extra] of [
    [0xbca17a, 8],
    [0xdcc9a7, 4],
    [0xe4cb91, 0],
  ])
    for (const road of paths) {
      g.lineStyle(road.width + extra, color, 1);
      g.strokePoints(road.points, false);
      g.fillStyle(color, 1);
      for (const p of road.points) g.fillCircle(p.x, p.y, (road.width + extra) / 2);
    }
  for (const road of paths) {
    g.lineStyle(1, 0xd8c5a5, 0.15);
    g.strokePoints(road.points, false);
  }
  for (const corner of map.intersections ?? []) {
    g.fillStyle(0xf3e7cf, 1);
    g.fillEllipse(corner.x, corner.y, 72, 42);
    g.lineStyle(2, 0xd8c5a5, 1);
    g.strokeEllipse(corner.x, corner.y, 72, 42);
  }
  return g;
}
