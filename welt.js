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
            ctx.fillStyle = `rgb(${v},${v + 3},${v + 7})`; ctx.fillRect((x + off) \% 256 + 1, y + 1, 14, 14); const bv = 155 + Math.floor(Math.random() * 70); btx.fillStyle = `rgb(${bv},${bv},${bv})`;
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
            ctx.fillStyle = `rgb
