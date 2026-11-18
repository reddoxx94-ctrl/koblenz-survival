(function () {
  window.KS = window.KS || {};

  // ============================================================
  // 1. SICHERE PROZEDURALE TEXTUREN + RELIEF (BUMP MAPS)
  // ============================================================
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
        for (let i = 0; i < 450; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(35,30,25,0.12)' : 'rgba(220,210,195,0.08)';
          ctx.fillRect(Math.random() * 256, Math.random() * 256, 6, 4);
        }
      } else if (type === 'grass') {
        ctx.fillStyle = '#284d22';
        ctx.fillRect(0, 0, 256, 256);
        btx.fillStyle = '#808080';
        btx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1200; i++) {
          const gx = Math.random() * 256, gy = Math.random() * 256;
          ctx.fillStyle = Math.random() > 0.45 ? '#396930' : '#1e3c1a';
          ctx.fillRect(gx, gy, 3, 7);
          btx.fillStyle = Math.random() > 0.5 ? '#c0c0c0' : '#404040';
          btx.fillRect(gx, gy, 3, 7);
        }
      } else if (type === 'slate') {
        ctx.fillStyle = '#333b47';
        ctx.fillRect(0, 0, 256, 256);
        btx.fillStyle = '#606060';
        btx.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 8) {
          const v = 50 + Math.floor(Math.random() * 28);
          ctx.fillStyle = `rgb(${v},${v + 5},${v + 12})`;
          ctx.fillRect(0, y, 256, 6);
          btx.fillStyle = Math.random() > 0.5 ? '#b8b8b8' : '#383838';
          btx.fillRect(0, y, 256, 5);
        }
      } else if (type === 'water') {
        ctx.fillStyle = '#134259';
        ctx.fillRect(0, 0, 256, 256);
        btx.fillStyle = '#707070';
        btx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 160; i++) {
          const wx = Math.random() * 256, wy = Math.random() * 256;
          ctx.fillStyle = 'rgba(186,230,253,0.14)';
          ctx.fillRect(wx, wy, 36, 3);
          btx.fillStyle = '#d0d0d0';
          btx.fillRect(wx, wy, 36, 3);
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
  const grassTex = makeTexSet('grass', 8, 8);
  const slateTex = makeTexSet('slate', 6, 6);
  const waterTex = makeTexSet('water', 14, 24);

  // Alle Materialien für welt.js, seilbahn.js & festung.js
  KS.mats = {
    grass: new THREE.MeshStandardMaterial({ map: grassTex.map, bumpMap: grassTex.bump, bumpScale: 0.14, color: 0xffffff, roughness: 0.95 }),
    paving: new THREE.MeshStandardMaterial({ map: pavingTex.map, bumpMap: pavingTex.bump, bumpScale: 0.18, color: 0xb8c0cc, roughness: 0.88, metalness: 0.06 }),
    granite: new THREE.MeshStandardMaterial({ map: graniteTex.map, bumpMap: graniteTex.bump, bumpScale: 0.22, color: 0xffffff, roughness: 0.88 }),
    slate: new THREE.MeshStandardMaterial({ map: slateTex.map, bumpMap: slateTex.bump, bumpScale: 0.35, color: 0xffffff, roughness: 0.94 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x7b7870, roughness: 0.9 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x24362e, metalness: 0.72, roughness: 0.36 }),
    bronzePatina: new THREE.MeshStandardMaterial({ color: 0x3b594d, metalness: 0.55, roughness: 0.44 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 }),
    ochre: new THREE.MeshStandardMaterial({ color: 0xb68b5a, roughness: 0.88 }),
    tuff: new THREE.MeshStandardMaterial({ color: 0xbab1a2, roughness: 0.86 }),
    basalt: new THREE.MeshStandardMaterial({ color: 0x262f3d, roughness: 0.9 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x653b1c, roughness: 0.85 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x7a211e, roughness: 0.82 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x1a2230, metalness: 0.75, roughness: 0.38 }),
    darkPortal: new THREE.MeshStandardMaterial({ color: 0x0b0f14, roughness: 0.95 }),
    lampGlow: new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xf59e0b, emissiveIntensity: 0.6 }),
    white: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 }),
    glass: new THREE.MeshStandardMaterial
    
