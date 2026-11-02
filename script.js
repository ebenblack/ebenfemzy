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

// Portrait image fallback: keep the designed portrait frame graceful until the photo is added.
const portraitImage = document.querySelector(".portrait-image");
if (portraitImage) {
  portraitImage.addEventListener("error", () => {
    portraitImage.hidden = true;
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
