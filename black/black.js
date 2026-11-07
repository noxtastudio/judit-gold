// Judit Gold black edition — motion layer (GSAP 3.13 + ScrollTrigger + SplitText, Lenis).
// Progressive: without JS or with reduced motion the page is complete and static.
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = matchMedia('(min-width: 901px)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  // Map only loads on request — no Google cookies before the visitor asks for it.
  document.querySelector('.map-load').addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=Holl%C3%B3%20B%C3%A9la%20utca%201%2C%20Kiskunf%C3%A9legyh%C3%A1za&z=16&output=embed';
    f.title = 'Judit Gold a térképen'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    document.getElementById('map').replaceChildren(f);
  });

  if (reduce || !window.gsap || !window.ScrollTrigger || !window.SplitText) {
    document.documentElement.classList.add('no-motion');
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.remove('reveal'); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Smooth scroll driven by GSAP's ticker; anchor links go through Lenis too.
  var lenis;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, anchors: { offset: -80 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();                                  // held while the loader runs
  }

  // ---- Loader: counter + gold line, then the curtain lifts straight into the hero.
  var loader = document.querySelector('.loader'), count = loader.querySelector('b'), line = loader.querySelector('.loader-line');
  var ready = Promise.all([
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
    new Promise(function (r) { var i = document.querySelector('.arch img'); (i.complete ? r() : (i.onload = i.onerror = r)); })
  ]);
  var progress = { v: 0 };
  var fill = gsap.to(progress, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: function () {
    count.textContent = Math.round(progress.v); line.style.setProperty('--p', progress.v / 100);
  } });
  ready.then(function () { fill.eventCallback('onComplete', intro); if (fill.progress() === 1) intro(); });
  // Whatever happens (a script that didn't load, an error in the intro), the page must never stay behind the loader.
  function unblock() { gsap.set(loader, { display: 'none' }); if (lenis) lenis.start(); }
  setTimeout(function () { if (getComputedStyle(loader).display !== 'none') unblock(); }, 6000);

  function intro() {
    try { introMotion(); } catch (e) { unblock(); scrollMotion(); throw e; }
  }
  function introMotion() {
    var h1 = SplitText.create('.hero h1', { type: 'lines', mask: 'lines', linesClass: 'ln' });
    var lede = SplitText.create('.hero .lede', { type: 'lines', mask: 'lines', linesClass: 'ln' });
    var rClosed = desktop ? 'inset(18% 30% 26% 30% round 200px 200px 0px 0px)' : 'inset(20% 18% 28% 18% round 120px 120px 0px 0px)';
    var rOpen = 'inset(0% 0% 0% 0% round 260px 260px 6px 6px)';
    // Once the lines have risen, put the original text back: the line masks clip the descenders (g, j, y).
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: function () { h1.revert(); lede.revert(); if (lenis) lenis.start(); } });
    tl.to(loader, { yPercent: -100, duration: 1.1, ease: 'power3.inOut' }, 0)
      .set(loader, { display: 'none' })
      .fromTo('.arch', { clipPath: rClosed }, { clipPath: rOpen, duration: 1.5, ease: 'power3.inOut' }, .55)
      .fromTo('.arch img', { scale: 1.25 }, { scale: 1, duration: 1.9, ease: 'power3.out' }, .55)
      .from('.hero .eyebrow', { autoAlpha: 0, y: 12, duration: .7 }, .9)
      .from(h1.lines, { yPercent: 110, duration: 1, stagger: .1 }, .95)
      .from(lede.lines, { yPercent: 110, duration: .9, stagger: .07 }, 1.25)
      .from('.hero-cta .btn', { autoAlpha: 0, y: 14, duration: .6, stagger: .08 }, 1.5)
      .from('.hero-photo figcaption', { autoAlpha: 0, y: 14, duration: .6 }, 1.7)
      .from('.proof li', { autoAlpha: 0, y: 14, duration: .6, stagger: .07 }, 1.6);
    if (lenis) setTimeout(function () { lenis.start(); }, 1800);   // scroll a little before the end if the visitor wants to
    scrollMotion();
  }

  function scrollMotion() {
    // Hero depth: the arch sinks a touch as you scroll and the dust thins out.
    gsap.to('.arch img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.dust', { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '40% top', end: 'bottom top', scrub: true } });

    // Section heads and cards rise as they enter.
    document.querySelectorAll('.sec-head, .gift, .contact-card, .map, .about-text > *').forEach(function (el) {
      el.classList.add('reveal');
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    // Services: photos wipe up out of their cards, staggered.
    gsap.utils.toArray('.service').forEach(function (card, i) {
      gsap.fromTo(card.querySelector('.service-img'), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power3.inOut', delay: (i % 3) * .1, scrollTrigger: { trigger: card, start: 'top 85%', once: true } });
      gsap.from(card.querySelector('.service-body'), { autoAlpha: 0, y: 18, duration: .8, delay: .3 + (i % 3) * .1, scrollTrigger: { trigger: card, start: 'top 85%', once: true } });
    });

    // Prices: dotted leaders draw in and the amounts count up.
    var hu = new Intl.NumberFormat('hu-HU');
    gsap.utils.toArray('.price-card li').forEach(function (li, i) {
      gsap.from(li, { autoAlpha: 0, x: -10, duration: .6, delay: i * .06, scrollTrigger: { trigger: '.price-card', start: 'top 80%', once: true } });
      var b = li.querySelector('b[data-count]');
      if (!b) return;
      var n = { v: 0 }, target = +b.dataset.count;
      gsap.to(n, { v: target, duration: 1.4, delay: .2 + i * .08, ease: 'power2.out', snap: { v: 500 }, scrollTrigger: { trigger: '.price-card', start: 'top 80%', once: true },
        onUpdate: function () { b.textContent = hu.format(n.v) + ' Ft'; } });
    });

    // Gallery: on desktop the strip is pinned and scrolls sideways; on phones it's a plain grid.
    if (desktop) {
      var track = document.querySelector('.gallery-track');
      gsap.to(track, { x: function () { return -(track.scrollWidth - innerWidth); }, ease: 'none',
        scrollTrigger: { trigger: '.gallery-wrap', start: 'center center', end: function () { return '+=' + (track.scrollWidth - innerWidth); }, pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
      gsap.from('.gallery-track img', { autoAlpha: 0, y: 30, duration: .9, stagger: .06, scrollTrigger: { trigger: '.gallery-wrap', start: 'top 70%', once: true } });
    } else {
      gsap.from('.gallery-track img', { autoAlpha: 0, y: 24, duration: .8, stagger: .08, scrollTrigger: { trigger: '.gallery-track', start: 'top 85%', once: true } });
    }

    // About: the quote lights up word by word as it scrolls into view; the photo frame draws.
    var q = SplitText.create('.about-quote p', { type: 'words', wordsClass: 'w' });
    gsap.to(q.words, { color: '#F4EADB', stagger: .08, ease: 'none', scrollTrigger: { trigger: '.about-quote', start: 'top 85%', end: 'top 45%', scrub: true } });
    gsap.from('.about-photo img', { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: '.about-photo', start: 'top 80%', once: true } });
    gsap.from('.values li', { autoAlpha: 0, y: 14, duration: .7, stagger: .08, scrollTrigger: { trigger: '.values', start: 'top 85%', once: true } });

    // Nav: highlight the section in view.
    gsap.utils.toArray('.nav a').forEach(function (a) {
      var id = a.getAttribute('href');
      ScrollTrigger.create({ trigger: id, start: 'top 50%', end: 'bottom 50%', onToggle: function (s) { a.style.color = s.isActive ? '#F4EADB' : ''; } });
    });

    // Images decoded later can change heights: recompute the pin distances.
    addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
