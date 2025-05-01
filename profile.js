/**
 * Profile Module - Gerenciamento de perfil
 */
const ProfileModule = (function () {
    // Cache DOM elements
    const profileDetails = document.getElementById('profile-details');
    const profileForm = document.getElementById('profile-form');
    const logoutButton = document.getElementById('logout-button');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Initialize
    function init() {
      // Check if user is logged in
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser && window.location.pathname.includes('profile.html')) {
        window.location.href = '/login.html?redirect=profile.html';
        return;
      }
      
      // Load profile data
      loadProfileData();
      
      // Setup event listeners
      setupEventListeners();
    }
    
    // Load profile data
    function loadProfileData() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return;
      
      // Update profile details
      if (profileDetails) {
        profileDetails.innerHTML = `
          <h2>${currentUser.name || 'Usuário'}</h2>
          <p><i class="fas fa-envelope"></i> ${currentUser.email}</p>
          <p><i class="fas fa-phone"></i> ${currentUser.phone || 'Não informado'}</p>
          <p><i class="fas fa-map-marker-alt"></i> ${currentUser.address || 'Não informado'}</p>
        `;
      }
      
      // Fill profile form
      if (profileForm) {
        profileForm.elements.name.value = currentUser.name || '';
        profileForm.elements.email.value = currentUser.email || '';
        profileForm.elements.phone.value = currentUser.phone || '';
        profileForm.elements.address.value = currentUser.address || '';
      }
    }
    
    // Setup event listeners
    function setupEventListeners() {
      // Tab switching
      if (tabButtons) {
        tabButtons.forEach(button => {
          button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchTab(tabId);
          });
        });
      }
      
      // Profile form submission
      if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
      }
      
      // Logout button
      if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
      }
    }
    
    // Switch tab
    function switchTab(tabId) {
      // Update active tab button
      tabButtons.forEach(button => {
        if (button.dataset.tab === tabId) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
      
      // Update active tab content
      tabContents.forEach(content => {
        if (content.id === `${tabId}-tab`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    }
    
    // Handle profile update
    function handleProfileUpdate(event) {
      event.preventDefault();
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return;
      
      // Update user data
      currentUser.name = profileForm.elements.name.value;
      currentUser.phone = profileForm.elements.phone.value;
      currentUser.address = profileForm.elements.address.value;
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update users database
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(user => user.email === currentUser.email);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...currentUser };
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      // Show success message
      if (window.MainModule && window.MainModule.showToast) {
        window.MainModule.showToast('Perfil atualizado com sucesso!', 'success');
      } else {
        alert('Perfil atualizado com sucesso!');
      }
      
      // Reload profile data
      loadProfileData();
    }
    
    // Handle logout
    function handleLogout() {
      // Remove current user
      localStorage.removeItem('currentUser');
      
      // Redirect to home page
      window.location.href = '/index.html';
    }
    
    // Initialize module
    init();
    
    // Return public methods
    return {
      loadProfileData: loadProfileData,
      switchTab: switchTab
    };
  })();