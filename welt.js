(function () {
  window.KS = window.KS || {};

  function makeTexSet(type, repX, repY) {
    try {
      const c = document.createElement('canvas');
      const b = document.createElement('canvas');
      c.width = b.width = 256;
      c.height = b.height = 256;
      const ctx = c.getContext('2d');
      const btx = b.getContext('2d');

      if (type === 'paving') {
        ctx.fillStyle = '#2d343e';
        ctx.fillRect(0, 0, 256, 256);
        btx.fillStyle = '#1a1a1a';
        btx.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 16) {
          const off = (y / 16) % 2 === 0 ? 0 : 8;
          for (let x = 0; x < 256; x += 16) {
            const v = 64 + Math.floor(Math.random() * 32);
            ctx.fillStyle = `rgb(${v},${v + 3},${v + 7})`;
            ctx.fillRect((x + off) % 256 + 1, y + 1, 14, 14);
            const bv = 155 + Math.floor(Math.random() * 70);
            btx.fillStyle = `rgb(${bv},${bv},${bv})`;
            btx.fillRect((x + off) % 256 + 1, y + 1, 14, 14);
          }
        }
      } else if (type === 'granite') {
        ctx.fillStyle = '#5c554b';
        ctx.fillRect(0, 0, 256, 256);
        btx.fillStyle = '#2b2b2b';
        btx.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 32) {
          const off = (y / 32) % 2 === 0 ? 0 : 32;
          for (let x = 0; x < 256; x += 64) {
            const v = 122 + Math.floor(Math.random() * 28);
            ctx.fillStyle = `rgb(${v + 8},${v + 2},${v - 7})`;
            ctx.fillRect((x + off) % 256 + 2, y + 2, 60, 28);
            btx.fillStyle = '#d4d4d4';
            btx.fillRect((x + off) % 256 + 2, y + 2, 60, 28);
          }
        }
      }
      const map = new THREE.CanvasTexture(c);
      const bump = new THREE.CanvasTexture(b);
      map.wrapS = map.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
      map.repeat.set(repX, repY);
      bump.repeat.set(repX, repY);
      return { map, bump };
    } catch (e) {
      return { map: null, bump: null };
    }
  }

  const pavingTex = makeTexSet('paving', 0.14, 0.14);
  const graniteTex = makeTexSet('granite', 2, 2);

  KS.mats = {
    granite: new THREE.MeshStandardMaterial({ map: graniteTex.map, bumpMap: graniteTex.bump, bumpScale: 0.22, color: 0xffffff, roughness: 0.88 }),
    paving: new THREE.MeshStandardMaterial({ map: pavingTex.map, bumpMap: pavingTex.bump, bumpScale: 0.18, color: 0xb8c0cc, roughness: 0.88 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x7b7870, roughness: 0.9 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x24362e, metalness: 0.72, roughness: 0.36 }),
    white: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  };

  KS.getTerrainHeight = function (x, z) { return 1.2; };

  KS.buildWorld = function (scene) {
    const grp = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.BoxGeometry(100, 1, 100), KS.mats.paving);
    grp.add(floor);
    scene.add(grp);
  };
})();

(function () {
  window.KS = window.KS || {};

  function makeTexSet(type, repX, repY) {
    try {
      const c = document.createElement('canvas');
      const b = document.createElement('canvas');
      c.width = b.width = 256;
      c.height = b.height = 256;
      const ctx = c.getContext('2d');
      const btx = b.getContext('2d');

      if (type === 'paving') {
        ctx.fillStyle = '#2d343e';
        ctx.fillRect(0, 0, 256, 256);
        btx.fillStyle = '#1a1a1a';
        btx.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 16) {
          const off = (y / 16) % 2 === 0 ? 0 : 8;
          for (let x = 0; x < 256; x += 16) {
            const v = 64 + Math.floor(Math.random() * 32);
            ctx.fillStyle = `rgb(${v},${v + 3},${v + 7})`;
            ctx.fillRect((x + off) % 256 + 1, y + 1, 14, 14);
            const bv = 155 + Math.floor(Math.random() * 70);
            btx.fillStyle = `rgb(${bv},${bv},${bv})`;
            btx.fillRect((x + off) % 256 + 1, y + 1, 14, 14);
          }
        }
      } else if (type === 'granite') {
        ctx.fillStyle = '#5c554b';
        ctx.fillRect(0, 0, 256, 256);
        btx.fillStyle = '#2b2b2b';
        btx.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 32) {
          const off = (y / 32) % 2 === 0 ? 0 : 32;
          for (let x = 0; x < 256; x += 64) {
            const v = 122 + Math.floor(Math.random() * 28);
            ctx.fillStyle = `rgb(${v + 8},${v + 2},${v - 7})`;
            ctx.fillRect((x + off) % 256 + 2, y + 2, 60, 28);
            btx.fillStyle = '#d4d4d4';
            btx.fillRect((x + off) % 256 + 2, y + 2, 60, 28);
          }
        }
      }
      const map = new THREE.CanvasTexture(c);
      const bump = new THREE.CanvasTexture(b);
      map.wrapS = map.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
      map.repeat.set(repX, repY);
      bump.repeat.set(repX, repY);
      return { map, bump };
    } catch (e) {
      return { map: null, bump: null };
    }
  }

  const pavingTex = makeTexSet('paving', 0.14, 0.14);
  const graniteTex = makeTexSet('granite', 2, 2);

  KS.mats = {
    granite: new THREE.MeshStandardMaterial({ map: graniteTex.map, bumpMap: graniteTex.bump, bumpScale: 0.22, color: 0xffffff, roughness: 0.88 }),
    paving: new THREE.MeshStandardMaterial({ map: pavingTex.map, bumpMap: pavingTex.bump, bumpScale: 0.18, color: 0xb8c0cc, roughness: 0.88 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x7b7870, roughness: 0.9 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x24362e, metalness: 0.72, roughness: 0.36 }),
    bronzePatina: new THREE.MeshStandardMaterial({ color: 0x3b594d, metalness: 0.55, roughness: 0.44 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 }),
    darkPortal: new THREE.MeshStandardMaterial({ color: 0x0b0f14, roughness: 0.95 }),
    white: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  };

  KS.getTerrainHeight = function (x, z) {
    if (Math.abs(x) <= 16 && z >= -10 && z <= 25) {
      if (Math.abs(x) <= 8.5 && z >= -8 && z <= 8.5) return 6.4;
      if (z > 8.5 && z <= 24) {
        const t = THREE.MathUtils.clamp((24 - z) / 15.5, 0, 1);
        return 1.2 + t * 5.2;
      }
    }
    return 1.2;
  };

  function buildMonument() {
    const m = new THREE.Group();
    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      m.add(mesh);
    };

    // Sockelbau
    add(new THREE.BoxGeometry(16.8, 1.2, 16.8), KS.mats.granite, 0, 6.2, 0);
    add(new THREE.BoxGeometry(15.2, 6.8, 15.2), KS.mats.granite, 0, 10.2, 0);
    
    // Portale
    [-3.2, 0, 3.2].forEach((px) => {
      add(new THREE.BoxGeometry(1.9, 4.6, 0.6), KS.mats.darkPortal, px, 9.5, 7.45);
    });

    // Reiterstatue (Kaiser Wilhelm & Pferd)
    const st = new THREE.Group();
    st.position.set(0, 20.6, 0);
    const sAdd = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      st.add(mesh);
    };

    sAdd(new THREE.BoxGeometry(4.4, 0.45, 5.2), KS.mats.bronze, 0, 0.22, 0);
    sAdd(new THREE.CylinderGeometry(1.15, 1.25, 4.1, 12), KS.mats.bronze, 0.25, 3.2, 0.1, Math.PI / 2);
    sAdd(new THREE.CylinderGeometry(0.75, 1.35, 2.2, 10), KS.mats.bronzePatina, 0.25, 5.1, -0.1);
    sAdd(new THREE.SphereGeometry(0.45, 10, 10), KS.mats.bronzePatina, 0.25, 7.45, 0.1);

    m.add(st);
    return m;
  }

  KS.buildWorld = function (scene) {
    const grp = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.BoxGeometry(120, 1, 120), KS.mats.paving);
    floor.position.y = 0.5;
    grp.add(floor);
    grp.add(buildMonument());
    scene.add(grp);
  };
})();

