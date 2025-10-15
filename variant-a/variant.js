// Replace placeholder with Ramp hero headline variant
// Test Name: Hero headline copy update – "Spend Smarter. Run Smoother."

// Minimal utility: wait for condition via MutationObserver, then run once
function monitorChangesByConditionAndRun(predicate: () => boolean, run: () => void, options?: { timeoutMs?: number }) {
  const timeoutMs = options?.timeoutMs ?? 15000;
  const start = Date.now();

  const tryRun = () => {
    try {
      if (predicate()) {
        run();
        return true;
      }
    } catch (err) {
      console.error('Predicate error', err);
    }
    return false;
  };

  if (tryRun()) return;

  const observer = new MutationObserver(() => {
    if (Date.now() - start > timeoutMs) {
      observer.disconnect();
      console.error('Variant timeout: required elements not found in time');
      return;
    }
    tryRun() && observer.disconnect();
  });

  observer.observe(document.documentElement || document.body, {
    subtree: true,
    childList: true,
  });
}

function applyHeroHeadlineUpdate() {
  const h1 = document.querySelector<HTMLHeadingElement>('#hero-section h1.headline-xl');
  if (!h1) throw new Error('Hero H1 not found');

  // Idempotency guard: avoid reapplying if already set
  const targetHTML = 'Spend Smarter.<br>Run Smoother.';
  const normalized = (h1.innerHTML || '').replace(/\s+/g, ' ').trim();
  const targetNormalized = targetHTML.replace(/\s+/g, ' ').trim();

  // Add a small responsive enhancement: balanced wrapping
  if (!h1.classList.contains('cf:text-balance')) {
    h1.classList.add('cf:text-balance');
  }

  if (normalized === targetNormalized) {
    // Already applied; just emit rendered
    window.CFQ = (window as any).CFQ || [];
    (window as any).CFQ.push({ emit: 'variantRendered' });
    return;
  }

  // Use JSX to build new content and replace children
  const fragment = (
    <>
      {'Spend Smarter.'}
      <br />
      {'Run Smoother.'}
    </>
  );

  // Clear and inject
  h1.replaceChildren(fragment as unknown as Node);

  // Notify Coframe only after success
  window.CFQ = (window as any).CFQ || [];
  (window as any).CFQ.push({ emit: 'variantRendered' });
}

try {
  monitorChangesByConditionAndRun(
    () => !!document.querySelector('#hero-section h1.headline-xl'),
    applyHeroHeadlineUpdate,
    { timeoutMs: 20000 }
  );
} catch (e) {
  console.error('Variant failed to initialize', e);
}