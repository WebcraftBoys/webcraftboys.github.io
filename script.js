

/* =========================================================
HELPERS
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

if (!loader) return;

loader.classList.add("hidden");
}

/*
Hide loader when everything is ready.
The timeout is only a fallback so the website
can never remain stuck on the loading screen.
*/

window.addEventListener("load", () => {
setTimeout(hideLoader, 400);
});

/*
Safety fallback.

If something external takes too long to load,
remove the loader anyway.
*/

setTimeout(hideLoader, 2500);

/* =========================================================
MOBILE NAVIGATION
========================================================= */

const menuToggle = $(".menu-toggle");
const navLinks = $("#navLinks");

if (menuToggle && navLinks) {

menuToggle.addEventListener("click", () => {

```
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
```

});

$$$(".nav-links a", navLinks).forEach(link => {

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

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          revealObserver.unobserve(
            entry.target
          );

        }

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

/*
  Older browsers:
  simply show everything.
*/

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


  /*
    Update active button.
  */

  filterButtons.forEach(item => {

    item.classList.remove("active");

  });

  button.classList.add("active");


  /*
    Show / hide portfolio cards.
  */

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

/*
  Remove active state.
*/

goals.forEach(goal => {

  goal.classList.remove("active");

});


/*
  Activate selected goal.
*/

goalButton.classList.add("active");


/*
  Update planner label.
*/

if (goalOutput) {

  goalOutput.textContent =
    selectedGoal;

}


/*
  Update contact form.
*/

if (goalSelect) {

  goalSelect.value =
    selectedGoal;

}

}


/*
Goal buttons.
*/

goals.forEach(goal => {

goal.addEventListener("click", () => {

  selectGoal(goal);

});

});


/*
Continue button.

The HTML anchor automatically scrolls to #contact.
We only make sure the selected value is carried over.
*/

if (plannerNext) {

plannerNext.addEventListener("click", () => {

  const activeGoal =
    $(".goal.active");

  if (activeGoal) {

    selectGoal(activeGoal);

  }

});

}


/* =========================================================
 CASE STUDY MODAL
========================================================= */

const modal = $("#caseModal");

const modalTitle = $("#modalTitle");
const modalDescription = $("#modalDescription");
const modalResult = $("#modalResult");

const modalClose = $(".modal-close");
const modalBackdrop = $(".modal-backdrop");
const modalCTA = $(".modal-cta");


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


$$(".case-open").forEach(button => {

button.addEventListener("click", () => {

  const card =
    button.closest(".case-card");

  openModal(card);

});

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

  if (event.key === "Escape") {

    closeModal();

  }

}
);


/* =========================================================
 GOOGLE APPS SCRIPT
========================================================= */


/*
YOUR GOOGLE APPS SCRIPT WEB APP URL.

Keep the /exec at the end.
*/

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbwYpb0O9sbxglGrC2GyXXCkPn4Siflbq2LrM3-U8zGIPbaaPJtcOFFW3lh5wyuU_Jr-uA/exec";


/* =========================================================
 CONTACT FORM
========================================================= */

const contactForm = $("#contactForm");
const formMessage = $("#formMessage");


function setFormMessage(message, type = "") {

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


/*
Submit enquiry.
*/

if (contactForm) {

contactForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const submitButton =
      contactForm.querySelector(
        'button[type="submit"]'
      );


    if (!submitButton) return;


    /*
      Browser validation.
    */

    if (!contactForm.checkValidity()) {

      contactForm.reportValidity();

      return;

    }


    /*
      Save original button.
    */

    const originalButton =
      submitButton.innerHTML;


    /*
      Loading state.
    */

    submitButton.disabled =
      true;

    submitButton.innerHTML =
      "Sending enquiry <span>…</span>";


    setFormMessage("");


    /*
      Collect form.
    */

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


    /*
      Extra validation.
    */

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

      submitButton.disabled =
        false;

      submitButton.innerHTML =
        originalButton;

      return;

    }


    try {

      /*
        Send to Google Apps Script.

        IMPORTANT:
        We use text/plain instead of
        application/json to avoid a CORS
        preflight request with Apps Script.
      */

      const response =
        await fetch(
          GOOGLE_SCRIPT_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "text/plain;charset=utf-8"
            },

            body:
              JSON.stringify(enquiry)
          }
        );


      /*
        Read response as text first.

        This prevents JSON parsing errors
        from breaking the form if Google
        returns a non-JSON response.
      */

      const responseText =
        await response.text();


      let result = null;


      try {

        result =
          JSON.parse(responseText);

      } catch {

        /*
          If Apps Script returned something
          unexpected, throw a useful error.
        */

        throw new Error(
          "The server returned an invalid response."
        );

      }


      /*
        Check server result.
      */

      if (
        !response.ok ||
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error ||
          "Unable to send the enquiry."
        );

      }


      /*
        SUCCESS
      */

      contactForm.reset();


      /*
        Reset planner.
      */

      goals.forEach(goal => {

        goal.classList.remove(
          "active"
        );

      });


      const defaultGoal =
        $(".goal[data-goal='New business website']");


      if (defaultGoal) {

        defaultGoal.classList.add(
          "active"
        );

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
        "Project enquiry sent."
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

      /*
        Restore button.
      */

      submitButton.disabled =
        false;

      submitButton.innerHTML =
        originalButton;

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


toast.textContent =
  message;

toast.classList.add("show");


clearTimeout(toastTimer);


toastTimer =
  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

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

      title:
        "Webcraft",

      text:
        "Webcraft — websites that work.",

      url:
        window.location.href

    };


    /*
      Native share.
    */

    if (
      navigator.share &&
      typeof navigator.share ===
        "function"
    ) {

      try {

        await navigator.share(
          shareData
        );

      } catch (error) {

        /*
          User cancelled.
          Nothing to do.
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
      Clipboard fallback.
    */

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
 DEBUG MESSAGE
========================================================= */

console.log(
"Webcraft website initialized successfully."
);
