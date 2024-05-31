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

/** chart*/
document.addEventListener("DOMContentLoaded", function () {
  let charts = {};

  // Function to create charts, generalized to handle different chart types
  function createChart(chartKey, ctx, data, type, labelKey, dataKey) {
    // Destroy the previous chart instance if it exists
    if (charts[chartKey]) {
      charts[chartKey].destroy();
    }
    charts[chartKey] = new Chart(ctx, {
      type: type,
      data: {
        labels: data.map((row) => row[labelKey]),
        datasets: [
          {
            label: "Record Count",
            data: data.map((row) => row[dataKey]),
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

  // Generic fetch function to get data and create charts
  function fetchDataAndCreateChart(
    url,
    chartKey,
    ctx,
    type,
    labelKey,
    dataKey
  ) {
    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        createChart(chartKey, ctx, data, type, labelKey, dataKey);
      })
      .catch(function (error) {
        console.error("There was a problem with the fetch operation:", error);
      });
  }

  /* time barchart */
  const ctx1 = document.getElementById("timebarchart");
  fetchDataAndCreateChart(
    "time_of_pizza_sales.json",
    "timeBarChart",
    ctx1,
    "bar",
    "Times",
    "Record_Count"
  );

  /* revenue linechart */
  const ctx2 = document.getElementById("revenue");
  fetchDataAndCreateChart(
    "revenue.json",
    "RevenueLineChart",
    ctx2,
    "line",
    "Bulan_Tahun",
    "price"
  );

  /* price range barchart */
  const ctx3 = document.getElementById("pricerange");
  fetchDataAndCreateChart(
    "price_range.json",
    "priceBarChart",
    ctx3,
    "bar",
    "pizza_id",
    "Record_Count"
  );

  /* top5 pizza sales barchart */
  const ctx4 = document.getElementById("top5pizza");
  fetchDataAndCreateChart(
    "top_5_pizza_sales.json",
    "top5pizzasales",
    ctx4,
    "bar",
    "pizza_id",
    "Record_Count"
  );

  /* bottom5 pizza sales barchart */
  const ctx5 = document.getElementById("bottom5pizza");
  fetchDataAndCreateChart(
    "bottom_5_pizza_sales.json",
    "bottom5pizzasales",
    ctx5,
    "bar",
    "pizza_id",
    "Record_Count"
  );
});
