const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    });
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

// Keep the portrait visible; the image is embedded directly in the page to avoid asset-path failures.
const portraitImage = document.querySelector(".portrait-image");
if (portraitImage) {
  portraitImage.addEventListener("error", () => {
    portraitImage.style.display = "block";
    portraitImage.alt = "Portrait image could not be decoded by this browser.";
  }, { once: true });
}

// Lightweight custom cursor with short-lived electric-blue traces.
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  let lastTrace = 0;
  let traceCount = 0;
  window.addEventListener("pointermove", (event) => {
    cursor.style.left = event.clientX + "px";
    cursor.style.top = event.clientY + "px";

    const now = performance.now();
    if (now - lastTrace < 24) return;
    lastTrace = now;

    const trace = document.createElement("span");
    trace.className = "cursor-trace";
    trace.setAttribute("aria-hidden", "true");
    const angle = (Math.random() * 48 - 24).toFixed(1) + "deg";
    trace.style.left = event.clientX + "px";
    trace.style.top = event.clientY + "px";
    trace.style.setProperty("--angle", angle);
    trace.style.setProperty("--drift", (Math.random() * 18 - 9).toFixed(1) + "px");
    document.body.appendChild(trace);
    trace.addEventListener("animationend", () => trace.remove(), { once: true });
    traceCount += 1;
    if (traceCount > 300) traceCount = 0;
  });

  document.addEventListener("pointerleave", () => { cursor.style.opacity = "0"; });
  document.addEventListener("pointerenter", () => { cursor.style.opacity = "1"; });
}


// Scroll reveals and restrained pointer-responsive movement for the new hero.
const revealItems = document.querySelectorAll(".hero-reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const heroPortrait = document.querySelector(".hero-portrait");
if (heroPortrait && window.matchMedia("(hover:hover) and (pointer:fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const image = heroPortrait.querySelector(".portrait-image");
  heroPortrait.addEventListener("pointermove", (event) => {
    const bounds = heroPortrait.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    image.style.translate = `${x * 10}px ${y * 8}px`;
  });
  heroPortrait.addEventListener("pointerleave", () => { image.style.translate = ""; });
}


// Animate the homepage proof points once as they enter the viewport.
const statsSection = document.querySelector(".results-stats");
if (statsSection) {
  const statItems = statsSection.querySelectorAll(".stat-item");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animateStats = () => {
    statItems.forEach((item) => {
      const number = item.querySelector(".stat-number");
      const target = Number(number.dataset.count || 0);
      const decimal = number.dataset.decimal === "true";
      item.classList.add("is-counted");
      if (reducedMotion) {
        number.textContent = decimal ? target.toFixed(1) : String(target);
        return;
      }
      const duration = 1500;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const value = target * eased;
        number.textContent = decimal ? value.toFixed(1) : String(Math.round(value));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };
  if ("IntersectionObserver" in window) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        animateStats();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    statsObserver.observe(statsSection);
  } else {
    animateStats();
  }
}


// Interactive project brief: live summary and email handoff.
const briefForm = document.querySelector('#project-brief-form');
if (briefForm) {
  const service = document.querySelector('#brief-service');
  const timeframe = document.querySelector('#brief-timeframe');
  const budget = document.querySelector('#brief-budget');
  const currency = document.querySelector('#brief-currency');
  const details = document.querySelector('#brief-details');
  const summary = document.querySelector('#brief-summary');
  const feedback = document.querySelector('#brief-feedback');
  const updateBriefSummary = () => {
    const amount = budget.value ? new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(Number(budget.value)) : 'your budget';
    const serviceText = service.value || 'a service';
    const timeText = timeframe.value || 'a timeframe';
    summary.textContent = service.value || timeframe.value || budget.value ? serviceText + ' · ' + timeText + ' · ' + currency.value + ' ' + amount + (details.value.trim() ? ' · Details added' : '') : 'Choose a service, timeframe and budget to start shaping your project brief.';
  };
  [service,timeframe,budget,currency,details].forEach((field) => field.addEventListener('input', updateBriefSummary));
  briefForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!briefForm.reportValidity()) return;
    const subject = 'New project brief — ' + service.value;
    const body = ['Hello Eben,', '', "I'd like to discuss a project with you.", '', 'Service: ' + service.value, 'Timeframe: ' + timeframe.value, 'Estimated budget: ' + currency.value + ' ' + budget.value, '', 'Project details:', details.value.trim(), '', 'Looking forward to hearing from you.'].join('\n');
    feedback.textContent = 'Your email draft is opening. Review the details and send when you are ready.';
    window.location.href = 'mailto:ebenblack337@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
  updateBriefSummary();
}
