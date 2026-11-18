(function () {
  window.KS = window.KS || {};

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ec5e0);
  const fogObj = new THREE.FogExp2(0x9ec5e0, 0.0015);
  scene.fog = fogObj;

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.3, 1200);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  document.body.appendChild(renderer.domElement);

  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x3f4739, 0.65);
  scene.add(hemiLight);

  const sun = new THREE.DirectionalLight(0xfff7e6, 1.25);
  sun.position.set(260, 190, 140);
  sun.castShadow = true;
  scene.add(sun);

  // --- HUD & UI ---
  const hud = document.createElement('div');
  hud.innerHTML = `
    <div style="position:fixed;top:14px;left:14px;background:rgba(15,23,42,0.88);color:#fff;padding:10px 16px;border-radius:12px;border:1px solid rgba(245,158,11,0.4);font-family:sans-serif;z-index:100;">
      <div style="font-weight:bold;color:#fbbf24;font-size:14px;">📍 <span id="loc-text">Koblenz Deutsches Eck</span></div>
      <div id="sub-text" style="font-size:12px;color:#cbd5e1;margin-top:3px;">[WASD] Laufen | [F] Schießen | [1/2] Crafting</div>
    </div>
    <div style="position:fixed;top:14px;right:14px;display:flex;gap:8px;z-index:100;font-family:sans-serif;">
      <button id="btn-cam" style="background:rgba(15,23,42,0.88);color:#fff;border:1px solid rgba(255,255,255,0.25);padding:9px 14px;border-radius:20px;cursor:pointer;font-size:13px;">🎥 Ego / 3rd</button>
      <button id="btn-seilbahn" style="background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;border:1px solid #38bdf8;padding:9px 15px;border-radius:20px;cursor:pointer;font-weight:bold;font-size:13px;">🚡 Seilbahn (E)</button>
    </div>
    <div style="position:fixed;top:50%;left:50%;width:6px;height:6px;background:rgba(255,255,255,0.75);border:1px solid rgba(0,0,0,0.6);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:90;"></div>
    <div style="position:fixed;bottom:20px;right:20px;background:rgba(15,23,42,0.9);color:#fff;padding:12px 18px;border-radius:10px;border:1px solid rgba(56,189,248,0.4);font-family:sans-serif;font-size:13px;z-index:100;pointer-events:none;">
      <div style="font-weight:bold; color:#38bdf8; margin-bottom:6px;">🎒 Survival-Status</div>
      <div>❤️ Gesundheit: <span id="hp-val">100</span>%</div>
      <div>💧 Wasserpegel: <span id="water-val">80</span>%</div>
      <div style="margin-top:6px; font-size:11px; color:#cbd5e1;">Filter: <span id="inv-filter">1</span> | Souvenirs: <span id="inv-souv">0</span></div>
    </div>
    <div style="position:fixed;top:180px;left:15px;background:rgba(15,23,42,0.88);color:#fff;padding:12px 18px;border-radius:8px;border:1px solid rgba(245,158,11,0.3);font-family:sans-serif;font-size:12px;z-index:100;">
      <div style="font-weight:bold;color:#fbbf24;margin-bottom:6px;">🛠️ Crafting-Menü</div>
      <div>[1] Filter bauen (Kostet: 2 Filter)</div>
      <div>[2] Medikit bauen (Kostet: 1 Souvenir)</div>
    </div>
  `;
  document.body.appendChild(hud);

  // --- SPIELER & PHYSIK ---
  const playerGroup = new THREE.Group();
  const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 1.35, 12), new THREE.MeshStandardMaterial({ color: 0x1e3a8a }));
  bodyMesh.position.y = 0.68;
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf1c27d }));
  headMesh.position.y = 1.55;
  playerGroup.add(bodyMesh, headMesh);
  scene.add(playerGroup);

  const player = { pos: new THREE.Vector3(0, 1.2, 26), velY: 0, walkSpeed: 14.0, sprintSpeed: 23.0, jumpForce: 11.5, onGround: true, firstPerson: false };
  const survivalData = { health: 100, water: 80, inventory: { waterFilter: 1, souvenirs: 0 } };

  const keys = { w: false, a: false, s: false, d: false, shift: false };
  let camYaw = Math.PI, camPitch = 0.12, isMouseDown = false;

  function triggerSeilbahn() {
    if (typeof KS.startSeilbahnRide === 'function') {
      const atBerg = KS.bergPos && player.pos.distanceTo(KS.bergPos) < 40;
      KS.startSeilbahnRide(!atBerg);
    }
  }
  function triggerJump() {
    if (player.onGround) { player.velY = player.jumpForce; player.onGround = false; }
  }

  // --- SCHUSS- & ZERSTÖRUNGSSYSTEM ---
  const bullets = [];
  const bulletGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const bulletMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706 });
  const debrisGroup = new THREE.Group();
  scene.add(debrisGroup);

  function shootProjectile() {
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);
    bullet.position.copy(player.pos);
    bullet.position.y += 1.4;

    const dir = new THREE.Vector3(
      Math.sin(camYaw) * Math.cos(camPitch),
      Math.sin(camPitch),
      Math.cos(camYaw) * Math.cos(camPitch)
    ).normalize();

    bullet.userData = { velocity: dir.multiplyScalar(45.0), life: 0 };
    scene.add(bullet);
    bullets.push(bullet);
  }

  function triggerDestruction(hitPos) {
    const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const mat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    for (let i = 0; i < 10; i++) {
      const piece = new THREE.Mesh(geo, mat);
      piece.position.copy(hitPos);
      piece.userData = {
        velocity: new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 12 + 4, (Math.random() - 0.5) * 15),
        life: 0
      };
      debrisGroup.add(piece);
    }
  }

  // --- LOOT ITEMS ---
  const lootItems = [
    { name: "Rhein-Wasserflasche", type: "water", pos: new THREE.Vector3(6, 1.2, -8), collected: false },
    { name: "Erste-Hilfe-Kit", type: "health", pos: new THREE.Vector3(-24, 1.2, 65), collected: false },
    { name: "Deutsches Eck Souvenir", type: "souvenir", pos: new THREE.Vector3(0, 1.2, -52), collected: false }
  ];
  const lootGroup = new THREE.Group();
  const itemGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  const itemMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, roughness: 0.2, metalness: 0.8 });
  const lootMeshes = lootItems.map(item => {
    const mesh = new THREE.Mesh(itemGeo, itemMat);
    mesh.position.copy(item.pos);
    lootGroup.add(mesh);
    return { item, mesh };
  });
  scene.add(lootGroup);

  // --- EVENT LISTENER ---
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w') keys.w = true;
    if (k === 's') keys.s = true;
    if (k === 'a') keys.a = true;
    if (k === 'd') keys.d = true;
    if (e.key === 'Shift') keys.shift = true;
    if (e.code === 'Space') triggerJump();
    if (k === 'e') triggerSeilbahn();
    if (k === 'f') shootProjectile();
    if (k === 'v') player.firstPerson = !player.firstPerson;
    if (k === 'q' && survivalData.inventory.waterFilter > 0) {
      survivalData.water = Math.min(100, survivalData.water + 35);
      survivalData.inventory.waterFilter--;
    }
    if (e.key === '1' && survivalData.inventory.waterFilter >= 2) {
      survivalData.inventory.waterFilter -= 2;
      survivalData.water = 100;
    }
    if (e.key === '2' && survivalData.inventory.souvenirs >= 1) {
      survivalData.inventory.souvenirs--;
      survivalData.health = Math.min(100, survivalData.health + 50);
    }
  });

  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w') keys.w = false;
    if (k === 's') keys.s = false;
    if (k === 'a') keys.a = false;
    if (k === 'd') keys.d = false;
    if (e.key === 'Shift') keys.shift = false;
  });

  renderer.domElement.addEventListener('click', () => { if (renderer.domElement.requestPointerLock) renderer.domElement.requestPointerLock(); });
  window.addEventListener('mousedown', (e) => { if (e.button === 0) shootProjectile(); isMouseDown = true; });
  window.addEventListener('mouseup', () => { isMouseDown = false; });
  window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement || isMouseDown) {
      camYaw -= e.movementX * 0.0026;
      camPitch = THREE.MathUtils.clamp(camPitch + e.movementY * 0.0026, -0.45, 1.15);
    }
  });

  document.getElementById('btn-seilbahn').addEventListener('click', triggerSeilbahn);
  document.getElementById('btn-cam').addEventListener('click', () => { player.firstPerson = !player.firstPerson; });

  // --- WELT INITIALISIEREN ---
  if (typeof KS.buildWorld === 'function') KS.buildWorld(scene);
  if (typeof KS.buildFestung === 'function') KS.buildFestung(scene);
  if (typeof KS.buildSeilbahn === 'function') KS.buildSeilbahn(scene);

  let lastTime = performance.now();
  const locEl = document.getElementById('loc-text');
  let dayCycleTime = 0;

  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    dayCycleTime += dt * 0.04;

    // Tag / Nacht Zyklus
    const sunAngle = dayCycleTime;
    const sunX = player.pos.x + Math.cos(sunAngle) * 350;
    const sunZ = player.pos.z + Math.sin(sunAngle) * 350;
    const sunY = Math.sin(sunAngle) * 300;
    sun.position.set(sunX, Math.max(sunY, -40), sunZ);
    const isNight = sunY < 10;
    sun.intensity = Math.max(0, sunY / 150);
    hemiLight.intensity = isNight ? 0.15 : 0.65;
    scene.background.set(isNight ? 0x050814 : 0x9ec5e0);
    fogObj.color.set(isNight ? 0x050814 : 0x9ec5e0);
    if (KS.lampMatRef) KS.lampMatRef.emissiveIntensity = isNight ? 3.5 : 0.2;

    const inGondola = KS.seilbahn && (KS.seilbahn.state === 'TO_BERG' || KS.seilbahn.state === 'TO_TAL');

    if (!inGondola) {
      const forward = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw));
      const right = new THREE.Vector3(-Math.cos(camYaw), 0, Math.sin(camYaw));
      const moveDir = new THREE.Vector3();

      if (keys.w) moveDir.add(forward);
      if (keys.s) moveDir.sub(forward);
      if (keys.d) moveDir.add(right);
      if (keys.a) moveDir.sub(right);

      if (moveDir.lengthSq() > 0.001) {
        moveDir.normalize();
        const speed = (keys.shift ? player.sprintSpeed : player.walkSpeed) * dt;
        player.pos.x += moveDir.x * speed;
        player.pos.z += moveDir.z * speed;
        playerGroup.rotation.y = Math.atan2(moveDir.x, moveDir.z);
      }

      const groundH = typeof KS.getTerrainHeight === 'function' ? KS.getTerrainHeight(player.pos.x, player.pos.z) : 1.2;
      player.velY -= 28.0 * dt;
      player.pos.y += player.velY * dt;
      if (player.pos.y <= groundH) { player.pos.y = groundH; player.velY = 0; player.onGround = true; }
    }

    if (typeof KS.updateSeilbahn === 'function') KS.updateSeilbahn(dt, player);

    // Projektile & Zerstörung updaten
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.position.addScaledVector(b.userData.velocity, dt);
      b.userData.life += dt;
      // Trefferprüfung am Schloss (x:60, z:140)
      if (Math.abs(b.position.x - 60) < 25 && Math.abs(b.position.z - 140) < 15) {
        triggerDestruction(b.position);
        scene.remove(b);
        bullets.splice(i, 1);
        continue;
      }
      if (b.userData.life > 3.0 || b.position.y < 0) {
        scene.remove(b);
        bullets.splice(i, 1);
      }
    }

    // Trümmerteile updaten
    for (let i = debrisGroup.children.length - 1; i >= 0; i--) {
      const p = debrisGroup.children[i];
      p.position.addScaledVector(p.userData.velocity, dt);
      p.userData.velocity.y -= 20.0 * dt;
      p.userData.life += dt;
      if (p.userData.life > 2.0) debrisGroup.remove(p);
    }

    // Loot einsammeln
    lootMeshes.forEach(entry => {
      if (!entry.item.collected) {
        entry.mesh.rotation.y += dt * 2.0;
        if (player.pos.distanceTo(entry.mesh.position) < 3.2) {
          entry.item.collected = true;
          entry.mesh.visible = false;
          if (entry.item.type === 'water') survivalData.inventory.waterFilter++;
          if (entry.item.type === 'health') survivalData.health = Math.min(100, survivalData.health + 30);
          if (entry.item.type === 'souvenir') survivalData.inventory.souvenirs++;
        }
      }
    });

    // Durst-Simulation
    survivalData.water = Math.max(0, survivalData.water - dt * 0.1);
    if (survivalData.water <= 0) survivalData.health = Math.max(0, survivalData.health - dt * 0.3);

    playerGroup.position.copy(player.pos);
    playerGroup.visible = !player.firstPerson && !inGondola;

    if (player.firstPerson || inGondola) {
      camera.position.set(player.pos.x, player.pos.y + 1.7, player.pos.z);
      camera.lookAt(player.pos.x + Math.sin(camYaw) * 20, player.pos.y + 1.7 - camPitch * 15, player.pos.z + Math.cos(camYaw) * 20);
    } else {
      const dist = 8.5;
      camera.position.lerp(new THREE.Vector3(player.pos.x - Math.sin(camYaw) * dist, Math.max(player.pos.y + 2.4 + camPitch * 5.5, player.pos.y + 0.8), player.pos.z - Math.cos(camYaw) * dist), 0.25);
      camera.lookAt(player.pos.x, player.pos.y + 1.5, player.pos.z);
    }

    if (locEl && typeof KS.getKoblenzLocation === 'function') {
      locEl.innerText = KS.getKoblenzLocation(player.pos.x, player.pos.z);
    }

    document.getElementById('hp-val').innerText = Math.round(survivalData.health);
    document.getElementById('water-val').innerText = Math.round(survivalData.water);
    document.getElementById('inv-filter').innerText = survivalData.inventory.waterFilter;
    document.getElementById('inv-souv').innerText = survivalData.inventory.souvenirs;

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
