(function () {
  window.KS = window.KS || {};
  KS.buildFestung = function (scene) {
    const festungGrp = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
    
    const wall = new THREE.Mesh(new THREE.BoxGeometry(60, 8, 4), wallMat);
    wall.position.set(305, 122, -25);
    wall.castShadow = true;
    festungGrp.add(wall);

    scene.add(festungGrp);
  };
})();
