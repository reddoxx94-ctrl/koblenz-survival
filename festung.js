window.KS = window.KS || {};

KS.buildFestung = function (scene) {
  const grp = new THREE.Group();
  const PL = 118.0; // Plateau-Höhe (183 m NHN)

  const addBox = (w, h, d, x, y, z, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    grp.add(m);
    return m;
  };

  // Festungs-Plateau & Großer Schlosshof
  addBox(125, 1.0, 105, 360, PL - 0.5, -55, KS.mats.tuff);

  // Aussichtsbauwerk Rheinblick (direkt neben der Bergstation)
  addBox(14, 0.4, 12, 307, PL + 0.2, -26, KS.mats.wood);
  addBox(0.4, 1.2, 12, 300.2, PL + 0.8, -26, KS.mats.iron); // Brüstung West

  // Feldtor-Mauer (Eingang zum Schlosshof)
  addBox(14, 6.5, 2.5, 339, PL + 3.25, -35, KS.mats.ochre);
  addBox(14, 6.5, 2.5, 358, PL + 3.25, -35, KS.mats.ochre);
  addBox(5, 2.2, 2.6, 348.5, PL + 5.4, -35, KS.mats.tuff); // Torsturz

  // Rheinkaserne (Westflügel über dem Rhein)
  addBox(22, 9.5, 42, 350, PL + 4.75, -75, KS.mats.ochre);
  addBox(23, 0.8, 43, 350, PL + 9.8, -75, KS.mats.tuff); // Gesims

  // Hohe Ostfront & Nordabschluss des Schlosshofs
  addBox(20, 11.5, 46, 407, PL + 5.75, -75, KS.mats.ochre);
  addBox(78, 12.0, 8, 378, PL + 6.0, -100, KS.mats.ochre);

  // Zwei historische Kanonen am Rheinblick
  [-39, -16].forEach((cz) => {
    addBox(1.8, 0.7, 1.0, 309, PL + 0.35, cz, KS.mats.wood);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.6, 10), KS.mats.bronze);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(308.2, PL + 0.85, cz);
    grp.add(barrel);
  });

  // Fahnenmasten auf der Rheinkaserne
  [-90, -60].forEach((fz) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 6.5, 8), KS.mats.iron);
    pole.position.set(341, PL + 13.0, fz);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 2.4), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    flag.position.set(341, PL + 15.2, fz + 1.2);
    grp.add(pole, flag);
  });

  scene.add(grp);
};
