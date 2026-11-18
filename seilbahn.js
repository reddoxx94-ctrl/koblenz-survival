(function () {
  window.KS = window.KS || {};

  KS.talPos = new THREE.Vector3(55, 1.2, 45);
  KS.bergPos = new THREE.Vector3(305, 118.0, -45);

  KS.cableWaypoints = [
    new THREE.Vector3(55, 5.2, 45),
    new THREE.Vector3(82, 24.5, 35),
    new THREE.Vector3(240, 88.5, -21),
    new THREE.Vector3(282, 125.0, -37),
    new THREE.Vector3(305, 122.0, -45)
  ];

  KS.seilbahn = {
    state: 'TAL', // 'TAL', 'TO_BERG', 'BERG', 'TO_TAL'
    progress: 0,
    speed: 0.055,
    gondola: null,
    curve: null
  };

  KS.buildSeilbahn = function (scene) {
    const grp = new THREE.Group();
    const M = KS.mats;
    const pillarSteel = new THREE.MeshStandardMaterial({ color: 0x2f4f3e, metalness: 0.65, roughness: 0.38 });

    const add = (parent, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      parent.add(m);
      return m;
    };

    // 1. Moderne Stationen (Talstation Konrad-Adenauer-Ufer & Bergstation Ehrenbreitstein)
    function makeStation(pos, rotY) {
      const st = new THREE.Group();
      st.position.copy(pos);
      st.rotation.y = rotY;
      // Beton-Plattform & Einstiegsbereich
      add(st, new THREE.BoxGeometry(16, 0.6, 11), M.granite, 0, 0.3, 0);
      // Tragpfeiler & verglaste Seitenwände
      add(st, new THREE.CylinderGeometry(0.45, 0.55, 6.2, 10), M.iron, -5.5, 3.1, 0);
      add(st, new THREE.CylinderGeometry(0.45, 0.55, 6.2, 10), M.iron, 5.5, 3.1, 0);
      add(st, new THREE.BoxGeometry(14, 4.2, 0.2), M.glass, 0, 2.7, 4.8);
      add(st, new THREE.BoxGeometry(14, 4.2, 0.2), M.glass, 0, 2.7, -4.8);
      // Geschwungenes Umlenk-Dach mit gelbem Akzentstreifen
      add(st, new THREE.BoxGeometry(17, 0.9, 11.5), M.iron, 0, 6.4, 0);
      add(st, new THREE.CylinderGeometry(5.75, 5.75, 0.9, 16), M.iron, -8.5, 6.4, 0);
      add(st, new THREE.CylinderGeometry(4.2, 4.2, 0.35, 20), M.gold, -6.5, 5.7, 0);
      grp.add(st);
    }

    const angle = Math.atan2(-90, 250);
    makeStation(KS.talPos, -angle);
    makeStation(KS.bergPos, -angle);

    // 2. Große Fachwerk-Seilbahnstützen am Rhein- und Felsufer
    function makePillar(x, baseY, topY, z) {
      const h = topY - baseY;
      const p = new THREE.Group();
      p.position.set(x, baseY, z);
      p.rotation.y = -angle;
      // Betonsockel + konischer Stahlmast
      add(p, new THREE.BoxGeometry(4.8, 2.8, 4.8), M.granite, 0, 1.4, 0);
      add(p, new THREE.CylinderGeometry(0.85, 1.75, h, 8), pillarSteel, 0, h / 2, 0);
      // Quertraverse (Joch) + Rollenbatterien
      add(p, new THREE.BoxGeometry(1.6, 1.2, 9.6), M.iron, 0, h, 0);
      add(p, new THREE.BoxGeometry(5.2, 0.55, 0.45), M.iron, 0, h - 0.5, 4.4);
      add(p, new THREE.BoxGeometry(5.2, 0.55, 0.45), M.iron, 0, h - 0.5, -4.4);
      add(p, new THREE.BoxGeometry(0.15, 1.6, 9.8), M.iron, 0, h + 1.1, 0);
      grp.add(p);
    }

    makePillar(82, 1.2, 24.5, 35);
    makePillar(240, 1.2, 88.5, -21);
    makePillar(282, 102.0, 125.0, -37);

    // 3. Dreiseil-System (2 Tragseile + 1 Zugseil je Fahrtrichtung)
    KS.seilbahn.curve = new THREE.CatmullRomCurve3(KS.cableWaypoints);
    [-3.8, -3.4, 3.4, 3.8].forEach((offsetZ, idx) => {
      const pts = KS.cableWaypoints.map((pt) => new THREE.Vector3(pt.x, pt.y - (idx % 2) * 0.25, pt.z + offsetZ * 0.35));
      const cCurve = new THREE.CatmullRomCurve3(pts);
      const cableGeo = new THREE.TubeGeometry(cCurve, 70, idx % 2 === 0 ? 0.07 : 0.045, 6, false);
      grp.add(new THREE.Mesh(cableGeo, M.iron));
    });

    // 4. Panorama-Gondel (Koblenzer 3S-Kabine mit Rundum-Verglasung)
    const gon = new THREE.Group();
    // Laufwerk & Gehängearm oben am Seil
    add(gon, new THREE.BoxGeometry(2.6, 0.45, 0.6), M.gold, 0, 0.2, 0);
    add(gon, new THREE.CylinderGeometry(0.14, 0.14, 2.5, 8), M.iron, 0, -1.1, 0);
    // Kabinendach, Glas-Korpus & Bodenwanne
    add(gon, new THREE.BoxGeometry(4.4, 0.35, 3.2), M.iron, 0, -2.2, 0);
    add(gon, new THREE.BoxGeometry(4.2, 2.35, 3.0), M.glass, 0, -3.55, 0);
    add(gon, new THREE.BoxGeometry(4.4, 0.45, 3.2), M.iron, 0, -4.85, 0);
    // Eckstreben & Holzsitzbänke im Inneren
    [[-2.0, -1.4], [2.0, -1.4], [-2.0, 1.4], [2.0, 1.4]].forEach(([cx, cz]) => {
      add(gon, new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), M.iron, cx, -3.55, cz);
    });
