"use strict";

/* =========================================================
   WEBCRAFT — MAIN JAVASCRIPT
========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];


/* =========================================================
   PAGE LOADER
========================================================= */

function hideLoader() {
  const loader = $("#loader");

  if (loader) {
    loader.classList.add("hidden");
  }
}

window.addEventListener("load", () => {
  setTimeout(hideLoader, 400);
});

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

    filterButtons.forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    caseCards.forEach(card => {

      const category =
        card.dataset.category || "";

      const hide =
        selectedFilter !== "all" &&
        category !== selectedFilter;

      card.classList.toggle(
        "hidden",
        hide
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

function selectGoal(goalButton) {

  if (!goalButton) return;

  const selectedGoal =
    goalButton.dataset.goal || "";

  goals.forEach(goal => {
    goal.classList.remove("active");
  });

  goalButton.classList.add("active");

  if (goalOutput) {
    goalOutput.textContent =
      selectedGoal;
  }

  if (goalSelect) {
    goalSelect.value =
      selectedGoal;
  }

}

goals.forEach(goal => {

  goal.addEventListener("click", () => {
    selectGoal(goal);
  });

});

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

  document.body.style.overflow = "hidden";
}

function closeModal() {

  if (!modal) return;

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";
}

$$(".case-open").forEach(button => {

  button.addEventListener("click", () => {

    const card =
      button.closest(".case-card");

    openModal(card);

  });

});

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

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {
    closeModal();
  }

});


/* =========================================================
   GOOGLE APPS SCRIPT
========================================================= */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwYpb0O9sbxglGrC2GyXXCkPn4Siflbq2LrM3-U8zGIPbaaPJtcOFFW3lh5wyuU_Jr-uA/exec";


/* =========================================================
   CONTACT FORM
========================================================= */

const contactForm = $("#contactForm");
const formMessage = $("#formMessage");

function setFormMessage(message, type = "") {

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
   SUBMIT CONTACT FORM
========================================================= */

if (contactForm) {

  contactForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();
      event.stopPropagation();


      const submitButton =
        contactForm.querySelector(
          'button[type="submit"]'
        );

      if (!submitButton) return;


      /* -----------------------------------------------------
         VALIDATION
      ----------------------------------------------------- */

      if (!contactForm.checkValidity()) {

        contactForm.reportValidity();

        return;

      }


      /* -----------------------------------------------------
         BUTTON STATE
      ----------------------------------------------------- */

      const originalButtonHTML =
        submitButton.innerHTML;

      submitButton.disabled = true;

      submitButton.innerHTML =
        'Sending enquiry <span>…</span>';

      setFormMessage("");


      /* -----------------------------------------------------
         GET FORM DATA
      ----------------------------------------------------- */

      const formData =
        new FormData(contactForm);

      const enquiry = {

        name:
          String(
            formData.get("name") || ""
          ).trim(),

        email:
          String(
            formData.get("email") || ""
          ).trim(),

        goal:
          String(
            formData.get("goal") || ""
          ).trim(),

        budget:
          String(
            formData.get("budget") || ""
          ).trim(),

        timeline:
          String(
            formData.get("timeline") || ""
          ).trim(),

        message:
          String(
            formData.get("message") || ""
          ).trim()

      };


      /* -----------------------------------------------------
         EXTRA VALIDATION
      ----------------------------------------------------- */

      if (
        !enquiry.name ||
        !enquiry.email ||
        !enquiry.goal ||
        !enquiry.message
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
         * We intentionally use:
         *
         *     mode: "no-cors"
         *
         * and URLSearchParams.
         *
         * This avoids the browser trying to perform
         * a CORS preflight against Google Apps Script.
         *
         * We do NOT try to read the response.
         */

        const body =
          new URLSearchParams();

        body.append(
          "name",
          enquiry.name
        );

        body.append(
          "email",
          enquiry.email
        );

        body.append(
          "goal",
          enquiry.goal
        );

        body.append(
          "budget",
          enquiry.budget
        );

        body.append(
          "timeline",
          enquiry.timeline
        );

        body.append(
          "message",
          enquiry.message
        );


        await fetch(
          GOOGLE_SCRIPT_URL,
          {
            method: "POST",
            mode: "no-cors",
            body: body
          }
        );


        /* ---------------------------------------------------
           SUCCESS
        --------------------------------------------------- */

        contactForm.reset();


        /* Reset planner */

        goals.forEach(goal => {
          goal.classList.remove("active");
        });


        const defaultGoal =
          $(".goal[data-goal='New business website']");

        if (defaultGoal) {
          defaultGoal.classList.add("active");
        }


        if (goalOutput) {
          goalOutput.textContent =
            "New business website";
        }


        if (goalSelect) {
          goalSelect.value = "";
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
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message) {

  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 2400);

}


/* =========================================================
   SHARE
========================================================= */

const shareButton =
  $("#shareButton");

if (shareButton) {

  shareButton.addEventListener(
    "click",
    async () => {

      const shareData = {

        title: "Webcraft",

        text:
          "Webcraft — websites that work.",

        url:
          window.location.href

      };


      if (
        navigator.share &&
        typeof navigator.share === "function"
      ) {

        try {

          await navigator.share(
            shareData
          );

        } catch (error) {

          if (
            error?.name !== "AbortError"
          ) {

            console.error(
              "Share error:",
              error
            );

          }

        }

        return;
      }


      try {

        if (
          navigator.clipboard &&
          navigator.clipboard.writeText
        ) {

          await navigator.clipboard.writeText(
            window.location.href
          );

          showToast(
            "Webcraft link copied."
          );

        } else {

          throw new Error(
            "Clipboard unavailable."
          );

        }

      } catch {

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

const yearElement =
  $("#year");

if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();

}


/* =========================================================
   MAGNETIC BUTTONS
========================================================= */

if (
  window.matchMedia &&
  window.matchMedia("(pointer: fine)").matches
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

        button.style.transform = "";

      }
    );

  });

}


/* =========================================================
   DEBUG
========================================================= */

console.log(
  "Webcraft website initialized successfully."
);
