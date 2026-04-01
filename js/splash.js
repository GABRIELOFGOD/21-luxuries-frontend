// Splash screen loader for all pages (3.5s)
(function () {
  const SPLASH_DURATION = 3500; // ms
  const EXTRA_CLEANUP = 500; // ms after fade-out

  const hasIndexStage = document.getElementById('stage');
  if (hasIndexStage) {
    return; // index already has its own loading effect
  }

  const splashOverlay = document.createElement('div');
  splashOverlay.id = 'splash-overlay';
  splashOverlay.innerHTML = `
    <div id="stage" class="splash-stage">
      <div id="rule" class="splash-rule"></div>
      <div id="num" class="splash-num">21</div>
      <div id="banner" class="splash-banner"><span id="banner-text">Luxuries</span></div>
      <div id="tagline" class="splash-tagline">Streetwear with a luxury mindset</div>
      <div id="shimmer" class="splash-shimmer"></div>
      <div id="bar-wrap" class="splash-bar-wrap"><div id="bar" class="splash-bar"></div></div>
      <div id="hanger" class="splash-hanger">
        <svg width="60" height="46" viewBox="0 0 60 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 4 Q30 0 34 0 Q38 0 38 4 Q38 8 30 10" stroke="#1a3d2b" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M30 10 L30 16 L4 38 Q2 40 2 42 Q2 46 6 46 L54 46 Q58 46 58 42 Q58 40 56 38 L30 16" stroke="#1a3d2b" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `;

  document.documentElement.classList.add('splash-active');
  document.body.prepend(splashOverlay);
  document.body.style.overflow = 'hidden';

  // Animate in splash elements, inspired by index animation
  const stage = splashOverlay.querySelector('#stage');
  const rule = splashOverlay.querySelector('#rule');
  const num = splashOverlay.querySelector('#num');
  const banner = splashOverlay.querySelector('#banner');
  const bannerText = splashOverlay.querySelector('#banner-text');
  const tagline = splashOverlay.querySelector('#tagline');
  const shimmer = splashOverlay.querySelector('#shimmer');
  const barWrap = splashOverlay.querySelector('#bar-wrap');
  const bar = splashOverlay.querySelector('#bar');
  const hanger = splashOverlay.querySelector('#hanger');

  setTimeout(() => { rule.style.width = '260px'; }, 100);
  setTimeout(() => {
    hanger.style.opacity = '1';
    hanger.style.transform = 'translate(-50%,0) scale(1) rotate(0deg)';
  }, 400);
  setTimeout(() => {
    num.style.opacity = '1';
    num.style.transform = 'scale(1) translateY(0)';
  }, 650);
  setTimeout(() => {
    banner.style.transform = 'translate(-50%,0) scaleX(1)';
    bannerText.style.opacity = '1';
  }, 1050);
  setTimeout(() => {
    tagline.style.opacity = '1';
    tagline.style.transform = 'translate(-50%,0)';
  }, 1500);
  setTimeout(() => {
    shimmer.style.opacity = '1';
    shimmer.style.transform = 'translateX(120%) skewX(-12deg)';
    setTimeout(() => { shimmer.style.opacity = '0'; }, 1200);
  }, 1700);
  setTimeout(() => {
    barWrap.style.opacity = '1';

    let start = null;
    const total = SPLASH_DURATION - 1200;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / total, 1);
      bar.style.width = `${Math.round(progress * 100)}%`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, 1800);

  setTimeout(() => {
    splashOverlay.style.opacity = '0';
    document.body.style.overflow = '';
    setTimeout(() => {
      splashOverlay.remove();
      document.documentElement.classList.remove('splash-active');
    }, EXTRA_CLEANUP);
  }, SPLASH_DURATION);
})();