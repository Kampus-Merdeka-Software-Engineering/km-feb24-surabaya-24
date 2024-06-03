document.addEventListener("DOMContentLoaded", () => {
  fetch("pizza_places.json")
    .then((response) => response.json())
    .then((data) => {
      const { totalIncome, totalQuantity, totalOrders, monthlyRevenue } =
        calculateTotals(data);
      document.getElementById("total-income").textContent = `$${totalIncome}`;
      document.getElementById(
        "total-quantity"
      ).textContent = `${totalQuantity}`;
      document.getElementById("total-order").textContent = `${totalOrders}`;
      displayRevenueChart(monthlyRevenue);
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
});

/* table penjualan */
fetch("pizza_places.json")
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
            <td></td>
          </tr>
        `;
    }
    placeholder.innerHTML = out;
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
(function () {
  // Fungsi untuk mengambil data dari file JSON menggunakan fetch
  async function fetchData() {
    try {
      const response = await fetch("pizza_places.json");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Fungsi untuk menghitung jumlah pizza dalam setiap rentang harga
  function countPriceRange(data) {
    const priceRanges = [10, 15, 20, 25, Number.MAX_SAFE_INTEGER];
    const priceRangeCounts = [0, 0, 0, 0, 0];

    data.forEach((pizza) => {
      const price = parseFloat(pizza.Price.replace("$", ""));
      for (let i = 0; i < priceRanges.length; i++) {
        if (price <= priceRanges[i]) {
          priceRangeCounts[i]++;
          break;
        }
      }
    });

    // Membuat array dari objek dengan rentang harga dan jumlahnya
    const priceRangeData = priceRanges.map((range, index) => ({
      range:
        index === priceRanges.length - 1
          ? `$${range}+`
          : `$${range} - $${priceRanges[index + 1]}`,
      count: priceRangeCounts[index],
    }));

    // Mengurutkan array berdasarkan jumlah (dari yang terbanyak)
    priceRangeData.sort((a, b) => b.count - a.count);

    // Mengambil hanya jumlah terbesar 5
    return priceRangeData.slice(0, 5);
  }

  // Mengambil konteks canvas
  const ctx = document.getElementById("pricerange").getContext("2d");

  // Memuat data menggunakan fetch dan membuat chart
  async function loadChart() {
    const pizzaData = await fetchData();

    // Data yang akan digunakan untuk membuat chart
    const data = {
      labels: countPriceRange(pizzaData).map((item) => item.range),
      datasets: [
        {
          label: "Count Price Range",
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
          data: countPriceRange(pizzaData).map((item) => item.count),
        },
      ],
    };

    // Konfigurasi chart
    const options = {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    };

    // Membuat chart baru dengan data dan opsi yang telah ditentukan
    const priceChart = new Chart(ctx, {
      type: "bar",
      data: data,
      options: options,
    });
  }

  // Memanggil fungsi untuk memuat chart saat halaman dimuat
  loadChart();
})();

// top 5 pizza//
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

    // Membuat data untuk chart
    const labels = top5Pizza.map((item) => item[0]);
    const dataValues = top5Pizza.map((item) => item[1]);

    // Membuat bar chart
    const ctx = document.getElementById("top5pizza").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Quantity Sold",
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

//bottom 5 pizza//
// Ambil data dari file JSON
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
