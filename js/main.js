"use strict";

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function initLoader() {
  const loader = $("#loader");
  if (!loader) return;
  let hidden = false;
  const hide = () => { if (hidden) return; hidden = true; loader.classList.add("hidden"); };
  window.addEventListener("load", () => setTimeout(hide, 250), { once: true });
  setTimeout(hide, 2200);
}

function initMobileNavigation() {
  const toggle = $(".menu-toggle");
  const nav = $("#navLinks");
  if (!toggle || !nav) return;
  const close = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  };
  const open = () => {
    nav.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");
  };
  toggle.addEventListener("click", () => nav.classList.contains("open") ? close() : open());
  $$("a", nav).forEach(link => link.addEventListener("click", close));
  document.addEventListener("click", e => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) close();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("open")) { close(); toggle.focus(); }
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 768) close(); }, { passive:true });
}

function initCurrentNavigation() {
  const current = new URL(window.location.href);
  $$(".nav-links a:not(.nav-cta)").forEach(link => {
    const url = new URL(link.href, window.location.href);
    const same = url.pathname.replace(/\/$/, "") === current.pathname.replace(/\/$/, "");
    if (same) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function initScrollReveal() {
  const elements = $$(".reveal");
  if (!elements.length) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    elements.forEach(el => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  }), { threshold:.12, rootMargin:"0px 0px -40px 0px" });
  elements.forEach(el => observer.observe(el));
}

let toastTimer = null;
function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = String(message || "");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function initScrollTools() {
  const progress = document.createElement("div");
  progress.className = "site-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = "<span></span>";
  document.body.appendChild(progress);
  const bar = $("span", progress);
  const top = document.createElement("button");
  top.className = "back-to-top";
  top.type = "button";
  top.setAttribute("aria-label", "Back to top");
  top.innerHTML = "↑";
  document.body.appendChild(top);
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    bar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
    top.classList.toggle("visible", window.scrollY > 600);
  };
  window.addEventListener("scroll", update, { passive:true });
  top.addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));
  update();
}

function initShareButton() {
  const button = $("#shareButton");
  if (!button) return;
  button.addEventListener("click", async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title: document.title, text:"Webcraft — websites that work.", url }); }
      catch (e) { if (e?.name !== "AbortError") console.error("Share error:", e); }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("Page link copied.");
    } catch (e) {
      console.error("Clipboard error:", e);
      showToast("Unable to copy the link.");
    }
  });
}

function initCurrentYear() {
  $$("#year").forEach(el => el.textContent = String(new Date().getFullYear()));
}

function initMagneticButtons() {
  if (!window.matchMedia?.("(pointer: fine)").matches || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  $$(".magnetic").forEach(button => {
    button.addEventListener("mousemove", e => {
      const r = button.getBoundingClientRect();
      const x = (e.clientX-r.left-r.width/2)*.045;
      const y = (e.clientY-r.top-r.height/2)*.045;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener("mouseleave", () => button.style.transform = "");
  });
}

function initWebcraft() {
  initLoader();
  initMobileNavigation();
  initCurrentNavigation();
  initScrollReveal();
  initScrollTools();
  initShareButton();
  initCurrentYear();
  initMagneticButtons();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initWebcraft, { once:true });
else initWebcraft();
