(function () {
  window.KS = window.KS || {};

  // ============================================================
  // 1. HOCHAUFLÖSENDE 512x512 PROZEDURAL-TEXTUREN & BUMP-MAPS
  // ============================================================
  KS.createTextureSet = function (type, repX, repY) {
    const c = document.createElement('canvas');
    const b = document.createElement('canvas');
    c.width = b.width = 512;
    c.height = b.height = 512;
    const ctx = c.getContext('2d');
    const btx = b.getContext('2d');

    if (type === 'paving') {
      ctx.fillStyle = '#2b313a';
      ctx.fillRect(0, 0, 512, 512);
      btx.fillStyle = '#181818';
      btx.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 16) {
        const off = (y / 16) % 2 === 0 ? 0 : 8;
        for (let x = 0; x < 512; x += 16) {
          const v = 62 + Math.floor(Math.random() * 34);
          ctx.fillStyle = `rgb(${v},${v + 3},${v + 7})`;
          ctx.fillRect((x + off) % 512 + 1, y + 1, 14, 14);
          const bv = 150 + Math.floor(Math.random() * 80);
          btx.fillStyle = `rgb(${bv},${bv},${bv})`;
          ctx.fillRect((x + off) % 512 + 1, y + 1, 14, 14);
        }
      }
    } else if (type === 'granite') {
      ctx.fillStyle = '#575046';
      ctx.fillRect(0, 0, 512, 512);
      btx.fillStyle = '#222222';
      btx.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 32) {
        const off = (y / 32) % 2 === 0 ? 0 : 32;
        for (let x = 0; x < 512; x += 64) {
          const v = 118 + Math.floor(Math.random() * 30);
          ctx.fillStyle = `rgb(${v + 8},${v + 3},${v - 6})`;
          ctx.fillRect((x + off) % 512 + 2, y + 2, 60, 28);
          btx.fillStyle = '#d8d8d8';
          btx.fillRect((x + off) % 512 + 2, y + 2, 60, 28);
        }
      }
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(30,26,22,0.14)' : 'rgba(220,210,195,0.08)';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 8, 5);
      }
    } else if (type === 'grass') {
      ctx.fillStyle = '#274d21';
      ctx.fillRect(0, 0, 512, 512);
      btx.fillStyle = '#787878';
      btx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 3000; i++) {
        const gx = Math.random() * 512, gy = Math.random() * 512;
        ctx.fillStyle = Math.random() > 0.45 ? '#37692e' : '#1d3b18';
        ctx.fillRect(gx, gy, 3, 7);
        btx.fillStyle = Math.random() > 0.5 ? '#c4c4c4' : '#424242';
        btx.fillRect(gx, gy, 3, 7);
      }
    } else if (type === 'slate') {
      ctx.fillStyle = '#313945';
      ctx.fillRect(0, 0, 512, 512);
      btx.fillStyle = '#585858';
      btx.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 8) {
        const v = 48 + Math.floor(Math.random() * 30);
        ctx.fillStyle = `rgb(${v},${v + 5},${v + 12})`;
        ctx.fillRect(0, y, 512, 6);
        btx.fillStyle = Math.random() > 0.5 ? '#c0c0c0' : '#353535';
        btx.fillRect(0, y, 512, 5);
      }
    } else if (type === 'water') {
      ctx.fillStyle = '#123e54';
      ctx.fillRect(0, 0, 512, 512);
      btx.fillStyle = '#707070';
      btx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 400; i++) {
        const wx = Math.random() * 512, wy = Math.random() * 512;
        ctx.fillStyle = 'rgba(186,230,253,0.15)';
        ctx.fillRect(wx, wy, 42, 3);
        btx.fillStyle = '#d4d4d4';
        btx.fillRect(wx, wy, 42, 3);
      }
    }

    const map = new THREE.CanvasTexture(c);
    const bump = new THREE.CanvasTexture(b);
    map.wrapS = map.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    map.repeat.set(repX, repY);
    bump.repeat.set(repX, repY);
    return { map, bump };
  };

  const pavingTex = KS.createTextureSet('paving', 0.14, 0.14);
  const graniteTex = KS.createTextureSet('granite', 2, 2);
  const grassTex = KS.createTextureSet('grass', 10, 10);
  const slateTex = KS.createTextureSet('slate', 8, 8);
  const waterTex = KS.createTextureSet('water', 16, 26);

  // ============================================================
  // 2. MATERIALIEN (100% KOMPATIBEL MIT SEILBAHN & FESTUNG)
  // ============================================================
  KS.mats = {
    paving: new THREE.MeshStandardMaterial({ map: pavingTex.map, bumpMap: pavingTex.bump, bumpScale: 0.18, color: 0xb8c0cc, roughness: 0.86, metalness: 0.06 }),
    granite: new THREE.MeshStandardMaterial({ map: graniteTex.map, bumpMap: graniteTex.bump, bumpScale: 0.24, color: 0xffffff, roughness: 0.88 }),
    grass: new THREE.MeshStandardMaterial({ map: grassTex.map, bumpMap: grassTex.bump, bumpScale: 0.14, color: 0xffffff, roughness: 0.95 }),
    slate: new THREE.MeshStandardMaterial({ map: slateTex.map, bumpMap: slateTex.bump, bumpScale: 0.36, color: 0xffffff, roughness: 0.93 }),
    water: new THREE.MeshStandardMaterial({ map: waterTex.map, bumpMap: waterTex.bump, bumpScale: 0.12, color: 0x1a5875, roughness: 0.2, metalness: 0.38 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x7b7870, roughness: 0.9 }),
    tuff: new THREE.MeshStandardMaterial({ color: 0xc8bfa8, roughness: 0.85 }),
    basalt: new THREE.MeshStandardMaterial({ color: 0x232a36, roughness: 0.9 }),
    ochre: new THREE.MeshStandardMaterial({ color: 0xc49a68, roughness: 0.86 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x22332b, metalness: 0.74, roughness: 0.34 }),
    bronzePatina: new THREE.MeshStandardMaterial({ color: 0x3b5e50, metalness: 0.56, roughness: 0.42 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.86, roughness: 0.24 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x653b1c, roughness: 0.85 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x7c221e, roughness: 0.82 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x1a2230, metalness: 0.75, roughness: 0.38 }),
    darkPortal: new THREE.MeshStandardMaterial({ color: 0x080b10, roughness: 0.96 }),
    lampGlow: new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xf59e0b, emissiveIntensity: 0.75 }),
    white: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.35, metalness: 0.6, roughness: 0.1, side: THREE.DoubleSide })
  };

  // ============================================================
  // 3. BEGEHBARES TERRAIN & DENKMAL-TREPPEN
  // ============================================================
  KS.getTerrainHeight = function (x, z) {
    if (x >= 195) {
      if (x >= 295 && x <= 430 && z >= -110 && z <= 10) return 118.0;
      if (x > 210 && x < 295) {
        const t = THREE.MathUtils.clamp((x - 210) / 85, 0, 1);
        return t * t * (3 - 2 * t) * 118.0;
      }
      return 1.2;
    }
    if (Math.abs(x) <= 17 && z >= -12 && z <= 25) {
      if (Math.abs(x) <= 8.8 && z >= -9 && z <= 8.5) return 6.4;
      if (z > 8.5 && z <= 24.5) {
        const t = THREE.MathUtils.clamp((24.5 - z) / 16.0, 0, 1);
        return 1.2 + t * 5.2;
      }
    }
    return 1.2;
  };

  // ============================================================
  // 4. KAISER-WILHELM-DENKMAL & REITERSTATUE
  // ============================================================
  function buildMonument() {
    const m = new THREE.Group();
    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      m.add(mesh);
      return mesh;
    };

    // A) Breite geschwungene Stufenanlage + Mittelaufgang mit Geländern
    for (let i = 0; i < 12; i++) {
      const y = 1.4 + i * 0.42;
      const r = 19.6 - i * 0.95;
      add(new THREE.CylinderGeometry(r, r + 0.32, 0.44, 28, 1, false, -Math.PI * 0.48, Math.PI * 0.96), KS.mats.granite, 0, y, 8.5);
    }
    for (let i = 0; i < 14; i++) {
      add(new THREE.BoxGeometry(4.4, 0.38, 1.15), KS.mats.granite, 0, 1.4 + i * 0.38, 22.8 - i * 1.02);
    }
    [-2.35, 2.35].forEach((rx) => {
      add(new THREE.BoxGeometry(0.14, 0.14, 15.8), KS.mats.iron, rx, 5.1, 15.6, 0.34, 0, 0);
      for (let p = 0; p < 5; p++) {
        add(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8), KS.mats.iron, rx, 2.2 + p * 1.15, 22.2 - p * 3.3);
      }
    });
    // Seitliche Wangen-Blöcke mit grünen Bronzetafeln
    [-11.6, 11.6].forEach((sx) => {
      add(new THREE.BoxGeometry(4.8, 3.2, 5.6), KS.mats.granite, sx, 2.8, 10.5);
      add(new THREE.BoxGeometry(2.5, 1.5, 0.2), KS.mats.bronzePatina, sx, 2.7, 13.35);
    });

    // B) Mächtiger Hallensockel mit 3 dunklen Portalen, Mittelgitter & Eckreliefs
    add(new THREE.BoxGeometry(17.0, 1.2, 17.0), KS.mats.granite, 0, 6.2, 0);
    add(new THREE.BoxGeometry(15.4, 6.8, 15.4), KS.mats.granite, 0, 10.2, 0);

    [-3.2, 0, 3.2].forEach((px, idx) => {
      add(new THREE.BoxGeometry(1.95, 4.6, 0.65), KS.mats.darkPortal, px, 9.5, 7.5);
      if (idx === 1) {
        for (let g = -0.6; g <= 0.6; g += 0.3) {
          add(new THREE.BoxGeometry(0.06, 4.4, 0.08), KS.mats.iron, g, 9.5, 7.78);
        }
      }
    });

    // Eckpilaster mit Reichsadler-/Wappen-Reliefs
    [-6.4, 6.4].forEach((ex) => {
      add(new THREE.BoxGeometry(3.2, 7.0, 2.2), KS.mats.granite, ex, 10.2, 7.25);
      add(new THREE.BoxGeometry(2.1, 2.9, 0.36), KS.mats.tuff, ex, 9.8, 8.42);
      add(new THREE.CylinderGeometry(0.9, 0.72, 0.32, 12), KS.mats.stone, ex, 11.75, 8.42, Math.PI / 2, 0, 0);
    });

    // Rückwärtige halbkreisförmige Säulen-Kolonnade (Architektur-Detail von Bruno Schmitz)
    for (let c = 0; c < 9; c++) {
      const ca = -Math.PI * 0.78 + (c / 8) * Math.PI * 0.56;
      const cx = Math.cos(ca) * 21.5;
      const cz = Math.sin(ca) * 21.5 + 2.0;
      add(new THREE.CylinderGeometry(0.65, 0.75, 9.5, 12), KS.mats.granite, cx, 6.0, cz);
    }
    add(new THREE.TorusGeometry(21.5, 0.9, 8, 24, Math.PI * 0.62), KS.mats.granite, 0, 11.0, 2.0, Math.PI / 2, 0, -Math.PI * 0.81);

    // C) Auskragendes Gesims & gestufter Pyramiden-Aufbau mit 4 Nischen
    add(new THREE.BoxGeometry(18.0, 0.95, 18.0), KS.mats.granite, 0, 13.9, 0);
    add(new THREE.BoxGeometry(17.0, 0.55, 17.0), KS.mats.tuff, 0, 14.6, 0);
    add(new THREE.BoxGeometry(13.8, 2.2, 13.8), KS.mats.granite, 0, 15.9, 0);
    [-3.8, -1.3, 1.3, 3.8].forEach((nx) => {
      add(new THREE.BoxGeometry(0.75, 0.75, 0.35), KS.mats.darkPortal, nx, 15.9, 6.82);
    });
    add(new THREE.BoxGeometry(11.0, 1.5, 11.0), KS.mats.granite, 0, 17.7, 0);
    add(new THREE.BoxGeometry(8.4, 1.2, 8.4), KS.mats.granite, 0, 19.0, 0);
    add(new THREE.BoxGeometry(6.2, 1.0, 6.2), KS.mats.granite, 0, 20.1, 0);

    // D) REITERSTATUE (Schlachtross, Kaiser Wilhelm I. & Geflügelter Genius)
    const st = new THREE.Group();
    st.position.set(0, 20.6, 0);
    const sAdd = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.castShadow = true;
      st.add(mesh);
      return mesh;
    };

    // Bronze-Plinthe
    sAdd(new THREE.BoxGeometry(4.5, 0.48, 5.4), KS.mats.bronze, 0, 0.24, 0);

    // Schlachtross (Rumpf, Brust, Kruppe, gebogener Hals, Kopf, Ohren, 4 Beine, Schweif)
    sAdd(new THREE.CylinderGeometry(1.18, 1.26, 4.2, 16), KS.mats.bronze, 0.25, 3.25, 0.1, Math.PI / 2, 0, 0);
    sAdd(new THREE.SphereGeometry(1.24, 16, 14), KS.mats.bronze, 0.25, 3.35, 2.05);
    sAdd(new THREE.SphereGeometry(1.20, 16, 14), KS.mats.bronze, 0.25, 3.25, -1.85);
    sAdd(new THREE.CylinderGeometry(0.56, 0.98, 2.4, 14), KS.mats.bronzePatina, 0.25, 4.8, 2.55, 0.44, 0, 0);
    sAdd(new THREE.BoxGeometry(0.7, 0.8, 1.6), KS.mats.bronze, 0.25, 5.7, 3.35, 0.35, 0, 0);
    sAdd(new THREE.ConeGeometry(0.14, 0.4, 6), KS.mats.bronze, 0.02, 6.25, 2.95, 0.2, 0, 0);
    sAdd(new THREE.ConeGeometry(0.14, 0.4, 6), KS.mats.bronze, 0.48, 6.25, 2.95, 0.2, 0, 0);

    // 4 Pferdebeine (vorderes rechtes Bein schreitend angehoben)
    sAdd(new THREE.CylinderGeometry(0.28, 0.21, 2.85, 10), KS.mats.bronze, -0.45, 1.6, 1.75);
    sAdd(new THREE.CylinderGeometry(0.28, 0.21, 1.8, 10), KS.mats.bronze, 0.95, 2.35, 2.05, -0.58, 0, 0);
    sAdd(new THREE.CylinderGeometry(0.22, 0.18, 1.5, 10), KS.mats.bronze, 0.95, 1.25, 2.48, 0.38, 0, 0);
    sAdd(new THREE.CylinderGeometry(0.32, 0.22, 2.9, 10), KS.mats.bronze, -0.45, 1.6, -1.65);
    sAdd(new THREE.CylinderGeometry(0.32, 0.22, 2.9, 10), KS.mats.bronze, 0.95, 1.6, -1.65);
    // Kräftiger, leicht ausgestellter Pferdeschweif
    sAdd(new THREE.CylinderGeometry(0.22, 0.38, 2.7, 10), KS.mats.bronzePatina, 0.25, 2.1, -2.98, 0.36, 0, 0);

    // Kaiser Wilhelm I. (Reiterbeine, Mantel, Brustkorb, Arme, Kopf, Pickelhaube)
    sAdd(new THREE.CylinderGeometry(0.76, 1.38, 2.25, 14), KS.mats.bronzePatina, 0.25, 5.15, -0.1);
    sAdd(new THREE.CylinderGeometry(0.64, 0.74, 1.85, 14), KS.mats.bronze, 0.25, 6.25, 0.05);
    // Rechter Arm mit Feldherrnstab & linker Zügelarm
    sAdd(new THREE.CylinderGeometry(0.2, 0.18, 1.7, 8), KS.mats.bronze, 1.05, 5.9, 0.55, 0.65, 0, -0.35);
    sAdd(new THREE.CylinderGeometry(0.2, 0.18, 1.6, 8), KS.mats.bronze, -0.5, 5.8, 0.65, 0.85, 0, 0.25);
    sAdd(new THREE.SphereGeometry(0.46, 14, 14), KS.mats.bronzePatina, 0.25, 7.5, 0.1);
    sAdd(new THREE.SphereGeometry(0.48, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), KS.mats.bronze, 0.25, 7.6, 0.1);
    sAdd(new THREE.ConeGeometry(0.11, 0.58, 8), KS.mats.gold, 0.25, 8.25, 0.1);
    // Wehender Kaisermantel über der Kruppe
    sAdd(new THREE.ConeGeometry(1.4, 3.3, 12, 1, true, 0, Math.PI), KS.mats.bronzePatina, 0.25, 4.95, -0.78, 0.26, Math.PI, 0);

    // Geflügelter Genius / Viktoria links neben dem Ross (mit Reichskrone & hohen Schwingen)
    sAdd(new THREE.CylinderGeometry(0.44, 0.88, 3.3, 12), KS.mats.bronzePatina, -1.55, 1.95, 0.9);
    sAdd(new THREE.SphereGeometry(0.36, 12, 12), KS.mats.bronze, -1.55, 3.85, 0.95);
    sAdd(new THREE.CylinderGeometry(0.14, 0.14, 1.4, 8), KS.mats.bronze, -1.45, 4.3, 1.45, 0.75, 0, 0);
    sAdd(new THREE.TorusGeometry(0.24, 0.07, 8, 12), KS.mats.gold, -1.45, 4.85, 1.85, Math.PI / 2, 0, 0);
    // Markante hoch aufragende Flügel (wie auf deinem Foto links im Himmel sichtbar)
    sAdd(new THREE.BoxGeometry(0.18, 4.5, 1.45), KS.mats.bronzePatina, -2.38, 4.6, 0.35, -0.25, 0.2, 0.44);
    sAdd(new THREE.BoxGeometry(0.18, 4.0, 1.25), KS.mats.bronze, -1.78, 4.25, -0.1, -0.3, -0.15, 0.26);

    m.add(st);
    return m;
  }

  // ============================================================
  // 5. GESAMTE WELT KOBLENZ AUFBAUEN
  // ============================================================
  KS.buildWorld = function (scene) {
    const grp = new THREE.Group();
    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      grp.add(mesh);
      return mesh;
    };

    // Rhein & Mosel
    add(new THREE.PlaneGeometry(260, 780), KS.mats.water, 145, 0, 0, -Math.PI / 2);
    add(new THREE.PlaneGeometry(360, 360), KS.mats.water, -140, 0.02, -160, -Math.PI / 2);

    // Schiffsbug-Landzunge Deutsches Eck + dunkle Basalt-Uferfassung
    const eckShape = new THREE.Shape();
    eckShape.moveTo(-120, 200);
    eckShape.lineTo(80, 200);
    eckShape.lineTo(76, 20);
    eckShape.lineTo(0, -72);
    eckShape.lineTo(-96, 25);
    eckShape.closePath();

    const eckGeo = new THREE.ExtrudeGeometry(eckShape, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.25 });
    eckGeo.rotateX(Math.PI / 2);
    add(eckGeo, KS.mats.paving, 0, 1.2, 0);

    // Große Deutschlandfahne direkt an der Bugspitze des Deutschen Ecks
    add(new THREE.CylinderGeometry(0.14, 0.2, 16, 10), KS.mats.white, 0, 9.2, -62);
    add(new THREE.BoxGeometry(0.12, 1.0, 4.5), new THREE.MeshStandardMaterial({ color: 0x111111 }), 0, 16.5, -59.7);
    add(new THREE.BoxGeometry(0.12, 1.0, 4.5), new THREE.MeshStandardMaterial({ color: 0xdd0000 }), 0, 15.5, -59.7);
    add(new THREE.BoxGeometry(0.12, 1.0, 4.5), new THREE.MeshStandardMaterial({ color: 0xffce00 }), 0, 14.5, -59.7);

    // Grünanlagen (Blumenhof / Kastorgarten & Rheinufer)
    add(new THREE.BoxGeometry(54, 0.18, 74), KS.mats.grass, -46, 1.22, 66);
    add(new THREE.BoxGeometry(38, 0.18, 70), KS.mats.grass, 38, 1.22, 108);

    // Kaiser-Wilhelm-Denkmal
    grp.add(buildMonument());

    // 16 Bundesländer-Flaggen entlang der Promenade
    const flagColors = [0x111111, 0xdd0000, 0xffce00, 0x0ea5e9, 0x16a34a, 0xf8fafc];
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI * 0.85 + (i / 15) * Math.PI * 0.7;
      const fx = Math.cos(a) * 36, fz = Math.sin(a) * 36 - 18;
      add(new THREE.CylinderGeometry(0.08, 0.11, 8.5, 8), KS.mats.iron, fx, 5.4, fz);
      add(new THREE.BoxGeometry(0.1, 1.4, 2.2), new THREE.MeshStandardMaterial({ color: flagColors[i % flagColors.length] }), fx, 8.6, fz + 1.1);
    }

    // Basilika St. Kastor (Tuffstein-Langhaus + 4 romanische Ecktürme mit Rautendächern)
    add(new THREE.BoxGeometry(16, 15, 34), KS.mats.tuff, -24, 8.7, 74);
    add(new THREE.ConeGeometry(12, 6.2, 4), KS.mats.slate, -24, 19.3, 74, 0, Math.PI / 4, 0);
    [[-30, 58], [-18, 58], [-30, 90], [-18, 90]].forEach(([tx, tz]) => {
      add(new THREE.BoxGeometry(4.4, 25, 4.4), KS.mats.tuff, tx, 13.7, tz);
      add(new THREE.ConeGeometry(3.4, 7.5, 4), KS.mats.slate, tx, 29.9, tz, 0, Math.PI / 4, 0);
    });

    // Deutschherrenhaus (Ludwig Museum) nahe Rheinpromenade
    add(new THREE.BoxGeometry(14, 12.5, 26), KS.mats.ochre, 22, 7.45, 50);
    add(new THREE.ConeGeometry(11, 5.2, 4), KS.mats.roof, 22, 16.3, 50, 0, Math.PI / 4, 0);

    // Koblenzer Altstadt-Häuserzeile
    const houseSpecs = [
      { x: -52, z: 108, w: 18, h: 14, d: 14, col: 0xa87e5e },
      { x: -28, z: 118, w: 15, h: 12, d: 12, col: 0xc2ac8c },
      { x: 0,   z: 122, w: 20, h: 15, d: 14, col: 0xb59c82 },
      { x: 26,  z: 126, w: 15, h: 12, d: 12, col: 0xc9aa84 },
      { x: -48, z: 132, w: 17, h: 13, d: 13, col: 0xba8f66 },
      { x: -16, z: 138, w: 18, h: 14, d: 13, col: 0xc7baaa }
    ];
    houseSpecs.forEach((hs) => {
      const wallMat = new THREE.MeshStandardMaterial({ color: hs.col, bumpMap: graniteTex.bump, bumpScale: 0.08, roughness: 0.88 });
      add(new THREE.BoxGeometry(hs.w, hs.h, hs.d), wallMat, hs.x, 1.2 + hs.h / 2, hs.z);
      add(new THREE.ConeGeometry(Math.max(hs.w, hs.d) * 0.78, 4.8, 4), KS.mats.roof, hs.x, 1.2 + hs.h + 2.4, hs.z, 0, Math.PI / 4, 0);
      add(new THREE.BoxGeometry(1.8, 2.8, 0.2), KS.mats.wood, hs.x, 2.6, hs.z - hs.d / 2 - 0.05);
      for (let wy = 4.2; wy < hs.h - 1; wy += 3.2) {
        for (let wx = -hs.w / 2 + 2.5; wx <= hs.w / 2 - 2.5; wx += 3.5) {
          add(new THREE.BoxGeometry(1.4, 1.8, 0.16), KS.mats.iron, hs.x + wx, 1.2 + wy, hs.z - hs.d / 2 - 0.05);
        }
      }
    });

    // Straßenlaternen, Parkbänke & mehrschichtige Bäume
    [[-16, 30], [16, 30], [-22, 52], [22, 52], [44, 48], [62, 48]].forEach(([lx, lz]) => {
      add(new THREE.CylinderGeometry(0.09, 0.14, 4.6, 8), KS.mats.iron, lx, 3.5, lz);
      add(new THREE.SphereGeometry(0.28, 8, 8), KS.mats.lampGlow, lx, 5.9, lz);
    });
    [[-18, 38], [18, 38], [32, 62]].forEach(([bx, bz]) => {
      add(new THREE.BoxGeometry(2.2, 0.12, 0.6), KS.mats.wood, bx, 1.7, bz);
      add(new THREE.BoxGeometry(2.2, 0.55, 0.1), KS.mats.wood, bx, 2.05, bz + 0.25);
    });
    [[-36, 40], [-44, 56], [-48, 76], [32, 36], [38, 56], [28, 82], [-8, 62]].forEach(([tx, tz]) => {
      add(new THREE.CylinderGeometry(0.3, 0.45, 3.8, 8), KS.mats.wood, tx, 3.1, tz);
      add(new THREE.DodecahedronGeometry(2.7, 1), KS.mats.grass, tx, 6.1, tz);
      add(new THREE.DodecahedronGeometry(2.0, 1), KS.mats.grass, tx + 0.8, 7.5, tz - 0.5);
    });

    // Ausflugsschiff auf dem Rhein
    add(new THREE.BoxGeometry(7.2, 2.2, 28), KS.mats.white, 132, 1.0, -25);
    add(new THREE.BoxGeometry(5.8, 2.4, 18), KS.mats.glass, 132, 3.2, -26);
    add(new THREE.BoxGeometry(6.0, 0.3, 18.5), KS.mats.iron, 132, 4.5, -26);

    // Ostufer & gestuftes Ehrenbreitstein-Schiefermassiv
    add(new THREE.BoxGeometry(85, 2.4, 340), KS.mats.grass, 225, 0, 0);
    add(new THREE.CylinderGeometry(72, 112, 118, 16), KS.mats.slate, 355, 59, -55);
    add(new THREE.CylinderGeometry(46, 80, 96, 14), KS.mats.slate, 325, 48, -115);
    add(new THREE.CylinderGeometry(48, 82, 88, 14), KS.mats.slate, 330, 44, 20);

    scene.add(grp);
  };
})();
