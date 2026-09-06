"use strict";

/**
 * =========================================================
 * WEBCRAFT — MAIN.JS
 * =========================================================
 *
 * Global functionality used across the entire website:
 *
 * - Page loader
 * - Mobile navigation
 * - Scroll reveal animations
 * - Website sharing
 * - Current year
 * - Magnetic buttons
 *
 * Page-specific functionality belongs in:
 * js/page.js
 *
 * Do NOT put contact-form, portfolio, planner, or
 * case-study logic in this file.
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

  /*
   * Normal page-load behavior.
   */
  window.addEventListener(
    "load",
    () => {
      setTimeout(hideLoader, 400);
    },
    { once: true }
  );

  /*
   * Safety fallback in case the load event
   * takes too long or another resource fails.
   */
  setTimeout(hideLoader, 2500);
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function initMobileNavigation() {
  const menuToggle = $(".menu-toggle");
  const navLinks = $("#navLinks");

  if (!menuToggle || !navLinks) return;

  const navItems =
    $$(".nav-links a", navLinks);


  function closeMenu() {
    navLinks.classList.remove("open");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Open navigation"
    );
  }


  function openMenu() {
    navLinks.classList.add("open");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Close navigation"
    );
  }


  function toggleMenu() {
    const isOpen =
      navLinks.classList.contains("open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }


  /*
   * Toggle mobile menu.
   */
  menuToggle.addEventListener(
    "click",
    toggleMenu
  );


  /*
   * Close menu after selecting a link.
   */
  navItems.forEach(link => {
    link.addEventListener(
      "click",
      closeMenu
    );
  });


  /*
   * Close when clicking outside.
   */
  document.addEventListener(
    "click",
    event => {
      if (!navLinks.classList.contains("open")) {
        return;
      }

      const clickedInsideMenu =
        navLinks.contains(event.target);

      const clickedToggle =
        menuToggle.contains(event.target);

      if (
        !clickedInsideMenu &&
        !clickedToggle
      ) {
        closeMenu();
      }
    }
  );


  /*
   * Close with Escape.
   */
  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key !== "Escape" ||
        !navLinks.classList.contains("open")
      ) {
        return;
      }

      closeMenu();
      menuToggle.focus();
    }
  );


  /*
   * Close mobile menu when returning
   * to desktop width.
   */
  window.addEventListener(
    "resize",
    () => {
      if (
        window.innerWidth > 768 &&
        navLinks.classList.contains("open")
      ) {
        closeMenu();
      }
    }
  );
}


/* =========================================================
   SCROLL REVEAL
========================================================= */

function initScrollReveal() {
  const elements =
    $$(".reveal");

  if (!elements.length) return;


  /*
   * Fallback for browsers without
   * IntersectionObserver.
   */
  if (
    !("IntersectionObserver" in window)
  ) {
    elements.forEach(element => {
      element.classList.add("visible");
    });

    return;
  }


  const observer =
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add(
            "visible"
          );

          observer.unobserve(
            entry.target
          );
        });
      },
      {
        threshold: 0.12,
        rootMargin:
          "0px 0px -40px 0px"
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

  toast.textContent =
    String(message || "");

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
  const button =
    $("#shareButton");

  if (!button) return;


  button.addEventListener(
    "click",
    async () => {
      const url =
        window.location.href;


      /*
       * Native share API.
       */
      if (
        typeof navigator.share ===
        "function"
      ) {
        try {
          await navigator.share({
            title: "Webcraft",
            text:
              "Webcraft — websites that work.",
            url
          });

        } catch (error) {

          /*
           * Ignore intentional cancellation.
           */
          if (
            error?.name !==
            "AbortError"
          ) {
            console.error(
              "Share error:",
              error
            );
          }
        }

        return;
      }


      /*
       * Clipboard fallback.
       */
      try {

        if (
          navigator.clipboard &&
          typeof navigator.clipboard
            .writeText ===
            "function"
        ) {
          await navigator.clipboard.writeText(
            url
          );

          showToast(
            "Webcraft link copied."
          );

          return;
        }

        throw new Error(
          "Clipboard API unavailable."
        );

      } catch (error) {

        console.error(
          "Clipboard error:",
          error
        );

        showToast(
          "Unable to copy the link."
        );
      }
    }
  );
}


/* =========================================================
   CURRENT YEAR
========================================================= */

function initCurrentYear() {
  const year =
    $("#year");

  if (!year) return;

  year.textContent =
    String(
      new Date().getFullYear()
    );
}


/* =========================================================
   MAGNETIC BUTTONS
========================================================= */

function initMagneticButtons() {

  /*
   * Only enable the effect on devices
   * with a precise pointer such as a mouse.
   */
  if (
    !window.matchMedia ||
    !window.matchMedia(
      "(pointer: fine)"
    ).matches
  ) {
    return;
  }


  const buttons =
    $$(".magnetic");

  if (!buttons.length) return;


  buttons.forEach(button => {

    button.addEventListener(
      "mousemove",
      event => {

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
      }
    );


    button.addEventListener(
      "mouseleave",
      () => {
        button.style.transform = "";
      }
    );

  });
}


/* =========================================================
   INITIALIZE WEBCRAFT
========================================================= */

function initWebcraft() {

  /*
   * Global features only.
   */
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
   START APPLICATION
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initWebcraft,
    {
      once: true
    }
  );

} else {

  initWebcraft();

}