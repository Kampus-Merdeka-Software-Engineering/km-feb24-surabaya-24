/** filtering dropdown */
document.addEventListener("DOMContentLoaded", () => {
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
    });
  };

  fetch("pizza_places.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((pizzaData) => {
      populateDropdown(monthYearSelect, pizzaData, "Month");
      populateDropdown(pizzaNameSelect, pizzaData, "Name");
      populateDropdown(categorySelect, pizzaData, "Category");
    })
    .catch((error) => console.error("Error fetching the pizza data:", error));
});

/** chartmini */
document.addEventListener("DOMContentLoaded", () => {
  fetch("pizza_places.json")
    .then((response) => response.json())
    .then((data) => {
      const { totalIncome, totalQuantity, totalOrders } = calculateTotals(data);
      document.getElementById("total-income").textContent = `$${totalIncome}`;
      document.getElementById(
        "total-quantity"
      ).textContent = `${totalQuantity}`;
      document.getElementById("total-order").textContent = `${totalOrders}`;
      displayRevenueChart(data); // Assuming displayRevenueChart function exists and works with raw data
    })
    .catch((error) => console.error("Error fetching the JSON data:", error));

  function calculateTotals(data) {
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
  }

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
});

/* table penjualan */
fetch("pizza_places.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (products) {
    // Mengelompokkan data berdasarkan nama pizza dan menghitung jumlahnya
    let pizzaSales = {};

    products.forEach(function (product) {
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
    let displayedProducts = sortedProducts;

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
  })
  .catch(function (error) {
    console.error("Error fetching and processing data:", error);
  });

// Mengambil data dari file JSON menggunakan fetch
fetch("pizza_places.json")
  .then((response) => response.json())
  .then((data) => {
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
    data.forEach((order) => {
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
    const ctx = document.getElementById("timebarchart").getContext("2d");
    const timeBarChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Count Time based on Penjualan",
            data: dataValues,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
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
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

//revenue//
// Ambil elemen canvas dari HTML
var ctx = document.getElementById("revenue").getContext("2d");

// Ambil data dari file JSON menggunakan fetch
fetch("pizza_places.json")
  .then((response) => response.json()) // Ubah respons ke JSON
  .then((data) => {
    // Ubah format tanggal dan pendapatan
    var formattedData = data.map(function (item) {
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
    var labels = sortedMonthlyRevenue.map(function (item) {
      return item.month;
    });
    var values = sortedMonthlyRevenue.map(function (item) {
      return item.revenue;
    });

    // Buat grafik garis
    var lineChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total Revenue",
            data: values,
            backgroundColor: "rgba(75, 192, 192, 0.2)", // Warna area di bawah garis
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
  })
  .catch((error) => console.error("Error fetching data:", error)); // Tangani kesalahan jika fetch gagal

/*pringe range*/

// top 5 pizza//
// Fungsi untuk mengambil ID pizza berdasarkan nama
function getPizzaID(data, pizzaName) {
  const pizza = data.find((order) => order["Name"] === pizzaName);
  return pizza ? pizza["Pizza ID"] : "Unknown";
}

// Fungsi untuk membuat chart
function createChart(ctxId, labels, dataValues, data) {
  const ctx = document.getElementById(ctxId).getContext("2d");
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Pizza ID",
          data: dataValues,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
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
      },
    },
  });
}

// Fetch data dan buat chart untuk top 5 pizza
fetch("pizza_places.json")
  .then((response) => response.json())
  .then((data) => {
    // Menghitung total penjualan untuk setiap jenis pizza
    const pizzaSales = {};
    data.forEach((order) => {
      const pizzaID = order["Pizza ID"];
      if (pizzaSales[pizzaID]) {
        pizzaSales[pizzaID] += order.Quantity;
      } else {
        pizzaSales[pizzaID] = order.Quantity;
      }
    });

    // Mengurutkan jenis pizza berdasarkan total penjualan secara descending
    const sortedPizzaSales = Object.entries(pizzaSales).sort(
      (a, b) => b[1] - a[1]
    );

    // Mengambil lima jenis pizza teratas
    const top5Pizza = sortedPizzaSales.slice(0, 5);
    const top5Labels = top5Pizza.map((item) => item[0]); // Mengambil nama pizza langsung dari data
    const top5DataValues = top5Pizza.map((item) => item[1]);
    const top5PizzaIDs = top5Labels.map((label) => getPizzaID(data, label));

    // Membuat chart top 5 pizza
    createChart("top5pizza", top5Labels, top5DataValues, top5PizzaIDs);
  });

//bottom 5 pizza//
// Ambil data dari file JSON
fetch("pizza_places.json")
  .then((response) => response.json())
  .then((data) => {
    // Menghitung total penjualan untuk setiap jenis pizza
    const pizzaSales = {};
    data.forEach((order) => {
      const pizzaID = order["Pizza ID"];
      if (pizzaSales[pizzaID]) {
        pizzaSales[pizzaID] += order.Quantity;
      } else {
        pizzaSales[pizzaID] = order.Quantity;
      }
    });

    // Mengurutkan jenis pizza berdasarkan total penjualan secara ascending
    const sortedPizzaSales = Object.entries(pizzaSales).sort(
      (a, b) => a[1] - b[1]
    );

    // Mengambil lima jenis pizza terbawah
    const bottom5Pizza = sortedPizzaSales.slice(0, 5);

    // Membuat data untuk chart
    const labels = bottom5Pizza.map((item) => item[0]);
    const dataValues = bottom5Pizza.map((item) => item[1]);

    // Membuat bar chart
    const ctx = document.getElementById("bottom5pizza").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Pizza ID",
            data: dataValues,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
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
  });
