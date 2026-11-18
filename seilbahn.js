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
    state: 'TAL',
    progress: 0,
    speed: 0.055,
    gondola: null,
    curve: null
  };

  KS.buildSeilbahn = function (scene) {
    const grp = new THREE.Group();
    const M = KS.mats;

    const add = (parent, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      parent.add(m);
      return m;
    };

    function makeStation(pos, rotY) {
      const st = new THREE.Group();
      st.position.copy(pos);
      st.rotation.y = rotY;
      add(st, new THREE.BoxGeometry(16, 0.6, 11), M.granite, 0, 0.3, 0);
      add(st, new THREE.BoxGeometry(14, 4.2, 0.2), M.glass, 0, 2.7, 4.8);
      grp.add(st);
    }

    const angle = Math.atan2(-90, 250);
    makeStation(KS.talPos, -angle);
    makeStation(KS.bergPos, -angle);

    KS.seilbahn.curve = new THREE.CatmullRomCurve3(KS.cableWaypoints);
    [-3.8, 3.8].forEach((offsetZ) => {
      const pts = KS.cableWaypoints.map((pt) => new THREE.Vector3(pt.x, pt.y, pt.z + offsetZ));
      const cCurve = new THREE.CatmullRomCurve3(pts);
      const cableGeo = new THREE.TubeGeometry(cCurve, 70, 0.06, 6, false);
      grp.add(new THREE.Mesh(cableGeo, M.iron));
    });

    const gon = new THREE.Group();
    add(gon, new THREE.BoxGeometry(4.4, 0.35, 3.2), M.iron, 0, -2.2, 0);
    add(gon, new THREE.BoxGeometry(4.2, 2.35, 3.0), M.glass, 0, -3.55, 0);
    gon.position.copy(KS.cableWaypoints[0]);
    KS.seilbahn.gondola = gon;
    grp.add(gon);

    scene.add(grp);
  };

  KS.startSeilbahnRide = function (toBerg) {
    KS.seilbahn.state = toBerg ? 'TO_BERG' : 'TO_TAL';
    KS.seilbahn.progress = toBerg ? 0 : 1;
  };

  KS.updateSeilbahn = function (dt, player) {
    const sb = KS.seilbahn;
    if (!sb.gondola || !sb.curve) return;

    if (sb.state === 'TO_BERG') {
      sb.progress += dt * sb.speed;
      if (sb.progress >= 1) { sb.progress = 1; sb.state = 'BERG'; }
    } else if (sb.state === 'TO_TAL') {
      sb.progress -= dt * sb.speed;
      if (sb.progress <= 0) { sb.progress = 0; sb.state = 'TAL'; }
    }

    const pt = sb.curve.getPointAt(THREE.MathUtils.clamp(sb.progress, 0, 1));
    sb.gondola.position.copy(pt);

    if (sb.state === 'TO_BERG' || sb.state === 'TO_TAL') {
      player.pos.set(pt.x, pt.y - 4.6, pt.z);
      player.velY = 0;
    }
  };
})();
