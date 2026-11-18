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
  wood: new THREE.MeshStandardMaterial({ color: 0x653b1c, roughness: 0.8
                                        
