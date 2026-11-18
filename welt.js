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

  KS.getTerrainHeight = function (x, z) { return 1.2; };

    KS.buildWorld = function (scene) {
    const grp = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.BoxGeometry(120, 1, 120), KS.mats.paving);
    floor.position.y = 0.5;
    grp.add(floor);

    const park = new THREE.Mesh(new THREE.BoxGeometry(40, 0.1, 40), new THREE.MeshStandardMaterial({ color: 0x284d22 }));
    park.position.set(-30, 1.1, 40);
    grp.add(park);

    scene.add(grp);
  };
})();

