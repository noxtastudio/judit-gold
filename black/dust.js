// Gold dust in the hero (three.js): a few hundred soft points drifting upward, with a light mouse parallax.
// Skipped on reduced motion; paused while the hero is off screen; DPR capped so phones stay smooth.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js').then(function (THREE) {
    var canvas = document.querySelector('.dust'), hero = document.querySelector('.hero');
    var mobile = matchMedia('(max-width: 900px)').matches, N = mobile ? 110 : 260;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, .1, 50);
    camera.position.z = 8;

    // soft round sprite
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d'), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(238, 208, 140, .9)'); grad.addColorStop(.3, 'rgba(214, 178, 104, .45)'); grad.addColorStop(1, 'rgba(201, 164, 92, 0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    var sprite = new THREE.CanvasTexture(c);

    var pos = new Float32Array(N * 3), speed = new Float32Array(N), phase = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - .5) * 18; pos[i * 3 + 1] = (Math.random() - .5) * 10; pos[i * 3 + 2] = (Math.random() - .5) * 6;
      speed[i] = .15 + Math.random() * .35; phase[i] = Math.random() * Math.PI * 2;
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ map: sprite, size: mobile ? .13 : .11, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    var points = new THREE.Points(geo, mat); scene.add(points);

    var mx = 0, my = 0, tx = 0, ty = 0;
    addEventListener('pointermove', function (e) { tx = (e.clientX / innerWidth - .5) * .6; ty = (e.clientY / innerHeight - .5) * .4; }, { passive: true });

    function size() {
      var w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    size(); addEventListener('resize', size);

    var visible = true, last = performance.now();
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) { last = performance.now(); loop(); } }, { threshold: 0 }).observe(hero);

    function loop() {
      if (!visible) return;
      var now = performance.now(), dt = Math.min((now - last) / 1000, .05); last = now;
      var p = geo.attributes.position.array, t = now / 1000;
      for (var i = 0; i < N; i++) {
        p[i * 3 + 1] += speed[i] * dt;
        p[i * 3] += Math.sin(t * .6 + phase[i]) * .0025;
        if (p[i * 3 + 1] > 5.2) { p[i * 3 + 1] = -5.2; p[i * 3] = (Math.random() - .5) * 18; }
      }
      geo.attributes.position.needsUpdate = true;
      mx += (tx - mx) * .04; my += (ty - my) * .04;
      camera.position.x = mx; camera.position.y = -my; camera.lookAt(0, 0, 0);
      points.rotation.z = Math.sin(t * .05) * .03;
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    loop();
  }).catch(function () { /* no WebGL or offline: the hero simply has no dust */ });
}
