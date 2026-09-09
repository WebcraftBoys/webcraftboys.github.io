"use strict";

const page$ = (selector, parent = document) => parent.querySelector(selector);
const page$$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
const getFieldValue = (fd, name) => String(fd.get(name) || "").trim();

function setContactMessage(message = "", type = "") {
  const el = page$("#contactMessage");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("success", "error");
  if (type) el.classList.add(type);
}

function initContactForm() {
  const form = page$("#contactForm");
  if (!form || form.dataset.contactInitialized === "true") return;
  form.dataset.contactInitialized = "true";
  const submit = form.querySelector('button[type="submit"]');
  if (!submit) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setContactMessage();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const fd = new FormData(form);
    if (getFieldValue(fd, "website_check")) return;
    const name=getFieldValue(fd,"name"), email=getFieldValue(fd,"email"), phone=getFieldValue(fd,"phone");
    const project=getFieldValue(fd,"project"), timeline=getFieldValue(fd,"timeline"), website=getFieldValue(fd,"website");
    const source=getFieldValue(fd,"source"), message=getFieldValue(fd,"message");

    if ([name,email,phone,project,timeline,message].some(v => !v)) {
      setContactMessage("Please complete all required fields.", "error"); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setContactMessage("Please enter a valid email address.", "error"); return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setContactMessage("Please enter a valid phone number.", "error"); return;
    }
    if (message.length < 20) {
      setContactMessage("Please give us a little more detail about the project (at least 20 characters).", "error"); return;
    }

    const original = submit.innerHTML;
    submit.disabled = true;
    submit.setAttribute("aria-busy","true");
    submit.innerHTML = 'Sending enquiry <span aria-hidden="true">…</span>';

    try {
      const endpoint = String(window.WEBCRAFT_CONTACT_ENDPOINT || "").trim();
      if (!endpoint || endpoint.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
        throw new Error("Contact endpoint is not configured.");
      }
      const request = new URLSearchParams({ name,email,phone,project,timeline,website,source,message,website_check:"" });
      await fetch(endpoint, {
        method:"POST", mode:"no-cors",
        headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
        body:request.toString(), keepalive:true
      });
      form.reset();
      setContactMessage("Thanks! Your enquiry has been sent. We'll get back to you within 1–2 business days.", "success");
      if (typeof showToast === "function") showToast("Enquiry sent successfully.");
    } catch (error) {
      console.error("Webcraft contact form error:", error);
      setContactMessage("We couldn't send your enquiry right now. Please try again or email us directly.", "error");
      if (typeof showToast === "function") showToast("Unable to send enquiry.");
    } finally {
      submit.disabled=false; submit.removeAttribute("aria-busy"); submit.innerHTML=original;
    }
  });
}

function initPortfolioFilters() {
  const buttons=page$$(".filter"), cards=page$$(".case-card, .work-project-card");
  if (!buttons.length || !cards.length) return;
  const empty=page$("#workEmpty");
  const count=page$("#workCount");
  const apply=selected => {
    buttons.forEach(b => { const active=(b.dataset.filter||"all")===selected; b.classList.toggle("active",active); b.setAttribute("aria-pressed",String(active)); });
    let visible=0;
    cards.forEach(card => { const show=selected==="all" || (card.dataset.category||"")===selected; card.classList.toggle("hidden",!show); card.setAttribute("aria-hidden",String(!show)); if(show) visible++; });
    if(empty) empty.classList.toggle("visible",visible===0);
    if(count) count.textContent=String(visible);
  };
  buttons.forEach(button => { button.addEventListener("click",()=>apply(button.dataset.filter||"all")); });
  apply(page$(".filter.active")?.dataset.filter || "all");
}

function initProjectPlanner() {
  const goals=page$$('.goal');
  if(!goals.length) return;
  const output=page$("#goalOutput"), select=page$("#goalSelect"), next=page$("#plannerNext");
  const choose=button => {
    const goal=String(button.dataset.goal||"").trim(); if(!goal) return;
    goals.forEach(item=>{const active=item===button; item.classList.toggle("active",active); item.setAttribute("aria-pressed",String(active));});
    if(output) output.textContent=goal;
    if(select) { select.value=goal; select.dispatchEvent(new Event("change",{bubbles:true})); }
  };
  goals.forEach(goal=>{ if(goal.tagName!=="BUTTON" && goal.getAttribute("role")!=="button") { goal.setAttribute("role","button"); goal.setAttribute("tabindex","0"); } goal.setAttribute("aria-pressed",goal.classList.contains("active")?"true":"false"); goal.addEventListener("click",()=>choose(goal)); goal.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose(goal);}}); });
  next?.addEventListener("click",()=>{ const active=page$(".goal.active"); if(active) choose(active); });
  const initial=page$(".goal.active")||goals[0]; if(initial) choose(initial);
}

function initCaseStudyModal() {
  const modal=page$("#caseModal"); if(!modal || modal.dataset.modalInitialized==="true") return;
  modal.dataset.modalInitialized="true";
  const title=page$("#modalTitle"), description=page$("#modalDescription"), result=page$("#modalResult"), close=page$(".modal-close"), backdrop=page$(".modal-backdrop"), cta=page$(".modal-cta");
  let lastFocus=null;
  const open=card=>{ if(!card)return; lastFocus=document.activeElement; if(title)title.textContent=card.dataset.title||"Project"; if(description)description.textContent=card.dataset.description||""; if(result)result.textContent=card.dataset.result||""; modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; close?.focus(); };
  const shut=()=>{ modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); document.body.style.overflow=""; lastFocus?.focus?.(); lastFocus=null; };
  page$$(".case-open").forEach(button=>button.addEventListener("click",()=>open(button.closest(".case-card"))));
  close?.addEventListener("click",shut); backdrop?.addEventListener("click",shut); cta?.addEventListener("click",shut);
  document.addEventListener("keydown",e=>{
    if(!modal.classList.contains("open")) return;
    if(e.key==="Escape") { shut(); return; }
    if(e.key==="Tab") {
      const focusables=page$$('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',modal);
      if(!focusables.length)return;
      const first=focusables[0], last=focusables[focusables.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
}

function initPageFeatures(){ initPortfolioFilters(); initProjectPlanner(); initCaseStudyModal(); initContactForm(); }
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initPageFeatures,{once:true}); else initPageFeatures();
