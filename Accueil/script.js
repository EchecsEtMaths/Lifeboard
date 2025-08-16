function deconnexion() {
  window.location.href = "/index.html";
}

const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get("user");

if (user) {
  document.querySelectorAll(".menu-item").forEach((link) => {
    const linkUrl = new URL(link.href, window.location.origin);
    linkUrl.searchParams.set("user", user);
    link.href = linkUrl.toString();
  });
}
