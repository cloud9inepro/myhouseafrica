document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("btn-toggle");
    const navSide = document.querySelector(".nav-side");

    toggleBtn.addEventListener("click", () => {
      navSide.classList.toggle("active");
      toggleBtn.classList.toggle("active");
    });
  });