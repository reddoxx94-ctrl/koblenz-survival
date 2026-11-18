window.KS = window.KS || {};

// 1. Hochauflösende Prozedural-Texturen & Bump-Maps
KS.makeTex = function (type, rx, ry) {
  const c = document.createElement('canvas');
  const b = document.createElement('canvas');
  c.width = b.width = c.height = b.height = 256;
  const ctx = c.getContext('2d'), btx = b.getContext('2d');

  if (type === 'paving') {
    ctx.fillStyle = '#333b45'; ctx.fillRect(0, 0, 256, 256);
    btx.fillStyle = '#181818'; btx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 16) {
      const off = (y / 16) % 2 ? 8 : 0;
      for (let x = 0; x < 256; x += 16) {
        const v = 72 + ((x * 13 + y * 7) % 30);
        ctx.fillStyle = `rgb(${v},${v + 3},${v + 7})`;
        ctx.fillRect((x + off) % 256 + 1, y + 1, 14, 14);
        btx.fillStyle = '#cfcfcf';
        btx.fillRect((x + off) % 256 + 1, y + 1, 14, 14);
      }
    }
  } else if (type === 'granite') {
    ctx.fillStyle = '#5e564c'; ctx.fillRect(0, 0, 256, 256);
    btx.fillStyle = '#262626'; btx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      const off = (y / 32) % 2 ? 32 : 0;
      for (let x = 0; x < 256; x += 64) {
        const v = 124 + ((x * 11 + y * 5) % 26);
        ctx.fillStyle = `rgb(${v + 7},${v + 2},${v - 7})`;
        ctx.fillRect((x + off) % 256 + 2, y + 2, 60, 28);
        btx.fillStyle = '#d8d8d8';
        btx.fillRect((x + off) % 256 + 2, y + 2, 60, 28);
      }
    }
  } else if (type === 'grass') {
    ctx.fillStyle = '#2b5424'; ctx.fillRect(0, 0, 256, 256);
    btx.fillStyle = '#707070'; btx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const x = (i * 73) % 256, y = (i * 137) % 256;
      ctx.fillStyle = i % 2 ? '#3b6e32' : '#1f401a';
      ctx.fillRect(x, y, 3, 7);
    }
  } else if (type === 'water') {
    ctx.fillStyle = '#12435b'; ctx.fillRect(0, 0, 256, 256);
    btx.fillStyle = '#707070'; btx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 140; i++) {
      const x = (i * 53) % 230, y = (i * 97) % 250;
      ctx.fillStyle = 'rgba(186,230,253,0.16)';
      ctx.fillRect(x, y, 32, 3);
      btx.fillStyle = '#d0d0d0'; btx.fillRect(x, y, 32, 3);
    }
  }
  const map = new THREE.CanvasTexture(c), bump = new THREE.CanvasTexture(b);
  map.wrapS = map.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  map.repeat.set(rx, ry); bump.repeat.set(rx, ry);
  return { map, bump };
};

const tPav = KS.makeTex('paving', 0.14, 0.14);
const tGra = KS.makeTex('granite', 2, 2);
const tGrs = KS.makeTex('grass', 8, 8);
const tWat = KS.makeTex('water', 14, 24);

// 2. Alle Materialien (100% kompatibel mit seilbahn.js & festung.js)
KS.mats = {
  paving: new THREE.MeshStandardMaterial({ map: tPav.map, bumpMap: tPav.bump, bumpScale: 0.18, color: 0xb8c2cc, roughness: 0.86 }),
  granite: new THREE.MeshStandardMaterial({ map: tGra.map, bumpMap: tGra.bump, bumpScale: 0.22, roughness: 0.88 }),
  grass: new THREE.MeshStandardMaterial({ map: tGrs.map, bumpMap: tGrs.bump, bumpScale: 0.14, roughness: 0.94 }),
  water: new THREE.MeshStandardMaterial({ map: tWat.map, bumpMap: tWat.bump, bumpScale: 0.12, color: 0x1a5b78, roughness: 0.2, metalness: 0.35 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x7b7870, roughness: 0.9 }),
  tuff: new THREE.MeshStandardMaterial({ color: 0xc2b9a7, roughness: 0.86 }),
  basalt: new THREE.MeshStandardMaterial({ color: 0x262f3d, roughness: 0.9 }),
  slate: new THREE.MeshStandardMaterial({ color: 0x38414f, roughness: 0.94 }),
  ochre: new THREE.MeshStandardMaterial({ color: 0xc49a68, roughness: 0.86 }),
  bronze: new THREE.MeshStandardMaterial({ color: 0x24362e, metalness: 0.72, roughness: 0.35 }),
  bronzePatina: new THREE.MeshStandardMaterial({ color: 0x3d5e51, metalness: 0.55, roughness: 0.42 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x653b1c, roughness: 0.85 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x7c221e, roughness: 0.82 }),
  iron: new THREE.MeshStandardMaterial({ color: 0x1a2230, metalness: 0.75, roughness: 0.38 }),
  darkPortal: new THREE.MeshStandardMaterial({ color: 0x0b0f14, roughness: 0.95 }),
  lampGlow: new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xf59e0b, emissiveIntensity: 0.7 }),
  white: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.35, metalness: 0.6, roughness: 0.1, side: THREE.DoubleSide })
};

// 3. Terrain-Höhenberechnung (inkl. Treppen & Ehrenbreitstein)
KS.getTerrainHeight = function (x, z) {
  if (x >= 195) {
    if (x >= 295 && x <= 430 && z >= -110 && z <= 10) return 118.0;
    if (x > 210 && x < 295) {
      const t = THREE.MathUtils.clamp((x - 210) / 85, 0, 1);
      return t * t * (3 - 2 * t) * 118.0;
    }
    return 1.2;
  }
  if (Math.abs(x) <= 16 && z >= -10 && z <= 25) {
    if (Math.abs(x) <= 8.5 && z >= -8 && z <= 8.5) return 6.4;
    if (z > 8.5 && z <= 24) return 1.2 + THREE.MathUtils.clamp((24 - z) / 15.5, 0, 1) * 5.2;
  }
  return 1.2;
};

// 4. Hauptwelt-Aufbau (Etappe 1: Flüsse, Deutsches Eck & Ehrenbreitstein-Fels)
KS.buildWorld = function (scene) {
  const grp = new THREE.Group();
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    m.castShadow = true; m.receiveShadow = true;
    grp.add(m); return m;
  };

  // Rhein & Mosel
  add(new THREE.PlaneGeometry(260, 760), KS.mats.water, 145, 0, 0, -Math.PI / 2);
  add(new THREE.PlaneGeometry(340, 340), KS.mats.water, -140, 0.02, -160, -Math.PI / 2);

  // Landzunge Deutsches Eck (Schiffsbug-Form) mit Basalt-Ufermauer
  const eck = new THREE.Shape();
  eck.moveTo(-120, 200); eck.lineTo(80, 200); eck.lineTo(76, 20);
  eck.lineTo(0, -72); eck.lineTo(-96, 25); eck.closePath();
  const eckGeo = new THREE.ExtrudeGeometry(eck, { depth: 1.4, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.2 });
  eckGeo.rotateX(Math.PI / 2);
  add(eckGeo, KS.mats.paving, 0, 1.2, 0);

  // Uferwiesen (Kastorgarten & Konrad-Adenauer-Ufer)
  add(new THREE.BoxGeometry(52, 0.16, 72), KS.mats.grass, -46, 1.22, 66);
  add(new THREE.BoxGeometry(36, 0.16, 68), KS.mats.grass, 38, 1.22, 108);

  // Ostufer & gestuftes Schiefermassiv Ehrenbreitstein
  add(new THREE.BoxGeometry(85, 2.4, 320), KS.mats.grass, 225, 0, 0);
  add(new THREE.CylinderGeometry(72, 112, 118, 14), KS.mats.slate, 355, 59, -55);
  add(new THREE.CylinderGeometry(46, 80, 96, 12), KS.mats.slate, 325, 48, -115);
  add(new THREE.CylinderGeometry(48, 82, 88, 12), KS.mats.slate, 330, 44, 20);

  // Platzhalter für Etappe 2–4
  if (KS.addMonument) KS.addMonument(grp, add);
  if (KS.addLandmarks) KS.addLandmarks(grp, add);
  if (KS.addOldTown) KS.addOldTown(grp, add);

  scene.add(grp);
};
