document.addEventListener('DOMContentLoaded', function() {
    // Check if we have a brand parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const brandParam = urlParams.get('brand');
    
    // Mock functions for demonstration purposes.
    // In a real application, these would be properly imported or defined.
    const getCarsByBrand = (brand) => {
        // Replace this with your actual data fetching logic
        // This is just a placeholder to prevent errors
        console.warn("getCarsByBrand is a mock function. Implement your data fetching.");
        return [];
    };

    const formatPrice = (price) => {
        // Replace this with your actual price formatting logic
        // This is just a placeholder to prevent errors
        console.warn("formatPrice is a mock function. Implement your price formatting.");
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };
    
    if (brandParam) {
        // If we have a brand parameter, filter cars by that brand
        const carsGrid = document.getElementById('carsGrid');
        const brandTitle = document.getElementById('brandTitle');
        
        if (brandTitle) {
            brandTitle.textContent = `Supercarros ${brandParam}`;
        }
        
        // Get cars filtered by brand
        const cars = getCarsByBrand(brandParam);
        
        // Clear loading indicator
        if (carsGrid) {
            carsGrid.innerHTML = '';
            
            if (cars.length > 0) {
                cars.forEach(car => {
                    const carCard = document.createElement('div');
                    carCard.className = 'car-card';
                    
                    carCard.innerHTML = `
                        <div class="car-image">
                            <img src="${car.images[0]}" alt="${car.brand} ${car.model}" onerror="this.src='/placeholder.svg?height=200&width=300'">
                            <div class="car-status ${car.status}">${car.status === 'new' ? 'Novo' : 'Usado'}</div>
                        </div>
                        <div class="car-details">
                            <h3>${car.brand} ${car.model}</h3>
                            <div class="car-price">${formatPrice(car.price)}</div>
                            <div class="car-specs">
                                <div class="car-spec"><i class="fas fa-calendar"></i> ${car.year}</div>
                                <div class="car-spec"><i class="fas fa-tachometer-alt"></i> ${car.mileage.toLocaleString('pt-BR')} km</div>
                                <div class="car-spec"><i class="fas fa-gas-pump"></i> ${car.fuel}</div>
                            </div>
                            <a href="car-details.html?id=${car.id}" class="btn btn-outline btn-block">Ver Detalhes</a>
                        </div>
                    `;
                    
                    carsGrid.appendChild(carCard);
                });
            } else {
                carsGrid.innerHTML = '<p class="no-cars">Nenhum supercarro desta marca disponível no momento.</p>';
            }
        }
    }
});