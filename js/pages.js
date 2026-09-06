"use strict";

/**
 * =========================================================
 * WEBCRAFT — PAGE.JS
 * =========================================================
 *
 * Page-specific functionality:
 * - Portfolio filters
 * - Project planner
 * - Case study modal
 * - Contact form
 * - Google Apps Script submission
 */


/* =========================================================
   GOOGLE APPS SCRIPT
========================================================= */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxzBsIdFDmSS5gu2lh3thPUs-Fc9i3o4M0CHKxcjVG3D4rdWzAKedsTBKOv5Sm8uORcRA/exec";


function initWebcraft() {
  initLoader();
  initMobileNavigation();
  initScrollReveal();
  initPortfolioFilters();
  initProjectPlanner();
  initCaseStudyModal();
  initContactForm();
  initShareButton();
  initCurrentYear();
  initMagneticButtons();
}
/* =========================================================
   PORTFOLIO FILTERS
========================================================= */

function initPortfolioFilters() {
  const buttons = $$(".filter");

  /*
   * Support both the older .case-card markup
   * and the new Work page .work-project-card markup.
   */
  const cards = $$(".case-card, .work-project-card");

  if (!buttons.length || !cards.length) return;

  const updateFilter = selectedButton => {
    const filter =
      selectedButton.dataset.filter || "all";

    buttons.forEach(button => {
      const active =
        button === selectedButton;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    cards.forEach(card => {
      const category =
        card.dataset.category || "";

      const hidden =
        filter !== "all" &&
        category !== filter;

      card.classList.toggle(
        "hidden",
        hidden
      );

      card.setAttribute(
        "aria-hidden",
        String(hidden)
      );
    });
  };

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      updateFilter(button);
    });
  });

  const activeButton =
    $(".filter.active") || buttons[0];

  if (activeButton) {
    updateFilter(activeButton);
  }
}


/* =========================================================
   PROJECT PLANNER
========================================================= */

const DEFAULT_GOAL =
  "New business website";


function initProjectPlanner() {
  const goals = $$(".goal");

  if (!goals.length) return;

  const goalOutput =
    $("#goalOutput");

  const goalSelect =
    $("#goalSelect");

  const plannerNext =
    $("#plannerNext");


  function selectGoal(button) {
    if (!button) return;

    const goal =
      String(
        button.dataset.goal || ""
      ).trim();

    if (!goal) return;

    goals.forEach(item => {
      const active =
        item === button;

      item.classList.toggle(
        "active",
        active
      );

      item.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    if (goalOutput) {
      goalOutput.textContent = goal;
    }

    if (goalSelect) {
      goalSelect.value = goal;

      goalSelect.dispatchEvent(
        new Event("change", {
          bubbles: true
        })
      );
    }
  }


  function resetPlanner() {
    const defaultGoal =
      goals.find(
        goal =>
          goal.dataset.goal ===
          DEFAULT_GOAL
      );

    if (defaultGoal) {
      selectGoal(defaultGoal);
      return;
    }

    goals.forEach(goal => {
      goal.classList.remove("active");

      goal.setAttribute(
        "aria-pressed",
        "false"
      );
    });

    if (goalOutput) {
      goalOutput.textContent =
        DEFAULT_GOAL;
    }

    if (goalSelect) {
      goalSelect.value = "";
    }
  }


  // Make this available to the contact form.
  window.resetPlanner =
    resetPlanner;


  goals.forEach(goal => {
    goal.addEventListener(
      "click",
      () => {
        selectGoal(goal);
      }
    );
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


  const initialGoal =
    $(".goal.active") ||
    goals.find(
      goal =>
        goal.dataset.goal ===
        DEFAULT_GOAL
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

  const modalTitle =
    $("#modalTitle");

  const modalDescription =
    $("#modalDescription");

  const modalResult =
    $("#modalResult");

  const modalClose =
    $(".modal-close");

  const modalBackdrop =
    $(".modal-backdrop");

  const modalCTA =
    $(".modal-cta");

  let lastFocusedElement = null;


  function openModal(card) {
    if (!card) return;

    lastFocusedElement =
      document.activeElement;

    if (modalTitle) {
      modalTitle.textContent =
        card.dataset.title ||
        "Project";
    }

    if (modalDescription) {
      modalDescription.textContent =
        card.dataset.description ||
        "";
    }

    if (modalResult) {
      modalResult.textContent =
        card.dataset.result ||
        "";
    }

    modal.classList.add("open");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow =
      "hidden";

    modalClose?.focus();
  }


  function closeModal() {
    modal.classList.remove("open");

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow = "";

    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus ===
        "function"
    ) {
      lastFocusedElement.focus();
    }

    lastFocusedElement = null;
  }


  $$(".case-open").forEach(button => {
    button.addEventListener(
      "click",
      () => {
        const card =
          button.closest(".case-card");

        openModal(card);
      }
    );
  });


  modalClose?.addEventListener(
    "click",
    closeModal
  );

  modalBackdrop?.addEventListener(
    "click",
    closeModal
  );

  modalCTA?.addEventListener(
    "click",
    closeModal
  );


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
   FORM MESSAGE
========================================================= */

function setFormMessage(
  message = "",
  type = ""
) {
  const formMessage =
    $("#formMessage");

  if (!formMessage) return;

  formMessage.textContent =
    message;

  formMessage.classList.remove(
    "success",
    "error"
  );

  if (
    type === "success" ||
    type === "error"
  ) {
    formMessage.classList.add(type);
  }
}


/* =========================================================
   FORM VALUE
========================================================= */

function getFormValue(
  formData,
  field
) {
  return String(
    formData.get(field) || ""
  ).trim();
}

/* =========================================================
   CONTACT FORM
========================================================= */

function initContactForm() {
  const form = $("#contactForm");

  if (!form) return;

  const submitButton =
    form.querySelector('button[type="submit"]');

  const formMessage =
    $("#contactMessage");

  if (!submitButton) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (formMessage) {
      formMessage.textContent = "";
      formMessage.classList.remove(
        "success",
        "error"
      );
    }

    // Validate required fields.
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);

    const name =
      String(formData.get("name") || "").trim();

    const email =
      String(formData.get("email") || "").trim();

    const company =
      String(formData.get("company") || "").trim();

    const project =
      String(formData.get("project") || "").trim();

    const message =
      String(formData.get("message") || "").trim();

    if (!name || !email || !project || !message) {
      if (formMessage) {
        formMessage.textContent =
          "Please complete all required fields.";

        formMessage.classList.add("error");
      }

      return;
    }

    const originalHTML =
      submitButton.innerHTML;

    submitButton.disabled = true;

    submitButton.setAttribute(
      "aria-busy",
      "true"
    );

    submitButton.innerHTML =
      'Sending enquiry <span aria-hidden="true">…</span>';

    try {
      const request =
        new URLSearchParams();

      request.set("name", name);
      request.set("email", email);
      request.set("company", company);
      request.set("project", project);
      request.set("message", message);

      await fetch(
        GOOGLE_SCRIPT_URL,
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded;charset=UTF-8"
          },
          body: request.toString()
        }
      );

      form.reset();

      if (formMessage) {
        formMessage.textContent =
          "Thanks! Your project enquiry has been sent. We'll get back to you within 1–2 business days.";

        formMessage.classList.add("success");
      }

      showToast(
        "Project enquiry sent successfully."
      );

    } catch (error) {
      console.error(
        "Webcraft contact form error:",
        error
      );

      if (formMessage) {
        formMessage.textContent =
          "We couldn't send your enquiry right now. Please try again.";

        formMessage.classList.add("error");
      }

      showToast(
        "Unable to send enquiry."
      );

    } finally {
      submitButton.disabled = false;

      submitButton.removeAttribute(
        "aria-busy"
      );

      submitButton.innerHTML =
        originalHTML;
    }
  });
}
/* =========================================================
   INITIALIZE PAGE FEATURES
========================================================= */

function initPageFeatures() {
  initPortfolioFilters();
  initProjectPlanner();
  initCaseStudyModal();
  initContactForm();

  console.log(
    "Webcraft page.js initialized."
  );
}


/* =========================================================
   START
========================================================= */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initPageFeatures,
    { once: true }
  );
} else {
  initPageFeatures();
}
