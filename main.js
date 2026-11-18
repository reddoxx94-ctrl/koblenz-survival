(function () {
  window.KS = window.KS || {};

  // 1. Szene, Kamera & High-Performance Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ec5e0);
  scene.fog = new THREE.FogExp2(0x9ec5e0, 0.0015);

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

  // 2. Beleuchtung (Himmel-/Boden-Hemisphäre + gerichtete Sonne mit Schatten)
  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x3f4739, 0.65);
  scene.add(hemiLight);

  const sun = new THREE.DirectionalLight(0xfff7e6, 1.25);
  sun.position.set(260, 190, 140);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 800;
  const d = 190;
  sun.shadow.camera.left = -d;
  sun.shadow.camera.right = d;
  sun.shadow.camera.top = d;
  sun.shadow.camera.bottom = -d;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  // 3. Komplettes HUD (Standort, Seilbahn-Button, Fadenkreuz & Mobile-Joystick)
  const hud = document.createElement('div');
  hud.innerHTML = `
    <div style="position:fixed;top:14px;left:14px;background:rgba(15,23,42,0.88);color:#fff;padding:10px 16px;border-radius:12px;border:1px solid rgba(245,158,11,0.4);font-family:sans-serif;z-index:100;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
      <div style="font-weight:bold;color:#fbbf24;font-size:14px;">📍 <span id="loc-text">Koblenz Deutsches Eck</span></div>
      <div id="sub-text" style="font-size:12px;color:#cbd5e1;margin-top:3px;">Klick ins Bild für Maus-Steuerung (WASD + Space)</div>
    </div>
    <div style="position:fixed;top:14px;right:14px;display:flex;gap:8px;z-index:100;font-family:sans-serif;">
      <button id="btn-cam" style="background:rgba(15,23,42,0.88);color:#fff;border:1px solid rgba(255,255,255,0.25);padding:9px 14px;border-radius:20px;cursor:pointer;font-size:13px;">🎥 Ego / 3rd</button>
      <button id="btn-seilbahn" style="background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;border:1px solid #38bdf8;padding:9px 15px;border-radius:20px;cursor:pointer;font-weight:bold;font-size:13px;">🚡 Zur Seilbahn (E)</button>
    </div>
    <div style="position:fixed;top:50%;left:50%;width:6px;height:6px;background:rgba(255,255,255,0.75);border:1px solid rgba(0,0,0,0.6);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:90;"></div>
    <div id="joy-zone" style="position:fixed;bottom:24px;left:24px;width:110px;height:110px;background:rgba(15,23,42,0.55);border:2px solid rgba(251,191,36,0.35);border-radius:50%;z-index:100;touch-action:none;">
      <div id="joy-knob" style="position:absolute;top:33px;left:33px;width:44px;height:44px;background:#d97706;border-radius:50%;box-shadow:0 0 12px rgba(217,119,6,0.7);"></div>
    </div>
    <button id="btn-jump" style="position:fixed;bottom:34px;right:28px;width:64px;height:64px;border-radius:50%;background:rgba(15,23,42,0.75);border:2px solid rgba(251,191,36,0.45);color:#fff;font-size:22px;z-index:100;cursor:pointer;touch-action:none;">⬆️</button>
  `;
  document.body.appendChild(hud);

  // 4. Orts-Erkennung (Fallback, falls noch nicht in welt.js hinterlegt)
  if (typeof KS.getKoblenzLocation !== 'function') {
    KS.getKoblenzLocation = function (x, z) {
      if (x >= 195) return 'Festung Ehrenbreitstein (118m ü. Rhein)';
      if (Math.abs(x) <= 22 && z >= -15 && z <= 28) return 'Kaiser-Wilhelm-Denkmal (Deutsches Eck)';
      if (z < -25) return 'Moselmündung / Spitze Deutsches Eck';
      if (x <= -10 && z >= 48 && z <= 96) return 'Basilika St. Kastor & Blumenhof';
      if (x >= 35 && z >= 25 && z <= 70) return 'Seilbahn Talstation (Konrad-Adenauer-Ufer)';
      if (z >= 96) return 'Koblenzer Altstadt';
      return 'Deutsches Eck / Rheinanlagen';
    };
  }

  // 5. Spieler-Physik & sichtbarer 3rd-Person-Charakter
  const playerGroup = new THREE.Group();
  const bodyMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.38, 1.35, 12),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 })
  );
  bodyMesh.position.y = 0.68;
  bodyMesh.castShadow = true;
  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.6 })
  );
  headMesh.position.y = 1.55;
  headMesh.castShadow = true;
  playerGroup.add(bodyMesh, headMesh);
  scene.add(playerGroup);

  const player = {
    pos: new THREE.Vector3(0, 1.2, 26),
    velY: 0,
    walkSpeed: 14.0,
    sprintSpeed: 23.0,
    jumpForce: 11.5,
    onGround: true,
    firstPerson: false
  };

  // 6. Kollisionsprüfung (Denkmal-Kern, Gebäude & Flussufer von Rhein/Mosel)
  function isBlocked(nx, nz) {
    // Ostufer / Festung Ehrenbreitstein ist begehbar
    if (nx >= 205 && nx <= 435 && nz >= -125 && nz <= 35) return false;
    // Außerhalb der Landzunge Deutsches Eck -> Rhein oder Mosel!
    if (nz < -70 || nz > 195) return true;
    if (nz < 20 && nx > 75 + (nz - 20) * (75 / 92)) return true;   // Rheinufer-Kante
    if (nz < 25 && nx < -95 + (nz - 25) * (95 / 97)) return true;  // Moselufer-Kante
    if (nx > 78 || nx < -115) return true;

    // Massiver Sockelkern des Kaiser-Wilhelm-Denkmals (Treppen davor bleiben frei!)
    if (Math.abs(nx) < 7.6 && nz > -7.6 && nz < 6.8) return true;
    // Basilika St. Kastor & Deutschherrenhaus
    if (nx > -33 && nx < -15 && nz > 56 && nz < 92) return true;
    if (nx > 14 && nx < 30 && nz > 36 && nz < 64) return true;
    return false;
  }

  // 7. Steuerung: Tastatur, Pointer-Lock-Maus & Touch-Joystick
  const keys = { w: false, a: false, s: false, d: false, shift: false };
  let joyVec = { x: 0, y: 0 };
  let camYaw = Math.PI; // Blick beim Start direkt auf das Kaiser-Wilhelm-Denkmal
  let camPitch = 0.12;
  let isMouseDown = false;

  function triggerSeilbahn() {
    if (typeof KS.startSeilbahnRide === 'function') {
      const atBerg = KS.bergPos && player.pos.distanceTo(KS.bergPos) < 40;
      KS.startSeilbahnRide(!atBerg);
    }
  }

  function triggerJump() {
    if (player.onGround) {
      player.velY = player.jumpForce;
      player.onGround = false;
    }
  }

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') keys.w = true;
    if (k === 's' || e.key === 'ArrowDown') keys.s = true;
    if (k === 'a' || e.key === 'ArrowLeft') keys.a = true;
    if (k === 'd' || e.key === 'ArrowRight') keys.d = true;
    if (e.key === 'Shift') keys.shift = true;
    if (e.code === 'Space') triggerJump();
    if (k === 'e') triggerSeilbahn();
    if (k === 'v') player.firstPerson = !player.firstPerson;
  });

  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') keys.w = false;
    if (k === 's' || e.key === 'ArrowDown') keys.s = false;
    if (k === 'a' || e.key === 'ArrowLeft') keys.a = false;
    if (k === 'd' || e.key === 'ArrowRight') keys.d = false;
    if (e.key === 'Shift') keys.shift = false;
  });

  // PC Pointer Lock + Drag-Fallback
  renderer.domElement.addEventListener('click', () => {
    if (renderer.domElement.requestPointerLock) {
      renderer.domElement.requestPointerLock();
    }
  });
  window.addEventListener('mousedown', () => { isMouseDown = true; });
  window.addEventListener('mouseup', () => { isMouseDown = false; });
  window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement || isMouseDown) {
      camYaw -= e.movementX * 0.0026;
      camPitch = THREE.MathUtils.clamp(camPitch + e.movementY * 0.0026, -0.45, 1.15);
    }
  });

  // Buttons oben rechts & Sprung-Button
  document.getElementById('btn-seilbahn').addEventListener('click', triggerSeilbahn);
  document.getElementById('btn-cam').addEventListener('click', () => {
    player.firstPerson = !player.firstPerson;
  });
  document.getElementById('btn-jump').addEventListener('pointerdown', triggerJump);

  // Virtueller Joystick unten links (für Smartphone & Tablet)
  const joyZone = document.getElementById('joy-zone');
  const joyKnob = document.getElementById('joy-knob');
  let joyActive = false;

  function updateJoystick(clientX, clientY) {
    const rect = joyZone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const maxR = 36;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    joyVec.x = dx / maxR;
    joyVec.y = dy / maxR;
  }

  joyZone.addEventListener('pointerdown', (e) => {
    joyActive = true;
    joyZone.setPointerCapture(e.pointerId);
    updateJoystick(e.clientX, e.clientY);
  });
  joyZone.addEventListener('pointermove', (e) => {
    if (joyActive) updateJoystick(e.clientX, e.clientY);
  });
  joyZone.addEventListener('pointerup', () => {
    joyActive = false;
    joyKnob.style.transform = 'translate(0px, 0px)';
    joyVec.x = 0;
    joyVec.y = 0;
  });

  // 8. Welt, Festung & Seilbahn initialisieren
  if (typeof KS.buildWorld === 'function') KS.buildWorld(scene);
  if (typeof KS.buildFestung === 'function') KS.buildFestung(scene);
  if (typeof KS.buildSeilbahn === 'function') KS.buildSeilbahn(scene);

  // 9. Game-Loop mit Delta-Time-Physik
  let lastTime = performance.now();
  const locEl = document.getElementById('loc-text');
  const subEl = document.getElementById('sub-text');

  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    const inGondola = KS.seilbahn && (KS.seilbahn.state === 'TO_BERG' || KS.seilbahn.state === 'TO_TAL');

    if (!inGondola) {
      // Bewegungsvektor aus WASD + Joystick kombinieren
      const forward = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw));
      const right = new THREE.Vector3(-Math.cos(camYaw), 0, Math.sin(camYaw));
      const moveDir = new THREE.Vector3();

      if (keys.w) moveDir.add(forward);
      if (keys.s) moveDir.sub(forward);
      if (keys.d) moveDir.add(right);
      if (keys.a) moveDir.sub(right);

      if (Math.abs(joyVec.x) > 0.05 || Math.abs(joyVec.y) > 0.05) {
        moveDir.addScaledVector(forward, -joyVec.y);
        moveDir.addScaledVector(right, joyVec.x);
      }

      if (moveDir.lengthSq() > 0.001) {
        moveDir.normalize();
        const speed = (keys.shift ? player.sprintSpeed : player.walkSpeed) * dt;
        const nextX = player.pos.x + moveDir.x * speed;
        const nextZ = player.pos.z + moveDir.z * speed;

        // Gleitende Kollision getrennt für X und Z (damit man an Mauern entlanggleitet)
        if (!isBlocked(nextX, player.pos.z)) player.pos.x = nextX;
        if (!isBlocked(player.pos.x, nextZ)) player.pos.z = nextZ;

        playerGroup.rotation.y = Math.atan2(moveDir.x, moveDir.z);
      }

      // Schwerkraft & Stufen-Physik
      const groundH = typeof KS.getTerrainHeight === 'function' ? KS.getTerrainHeight(player.pos.x, player.pos.z) : 1.2;
      player.velY -= 28.0 * dt;
      player.pos.y += player.velY * dt;

      if (player.pos.y <= groundH) {
        player.pos.y = groundH;
        player.velY = 0;
        player.onGround = true;
      }
    }

    // Seilbahn-Bewegung aktualisieren
    if (typeof KS.updateSeilbahn === 'function') {
      KS.updateSeilbahn(dt, player, camYaw);
    }

    // Charakter-Modell positionieren
    playerGroup.position.copy(player.pos);
    playerGroup.visible = !player.firstPerson && !inGondola;

    // Kamera (Ego-Perspektive oder 3rd-Person-Verfolgerkamera)
    if (player.firstPerson || inGondola) {
      camera.position.set(player.pos.x, player.pos.y + 1.7, player.pos.z);
      camera.lookAt(
        player.pos.x + Math.sin(camYaw) * 20,
        player.pos.y + 1.7 - camPitch * 15,
        player.pos.z + Math.cos(camYaw) * 20
      );
    } else {
      const dist = 8.5;
      const camX = player.pos.x - Math.sin(camYaw) * dist;
      const camZ = player.pos.z - Math.cos(camYaw) * dist;
      const camY = Math.max(player.pos.y + 2.4 + camPitch * 5.5, player.pos.y + 0.8);
      camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.25);
      camera.lookAt(player.pos.x, player.pos.y + 1.5, player.pos.z);
    }

    // Sonne wandert für scharfe Schatten mit dem Spieler mit
    sun.position.set(player.pos.x + 120, player.pos.y + 160, player.pos.z + 90);
    sun.target.position.copy(player.pos);
    sun.target.updateMatrixWorld();

    // HUD aktualisieren
    if (locEl) locEl.innerText = KS.getKoblenzLocation(player.pos.x, player.pos.z);
    if (subEl) {
      if (inGondola) {
        subEl.innerText = '🚡 Seilbahnfahrt über den Rhein läuft...';
      } else if (KS.talPos && player.pos.distanceTo(KS.talPos) < 22) {
        subEl.innerText = 'Drücke [E] oder klicke oben rechts für Seilbahn zur Festung';
      } else if (KS.bergPos && player.pos.distanceTo(KS.bergPos) < 28) {
        subEl.innerText = 'Drücke [E] oder klicke oben rechts für Talfahrt zum Deutschen Eck';
      } else {
        subEl.innerText = `Höhe: ${player.pos.y.toFixed(1)}m | [WASD] Laufen | [Shift] Sprint | [Space] Sprung | [V] Kamera`;
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
