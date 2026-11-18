(function () {
  // 1. Szene, Kamera & Renderer mit High-End Grafik-Features
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa2c4dc);
  scene.fog = new THREE.FogExp2(0xa2c4dc, 0.0016);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 1200);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  document.body.appendChild(renderer.domElement);

  // 2. Dynamisches Licht & Sonnenschein
  const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.6);
  scene.add(ambientLight);

  const sun = new THREE.DirectionalLight(0xfffaed, 1.3);
  sun.position.set(280, 200, 160);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 800;
  const d = 200;
  sun.shadow.camera.left = -d;
  sun.shadow.camera.right = d;
  sun.shadow.camera.top = d;
  sun.shadow.camera.bottom = -d;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  // 3. Atmosphärische Staub- / Pollen-Partikel im Wind
  const particleCount = 400;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 400;
    particlePositions[i + 1] = Math.random() * 50 + 2;
    particlePositions[i + 2] = (Math.random() - 0.5) * 400;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    transparent: true,
    opacity: 0.45
  });
  const dustParticles = new THREE.Points(particleGeo, particleMat);
  scene.add(dustParticles);

  // 4. Modernes HUD für Live-Ortsanzeige
  const uiBox = document.createElement('div');
  uiBox.style.cssText = 'position:fixed; top:15px; left:15px; background:rgba(8,12,20,0.88); color:#fff; padding:14px 20px; font-family:sans-serif; font-size:14px; border-radius:8px; border:1px solid rgba(255,255,255,0.25); box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index:100; pointer-events:none;';
  uiBox.innerHTML = '<b>Koblenz Survival</b><br><span style="font-size:11px; color:#94a3b8;">Standort:</span> <span id="loc-text" style="color:#f59e0b; font-weight:bold;">Deutsches Eck</span>';
  document.body.appendChild(uiBox);

  // 5. Spieler & Steuerung
  const player = {
    pos: new THREE.Vector3(0, 1.2, 18),
    velY: 0,
    speed: 0.7
  };

  const keys = { w: false, a: false, s: false, d: false };
  let camYaw = 0;
  let camPitch = 0.22;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') keys.w = true;
    if (e.key === 's' || e.key === 'S') keys.s = true;
    if (e.key === 'a' || e.key === 'A') keys.a = true;
    if (e.key === 'd' || e.key === 'D') keys.d = true;
    if (e.key === 'e' || e.key === 'E') {
      if (typeof KS.startSeilbahnRide === 'function') {
        const atBerg = player.pos.distanceTo(KS.bergPos) < 20;
        KS.startSeilbahnRide(!atBerg);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W') keys.w = false;
    if (e.key === 's' || e.key === 'S') keys.s = false;
    if (e.key === 'a' || e.key === 'A') keys.a = false;
    if (e.key === 'd' || e.key === 'D') keys.d = false;
  });

  let isMouseDown = false;
  window.addEventListener('mousedown', () => { isMouseDown = true; });
  window.addEventListener('mouseup', () => { isMouseDown = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    camYaw -= e.movementX * 0.003;
    camPitch = THREE.MathUtils.clamp(camPitch - e.movementY * 0.003, -0.2, 1.2);
  });

  // Mobile Touch Support
  let lastTouchX = 0, lastTouchY = 0;
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  });
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      camYaw -= dx * 0.004;
      camPitch = THREE.MathUtils.clamp(camPitch - dy * 0.004, -0.2, 1.2);
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  });

  // 6. Welt laden
  if (typeof KS.buildWorld === 'function') KS.buildWorld(scene);
  if (typeof KS.buildFestung === 'function') KS.buildFestung(scene);
  if (typeof KS.buildSeilbahn === 'function') KS.buildSeilbahn(scene);

  // 7. Animationsschleife mit Echtzeit-Effekten
  let lastTime = performance.now();
  let clock = new THREE.Clock();

  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const elapsedTime = clock.getElapsedTime();

    // Spielerbewegung
    const moveDir = new THREE.Vector3();
    const forward = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw));
    const side = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));

    if (keys.w) moveDir.add(forward);
    if (keys.s) moveDir.sub(forward);
    if (keys.d) moveDir.add(side);
    if (keys.a) moveDir.sub(side);
    moveDir.normalize();

    player.pos.addScaledVector(moveDir, player.speed);

    // Seilbahn & Wind-Animation auf Partikel
    if (typeof KS.updateSeilbahn === 'function') {
      KS.updateSeilbahn(dt, player, camYaw);
    }

    const positions = dustParticles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.sin(elapsedTime + i) * 0.04; // Winddrift X
      positions[i + 2] += Math.cos(elapsedTime * 0.7 + i) * 0.04; // Winddrift Z
    }
    dustParticles.geometry.attributes.position.needsUpdate = true;

    // Terrain-Höhe
    const groundH = typeof KS.getTerrainHeight === 'function' ? KS.getTerrainHeight(player.pos.x, player.pos.z) : 1.2;
    if (KS.seilbahn && (KS.seilbahn.state === 'TAL' || KS.seilbahn.state === 'BERG')) {
      player.pos.y = THREE.MathUtils.lerp(player.pos.y, groundH + 1.7, 0.1);
    }

    // Kamera-Nachführung
    const camTargetX = player.pos.x - Math.sin(camYaw) * 11;
    const camTargetZ = player.pos.z - Math.cos(camYaw) * 11;
    const camTargetY = player.pos.y + 3.8 + camPitch * 5;
    camera.position.set(camTargetX, camTargetY, camTargetZ);
    camera.lookAt(player.pos.x, player.pos.y + 1.2, player.pos.z);

    // Live-Ortsanzeige
    if (typeof KS.getKoblenzLocation === 'function') {
      const locEl = document.getElementById('loc-text');
      if (locEl) {
        locEl.innerText = KS.getKoblenzLocation(player.pos.x, player.pos.z);
      }
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
