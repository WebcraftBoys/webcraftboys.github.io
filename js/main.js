"use strict";

/**
 * =========================================================
 * WEBCRAFT — MAIN.JS
 * =========================================================
 *
 * Global functionality used across the website:
 * - Page loader
 * - Mobile navigation
 * - Scroll reveal
 * - Website sharing
 * - Current year
 * - Magnetic buttons
 *
 * Page-specific functionality lives in page.js
 */

/* =========================================================
   HELPERS
========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));


/* =========================================================
   PAGE LOADER
========================================================= */

function initLoader() {
  const loader = $("#loader");

  if (!loader) return;

  let hidden = false;

  const hideLoader = () => {
    if (hidden) return;

    hidden = true;
    loader.classList.add("hidden");
  };

  window.addEventListener("load", () => {
    setTimeout(hideLoader, 400);
  });

  // Safety fallback.
  setTimeout(hideLoader, 2500);
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function initMobileNavigation() {
  const menuToggle = $(".menu-toggle");
  const navLinks = $("#navLinks");

  if (!menuToggle || !navLinks) return;

  const navItems = $$(".nav-links a", navLinks);

  const closeMenu = () => {
    navLinks.classList.remove("open");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Open navigation"
    );
  };

  const openMenu = () => {
    navLinks.classList.add("open");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Close navigation"
    );
  };

  menuToggle.addEventListener("click", () => {
    const isOpen =
      navLinks.classList.contains("open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close after clicking a navigation link.
  navItems.forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  // Close when clicking outside.
  document.addEventListener("click", event => {
    if (!navLinks.classList.contains("open")) {
      return;
    }

    if (
      !navLinks.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  // Close with Escape.
  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      navLinks.classList.contains("open")
    ) {
      closeMenu();
      menuToggle.focus();
    }
  });

  // Close mobile menu on desktop resize.
  window.addEventListener("resize", () => {
    if (
      window.innerWidth > 768 &&
      navLinks.classList.contains("open")
    ) {
      closeMenu();
    }
  });
}


/* =========================================================
   SCROLL REVEAL
========================================================= */

function initScrollReveal() {
  const elements = $$(".reveal");

  if (!elements.length) return;

  // Fallback.
  if (!("IntersectionObserver" in window)) {
    elements.forEach(element => {
      element.classList.add("visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  elements.forEach(element => {
    observer.observe(element);
  });
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message) {
  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = String(message || "");

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}


/* =========================================================
   SHARE WEBSITE
========================================================= */

function initShareButton() {
  const button = $("#shareButton");

  if (!button) return;

  button.addEventListener("click", async () => {
    const url = window.location.href;

    // Native share.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Webcraft",
          text: "Webcraft — websites that work.",
          url
        });
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Share error:", error);
        }
      }

      return;
    }

    // Clipboard fallback.
    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
          "function"
      ) {
        await navigator.clipboard.writeText(url);

        showToast("Webcraft link copied.");

        return;
      }

      throw new Error("Clipboard API unavailable.");
    } catch (error) {
      console.error("Clipboard error:", error);

      showToast("Unable to copy the link.");
    }
  });
}


/* =========================================================
   CURRENT YEAR
========================================================= */

function initCurrentYear() {
  const year = $("#year");

  if (!year) return;

  year.textContent =
    String(new Date().getFullYear());
}


/* =========================================================
   MAGNETIC BUTTONS
========================================================= */

function initMagneticButtons() {
  if (
    !window.matchMedia ||
    !window.matchMedia("(pointer: fine)").matches
  ) {
    return;
  }

  const buttons = $$(".magnetic");

  if (!buttons.length) return;

  buttons.forEach(button => {
    button.addEventListener("mousemove", event => {
      const rect =
        button.getBoundingClientRect();

      const offsetX =
        (
          event.clientX -
          rect.left -
          rect.width / 2
        ) * 0.06;

      const offsetY =
        (
          event.clientY -
          rect.top -
          rect.height / 2
        ) * 0.06;

      button.style.transform =
        `translate(${offsetX}px, ${offsetY}px)`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "";
    });
  });
}


/* =========================================================
   INITIALIZE
========================================================= */

function initWebcraft() {
  initLoader();
  initMobileNavigation();
  initScrollReveal();
  initShareButton();
  initCurrentYear();
  initMagneticButtons();

  console.log(
    "Webcraft main.js initialized."
  );
}


/* =========================================================
   START
========================================================= */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initWebcraft,
    { once: true }
  );
} else {
  initWebcraft();
}
