//Toggle class active
const navbarNav = document.querySelector(".navbar-nav");

//ketika menu diklik
document.querySelector("#menu").onclick = () => {
  navbarNav.classList.toggle("active");
};

// Klik diluar sidebar untuk menghilangkan nav
const menu = document.querySelector("#menu");

document.addEventListener("click", function (e) {
  if (!menu.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
});

// filtering dropdown date//
// JavaScript for dynamically generating select options
document.addEventListener("DOMContentLoaded", function(event) { 
  var select = document.getElementById("monthYearSelect");

  // Starting from January 2015 to December 2015
  var startDate = new Date("2015-01-01");
  var endDate = new Date("2015-12-31");
  var currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    var monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    var option = document.createElement("option");
    option.text = monthYear;
    option.value = monthYear;
    select.add(option);

    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
});

// Function to filter based on selected month and year
function filterTable() {
  var selectedMonthYear = document.getElementById("monthYearSelect").value;
  alert("You selected: " + selectedMonthYear); // Replace this with your logic
}