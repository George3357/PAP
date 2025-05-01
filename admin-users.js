// Admin Users Module
const AdminUsersModule = (() => {
  // DOM Elements
  const usersTable = document.getElementById("users-table")
  const refreshUsersButton = document.getElementById("refresh-users")
  const createUserButton = document.getElementById("create-user")
  const adminLogoutButton = document.getElementById("admin-logout")

  // Filters
  const roleFilter = document.getElementById("role-filter")
  const dateFilter = document.getElementById("date-filter")
  const searchUser = document.getElementById("search-user")

  // Modal Elements
  const userDetailModal = document.getElementById("user-detail-modal")
  const userModalClose = document.getElementById("user-modal-close")
  const userForm = document.getElementById("user-form")
  const userId = document.getElementById("user-id")
  const userName = document.getElementById("user-name")
  const userEmail = document.getElementById("user-email")
  const userPhone = document.getElementById("user-phone")
  const userRole = document.getElementById("user-role")
  const userPassword = document.getElementById("user-password")
  const userCreated = document.getElementById("user-created")
  const deleteUserButton = document.getElementById("delete-user")
  const saveUserButton = document.getElementById("save-user")

  // Data
  let users = []
  let orders = []
  let testDrives = []
  let favorites = []
  let isCreatingNewUser = false

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

    // Display users
    displayUsers()
  }

  // Check if user has admin access
  function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!currentUser) {
      console.log("No user logged in, redirecting to login page")
      window.location.href = "login.html?redirect=admin-users.html"
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
    orders = JSON.parse(localStorage.getItem("orders")) || []
    testDrives = JSON.parse(localStorage.getItem("testDrives")) || []
    favorites = JSON.parse(localStorage.getItem("favorites")) || []
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

  // Set up event listeners
  function setupEventListeners() {
    refreshUsersButton.addEventListener("click", () => {
      loadData()
      displayUsers()
    })

    createUserButton.addEventListener("click", () => {
      openCreateUserModal()
    })

    adminLogoutButton.addEventListener("click", () => {
      localStorage.removeItem("currentUser")
      window.location.href = "login.html"
    })

    // Filters
    roleFilter.addEventListener("change", displayUsers)
    dateFilter.addEventListener("change", displayUsers)
    searchUser.addEventListener("input", displayUsers)

    // Modal
    userModalClose.addEventListener("click", closeUserDetailModal)

    deleteUserButton.addEventListener("click", () => {
      if (isCreatingNewUser) {
        closeUserDetailModal()
        return
      }

      const id = Number.parseInt(userId.value)

      // Check if trying to delete current user
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))
      if (currentUser && currentUser.id === id) {
        alert("Não é possível excluir o usuário atualmente logado.")
        return
      }

      if (confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
        deleteUser(id)
        closeUserDetailModal()
      }
    })

    saveUserButton.addEventListener("click", () => {
      if (validateUserForm()) {
        if (isCreatingNewUser) {
          createUser()
        } else {
          updateUser()
        }
        closeUserDetailModal()
      }
    })
  }

  // Open user detail modal
  function openUserDetailModal(user) {
    isCreatingNewUser = false

    // Populate form
    userId.value = user.id
    userName.value = user.name
    userEmail.value = user.email
    userPhone.value = user.phone || ""
    userRole.value = user.role
    userPassword.value = ""
    userCreated.value = formatDate(user.createdAt)

    // Show delete button
    deleteUserButton.style.display = "block"

    // Show modal
    userDetailModal.style.display = "block"
  }

  // Open create user modal
  function openCreateUserModal() {
    isCreatingNewUser = true

    // Reset form
    userForm.reset()
    userId.value = ""
    userRole.value = "user"
    userCreated.value = formatDate(new Date().toISOString())

    // Hide delete button
    deleteUserButton.style.display = "none"

    // Show modal
    userDetailModal.style.display = "block"
  }

  // Close user detail modal
  function closeUserDetailModal() {
    userDetailModal.style.display = "none"
    isCreatingNewUser = false
  }

  // Validate user form
  function validateUserForm() {
    if (!userName.value.trim()) {
      alert("Por favor, insira um nome.")
      return false
    }

    if (!userEmail.value.trim()) {
      alert("Por favor, insira um email.")
      return false
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail.value.trim())) {
      alert("Por favor, insira um email válido.")
      return false
    }

    // If creating new user, password is required
    if (isCreatingNewUser && !userPassword.value.trim()) {
      alert("Por favor, insira uma senha.")
      return false
    }

    return true
  }

  // Create new user
  function createUser() {
    const newUser = {
      id: Date.now(),
      name: userName.value.trim(),
      email: userEmail.value.trim(),
      password: userPassword.value.trim(),
      phone: userPhone.value.trim(),
      role: userRole.value,
      createdAt: new Date().toISOString(),
    }

    // Add user to array
    users.push(newUser)

    // Save to localStorage
    localStorage.setItem("users", JSON.stringify(users))

    // Refresh display
    displayUsers()
  }

  // Update user
  function updateUser() {
    const id = Number.parseInt(userId.value)
    const userIndex = users.findIndex((user) => user.id === id)

    if (userIndex === -1) return

    // Update user data
    users[userIndex].name = userName.value.trim()
    users[userIndex].email = userEmail.value.trim()
    users[userIndex].phone = userPhone.value.trim()
    users[userIndex].role = userRole.value

    // Update password if provided
    if (userPassword.value.trim()) {
      users[userIndex].password = userPassword.value.trim()
    }

    // Save to localStorage
    localStorage.setItem("users", JSON.stringify(users))

    // Refresh display
    displayUsers()
  }

  // Delete user
  function deleteUser(userId) {
    // Check if user has orders, test drives, or favorites
    const hasOrders = orders.some((order) => order.userId === userId)
    const hasTestDrives = testDrives.some((td) => td.userId === userId)
    const hasFavorites = favorites.some((fav) => fav.userId === userId)

    if (hasOrders || hasTestDrives || hasFavorites) {
      if (
        confirm(
          "Este usuário possui pedidos, test drives ou favoritos associados. Deseja excluir todos esses dados também?",
        )
      ) {
        // Remove related data
        if (hasOrders) {
          const newOrders = orders.filter((order) => order.userId !== userId)
          localStorage.setItem("orders", JSON.stringify(newOrders))
        }

        if (hasTestDrives) {
          const newTestDrives = testDrives.filter((td) => td.userId !== userId)
          localStorage.setItem("testDrives", JSON.stringify(newTestDrives))
        }

        if (hasFavorites) {
          const newFavorites = favorites.filter((fav) => fav.userId !== userId)
          localStorage.setItem("favorites", JSON.stringify(newFavorites))
        }
      } else {
        alert("Exclusão cancelada. O usuário não foi removido.")
        return
      }
    }

    // Remove user
    const newUsers = users.filter((user) => user.id !== userId)
    users = newUsers

    // Save to localStorage
    localStorage.setItem("users", JSON.stringify(users))

    // Reload data for related items
    loadData()

    // Refresh display
    displayUsers()
  }

  // Display users
  function displayUsers() {
    // Clear table
    usersTable.innerHTML = ""

    // Get filter values
    const roleValue = roleFilter.value
    const dateValue = dateFilter.value
    const searchValue = searchUser.value.toLowerCase()

    // Apply filters
    let filteredUsers = users

    // Role filter
    if (roleValue !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === roleValue)
    }

    // Date filter
    if (dateValue !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const weekAgo = today - 7 * 24 * 60 * 60 * 1000
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime()

      filteredUsers = filteredUsers.filter((user) => {
        const userDate = new Date(user.createdAt).getTime()

        if (dateValue === "today") {
          return userDate >= today
        } else if (dateValue === "week") {
          return userDate >= weekAgo
        } else if (dateValue === "month") {
          return userDate >= monthAgo
        }

        return true
      })
    }

    // Search filter
    if (searchValue) {
      filteredUsers = filteredUsers.filter((user) => {
        return (
          user.name.toLowerCase().includes(searchValue) ||
          user.email.toLowerCase().includes(searchValue) ||
          user.id.toString().includes(searchValue)
        )
      })
    }

    // Sort by date (newest first)
    filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Display users
    filteredUsers.forEach((user) => {
      const row = document.createElement("tr")

      // Get role class
      const roleClass = `role-${user.role}`

      // Get role display
      const roleDisplay = user.role === "admin" ? "Administrador" : "Usuário"

      row.innerHTML = `
                <td>#${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${roleClass}">${roleDisplay}</span></td>
                <td>${formatDate(user.createdAt)}</td>
                <td>
                    <button class="btn-icon edit-user" data-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `

      usersTable.appendChild(row)

      // Add event listeners
      const editButton = row.querySelector(".edit-user")

      editButton.addEventListener("click", function () {
        const userId = Number.parseInt(this.getAttribute("data-id"))
        const user = users.find((u) => u.id === userId)
        if (user) {
          openUserDetailModal(user)
        }
      })
    })

    // If no users, show message
    if (filteredUsers.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = '<td colspan="6" style="text-align: center;">Nenhum usuário encontrado</td>'
      usersTable.appendChild(row)
    }
  }

  // Public API
  return {
    init: init,
  }
})()

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  AdminUsersModule.init()
})

