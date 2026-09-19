"use strict";

/*
  Webcraft social links
  Replace only the URLs below with the real profiles.
*/
const WEBCRAFT_SOCIALS = [
  { label: "Instagram", short: "IG", url: "https://www.instagram.com/webcraftdevwork/" },
  { label: "Facebook", short: "FB", url: "https://www.facebook.com/webcraftdevwork/" },
  { label: "X", short: "X", url: "https://x.com/webcraftdevwork" },
  { label: "YouTube", short: "YT", url: "https://www.youtube.com/@WebcraftBoys" },
  { label: "GitHub", short: "GH", url: "https://github.com/WebcraftBoys" }
];

function renderWebcraftSocials() {
  document.querySelectorAll("[data-social-links]").forEach(container => {
    container.innerHTML = WEBCRAFT_SOCIALS.map(item => `
      <a class="social-pill" href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="Webcraft on ${item.label}">
        <span>${item.short}</span>
        <strong>${item.label}</strong>
      </a>
    `).join("");
  });
}

document.addEventListener("DOMContentLoaded", renderWebcraftSocials, { once: true });
