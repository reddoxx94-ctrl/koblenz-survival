window.KS = window.KS || {};

KS.mats = {
  grass: new THREE.MeshStandardMaterial({ color: 0x3b6e38, roughness: 0.92 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.85 }),
  granite: new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.8 }),
  bronze: new THREE.MeshStandardMaterial({ color: 0x3d4f44, metalness: 0.72, roughness: 0.35 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 }),
  slate: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 }),
  ochre: new THREE.MeshStandardMaterial({ color: 0xc89d66, roughness: 0.88 }),
  tuff: new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.85 }),
  basalt: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x7c4a24, roughness: 0.8 }),
  iron: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.32, metalness: 0.6, roughness: 0.1, side: THREE.DoubleSide })
};

KS.getTerrainHeight = function (x, z) {
  // Ostufer & Ehrenbreitstein-Massiv
  if (x >= 195) {
    if (x >= 295 && x <= 430 && z >= -110 && z <= 10) return 118.0; // Festungsplateau (183m NHN)
    if (x > 210 && x < 295) {
      const t = THREE.MathUtils.clamp((x - 210) / 85, 0, 1);
      return t * t * (3 - 2 * t) * 118.0;
    }
    return 1.2;
  }
  // Westufer Deutsches Eck
  if (Math.abs(x) <= 22 && Math.abs(z) <= 26) {
    if (Math.abs(x) <= 7 && z >= -8 && z <= 8) return 6.2; // Denkmalsockel
    if (Math.abs(x) <= 4.5 && z > 8 && z <= 23) return 1.2 + ((23 - z) / 15) * 5.0; // Freitreppe
  }
  return 1.2;
};

KS.buildWorld = function (scene) {
  const grp = new THREE.Group();

  // Rhein (bläulich-grün) & Mosel (dunkleres Blau)
  const rhein = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 700),
    new THREE.MeshStandardMaterial({ color: 0x1e5c78, roughness: 0.18, metalness: 0.35 })
  );
  rhein.rotation.x = -Math.PI / 2;
  rhein.position.set(140, 0, 0);
  grp.add(rhein);

  const mosel = new THREE.Mesh(
    new THREE.PlaneGeometry(320, 320),
    new THREE.MeshStandardMaterial({ color: 0x164a66, roughness: 0.2, metalness: 0.3 })
  );
  mosel.rotation.x = -Math.PI / 2;
  mosel.position.set(-140, 0.02, -160);
  grp.add(mosel);

  // Keilförmige Landspitze Deutsches Eck
  const eckShape = new THREE.Shape();
  eckShape.moveTo(-120, 200);
  eckShape.lineTo(80, 200);
  eckShape.lineTo(75, 20);
  eckShape.lineTo(0, -68);
  eckShape.lineTo(-95, 25);
  eckShape.closePath();

  const eckGeo = new THREE.ExtrudeGeometry(eckShape, { depth: 1.4, bevelEnabled: false });
  eckGeo.rotateX(Math.PI / 2);
  const eckMesh = new THREE.Mesh(eckGeo, KS.mats.stone);
  eckMesh.position.y = 1.2;
  grp.add(eckMesh);

  // Kaiser-Wilhelm-Denkmal
  const podest = new THREE.Mesh(new THREE.BoxGeometry(16, 5.2, 18), KS.mats.granite);
  podest.position.set(0, 3.6, 0);
  grp.add(podest);

  const treppe = new THREE.Mesh(new THREE.BoxGeometry(9, 4.8, 15), KS.mats.stone);
  treppe.position.set(0, 2.4, 15);
  treppe.rotation.x = 0.31;
  grp.add(treppe);

  const sockel = new THREE.Mesh(new THREE.BoxGeometry(6.5, 11, 7.5), KS.mats.granite);
  sockel.position.set(0, 11.5, -1);
  grp.add(sockel);

  const pferd = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 5.2), KS.mats.bronze);
  pferd.position.set(0, 18.6, -1);
  const reiter = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 3.2, 10), KS.mats.bronze);
  reiter.position.set(0, 21.2, -0.8);
  grp.add(pferd, reiter);

  // 16 Bundesländer-Flaggen im Halbkreis
  const flagColors = [0x000000, 0xdd0000, 0xffce00, 0x0ea5e9, 0x16a34a, 0xffffff];
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI * 0.85 + (i / 15) * Math.PI * 0.7;
    const fx = Math.cos(a) * 34, fz = Math.sin(a) * 34 - 18;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 8, 6), KS.mats.iron);
    pole.position.set(fx, 5.2, fz);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 2.2), new THREE.MeshStandardMaterial({ color: flagColors[i % flagColors.length] }));
    flag.position.set(fx, 8.2, fz + 1.1);
    grp.add(pole, flag);
  }

  // Ehrenbreitstein-Felsmassiv (Ostufer)
  const cliff = new THREE.Mesh(new THREE.CylinderGeometry(75, 115, 118, 12), KS.mats.slate);
  cliff.position.set(355, 59, -55);
  grp.add(cliff);

  const eastShore = new THREE.Mesh(new THREE.BoxGeometry(80, 2.4, 300), KS.mats.grass);
  eastShore.position.set(225, 0, 0);
  grp.add(eastShore);

  scene.add(grp);
};
