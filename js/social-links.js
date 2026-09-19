"use strict";

// Add Webcraft's real social URLs here. Leave a value blank to keep the icon inactive.
window.WEBCRAFT_SOCIALS = {
  instagram: "",
  facebook: "",
  x: "https://x.com/webcraftdevwork",
  youtube: "https://www.youtube.com/@WebcraftBoys",
  github: "https://github.com/WebcraftBoys/"
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-social]").forEach(link => {
    const key = link.getAttribute("data-social");
    const url = String(window.WEBCRAFT_SOCIALS?.[key] || "").trim();
    if (url) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.removeAttribute("aria-disabled");
    } else {
      link.href = "#";
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", e => e.preventDefault());
    }
  });
});
