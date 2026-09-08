"use strict";

/**
 * =========================================================
 * WEBCRAFT — PAGE.JS
 * =========================================================
 *
 * Page-specific functionality:
 *
 * - Contact form
 * - Google Apps Script submission
 * - Portfolio filters
 * - Project planner
 * - Case study modal
 *
 * Global functionality belongs in:
 * js/main.js
 */


/* =========================================================
   GOOGLE APPS SCRIPT
========================================================= */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxzBsIdFDmSS5gu2lh3thPUs-Fc9i3o4M0CHKxcjVG3D4rdWzAKedsTBKOv5Sm8uORcRA/exec";


/* =========================================================
   HELPERS
========================================================= */

const page$ = (selector, parent = document) =>
  parent.querySelector(selector);

const page$$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));


function getFieldValue(formData, fieldName) {
  return String(
    formData.get(fieldName) || ""
  ).trim();
}


/* =========================================================
   CONTACT FORM MESSAGE
========================================================= */

function setContactMessage(
  message = "",
  type = ""
) {
  const messageElement =
    page$("#contactMessage");

  if (!messageElement) return;

  messageElement.textContent =
    message;

  messageElement.classList.remove(
    "success",
    "error"
  );

  if (
    type === "success" ||
    type === "error"
  ) {
    messageElement.classList.add(type);
  }
}


/* =========================================================
   CONTACT FORM
========================================================= */

function initContactForm() {
  const form =
    page$("#contactForm");

  if (!form) return;


  /*
   * Prevent this function from being
   * initialized more than once.
   */
  if (
    form.dataset.contactInitialized ===
    "true"
  ) {
    return;
  }

  form.dataset.contactInitialized =
    "true";


  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  if (!submitButton) return;


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      /*
       * Clear previous status.
       */
      setContactMessage();


      /*
       * Native browser validation.
       */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }


      const formData =
        new FormData(form);


      /*
       * Current contact fields.
       *
       * Keep these names synchronized
       * with contact.html.
       */
      const name =
        getFieldValue(
          formData,
          "name"
        );

      const email =
        getFieldValue(
          formData,
          "email"
        );

      const phone =
        getFieldValue(
          formData,
          "phone"
        );

      const project =
        getFieldValue(
          formData,
          "project"
        );

      const timeline =
        getFieldValue(
          formData,
          "timeline"
        );

      const message =
        getFieldValue(
          formData,
          "message"
        );


      /*
       * Required-field validation.
       */
      if (
        !name ||
        !email ||
        !phone ||
        !project ||
        !timeline ||
        !message
      ) {
        setContactMessage(
          "Please complete all required fields.",
          "error"
        );

        return;
      }


      /*
       * Extra email validation.
       */
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        setContactMessage(
          "Please enter a valid email address.",
          "error"
        );

        return;
      }


      /*
       * Save original button contents.
       */
      const originalHTML =
        submitButton.innerHTML;


      /*
       * Prevent double submissions.
       */
      submitButton.disabled =
        true;

      submitButton.setAttribute(
        "aria-busy",
        "true"
      );

      submitButton.innerHTML =
        'Sending enquiry <span aria-hidden="true">…</span>';


      try {

        /*
         * Build URL-encoded request.
         *
         * This format works reliably with
         * Google Apps Script web apps.
         */
        const request =
          new URLSearchParams();


        request.set(
          "name",
          name
        );

        request.set(
          "email",
          email
        );

        request.set(
          "phone",
          phone
        );

        request.set(
          "project",
          project
        );

        request.set(
          "timeline",
          timeline
        );

        request.set(
          "message",
          message
        );


        /*
         * Submit to Google Apps Script.
         *
         * no-cors is intentional because the
         * frontend cannot reliably read the
         * response from another origin.
         */
        await fetch(
          GOOGLE_SCRIPT_URL,
          {
            method: "POST",

            mode: "no-cors",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded;charset=UTF-8"
            },

            body:
              request.toString()
          }
        );


        /*
         * The request completed.
         *
         * Because no-cors prevents us from
         * inspecting the response, we cannot
         * verify the Apps Script response body.
         */
        form.reset();


        /*
         * Show visible success state.
         */
        setContactMessage(
          "Thanks! Your enquiry has been sent. We'll get back to you within 1–2 business days.",
          "success"
        );


        /*
         * Use the global toast when available.
         */
        if (
          typeof showToast ===
          "function"
        ) {
          showToast(
            "Enquiry sent successfully."
          );
        }


      } catch (error) {

        console.error(
          "Webcraft contact form error:",
          error
        );


        setContactMessage(
          "We couldn't send your enquiry right now. Please try again.",
          "error"
        );


        if (
          typeof showToast ===
          "function"
        ) {
          showToast(
            "Unable to send enquiry."
          );
        }

      } finally {

        /*
         * Restore button.
         */
        submitButton.disabled =
          false;

        submitButton.removeAttribute(
          "aria-busy"
        );

        submitButton.innerHTML =
          originalHTML;
      }
    }
  );
}


/* =========================================================
   PORTFOLIO FILTERS
========================================================= */

function initPortfolioFilters() {
  const buttons =
    page$$(".filter");

  const cards =
    page$$(
      ".case-card, .work-project-card"
    );

  if (
    !buttons.length ||
    !cards.length
  ) {
    return;
  }


  /*
   * Prevent duplicate listeners.
   */
  buttons.forEach(button => {

    if (
      button.dataset.filterInitialized ===
      "true"
    ) {
      return;
    }

    button.dataset.filterInitialized =
      "true";


    button.addEventListener(
      "click",
      () => {

        const selectedFilter =
          button.dataset.filter ||
          "all";


        /*
         * Update active button.
         */
        buttons.forEach(item => {

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


        /*
         * Filter cards.
         */
        cards.forEach(card => {

          const category =
            card.dataset.category ||
            "";

          const hidden =
            selectedFilter !== "all" &&
            category !== selectedFilter;


          card.classList.toggle(
            "hidden",
            hidden
          );

          card.setAttribute(
            "aria-hidden",
            String(hidden)
          );
        });
      }
    );
  });


  /*
   * Initialize active filter.
   */
  const activeButton =
    page$(".filter.active") ||
    buttons[0];


  if (activeButton) {
    activeButton.click();
  }
}


/* =========================================================
   PROJECT PLANNER
========================================================= */

const DEFAULT_GOAL =
  "New business website";


function initProjectPlanner() {
  const goals =
    page$$(".goal");

  if (!goals.length) return;


  const goalOutput =
    page$("#goalOutput");

  const goalSelect =
    page$("#goalSelect");

  const plannerNext =
    page$("#plannerNext");


  function selectGoal(button) {
    if (!button) return;


    const goal =
      String(
        button.dataset.goal || ""
      ).trim();


    if (!goal) return;


    /*
     * Update selected goal.
     */
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


    /*
     * Update visible planner text.
     */
    if (goalOutput) {
      goalOutput.textContent =
        goal;
    }


    /*
     * Synchronize with any older
     * planner select if present.
     */
    if (goalSelect) {

      goalSelect.value =
        goal;

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

      goal.classList.remove(
        "active"
      );

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


  /*
   * Expose reset function for any
   * other page feature that needs it.
   */
  window.resetPlanner =
    resetPlanner;


  /*
   * Goal buttons.
   */
  goals.forEach(goal => {

    if (
      goal.dataset.plannerInitialized ===
      "true"
    ) {
      return;
    }

    goal.dataset.plannerInitialized =
      "true";


    goal.addEventListener(
      "click",
      () => {
        selectGoal(goal);
      }
    );
  });


  /*
   * Continue button.
   */
  plannerNext?.addEventListener(
    "click",
    () => {

      const activeGoal =
        page$(".goal.active");

      if (activeGoal) {
        selectGoal(activeGoal);
      }
    }
  );


  /*
   * Initialize planner state.
   */
  const initialGoal =
    page$(".goal.active") ||
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
  const modal =
    page$("#caseModal");

  if (!modal) return;


  if (
    modal.dataset.modalInitialized ===
    "true"
  ) {
    return;
  }

  modal.dataset.modalInitialized =
    "true";


  const modalTitle =
    page$("#modalTitle");

  const modalDescription =
    page$("#modalDescription");

  const modalResult =
    page$("#modalResult");

  const modalClose =
    page$(".modal-close");

  const modalBackdrop =
    page$(".modal-backdrop");

  const modalCTA =
    page$(".modal-cta");


  let lastFocusedElement =
    null;


  function openModal(card) {

    if (!card) return;


    lastFocusedElement =
      document.activeElement;


    /*
     * Populate modal.
     */
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


    /*
     * Open modal.
     */
    modal.classList.add(
      "open"
    );

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow =
      "hidden";


    /*
     * Move focus to close button.
     */
    modalClose?.focus();
  }


  function closeModal() {

    modal.classList.remove(
      "open"
    );

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow =
      "";


    /*
     * Restore focus.
     */
    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus ===
        "function"
    ) {
      lastFocusedElement.focus();
    }


    lastFocusedElement =
      null;
  }


  /*
   * Open buttons.
   */
  page$$(".case-open").forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const card =
            button.closest(
              ".case-card"
            );

          openModal(card);
        }
      );
    }
  );


  /*
   * Close controls.
   */
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


  /*
   * Escape key.
   */
  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        modal.classList.contains(
          "open"
        )
      ) {
        closeModal();
      }
    }
  );
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

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initPageFeatures,
    {
      once: true
    }
  );

} else {

  initPageFeatures();

}