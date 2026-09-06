<<<<<<< HEAD
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

window.addEventListener("load",()=>setTimeout(()=>$("#loader")?.classList.add("hidden"),500));

const menuToggle=$(".menu-toggle"),navLinks=$("#navLinks");
menuToggle?.addEventListener("click",()=>{const open=navLinks.classList.toggle("open");menuToggle.setAttribute("aria-expanded",open)});
navLinks?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>navLinks.classList.remove("open")));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});
$$(".reveal").forEach(el=>revealObserver.observe(el));

$$(".filter").forEach(button=>button.addEventListener("click",()=>{
  $$(".filter").forEach(b=>b.classList.remove("active"));button.classList.add("active");
  const filter=button.dataset.filter;
  $$(".case-card").forEach(card=>card.classList.toggle("hidden",filter!=="all"&&card.dataset.category!==filter));
}));

// Functional mini project planner: selection carries into the contact brief.
$$(".goal").forEach(goal=>goal.addEventListener("click",()=>{
  $$(".goal").forEach(g=>g.classList.remove("active"));goal.classList.add("active");
  $("#goalOutput").textContent=goal.dataset.goal;
  $("#goalSelect").value=goal.dataset.goal;
}));
$("#plannerNext")?.addEventListener("click",()=>{const selected=$(".goal.active")?.dataset.goal;if(selected)$("#goalSelect").value=selected});

const modal=$("#caseModal");
$$(".case-open").forEach(btn=>btn.addEventListener("click",()=>{
  const card=btn.closest(".case-card");
  $("#modalTitle").textContent=card.dataset.title;
  $("#modalDescription").textContent=card.dataset.description;
  $("#modalResult").textContent=card.dataset.result;
  modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
}));
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.style.overflow=""}
$(".modal-close")?.addEventListener("click",closeModal);$(".modal-backdrop")?.addEventListener("click",closeModal);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
$(".modal-cta")?.addEventListener("click",closeModal);

$("#contactForm")?.addEventListener("submit",e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget), name=data.get("name"),email=data.get("email"),goal=data.get("goal");
  const subject=encodeURIComponent(`Webcraft project enquiry — ${goal}`);
  const body=encodeURIComponent(`Name: ${name}\nEmail: ${email}\nGoal: ${goal}\nBudget: ${data.get("budget")}\nTimeline: ${data.get("timeline")}\n\nProject details:\n${data.get("message")}`);
  $("#formMessage").innerHTML=`Brief created. <a href="mailto:?subject=${subject}&body=${body}">Open your email app to send it →</a>`;
  $("#formMessage").querySelector("a").style.color="#168789";
  showToast("Your project brief is ready to send.");
});

function showToast(text){const t=$("#toast");t.textContent=text;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400)}
$("#shareButton")?.addEventListener("click",async()=>{
  if(navigator.share){try{await navigator.share({title:"Webcraft",text:"Webcraft — websites that work.",url:location.href})}catch{}}
  else{await navigator.clipboard?.writeText(location.href);showToast("Webcraft link copied.");}
});
$("#year").textContent=new Date().getFullYear();

if(window.matchMedia("(pointer:fine)").matches){
  $$(".magnetic").forEach(btn=>{
    btn.addEventListener("mousemove",e=>{const r=btn.getBoundingClientRect();btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.06}px,${(e.clientY-r.top-r.height/2)*.06}px)`});
    btn.addEventListener("mouseleave",()=>btn.style.transform="");
  });
}
=======
"use strict";

/* =========================================================
   WEBCRAFT — MAIN JAVASCRIPT
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

setTimeout(hideLoader, 2500);


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initMobileNavigation() {
  const menuToggle = $(".menu-toggle");
  const navLinks = $("#navLinks");

  if (!menuToggle || !navLinks) return;

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

  const observer =
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");

          observer.unobserve(
            entry.target
          );
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
  const buttons = $$(".filter");
  const cards = $$(".case-card");

  if (!buttons.length || !cards.length) {
    return;
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {

      const filter =
        button.dataset.filter || "all";

      buttons.forEach(item => {
        item.classList.toggle(
          "active",
          item === button
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
      });
    });
  });
}


/* =========================================================
   PROJECT PLANNER
   ========================================================= */

const DEFAULT_GOAL =
  "New business website";


function initProjectPlanner() {

  const goals = $$(".goal");
  const goalOutput = $("#goalOutput");
  const goalSelect = $("#goalSelect");
  const plannerNext = $("#plannerNext");

  if (!goals.length) return;


  function selectGoal(button) {

    if (!button) return;

    const goal =
      String(
        button.dataset.goal || ""
      ).trim();

    if (!goal) return;


    goals.forEach(item => {
      item.classList.toggle(
        "active",
        item === button
      );
    });


    if (goalOutput) {
      goalOutput.textContent = goal;
    }


    if (goalSelect) {
      goalSelect.value = goal;
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
    });


    if (goalOutput) {
      goalOutput.textContent =
        DEFAULT_GOAL;
    }


    if (goalSelect) {
      goalSelect.value =
        DEFAULT_GOAL;
    }
  }


  // Used by the contact form after
  // successful submission.
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


  // Initial state.
  const activeGoal =
    $(".goal.active") ||
    goals.find(
      goal =>
        goal.dataset.goal ===
        DEFAULT_GOAL
    ) ||
    goals[0];

  if (activeGoal) {
    selectGoal(activeGoal);
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


  function openModal(card) {

    if (!card) return;


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
  }


  function closeModal() {

    modal.classList.remove("open");

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow =
      "";
  }


  $$(".case-open").forEach(button => {

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

      toast.classList.remove(
        "show"
      );

    }, 3000);
}


/* =========================================================
   GOOGLE APPS SCRIPT
   ========================================================= */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxzBsIdFDmSS5gu2lh3thPUs-Fc9i3o4M0CHKxcjVG3D4rdWzAKedsTBKOv5Sm8uORcRA/exec";


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


  if (type) {
    formMessage.classList.add(type);
  }
}


/* =========================================================
   FORM VALUE HELPER
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

  const form =
    $("#contactForm");

  if (!form) return;


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const button =
        form.querySelector(
          'button[type="submit"]'
        );


      if (!button) return;


      /* ---------------------------------------------------
         Browser validation
         --------------------------------------------------- */

      if (!form.checkValidity()) {

        form.reportValidity();

        return;
      }


      /* ---------------------------------------------------
         Collect data
         --------------------------------------------------- */

      const formData =
        new FormData(form);


      const name =
        getFormValue(
          formData,
          "name"
        );

      const email =
        getFormValue(
          formData,
          "email"
        );

      const goal =
        getFormValue(
          formData,
          "goal"
        );

      const budget =
        getFormValue(
          formData,
          "budget"
        );

      const timeline =
        getFormValue(
          formData,
          "timeline"
        );

      const message =
        getFormValue(
          formData,
          "message"
        );


      /* ---------------------------------------------------
         Required validation
         --------------------------------------------------- */

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


      /* ---------------------------------------------------
         Save button state
         --------------------------------------------------- */

      const originalHTML =
        button.innerHTML;


      button.disabled = true;

      button.innerHTML =
        "Sending enquiry <span>…</span>";


      setFormMessage();


      /* ---------------------------------------------------
         Prepare request
         --------------------------------------------------- */

      const request =
        new URLSearchParams();


      request.append(
        "name",
        name
      );

      request.append(
        "email",
        email
      );

      request.append(
        "goal",
        goal
      );

      request.append(
        "budget",
        budget
      );

      request.append(
        "timeline",
        timeline
      );

      request.append(
        "message",
        message
      );


      /* ---------------------------------------------------
         SEND
         --------------------------------------------------- */

      try {

        await fetch(
          GOOGLE_SCRIPT_URL,
          {
            method: "POST",
            mode: "no-cors",
            body: request
          }
        );


        /*
         * Google Apps Script receives the request,
         * saves it to the Sheet and sends the email.
         *
         * Because no-cors is being used, the browser
         * cannot read the JSON response.
         */


        /* -------------------------------------------------
           SUCCESS
           ------------------------------------------------- */

        form.reset();


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

        button.disabled = false;

        button.innerHTML =
          originalHTML;

      }

    }
  );
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

  const year =
    $("#year");

  if (!year) return;

  year.textContent =
    new Date().getFullYear();
}


/* =========================================================
   MAGNETIC BUTTONS
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


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initWebcraft
  );

} else {

  initWebcraft();

}
>>>>>>> ff26da2fab257828b2a241747fe0a62f55eb22bb
