function toggleDropdown() {
  const dropdownContent = document.getElementById("language-selector");
  dropdownContent.classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('.dropdown-button')) {
    const openDropdown = document.getElementById("language-selector");
    if (openDropdown.classList.contains('show')) {
      openDropdown.classList.remove('show');
    }
  }
};
