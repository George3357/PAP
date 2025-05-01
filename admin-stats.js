import { Chart } from "@/components/ui/chart"
// Admin Stats Module
const AdminStatsModule = (() => {
  // DOM Elements
  const totalUsersElement = document.getElementById("total-users")
  const totalCarsElement = document.getElementById("total-cars")
  const totalOrdersElement = document.getElementById("total-orders")
  const totalFavoritesElement = document.getElementById("total-favorites")
  const totalViewsElement = document.getElementById("total-views")
  const totalTestDrivesElement = document.getElementById("total-test-drives")
  const popularCarsTable = document.getElementById("popular-cars-table")
  const refreshStatsButton = document.getElementById("refresh-stats")
  const adminLogoutButton = document.getElementById("admin-logout")

  // Charts
  let brandViewsChart = null
  let ordersMonthChart = null

  // Data
  let users = []
  let cars = []
  let orders = []
  let favorites = []
  let viewsData = {}
  let testDrives = []

  // Initialize
  function init() {
    // Check if user is admin
    if (!checkAdminAccess()) {
      return // Stop initialization if not admin
    }

    // Load data
    loadData()

    // Set up event listeners
    setupEventListeners()

    // Initialize charts
    initializeCharts()

    // Populate stats
    populateStats()

    // Populate popular cars table
    populatePopularCarsTable()
  }

  // Check if user has admin access
  function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!currentUser) {
      console.log("No user logged in, redirecting to login page")
      window.location.href = "login.html?redirect=admin-stats.html"
      return false
    }

    if (currentUser.role !== "admin") {
      console.log("User is not an admin, redirecting to login page")
      alert("Você precisa ter permissões de administrador para acessar esta página.")
      window.location.href = "index.html"
      return false
    }

    return true
  }

  // Load data from localStorage
  function loadData() {
    users = JSON.parse(localStorage.getItem("users")) || []
    cars = JSON.parse(localStorage.getItem("cars")) || []
    orders = JSON.parse(localStorage.getItem("orders")) || []
    favorites = JSON.parse(localStorage.getItem("favorites")) || []
    viewsData = JSON.parse(localStorage.getItem("carViews")) || {}
    testDrives = JSON.parse(localStorage.getItem("testDrives")) || []
  }

  // Set up event listeners
  function setupEventListeners() {
    refreshStatsButton.addEventListener("click", () => {
      loadData()
      populateStats()
      updateCharts()
      populatePopularCarsTable()
    })

    adminLogoutButton.addEventListener("click", () => {
      localStorage.removeItem("currentUser")
      window.location.href = "login.html"
    })
  }

  // Initialize charts
  function initializeCharts() {
    // Brand views chart
    const brandViewsCtx = document.getElementById("brand-views-chart").getContext("2d")
    brandViewsChart = new Chart(brandViewsCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Visualizações por Marca",
            data: [],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Número de Visualizações",
            },
          },
          x: {
            title: {
              display: true,
              text: "Marca do Carro",
            },
          },
        },
      },
    })

    // Orders by month chart
    const ordersMonthCtx = document.getElementById("orders-month-chart").getContext("2d")
    ordersMonthChart = new Chart(ordersMonthCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Pedidos por Mês",
            data: [],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Número de Pedidos",
            },
          },
          x: {
            title: {
              display: true,
              text: "Mês",
            },
          },
        },
      },
    })

    // Update charts with data
    updateCharts()
  }

  // Update charts with data
  function updateCharts() {
    // Update brand views chart
    const brandViewsData = {}

    // Collect views by brand
    cars.forEach((car) => {
      const carId = car.id.toString()
      const views = viewsData[carId] || 0

      if (!brandViewsData[car.brand]) {
        brandViewsData[car.brand] = 0
      }

      brandViewsData[car.brand] += views
    })

    // Update chart data
    const brands = Object.keys(brandViewsData)
    const viewCounts = brands.map((brand) => brandViewsData[brand])

    brandViewsChart.data.labels = brands
    brandViewsChart.data.datasets[0].data = viewCounts
    brandViewsChart.update()

    // Update orders by month chart
    const monthsData = {}
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    // Initialize months
    for (let i = 0; i < 12; i++) {
      monthsData[i] = 0
    }

    // Collect orders by month
    orders.forEach((order) => {
      const orderDate = new Date(order.date)
      const month = orderDate.getMonth()

      monthsData[month]++
    })

    // Update chart data
    const monthLabels = monthNames
    const orderCounts = Object.values(monthsData)

    ordersMonthChart.data.labels = monthLabels
    ordersMonthChart.data.datasets[0].data = orderCounts
    ordersMonthChart.update()
  }

  // Populate stats
  function populateStats() {
    // Get total counts
    const totalUsers = users.length
    const totalCars = cars.length
    const totalOrders = orders.length

    // Calculate total favorites
    const totalFavorites = favorites.length

    // Calculate total views
    let totalViews = 0
    for (const carId in viewsData) {
      totalViews += viewsData[carId]
    }

    // Calculate total test drives
    const totalTestDrives = testDrives.length

    // Update DOM
    totalUsersElement.textContent = totalUsers
    totalCarsElement.textContent = totalCars
    totalOrdersElement.textContent = totalOrders
    totalFavoritesElement.textContent = totalFavorites
    totalViewsElement.textContent = totalViews
    totalTestDrivesElement.textContent = totalTestDrives
  }

  // Populate popular cars table
  function populatePopularCarsTable() {
    // Clear table
    popularCarsTable.innerHTML = ""

    // Create array of cars with their stats
    const carsWithStats = cars.map((car) => {
      const carId = car.id.toString()

      // Get views
      const views = viewsData[carId] || 0

      // Get favorites
      const favCount = favorites.filter((fav) => fav.carId === car.id).length

      // Get test drives
      const testDriveCount = testDrives.filter((td) => td.carId === car.id).length

      return {
        car,
        views,
        favorites: favCount,
        testDrives: testDriveCount,
        popularity: views + favCount * 2 + testDriveCount * 3, // Weighted popularity score
      }
    })

    // Sort by popularity
    carsWithStats.sort((a, b) => b.popularity - a.popularity)

    // Take top 10
    const topCars = carsWithStats.slice(0, 10)

    // Add to table
    topCars.forEach((item) => {
      const row = document.createElement("tr")

      row.innerHTML = `
                <td>${item.car.model}</td>
                <td>${item.car.brand}</td>
                <td>${item.views}</td>
                <td>${item.favorites}</td>
                <td>${item.testDrives}</td>
            `

      popularCarsTable.appendChild(row)
    })

    // If no cars, show message
    if (topCars.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = '<td colspan="5" style="text-align: center;">Nenhum carro cadastrado</td>'
      popularCarsTable.appendChild(row)
    }
  }

  // Public API
  return {
    init: init,
  }
})()

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  AdminStatsModule.init()
})

