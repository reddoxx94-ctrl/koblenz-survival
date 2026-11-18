window.KS = window.KS || {};

// ============================================================
// 1. REALISTISCHE PROZEDURALE TEXTUREN + RELIEF (BUMP MAPS)
// ============================================================
KS.createTextureSet = function (type) {
  const c = document.createElement('canvas');
  const b = document.createElement('canvas');
  c.width = b.width = 256;
  c.height = b.height = 256;
  const ctx = c.getContext('2d');
  const btx = b.getContext('2d');

  if (type === 'paving') {
    // Dunkles Granit-Kopfsteinpflaster wie am Deutschen Eck
    ctx.fillStyle = '#333a44';
    ctx.fillRect(0, 0, 256, 256);
    btx.fillStyle = '#202020';
    btx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 16) {
      const off = (y / 16) % 2 === 0 ? 0 : 8;
      for (let x = 0; x < 256; x += 16) {
        const v = 68 + Math.floor(Math.random() * 34);
        ctx.fillStyle = `rgb(${v},${v + 3},${v + 7})`;
        ctx.fillRect((x + off) % 256 + 1, y + 1, 14, 14);
        const bv = 160 + Math.floor(Math.random() * 65);
        btx.fillStyle = `rgb(${bv},${bv},${bv})`;
        btx.fillRect((x + off) % 256 + 1, y + 1, 14, 14);
      }
    }
  } else if (type === 'granite') {
    // Verwitterte Sandstein-/Granitquader für das Denkmal
    ctx.fillStyle = '#635c52';
    ctx.fillRect(0, 0, 256, 256);
    btx.fillStyle = '#303030';
    btx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      const off = (y / 32) % 2 === 0 ? 0 : 32;
      for (let x = 0; x < 256; x += 64) {
        const v = 128 + Math.floor(Math.random() * 28);
        ctx.fillStyle = `rgb(${v + 8},${v + 2},${v - 8})`;
        ctx.fillRect((x + off) % 256 + 2, y + 2, 60, 28);
        btx.fillStyle = '#d8d8d8';
        btx.fillRect((x + off) % 256 + 2, y + 2, 60, 28);
      }
    }
    // Feine Verwitterung
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(40,35,30,0.12)' : 'rgba(220,210,195,0.08)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 6, 4);
    }
  } else if (type === 'grass') {
    ctx.fillStyle = '#2b5325';
    ctx.fillRect(0, 0, 256, 256);
    btx.fillStyle = '#808080';
    btx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) {
      const gx = Math.random() * 256, gy = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.45 ? '#3a6b31' : '#1f3f1b';
      ctx.fillRect(gx, gy, 3, 7);
      btx.fillStyle = Math.random() > 0.5 ? '#c0c0c0' : '#404040';
      btx.fillRect(gx, gy, 3, 7);
    }
  } else if (type === 'water') {
    ctx.fillStyle = '#14445c';
    ctx.fillRect(0, 0, 256, 256);
    btx.fillStyle = '#707070';
    btx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 180; i++) {
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
  return { map, bump };
};

const pavingSet = KS.createTextureSet('paving');
pavingSet.map.repeat.set(0.16, 0.16);
pavingSet.bump.repeat.set(0.16, 0.16);

const graniteSet = KS.createTextureSet('granite');
graniteSet.map.repeat.set(2, 2);
graniteSet.bump.repeat.set(2, 2);

const grassSet = KS.createTextureSet('grass');
grassSet.map.repeat.set(8, 8);
grassSet.bump.repeat.set(8, 8);

const waterSet = KS.createTextureSet('water');
waterSet.map.repeat.set(14, 24);
waterSet.bump.repeat.set(14, 24);

KS.mats = {
  grass: new THREE.MeshStandardMaterial({ map: grassSet.map, bumpMap: grassSet.bump, bumpScale: 0.15, roughness: 0.95 }),
  paving: new THREE.MeshStandardMaterial({ map: pavingSet.map, bumpMap: pavingSet.bump, bumpScale: 0.18, roughness: 0.85, metalness: 0.08 }),
  granite: new THREE.MeshStandardMaterial({ map: graniteSet.map, bumpMap: graniteSet.bump, bumpScale: 0.22, roughness: 0.88 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x7b7870, roughness: 0.9 }),
  bronze: new THREE.MeshStandardMaterial({ color: 0x263830, metalness: 0.72, roughness: 0.36 }),
  bronzePatina: new THREE.MeshStandardMaterial({ color: 0x3b594d, metalness: 0.55, roughness: 0.45 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 }),
  slate: new THREE.MeshStandardMaterial({ color: 0x3b4452, roughness: 0.95 }),
  ochre: new THREE.MeshStandardMaterial({ color: 0xb68b5a, roughness: 0.88 }),
  tuff: new THREE.MeshStandardMaterial({ color: 0xbab1a2, roughness: 0.86 }),
  basalt: new THREE.MeshStandardMaterial({ color: 0x283240, roughness: 0.9 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x653b1c, roughness: 0.85 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x7a211e, roughness: 0.82 }),
  iron: new THREE.MeshStandardMaterial({ color: 0x1a2230, metalness: 0.75, roughness: 0.
    
                                                         
