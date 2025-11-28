// Add native lazy loading to all images
document.querySelectorAll("img").forEach(function (img) {
  if (!img.hasAttribute("loading")) {
    img.setAttribute("loading", "lazy");
  }
});
