/**
 * Favorites Module - Gerenciamento de favoritos
 */
const FavoritesModule = (function () {
    // Cache DOM elements
    const favoritesContainer = document.getElementById("favorites-container");
    const favoritesCount = document.getElementById("favorites-count");
    const emptyFavoritesMessage = document.getElementById("empty-favorites-message");
    
    // Initialize
    function init() {
      // Load favorites if on the profile page
      if (favoritesContainer) {
        loadFavorites();
      }
      
      // Update favorites count in the header
      updateFavoritesCount();
      
      // Add event delegation for favorite buttons
      document.addEventListener('click', function(event) {
        if (event.target.classList.contains('favorite-btn') || 
            event.target.closest('.favorite-btn')) {
          const button = event.target.classList.contains('favorite-btn') ? 
                        event.target : 
                        event.target.closest('.favorite-btn');
          const carId = parseInt(button.dataset.carId);
          toggleFavorite(carId, button);
        }
      });
    }
    
    // Load favorites on profile page
    function loadFavorites() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        showLoginRequired();
        return;
      }
      
      const favorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
      const userFavorites = favorites[currentUser.email] || [];
      
      if (userFavorites.length === 0) {
        showEmptyFavorites();
        return;
      }
      
      // Get car details for each favorite
      const favoriteCars = userFavorites.map(id => window.getCarById(id)).filter(car => car);
      
      // Render favorite cars
      renderFavoriteCars(favoriteCars);
    }
    
    // Show login required message
    function showLoginRequired() {
      if (emptyFavoritesMessage) {
        emptyFavoritesMessage.innerHTML = `
          <div class="login-required">
            <i class="fas fa-user-lock"></i>
            <h3>Login Necessário</h3>
            <p>Faça login para ver seus carros favoritos.</p>
            <a href="/login.html" class="btn btn-primary">Login</a>
          </div>
        `;
        emptyFavoritesMessage.style.display = 'block';
      }
      
      if (favoritesContainer) {
        favoritesContainer.style.display = 'none';
      }
    }
    
    // Show empty favorites message
    function showEmptyFavorites() {
      if (emptyFavoritesMessage) {
        emptyFavoritesMessage.innerHTML = `
          <div class="empty-favorites">
            <i class="far fa-heart"></i>
            <h3>Nenhum Favorito</h3>
            <p>Você ainda não adicionou nenhum carro aos favoritos.</p>
            <a href="/cars.html" class="btn btn-primary">Ver Carros</a>
          </div>
        `;
        emptyFavoritesMessage.style.display = 'block';
      }
      
      if (favoritesContainer) {
        favoritesContainer.style.display = 'none';
      }
    }
    
    // Render favorite cars
    function renderFavoriteCars(cars) {
      if (!favoritesContainer) return;
      
      favoritesContainer.innerHTML = '';
      favoritesContainer.style.display = 'grid';
      
      if (emptyFavoritesMessage) {
        emptyFavoritesMessage.style.display = 'none';
      }
      
      cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.classList.add('car-card');
        
        // Use the first image from the images array
        const carImage = car.images && car.images.length > 0 ? car.images[0] : '/placeholder.svg?height=200&width=300';
        const carName = `${car.brand} ${car.model}`;
        
        carCard.innerHTML = `
          <a href="/car-details.html?id=${car.id}">
            <img src="${carImage}" alt="${carName}" onerror="this.src='/placeholder.svg?height=200&width=300'">
            <h3>${carName}</h3>
            <p class="car-brand">${car.brand}</p>
            <p class="car-price">${window.formatPrice(car.price)}</p>
          </a>
          <div class="car-actions">
            <button class="favorite-btn active" data-car-id="${car.id}">
              <i class="fas fa-heart"></i>
            </button>
            <button class="buy-button" data-car-id="${car.id}">Comprar</button>
          </div>
        `;
        
        favoritesContainer.appendChild(carCard);
      });
    }
    
    // Toggle favorite status
    function toggleFavorite(carId, button) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        // Show login modal or redirect to login
        if (window.MainModule && window.MainModule.showToast) {
          window.MainModule.showToast('Faça login para adicionar aos favoritos', 'warning');
        } else {
          alert('Faça login para adicionar aos favoritos');
        }
        return;
      }
      
      const isFavorite = window.isInFavorites(carId);
      
      if (isFavorite) {
        // Remove from favorites
        window.removeFromFavorites(carId);
        if (button) {
          button.classList.remove('active');
          button.innerHTML = '<i class="far fa-heart"></i>';
        }
        
        // If on favorites page, remove the card
        if (favoritesContainer && window.location.pathname.includes('profile.html')) {
          const card = button.closest('.car-card');
          if (card) {
            card.remove();
            
            // Check if there are any favorites left
            if (favoritesContainer.children.length === 0) {
              showEmptyFavorites();
            }
          }
        }
        
        if (window.MainModule && window.MainModule.showToast) {
          window.MainModule.showToast('Removido dos favoritos', 'success');
        }
      } else {
        // Add to favorites
        window.addToFavorites(carId);
        if (button) {
          button.classList.add('active');
          button.innerHTML = '<i class="fas fa-heart"></i>';
        }
        
        if (window.MainModule && window.MainModule.showToast) {
          window.MainModule.showToast('Adicionado aos favoritos', 'success');
        }
      }
      
      // Update favorites count
      updateFavoritesCount();
    }
    
    // Update favorites count in header
    function updateFavoritesCount() {
      if (!favoritesCount) return;
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        favoritesCount.textContent = '0';
        return;
      }
      
      const favorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
      const userFavorites = favorites[currentUser.email] || [];
      
      favoritesCount.textContent = userFavorites.length.toString();
    }
    
    // Initialize module
    init();
    
    // Return public methods
    return {
      loadFavorites: loadFavorites,
      toggleFavorite: toggleFavorite,
      updateFavoritesCount: updateFavoritesCount
    };
  })();