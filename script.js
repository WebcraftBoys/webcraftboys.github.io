"use strict";

/* =========================================================
   WEBCRAFT — MAIN JAVASCRIPT
   Frontend only
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


// Normal page-load fallback
window.addEventListener("load", () => {
  setTimeout(hideLoader, 400);
});


// Absolute safety fallback
setTimeout(hideLoader, 2500);


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

const menuToggle = $(".menu-toggle");
const navLinks = $("#navLinks");

if (menuToggle && navLinks) {

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


  // Close menu after clicking a link
  $$(".nav-links a", navLinks).forEach(link => {

    link.addEventListener("click", () => {

      navLinks.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Open navigation"
      );

    });

  });

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealElements = $$(".reveal");

if ("IntersectionObserver" in window) {

  const revealObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");

          revealObserver.unobserve(
            entry.target
          );

        });

      },
      {
        threshold: 0.12
      }
    );


  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

} else {

  revealElements.forEach(element => {
    element.classList.add("visible");
  });

}


/* =========================================================
   PORTFOLIO FILTERS
   ========================================================= */

const filterButtons = $$(".filter");
const caseCards = $$(".case-card");

filterButtons.forEach(button => {

  button.addEventListener("click", () => {

    const selectedFilter =
      button.dataset.filter || "all";


    // Active button
    filterButtons.forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");


    // Filter cards
    caseCards.forEach(card => {

      const category =
        card.dataset.category || "";

      const hidden =
        selectedFilter !== "all" &&
        category !== selectedFilter;

      card.classList.toggle(
        "hidden",
        hidden
      );

    });

  });

});


/* =========================================================
   PROJECT PLANNER
   ========================================================= */

const goals = $$(".goal");
const goalOutput = $("#goalOutput");
const goalSelect = $("#goalSelect");
const plannerNext = $("#plannerNext");

const DEFAULT_GOAL =
  "New business website";


function selectGoal(goalButton) {

  if (!goalButton) return;


  const selectedGoal =
    goalButton.dataset.goal || "";

  if (!selectedGoal) return;


  // Remove active state
  goals.forEach(goal => {
    goal.classList.remove("active");
  });


  // Activate selected goal
  goalButton.classList.add("active");


  // Update planner display
  if (goalOutput) {
    goalOutput.textContent =
      selectedGoal;
  }


  // Update contact form
  if (goalSelect) {
    goalSelect.value =
      selectedGoal;
  }

}


// Goal buttons
goals.forEach(goal => {

  goal.addEventListener("click", () => {
    selectGoal(goal);
  });

});


// Continue button
plannerNext?.addEventListener("click", () => {

  const activeGoal =
    $(".goal.active");

  if (activeGoal) {
    selectGoal(activeGoal);
  }

});


/* =========================================================
   CASE STUDY MODAL
   ========================================================= */

const modal = $("#caseModal");

const modalTitle = $("#modalTitle");
const modalDescription = $("#modalDescription");
const modalResult = $("#modalResult");


function openModal(card) {

  if (!modal || !card) return;


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

  if (!modal) return;


  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow =
    "";

}


// Open buttons
$$(".case-open").forEach(button => {

  button.addEventListener("click", () => {

    const card =
      button.closest(".case-card");

    openModal(card);

  });

});


// Close buttons
$(".modal-close")?.addEventListener(
  "click",
  closeModal
);

$(".modal-backdrop")?.addEventListener(
  "click",
  closeModal
);

$(".modal-cta")?.addEventListener(
  "click",
  closeModal
);


// Escape key
document.addEventListener("keydown", event => {

  if (event.key === "Escape") {
    closeModal();
  }

});


/* =========================================================
   GOOGLE APPS SCRIPT
   ========================================================= */


/*
  IMPORTANT

  This must be your deployed Google Apps Script
  Web App URL.

  It must end with:

  /exec
*/

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzg0WaVNhj0a-2WgIe3JLodHkXj-x-f6GA9duvootqGRjpETwgC2f7xnbi8Psp4e67YCg/exec";


/* =========================================================
   CONTACT FORM
   ========================================================= */

const contactForm =
  $("#contactForm");

const formMessage =
  $("#formMessage");


/* =========================================================
   FORM MESSAGE
   ========================================================= */

function setFormMessage(
  message = "",
  type = ""
) {

  if (!formMessage) return;


  formMessage.textContent =
    message;


  formMessage.classList.remove(
    "success",
    "error"
  );


  if (type) {
    formMessage.classList.add(type);
  }

}


/* =========================================================
   RESET PLANNER
   ========================================================= */

function resetPlanner() {

  goals.forEach(goal => {
    goal.classList.remove("active");
  });


  const defaultGoal =
    $(`.goal[data-goal="${DEFAULT_GOAL}"]`);


  if (defaultGoal) {
    defaultGoal.classList.add("active");
  }


  if (goalOutput) {
    goalOutput.textContent =
      DEFAULT_GOAL;
  }


  if (goalSelect) {
    goalSelect.value =
      "";
  }

}


/* =========================================================
   CONTACT FORM SUBMISSION
   ========================================================= */

if (contactForm) {

  contactForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      /* -----------------------------------------------------
         Submit button
         ----------------------------------------------------- */

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

      const originalButton =
        submitButton.innerHTML;


      /* -----------------------------------------------------
         Loading state
         ----------------------------------------------------- */

      submitButton.disabled =
        true;

      submitButton.innerHTML =
        'Sending enquiry <span>…</span>';


      setFormMessage();


      /* -----------------------------------------------------
         Collect form values
         ----------------------------------------------------- */

      const formData =
        new FormData(contactForm);


      const name =
        String(
          formData.get("name") || ""
        ).trim();


      const email =
        String(
          formData.get("email") || ""
        ).trim();


      const goal =
        String(
          formData.get("goal") || ""
        ).trim();


      const budget =
        String(
          formData.get("budget") || ""
        ).trim();


      const timeline =
        String(
          formData.get("timeline") || ""
        ).trim();


      const message =
        String(
          formData.get("message") || ""
        ).trim();


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

        submitButton.disabled =
          false;

        submitButton.innerHTML =
          originalButton;

        return;

      }


      /* -----------------------------------------------------
         Build standard form request
         ----------------------------------------------------- */

      const submission =
        new URLSearchParams();


      submission.append(
        "name",
        name
      );

      submission.append(
        "email",
        email
      );

      submission.append(
        "goal",
        goal
      );

      submission.append(
        "budget",
        budget
      );

      submission.append(
        "timeline",
        timeline
      );

      submission.append(
        "message",
        message
      );


      /* -----------------------------------------------------
         SEND TO GOOGLE APPS SCRIPT
         ----------------------------------------------------- */

      try {

        /*
          We intentionally use no-cors.

          This avoids the browser CORS problem between
          your website and Google Apps Script.

          Your Apps Script receives the data through:

          e.parameter.name
          e.parameter.email
          e.parameter.goal
          e.parameter.budget
          e.parameter.timeline
          e.parameter.message
        */

        await fetch(
          GOOGLE_SCRIPT_URL,
          {
            method: "POST",
            mode: "no-cors",
            body: submission
          }
        );


        /* ---------------------------------------------------
           SUCCESS

           Because no-cors gives us an opaque response,
           we cannot inspect Google's JSON response here.

           If fetch completes without throwing, we treat
           the submission as sent.
           --------------------------------------------------- */

        contactForm.reset();


        // Reset planner
        resetPlanner();


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

        submitButton.disabled =
          false;

        submitButton.innerHTML =
          originalButton;

      }

    }
  );

}


/* =========================================================
   TOAST NOTIFICATION
   ========================================================= */

let toastTimer = null;


function showToast(message) {

  const toast =
    $("#toast");

  if (!toast) return;


  toast.textContent =
    message;


  toast.classList.add("show");


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2400);

}


/* =========================================================
   SHARE WEBSITE
   ========================================================= */

const shareButton =
  $("#shareButton");


shareButton?.addEventListener(
  "click",
  async () => {

    const url =
      window.location.href;


    /* -------------------------------------------------------
       Native share
       ------------------------------------------------------- */

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

        // Ignore user cancellation
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


    /* -------------------------------------------------------
       Clipboard fallback
       ------------------------------------------------------- */

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

      } else {

        throw new Error(
          "Clipboard unavailable."
        );

      }

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


/* =========================================================
   CURRENT YEAR
   ========================================================= */

const yearElement =
  $("#year");


if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();

}


/* =========================================================
   MAGNETIC BUTTON EFFECT
   ========================================================= */

if (
  window.matchMedia &&
  window.matchMedia(
    "(pointer: fine)"
  ).matches
) {

  $$(".magnetic").forEach(button => {

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

        button.style.transform =
          "";

      }
    );

  });

}


/* =========================================================
   INITIALIZE
   ========================================================= */

console.log(
  "Webcraft initialized."
);
