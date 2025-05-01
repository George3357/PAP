// Admin Orders Module
const AdminOrdersModule = (() => {
  // DOM Elements
  const ordersTable = document.getElementById("orders-table")
  const refreshOrdersButton = document.getElementById("refresh-orders")
  const adminLogoutButton = document.getElementById("admin-logout")

  // Filters
  const statusFilter = document.getElementById("status-filter")
  const dateFilter = document.getElementById("date-filter")
  const typeFilter = document.getElementById("type-filter")
  const searchOrder = document.getElementById("search-order")

  // Modal Elements
  const orderDetailModal = document.getElementById("order-detail-modal")
  const orderModalClose = document.getElementById("order-modal-close")
  const detailOrderId = document.getElementById("detail-order-id")
  const detailId = document.getElementById("detail-id")
  const detailDate = document.getElementById("detail-date")
  const detailType = document.getElementById("detail-type")
  const detailStatus = document.getElementById("detail-status")
  const detailCustomerName = document.getElementById("detail-customer-name")
  const detailCustomerEmail = document.getElementById("detail-customer-email")
  const detailCustomerPhone = document.getElementById("detail-customer-phone")
  const detailCarBrand = document.getElementById("detail-car-brand")
  const detailCarModel = document.getElementById("detail-car-model")
  const detailCarYear = document.getElementById("detail-car-year")
  const detailCarPrice = document.getElementById("detail-car-price")
  const detailNotes = document.getElementById("detail-notes")
  const updateStatus = document.getElementById("update-status")
  const cancelOrderButton = document.getElementById("cancel-order")
  const saveOrderButton = document.getElementById("save-order")

  // Data
  let orders = []
  let testDrives = []
  let users = []
  let cars = []
  let currentOrderId = null
  let currentOrderType = null

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

    // Display orders
    displayOrders()
  }

  // Check if user has admin access
  function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!currentUser) {
      console.log("No user logged in, redirecting to login page")
      window.location.href = "login.html?redirect=admin-orders.html"
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
    orders = JSON.parse(localStorage.getItem("orders")) || []
    testDrives = JSON.parse(localStorage.getItem("testDrives")) || []
    users = JSON.parse(localStorage.getItem("users")) || []
    cars = JSON.parse(localStorage.getItem("cars")) || []
  }

  // Set up event listeners
  function setupEventListeners() {
    refreshOrdersButton.addEventListener("click", () => {
      loadData()
      displayOrders()
    })

    adminLogoutButton.addEventListener("click", () => {
      localStorage.removeItem("currentUser")
      window.location.href = "login.html"
    })

    // Filters
    statusFilter.addEventListener("change", displayOrders)
    dateFilter.addEventListener("change", displayOrders)
    typeFilter.addEventListener("change", displayOrders)

    searchOrder.addEventListener("input", displayOrders)

    // Modal
    orderModalClose.addEventListener("click", closeOrderDetailModal)

    cancelOrderButton.addEventListener("click", () => {
      if (confirm("Tem certeza que deseja cancelar este pedido?")) {
        updateOrderStatus("cancelled")
        closeOrderDetailModal()
      }
    })

    saveOrderButton.addEventListener("click", () => {
      updateOrderStatus(updateStatus.value)
      closeOrderDetailModal()
    })
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get customer by ID
  function getCustomerById(userId) {
    return users.find((user) => user.id === userId) || { name: "Cliente não encontrado", email: "N/A", phone: "N/A" }
  }

  // Get car by ID
  function getCarById(carId) {
    return (
      cars.find((car) => car.id === carId) || { brand: "N/A", model: "Carro não encontrado", year: "N/A", price: "N/A" }
    )
  }

  // Display orders
  function displayOrders() {
    // Clear table
    ordersTable.innerHTML = ""

    // Get filter values
    const statusValue = statusFilter.value
    const dateValue = dateFilter.value
    const typeValue = typeFilter.value
    const searchValue = searchOrder.value.toLowerCase()

    // Combine orders and test drives
    const allOrders = []

    // Add regular orders
    orders.forEach((order) => {
      const customer = getCustomerById(order.userId)
      const car = getCarById(order.carId)

      allOrders.push({
        id: order.id,
        date: order.date,
        type: "order",
        status: order.status,
        customer,
        car,
        notes: order.notes || "Sem observações",
        originalData: order,
      })
    })

    // Add test drives
    testDrives.forEach((testDrive) => {
      const customer = getCustomerById(testDrive.userId)
      const car = getCarById(testDrive.carId)

      allOrders.push({
        id: testDrive.id,
        date: testDrive.date,
        type: "test-drive",
        status: testDrive.status,
        customer,
        car,
        notes: testDrive.notes || "Sem observações",
        originalData: testDrive,
      })
    })

    // Apply filters
    let filteredOrders = allOrders

    // Status filter
    if (statusValue !== "all") {
      filteredOrders = filteredOrders.filter((order) => order.status === statusValue)
    }

    // Type filter
    if (typeValue !== "all") {
      filteredOrders = filteredOrders.filter((order) => order.type === typeValue)
    }

    // Date filter
    if (dateValue !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const weekAgo = today - 7 * 24 * 60 * 60 * 1000
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime()

      filteredOrders = filteredOrders.filter((order) => {
        const orderDate = new Date(order.date).getTime()

        if (dateValue === "today") {
          return orderDate >= today
        } else if (dateValue === "week") {
          return orderDate >= weekAgo
        } else if (dateValue === "month") {
          return orderDate >= monthAgo
        }

        return true
      })
    }

    // Search filter
    if (searchValue) {
      filteredOrders = filteredOrders.filter((order) => {
        return (
          order.customer.name.toLowerCase().includes(searchValue) ||
          order.customer.email.toLowerCase().includes(searchValue) ||
          order.id.toString().includes(searchValue)
        )
      })
    }

    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date))

    // Display orders
    filteredOrders.forEach((order) => {
      const row = document.createElement("tr")

      // Get status class
      const statusClass = `status-${order.status}`

      // Get type display
      const typeDisplay = order.type === "order" ? "Pedido" : "Test Drive"

      row.innerHTML = `
                <td>#${order.id}</td>
                <td>${formatDate(order.date)}</td>
                <td>${order.customer.name}</td>
                <td>${typeDisplay}</td>
                <td>${order.car.brand} ${order.car.model}</td>
                <td><span class="${statusClass}">${getStatusDisplay(order.status)}</span></td>
                <td>
                    <button class="btn-icon view-order" data-id="${order.id}" data-type="${order.type}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-order" data-id="${order.id}" data-type="${order.type}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `

      ordersTable.appendChild(row)

      // Add event listeners
      const viewButton = row.querySelector(".view-order")
      const editButton = row.querySelector(".edit-order")

      viewButton.addEventListener("click", () => {
        openOrderDetailModal(order)
      })

      editButton.addEventListener("click", () => {
        openOrderDetailModal(order)
      })
    })

    // If no orders, show message
    if (filteredOrders.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = '<td colspan="7" style="text-align: center;">Nenhum pedido encontrado</td>'
      ordersTable.appendChild(row)
    }
  }

  // Get status display text
  function getStatusDisplay(status) {
    switch (status) {
      case "pending":
        return "Pendente"
      case "confirmed":
        return "Confirmado"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  // Open order detail modal
  function openOrderDetailModal(order) {
    // Set current order ID and type
    currentOrderId = order.id
    currentOrderType = order.type

    // Populate modal
    detailOrderId.textContent = order.id
    detailId.textContent = order.id
    detailDate.textContent = formatDate(order.date)
    detailType.textContent = order.type === "order" ? "Pedido" : "Test Drive"

    // Set status with class
    detailStatus.textContent = getStatusDisplay(order.status)
    detailStatus.className = `status-${order.status}`

    // Customer info
    detailCustomerName.textContent = order.customer.name
    detailCustomerEmail.textContent = order.customer.email
    detailCustomerPhone.textContent = order.customer.phone || "N/A"

    // Car info
    detailCarBrand.textContent = order.car.brand
    detailCarModel.textContent = order.car.model
    detailCarYear.textContent = order.car.year
    detailCarPrice.textContent =
      typeof order.car.price === "number" ? `R$ ${order.car.price.toLocaleString("pt-BR")}` : order.car.price

    // Notes
    detailNotes.textContent = order.notes

    // Set status selector
    updateStatus.value = order.status

    // Show modal
    orderDetailModal.style.display = "block"
  }

  // Close order detail modal
  function closeOrderDetailModal() {
    orderDetailModal.style.display = "none"
    currentOrderId = null
    currentOrderType = null
  }

  // Update order status
  function updateOrderStatus(newStatus) {
    if (!currentOrderId || !currentOrderType) return

    if (currentOrderType === "order") {
      // Update order
      const orderIndex = orders.findIndex((order) => order.id === currentOrderId)
      if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus
        localStorage.setItem("orders", JSON.stringify(orders))
      }
    } else if (currentOrderType === "test-drive") {
      // Update test drive
      const testDriveIndex = testDrives.findIndex((td) => td.id === currentOrderId)
      if (testDriveIndex !== -1) {
        testDrives[testDriveIndex].status = newStatus
        localStorage.setItem("testDrives", JSON.stringify(testDrives))
      }
    }

    // Refresh orders display
    displayOrders()
  }

  // Public API
  return {
    init: init,
  }
})()

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  AdminOrdersModule.init()
})

