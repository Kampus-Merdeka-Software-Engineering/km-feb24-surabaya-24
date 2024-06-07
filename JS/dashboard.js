$(document).ready(function () {
  // Fetch the JSON data
  $.getJSON("pizza_places.json", function (data) {
    // Limit the data to 100 entries
    var limitedData = data.slice(0, 100);

    // Initialize the DataTable
    $("#pizzaOrders").DataTable({
      data: limitedData,
      columns: [
        { data: "Order Details ID" },
        { data: "Order ID" },
        { data: "Pizza ID" },
        { data: "Pizza Type ID" },
        { data: "Name" },
        { data: "Category" },
        { data: "Size" },
        { data: "Quantity" },
        { data: "Price" },
        { data: "Date" },
        { data: "Time" },
      ],
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const setInitialTotals = () => {
    document.getElementById("total-income").textContent = "$0.00";
    document.getElementById("total-quantity").textContent = "0";
    document.getElementById("total-order").textContent = "0";
  };

  // Initialize total values to 0
  setInitialTotals();

  fetch("pizza_places.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((pizzaData) => {
      const monthYearSelect = document.getElementById("month-year-select");
      const pizzaNameSelect = document.getElementById("pizza-name-select");
      const categorySelect = document.getElementById("category-select");

      if (!monthYearSelect || !pizzaNameSelect || !categorySelect) {
        console.error("One or more dropdown elements are missing in the DOM.");
        return;
      }

      const dropdownButtons = document.querySelectorAll(".select-btn");

      dropdownButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const dropdown = button.nextElementSibling;
          const isOpen = dropdown.classList.contains("open-list");
          document
            .querySelectorAll(".list-items")
            .forEach((list) => list.classList.remove("open-list"));
          if (!isOpen) {
            dropdown.classList.add("open-list");
          }
          const arrow = button.querySelector(".arrow-dwn i");
          document.querySelectorAll(".arrow-dwn i").forEach((arrow) => {
            arrow.classList.remove("bx-chevron-up");
            arrow.classList.add("bx-chevron-down");
          });
          arrow.classList.toggle("bx-chevron-up", !isOpen);
          arrow.classList.toggle("bx-chevron-down", isOpen);
        });
      });

      const populateDropdown = (element, data, key) => {
        if (!element) {
          console.error(`Element for ${key} is missing.`);
          return;
        }

        const selectAllItem = document.createElement("li");
        selectAllItem.classList.add("item");
        selectAllItem.innerHTML = `<label><input type="checkbox" class="select-all"> Select All</label>`;
        element.appendChild(selectAllItem);

        const uniqueValues = [...new Set(data.map((item) => item[key]))];
        uniqueValues.forEach((value) => {
          const listItem = document.createElement("li");
          listItem.classList.add("item");
          listItem.innerHTML = `<label><input type="checkbox" class="option-checkbox" value="${value}"> ${value}</label>`;
          element.appendChild(listItem);
        });

        const selectAllCheckbox = selectAllItem.querySelector(".select-all");
        selectAllCheckbox.addEventListener("change", (event) => {
          const checkboxes = element.querySelectorAll(".option-checkbox");
          checkboxes.forEach((checkbox) => {
            checkbox.checked = event.target.checked;
          });
          checkTotalsAndUpdate();
        });

        const optionCheckboxes = element.querySelectorAll(".option-checkbox");
        optionCheckboxes.forEach((checkbox) => {
          checkbox.addEventListener("change", () => {
            checkTotalsAndUpdate();
          });
        });
      };

      const calculateTotals = (data) => {
        let totalIncome = 0;
        let totalQuantity = 0;
        let orderIds = new Set();

        data.forEach((item) => {
          const price = parseFloat(item.Price.replace("$", ""));
          const quantity = item.Quantity;
          totalIncome += price * quantity;
          totalQuantity += quantity;
          orderIds.add(item["Order ID"]);
        });

        return {
          totalIncome: totalIncome.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          totalQuantity: totalQuantity.toLocaleString("en-US"),
          totalOrders: orderIds.size.toLocaleString("en-US"),
        };
      };

      const filterAndDisplayTotals = (data) => {
        const selectedCategories = Array.from(
          document.querySelectorAll("#category-select .option-checkbox:checked")
        ).map((checkbox) => checkbox.value);
        const selectedMonths = Array.from(
          document.querySelectorAll(
            "#month-year-select .option-checkbox:checked"
          )
        ).map((checkbox) => checkbox.value);
        const selectedPizzas = Array.from(
          document.querySelectorAll(
            "#pizza-name-select .option-checkbox:checked"
          )
        ).map((checkbox) => checkbox.value);

        const filteredData = data.filter((item) => {
          const categoryMatch = selectedCategories.length
            ? selectedCategories.includes(item.Category)
            : true;
          const monthMatch = selectedMonths.length
            ? selectedMonths.includes(item.Month)
            : true;
          const pizzaMatch = selectedPizzas.length
            ? selectedPizzas.includes(item.Name)
            : true;
          return categoryMatch && monthMatch && pizzaMatch;
        });

        const { totalIncome, totalQuantity, totalOrders } =
          calculateTotals(filteredData);
        document.getElementById("total-income").textContent = `$${totalIncome}`;
        document.getElementById(
          "total-quantity"
        ).textContent = `${totalQuantity}`;
        document.getElementById("total-order").textContent = `${totalOrders}`;

        displayRevenueChart(filteredData);
      };

      const checkTotalsAndUpdate = () => {
        const selectedCategories = Array.from(
          document.querySelectorAll("#category-select .option-checkbox:checked")
        );
        const selectedMonths = Array.from(
          document.querySelectorAll(
            "#month-year-select .option-checkbox:checked"
          )
        );
        const selectedPizzas = Array.from(
          document.querySelectorAll(
            "#pizza-name-select .option-checkbox:checked"
          )
        );

        if (
          selectedCategories.length === 0 &&
          selectedMonths.length === 0 &&
          selectedPizzas.length === 0
        ) {
          setInitialTotals();
        } else {
          filterAndDisplayTotals(pizzaData);
        }
      };

      // Populate dropdowns but do not calculate totals yet
      populateDropdown(monthYearSelect, pizzaData, "Month");
      populateDropdown(pizzaNameSelect, pizzaData, "Name");
      populateDropdown(categorySelect, pizzaData, "Category");

      // Mengelompokkan data berdasarkan nama pizza dan menghitung jumlahnya
      let pizzaSales = {};

      pizzaData.forEach(function (product) {
        // Buat kunci unik berdasarkan nama dan ukuran untuk memastikan setiap ukuran dicatat
        let key = `${product.Name} (${product.Size})`;

        if (!pizzaSales[key]) {
          pizzaSales[key] = {
            Name: product.Name,
            Size: product.Size,
            Category: product.Category,
            Price: product.Price,
            OrderVolume: 0,
          };
        }
        pizzaSales[key].OrderVolume += product.Quantity;
      });

      // Mengubah objek pizzaSales menjadi array dan mengurutkannya berdasarkan OrderVolume secara menurun
      let sortedProducts = Object.values(pizzaSales).sort(
        (a, b) => b.OrderVolume - a.OrderVolume
      );

      // Mengambil 10 produk pertama untuk ditampilkan
      let displayedProducts = sortedProducts.slice(0, 10);

      let placeholder = document.querySelector("#data-output");
      let out = "";
      for (let product of displayedProducts) {
        out += `
          <tr>
            <td>${product.Name}</td>
            <td>${product.Size}</td>
            <td>${product.Category}</td>
            <td>${product.Price}</td>
            <td>${product.OrderVolume}</td>
          </tr>
        `;
      }
      placeholder.innerHTML = out;

      // Inisialisasi objek untuk menyimpan jumlah penjualan berdasarkan rentang waktu
      const salesByTimeRange = {
        "11:00:00-15:00:00": 0,
        "15:00:01-19:00:00": 0,
        "19:00:01-23:00:00": 0,
      };

      // Fungsi untuk menentukan rentang waktu
      function getTimeRange(time) {
        if (time >= "11:00:00" && time <= "15:00:00") {
          return "11:00:00-15:00:00";
        } else if (time >= "15:00:01" && time <= "19:00:00") {
          return "15:00:01-19:00:00";
        } else if (time >= "19:00:01" && time <= "23:00:00") {
          return "19:00:01-23:00:00";
        } else {
          return "Invalid Time";
        }
      }

      // Hitung jumlah penjualan berdasarkan rentang waktu
      pizzaData.forEach((order) => {
        const time = order["Time"];
        const timeRange = getTimeRange(time);
        if (timeRange !== "Invalid Time") {
          salesByTimeRange[timeRange] += order.Quantity;
        }
      });

      console.log(salesByTimeRange);

      // Buat array untuk label waktu dan data penjualan
      const labels = Object.keys(salesByTimeRange);
      const dataValues = Object.values(salesByTimeRange);

      // Buat bar chart
      const ctxTime = document.getElementById("timebarchart").getContext("2d");
      const timeBarChart = new Chart(ctxTime, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Count Time based on Penjualan",
              data: dataValues,
              backgroundColor: "rgba(54, 162, 235, 1)", // Solid Blue,
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });

      // Buat chart revenue
      var ctxRevenue = document.getElementById("revenue").getContext("2d");

      // Ubah format tanggal dan pendapatan
      var formattedData = pizzaData.map(function (item) {
        return {
          month: item.Month.trim(), // Hapus spasi ekstra dari nama bulan
          revenue: parseFloat(item.Price.replace("$", "")), // Hapus tanda $ dan ubah ke float
        };
      });

      // Buat objek untuk menyimpan total pendapatan per bulan
      var monthlyRevenue = {};

      // Hitung total pendapatan per bulan
      formattedData.forEach(function (item) {
        if (!monthlyRevenue[item.month]) {
          monthlyRevenue[item.month] = 0;
        }
        monthlyRevenue[item.month] += item.revenue;
      });

      // Urutkan total pendapatan berdasarkan bulan (dengan memastikan urutan bulan dari Januari ke Desember)
      var sortedMonthlyRevenue = Object.keys(monthlyRevenue)
        .sort((a, b) => {
          // Konversi nama bulan menjadi angka untuk memudahkan pengurutan
          var months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          return months.indexOf(a) - months.indexOf(b);
        })
        .map(function (month) {
          return {
            month: month,
            revenue: monthlyRevenue[month],
          };
        });

      // Siapkan data untuk chart
      var labelsRevenue = sortedMonthlyRevenue.map(function (item) {
        return item.month;
      });
      var valuesRevenue = sortedMonthlyRevenue.map(function (item) {
        return item.revenue;
      });

      // Buat grafik garis
      var lineChart = new Chart(ctxRevenue, {
        type: "line",
        data: {
          labels: labelsRevenue,
          datasets: [
            {
              label: "Total Revenue",
              data: valuesRevenue,
              backgroundColor: "rgba(54, 162, 235, 1)", // Solid Blue
              borderColor: "rgba(75, 192, 192, 1)", // Warna garis
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });

      // Initial display set to 0, do not calculate totals yet
      // filterAndDisplayTotals(pizzaData); <- Comment out this line to prevent initial calculation
    });

  /*top5*/
  // Fungsi untuk mengambil ID pizza berdasarkan nama
  function getPizzaID(data, pizzaName) {
    const pizza = data.find((order) => order["Name"] === pizzaName);
    return pizza ? pizza["Pizza ID"] : "Unknown";
  }

  // Fungsi untuk membuat chart
  function createChart(ctxId, labels, dataValues, categories) {
    const ctx = document.getElementById(ctxId).getContext("2d");

    const categoryColors = {
      Classic: {
        backgroundColor: "rgba(54, 162, 235, 1)", // Solid Blue
        borderColor: "rgba(54, 162, 235, 1)",
      },
      Supreme: {
        backgroundColor: "rgba(75, 192, 192, 1)", // Solid Teal
        borderColor: "rgba(75, 192, 192, 1)",
      },
      Veggie: {
        backgroundColor: "rgba(255, 99, 132, 1)", // Solid Pink
        borderColor: "rgba(255, 99, 132, 1)",
      },
      Chicken: {
        backgroundColor: "rgba(255, 159, 64, 1)", // Solid Orange
        borderColor: "rgba(255, 159, 64, 1)",
      },
      Other: {
        backgroundColor: "rgba(153, 102, 255, 1)", // Solid Purple
        borderColor: "rgba(153, 102, 255, 1)",
      },
    };

    const allCategories = ["Classic", "Supreme", "Veggie", "Chicken"]; // Include all categories

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Pizza Sales",
            data: dataValues,
            backgroundColor: categories.map(
              (category) =>
                categoryColors[category]?.backgroundColor ||
                categoryColors["Other"].backgroundColor
            ),
            borderColor: categories.map(
              (category) =>
                categoryColors[category]?.borderColor ||
                categoryColors["Other"].borderColor
            ),
            borderWidth: 2,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y;
                }
                return label;
              },
            },
          },
          legend: {
            display: true,
            labels: {
              generateLabels: function (chart) {
                const datasets = chart.data.datasets[0];
                return allCategories.map((category) => ({
                  text: category,
                  fillStyle:
                    categoryColors[category]?.backgroundColor ||
                    categoryColors["Other"].backgroundColor,
                  strokeStyle:
                    categoryColors[category]?.borderColor ||
                    categoryColors["Other"].borderColor,
                  lineWidth: datasets.borderWidth,
                  hidden: false, // Initialize all categories as visible
                }));
              },
            },
            onClick: function (e, legendItem, legend) {
              const category = legendItem.text;
              const ci = legend.chart;
              const meta = ci.getDatasetMeta(0);

              meta.data.forEach(function (bar, barIndex) {
                if (categories[barIndex] === category) {
                  bar.hidden = !bar.hidden;
                }
              });

              ci.update();
            },
          },
        },
      },
    });

    return chart;
  }

  // Fetch data dan buat chart untuk top 5 pizza
  fetch("pizza_places.json")
    .then((response) => response.json())
    .then((data) => {
      // Menghitung total penjualan untuk setiap jenis pizza
      const pizzaSales = {};
      const pizzaCategories = {};
      data.forEach((order) => {
        const pizzaID = order["Pizza ID"];
        if (pizzaSales[pizzaID]) {
          pizzaSales[pizzaID] += order.Quantity;
        } else {
          pizzaSales[pizzaID] = order.Quantity;
          pizzaCategories[pizzaID] = order.Category;
        }
      });

      // Mengurutkan jenis pizza berdasarkan total penjualan secara descending
      const sortedPizzaSales = Object.entries(pizzaSales).sort(
        (a, b) => b[1] - a[1]
      );

      // Mengambil lima jenis pizza teratas
      const top5Pizza = sortedPizzaSales.slice(0, 5);
      const top5Labels = top5Pizza.map((item) => item[0]);
      const top5DataValues = top5Pizza.map((item) => item[1]);
      const top5Categories = top5Labels.map((label) => pizzaCategories[label]);

      // Membuat chart top 5 pizza
      createChart("top5pizza", top5Labels, top5DataValues, top5Categories);
    });

  //bottom 5 pizza//
  // Fungsi untuk mengambil ID pizza berdasarkan nama
  function getPizzaID(data, pizzaName) {
    const pizza = data.find((order) => order["Name"] === pizzaName);
    return pizza ? pizza["Pizza ID"] : "Unknown";
  }

  // Fungsi untuk membuat chart
  function createChart(ctxId, labels, dataValues, categories) {
    const ctx = document.getElementById(ctxId).getContext("2d");

    const categoryColors = {
      Classic: {
        backgroundColor: "rgba(54, 162, 235, 1)", // Solid Blue
        borderColor: "rgba(54, 162, 235, 1)",
      },
      Supreme: {
        backgroundColor: "rgba(75, 192, 192, 1)", // Solid Teal
        borderColor: "rgba(75, 192, 192, 1)",
      },
      Veggie: {
        backgroundColor: "rgba(255, 99, 132, 1)", // Solid Pink
        borderColor: "rgba(255, 99, 132, 1)",
      },
      Chicken: {
        backgroundColor: "rgba(255, 159, 64, 1)", // Solid Orange
        borderColor: "rgba(255, 159, 64, 1)",
      },
      Other: {
        backgroundColor: "rgba(153, 102, 255, 1)", // Solid Purple
        borderColor: "rgba(153, 102, 255, 1)",
      },
    };

    const allCategories = ["Classic", "Supreme", "Veggie", "Chicken"]; // Include all categories

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Pizza Sales",
            data: dataValues,
            backgroundColor: categories.map(
              (category) =>
                categoryColors[category]?.backgroundColor ||
                categoryColors["Other"].backgroundColor
            ),
            borderColor: categories.map(
              (category) =>
                categoryColors[category]?.borderColor ||
                categoryColors["Other"].borderColor
            ),
            borderWidth: 2,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y;
                }
                return label;
              },
            },
          },
          legend: {
            display: true,
            labels: {
              generateLabels: function (chart) {
                const datasets = chart.data.datasets[0];
                return allCategories.map((category) => ({
                  text: category,
                  fillStyle:
                    categoryColors[category]?.backgroundColor ||
                    categoryColors["Other"].backgroundColor,
                  strokeStyle:
                    categoryColors[category]?.borderColor ||
                    categoryColors["Other"].borderColor,
                  lineWidth: datasets.borderWidth,
                  hidden: false, // Initialize all categories as visible
                }));
              },
            },
            onClick: function (e, legendItem, legend) {
              const category = legendItem.text;
              const ci = legend.chart;
              const meta = ci.getDatasetMeta(0);

              meta.data.forEach(function (bar, barIndex) {
                if (categories[barIndex] === category) {
                  bar.hidden = !bar.hidden;
                }
              });

              ci.update();
            },
          },
        },
      },
    });

    return chart;
  }

  // Fetch data dan buat chart untuk bottom 5 pizza
  fetch("pizza_places.json")
    .then((response) => response.json())
    .then((data) => {
      // Menghitung total penjualan untuk setiap jenis pizza
      const pizzaSales = {};
      const pizzaCategories = {};
      data.forEach((order) => {
        const pizzaID = order["Pizza ID"];
        if (pizzaSales[pizzaID]) {
          pizzaSales[pizzaID] += order.Quantity;
        } else {
          pizzaSales[pizzaID] = order.Quantity;
          pizzaCategories[pizzaID] = order.Category;
        }
      });

      // Mengurutkan jenis pizza berdasarkan total penjualan secara ascending
      const sortedPizzaSales = Object.entries(pizzaSales).sort(
        (a, b) => a[1] - b[1]
      );

      // Mengambil lima jenis pizza terendah
      const bottom5Pizza = sortedPizzaSales.slice(0, 5);
      const bottom5Labels = bottom5Pizza.map((item) => item[0]);
      const bottom5DataValues = bottom5Pizza.map((item) => item[1]);
      const bottom5Categories = bottom5Labels.map(
        (label) => pizzaCategories[label]
      );

      // Membuat chart bottom 5 pizza
      createChart(
        "bottom5pizza",
        bottom5Labels,
        bottom5DataValues,
        bottom5Categories
      );
    });
});

// Show popup
window.addEventListener("load", function () {
  setTimeout(function open(event) {
    document.querySelector(".popup").style.display = "block";
  }, 300);
});

// Close popup
document.querySelector("#xbutton").addEventListener("click", function () {
  document.querySelector(".popup").style.display = "none";
});

document.querySelector("#close").addEventListener("click", function () {
  document.querySelector(".popup").style.display = "none";
});

// /*pringe range*/

// document.addEventListener("DOMContentLoaded", function () {
//   // Function to get the price from the pizza object
//   const getPrice = (pizza) => parseFloat(pizza.Price.replace("$", ""));

//   // Group pizzas by price range
//   const priceRanges = {
//     "10-15": 0,
//     "15.1-20": 0,
//     "20.1-25": 0,
//     "25.1-30": 0,
//     "35.1-40": 0,
//     Other: 0,
//   };

//   fetch("pizza_places.json")
//     .then((response) => response.json())
//     .then((pizzaData) => {
//       pizzaData.forEach((pizza) => {
//         const price = getPrice(pizza);
//         if (price >= 10 && price <= 15) priceRanges["10-15"] += pizza.Quantity;
//         else if (price > 15 && price <= 20)
//           priceRanges["15.1-20"] += pizza.Quantity;
//         else if (price > 20 && price <= 25)
//           priceRanges["20.1-25"] += pizza.Quantity;
//         else if (price > 25 && price <= 30)
//           priceRanges["25.1-30"] += pizza.Quantity;
//         else if (price > 35 && price <= 40)
//           priceRanges["35.1-40"] += pizza.Quantity;
//         else priceRanges["Other"] += pizza.Quantity;
//       });

//       // Create the bar chart
//       const ctx = document.getElementById("pricerange").getContext("2d");
//       new Chart(ctx, {
//         type: "bar",
//         data: {
//           labels: Object.keys(priceRanges),
//           datasets: [
//             {
//               label: "Quantity",
//               data: Object.values(priceRanges),
//               backgroundColor: [
//                 "blue",
//                 "lightblue",
//                 "orange",
//                 "yellow",
//                 "green",
//                 "pink",
//               ],
//             },
//           ],
//         },
//         options: {
//           scales: {
//             y: {
//               beginAtZero: true,
//               ticks: {
//                 callback: function (value) {
//                   return value + " rb";
//                 },
//               },
//             },
//           },
//         },
//       });
//     })
//     .catch((error) => console.error("Error fetching the JSON data:", error));
// });
