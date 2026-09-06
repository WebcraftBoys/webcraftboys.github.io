"use strict";

/* =========================================================
   WEBCRAFT — MAIN JAVASCRIPT
   Frontend interactions
   ========================================================= */


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

function hideLoader() {
  const loader = $("#loader");

  if (!loader) return;

  loader.classList.add("hidden");
}

window.addEventListener("load", () => {
  setTimeout(hideLoader, 400);
});

// Safety fallback in case the load event gets stuck.
setTimeout(hideLoader, 2500);


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initMobileNavigation() {
  const menuToggle = $(".menu-toggle");
  const navLinks = $("#navLinks");

  if (!menuToggle || !navLinks) return;

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

  menuToggle.addEventListener("click", () => {
    const isOpen =
      navLinks.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen
        ? "Close navigation"
        : "Open navigation"
    );
  });

  $$(".nav-links a", navLinks).forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function initScrollReveal() {
  const elements = $$(".reveal");

  if (!elements.length) return;

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
      threshold: 0.12
    }
  );

  elements.forEach(element => {
    observer.observe(element);
  });
}


/* =========================================================
   PORTFOLIO FILTERS
   ========================================================= */

function initPortfolioFilters() {
  const filterButtons = $$(".filter");
  const caseCards = $$(".case-card");

  if (!filterButtons.length || !caseCards.length) {
    return;
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selectedFilter =
        button.dataset.filter || "all";

      // Update active filter button.
      filterButtons.forEach(item => {
        item.classList.toggle(
          "active",
          item === button
        );
      });

      // Filter project cards.
      caseCards.forEach(card => {
        const category =
          card.dataset.category || "";

        const shouldHide =
          selectedFilter !== "all" &&
          category !== selectedFilter;

        card.classList.toggle(
          "hidden",
          shouldHide
        );
      });
    });
  });
}


/* =========================================================
   PROJECT PLANNER
   ========================================================= */

const DEFAULT_GOAL = "New business website";

let selectedGoal = DEFAULT_GOAL;


function initProjectPlanner() {
  const goals = $$(".goal");
  const goalOutput = $("#goalOutput");
  const goalSelect = $("#goalSelect");
  const plannerNext = $("#plannerNext");

  if (!goals.length) return;

  function selectGoal(goalButton) {
    if (!goalButton) return;

    const goal =
      goalButton.dataset.goal?.trim();

    if (!goal) return;

    selectedGoal = goal;

    // Update active goal.
    goals.forEach(item => {
      item.classList.toggle(
        "active",
        item === goalButton
      );
    });

    // Update planner text.
    if (goalOutput) {
      goalOutput.textContent = goal;
    }

    // Sync with contact form.
    if (goalSelect) {
      goalSelect.value = goal;
    }
  }

  function resetPlanner() {
    selectedGoal = DEFAULT_GOAL;

    goals.forEach(goal => {
      goal.classList.remove("active");
    });

    // Try to find the default goal.
    const defaultGoal =
      goals.find(
        goal =>
          goal.dataset.goal === DEFAULT_GOAL
      );

    if (defaultGoal) {
      selectGoal(defaultGoal);
      return;
    }

    // Fallback if the default goal
    // does not exist in the HTML.
    if (goalOutput) {
      goalOutput.textContent =
        DEFAULT_GOAL;
    }

    if (goalSelect) {
      goalSelect.value =
        DEFAULT_GOAL;
    }
  }

  // Make resetPlanner available to the
  // contact form without polluting the
  // global scope unnecessarily.
  window.resetPlanner = resetPlanner;

  goals.forEach(goal => {
    goal.addEventListener("click", () => {
      selectGoal(goal);
    });
  });

  plannerNext?.addEventListener(
    "click",
    () => {
      const activeGoal =
        $(".goal.active");

      if (activeGoal) {
        selectGoal(activeGoal);
      }
    }
  );

  // Initialize planner.
  const initialGoal =
    $(".goal.active") ||
    goals.find(
      goal =>
        goal.dataset.goal === DEFAULT_GOAL
    ) ||
    goals[0];

  if (initialGoal) {
    selectGoal(initialGoal);
  }
}


/* =========================================================
   CASE STUDY MODAL
   ========================================================= */

function initCaseStudyModal() {
  const modal = $("#caseModal");

  if (!modal) return;

  const modalTitle = $("#modalTitle");
  const modalDescription = $("#modalDescription");
  const modalResult = $("#modalResult");

  const closeButtons = [
    $(".modal-close"),
    $(".modal-backdrop"),
    $(".modal-cta")
  ].filter(Boolean);


  function openModal(card) {
    if (!card) return;

    if (modalTitle) {
      modalTitle.textContent =
        card.dataset.title || "Project";
    }

    if (modalDescription) {
      modalDescription.textContent =
        card.dataset.description || "";
    }

    if (modalResult) {
      modalResult.textContent =
        card.dataset.result || "";
    }

    modal.classList.add("open");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow =
      "hidden";
  }


  function closeModal() {
    modal.classList.remove("open");

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow = "";
  }


  // Open modal buttons.
  $$(".case-open").forEach(button => {
    button.addEventListener("click", () => {
      const card =
        button.closest(".case-card");

      openModal(card);
    });
  });


  // Close modal buttons.
  closeButtons.forEach(button => {
    button.addEventListener(
      "click",
      closeModal
    );
  });


  // Escape key.
  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        modal.classList.contains("open")
      ) {
        closeModal();
      }
    }
  );
}


/* =========================================================
   TOAST NOTIFICATION
   ========================================================= */

let toastTimer = null;


function showToast(message) {
  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}


/* =========================================================
   CONTACT FORM
   ========================================================= */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxzBsIdFDmSS5gu2lh3thPUs-Fc9i3o4M0CHKxcjVG3D4rdWzAKedsTBKOv5Sm8uORcRA/exec";


function setFormMessage(
  message = "",
  type = ""
) {
  const formMessage = $("#formMessage");

  if (!formMessage) return;

  formMessage.textContent = message;

  formMessage.classList.remove(
    "success",
    "error"
  );

  if (type) {
    formMessage.classList.add(type);
  }
}


function getFormValue(formData, field) {
  return String(
    formData.get(field) || ""
  ).trim();
}


function initContactForm() {
  const contactForm = $("#contactForm");

  if (!contactForm) return;

  contactForm.addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      const submitButton =
        contactForm.querySelector(
          'button[type="submit"]'
        );

      if (!submitButton) return;


      /* -----------------------------------------------------
         Browser validation
         ----------------------------------------------------- */

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }


      /* -----------------------------------------------------
         Save original button
         ----------------------------------------------------- */

      const originalButtonHTML =
        submitButton.innerHTML;


      /* -----------------------------------------------------
         Collect form data
         ----------------------------------------------------- */

      const formData =
        new FormData(contactForm);

      const name =
        getFormValue(formData, "name");

      const email =
        getFormValue(formData, "email");

      const goal =
        getFormValue(formData, "goal");

      const budget =
        getFormValue(formData, "budget");

      const timeline =
        getFormValue(formData, "timeline");

      const message =
        getFormValue(formData, "message");


      /* -----------------------------------------------------
         Extra validation
         ----------------------------------------------------- */

      if (
        !name ||
        !email ||
        !goal ||
        !message
      ) {
        setFormMessage(
          "Please complete all required fields.",
          "error"
        );

        return;
      }


      /* -----------------------------------------------------
         Prepare submission
         ----------------------------------------------------- */

      const submission =
        new URLSearchParams();

      submission.append("name", name);
      submission.append("email", email);
      submission.append("goal", goal);
      submission.append("budget", budget);
      submission.append("timeline", timeline);
      submission.append("message", message);


      /* -----------------------------------------------------
         Loading state
         ----------------------------------------------------- */

      submitButton.disabled = true;

      submitButton.innerHTML =
        'Sending enquiry <span>…</span>';

      setFormMessage();


      /* -----------------------------------------------------
         Send to Google Apps Script
         ----------------------------------------------------- */

      try {
        await fetch(
          GOOGLE_SCRIPT_URL,
          {
            method: "POST",
            mode: "no-cors",
            body: submission
          }
        );


        /* ---------------------------------------------------
           Success
           --------------------------------------------------- */

        contactForm.reset();

        if (
          typeof window.resetPlanner ===
          "function"
        ) {
          window.resetPlanner();
        }

        setFormMessage(
          "Thanks! Your project enquiry has been sent. We'll get back to you within 1 business day.",
          "success"
        );

        showToast(
          "Project enquiry sent successfully."
        );

      } catch (error) {
        console.error(
          "Webcraft form error:",
          error
        );

        setFormMessage(
          "We couldn't send your enquiry right now. Please try again.",
          "error"
        );

        showToast(
          "Unable to send enquiry."
        );

      } finally {
        submitButton.disabled = false;

        submitButton.innerHTML =
          originalButtonHTML;
      }
    }
  );
}


/* =========================================================
   SHARE WEBSITE
   ========================================================= */

function initShareButton() {
  const shareButton =
    $("#shareButton");

  if (!shareButton) return;

  shareButton.addEventListener(
    "click",
    async () => {
      const url =
        window.location.href;


      /* -----------------------------------------------------
         Native share
         ----------------------------------------------------- */

      if (
        typeof navigator.share ===
        "function"
      ) {
        try {
          await navigator.share({
            title: "Webcraft",
            text: "Webcraft — websites that work.",
            url
          });

        } catch (error) {
          // User cancelled the share dialog.
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


      /* -----------------------------------------------------
         Clipboard fallback
         ----------------------------------------------------- */

      try {
        if (
          navigator.clipboard &&
          typeof navigator.clipboard.writeText ===
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
          "Clipboard unavailable."
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
  const yearElement =
    $("#year");

  if (!yearElement) return;

  yearElement.textContent =
    new Date().getFullYear();
}


/* =========================================================
   MAGNETIC BUTTON EFFECT
   ========================================================= */

function initMagneticButtons() {
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

        const x =
          (
            event.clientX -
            rect.left -
            rect.width / 2
          ) * 0.06;

        const y =
          (
            event.clientY -
            rect.top -
            rect.height / 2
          ) * 0.06;

        button.style.transform =
          `translate(${x}px, ${y}px)`;
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
   INITIALIZATION
   ========================================================= */

function initWebcraft() {
  initMobileNavigation();
  initScrollReveal();
  initPortfolioFilters();
  initProjectPlanner();
  initCaseStudyModal();
  initContactForm();
  initShareButton();
  initCurrentYear();
  initMagneticButtons();

  console.log(
    "Webcraft initialized successfully."
  );
}


// Run after DOM is ready.
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initWebcraft
  );
} else {
  initWebcraft();
}
