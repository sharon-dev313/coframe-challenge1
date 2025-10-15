// Variant: Ramp homepage hero revamp with ROI micro-calculator and dual CTAs (TSX, no React)

// Debug banner
console.log('[CF Variant] Ramp hero revamp starting...');

declare global {
  interface Window {
    CFQ: Array<any>;
  }
}

// Utility: wait until predicate is true, then run once. Falls back to timeout guard
function monitorChangesByConditionAndRun(predicate: () => boolean, run: () => void, timeoutMs = 10000) {
  try {
    if (predicate()) {
      run();
      return;
    }
    const observer = new MutationObserver(() => {
      if (predicate()) {
        observer.disconnect();
        run();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // Safety timeout
    setTimeout(() => observer.disconnect(), timeoutMs);
  } catch (err) {
    console.error('[CF Variant] monitor error', err);
  }
}

// Currency formatter
function formatCurrency(amount: number, currency = 'USD', locale = (navigator.language || 'en-US')): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(isFinite(amount) ? amount : 0);
  } catch {
    // Fallback
    const rounded = Math.round(amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${rounded}`;
  }
}

// JSX components (stateless)
function NumberField({ id, label, defaultValue, min = 0, step = 1 }: { id: string; label: string; defaultValue: number; min?: number; step?: number; }) {
  return (
    <div className="cf:flex cf:flex-col cf:gap-2">
      <label for={id} className="cf:text-sm cf:font-medium cf:text-white">{label}</label>
      <input id={id} name={id} type="number" inputMode="numeric" min={min} step={step} value={defaultValue} className="cf:h-[43px] cf:rounded-[6px] cf:border cf:border-white/30 cf:bg-white/5 cf:px-4 cf:text-[15px] cf:text-white cf:placeholder-white/60 cf:focus:border-white/60 cf:focus:outline-0" />
    </div>
  );
}

function PolicyChip() {
  // Static markup; animation handled post-mount via JS
  return (
    <div id="cf-policy-chip" className="cf:flex cf:items-center cf:gap-2 cf:rounded-md cf:border cf:border-white/20 cf:bg-white/10 cf:px-3 cf:py-2 cf:text-sm cf:text-white cf:transition-colors cf:duration-500" aria-live="polite">
      <span className="cf:inline-block cf:size-2 cf:rounded-full cf:bg-red-500" aria-hidden="true"></span>
      <span>
        Policy enforcement: <strong id="cf-policy-state" className="cf:font-medium">Blocked</strong>
      </span>
    </div>
  );
}

function EmailCTA() {
  return (
    <form id="cf-hero-email-form" data-qa="hero-email" className="cf:flex cf:flex-col cf:md:flex-row cf:gap-3" aria-describedby="cf-privacy-hint">
      <div className="cf:flex-1">
        <label for="cf-hero-email" className="cf:sr-only">Work email</label>
        <input id="cf-hero-email" type="email" placeholder="What’s your work email?" className="cf:h-[43px] cf:w-full cf:rounded-[6px] cf:border cf:border-white/30 cf:bg-white/5 cf:px-4 cf:text-[15px] cf:text-white cf:placeholder-white/60 cf:focus:border-white/60 cf:focus:outline-0" />
      </div>
      <button type="submit" data-qa="cta-start" className="cf:h-[43px] cf:rounded-md cf:bg-emerald-500 cf:px-4 cf:text-[15px] cf:font-medium cf:text-white cf:hover:bg-emerald-400 cf:transition-colors cf:duration-300">Get started for free</button>
      <p id="cf-privacy-hint" className="cf:sr-only">Submitting will take you to signup and may prefill your email.</p>
    </form>
  );
}

function RoiPanel() {
  return (
    <div className="cf:flex cf:flex-col cf:gap-4">
      <div className="cf:grid cf:grid-cols-1 cf:md:grid-cols-4 cf:gap-4">
        <NumberField id="cf-team-size" label="Team size" defaultValue={25} min={1} />
        <NumberField id="cf-monthly-bills" label="Bills per month" defaultValue={600} min={0} />
        <NumberField id="cf-hourly-cost" label="Hourly cost ($)" defaultValue={120} min={0} />
        <NumberField id="cf-mins-per-bill" label="Mins saved/bill" defaultValue={7} min={0} />
      </div>
      <div className="cf:grid cf:grid-cols-1 cf:md:grid-cols-2 cf:gap-4 cf:rounded-xl cf:border cf:border-white/10 cf:bg-white/5 cf:p-4">
        <div className="cf:flex cf:flex-col cf:items-center cf:gap-2">
          <span className="cf:text-sm cf:text-white/70">Estimated annual savings</span>
          <span id="cf-roi-annual" data-qa="roi-annual" className="cf:text-2xl cf:font-semibold cf:text-white cf:tabular-nums" aria-live="polite">$0</span>
        </div>
        <div className="cf:flex cf:flex-col cf:items-center cf:gap-2">
          <span className="cf:text-sm cf:text-white/70">Time saved per month</span>
          <span id="cf-roi-hours" className="cf:text-2xl cf:font-semibold cf:text-white cf:tabular-nums" aria-live="polite">0 hrs</span>
        </div>
      </div>
      <div className="cf:flex cf:flex-col cf:md:flex-row cf:gap-3">
        <button type="button" id="cf-estimate-btn" data-qa="cta-estimate" className="cf:flex-1 cf:h-[43px] cf:rounded-md cf:border cf:border-white/30 cf:bg-white/5 cf:px-4 cf:text-[15px] cf:font-medium cf:text-white cf:hover:bg-white/10 cf:transition-colors cf:duration-300">
          Estimate my savings
        </button>
        <PolicyChip />
      </div>
    </div>
  );
}

function TrustStrip() {
  return (
    <ul className="cf:mb-2 cf:flex cf:flex-wrap cf:items-center cf:gap-x-4 cf:gap-y-1 cf:text-white/70 cf:text-sm">
      <li>45,000+ finance teams</li>
      <li className="cf:text-white/70">•</li>
      <li>Global reimbursements in ~2 days</li>
      <li className="cf:text-white/70">•</li>
      <li>AI-powered spend controls</li>
    </ul>
  );
}

function HeroPanel() {
  return (
    <div id="cf-hero-variant" className="cf:relative cf:z-[2] cf:mt-6 cf:md:mt-8 cf:w-full cf:max-w-[640px] cf:lg:max-w-[520px] cf:xl:max-w-[560px] cf:lg:mr-10 cf:xl:mr-16 cf:rounded-xl cf:border cf:border-white/20 cf:bg-black/40 cf:text-white cf:p-4 cf:backdrop-blur-sm">
      <TrustStrip />
      <EmailCTA />
      <div className="cf:mt-4">
        <RoiPanel />
      </div>
      <p id="cf-privacy-terms" className="cf:mt-3 cf:text-xs cf:text-center cf:text-white/70">
        By submitting, you agree to our
        {' '}
        <a href="/legal/platform-agreement" className="cf:underline cf:hover:text-white">Terms</a>
        {' '}and{' '}
        <a href="/legal/privacy-policy" className="cf:underline cf:hover:text-white">Privacy Policy</a>
      </p>
    </div>
  );
}

// New: Footer components
function FooterCol({ title, links }: { title: string; links: Array<{ label: string; href: string }>; }) {
  return (
    <div className="cf:flex cf:flex-col cf:gap-3">
      <h3 className="cf:text-sm cf:font-semibold cf:text-white">{title}</h3>
      <ul className="cf:flex cf:flex-col cf:gap-2">
        {links.map((l) => (
          <li>
            <a href={l.href} className="cf:text-sm cf:text-white/70 cf:hover:text-white cf:transition-colors">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLegal() {
  const year = new Date().getFullYear();
  return (
    <div className="cf:flex cf:flex-col cf:items-start cf:justify-between cf:gap-3 cf:md:flex-row cf:md:items-center">
      <p className="cf:text-xs cf:text-white/60">© {year} Ramp. All rights reserved.</p>
      <div className="cf:flex cf:flex-wrap cf:items-center cf:gap-4">
        <a href="/legal/privacy-policy" className="cf:text-xs cf:text-white/70 cf:hover:text-white">Privacy</a>
        <a href="/legal/platform-agreement" className="cf:text-xs cf:text-white/70 cf:hover:text-white">Terms</a>
        <a href="/security" className="cf:text-xs cf:text-white/70 cf:hover:text-white">Security</a>
        <a href="/contact" className="cf:text-xs cf:text-white/70 cf:hover:text-white">Contact</a>
      </div>
    </div>
  );
}

function FooterPanel() {
  return (
    <div id="cf-footer-variant" className="cf:relative cf:rounded-t-xl cf:border-t cf:border-white/10 cf:bg-black cf:px-4 cf:py-10 cf:text-white cf:md:px-6 cf:lg:px-8">
      <div className="cf:mx-auto cf:max-w-[1200px] cf:flex cf:flex-col cf:gap-10">
        <div className="cf:grid cf:grid-cols-2 cf:gap-8 cf:md:grid-cols-4">
          <FooterCol
            title="Platform"
            links={[
              { label: 'Cards', href: '/cards' },
              { label: 'Bill Pay', href: '/bill-pay' },
              { label: 'Travel', href: '/travel' },
              { label: 'Reimbursements', href: '/reimbursements' },
            ]}
          />
          <FooterCol
            title="Solutions"
            links={[
              { label: 'Startups', href: '/solutions/startups' },
              { label: 'Mid-market', href: '/solutions/mid-market' },
              { label: 'Enterprise', href: '/solutions/enterprise' },
              { label: 'Procurement', href: '/procurement' },
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              { label: 'Pricing', href: '/pricing' },
              { label: 'Security', href: '/security' },
              { label: 'Blog', href: '/blog' },
              { label: 'Support', href: '/support' },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: 'About', href: '/about' },
              { label: 'Careers', href: '/careers' },
              { label: 'Press', href: '/press' },
              { label: 'Contact', href: '/contact' },
            ]}
          />
        </div>
        <div className="cf:flex cf:flex-col cf:gap-6">
          <div className="cf:h-px cf:w-full cf:bg-white/10" />
          <FooterLegal />
        </div>
      </div>
    </div>
  );
}

// New: Get to know Ramp components
function GtkTab({ index, label, selected = false }: { index: number; label: string; selected?: boolean; }) {
  return (
    <button
      role="tab"
      aria-selected={selected ? 'true' : 'false'}
      data-index={index}
      className={`cf:rounded-full cf:border cf:px-3 cf:py-1.5 cf:text-sm cf:transition-colors ${selected ? 'cf:border-white/30 cf:bg-white/20 cf:text-white' : 'cf:border-white/10 cf:bg-white/5 cf:text-white/80 cf:hover:bg-white/10'}`}
    >
      {label}
    </button>
  );
}

function GtkCard({ title, body }: { title: string; body: string; }) {
  return (
    <div className="cf:rounded-lg cf:border cf:border-white/10 cf:bg-white/5 cf:p-4">
      <h4 className="cf:text-base cf:font-semibold cf:text-white">{title}</h4>
      <p className="cf:mt-1 cf:text-sm cf:text-white/70">{body}</p>
    </div>
  );
}

function GetToKnowPanel() {
  return (
    <section id="cf-gtk-variant" className="cf:relative cf:rounded-xl cf:border cf:border-white/10 cf:bg-black cf:px-4 cf:py-10 cf:text-white cf:md:px-6 cf:lg:px-8">
      <div className="cf:mx-auto cf:max-w-[1200px]">
        <div className="cf:flex cf:flex-col cf:gap-3">
          <h2 className="cf:text-2xl cf:font-semibold">Get to know Ramp</h2>
          <p className="cf:text-white/70">Explore how teams use Ramp to control spend, automate close, and reimburse globally.</p>
        </div>
        <div className="cf:mt-6 cf:flex cf:flex-wrap cf:gap-2" role="tablist" aria-label="Get to know Ramp tabs">
          <GtkTab index={0} label="Overview" selected={true} />
          <GtkTab index={1} label="Customers" />
          <GtkTab index={2} label="Product tour" />
          <GtkTab index={3} label="Integrations" />
        </div>
        <div className="cf:mt-6 cf:grid cf:grid-cols-1 cf:gap-4 cf:md:grid-cols-3">
          <div id="cf-gtk-panel-0" role="tabpanel">
            <GtkCard title="Close 8x faster" body="Automate receipts, coding, and approvals end-to-end." />
            <div className="cf:mt-4">
              <GtkCard title="Save 3.5%+" body="Real-time controls and insights reduce waste before it happens." />
            </div>
          </div>
          <div id="cf-gtk-panel-1" role="tabpanel" hidden>
            <GtkCard title="45,000+ teams" body="Loved by finance teams from startups to enterprise." />
            <div className="cf:mt-4">
              <GtkCard title="Global scale" body="Multi-entity, multi-currency, reimburse in ~2 days." />
            </div>
          </div>
          <div id="cf-gtk-panel-2" role="tabpanel" hidden>
            <GtkCard title="2‑minute tour" body="See cards, Bill Pay, and reimbursements in a single flow." />
            <div className="cf:mt-4">
              <GtkCard title="AI controls" body="Smart policies prevent out-of-policy spend automatically." />
            </div>
          </div>
          <div id="cf-gtk-panel-3" role="tabpanel" hidden>
            <GtkCard title="ERP-ready" body="Works with NetSuite, QuickBooks, Sage Intacct, and more." />
            <div className="cf:mt-4">
              <GtkCard title="Open platform" body="Flexible APIs to fit your workflows and data stack." />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function addStyling() {
  // Inject minimal helper CSS to hide duplicate native email CTAs (existing non-variant elements)
  try {
    const existing = document.getElementById('cf-hero-variant-css') as HTMLStyleElement | null;
    if (existing) {
      if (!existing.textContent?.includes('.cf-hide-default-footer')) {
        existing.textContent += `\n.cf-hide-default-footer{display:none !important;}`;
      }
      if (!existing.textContent?.includes('.cf-hide-gtk')) {
        existing.textContent += `\n.cf-hide-gtk{display:none !important;}`;
      }
      return;
    }
    const style = document.createElement('style');
    style.id = 'cf-hero-variant-css';
    style.textContent = `.cf-hide-default-cta{display:none !important;}\n.cf-hide-default-footer{display:none !important;}\n.cf-hide-gtk{display:none !important;}`;
    document.head.appendChild(style);
  } catch (e) {
    console.error('[CF Variant] styling error', e);
  }
}

// Hide duplicate native email CTAs that overlap our panel
function hideDuplicateEmailCTAs(root: Element) {
  try {
    const candidates = Array.from(document.querySelectorAll(
      'input[placeholder*="work email"]'
    ));
    candidates.forEach((inp) => {
      if (root.contains(inp)) return; // keep ours
      let wrap: HTMLElement | null = inp as HTMLElement;
      // Climb a few levels to hide the sticky/banner container only
      for (let i = 0; i < 4 && wrap && wrap.parentElement; i++) wrap = wrap.parentElement as HTMLElement;
      if (wrap && !wrap.classList.contains('cf-hide-default-cta')) {
        wrap.classList.add('cf-hide-default-cta');
      }
    });
  } catch (e) {
    console.error('[CF Variant] hideDuplicateEmailCTAs error', e);
  }
}

// New: Hide original footer contents to avoid duplication
function hideDefaultFooterContent(footer: HTMLElement) {
  try {
    const children = Array.from(footer.children) as HTMLElement[];
    children.forEach((el) => {
      if (el.id !== 'cf-footer-variant') {
        el.classList.add('cf-hide-default-footer');
      }
    });
  } catch (e) {
    console.error('[CF Variant] hideDefaultFooterContent error', e);
  }
}

// New: Hide default "Get to know Ramp" content
function hideDefaultGetToKnowContent(sectionEl: HTMLElement) {
  try {
    const kids = Array.from(sectionEl.children) as HTMLElement[];
    kids.forEach((el) => {
      if (el.id !== 'cf-gtk-variant') el.classList.add('cf-hide-gtk');
    });
  } catch (e) {
    console.error('[CF Variant] hideDefaultGetToKnowContent error', e);
  }
}

// New: Find the "Get to know Ramp" section heuristically
function findGetToKnowSection(): HTMLElement | null {
  try {
    const containers = Array.from(document.querySelectorAll('section, div, article')) as HTMLElement[];
    for (const el of containers) {
      const heading = el.querySelector('h2, h3, h4');
      if (heading && heading.textContent && heading.textContent.toLowerCase().includes('get to know ramp')) {
        return el;
      }
    }
    return null;
  } catch (e) {
    console.error('[CF Variant] findGetToKnowSection error', e);
    return null;
  }
}

// New: Wire tab interactions
function wireGetToKnowTabs() {
  const root = document.getElementById('cf-gtk-variant');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
  const panels = [0,1,2,3].map(i => document.getElementById(`cf-gtk-panel-${i}`)).filter(Boolean) as HTMLElement[];
  if (!tabs.length || !panels.length) return;

  const select = (idx: number) => {
    tabs.forEach((t, i) => {
      const sel = i === idx;
      t.setAttribute('aria-selected', sel ? 'true' : 'false');
      t.className = `cf:rounded-full cf:border cf:px-3 cf:py-1.5 cf:text-sm cf:transition-colors ${sel ? 'cf:border-white/30 cf:bg-white/20 cf:text-white' : 'cf:border-white/10 cf:bg-white/5 cf:text-white/80 cf:hover:bg-white/10'}`;
      if (panels[i]) panels[i].hidden = !sel;
    });
  };

  tabs.forEach((t) => {
    t.addEventListener('click', () => {
      const idx = parseInt(t.dataset.index || '0', 10) || 0;
      select(idx);
    });
    t.addEventListener('keydown', (e) => {
      const current = tabs.findIndex(btn => btn.getAttribute('aria-selected') === 'true');
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (current + 1) % tabs.length;
        tabs[next].focus();
        select(next);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (current - 1 + tabs.length) % tabs.length;
        tabs[prev].focus();
        select(prev);
      }
    });
  });

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const id = window.setInterval(() => {
      const current = tabs.findIndex(btn => btn.getAttribute('aria-selected') === 'true');
      const next = (current + 1) % tabs.length;
      select(next);
    }, 6000);
    (root as any)._cfGtkTimer = id;
  }
}

// New: Apply Get to know Ramp variant
function applyGetToKnowVariant() {
  try {
    const section = findGetToKnowSection();
    if (!section) return;

    if (!document.getElementById('cf-gtk-variant')) {
      const panel = <GetToKnowPanel /> as unknown as HTMLElement;
      // Prefer inserting at the top of the section
      section.prepend(panel);
    }

    hideDefaultGetToKnowContent(section);
    wireGetToKnowTabs();
  } catch (e) {
    console.error('[CF Variant] gtk apply error', e);
  }
}

// New: Apply footer variant when footer is available
function applyFooterVariant() {
  try {
    const footer = document.querySelector('footer') as HTMLElement | null;
    if (!footer) return;

    if (!document.getElementById('cf-footer-variant')) {
      const panel = <FooterPanel /> as unknown as HTMLElement;
      footer.prepend(panel);
    }

    hideDefaultFooterContent(footer);
  } catch (e) {
    console.error('[CF Variant] footer apply error', e);
  }
}

function applyVariant() {
  try {
    const hero = document.querySelector('#hero-section') as HTMLElement | null;
    if (!hero) throw new Error('Hero section not found');

    // 1) Copy: update subhead directly under H1
    const subheadP = hero.querySelector('h1 + div p') as HTMLParagraphElement | null;
    if (subheadP && !subheadP.dataset.cfUpdated) {
      subheadP.textContent = 'Control spend before it happens, automate close, and reimburse globally in days—not weeks.';
      subheadP.dataset.cfUpdated = 'true';
    }

    // 2) Remove prior ROI variant if present
    const priorRoi = hero.querySelector('[data-testid="roi-calculator-container"]');
    if (priorRoi && priorRoi.parentElement) {
      priorRoi.parentElement.remove();
    }

    // 3) Idempotent mount
    const existing = document.getElementById('cf-hero-variant');
    if (!existing) {
      // Insert our panel right after the subhead container (h1 + div)
      const anchor = hero.querySelector('h1 + div') as HTMLElement | null;
      const panel = <HeroPanel /> as unknown as HTMLElement;
      if (anchor && anchor.parentElement) {
        anchor.parentElement.insertBefore(panel, anchor.nextSibling);
      } else {
        // Fallback: append to hero
        hero.append(panel);
      }
    }

    // 4) Wire up interactions
    wireEmailCta();
    wireRoiCalculator();
    startPolicyChip();

    // 4b) Hide duplicate native email CTAs within hero viewport to prevent overlap
    const panelEl = document.getElementById('cf-hero-variant');
    if (panelEl) hideDuplicateEmailCTAs(panelEl);

    // 5) Done
    window.CFQ = window.CFQ || [];
    window.CFQ.push({ emit: 'variantRendered' });
    console.log('[CF Variant] Rendered');
  } catch (err) {
    console.error('[CF Variant] apply error', err);
  }
}

function wireEmailCta() {
  const form = document.getElementById('cf-hero-email-form') as HTMLFormElement | null;
  const input = document.getElementById('cf-hero-email') as HTMLInputElement | null;
  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (input.value || '').trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    input.setAttribute('aria-invalid', valid ? 'false' : 'true');
    if (!valid) {
      input.focus();
      return;
    }
    const url = `/signup?email=${encodeURIComponent(email)}`;
    try {
      window.location.assign(url);
    } catch {
      window.location.href = url;
    }
  });
}

function readNumber(id: string, fallback = 0): number {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el) return fallback;
  const v = parseFloat(el.value);
  return Number.isFinite(v) ? Math.max(0, v) : fallback;
}

function wireRoiCalculator() {
  const ids = ['cf-team-size', 'cf-monthly-bills', 'cf-hourly-cost', 'cf-mins-per-bill'];
  const outputs = {
    annual: document.getElementById('cf-roi-annual') as HTMLElement | null,
    hours: document.getElementById('cf-roi-hours') as HTMLElement | null,
  };
  const update = () => {
    const teamSize = readNumber('cf-team-size', 25); // not used in calc; kept for URL/context
    const monthlyBills = readNumber('cf-monthly-bills', 600);
    const hourlyCost = readNumber('cf-hourly-cost', 120);
    const minsPerBill = readNumber('cf-mins-per-bill', 7);

    const minutesSavedMonthly = monthlyBills * minsPerBill;
    const hoursSavedMonthly = minutesSavedMonthly / 60;
    const savingsMonthly = hoursSavedMonthly * hourlyCost;
    const savingsAnnual = savingsMonthly * 12;

    const locale = navigator.language || 'en-US';
    const currency = 'USD';
    if (outputs.annual) outputs.annual.textContent = formatCurrency(savingsAnnual, currency, locale);
    if (outputs.hours) outputs.hours.textContent = `${Math.round(hoursSavedMonthly)} hrs`;
  };
  ids.forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.addEventListener('input', update);
  });
  update();

  const estimateBtn = document.getElementById('cf-estimate-btn') as HTMLButtonElement | null;
  if (estimateBtn) {
    estimateBtn.addEventListener('click', () => {
      const team = readNumber('cf-team-size', 25);
      const bills = readNumber('cf-monthly-bills', 600);
      const hourly = readNumber('cf-hourly-cost', 120);
      const minsPerBill = readNumber('cf-mins-per-bill', 7);
      const url = `/calculator?team=${encodeURIComponent(team)}&bills=${encodeURIComponent(bills)}&hourly=${encodeURIComponent(hourly)}&minsPerBill=${encodeURIComponent(minsPerBill)}`;
      try {
        window.location.assign(url);
      } catch {
        window.location.href = url;
      }
    });
  }
}

function startPolicyChip() {
  const chip = document.getElementById('cf-policy-chip');
  const stateEl = document.getElementById('cf-policy-state');
  if (!chip || !stateEl) return;

  // Avoid duplicate timers
  const existingId = (chip as any)._cfTimerId as number | undefined;
  if (existingId) {
    clearInterval(existingId);
  }

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let approved = false;
  const tick = () => {
    approved = !approved;
    stateEl.textContent = approved ? 'Approved' : 'Blocked';
    const dot = chip.querySelector('span') as HTMLElement | null;
    if (dot) {
      dot.className = `cf:inline-block cf:size-2 cf:rounded-full ${approved ? 'cf:bg-emerald-500' : 'cf:bg-red-500'}`;
    }
    // Subtle color pulse via class swap
    if (!reduceMotion) {
      chip.classList.remove('cf:bg-white/10');
      chip.classList.add('cf:bg-white/20');
      setTimeout(() => {
        chip.classList.remove('cf:bg-white/20');
        chip.classList.add('cf:bg-white/10');
      }, 300);
    }
  };
  // Prime initial state to "Blocked", then toggle
  const id = window.setInterval(tick, 4500);
  (chip as any)._cfTimerId = id;
}

// Boot
addStyling();
monitorChangesByConditionAndRun(
  () => {
    const hero = document.querySelector('#hero-section');
    const h1 = hero?.querySelector('h1');
    return !!(hero && h1);
  },
  applyVariant
);

// New: separately observe for the footer rendering
monitorChangesByConditionAndRun(
  () => !!document.querySelector('footer'),
  applyFooterVariant
);

// New: separately observe for Get to know Ramp section
monitorChangesByConditionAndRun(
  () => !!findGetToKnowSection(),
  applyGetToKnowVariant
);