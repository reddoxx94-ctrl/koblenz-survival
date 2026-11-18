(function () {
  window.KS = window.KS || {};

  KS.buildFestung = function (scene) {
    const grp = new THREE.Group();
    const M = KS.mats;
    const Y = 118.0; // Plateau-Höhe Ehrenbreitstein

    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      grp.add(m);
      return m;
    };

    // 1. Großes Festungs-Plateau (Oberer Schlosshof & BUGA-Vorfeld)
    add(new THREE.BoxGeometry(135, 3.0, 125), M.paving, 360, Y - 1.5, -50);
    add(new THREE.BoxGeometry(75, 0.2, 85), M.grass, 395, Y + 0.05, -50);

    // 2. Rhein-Bastion & Festungsmauer (Kurtine mit Kasematten-Fenstern)
    add(new THREE.BoxGeometry(8.5, 16, 118), M.granite, 298, Y + 6.5, -50);
    // Zinnen / Brustwehr zur Rheinseite
    for (let z = -104; z <= 4; z += 9) {
      add(new THREE.BoxGeometry(2.2, 2.2, 5.2), M.granite, 294.5, Y + 15.2, z);
      // Dunkle Kasematten-Schießscharten in der Mauer
      add(new THREE.BoxGeometry(1.2, 2.6, 1.8), M.darkPortal, 293.7, Y + 9.0, z);
      add(new THREE.BoxGeometry(1.2, 2.2, 1.5), M.darkPortal, 293.7, Y + 3.5, z);
    }

    // 3. Markanter Rundturm (Ungenturm / Süd-Bastion am Sporn)
    add(new THREE.CylinderGeometry(8.5, 9.8, 22, 18), M.granite, 296, Y + 9.0, 12);
    add(new THREE.CylinderGeometry(9.2, 9.2, 1.8, 18), M.tuff, 296, Y + 20.5, 12);
    add(new THREE.ConeGeometry(8.8, 6.5, 18), M.slate, 296, Y + 24.5, 12);

    // Nord-Bastion (Fuchs-Bastion)
    add(new THREE.CylinderGeometry(9.0, 10.5, 18, 12), M.granite, 2
