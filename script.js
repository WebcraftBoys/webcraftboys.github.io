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
```javascript
// ============================================================
// PROJECT PLANNER
// ============================================================

$$(".goal").forEach(goal => {
  goal.addEventListener("click", () => {
    // Remove active state from all goals
    $$(".goal").forEach(item => item.classList.remove("active"));

    // Activate selected goal
    goal.classList.add("active");

    // Update planner text
    $("#goalOutput").textContent = goal.dataset.goal;

    // Carry selection into contact form
    $("#goalSelect").value = goal.dataset.goal;
  });
});

// Continue from planner to contact section
$("#plannerNext")?.addEventListener("click", () => {
  const selectedGoal = $(".goal.active")?.dataset.goal;

  if (selectedGoal) {
    $("#goalSelect").value = selectedGoal;
  }
});


// ============================================================
// CASE STUDY MODAL
// ============================================================

const modal = $("#caseModal");

$$(".case-open").forEach(button => {
  button.addEventListener("click", () => {
    const card = button.closest(".case-card");

    if (!card || !modal) return;

    $("#modalTitle").textContent = card.dataset.title || "";
    $("#modalDescription").textContent = card.dataset.description || "";
    $("#modalResult").textContent = card.dataset.result || "";

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    // Prevent background scrolling
    document.body.style.overflow = "hidden";
  });
});

// Close modal
function closeModal() {
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  // Restore scrolling
  document.body.style.overflow = "";
}

$(".modal-close")?.addEventListener("click", closeModal);
$(".modal-backdrop")?.addEventListener("click", closeModal);

// Close modal with Escape key
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Close modal when CTA is clicked
$(".modal-cta")?.addEventListener("click", closeModal);


// ============================================================
// CONTACT FORM
// GOOGLE APPS SCRIPT BACKEND
// ============================================================

// IMPORTANT:
// Replace this URL with your Google Apps Script Web App URL.
//
// Example:
// https://script.google.com/macros/s/XXXXXXXXXXXX/exec

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYpb0O9sbxglGrC2GyXXCkPn4Siflbq2LrM3-U8zGIPbaaPJtcOFFW3lh5wyuU_Jr-uA/exec";

$("#contactForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const formMessage = $("#formMessage");

  if (!button || !formMessage) return;

  // Save original button text
  const originalButtonHTML = button.innerHTML;

  // Loading state
  button.disabled = true;
  button.innerHTML = 'Sending brief <span>…</span>';

  formMessage.textContent = "";
  formMessage.classList.remove("error", "success");

  // Collect form data
  const formData = new FormData(form);

  const enquiry = {
    name: formData.get("name")?.trim() || "",
    email: formData.get("email")?.trim() || "",
    goal: formData.get("goal") || "",
    budget: formData.get("budget") || "",
    timeline: formData.get("timeline") || "",
    message: formData.get("message")?.trim() || ""
  };

  // Basic validation
  if (
    !enquiry.name ||
    !enquiry.email ||
    !enquiry.goal ||
    !enquiry.message
  ) {
    formMessage.textContent =
      "Please complete all required fields.";

    formMessage.classList.add("error");

    button.disabled = false;
    button.innerHTML = originalButtonHTML;

    return;
  }

  try {
    // Send enquiry to Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(enquiry)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        result.error || "Unable to submit the enquiry."
      );
    }

    // Clear form after successful submission
    form.reset();

    // Reset planner selection
    $$(".goal").forEach(goal => {
      goal.classList.remove("active");
    });

    $(".goal[data-goal='New business website']")?.classList.add("active");

    if ($("#goalOutput")) {
      $("#goalOutput").textContent = "New business website";
    }

    // Success message
    formMessage.textContent =
      "Thanks! Your project brief has been sent. We'll get back to you within 1 business day.";

    formMessage.classList.add("success");

    showToast("Project brief sent successfully.");

  } catch (error) {

    console.error("Form submission error:", error);

    formMessage.textContent =
      "Something went wrong while sending your brief. Please try again.";

    formMessage.classList.add("error");

    showToast("Unable to send your brief.");

  } finally {

    // Restore button
    button.disabled = false;
    button.innerHTML = originalButtonHTML;
  }
});


// ============================================================
// TOAST NOTIFICATION
// ============================================================

function showToast(text) {
  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}


// ============================================================
// SHARE WEBSITE
// ============================================================

$("#shareButton")?.addEventListener("click", async () => {

  // Native sharing on supported devices
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Webcraft",
        text: "Webcraft — websites that work.",
        url: window.location.href
      });
    } catch {
      // User cancelled sharing
    }

    return;
  }

  // Fallback: copy URL
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast("Webcraft link copied.");
  } catch {
    showToast("Unable to copy the link.");
  }
});


// ============================================================
// CURRENT YEAR
// ============================================================

if ($("#year")) {
  $("#year").textContent = new Date().getFullYear();
}


// ============================================================
// MAGNETIC BUTTON EFFECT
// Desktop / Fine Pointer Only
// ============================================================

if (window.matchMedia("(pointer: fine)").matches) {

  $$(".magnetic").forEach(button => {

    button.addEventListener("mousemove", event => {

      const rect = button.getBoundingClientRect();

      const x =
        (event.clientX - rect.left - rect.width / 2) * 0.06;

      const y =
        (event.clientY - rect.top - rect.height / 2) * 0.06;

      button.style.transform =
        `translate(${x}px, ${y}px)`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "";
    });

  });
}

