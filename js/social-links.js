/* Webcraft social links — edit these five URLs once and every public page updates. */
window.WEBCRAFT_SOCIAL_LINKS = {
  instagram: "", // https://www.instagram.com/yourhandle/
  facebook: "",  // https://www.facebook.com/yourpage/
  x: "",         // https://x.com/yourhandle
  youtube: "",   // https://www.youtube.com/@yourchannel
  github: ""     // https://github.com/yourusername
};

document.addEventListener("DOMContentLoaded", () => {
  const links = window.WEBCRAFT_SOCIAL_LINKS || {};
  document.querySelectorAll("[data-social]").forEach(link => {
    const key = link.dataset.social;
    link.hidden = false;
    const url = String(links[key] || "").trim();
    if (!url) {
      link.classList.add("unconfigured");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
      link.title = `Add your ${key} profile URL in js/social-links.js`;
      link.addEventListener("click", event => event.preventDefault());
      return;
    }
    link.href = url;
    link.hidden = false;
  });
});
