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
document.addEventListener("DOMContentLoaded", function (event) {
  var select = document.getElementById("monthYearSelect");

  // Starting from January 2015 to December 2015
  var startDate = new Date("2015-01-01");
  var endDate = new Date("2015-12-31");
  var currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    var monthYear = currentDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
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

/* table penjualan */
fetch("table_penjualan.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (products) {
    products = products.slice(0, 10);

    let placeholder = document.querySelector("#data-output");
    let out = "";
    for (let product of products) {
      out += `
        <tr>
          <td>${product.Name}</td>
          <td>${product.Size}</td>
          <td>${product.Category}</td>
          <td>${product.Price}</td>
          <td>${product.Order_vol}</td>
        </tr>
      `;
    }
    placeholder.innerHTML = out;
  });

/* time barchart */
const ctx = document.getElementById("timebarchart");

fetch("time_of_pizza_sales.json")
  .then(function (response) {
    if (response.ok == true) {
      return response.json();
    }
  })
  .then(function (data) {
    console.log(data);
    createchart(data, "bar");
  });

function createchart(data, type) {
  new Chart(ctx, {
    type: type,
    data: {
      labels: data.map((row) => row.Times),
      datasets: [
        {
          label: "Record Count",
          data: data.map((row) => row.Record_Count),
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

/* revenue linechart */
const ctx2 = document.getElementById("revenue");

fetch("revenue.json")
  .then(function (response) {
    if (response.ok == true) {
      return response.json();
    }
  })
  .then(function (data2) {
    console.log(data2);
    createchart2(data2, "line");
  });

function createchart2(data2, type2) {
  new Chart(ctx2, {
    type: type2,
    data: {
      labels: data2.map((row) => row.Bulan_Tahun),
      datasets: [
        {
          label: "price",
          data: data2.map((row) => row.price),
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

/* price range barchart*/
