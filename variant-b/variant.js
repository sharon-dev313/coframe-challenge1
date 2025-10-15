// Add "How it works" module under hero with interactive stepper and sticky media (TSX + Tailwind cf:)

interface Step {
  title: string;
  desc: string;
  img: string;
}

const steps: Step[] = [
  {
    title: "Set controls before anyone spends",
    desc: "Create cards and budgets in minutes. Apply policies by team, merchant, category, and limit—so spend is right the first time.",
    img: "/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fhome-set-policies.webp&w=3840&q=75"
  },
  {
    title: "Spend anywhere, stay in policy",
    desc: "Employees pay with Ramp cards or reimbursements; guardrails and approvals trigger automatically in the flow of spend.",
    img: "/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fmobile-hero-device.webp&w=3840&q=75"
  },
  {
    title: "Receipts & coding, handled by AI",
    desc: "Receipts auto-collect via SMS/email, line items are extracted, coded, and matched—no chasing, no spreadsheets.",
    img: "/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fteam-extension-mobile.webp&w=3840&q=75"
  },
  {
    title: "Bills in, payments out—fast",
    desc: "Centralize vendor invoices, route for approval, batch payments, and sync back to your ERP in less time.",
    img: "/_next/image?url=%2Fassets%2Fimages%2Fhome%2Foperate-globally-mobile.webp&w=3840&q=75"
  },
  {
    title: "Close faster with real-time insights",
    desc: "See live spend by team and vendor, get anomaly alerts, and act before budgets are blown—so month-end is a review, not a rescue.",
    img: "/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fhome-set-policies.webp&w=3840&q=75"
  }
];

function StepItem({ index, title, desc, img }: Step & { index: number }): HTMLElement {
  return (
    <li className="cf:list-none cf:snap-start cf:min-w-[280px] cf:lg:min-w-0">
      <button
        type="button"
        data-cf-hiw-step=""
        data-index={String(index)}
        aria-label={title}
        className="cf:w-full cf:text-left cf:outline-none cf:rounded-lg cf:border cf:border-black/10 cf:bg-white cf:px-4 cf:py-3 cf:transition cf:duration-150 cf:ease-out cf:hover:bg-[#E4F222]/10 cf:hover:border-black/20 cf:focus-visible:ring-2 cf:focus-visible:ring-[#E4F222] cf:focus-visible:ring-offset-2"
      >
        <div className="cf:text-[17px] cf:leading-6 cf:text-[#0B0B0A]">{title}</div>
        <div className="cf:mt-1 cf:text-sm cf:leading-5 cf:text-[#6A6A63]">{desc}</div>
      </button>
    </li>
  ) as HTMLElement;
}

function StepList({ steps }: { steps: Step[] }): HTMLElement {
  return (
    <ol className="cf:flex cf:gap-4 cf:overflow-x-auto cf:snap-x cf:snap-mandatory cf:scroll-px-4 cf:-mx-4 cf:px-4 cf:lg:mx-0 cf:lg:px-0 cf:lg:flex-col cf:lg:gap-3 cf:lg:overflow-visible">
      {steps.map((step, idx) => <StepItem key={idx} index={idx} {...step} />)}
    </ol>
  ) as HTMLElement;
}

function MediaPanel({ images }: { images: string[] }): HTMLElement {
  return (
    <div className="cf:rounded-xl cf:overflow-hidden cf:aspect-[16/10] cf:bg-black/5 cf:relative">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${steps[idx].title} screenshot`}
          data-cf-hiw-image=""
          data-index={String(idx)}
          aria-hidden={idx === 0 ? "false" : "true"}
          className={`cf:absolute cf:inset-0 cf:size-full cf:object-cover cf:transition-opacity cf:duration-200 ${idx === 0 ? 'cf:opacity-100' : 'cf:opacity-0'}`}
          fetchpriority={idx === 0 ? "high" : undefined}
          loading={idx === 0 ? undefined : "lazy"}
          decoding={idx === 0 ? undefined : "async"}
        />
      ))}
    </div>
  ) as HTMLElement;
}

function LearnMoreLink(): HTMLElement {
  return (
    <a 
      href="/platform"
      className="cf:mt-6 cf:inline-flex cf:items-center cf:gap-2 cf:text-sm cf:text-[#6A6A63] cf:hover:text-[#0B0B0A]"
    >
      Learn more →
    </a>
  ) as HTMLElement;
}

function HowItWorksSection(stepData: Step[]): HTMLElement {
  return (
    <section 
      id="cf-howitworks" 
      aria-labelledby="cf-howitworks-heading"
      data-cf-init="0"
      className="cf:bg-white cf:py-12 cf:md:py-16"
    >
      <div className="cf:mx-auto cf:w-full cf:max-w-screen-2xl cf:px-4 cf:md:px-8 cf:lg:px-12 cf:xl:px-16">
        <h2 
          id="cf-howitworks-heading"
          className="cf:text-[#0B0B0A] cf:text-3xl cf:md:text-4xl cf:leading-tight cf:mb-8"
        >
          How it works. From swipe to closed books
        </h2>
        
        <div className="cf:grid cf:grid-cols-1 cf:lg:grid-cols-12 cf:gap-8">
          <div className="cf:lg:col-span-5">
            <StepList steps={stepData} />
          </div>
          
          <div className="cf:lg:col-span-7 cf:sticky cf:top-[calc(var(--nav-height)+24px)]">
            <MediaPanel images={stepData.map(s => s.img)} />
          </div>
        </div>
        
        <LearnMoreLink />
      </div>
    </section>
  ) as HTMLElement;
}

function initializeHowItWorksInteractions(section: HTMLElement): void {
  if (section.dataset.cfInit === "1") return;
  
  const startTs = performance.now();
  section.dataset.cfInit = "1";
  
  const stepButtons = section.querySelectorAll<HTMLButtonElement>('[data-cf-hiw-step]');
  const images = section.querySelectorAll<HTMLImageElement>('[data-cf-hiw-image]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    images.forEach(img => {
      img.style.transition = 'none';
      img.classList.remove('cf:transition-opacity', 'cf:duration-200');
    });
  }
  
  function setActive(index: number): void {
    const safeIndex = ((index % steps.length) + steps.length) % steps.length;
    
    stepButtons.forEach((btn, i) => {
      if (i === safeIndex) {
        btn.setAttribute('aria-current', 'step');
        btn.classList.add('cf:border-black/30', 'cf:bg-[#E4F222]/10');
      } else {
        btn.removeAttribute('aria-current');
        btn.classList.remove('cf:border-black/30', 'cf:bg-[#E4F222]/10');
      }
    });
    
    images.forEach((img, i) => {
      if (i === safeIndex) {
        img.classList.remove('cf:opacity-0');
        img.classList.add('cf:opacity-100');
        img.setAttribute('aria-hidden', 'false');
      } else {
        img.classList.remove('cf:opacity-100');
        img.classList.add('cf:opacity-0');
        img.setAttribute('aria-hidden', 'true');
      }
    });
    
    const msSinceRender = performance.now() - startTs;
    const eventDetail = {
      index: safeIndex,
      title: steps[safeIndex].title,
      msSinceRender
    };
    
    window.dispatchEvent(new CustomEvent('howitworks_step_select', { detail: eventDetail }));
    
    if (typeof (window as any).dataLayer !== 'undefined') {
      (window as any).dataLayer.push({
        event: 'howitworks_step_select',
        ...eventDetail
      });
    }
  }
  
  stepButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      setActive(idx);
    });
    
    btn.addEventListener('mouseenter', () => {
      if (btn.dataset.prefetched !== '1') {
        const img = new Image();
        img.src = steps[idx].img;
        btn.dataset.prefetched = '1';
      }
      setActive(idx);
    });
    
    btn.addEventListener('keydown', (e) => {
      let newIndex = idx;
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        newIndex = idx - 1;
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        newIndex = idx + 1;
      } else {
        return;
      }
      
      const safeIndex = ((newIndex % steps.length) + steps.length) % steps.length;
      setActive(safeIndex);
      stepButtons[safeIndex]?.focus();
    });
  });
  
  setActive(0);
}

function monitorChangesByConditionAndRun(check: () => boolean, code: () => void): void {
  const checkAndRun = () => {
    if (check()) {
      observer.disconnect();
      code();
    }
  };
  
  const observer = new MutationObserver(checkAndRun);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  checkAndRun();
  
  setTimeout(() => observer.disconnect(), 10000);
}

function render(): void {
  try {
    const existing = document.getElementById('cf-howitworks');
    
    if (existing) {
      if (existing.dataset.cfInit !== '1') {
        initializeHowItWorksInteractions(existing);
      }
      
      const firstImage = existing.querySelector<HTMLImageElement>('img[data-cf-hiw-image][data-index="0"]');
      if (firstImage) {
        window.CFQ = window.CFQ || [];
        window.CFQ.push({ emit: 'variantRendered' });
      }
      return;
    }
    
    const heroSection = document.querySelector('#hero-section');
    if (!heroSection) {
      console.error('Hero section not found');
      return;
    }
    
    const section = HowItWorksSection(steps);
    heroSection.insertAdjacentElement('afterend', section);
    
    initializeHowItWorksInteractions(section);
    
    const firstImage = section.querySelector<HTMLImageElement>('img[data-cf-hiw-image][data-index="0"]');
    if (firstImage) {
      window.CFQ = window.CFQ || [];
      window.CFQ.push({ emit: 'variantRendered' });
    } else {
      console.error('First media image not found after insertion');
    }
  } catch (error) {
    console.error('Error rendering How it works module:', error);
  }
}

monitorChangesByConditionAndRun(() => !!document.querySelector('#hero-section'), render);