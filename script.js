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

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxzBsIdFDmSS5gu2lh3thPUs-Fc9i3o4M0CHKxcjVG3D4rdWzAKedsTBKOv5Sm8uORcRA/exec";

/* =========================================================
CONTACT FORM
========================================================= */

const contactForm = $("#contactForm");
const formMessage = $("#formMessage");


/* =========================================================
FORM MESSAGE
========================================================= */

function setFormMessage(message = "", type = "") {

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


/* =========================================================
CONTACT FORM SUBMISSION
========================================================= */

if (contactForm) {

contactForm.addEventListener(
 "submit",
 async (event) => {

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

   const originalButtonHTML =
     submitButton.innerHTML;


   /* -----------------------------------------------------
      Loading state
      ----------------------------------------------------- */

   submitButton.disabled = true;

   submitButton.innerHTML =
     'Sending enquiry <span>…</span>';

   setFormMessage();


   /* -----------------------------------------------------
      Collect form data
      ----------------------------------------------------- */

   const formData =
     new FormData(contactForm);


   const submission =
     new URLSearchParams();


   submission.append(
     "name",
     String(
       formData.get("name") || ""
     ).trim()
   );

   submission.append(
     "email",
     String(
       formData.get("email") || ""
     ).trim()
   );

   submission.append(
     "goal",
     String(
       formData.get("goal") || ""
     ).trim()
   );

   submission.append(
     "budget",
     String(
       formData.get("budget") || ""
     ).trim()
   );

   submission.append(
     "timeline",
     String(
       formData.get("timeline") || ""
     ).trim()
   );

   submission.append(
     "message",
     String(
       formData.get("message") || ""
     ).trim()
   );


   /* -----------------------------------------------------
      Extra validation
      ----------------------------------------------------- */

   const name =
     String(formData.get("name") || "").trim();

   const email =
     String(formData.get("email") || "").trim();

   const goal =
     String(formData.get("goal") || "").trim();

   const message =
     String(formData.get("message") || "").trim();


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

     submitButton.disabled = false;

     submitButton.innerHTML =
       originalButtonHTML;

     return;
   }


   /* -----------------------------------------------------
      SEND TO GOOGLE APPS SCRIPT
      ----------------------------------------------------- */

   try {

     /*
      * IMPORTANT:
      *
      * We intentionally use no-cors.
      *
      * Google Apps Script Web Apps are cross-origin.
      * no-cors allows the browser to send the POST
      * without the browser blocking the request.
      *
      * DO NOT add a Content-Type header here.
      */

     await fetch(
       GOOGLE_SCRIPT_URL,
       {
         method: "POST",
         mode: "no-cors",
         body: submission
       }
     );


     /*
      * With no-cors, the browser cannot read Google's
      * response. However, if fetch completes without
      * throwing a network error, the POST was sent.
      */


     /* ---------------------------------------------------
        SUCCESS
        --------------------------------------------------- */

     contactForm.reset();


     // Reset planner
     if (
       typeof resetPlanner === "function"
     ) {

       resetPlanner();

     }


     setFormMessage(
       "Thanks! Your project enquiry has been sent. We'll get back to you within 1 business day.",
       "success"
     );


     if (
       typeof showToast === "function"
     ) {

       showToast(
         "Project enquiry sent successfully."
       );

     }


   } catch (error) {

     console.error(
       "Webcraft form error:",
       error
     );


     setFormMessage(
       "We couldn't send your enquiry right now. Please try again.",
       "error"
     );


     if (
       typeof showToast === "function"
     ) {

       showToast(
         "Unable to send enquiry."
       );

     }


   } finally {

     submitButton.disabled = false;

     submitButton.innerHTML =
       originalButtonHTML;

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
