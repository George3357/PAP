/**
 * Cars Module - Gerenciamento de carros
 */
const CarsModule = (function () {
  // Cache de carros
  let carsCache = [];

  // Elementos DOM
  const featuredCarsContainer = document.getElementById("featured-cars");
  const carsGrid = document.getElementById("cars-grid");
  const carDetailsContainer = document.getElementById("car-details-container");
  const carDetailsModal = document.getElementById("car-details-modal");
  const carDetailsContent = document.getElementById("car-details-content");
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const filterForm = document.getElementById("filter-form");
  const resetFilterBtn = document.getElementById("reset-filter");
  const resultsCount = document.getElementById("results-count");
  const noResults = document.getElementById("no-results");

  // Elementos do modal de compra
  const purchaseModal = document.getElementById("purchase-modal");
  const purchaseCarImage = document.getElementById("purchase-car-image");
  const purchaseCarName = document.getElementById("purchase-car-name");
  const purchaseCarPrice = document.getElementById("purchase-car-price");
  const purchaseQuantity = document.getElementById("purchase-quantity");
  const purchaseMaxQuantity = document.getElementById("purchase-max-quantity");
  const purchaseTotal = document.getElementById("purchase-total");
  const purchaseForm = document.getElementById("purchase-form");
  const purchaseClose = document.getElementById("purchase-close");
  const purchaseCancel = document.getElementById("purchase-cancel");

  // Carro atual para compra
  let currentCar = null;

  // Declaração de variáveis (antes do init)
  let MainModule;
  let debounce;
  let handleSearch;
  let handleSort;
  let handleFilter;
  let cars = []; // Declare the cars variable here

  // Inicialização
  function init() {
    // Import MainModule (assumindo que está disponível globalmente ou pode ser importado)
    if (typeof window !== "undefined" && window.MainModule) {
      MainModule = window.MainModule;
    } else {
      console.error(
        "MainModule is not defined. Ensure it is loaded globally or imported."
      );
      return; // Exit if MainModule is not available
    }

    // Import debounce (assumindo que está disponível globalmente ou pode ser importado)
    if (typeof window !== "undefined" && window.debounce) {
      debounce = window.debounce;
    } else {
      console.error(
        "debounce is not defined. Ensure it is loaded globally or imported."
      );
      return; // Exit if debounce is not available
    }

    // Definição de handleSearch
    handleSearch = function (event) {
      const searchTerm = event.target.value.toLowerCase();
      // Lógica de pesquisa aqui (exemplo)
      console.log("Searching for:", searchTerm);
      // Chame a função de renderização ou filtragem apropriada
      filterAndRenderCars(searchTerm);
    };

    // Definição de handleSort
    handleSort = function (event) {
      const sortBy = event.target.value;
      // Lógica de ordenação aqui (exemplo)
      console.log("Sorting by:", sortBy);
      // Chame a função de renderização ou ordenação apropriada
      sortAndRenderCars(sortBy);
    };

    // Definição de handleFilter
    handleFilter = function (event) {
      event.preventDefault();
      const formData = new FormData(filterForm);
      const filters = {};
      for (const [key, value] of formData.entries()) {
        filters[key] = value;
      }
      // Lógica de filtragem aqui (exemplo)
      console.log("Filtering with:", filters);
      // Chame a função de renderização ou filtragem apropriada
      filterAndRenderCars(null, filters);
    };

    setupEventListeners();

    // Carregar carros em destaque na página inicial
    if (featuredCarsContainer) {
      loadFeaturedCars();
    }

    // Carregar lista de carros na página de carros
    if (carsGrid && window.location.pathname.includes("cars.html")) {
      loadCars();
    }

    // Carregar detalhes do carro na página de detalhes
    if (
      carDetailsContainer &&
      window.location.pathname.includes("car-details.html")
    ) {
      const params = MainModule.getUrlParams();
      if (params.id) {
        loadCarDetails(params.id);
      } else {
        window.location.href = "/cars.html";
      }
    }
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Pesquisa
    if (searchInput) {
      searchInput.addEventListener("input", debounce(handleSearch, 300));
    }

    // Ordenação
    if (sortSelect) {
      sortSelect.addEventListener("change", handleSort);
    }

    // Filtros
    if (filterForm) {
      filterForm.addEventListener("submit", handleFilter);
    }

    // Reset de filtros
    if (resetFilterBtn) {
      resetFilterBtn.addEventListener("click", resetFilters);
    }

    // Modal de compra
    if (purchaseClose) {
      purchaseClose.addEventListener("click", () =>
        MainModule.closeModal("purchase-modal")
      );
    }

    if (purchaseCancel) {
      purchaseCancel.addEventListener("click", () =>
        MainModule.closeModal("purchase-modal")
      );
    }

    if (purchaseQuantity) {
      purchaseQuantity.addEventListener("input", updatePurchaseTotal);
    }

    if (purchaseForm) {
      purchaseForm.addEventListener("submit", handlePurchase);
    }
  }

  // Carregar carros em destaque
  async function loadFeaturedCars() {
    try {
      // Use the global function to get featured cars
      const featuredCars = window.getFeaturedCars();
      
      if (featuredCars && featuredCars.length > 0) {
        // Renderizar carros em destaque
        renderCars(featuredCars, featuredCarsContainer);
      } else {
        console.error("No featured cars found");
        featuredCarsContainer.innerHTML = "<p>Nenhum carro em destaque encontrado.</p>";
      }
    } catch (error) {
      console.error("Erro ao carregar carros em destaque:", error);
      if (MainModule && MainModule.showToast) {
        MainModule.showToast("Erro ao carregar carros em destaque", "error");
      }
    }
  }

  // Carregar lista de carros
  async function loadCars() {
    try {
      // Verificar se há parâmetros de URL para filtrar
      const params = MainModule ? MainModule.getUrlParams() : {};

      // Buscar carros usando a função global
      let filteredCars = window.getAllCars();

      // Aplicar filtros da URL
      if (params.brand) {
        filteredCars = filteredCars.filter(
          (car) => car.brand.toLowerCase() === params.brand.toLowerCase()
        );

        // Selecionar a marca no filtro
        const brandSelect = document.querySelector('select[name="brand"]');
        if (brandSelect) {
          brandSelect.value = params.brand;
        }
      }

      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredCars = filteredCars.filter(
          (car) =>
            (car.model && car.model.toLowerCase().includes(searchTerm)) ||
            (car.brand && car.brand.toLowerCase().includes(searchTerm)) ||
            (car.description && car.description.toLowerCase().includes(searchTerm))
        );

        // Preencher campo de pesquisa
        if (searchInput) {
          searchInput.value = params.search;
        }
      }

      // Ordenar carros
      if (params.sort) {
        filteredCars = sortCars(filteredCars, params.sort);

        // Selecionar opção de ordenação
        if (sortSelect) {
          sortSelect.value = params.sort;
        }
      }

      // Renderizar carros
      renderCars(filteredCars, carsGrid);
      updateResultsCount(filteredCars.length);
    } catch (error) {
      console.error("Erro ao carregar carros:", error);
      if (MainModule && MainModule.showToast) {
        MainModule.showToast("Erro ao carregar carros", "error");
      }
    }
  }

  // Carregar detalhes do carro
  async function loadCarDetails(carId) {
    try {
      const car = window.getCarById(parseInt(carId));

      if (!car) {
        window.location.href = "/cars.html";
        return;
      }

      // Renderizar detalhes do carro
      renderCarDetails(car);

      // Carregar carros similares
      loadSimilarCars(car);
    } catch (error) {
      console.error("Erro ao carregar detalhes do carro:", error);
      if (MainModule && MainModule.showToast) {
        MainModule.showToast("Erro ao carregar detalhes do carro", "error");
      }
    }
  }

  // Carregar carros similares
  async function loadSimilarCars(car) {
    try {
      const allCars = window.getAllCars();

      // Filtrar carros da mesma marca, excluindo o carro atual
      let similarCars = allCars.filter(
        (c) => c.brand === car.brand && c.id !== car.id
      );

      // Se não houver carros suficientes da mesma marca, adicionar outros
      if (similarCars.length < 3) {
        const otherCars = allCars.filter(
          (c) => c.brand !== car.brand && c.id !== car.id
        );

        similarCars = [...similarCars, ...otherCars].slice(0, 3);
      } else {
        similarCars = similarCars.slice(0, 3);
      }

      // Renderizar carros similares
      const similarCarsContainer = document.getElementById("similar-cars-grid");
      if (similarCarsContainer) {
        renderCars(similarCars, similarCarsContainer);
      }
    } catch (error) {
      console.error("Erro ao carregar carros similares:", error);
    }
  }

  // Renderizar lista de carros
  function renderCars(cars, container) {
    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!cars || cars.length === 0) {
      container.innerHTML = "<p>Nenhum carro encontrado.</p>";
      return;
    }

    cars.forEach((car) => {
      const carCard = document.createElement("div");
      carCard.classList.add("car-card");
      
      // Use the first image from the images array
      const carImage = car.images && car.images.length > 0 ? car.images[0] : '/placeholder.svg?height=200&width=300';
      const carName = `${car.brand} ${car.model}`;
      
      // Check if car is in favorites
      const isFavorite = window.isInFavorites(car.id);
      const favoriteClass = isFavorite ? 'active' : '';
      const favoriteIcon = isFavorite ? 'fas fa-heart' : 'far fa-heart';
      
      carCard.innerHTML = `
        <a href="/car-details.html?id=${car.id}">
          <img src="${carImage}" alt="${carName}" onerror="this.src='/placeholder.svg?height=200&width=300'">
          <h3>${carName}</h3>
          <p class="car-brand">${car.brand}</p>
          <p class="car-price">${window.formatPrice(car.price)}</p>
        </a>
        <div class="car-actions">
          <button class="favorite-btn ${favoriteClass}" data-car-id="${car.id}">
            <i class="${favoriteIcon}"></i>
          </button>
          <button class="buy-button" data-car-id="${car.id}">Comprar</button>
        </div>
      `;

      container.appendChild(carCard);

      // Evento de compra
      const buyButton = carCard.querySelector(".buy-button");
      buyButton.addEventListener("click", () => openPurchaseModal(car));
    });
  }

  // Renderizar detalhes do carro
  function renderCarDetails(car) {
    if (!carDetailsContainer) {
      return;
    }

    // Use the first image from the images array
    const carImage = car.images && car.images.length > 0 ? car.images[0] : '/placeholder.svg?height=400&width=600';
    const carName = `${car.brand} ${car.model}`;

    carDetailsContainer.innerHTML = `
      <div class="car-details">
        <img src="${carImage}" alt="${carName}" onerror="this.src='/placeholder.svg?height=400&width=600'">
        <h2>${carName}</h2>
        <p class="car-brand">Marca: ${car.brand}</p>
        <p class="car-price">Preço: ${window.formatPrice(car.price)}</p>
        <p class="car-description">${car.description}</p>
        <button class="buy-button" data-car-id="${car.id}">Comprar</button>
      </div>
    `;

    // Evento de compra
    const buyButton = carDetailsContainer.querySelector(".buy-button");
    buyButton.addEventListener("click", () => openPurchaseModal(car));
  }

  // Ordenar carros
  function sortCars(cars, sortBy) {
    if (!cars || !Array.isArray(cars)) return [];
    
    const carsCopy = [...cars]; // Create a copy to avoid modifying the original
    
    switch (sortBy) {
      case "price-asc":
        return carsCopy.sort((a, b) => a.price - b.price);
      case "price-desc":
        return carsCopy.sort((a, b) => b.price - a.price);
      case "newest":
        return carsCopy.sort((a, b) => b.year - a.year);
      case "oldest":
        return carsCopy.sort((a, b) => a.year - b.year);
      default:
        return carsCopy;
    }
  }

  // Atualizar contador de resultados
  function updateResultsCount(count) {
    if (resultsCount) {
      resultsCount.textContent = `${count} resultados`;
    }

    if (noResults) {
      noResults.style.display = count === 0 ? "block" : "none";
    }
  }

  // Resetar filtros
  function resetFilters() {
    const brandSelect = document.querySelector('select[name="brand"]');
    if (brandSelect) {
      brandSelect.value = "";
    }

    if (searchInput) {
      searchInput.value = "";
    }

    // Recarregar carros sem filtros
    loadCars();
  }

  // Abrir modal de compra
  function openPurchaseModal(car) {
    currentCar = car;

    // Use the first image from the images array
    const carImage = car.images && car.images.length > 0 ? car.images[0] : '/placeholder.svg?height=200&width=300';
    const carName = `${car.brand} ${car.model}`;

    if (purchaseCarImage) {
      purchaseCarImage.src = carImage;
      purchaseCarImage.alt = carName;
    }

    if (purchaseCarName) {
      purchaseCarName.textContent = carName;
    }

    if (purchaseCarPrice) {
      purchaseCarPrice.textContent = window.formatPrice(car.price);
    }

    if (purchaseQuantity) {
      purchaseQuantity.value = 1;
    }

    if (purchaseMaxQuantity) {
      purchaseMaxQuantity.textContent = 10; // Defina a quantidade máxima disponível
    }

    updatePurchaseTotal();

    if (MainModule && MainModule.openModal) {
      MainModule.openModal("purchase-modal");
    }
  }

  // Atualizar total da compra
  function updatePurchaseTotal() {
    const quantity = parseInt(purchaseQuantity.value);

    if (isNaN(quantity) || quantity <= 0) {
      purchaseQuantity.value = 1;
      return;
    }

    if (quantity > 10) {
      purchaseQuantity.value = 10;
      return;
    }

    const price = currentCar ? currentCar.price : 0;
    const total = price * quantity;

    if (purchaseTotal) {
      purchaseTotal.textContent = window.formatPrice(total);
    }
  }

  // Lidar com a compra
  function handlePurchase(event) {
    event.preventDefault();

    const quantity = parseInt(purchaseQuantity.value);

    if (isNaN(quantity) || quantity <= 0) {
      if (MainModule && MainModule.showToast) {
        MainModule.showToast("Quantidade inválida", "error");
      }
      return;
    }

    if (!currentCar) {
      if (MainModule && MainModule.showToast) {
        MainModule.showToast("Carro não selecionado", "error");
      }
      return;
    }

    // Simulação de compra
    console.log("Compra realizada:", currentCar, quantity);
    if (MainModule && MainModule.showToast) {
      MainModule.showToast("Compra realizada com sucesso!", "success");
    }
    if (MainModule && MainModule.closeModal) {
      MainModule.closeModal("purchase-modal");
    }
  }

  // Função auxiliar para filtrar e renderizar carros
  function filterAndRenderCars(searchTerm = null, filters = {}) {
    let filteredCars = window.getAllCars();

    if (searchTerm) {
      filteredCars = filteredCars.filter(
        (car) =>
          (car.model && car.model.toLowerCase().includes(searchTerm)) ||
          (car.brand && car.brand.toLowerCase().includes(searchTerm)) ||
          (car.description && car.description.toLowerCase().includes(searchTerm))
      );
    }

    // Apply brand filter if specified
    if (filters && filters.brand && filters.brand !== 'all') {
      filteredCars = filteredCars.filter(car => car.brand === filters.brand);
    }

    // Apply other filters here if needed

    renderCars(filteredCars, carsGrid);
    updateResultsCount(filteredCars.length);
  }

  // Função auxiliar para ordenar e renderizar carros
  function sortAndRenderCars(sortBy) {
    let sortedCars = sortCars(window.getAllCars(), sortBy);
    renderCars(sortedCars, carsGrid);
  }

  // Função auxiliar para embaralhar array
  function shuffleArray(array) {
    if (!array || !Array.isArray(array)) return [];
    
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Inicializar módulo
  init();

  // Retornar métodos públicos
  return {
    loadCars: loadCars,
    loadCarDetails: loadCarDetails,
  };
})();

// Car Database Management
(function() {
  console.log("Initializing luxury car database...");
  
  // Check if database exists
  const existingCars = localStorage.getItem('carDatabase');
  if (!existingCars) {
      console.log("No car database found. Creating new luxury car database...");
      
      // Sample luxury sports car data
      const luxuryCars = [
          {
              id: 1,
              brand: 'Ferrari',
              model: '812 Superfast Novitec',
              year: 2023,
              price: 3500000,
              mileage: 0,
              fuel: 'Gasolina',
              transmission: 'Automático',
              color: 'Vermelho',
              description: 'Ferrari 812 Superfast by Novitec 2023 0km, motor V12 de 800cv, aceleração de 0-100 km/h em 2.8 segundos. Interior em couro premium, sistema de navegação e som Bose.',
              features: ['Motor V12', 'Potência de 800cv', 'Tração traseira', 'Freios de carbono-cerâmica', 'Interior em couro', 'Sistema de som Bose', 'Câmeras 360°', 'Suspensão adaptativa'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: true,
              status: 'new'
          },
          {
              id: 2,
              brand: 'Lamborghini',
              model: 'Huracán EVO',
              year: 2022,
              price: 3200000,
              mileage: 1500,
              fuel: 'Gasolina',
              transmission: 'Automático',
              color: 'Verde',
              description: 'Lamborghini Huracán EVO 2022 com apenas 1.500 km, motor V10 de 640cv, sistema de tração integral, interior em Alcantara e fibra de carbono.',
              features: ['Motor V10', 'Potência de 640cv', 'Tração integral', 'Freios de carbono-cerâmica', 'Interior em Alcantara', 'Sistema de som Bang & Olufsen', 'Modo Corsa', 'Suspensão magnética'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: true,
              status: 'used'
          },
          {
              id: 3,
              brand: 'McLaren',
              model: '720S',
              year: 2021,
              price: 2800000,
              mileage: 3000,
              fuel: 'Gasolina',
              transmission: 'Automático',
              color: 'Laranja',
              description: 'McLaren 720S 2021 em estado impecável, motor V8 biturbo de 720cv, carroceria e chassi em fibra de carbono, portas dihedral, sistema de elevação frontal.',
              features: ['Motor V8 biturbo', 'Potência de 720cv', 'Chassi MonoCage II', 'Portas dihedral', 'Sistema de elevação frontal', 'Interior em couro e Alcantara', 'Pacote de fibra de carbono', 'Escapamento esportivo'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: false,
              status: 'used'
          },
          {
              id: 4,
              brand: 'Bugatti',
              model: 'Chiron',
              year: 2023,
              price: 18000000,
              mileage: 0,
              fuel: 'Gasolina',
              transmission: 'Automático',
              color: 'Azul',
              description: 'Bugatti Chiron 2023 0km, motor W16 quad-turbo de 1500cv, velocidade máxima limitada a 420 km/h, interior personalizado com materiais premium e acabamentos exclusivos.',
              features: ['Motor W16 quad-turbo', 'Potência de 1500cv', 'Velocidade máxima de 420 km/h', 'Aceleração 0-100 km/h em 2.4s', 'Interior personalizado', 'Sistema de telemetria', 'Freios de carbono-cerâmica', 'Chassi de fibra de carbono'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: true,
              status: 'new'
          },
          {
              id: 5,
              brand: 'Koenigsegg',
              model: 'Jesko',
              year: 2022,
              price: 15000000,
              mileage: 500,
              fuel: 'Gasolina',
              transmission: 'Automático',
              color: 'Prata',
              description: 'Koenigsegg Jesko 2022 com apenas 500 km, motor V8 biturbo de 1600cv com E85, transmissão Light Speed de 9 velocidades, downforce de 1400kg.',
              features: ['Motor V8 biturbo', 'Potência de 1600cv com E85', 'Transmissão Light Speed', 'Chassi de fibra de carbono', 'Aerodinâmica ativa', 'Portas dihedral sincronizadas', 'Sistema de telemetria', 'Suspensão adaptativa'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: true,
              status: 'used'
          },
          {
              id: 6,
              brand: 'Rolls-Royce',
              model: 'Wraith Black Badge',
              year: 2023,
              price: 4500000,
              mileage: 0,
              fuel: 'Gasolina',
              transmission: 'Automático',
              color: 'Preto',
              description: 'Rolls-Royce Wraith Black Badge 2023 0km, motor V12 biturbo de 632cv, interior artesanal com couro premium, teto estrelado com 1340 fibras ópticas, acabamentos em fibra de carbono técnica.',
              features: ['Motor V12 biturbo', 'Potência de 632cv', 'Teto estrelado Starlight', 'Interior artesanal', 'Sistema de áudio Bespoke', 'Portas coach', 'Acabamentos em fibra de carbono técnica', 'Suspensão auto-nivelante'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: false,
              status: 'new'
          },
          {
              id: 7,
              brand: 'Corvette',
              model: 'C8 Z06',
              year: 2023,
              price: 1200000,
              mileage: 0,
              fuel: 'Gasolina',
              transmission: 'Automático',
              color: 'Amarelo',
              description: 'Chevrolet Corvette C8 Z06 2023 0km, motor V8 naturalmente aspirado de 670cv com 8.600 rpm, layout central, pacote Z07 com aerodinâmica e freios de carbono-cerâmica.',
              features: ['Motor V8 naturalmente aspirado', 'Potência de 670cv', 'Layout central', 'Pacote Z07', 'Freios de carbono-cerâmica', 'Suspensão Magnetic Ride', 'Escapamento esportivo', 'Modo pista'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: true,
              status: 'new'
          },
          {
              id: 8,
              brand: 'Lotus',
              model: 'Evija',
              year: 2022,
              price: 9000000,
              mileage: 100,
              fuel: 'Elétrico',
              transmission: 'Automático',
              color: 'Branco',
              description: 'Lotus Evija 2022, superesportivo totalmente elétrico com 2000cv, 4 motores independentes, autonomia de 400km, carregamento de 18 minutos para 80%, aerodinâmica ativa com efeito Venturi.',
              features: ['Potência de 2000cv', '4 motores elétricos', 'Autonomia de 400km', 'Carregamento rápido', 'Chassi de fibra de carbono', 'Aerodinâmica ativa', 'Efeito Venturi', 'Torque vetorial'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: true,
              status: 'used'
          },
          {
              id: 9,
              brand: 'Rimac',
              model: 'Nevera',
              year: 2023,
              price: 12000000,
              mileage: 0,
              fuel: 'Elétrico',
              transmission: 'Automático',
              color: 'Azul',
              description: 'Rimac Nevera 2023 0km, hipercarro elétrico com 1914cv, aceleração de 0-100 km/h em 1.85 segundos, 4 motores independentes, autonomia de 550km, carroceria em fibra de carbono.',
              features: ['Potência de 1914cv', '4 motores elétricos', 'Aceleração 0-100 km/h em 1.85s', 'Autonomia de 550km', 'Carroceria em fibra de carbono', 'Torque vetorial', 'Sistema de telemetria', 'Freios regenerativos'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: true,
              status: 'new'
          },
          {
              id: 10,
              brand: 'Porsche',
              model: '911 GT3 RS',
              year: 2022,
              price: 1800000,
              mileage: 1000,
              fuel: 'Gasolina',
              transmission: 'PDK',
              color: 'Vermelho',
              description: 'Porsche 911 GT3 RS 2022 com apenas 1.000 km, motor boxer 6 cilindros de 525cv, pacote Weissach, sistema de suspensão dianteira hidráulica, aerodinâmica ativa com DRS.',
              features: ['Motor boxer 6 cilindros', 'Potência de 525cv', 'Transmissão PDK', 'Pacote Weissach', 'Aerodinâmica ativa', 'Sistema DRS', 'Suspensão dianteira hidráulica', 'Freios PCCB'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: false,
              status: 'used'
          },
          {
              id: 11,
              brand: 'Aston Martin',
              model: 'Valkyrie',
              year: 2023,
              price: 14000000,
              mileage: 0,
              fuel: 'Gasolina',
              transmission: 'Automático',
              color: 'Prata',
              description: 'Aston Martin Valkyrie 2023 0km, desenvolvido em parceria com a Red Bull Racing, motor V12 de 1155cv, relação peso/potência de 1:1, aerodinâmica inspirada na F1.',
              features: ['Motor V12 Cosworth', 'Potência de 1155cv', 'Sistema híbrido KERS', 'Chassi de fibra de carbono', 'Aerodinâmica de F1', 'Assentos integrados ao chassi', 'Volante destacável', 'Telemetria avançada'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: true,
              status: 'new'
          },
          {
              id: 12,
              brand: 'Pagani',
              model: 'Huayra Roadster BC',
              year: 2022,
              price: 16000000,
              mileage: 300,
              fuel: 'Gasolina',
              transmission: 'Automático',
              color: 'Azul Carbono',
              description: 'Pagani Huayra Roadster BC 2022 com apenas 300 km, motor AMG V12 biturbo de 802cv, carroceria em carbono-titânio, interior artesanal com couro e alumínio usinado.',
              features: ['Motor AMG V12 biturbo', 'Potência de 802cv', 'Carroceria em carbono-titânio', 'Interior artesanal', 'Suspensão ativa', 'Sistema de escape em titânio', 'Rodas forjadas', 'Aerodinâmica ativa'],
              images: ['/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'],
              featured: true,
              status: 'used'
          }
      ];
      
      // Save to localStorage with timestamp to prevent caching issues
      localStorage.setItem('carDatabase', JSON.stringify(luxuryCars));
      console.log("New luxury car database created successfully with " + luxuryCars.length + " cars.");
  } else {
      console.log("Existing car database found with " + JSON.parse(existingCars).length + " cars.");
  }
  
  // Function to get all cars
  const getAllCars = function() {
      const cars = JSON.parse(localStorage.getItem('carDatabase')) || [];
      return cars;
  };

  window.getAllCars = getAllCars;
  
  // Function to get car by ID
  window.getCarById = function(id) {
      const cars = getAllCars();
      return cars.find(car => car.id === parseInt(id));
  };
  
  // Function to get featured cars
  window.getFeaturedCars = function() {
      const cars = getAllCars();
      return cars.filter(car => car.featured);
  };
  
  // Function to filter cars
  window.filterCars = function(filters) {
      let cars = getAllCars();
      
      if (filters.brand && filters.brand !== 'all') {
          cars = cars.filter(car => car.brand === filters.brand);
      }
      
      if (filters.model && filters.model !== '') {
          cars = cars.filter(car => car.model.toLowerCase().includes(filters.model.toLowerCase()));
      }
      
      if (filters.minPrice) {
          cars = cars.filter(car => car.price >= filters.minPrice);
      }
      
      if (filters.maxPrice) {
          cars = cars.filter(car => car.price <= filters.maxPrice);
      }
      
      if (filters.minYear) {
          cars = cars.filter(car => car.year >= filters.minYear);
      }
      
      if (filters.maxYear) {
          cars = cars.filter(car => car.year <= filters.maxYear);
      }
      
      if (filters.status && filters.status !== 'all') {
          cars = cars.filter(car => car.status === filters.status);
      }
      
      return cars;
  };
  
  // Function to add a car to favorites
  window.addToFavorites = function(carId) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
          alert('Você precisa estar logado para adicionar aos favoritos.');
          return false;
      }
      
      let favorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
      if (!favorites[currentUser.email]) {
          favorites[currentUser.email] = [];
      }
      
      if (!favorites[currentUser.email].includes(carId)) {
          favorites[currentUser.email].push(carId);
          localStorage.setItem('userFavorites', JSON.stringify(favorites));
          return true;
      }
      
      return false;
  };
  
  // Function to remove a car from favorites
  window.removeFromFavorites = function(carId) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return false;
      
      let favorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
      if (!favorites[currentUser.email]) return false;
      
      const index = favorites[currentUser.email].indexOf(carId);
      if (index !== -1) {
          favorites[currentUser.email].splice(index, 1);
          localStorage.setItem('userFavorites', JSON.stringify(favorites));
          return true;
      }
      
      return false;
  };
  
  // Function to check if a car is in favorites
  window.isInFavorites = function(carId) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return false;
      
      let favorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
      if (!favorites[currentUser.email]) return false;
      
      return favorites[currentUser.email].includes(carId);
  };
  
  // Function to format price in Euro - make it globally accessible
  window.formatPrice = function(price) {
      // Convert BRL to EUR (approximate exchange rate: 1 EUR = 5.5 BRL)
      const euroPrice = price / 5.5;
      
      return euroPrice.toLocaleString('de-DE', {
          style: 'currency',
          currency: 'EUR'
      });
  };
  
  // Function to get cars by brand
  window.getCarsByBrand = function(brand) {
      const cars = getAllCars();
      if (!brand) return cars;
      
      return cars.filter(car => car.brand === brand);
  };
})();