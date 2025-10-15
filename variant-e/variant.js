(() => {
  const TEST_NAME = 'CF Hero Benefits Bullets - Memory Air';
  if (!init()) return;

  addStyles();
  run();
  window.addEventListener('resize', debounce(run, 120));
  window.addEventListener('orientationchange', () => setTimeout(run, 160));

  function run() {
    const headline = findByText('BIGGEST IMPROVEMENT OF HUMAN MEMORY EVER DISCOVERED');
    if (!headline) return;

    const block = closestBlock(headline) || document.body;
    const subline = findByText('Prevent and reverse memory loss', '*', block) ||
      findByText('Prevent and reverse memory loss');
    if (!subline) return;

    // 1) Insert bullets once
    let bullets = subline.querySelector('#cf-bullets');
    if (!bullets) {
      bullets = buildBullets();
      // Mobile uses stacked copy; safest is "inside subline, first"
      subline.insertBefore(bullets, subline.firstChild);
    }

    // 2) Let subline grow and create space for bullets
    relaxHeights(subline);
    const bulletsH = bullets.offsetHeight;
    const prevPad = +subline.dataset.cfPad || 0;
    const basePad = (parseFloat(getComputedStyle(subline).paddingTop) || 0) - prevPad;
    const newPad = Math.max(0, bulletsH + 16);
    subline.style.setProperty('padding-top', (basePad + newPad) + 'px', 'important');
    subline.dataset.cfPad = newPad;

    // 3) On mobile, scale down the hero image to avoid overlapping the next block overlay
    clampMobileHeroImage({ gap: 12 });

    // Ensure the image container and image have fixed heights on mobile to prevent overlap
    if (window.matchMedia('(max-width: 600px)').matches) {
      const containerDiv = document.querySelector('#lp-pom-image-120 > div') as HTMLElement | null;
      const img = document.querySelector('#lp-pom-image-120 > div > img') as HTMLElement | null;
      if (containerDiv) {
        containerDiv.style.setProperty('height', '180px', 'important');
        containerDiv.style.setProperty('max-height', '180px', 'important');
      }
      if (img) {
        img.style.setProperty('height', '190px', 'important');
        img.style.setProperty('max-height', '190px', 'important');
        img.style.setProperty('object-fit', 'cover', 'important');
      }
    }

    // 3) Nudge CTA just enough (relative to its offsetParent)
    const cta = (block.querySelector('a[id^="lp-pom-button-"]') || null);
    if (cta) {
      shiftCTA(block, subline, cta);
    }

    // 4) On mobile, also handle #lp-pom-button-115 to prevent image overlap
    const mobileCTA = document.querySelector('#lp-pom-button-115');
    if (mobileCTA && isShown(mobileCTA)) {
      // Clamp against the actual IMG; push wrapper only if needed
      shiftCTA(
        closestBlock(mobileCTA) || document.body,
        subline,
        mobileCTA,
        { belowSelector: '#lp-pom-image-120 > div > img', gapTop: 12, gapBottom: 12, allowPush: true }
      );
    }

    // 5) Desktop: align #lp-pom-image-416 at top-center of #lp-pom-block-414-color-overlay
    if (window.matchMedia('(min-width: 900px)').matches) {
      alignHeroLogoDesktop();
    } else {
      resetHeroLogoDesktop();
    }

    // fire once
    window.CFQ = window.CFQ || [];
    window.CFQ.push({ emit: 'variantRendered' });
  }

  /* ---------- helpers ---------- */

  function alignHeroLogoDesktop() {
    const container = document.querySelector('#lp-pom-block-414-color-overlay') as HTMLElement | null;
    const innerImg = document.querySelector('#lp-pom-image-416 > div > img') as HTMLElement | null;
    if (!container || !innerImg) return;

    const wrapper = positionedWrapperForImage(innerImg) || (document.querySelector('#lp-pom-image-416') as HTMLElement | null);
    if (!wrapper) return;

    const ofp = (wrapper.offsetParent as HTMLElement) || document.body;
    const ofpRect = ofp.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    const wrapRect = wrapper.getBoundingClientRect();

    // Target: top center with a small top padding
    const padTop = 12; // px
    const targetTop = Math.round(contRect.top - ofpRect.top + padTop);
    const targetLeft = Math.round(contRect.left - ofpRect.left + (contRect.width / 2) - (wrapRect.width / 2));

    // Save original inline positions once
    if (!wrapper.dataset.cfPrevTop) wrapper.dataset.cfPrevTop = wrapper.style.top || '';
    if (!wrapper.dataset.cfPrevLeft) wrapper.dataset.cfPrevLeft = wrapper.style.left || '';
    if (!wrapper.dataset.cfPrevRight) wrapper.dataset.cfPrevRight = wrapper.style.right || '';
    if (!wrapper.dataset.cfPrevBottom) wrapper.dataset.cfPrevBottom = wrapper.style.bottom || '';
    if (!wrapper.dataset.cfPrevTransform) wrapper.dataset.cfPrevTransform = wrapper.style.transform || '';

    // Apply centered top alignment
    wrapper.style.setProperty('top', targetTop + 'px', 'important');
    wrapper.style.setProperty('left', targetLeft + 'px', 'important');
    wrapper.style.setProperty('right', 'auto', 'important');
    wrapper.style.setProperty('bottom', 'auto', 'important');
    // Ensure no stray transforms interfere with centering
    wrapper.style.setProperty('transform', 'none', 'important');
    wrapper.dataset.cfAlignedDesktop = '1';
  }

  function resetHeroLogoDesktop() {
    const innerImg = document.querySelector('#lp-pom-image-416 > div > img') as HTMLElement | null;
    const wrapper = innerImg ? (positionedWrapperForImage(innerImg) || (document.querySelector('#lp-pom-image-416') as HTMLElement | null)) : null;
    if (!wrapper || !wrapper.dataset.cfAlignedDesktop) return;

    // Restore previous inline values
    if ('cfPrevTop' in wrapper.dataset) wrapper.style.setProperty('top', wrapper.dataset.cfPrevTop || '');
    if ('cfPrevLeft' in wrapper.dataset) wrapper.style.setProperty('left', wrapper.dataset.cfPrevLeft || '');
    if ('cfPrevRight' in wrapper.dataset) wrapper.style.setProperty('right', wrapper.dataset.cfPrevRight || '');
    if ('cfPrevBottom' in wrapper.dataset) wrapper.style.setProperty('bottom', wrapper.dataset.cfPrevBottom || '');
    if ('cfPrevTransform' in wrapper.dataset) wrapper.style.setProperty('transform', wrapper.dataset.cfPrevTransform || '');

    delete wrapper.dataset.cfAlignedDesktop;
    delete wrapper.dataset.cfPrevTop;
    delete wrapper.dataset.cfPrevLeft;
    delete wrapper.dataset.cfPrevRight;
    delete wrapper.dataset.cfPrevBottom;
    delete wrapper.dataset.cfPrevTransform;
  }

  // Reduce hero image size on small screens so it doesn't overlap the next block overlay
  function clampMobileHeroImage(options = {}) {
    try {
      const { gap = 12, maxScaleReduction = 0.6 } = options as any;
      // Only apply on small screens; reset otherwise
      if (!window.matchMedia('(max-width: 600px)').matches) { resetMobileHeroImage(); return; }

      const img = document.querySelector('#lp-pom-image-120 > div > img') as HTMLElement | null;
      const overlay = document.querySelector('#lp-pom-block-194-color-overlay') as HTMLElement | null;
      if (!img || !overlay || !isShown(img) || !isShown(overlay)) { resetMobileHeroImage(); return; }

      // Save base transform once
      if (!img.dataset.cfBaseTransform) img.dataset.cfBaseTransform = (img as any).style.transform || '';
      const baseTransform = img.dataset.cfBaseTransform || '';

      // Temporarily reset to base to measure natural geometry
      (img as any).style.setProperty('transform', baseTransform || 'none', 'important');
      const imgRect = img.getBoundingClientRect();
      const ovTop = overlay.getBoundingClientRect().top;
      const allowedBottom = ovTop - gap;

      const naturalTop = imgRect.top;
      const naturalHeight = imgRect.height;
      const needsClamp = naturalTop + naturalHeight > allowedBottom;

      if (!needsClamp) { resetMobileHeroImage(); return; }

      const available = Math.max(1, allowedBottom - naturalTop);
      let scale = Math.min(1, available / Math.max(1, naturalHeight));
      scale = Math.max(maxScaleReduction, scale);

      const finalTransform = (baseTransform && baseTransform !== 'none')
        ? baseTransform + ' scale(' + scale + ')'
        : 'scale(' + scale + ')';

      (img as any).style.setProperty('transform', finalTransform, 'important');
      (img as any).style.setProperty('transform-origin', 'top center', 'important');
      img.dataset.cfScale = String(scale);
    } catch (e) {
      // no-op
    }
  }

  function resetMobileHeroImage() {
    const img = document.querySelector('#lp-pom-image-120 > div > img') as HTMLElement | null;
    if (!img) return;
    if ('cfBaseTransform' in (img as any).dataset) {
      (img as any).style.setProperty('transform', (img as any).dataset.cfBaseTransform || '');
    } else {
      (img as any).style.removeProperty('transform');
    }
    (img as any).style.removeProperty('transform-origin');
    if ((img as any).dataset) delete (img as any).dataset.cfScale;
  }

  function shiftCTA(block, subline, cta, opts = {}) {
    const { belowSelector = null, gapTop = 12, gapBottom = 12, allowPush = true } = opts as any;

    // Baseline once (relative to offsetParent)
    if (!cta.dataset.cfBaseTop) cta.dataset.cfBaseTop = String(cta.offsetTop);
    const baseTop = +cta.dataset.cfBaseTop;
    const ofp = cta.offsetParent || document.body;
    const ofpTop = ofp.getBoundingClientRect().top;

    // Lower bound: clear the subline
    const minTop = Math.round(subline.getBoundingClientRect().bottom - ofpTop + gapTop);
    let targetTop = Math.max(baseTop, minTop);

    // Optional upper bound: clear the element below (image)
    let belowEl: HTMLElement | Element | null = null;
    if (belowSelector) {
      belowEl = document.querySelector(belowSelector);
      if (!belowEl) {
        // fallback to the image box if inner <img> not found
        belowEl = block.querySelector('#lp-pom-image-120') || block.querySelector('[id^="lp-pom-image-"]');
      }
    } else {
      belowEl = block.querySelector('#lp-pom-image-120') || block.querySelector('[id^="lp-pom-image-"]');
    }

    if (belowEl) {
      const ctaH = cta.getBoundingClientRect().height;
      const belowTopInOfp = (belowEl as HTMLElement).getBoundingClientRect().top - ofpTop;
      let maxTop = Math.round(belowTopInOfp - gapBottom - ctaH);

      // If CTA needs to sit lower than maxTop but there’s no room,
      // push the positioned wrapper of the image (once-baselined)
      if (targetTop > maxTop && allowPush) {
        const pushTarget = positionedWrapperForImage(belowEl as HTMLElement);
        if (pushTarget) {
          if (!pushTarget.dataset.cfBaseTop) pushTarget.dataset.cfBaseTop = String(pushTarget.offsetTop);
          const pushBase = +pushTarget.dataset.cfBaseTop;
          const need = targetTop - maxTop; // pixels short of room
          pushTarget.style.setProperty('top', (pushBase + need) + 'px', 'important');

          // recompute the upper bound after the push
          const newBelowTop = (belowEl as HTMLElement).getBoundingClientRect().top - ofpTop;
          maxTop = Math.round(newBelowTop - gapBottom - ctaH);
        }
      }

      // Clamp CTA to available corridor
      targetTop = Math.min(targetTop, maxTop);
    }

    // Apply if changed (no drift)
    const prevShift = +cta.dataset.cfShift || 0;
    const newShift = targetTop - baseTop;
    if (Math.abs(newShift - prevShift) > 0.5) {
      cta.style.setProperty('top', (baseTop + newShift) + 'px', 'important');
      cta.dataset.cfShift = String(newShift);
    }
  }

  // Finds the positioned wrapper we can move for an inner <img>.
  // For Unbounce it’s typically the #lp-pom-image-### node, or any non-static ancestor.
  function positionedWrapperForImage(node: Element | null): HTMLElement | null {
    let cur = node as HTMLElement | null;
    for (let i = 0; i < 6 && cur; i++) {
      const cs = getComputedStyle(cur);
      if (/^lp-pom-image-/.test(cur.id) || cs.position !== 'static') return cur;
      cur = cur.parentElement as HTMLElement | null;
    }
    return null;
  }

  function buildBullets() {
    const texts = [
      'Clinically inspired memory support',
      'Nightly 5-minute routine',
      'Non-invasive, drug-free'
    ];
    const wrap = document.createElement('div');
    wrap.id = 'cf-bullets';
    texts.forEach(t => {
      const item = document.createElement('div');
      item.className = 'cf-bullet-item';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'cf-bullet-icon');
      svg.setAttribute('viewBox', '0 0 20 20');
      svg.setAttribute('fill', 'currentColor');
      svg.innerHTML = '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clip-rule="evenodd"/>';
      const span = document.createElement('span');
      span.textContent = t;
      item.append(svg, span);
      wrap.appendChild(item);
    });
    return wrap;
  }

  function relaxHeights(el) {
    let cur = el;
    for (let i = 0; i < 5 && cur; i++) {
      if (/^lp-pom-/.test(cur.id) || cur.classList.contains('lp-element') || cur.classList.contains('lp-pom-text')) {
        cur.style.setProperty('height', 'auto', 'important');
        cur.style.setProperty('overflow', 'visible', 'important');
      }
      cur = cur.parentElement;
    }
  }

  function findByText(needle, sel = '*', root = document) {
    const n = needle.toLowerCase().replace(/\s+/g, ' ').trim();
    const els = root.querySelectorAll(sel);
    let best = null, bestArea = Infinity;
    els.forEach(el => {
      const t = (el.textContent || '').toLowerCase().replace(/\s+/g, ' ').trim();
      if (t.includes(n) && isShown(el)) {
        const a = el.offsetWidth * el.offsetHeight;
        if (a && a < bestArea) { best = el; bestArea = a; }
      }
    });
    return best;
  }

  function isShown(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function closestBlock(el) {
    let cur = el;
    for (let i = 0; i < 20 && cur; i++) {
      if (cur.tagName === 'SECTION' || cur.classList?.contains('lp-pom-block') || cur.classList?.contains('lp-pom-box') || /^lp-pom-(block|box)/.test(cur.id)) {
        return cur;
      }
      cur = cur.parentElement;
    }
    return null;
  }

  function addStyles() {
    const css = `
      #cf-bullets{position:relative;z-index:5;display:flex;flex-direction:column;gap:10px;margin-bottom:16px;width:100%}
      .cf-bullet-item{display:flex;align-items:center;gap:10px;font-size:14px;line-height:1.4;color:#000}
      .cf-bullet-icon{flex-shrink:0;width:18px;height:18px;color:#4ade80}
      @media (min-width:601px){
        .cf-bullet-item{font-size:18px}
        .cf-bullet-icon{width:20px;height:20px}
      }
      [id^="lp-pom-text-"]{height:auto!important;overflow:visible!important}
    `;
    if (!document.querySelector('style[data-cf="bullets"]')) {
      const s = document.createElement('style');
      s.dataset.cf = 'bullets';
      s.textContent = css;
      document.head.appendChild(s);
    }
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  function init() {
    const cf = (window.CF = window.CF || { qaTesting: false, testsRunning: [] });
    if (cf.testsRunning.some(t => t.name === TEST_NAME)) return false;
    cf.testsRunning.push({ name: TEST_NAME });
    document.body.setAttribute('cf-test-active', TEST_NAME);
    return true;
  }
})();