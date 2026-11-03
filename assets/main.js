// Judit Gold — motion layer (GSAP 3.13 + ScrollTrigger + SplitText, Lenis). Progressive: the page is complete without it.
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  // Map only loads on request — no Google cookies before the visitor asks for it.
  document.querySelector('.map-load').addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=Holl%C3%B3%20B%C3%A9la%20utca%201%2C%20Kiskunf%C3%A9legyh%C3%A1za&z=16&output=embed';
    f.title = 'Judit Gold a térképen'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    document.getElementById('map').replaceChildren(f);
  });

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // Split text only once the web fonts are in, so line breaks are measured on the real typeface.
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(motion);
  function motion() {

  // Smooth scroll (Lenis) driven by GSAP's ticker; anchor links go through Lenis too.
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // ---- Hero: arch opens, image settles, lines rise out of their masks.
  var desktop = matchMedia('(min-width: 701px)').matches;
  var archImg = document.querySelector('.arch img');
  var rOpen = desktop ? 'inset(0% 0% 0% 0% round 260px 260px 28px 28px)' : 'inset(0% 0% 0% 0% round 160px 160px 22px 22px)';
  var rClosed = desktop ? 'inset(18% 30% 26% 30% round 200px 200px 0px 0px)' : 'inset(20% 18% 28% 18% round 120px 120px 0px 0px)';
  var h1 = SplitText.create('.hero h1', { type: 'lines', mask: 'lines', linesClass: 'ln' });
  var lede = SplitText.create('.hero .lede', { type: 'lines', mask: 'lines', linesClass: 'ln' });
  var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .fromTo(archImg, { clipPath: rClosed, scale: 1.22 }, { clipPath: rOpen, scale: 1, duration: 1.5, ease: 'power3.inOut' }, 0)
    .from('.arch', { '--frame': 0, duration: 1.2, ease: 'power2.out' }, .6)
    .from('.hero .eyebrow', { autoAlpha: 0, y: 12, duration: .7 }, .25)
    .from(h1.lines, { yPercent: 110, duration: 1, stagger: .1 }, .35)
    .from(lede.lines, { yPercent: 110, duration: .9, stagger: .07 }, .7)
    .from('.hero-cta > *', { autoAlpha: 0, y: 10, duration: .6, stagger: .08 }, 1)
    .from('.trust li', { autoAlpha: 0, y: 10, duration: .6, stagger: .08 }, 1.15);
  gsap.to(archImg, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'bottom bottom', end: 'bottom top', scrub: true } });

  // ---- Services: the item in view is highlighted and the sticky photo swaps.
  var services = document.querySelector('.services');
  var stack = document.querySelectorAll('.media-stack img');
  services.classList.add('has-js');
  document.querySelectorAll('.svc').forEach(function (el, i) {
    ScrollTrigger.create({
      trigger: el, start: 'top 55%', end: 'bottom 55%',
      onToggle: function (self) {
        if (!self.isActive) return;
        document.querySelectorAll('.svc').forEach(function (s) { s.classList.toggle('is-active', s === el); });
        stack.forEach(function (img, j) { img.classList.toggle('is-active', j === i); });
      }
    });
  });
  document.querySelector('.svc').classList.add('is-active');

  // ---- Why: the statement lights up word by word as you scroll.
  var lit = SplitText.create('.lit', { type: 'words', wordsClass: 'w' });
  gsap.fromTo(lit.words, { opacity: .18 }, { opacity: 1, ease: 'none', stagger: .04,
    scrollTrigger: { trigger: '.lit', start: 'top 80%', end: 'bottom 45%', scrub: true } });

  // ---- Jewellery strip drifts left while the section passes.
  gsap.to('.strip-track', { xPercent: -16, ease: 'none',
    scrollTrigger: { trigger: '.jewellery', start: 'top bottom', end: 'bottom top', scrub: true } });

  // ---- Soft reveals (one movement per element, nothing bounces).
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.from(el, { autoAlpha: 0, y: 22, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  }
})();
