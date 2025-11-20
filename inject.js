// Inject favicon
(function() {
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/webp";
  link.href = "https://plusbrand.com/wp-content/uploads/2025/11/ALETHRA_Logo-scaled.webp";
  document.head.appendChild(link);
})();

// NAV (ONE FILE ONLY)
fetch("/nav.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("nav-placeholder").innerHTML = html;
    initNavLogic(); // runs once = stable
  });

// FOOTER
fetch("/footer.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("footer-placeholder").innerHTML = html;
  });
