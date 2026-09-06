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
