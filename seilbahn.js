window.KS = window.KS || {};

KS.seilbahn = {
  tal: new THREE.Vector3(52, 2.2, 62),
  berg: new THREE.Vector3(312, 119.5, -12),
  t: 0,                  // 0 = Talstation, 1 = Bergstation
  state: 'WAIT_TAL',     // WAIT_TAL -> CLOSE -> UP -> OPEN -> WAIT_BERG -> CLOSE -> DOWN -> OPEN
  nextDir: 'UP',
  timer: 0,
  waitTime: 7.0,         // Hält 7 Sekunden in jeder Station
  doorOpen: 1.0,         // 1 = ganz offen, 0 = zu
  playerInside: false,
  localPos: new THREE.Vector3(0, 0, 0),
  cabin: null,
  doorL: null,
  doorR: null
};

KS.getCablePoint = function (t) {
  const s = KS.seilbahn;
  const p = new THREE.Vector3().lerpVectors(s.tal, s.berg, t);
  // Realistischer Seildurchhang über dem Rhein
  p.y -= Math.sin(t * Math.PI) * 14.0;
  return p;
};

KS.buildSeilbahn = function (scene) {
  const s = KS.seilbahn;
  const grp = new THREE.Group();

  // 1) Tal- & Bergstation
  [s.tal, s.berg].forEach((pos) => {
    const plat = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 16), KS.mats.stone);
    plat.position.set(pos.x, pos.y - 0.6, pos.z);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 16), KS.mats.iron);
    roof.position.set(pos.x, pos.y + 6.5, pos.z);
    grp.add(plat, roof);
  });

  // 2) Echtes 3S-Seilsystem (2 Tragseile + 1 Zugseil)
  const makeCable = (yOff, zOff, col) => {
    const pts = [];
    for (let i = 0; i <= 32; i++) {
      const p = KS.getCablePoint(i / 32);
      p.y += yOff; p.z += zOff;
      pts.push(p);
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: col }));
  };
  grp.add(makeCable(5.2, -0.4, 0xcbd5e1), makeCable(5.2, 0.4, 0xcbd5e1), makeCable(4.3, 0, 0x64748b));

  // 3) Detaillierte Panoramakabine 17
  const cab = new THREE.Group();

  // Weiße Bodenschürze & Dachhaube
  const floor = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 3.2), KS.mats.white);
  floor.position.y = 0.22;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 3.0), KS.mats.white);
  roof.position.y = 2.75;
  cab.add(floor, roof);

  // Laufwerk & C-Gehänge
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.3, 0.35), KS.mats.stone);
  arm.position.set(0, 3.9, 0);
  const trolley = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 1.1), KS.mats.iron);
  trolley.position.set(0, 5.1, 0);
  cab.add(arm, trolley);

  // Panoramascheiben (vorne, hinten, rechts)
  const glassBack = new THREE.Mesh(new THREE.BoxGeometry(4.3, 2.2, 0.08), KS.mats.glass);
  glassBack.position.set(0, 1.5, -1.55);
  const glassL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 3.1), KS.mats.glass);
  glassL.position.set(-2.15, 1.5, 0);
  const glassR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 3.1), KS.mats.glass);
  glassR.position.set(2.15, 1.5, 0);
  cab.add(glassBack, glassL, glassR);

  // Automatische Doppelschiebetüren (Südseite z = +1.55)
  s.doorL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 0.1), KS.mats.glass);
  s.doorR = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 0.1), KS.mats.glass);
  s.doorL.position.set(-0.55, 1.5, 1.55);
  s.doorR.position.set(0.55, 1.5, 1.55);
  cab.add(s.doorL, s.doorR);

  // Innenraum: Holzlatten-Sitzbänke & Mittelgeländer
  const benchBack = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 0.5), KS.mats.wood);
  benchBack.position.set(0, 0.85, -1.2);
  const benchMid = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.7), KS.mats.wood);
  benchMid.position.set(0, 0.85, 0);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.08), KS.mats.stone);
  rail.position.set(0, 1.35, 0);
  cab.add(benchBack, benchMid, rail);

  s.cabin = cab;
  cab.position.copy(KS.getCablePoint(0));
  grp.add(cab);
  scene.add(grp);
};

KS.updateSeilbahn = function (dt) {
  const s = KS.seilbahn;
  if (!s.cabin) return;

  if (s.state === 'WAIT_TAL' || s.state === 'WAIT_BERG') {
    s.timer += dt;
    if (s.timer >= s.waitTime) {
      s.timer = 0;
      s.nextDir = (s.state === 'WAIT_TAL') ? 'UP' : 'DOWN';
      s.state = 'CLOSE';
    }
  } else if (s.state === 'CLOSE') {
    s.doorOpen = Math.max(0, s.doorOpen - dt * 1.4);
    if (s.doorOpen <= 0) s.state = s.nextDir;
  } else if (s.state === 'OPEN') {
    s.doorOpen = Math.min(1, s.doorOpen + dt * 1.4);
    if (s.doorOpen >= 1) s.state = (s.t >= 0.99) ? 'WAIT_BERG' : 'WAIT_TAL';
  } else if (s.state === 'UP') {
    s.t = Math.min(1, s.t + dt * 0.055);
    if (s.t >= 1) s.state = 'OPEN';
  } else if (s.state === 'DOWN') {
    s.t = Math.max(0, s.t - dt * 0.055);
    if (s.t <= 0) s.state = 'OPEN';
  }

  // Kabine positionieren & Schiebetüren animieren
  s.cabin.position.copy(KS.getCablePoint(s.t));
  s.doorL.position.x = -0.55 - s.doorOpen * 0.95;
  s.doorR.position.x = 0.55 + s.doorOpen * 0.95;

  // Status-Anzeige im HUD aktualisieren
  const st = document.getElementById('status-txt');
  if (st) {
    if (s.state === 'WAIT_TAL') st.textContent = `🚡 Talstation (Türen offen • ${Math.ceil(s.waitTime - s.timer)}s)`;
    else if (s.state === 'WAIT_BERG') st.textContent = `🚡 Bergstation (Türen offen • ${Math.ceil(s.waitTime - s.timer)}s)`;
    else if (s.state === 'UP') st.textContent = '🚡 Bergfahrt nach Ehrenbreitstein...';
    else if (s.state === 'DOWN') st.textContent = '🚡 Talfahrt zum Deutschen Eck...';
    else st.textContent = '🚡 Türen bewegen sich...';
  }
};
