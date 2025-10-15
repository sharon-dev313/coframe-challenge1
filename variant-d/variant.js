// Hero Image Update Variant - Updates hero image across desktop and mobile breakpoints
// Desktop (>600px): Updates background image on #lp-pom-box-417-color-overlay
// Mobile (≤600px): Updates image source on #lp-pom-image-120

console.log('Hero Image Update Variant: Starting');

const NEW_IMAGE_URL = 'https://cdn.coframe.com/assets/memoryair/WhatsApp-Image-2025-10-14-at-23.16.13-3f5c7d61-66e1-40dd-a3dd-874f26f5425a.webp';
const DESKTOP_SELECTOR = '#lp-pom-box-417-color-overlay';
const MOBILE_SELECTOR = '#lp-pom-image-120 > div > img';
const MOBILE_BREAKPOINT = '(max-width: 600px)';

// Helper function to lock the image element with new URL
function lockImageElement(img: HTMLImageElement): void {
  try {
    // Set primary attributes
    img.setAttribute('src', NEW_IMAGE_URL);
    img.setAttribute('srcset', `${NEW_IMAGE_URL} 1x, ${NEW_IMAGE_URL} 2x, ${NEW_IMAGE_URL} 3x`);
    if (!img.getAttribute('sizes')) {
      img.setAttribute('sizes', '100vw');
    }

    // Prevent Unbounce from restoring old URLs on mobile
    img.setAttribute('data-src', NEW_IMAGE_URL);
    img.setAttribute('data-srcset', `${NEW_IMAGE_URL} 1x, ${NEW_IMAGE_URL} 2x, ${NEW_IMAGE_URL} 3x`);
    img.setAttribute('data-src-mobile-1x', NEW_IMAGE_URL);
    img.setAttribute('data-src-mobile-2x', NEW_IMAGE_URL);
    img.setAttribute('data-src-mobile-3x', NEW_IMAGE_URL);

    // Ensure alt attribute exists
    if (!img.getAttribute('alt')) {
      img.setAttribute('alt', '');
    }

    // Monitor for attribute changes and restore if needed
    const desiredAttributes: Record<string, string> = {
      'src': NEW_IMAGE_URL,
      'srcset': `${NEW_IMAGE_URL} 1x, ${NEW_IMAGE_URL} 2x, ${NEW_IMAGE_URL} 3x`,
      'data-src': NEW_IMAGE_URL,
      'data-srcset': `${NEW_IMAGE_URL} 1x, ${NEW_IMAGE_URL} 2x, ${NEW_IMAGE_URL} 3x`,
      'data-src-mobile-1x': NEW_IMAGE_URL,
      'data-src-mobile-2x': NEW_IMAGE_URL,
      'data-src-mobile-3x': NEW_IMAGE_URL
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        const attrName = mutation.attributeName;
        if (attrName && desiredAttributes[attrName] && img.getAttribute(attrName) !== desiredAttributes[attrName]) {
          img.setAttribute(attrName, desiredAttributes[attrName]);
        }
      });
    });

    observer.observe(img, { 
      attributes: true, 
      attributeFilter: Object.keys(desiredAttributes) 
    });

    console.log('Hero Image Update: Mobile image locked');
  } catch (error) {
    console.error('Hero Image Update: Error locking image', error);
  }
}

// Helper function to lock background image on element
function lockBackgroundImage(element: HTMLElement): void {
  try {
    // Apply + pin sizing so it won't crop on desktop
    element.style.setProperty('background-image', `url("${NEW_IMAGE_URL}")`, 'important');
    element.style.setProperty('background-size', 'contain', 'important');
    element.style.setProperty('background-position', 'center center', 'important');
    element.style.setProperty('background-repeat', 'no-repeat', 'important');

    // If the parent (#lp-pom-box-417) is the one that actually holds bg rules, pin there too (safe no-op otherwise)
    const parent = element.parentElement as HTMLElement | null;
    if (parent && parent.id === 'lp-pom-box-417') {
      parent.style.setProperty('background-size', 'contain', 'important');
      parent.style.setProperty('background-position', 'center center', 'important');
      parent.style.setProperty('background-repeat', 'no-repeat', 'important');
    }

    // Re-enforce if builder mutates styles later
    const restore = () => {
      const cs = window.getComputedStyle(element);
      if (!cs.backgroundImage.includes(NEW_IMAGE_URL)) {
        element.style.setProperty('background-image', `url("${NEW_IMAGE_URL}")`, 'important');
      }
      if (cs.backgroundSize !== 'contain') {
        element.style.setProperty('background-size', 'contain', 'important');
      }
      const pos = cs.backgroundPosition || '';
      if (pos !== 'center center' && pos !== '50% 50%') {
        element.style.setProperty('background-position', 'center center', 'important');
      }
      if (cs.backgroundRepeat !== 'no-repeat') {
        element.style.setProperty('background-repeat', 'no-repeat', 'important');
      }
    };

    const observer = new MutationObserver(restore);
    observer.observe(element, { attributes: true, attributeFilter: ['style', 'class'] });
    if (parent && parent.id === 'lp-pom-box-417') {
      observer.observe(parent, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    // One more restore pass after any async builder tweaks
    setTimeout(restore, 200);

    console.log('Hero Image Update: Desktop background locked');
  } catch (error) {
    console.error('Hero Image Update: Error locking background', error);
  }
}

// Apply changes based on current viewport
function applyForViewport(): void {
  if (window.matchMedia && window.matchMedia(MOBILE_BREAKPOINT).matches) {
    // Mobile viewport (≤600px)
    const img = document.querySelector<HTMLImageElement>(MOBILE_SELECTOR);
    if (img) {
      lockImageElement(img);
    } else {
      console.log('Hero Image Update: Mobile image element not found yet');
    }
  } else {
    // Desktop viewport (>600px)
    const overlay = document.querySelector<HTMLElement>(DESKTOP_SELECTOR);
    if (overlay) {
      lockBackgroundImage(overlay);
    } else {
      console.log('Hero Image Update: Desktop overlay element not found yet');
    }
  }
}

// Debounced apply function for resize events
let resizeTimeout: ReturnType<typeof setTimeout>;
function debouncedApply(): void {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(applyForViewport, 80);
}

// Initialize variant
function initializeVariant(): void {
  // Apply immediately
  applyForViewport();
  
  // Apply again after short delays to catch late-loading elements
  setTimeout(applyForViewport, 400);
  setTimeout(applyForViewport, 1000);

  // Watch for DOM changes (Unbounce swaps nodes at breakpoints)
  try {
    const domObserver = new MutationObserver(() => {
      applyForViewport();
    });
    domObserver.observe(document.documentElement, { 
      childList: true, 
      subtree: true 
    });
  } catch (error) {
    console.error('Hero Image Update: Error setting up DOM observer', error);
  }

  // Watch for viewport changes
  window.addEventListener('resize', debouncedApply);
  window.addEventListener('orientationchange', debouncedApply);

  // Watch media query directly
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', applyForViewport);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(applyForViewport);
    }
  }

  console.log('Hero Image Update: Variant initialized');
  
  // Emit variant rendered event
  window.CFQ = window.CFQ || [];
  window.CFQ.push({ emit: 'variantRendered' });
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeVariant);
} else {
  initializeVariant();
}