console.log('Coframe Variant: Home – Snap‑Match Demo');

// ===== DATA =====
const receipt = { id: 'r1', merchant: 'Lyft', amount: 'AED 73.20', date: 'Sep 24' };
const rows = [
  { id: 't1', merchant: 'Figma', amount: 'AED 147.00' },
  { id: 't2', merchant: 'Lyft', amount: 'AED 73.20' },
  { id: 't3', merchant: 'Notion', amount: 'AED 44.00' }
];

// ===== HELPERS =====
function monitorChangesByConditionAndRun(check: () => boolean, code: () => void) {
  let checkAndRun = () => check() && (observer.disconnect(), code());
  const observer = new MutationObserver(checkAndRun);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  checkAndRun();
  setTimeout(() => {
    observer.disconnect();
    if (!check()) console.warn('Coframe: MutationObserver timed out after 10s');
  }, 10000);
}

function addStyling() {
  if (document.getElementById('cf-sm-styles')) return;
  const style = document.createElement('style');
  style.id = 'cf-sm-styles';
  style.textContent = `
    :root {
      --cf-accent:#E4F222;
      --cf-ink: rgba(0,0,0,0.9);
      --cf-muted: rgba(0,0,0,0.6);
    }

    /* Shimmer */
    @keyframes cf-sm-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    .cf-sm-shimmer {
      background: linear-gradient(90deg,#e5e7eb 20%,#f4f4f5 40%,#e5e7eb 60%);
      background-size:200% 100%;
      animation: cf-sm-shimmer 1.2s linear infinite;
    }

    /* Snap + glow */
    .cf-sm-row-glow {
      box-shadow: 0 0 0 2px rgba(22,163,74,.28), 0 0 0 6px rgba(22,163,74,.12);
      transition: box-shadow 200ms ease;
    }
    .cf-sm-snap { transition: transform 200ms cubic-bezier(.2,.8,.2,1); will-change: transform; }

    /* Hints */
    @keyframes cf-sm-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
    .cf-sm-pulse { animation: cf-sm-pulse 1300ms ease-in-out infinite; }
    @keyframes cf-sm-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    .cf-sm-bounce { animation: cf-sm-bounce 1400ms ease-in-out infinite; }

    /* Instruction overlay */
    #cf-sm-instructions {
      position:absolute; inset:auto 12px 12px 12px; pointer-events:none;
    }
    #cf-sm-instructions .cf-sm-card {
      display:inline-flex; align-items:center; gap:.5rem;
      background:#fff; border:1px solid rgba(0,0,0,.08);
      color:var(--cf-ink); border-radius:12px; padding:.5rem .75rem;
      box-shadow:0 6px 16px rgba(0,0,0,.06);
    }
    #cf-sm-arrow {
      width:24px; height:24px; border-right:2px solid var(--cf-ink); border-bottom:2px solid var(--cf-ink);
      transform:rotate(-45deg); opacity:.5;
    }

    /* Mobile layout guards */
    @media (max-width: 767px) {
      #cf-sm-stage { min-height: 520px; padding-bottom: 72px; }
      #cf-sm-receipt { width: 68vw; left: 50% !important; transform: translate3d(-50%,0,0); }
      #cf-sm-row-target { border-width:2px; }
      #cf-sm-mobile-cta {
        position:absolute; left:12px; right:12px; bottom:12px;
        display:flex; align-items:center; justify-content:center;
        background:var(--cf-accent); border-radius:12px; height:48px;
        font-weight:600; color:#000;
      }
      /* Never show any pills or shimmer on mobile */
      #cf-sm-pills { display: none !important; }
      #cf-sm-shimmer-bar { display: none !important; }
      /* If you keep a dedicated class for the "Receipt ✓" pill, hide that too */
      .cf-sm-pill-receipt { display: none !important; }
    }

    @media (prefers-reduced-motion: reduce) {
      .cf-sm-snap { transition: none !important; }
      .cf-sm-shimmer { animation: none !important; }
      .cf-sm-pulse, .cf-sm-bounce { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

// ===== JSX COMPONENTS =====
function TransactionRow({ id, merchant, amount, isTarget }: any) {
  const baseClass = 'cf:flex cf:items-center cf:justify-between cf:rounded-xl cf:border cf:border-[rgba(0,0,0,0.12)] cf:bg-white cf:px-4 cf:py-3';

  return (
    <div id={id} className={baseClass}>
      <div className="cf:flex cf:items-center cf:gap-3">
        <div className="cf:size-10 cf:rounded-full cf:bg-[#f4f4f5] cf:flex cf:items-center cf:justify-center">
          <span className="cf:text-xs cf:font-medium">{merchant[0]}</span>
        </div>
        <div>
          <div className="cf:text-sm cf:font-medium cf:text-[rgba(0,0,0,0.9)]">{merchant}</div>
          <div className="cf:text-xs cf:text-[rgba(0,0,0,0.6)]">Pending</div>
        </div>
      </div>
      <div className="cf:flex cf:items-center cf:gap-2">
        <span className="cf:text-sm cf:font-medium">{amount}</span>
        {isTarget && (
          <>
            <div id="cf-sm-shimmer-bar" className="cf:hidden cf:h-2 cf:w-24 cf:rounded cf-sm-shimmer"></div>
            <div id="cf-sm-pills" className="cf:hidden cf:items-center cf:gap-2">
              <span className="cf:inline-flex cf:items-center cf:rounded-full cf:bg-[#f4f4f5] cf:px-2 cf:py-1 cf:text-xs cf:text-[rgba(0,0,0,0.7)]">Travel</span>
              <span className="cf:inline-flex cf:items-center cf:rounded-full cf:bg-[#f4f4f5] cf:px-2 cf:py-1 cf:text-xs cf:text-[rgba(0,0,0,0.7)]">Airport run</span>
              <span className="cf-sm-pill-receipt cf:inline-flex cf:items-center cf:rounded-full cf:bg-[#f4f4f5] cf:px-2 cf:py-1 cf:text-xs cf:text-[rgba(0,0,0,0.7)]">
                Receipt ✓
              </span>
            </div>
            <span id="cf-sm-check" className="cf:hidden cf:ml-2 cf:inline-flex cf:items-center cf:justify-center cf:size-6 cf:rounded-full cf:bg-[#16a34a] cf:text-white cf:text-xs" aria-hidden="true">✓</span>
          </>
        )}
      </div>
    </div>
  );
}

function ReceiptCard() {
  return (
    <div id="cf-sm-receipt" role="img" aria-label="Receipt card" className="cf:absolute cf:left-4 cf:top-4 cf:w-60 cf:cursor-grab cf:touch-none cf:select-none cf:rounded-2xl cf:border cf:border-[rgba(0,0,0,0.12)] cf:bg-white cf:p-4 cf:shadow-sm">
      <div className="cf:mb-3 cf:text-xs cf:font-medium cf:text-[rgba(0,0,0,0.6)]">Receipt</div>
      <div className="cf:mb-2 cf:text-base cf:font-medium">{receipt.merchant}</div>
      <div className="cf:mb-3 cf:text-sm cf:text-[rgba(0,0,0,0.6)]">{receipt.date}</div>
      <div className="cf:mb-3 cf:text-xl cf:font-medium">{receipt.amount}</div>
      <div className="cf:h-24 cf:rounded-lg cf:bg-[#f4f4f5]"></div>
    </div>
  );
}

function InstructionHint() {
  return (
    <div id="cf-sm-instructions">
      <div className="cf-sm-card cf-sm-pulse">
        <span className="cf:inline-block cf:rounded-full cf:bg-[rgba(0,0,0,0.06)] cf:px-2 cf:py-0.5 cf:text-xs">Try it</span>
        <span className="cf:text-sm">Drag the receipt onto <strong>Lyft</strong></span>
        <span id="cf-sm-arrow" className="cf-sm-bounce" aria-hidden="true"></span>
      </div>
    </div>
  );
}

function SnapMatchSection() {
  return (
    <section id="cf-snapmatch" aria-labelledby="snapmatch-h" className="cf:bg-white cf:py-16">
      <div className="cf:mx-auto cf:max-w-screen-2xl cf:px-4 cf:md:px-8 cf:lg:px-12 cf:xl:px-16">
        <div className="cf:grid cf:grid-cols-1 cf:lg:grid-cols-12 cf:gap-10">
          <div className="cf:order-1 cf:lg:order-1 cf:lg:col-span-5">
            <h2 id="snapmatch-h" className="cf:text-4xl cf:font-normal cf:leading-tight cf:tracking-tight cf:text-[rgba(0,0,0,0.9)] cf:mb-4">
              Snap‑Match a receipt in seconds
            </h2>
            <p className="cf:text-base cf:text-[rgba(0,0,0,0.6)] cf:mb-6">
              Drag the receipt onto a transaction—or tap <strong>Match automatically</strong> on mobile—to see auto-coding in action.
            </p>
            <button
              id="cf-sm-auto-btn"
              className="cf:hidden cf:md:inline-flex cf:items-center cf:justify-center cf:rounded-md cf:bg-[var(--cf-accent)] cf:px-4 cf:py-3 cf:text-sm cf:font-medium cf:text-black cf:transition cf:duration-200 cf:hover:bg-[#d4e212] cf:focus:ring-2 cf:focus:ring-[var(--cf-accent)] cf:focus:ring-offset-2 cf:outline-none"
            >
              Match automatically
            </button>
            <button id="cf-sm-reset" className="cf:hidden cf:md:inline-block cf:mt-3 cf:text-sm cf:text-[rgba(0,0,0,0.6)] cf:underline">
              Try again
            </button>
            <div id="cf-sm-live" aria-live="polite" className="cf:sr-only"></div>
          </div>
          <div id="cf-sm-stage-wrap" className="cf:order-2 cf:lg:order-2 cf:lg:col-span-7 cf:lg:sticky cf:lg:top-[96px]">
            <div id="cf-sm-stage" className="cf:relative cf:rounded-2xl cf:border cf:border-[rgba(0,0,0,0.1)] cf:bg-white cf:p-4 cf:shadow-none cf:overflow-hidden cf:min-h-[400px]">
              <div id="cf-sm-list" className="cf:flex cf:flex-col cf:gap-3">
                <TransactionRow id="cf-sm-row-t1" merchant={rows[0].merchant} amount={rows[0].amount} isTarget={false} />
                <TransactionRow id="cf-sm-row-target" merchant={rows[1].merchant} amount={rows[1].amount} isTarget={true} />
                <TransactionRow id="cf-sm-row-t3" merchant={rows[2].merchant} amount={rows[2].amount} isTarget={false} />
              </div>
              <ReceiptCard />
              <InstructionHint />
              <button id="cf-sm-mobile-cta" className="cf:flex md:cf:hidden">Tap to match</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== STATE MACHINE =====
let phase: 'idle' | 'dragging' | 'dropped' | 'processing' | 'matched' | 'resetting' = 'idle';
let receiptEl: HTMLElement | null = null;
let targetRowEl: HTMLElement | null = null;
let shimmerEl: HTMLElement | null = null;
let pillsEl: HTMLElement | null = null;
let checkEl: HTMLElement | null = null;
let liveEl: HTMLElement | null = null;
let stageEl: HTMLElement | null = null;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setPhase(next: typeof phase) {
  phase = next;
}

function announce(msg: string) {
  if (liveEl) liveEl.textContent = msg;
}

function rectIntersects(r1: DOMRect, r2: DOMRect): boolean {
  return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

function resetToIdle() {
  setPhase('idle');
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  if (receiptEl) {
    receiptEl.style.display = '';
    receiptEl.style.transform = mobile ? 'translate3d(-50%,0,0)' : 'translate3d(0,0,0)';
    receiptEl.classList.remove('cf-sm-snap');
  }
  if (targetRowEl) {
    targetRowEl.classList.remove('cf:ring', 'cf:ring-[var(--cf-accent)]', 'cf:ring-offset-0', 'cf:scale-[1.01]', 'cf-sm-row-glow');
  }
  if (shimmerEl) shimmerEl.classList.add('cf:hidden');
  if (pillsEl) pillsEl.classList.add('cf:hidden');
  if (checkEl) checkEl.classList.add('cf:hidden');
  const hint = document.getElementById('cf-sm-instructions');
  if (hint) hint.style.display = 'block';
  currentX = 0; currentY = 0;
  announce('');
}

function onDropSuccess() {
  if (!receiptEl || !targetRowEl) return;
  const hint = document.getElementById('cf-sm-instructions');
  if (hint) hint.style.display = 'none';

  const mobile = window.matchMedia('(max-width: 767px)').matches;
  // Mobile: show ONLY green tick in Lyft box, hide receipt, no tags/pills, no shimmer
  if (mobile) {
    setPhase('processing');
    // Ensure shimmer and pills remain hidden
    if (shimmerEl) shimmerEl.classList.add('cf:hidden');
    if (pillsEl) {
      pillsEl.classList.add('cf:hidden');
      pillsEl.classList.remove('cf:flex');
    }
    // Hide the draggable receipt card on mobile during match
    receiptEl.style.display = 'none';
    // Reveal only the green check icon
    if (checkEl) checkEl.classList.remove('cf:hidden');
    announce('Receipt matched to Lyft.');

    // Briefly show the check then reset
    setTimeout(() => {
      setPhase('resetting');
      if (checkEl) checkEl.classList.add('cf:hidden');
      // Restore receipt visibility in reset
      resetToIdle();
    }, 1500);
    return;
  }

  setPhase('dropped');

  const receiptRect = receiptEl.getBoundingClientRect();
  const targetRect = targetRowEl.getBoundingClientRect();
  const dx = targetRect.left - receiptRect.left + 8;
  const dy = targetRect.top - receiptRect.top + 8;

  receiptEl.classList.add('cf-sm-snap');
  receiptEl.style.transform = `translate3d(${currentX + dx}px, ${currentY + dy}px, 0)`;

  setTimeout(() => {
    setPhase('processing');
    if (targetRowEl) {
      targetRowEl.classList.add('cf:ring', 'cf:ring-[var(--cf-accent)]', 'cf:ring-offset-0', 'cf:scale-[1.01]');
    }
    if (shimmerEl) shimmerEl.classList.remove('cf:hidden');
    announce('Matching receipt to transaction…');

    setTimeout(() => {
      setPhase('matched');
      if (shimmerEl) shimmerEl.classList.add('cf:hidden');
      if (pillsEl) {
        pillsEl.classList.remove('cf:hidden');
        pillsEl.classList.add('cf:flex');
      }
      if (checkEl) checkEl.classList.remove('cf:hidden');
      if (targetRowEl) targetRowEl.classList.add('cf-sm-row-glow');
      announce('Receipt matched to Lyft, Travel, receipt attached.');

      setTimeout(() => {
        setPhase('resetting');
        if (targetRowEl) targetRowEl.classList.remove('cf-sm-row-glow');
        if (pillsEl) {
          pillsEl.classList.add('cf:hidden');
          pillsEl.classList.remove('cf:flex');
        }
        if (checkEl) checkEl.classList.add('cf:hidden');
        setTimeout(resetToIdle, 300);
      }, 2000);
    }, reducedMotion ? 150 : 1200);
  }, reducedMotion ? 50 : 200);
}

function initInteractions() {
  receiptEl = document.getElementById('cf-sm-receipt');
  targetRowEl = document.getElementById('cf-sm-row-target');
  shimmerEl = document.getElementById('cf-sm-shimmer-bar');
  pillsEl = document.getElementById('cf-sm-pills');
  checkEl = document.getElementById('cf-sm-check');
  liveEl = document.getElementById('cf-sm-live');
  stageEl = document.getElementById('cf-sm-stage');
  const autoBtn = document.getElementById('cf-sm-auto-btn');
  const resetBtn = document.getElementById('cf-sm-reset');
  const mobileCta = document.getElementById('cf-sm-mobile-cta');

  if (!receiptEl || !targetRowEl || !stageEl) {
    console.error('Coframe: Required elements not found for Snap-Match');
    return;
  }

  // Center receipt on mobile baseline
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  receiptEl.style.transform = mobile ? 'translate3d(-50%,0,0)' : 'translate3d(0,0,0)';

  // Drag path (disabled on mobile)
  receiptEl.addEventListener('pointerdown', (e: PointerEvent) => {
    if (phase !== 'idle') return;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    if (mobile) return;
    setPhase('dragging');
    receiptEl!.setPointerCapture(e.pointerId);
    startX = e.clientX; startY = e.clientY;
    targetRowEl!.classList.add('cf:ring', 'cf:ring-[var(--cf-accent)]', 'cf:ring-offset-0', 'cf:scale-[1.01]');
  });

  receiptEl.addEventListener('pointermove', (e: PointerEvent) => {
    if (phase !== 'dragging') return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    currentX = dx; currentY = dy;
    receiptEl!.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  });

  receiptEl.addEventListener('pointerup', (e: PointerEvent) => {
    if (phase !== 'dragging') return;
    receiptEl!.releasePointerCapture(e.pointerId);
    const recRect = receiptEl!.getBoundingClientRect();
    const tgtRect = targetRowEl!.getBoundingClientRect();
    rectIntersects(recRect, tgtRect) ? onDropSuccess() : resetToIdle();
  });

  // Tap-to-match path
  const trigger = () => { if (phase === 'idle') onDropSuccess(); };
  autoBtn?.addEventListener('click', trigger);
  mobileCta?.addEventListener('click', trigger);
  const mobileForTap = window.matchMedia('(max-width: 767px)').matches;
  if (mobileForTap) targetRowEl.addEventListener('click', trigger);

  resetBtn?.addEventListener('click', resetToIdle);
}

// ===== MAIN RENDER =====
function checkForElements(): boolean {
  try {
    const alreadyExists = !!document.getElementById('cf-snapmatch');
    const headingFound = Array.from(document.querySelectorAll('h2')).some(h => {
      const t = h.textContent || '';
      const norm = t.replace(/[’']/g, "'");
      return norm.includes("Here's what you can get done with Ramp in just 30 days");
    });
    return !alreadyExists && headingFound;
  } catch (e) {
    console.error('Coframe: Check error', e);
    return false;
  }
}

function onElementsFound() {
  try {
    console.log('Coframe: Running Snap-Match variant');

    const headings = Array.from(document.querySelectorAll('h2'));
    const targetH2 = headings.find(h => {
      const t = h.textContent || '';
      const norm = t.replace(/[’']/g, "'");
      return norm.includes("Here's what you can get done with Ramp in just 30 days");
    });

    if (!targetH2) {
      console.error('Coframe: Target H2 not found');
      return;
    }

    const targetSection = targetH2.closest('section');
    if (!targetSection) {
      console.error('Coframe: Target section not found');
      return;
    }

    if (document.getElementById('cf-snapmatch')) {
      console.log('Coframe: Snap-Match already exists');
      return;
    }

    addStyling();
    const snapMatchEl = <SnapMatchSection />;
    targetSection.insertAdjacentElement('afterend', snapMatchEl);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          initInteractions();
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });

    const snapMatch = document.getElementById('cf-snapmatch');
    if (snapMatch) observer.observe(snapMatch);

    window.CFQ = (window as any).CFQ || [];
    window.CFQ.push({ emit: 'variantRendered' });
    console.log('Coframe: Snap-Match variant rendered successfully');
  } catch (e) {
    console.error('Coframe: Error rendering Snap-Match variant', e);
  }
}

// ===== INIT =====
monitorChangesByConditionAndRun(checkForElements, onElementsFound);