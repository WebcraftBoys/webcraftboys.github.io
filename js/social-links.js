window.WEBCRAFT_SOCIALS = {
  instagram: "",
  facebook: "",
  x: "",
  youtube: "",
  github: ""
};

document.addEventListener("DOMContentLoaded", () => {
  const links = window.WEBCRAFT_SOCIALS || {};
  document.querySelectorAll("[data-social]").forEach((el) => {
    const key = el.getAttribute("data-social");
    const url = links[key];
    if (url) {
      el.href = url;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });
});
