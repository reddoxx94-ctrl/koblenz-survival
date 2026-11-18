(function () {
  window.KS = window.KS || {};

  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const ctx = c.getContext('2d');

  function generateFullKoblenzMap() {
    ctx.fillStyle = '#2b313a';
    ctx.fillRect(0, 0, 1024, 1024);

    // Rhein & Mosel
    ctx.fillStyle = '#123e54';
    ctx.fillRect(550, 0, 474, 1024); // Rhein
    ctx.fillRect(0, 0, 550, 400);    // Mosel

    // Deutsches Eck & Promenaden
    ctx.fillStyle = '#3a424f';
    ctx.beginPath();
    ctx.moveTo(450, 400); ctx.lineTo(750, 400); ctx.lineTo(700, 150);
    ctx.lineTo(520, 80); ctx.lineTo(400, 250); ctx.closePath();
    ctx.fill();

    // Kurfürstliches Schloss Koblenz
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(480, 650, 120, 80);

    // Görresplatz & Altstadt
    ctx.fillStyle = '#475569';
    ctx.fillRect(250, 450, 140, 140);

    // Straßennetz
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 6;
    const roads = [
      [[480, 400], [480, 800]],
      [[250, 520], [480, 520]],
      [[320, 350], [320, 750]],
      [[200, 450], [400, 450]]
    ];
    roads.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(r[0][0], r[0][1]);
      ctx.lineTo(r[1][0], r[1][1]);
      ctx.stroke();
    });
  }

  generateFullKoblenzMap();

  const mapTex = new THREE.CanvasTexture(c);
  mapTex.wrapS = mapTex.wrapT = THREE.RepeatWrapping;
  KS.waterTexRef = mapTex;

  const lampMaterial = new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xf59e0b, emissiveIntensity: 0.2 });
  KS.lampMatRef = lampMaterial;

  KS.mats = {
    paving: new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.85 }),
    granite: new THREE.MeshStandardMaterial({ color: 0x575046, roughness: 0.88 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x274d21, roughness: 0.95 }),
    slate: new THREE.MeshStandardMaterial({ color: 0x313945, roughness: 0.93 }),
    water: new THREE.MeshStandardMaterial({ color: 0x123e54, roughness: 0.2, metalness: 0.38, transparent: true, opacity: 0.92 }),
    palace: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 }),
    tuff: new THREE.MeshStandardMaterial({ color: 0xc8bfa8, roughness: 0.85 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x1a2230, metalness: 0.75, roughness: 0.38 }),
    lampGlow: lampMaterial,
    white: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  };

  KS.getTerrainHeight = function (x, z) {
    if (x >= 195) return 118.0;
    return 1.2;
  };

  KS.getKoblenzLocation = function (x, z) {
    if (x >= 195) return "Festung Ehrenbreitstein";
    if (z >= 120) return "Kurfürstliches Schloss Koblenz";
    if (x <= -40 && z >= 30 && z <= 70) return "Görresplatz (Altstadt)";
    if (Math.abs(x) <= 22 && z >= -15 && z <= 28) return "Kaiser-Wilhelm-Denkmal (Deutsches Eck)";
    if (x <= -15 && z >= 60 && z <= 90) return "Basilika St. Kastor";
    return "Konrad-Adenauer-Ufer / Rheinanlagen";
  };

  KS.buildWorld = function (scene) {
    const grp = new THREE.Group();
    KS.animatedFlags = [];

    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      grp.add(mesh);
      return mesh;
    };

    add(new THREE.PlaneGeometry(600, 600), KS.mats.paving, 0, 0, 100, -Math.PI / 2);
    add(new THREE.PlaneGeometry(260, 900), KS.mats.water, 180, 0.05, 50, -Math.PI / 2);
    add(new THREE.PlaneGeometry(400, 400), KS.mats.water, -180, 0.07, -180, -Math.PI / 2);

    // Kurfürstliches Schloss
    add(new THREE.BoxGeometry(45, 12, 18), KS.mats.palace, 60, 7.2, 140);
    add(new THREE.BoxGeometry(18, 14, 35), KS.mats.palace, 82, 8.2, 115);
    add(new THREE.BoxGeometry(18, 14, 35), KS.mats.palace, 38, 8.2, 115);

    // Görresplatz Säule
    add(new THREE.CylinderGeometry(1.5, 1.8, 9, 10), KS.mats.granite, -65, 5.7, 45);

    // St. Kastor
    add(new THREE.BoxGeometry(16, 15, 34), KS.mats.tuff, -24, 8.7, 74);
    add(new THREE.ConeGeometry(12, 6.2, 4), KS.mats.slate, -24, 19.3, 74, 0, Math.PI / 4, 0);

    // Ehrenbreitstein Felsmassiv
    add(new THREE.BoxGeometry(85, 2.4, 340), KS.mats.grass, 245, 0, 0);
    add(new THREE.CylinderGeometry(72, 112, 118, 16), KS.mats.slate, 365, 59, -55);

    scene.add(grp);
  };
})();
