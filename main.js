(function () {
  // 1) Szene, Kamera & Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1400);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  // Beleuchtung & Wetter-Modi
  const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 0.9);
  const sun = new THREE.DirectionalLight(0xfffbeb, 1.2);
  sun.position.set(120, 220, 80);
  scene.add(hemi, sun);

  const weathers = [
    { name: '☀️ Sonnig', sky: 0x7dd3fc, fog: 0xbae6fd, sun: 1.2, hemi: 0.9 },
    { name: '🌅 Abendrot', sky: 0xfb923c, fog: 0xfdba74, sun: 1.0, hemi: 0.6 },
    { name: '🌙 Nacht', sky: 0x0f172a, fog: 0x1e293b, sun: 0.25, hemi: 0.35 }
  ];
  let wIdx = 0;
  function applyWeather() {
    const w = weathers[wIdx];
    scene.background = new THREE.Color(w.sky);
    scene.fog = new THREE.FogExp2(w.fog, 0.0014);
    sun.intensity = w.sun;
    hemi.intensity = w.hemi;
    document.getElementById('btn-weather').textContent = w.name;
  }
  applyWeather();

  // Welt, Seilbahn & Festung aufbauen
  KS.buildWorld(scene);
  KS.buildSeilbahn(scene);
  KS.buildFestung(scene);

  // 2) Spieler-Zustand (Start am Deutschen Eck)
  const player = { x: 0, y: 1.2, z: 45, vy: 0, yaw: Math.PI, pitch: 0, onGround: true };
  const keys = {};
  const joy = { active: false, id: null, dx: 0, dy: 0 };
  const look = { active: false, id: null, lx: 0, ly: 0 };

  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add('hidden'), 2600);
  }

  // Buttons
  document.getElementById('btn-weather').onclick = () => {
    wIdx = (wIdx + 1) % weathers.length;
    applyWeather();
  };
  document.getElementById('btn-tp-tal').onclick = () => {
    KS.seilbahn.playerInside = false;
    player.x = 52; player.z = 67; player.y = 2.2; player.vy = 0; player.yaw = 0;
    toast('🚡 Schnellreise zur 3S-Talstation');
  };
  document.getElementById('btn-jump').ontouchstart = document.getElementById('btn-jump').onclick = (e) => {
    e.preventDefault();
    if (player.onGround && !KS.seilbahn.playerInside) { player.vy = 7.5; player.onGround = false; }
  };

  // Ein- & Aussteigen in die 3S-Seilbahn
  function toggleSeilbahn() {
    const s = KS.seilbahn;
    const doorsReady = s.doorOpen > 0.6;
    if (!s.playerInside) {
      if (!doorsReady) return toast('⏳ Warte, bis die Seilbahn anhält und die Türen öffnen!');
      s.playerInside = true;
      s.localPos.set(0, 0, 0.8);
      toast('🚡 Eingestiegen! Du kannst dich während der Fahrt frei in der Kabine bewegen.');
    } else {
      if (!doorsReady) return toast('🔒 Türen sind während der Fahrt verriegelt!');
      s.playerInside = false;
      player.x = s.cabin.position.x;
      player.y = s.cabin.position.y + 0.2;
      player.z = s.cabin.position.z + 3.2;
      toast('🚶 Ausgestiegen!');
    }
  }
  document.getElementById('btn-interact').onclick = toggleSeilbahn;

  // Desktop-Steuerung
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyE') toggleSeilbahn();
    if (e.code === 'Space' && player.onGround && !KS.seilbahn.playerInside) { player.vy = 7.5; player.onGround = false; }
  });
  window.addEventListener('keyup', (e) => (keys[e.code] = false));
  renderer.domElement.addEventListener('click', () => {
    if (renderer.domElement.requestPointerLock && !('ontouchstart' in window)) renderer.domElement.requestPointerLock();
  });
  window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement) {
      player.yaw -= e.movementX * 0.0025;
      player.pitch = THREE.MathUtils.clamp(player.pitch - e.movementY * 0.0025, -1.35, 1.35);
    }
  });

  // Mobile Touch-Joystick (links) & Kamera-Drehen (rechts)
  const joyZone = document.getElementById('joy-zone');
  const joyKnob = document.getElementById('joy-knob');

  joyZone.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    joy.active = true; joy.id = t.identifier;
  }, { passive: false });

  window.addEventListener('touchstart', (e) => {
    for (const t of e.changedTouches) {
      if (t.clientX > window.innerWidth * 0.35 && !look.active && e.target === renderer.domElement) {
        look.active = true; look.id = t.identifier; look.lx = t.clientX; look.ly = t.clientY;
      }
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) {
      if (joy.active && t.identifier === joy.id) {
        const r = joyZone.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = t.clientX - cx, dy = t.clientY - cy;
        const dist = Math.min(42, Math.hypot(dx, dy));
        const ang = Math.atan2(dy, dx);
        joy.dx = (Math.cos(ang) * dist) / 42;
        joy.dy = (Math.sin(ang) * dist) / 42;
        joyKnob.style.transform = `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px)`;
      } else if (look.active && t.identifier === look.id) {
        player.yaw -= (t.clientX - look.lx) * 0.006;
        player.pitch = THREE.MathUtils.clamp(player.pitch - (t.clientY - look.ly) * 0.006, -1.35, 1.35);
        look.lx = t.clientX; look.ly = t.clientY;
      }
    }
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    for (const t of e.changedTouches) {
      if (joy.active && t.identifier === joy.id) {
        joy.active = false; joy.dx = 0; joy.dy = 0; joyKnob.style.transform = 'translate(0,0)';
      }
      if (look.active && t.identifier === look.id) look.active = false;
    }
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 3) Haupt-Loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);

    KS.updateSeilbahn(dt);

    // Bewegungs-Input sammeln
    let fwd = (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) - (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0) - joy.dy;
    let strafe = (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0) + joy.dx;
    const len = Math.hypot(fwd, strafe);
    if (len > 1) { fwd /= len; strafe /= len; }

    const sinY = Math.sin(player.yaw), cosY = Math.cos(player.yaw);
    const mx = (-sinY * fwd + cosY * strafe) * dt;
    const mz = (-cosY * fwd - sinY * strafe) * dt;

    const s = KS.seilbahn;
    if (s.playerInside) {
      // Freie Bewegung im Innenraum der Kabine (sicher begrenzt)
      s.localPos.x = THREE.MathUtils.clamp(s.localPos.x + mx * 2.5, -1.6, 1.6);
      s.localPos.z = THREE.MathUtils.clamp(s.localPos.z + mz * 2.5, -1.0, 1.1);
      player.x = s.cabin.position.x + s.localPos.x;
      player.y = s.cabin.position.y + 0.45;
      player.z = s.cabin.position.z + s.localPos.z;
    } else {
      player.x += mx * 8.5;
      player.z += mz * 8.5;
      player.vy -= 20 * dt;
      player.y += player.vy * dt;

      const ground = KS.getTerrainHeight(player.x, player.z);
      if (player.y <= ground) {
        player.y = ground;
        player.vy = 0;
        player.onGround = true;
      }
    }

    // Kamera setzen
    camera.position.set(player.x, player.y + 1.7, player.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;

    // Interaktions-Button anzeigen
    const distCab = Math.hypot(player.x - s.cabin.position.x, player.z - s.cabin.position.z);
    const wrap = document.getElementById('interact-wrap');
    const btn = document.getElementById('btn-interact');
    if (s.playerInside && s.doorOpen > 0.6) {
      wrap.classList.remove('hidden');
      btn.textContent = '🚶 Aussteigen [E]';
    } else if (!s.playerInside && distCab < 6.5 && Math.abs(player.y - s.cabin.position.y) < 3.5) {
      wrap.classList.remove('hidden');
      btn.textContent = s.doorOpen > 0.6 ? '🚡 Einsteigen [E]' : '⏳ Türen geschlossen';
    } else {
      wrap.classList.add('hidden');
    }

    // Zonen-Anzeige
    const nhn = Math.round(65 + player.y);
    document.getElementById('zone-txt').textContent = s.playerInside
      ? `🚡 3S-Seilbahn Kabine 17 • ${nhn} m NHN`
      : player.x > 290
        ? `🏰 Festung Ehrenbreitstein • ${nhn} m NHN`
        : `📍 Deutsches Eck Koblenz • ${nhn} m NHN`;

    renderer.render(scene, camera);
  }
  animate();
})();
