// Auth Module
const AuthModule = (function() {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');
    const navActions = document.querySelector('.nav-actions');
    
    // Initialize
    function init() {
        // Create admin user if none exists
        createAdminUser();
        
        // Setup event listeners
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // Update navigation based on auth state
        updateNavigation();
    }
    
    // Handle login
    function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simple validation
        if (!email || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store current user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect to home or requested page
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect') || 'index.html';
            
            window.location.href = redirect;
        } else {
            alert('Email ou senha incorretos.');
        }
    }
    
    // Handle register
    function handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        // Simple validation
        if (!name || !email || !password || !confirmPassword) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user already exists
        if (users.some(u => u.email === email)) {
            alert('Este email já está em uso.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role: 'user', // Default role
            createdAt: new Date().toISOString()
        };
        
        // Add user to users array
        users.push(newUser);
        
        // Save users to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Store current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Redirect to home
        window.location.href = 'index.html';
    }
    
    // Handle logout
    function handleLogout(e) {
        if (e) e.preventDefault();
        
        // Remove current user from localStorage
        localStorage.removeItem('currentUser');
        
        // Redirect to home
        window.location.href = 'index.html';
    }
    
    // Update navigation based on auth state
    function updateNavigation() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (navActions) {
            if (currentUser) {
                // User is logged in
                navActions.innerHTML = `
                    <div class="user-menu">
                        <button class="user-menu-toggle">
                            <i class="fas fa-user-circle"></i>
                            <span>${currentUser.name}</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="user-dropdown">
                            <a href="profile.html">
                                <i class="fas fa-user"></i> Meu Perfil
                            </a>
                            <a href="favorites.html">
                                <i class="fas fa-heart"></i> Favoritos
                                <span id="favorites-count" class="badge">0</span>
                            </a>
                            ${currentUser.role === 'admin' ? `
                                <a href="admin.html">
                                    <i class="fas fa-cog"></i> Admin
                                </a>
                            ` : ''}
                            <a href="#" id="logout-btn">
                                <i class="fas fa-sign-out-alt"></i> Sair
                            </a>
                        </div>
                    </div>
                    <button class="mobile-menu-toggle">
                        <i class="fas fa-bars"></i>
                    </button>
                `;
                
                // Setup user menu toggle
                const userMenuToggle = document.querySelector('.user-menu-toggle');
                const userDropdown = document.querySelector('.user-dropdown');
                
                if (userMenuToggle && userDropdown) {
                    userMenuToggle.addEventListener('click', function() {
                        userDropdown.classList.toggle('active');
                    });
                    
                    // Close dropdown when clicking outside
                    document.addEventListener('click', function(e) {
                        if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                            userDropdown.classList.remove('active');
                        }
                    });
                }
                
                // Setup logout button
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', handleLogout);
                }
                
                // Update favorites count
                updateFavoritesCount();
            } else {
                // User is not logged in
                navActions.innerHTML = `
                    <a href="login.html" class="btn btn-outline">Login</a>
                    <a href="register.html" class="btn btn-primary">Registrar</a>
                    <button class="mobile-menu-toggle">
                        <i class="fas fa-bars"></i>
                    </button>
                `;
            }
        }
    }
    
    // Update favorites count
    function updateFavoritesCount() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const favorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
        const userFavorites = favorites[currentUser.email] || [];
        
        const favoritesCount = document.getElementById('favorites-count');
        if (favoritesCount) {
            favoritesCount.textContent = userFavorites.length;
            
            // Hide badge if count is 0
            if (userFavorites.length === 0) {
                favoritesCount.style.display = 'none';
            } else {
                favoritesCount.style.display = 'inline-block';
            }
        }
    }
    
    // Create admin user if none exists
    function createAdminUser() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if admin user exists
        const adminExists = users.some(user => user.role === 'admin');
        
        if (!adminExists) {
            // Create admin user
            const adminUser = {
                id: Date.now(),
                name: 'Administrador',
                email: 'admin@cardealz.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            
            // Add admin to users array
            users.push(adminUser);
            
            // Save users to localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            console.log('Admin user created:', adminUser);
        }
    }
    
    // Public API
    return {
        init: init,
        createAdminUser: createAdminUser,
        logout: handleLogout
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    AuthModule.init();
});