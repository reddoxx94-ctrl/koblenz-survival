window.KS = window.KS || {};

// Prozedurale Texturen (Pflaster, Gras, Fassade, Wasser) – kein externer Download nötig
KS.makeTex = function (type) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');

  if (type === 'paving') {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 32) {
        const off = (y / 32) % 2 === 0 ? 0 : 16;
        const shade = 110 + Math.floor(Math.random() * 35);
        ctx.fillStyle = `rgb(${shade},${shade + 4},${shade + 10})`;
        ctx.fillRect((x + off) % 256 + 2, y + 2, 28, 28);
      }
    }
  } else if (type === 'grass') {
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#3b7333' : '#23471e';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 8);
    }
  } else if (type === 'water') {
    ctx.fillStyle = '#154c66';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(186, 230, 253, 0.12)';
    for (let i = 0; i < 120; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 28, 3);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(type === 'paving' ? 28 : 16, type === 'paving' ? 28 : 16);
  return tex;
};

const pavingTex = KS.makeTex('paving');
const grassTex = KS.makeTex('grass');
const waterTex = KS.makeTex('water');

KS.mats = {
  grass: new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95 }),
  paving: new THREE.MeshStandardMaterial({ map: pavingTex, roughness: 0.9 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x737d8c, roughness: 0.88 }),
  granite: new THREE.MeshStandardMaterial({ color: 0x57606e, roughness: 0.85 }),
  bronze: new THREE.MeshStandardMaterial({ color: 0x35473d, metalness: 0.72, roughness: 0.35 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 }),
  slate: new THREE.MeshStandardMaterial({ color: 0x3f4a59, roughness: 0.95 }),
  ochre: new THREE.MeshStandardMaterial({ color: 0xb88b58, roughness: 0.88 }),
  tuff: new THREE.MeshStandardMaterial({ color: 0xbeb6a8, roughness: 0.85 }),
  basalt: new THREE.MeshStandardMaterial({ color: 0x2a3545, roughness: 0.9 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x6b3e1d, roughness: 0.85 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.85 }),
  iron: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 }),
  white: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.35, metalness: 0.6, roughness: 0.1, side: THREE.DoubleSide })
};

KS.getTerrainHeight = function (x, z) {
  if (x >= 195) {
    if (x >= 295 && x <= 430 && z >= -110 && z <= 10) return 118.0;
    if (x > 210 && x < 295) {
      const t = THREE.MathUtils.clamp((x - 210) / 85, 0, 1);
      return t * t * (3 - 2 * t) * 118.0;
    }
    return 1.2;
  }
  if (Math.abs(x) <= 22 && Math.abs(z) <= 26) {
    if (Math.abs(x) <= 7 && z >= -8 && z <= 8) return 6.2;
    if (Math.abs(x) <= 4.5 && z > 8 && z <= 23) return 1.2 + ((23 - z) / 15) * 5.0;
  }
  return 1.2;
};

KS.buildWorld = function (scene) {
  const grp = new THREE.Group();

  // 1) Rhein & Mosel mit Wasser-Struktur
  const waterMat = new THREE.MeshStandardMaterial({ map: waterTex, color: 0x1e5c78, roughness: 0.25, metalness: 0.3 });
  const rhein = new THREE.Mesh(new THREE.PlaneGeometry(260, 750), waterMat);
  rhein.rotation.x = -Math.PI / 2;
  rhein.position.set(145, 0, 0);
  grp.add(rhein);

  const mosel = new THREE.Mesh(new THREE.PlaneGeometry(340, 340), waterMat);
  mosel.rotation.x = -Math.PI / 2;
  mosel.position.set(-140, 0.02, -160);
  grp.add(mosel);

  // 2) Landspitze Deutsches Eck (gepflastert + Ufermauer)
  const eckShape = new THREE.Shape();
  eckShape.moveTo(-120, 200);
  eckShape.lineTo(80, 200);
  eckShape.lineTo(75, 20);
  eckShape.lineTo(0, -68);
  eckShape.lineTo(-95, 25);
  eckShape.closePath();

  const eckGeo = new THREE.ExtrudeGeometry(eckShape, { depth: 1.4, bevelEnabled: false });
  eckGeo.rotateX(Math.PI / 2);
  const eckMesh = new THREE.Mesh(eckGeo, KS.mats.paving);
  eckMesh.position.y = 1.2;
  grp.add(eckMesh);

  // Grünflächen am Konrad-Adenauer-Ufer
  const park1 = new THREE.Mesh(new THREE.BoxGeometry(50, 0.15, 70), KS.mats.grass);
  park1.position.set(-48, 1.22, 65);
  const park2 = new THREE.Mesh(new THREE.BoxGeometry(36, 0.15, 65), KS.mats.grass);
  park2.position.set(38, 1.22, 110);
  grp.add(park1, park2);

  // 3) Kaiser-Wilhelm-Denkmal
  const podest = new THREE.Mesh(new THREE.BoxGeometry(16, 5.2, 18), KS.mats.granite);
  podest.position.set(0, 3.6, 0);
  const treppe = new THREE.Mesh(new THREE.BoxGeometry(9, 4.8, 15), KS.mats.stone);
  treppe.position.set(0, 2.4, 15);
  treppe.rotation.x = 0.31;
  const sockel = new THREE.Mesh(new THREE.BoxGeometry(6.5, 11, 7.5), KS.mats.granite);
  sockel.position.set(0, 11.5, -1);
  const pferd = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 5.2), KS.mats.bronze);
  pferd.position.set(0, 18.6, -1);
  const reiter = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 3.2, 10), KS.mats.bronze);
  reiter.position.set(0, 21.2, -0.8);
  grp.add(podest, treppe, sockel, pferd, reiter);

  // 4) 16 Bundesländer-Flaggen
  const flagColors = [0x111111, 0xdd0000, 0xffce00, 0x0ea5e9, 0x16a34a, 0xf8fafc];
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI * 0.85 + (i / 15) * Math.PI * 0.7;
    const fx = Math.cos(a) * 34, fz = Math.sin(a) * 34 - 18;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 8, 6), KS.mats.iron);
    pole.position.set(fx, 5.2, fz);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 2.2), new THREE.MeshStandardMaterial({ color: flagColors[i % flagColors.length] }));
    flag.position.set(fx, 8.2, fz + 1.1);
    grp.add(pole, flag);
  }

  // 5) Koblenzer Altstadt-Häuser (Kastorhof & Rheinpromenade)
  const houseSpecs = [
    { x: -32, z: 85, w: 14, h: 11, d: 12, col: 0xd6b892 },
    { x: -12, z: 95, w: 16, h: 13, d: 12, col: 0xc99c72 },
    { x: 10,  z: 96, w: 14, h: 10, d: 11, col: 0xd4c7b4 },
    { x: -55, z: 110, w: 18, h: 14, d: 14, col: 0xb88b68 },
    { x: -28, z: 118, w: 15, h: 12, d: 12, col: 0xcfb997 },
    { x: 0,   z: 122, w: 20, h: 15, d: 14, col: 0xc2a88c },
    { x: 26,  z: 128, w: 14, h: 11, d: 12, col: 0xb59e84 }
  ];

  houseSpecs.forEach((hs) => {
    const wallMat = new THREE.MeshStandardMaterial({ color: hs.col, roughness: 0.88 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(hs.w, hs.h, hs.d), wallMat);
    body.position.set(hs.x, 1.2 + hs.h / 2, hs.z);
    grp.add(body);

    // Satteldach
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(hs.w, hs.d) * 0.78, 4.5, 4), KS.mats.roof);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(hs.x, 1.2 + hs.h + 2.25, hs.z);
    grp.add(roof);

    // Fensterreihen (Vorder- & Rückseite)
    for (let wy = 3.5; wy < hs.h - 1; wy += 3.2) {
      for (let wx = -hs.w / 2 + 2.5; wx <= hs.w / 2 - 2.5; wx += 3.5) {
        const winF = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 0
                                                          
