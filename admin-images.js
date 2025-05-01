// Admin Images Module
const AdminImagesModule = (function() {
    // DOM Elements
    const adminTabs = document.querySelectorAll('.admin-tab');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');
    const imageCategories = document.querySelectorAll('.image-category');
    
    // Website Images
    const websiteUploadArea = document.getElementById('website-upload-area');
    const websiteImageUpload = document.getElementById('website-image-upload');
    const websiteImagesGrid = document.getElementById('website-images-grid');
    
    // Car Images
    const carSelect = document.getElementById('car-select');
    const carImageManager = document.getElementById('car-image-manager');
    const selectedCarName = document.getElementById('selected-car-name');
    const carImagesGrid = document.getElementById('car-images-grid');
    const addCarImage = document.getElementById('add-car-image');
    const carImageUpload = document.getElementById('car-image-upload');
    
    // Banner Images
    const bannerUploadArea = document.getElementById('banner-upload-area');
    const bannerImageUpload = document.getElementById('banner-image-upload');
    const bannerImagesGrid = document.getElementById('banner-images-grid');
    
    // Modals
    const imagePreviewModal = document.getElementById('image-preview-modal');
    const previewImage = document.getElementById('preview-image');
    const imageName = document.getElementById('image-name');
    const imageCategory = document.getElementById('image-category');
    const previewModalClose = document.getElementById('preview-modal-close');
    const previewModalCancel = document.getElementById('preview-modal-cancel');
    const previewModalSave = document.getElementById('preview-modal-save');
    
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const deleteModalClose = document.getElementById('delete-modal-close');
    const deleteModalCancel = document.getElementById('delete-modal-cancel');
    const deleteModalConfirm = document.getElementById('delete-modal-confirm');
    
    // State
    let currentTab = 'website-images';
    let currentCategory = 'all';
    let currentCarId = null;
    let currentImageId = null;
    let currentImageType = null;
    let currentImageToDelete = null;
    
    // Data
    let websiteImages = JSON.parse(localStorage.getItem('websiteImages')) || [];
    let bannerImages = JSON.parse(localStorage.getItem('bannerImages')) || [];
    let cars = [];
    
    // Initialize
    function init() {
        // Check if user is admin
        if (!checkAdminAccess()) {
            return; // Stop initialization if not admin
        }
        
        // Load cars
        loadCars();
        
        // Load images
        loadWebsiteImages();
        loadBannerImages();
        
        // Setup event listeners
        setupEventListeners();
    }
    
    // Check if user has admin access
    function checkAdminAccess() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.log('No user logged in, redirecting to login page');
            window.location.href = 'login.html?redirect=admin-images.html';
            return false;
        }
        
        if (currentUser.role !== 'admin') {
            console.log('User is not an admin, redirecting to login page');
            alert('Você precisa ter permissões de administrador para acessar esta página.');
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    }
    
    // Load cars from localStorage
    function loadCars() {
        cars = JSON.parse(localStorage.getItem('cars')) || [];
        
        // Populate car select
        carSelect.innerHTML = '<option value="">Selecione um carro</option>';
        
        cars.forEach(car => {
            const option = document.createElement('option');
            option.value = car.id;
            option.textContent = `${car.brand} ${car.model}`;
            carSelect.appendChild(option);
        });
    }
    
    // Load website images
    function loadWebsiteImages() {
        websiteImagesGrid.innerHTML = '';
        
        const filteredImages = currentCategory === 'all' 
            ? websiteImages 
            : websiteImages.filter(img => img.category === currentCategory);
        
        filteredImages.forEach(image => {
            addImageToGrid(image, 'website');
        });
    }
    
    // Load banner images
    function loadBannerImages() {
        bannerImagesGrid.innerHTML = '';
        
        bannerImages.forEach(image => {
            addImageToGrid(image, 'banner');
        });
    }
    
    // Load car images
    function loadCarImages(carId) {
        const car = cars.find(c => c.id === parseInt(carId));
        if (!car) return;
        
        currentCarId = parseInt(carId);
        selectedCarName.textContent = `${car.brand} ${car.model}`;
        
        // Clear grid except for the add button
        const addButton = carImagesGrid.lastElementChild;
        carImagesGrid.innerHTML = '';
        carImagesGrid.appendChild(addButton);
        
        // Add car images
        if (car.images && car.images.length > 0) {
            car.images.forEach((imageUrl, index) => {
                addCarImageToGrid(imageUrl, index);
            });
        }
        
        // Show car image manager
        carImageManager.style.display = 'block';
    }
    
    // Add image to grid
    function addImageToGrid(image, type) {
        const grid = type === 'website' ? websiteImagesGrid : bannerImagesGrid;
        
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.dataset.id = image.id;
        
        imageItem.innerHTML = `
            <img src="${image.url}" alt="${image.name}">
            <div class="image-actions">
                <button class="image-action edit" data-id="${image.id}" data-type="${type}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="image-action delete" data-id="${image.id}" data-type="${type}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="image-info">
                <p>${image.name}</p>
            </div>
        `;
        
        grid.appendChild(imageItem);
        
        // Add event listeners
        const editBtn = imageItem.querySelector('.edit');
        const deleteBtn = imageItem.querySelector('.delete');
        
        editBtn.addEventListener('click', function() {
            openImagePreviewModal(image, type);
        });
        
        deleteBtn.addEventListener('click', function() {
            openDeleteConfirmModal(image.id, type);
        });
    }
    
    // Add car image to grid
    function addCarImageToGrid(imageUrl, index) {
        const imageItem = document.createElement('div');
        imageItem.className = 'car-image-item';
        imageItem.dataset.index = index;
        
        imageItem.innerHTML = `
            <img src="${imageUrl}" alt="Car Image">
            <div class="car-image-actions">
                <button class="car-image-action edit" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="car-image-action delete" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="car-image-action primary" data-index="${index}" title="Set as primary image">
                    <i class="fas fa-star"></i>
                </button>
            </div>
        `;
        
        carImagesGrid.insertBefore(imageItem, carImagesGrid.lastElementChild);
        
        // Add event listeners
        const editBtn = imageItem.querySelector('.edit');
        const deleteBtn = imageItem.querySelector('.delete');
        const primaryBtn = imageItem.querySelector('.primary');
        
        editBtn.addEventListener('click', function() {
            // Open file dialog to replace image
            carImageUpload.dataset.replaceIndex = index;
            carImageUpload.click();
        });
        
        deleteBtn.addEventListener('click', function() {
            deleteCarImage(index);
        });
        
        primaryBtn.addEventListener('click', function() {
            setAsPrimaryCarImage(index);
        });
    }
    
    // Open image preview modal
    function openImagePreviewModal(image, type) {
        previewImage.src = image.url;
        imageName.value = image.name;
        imageCategory.value = image.category || 'other';
        
        currentImageId = image.id;
        currentImageType = type;
        
        imagePreviewModal.classList.add('active');
    }
    
    // Open delete confirmation modal
    function openDeleteConfirmModal(imageId, type) {
        currentImageToDelete = { id: imageId, type: type };
        deleteConfirmModal.classList.add('active');
    }
    
    // Close image preview modal
    function closeImagePreviewModal() {
        imagePreviewModal.classList.remove('active');
        currentImageId = null;
        currentImageType = null;
    }
    
    // Close delete confirmation modal
    function closeDeleteConfirmModal() {
        deleteConfirmModal.classList.remove('active');
        currentImageToDelete = null;
    }
    
    // Save image changes
    function saveImageChanges() {
        if (!currentImageId || !currentImageType) return;
        
        const newName = imageName.value.trim();
        const newCategory = imageCategory.value;
        
        if (newName === '') {
            alert('Por favor, insira um nome para a imagem.');
            return;
        }
        
        if (currentImageType === 'website') {
            const imageIndex = websiteImages.findIndex(img => img.id === currentImageId);
            if (imageIndex !== -1) {
                websiteImages[imageIndex].name = newName;
                websiteImages[imageIndex].category = newCategory;
                
                // Save to localStorage
                localStorage.setItem('websiteImages', JSON.stringify(websiteImages));
                
                // Reload images
                loadWebsiteImages();
            }
        } else if (currentImageType === 'banner') {
            const imageIndex = bannerImages.findIndex(img => img.id === currentImageId);
            if (imageIndex !== -1) {
                bannerImages[imageIndex].name = newName;
                
                // Save to localStorage
                localStorage.setItem('bannerImages', JSON.stringify(bannerImages));
                
                // Reload images
                loadBannerImages();
            }
        }
        
        closeImagePreviewModal();
    }
    
    // Delete image
    function deleteImage() {
        if (!currentImageToDelete) return;
        
        const { id, type } = currentImageToDelete;
        
        if (type === 'website') {
            websiteImages = websiteImages.filter(img => img.id !== id);
            
            // Save to localStorage
            localStorage.setItem('websiteImages', JSON.stringify(websiteImages));
            
            // Reload images
            loadWebsiteImages();
        } else if (type === 'banner') {
            bannerImages = bannerImages.filter(img => img.id !== id);
            
            // Save to localStorage
            localStorage.setItem('bannerImages', JSON.stringify(bannerImages));
            
            // Reload images
            loadBannerImages();
        }
        
        closeDeleteConfirmModal();
    }
    
    // Delete car image
    function deleteCarImage(index) {
        if (currentCarId === null) return;
        
        const car = cars.find(c => c.id === currentCarId);
        if (!car || !car.images) return;
        
        // Remove image from car
        car.images.splice(index, 1);
        
        // Update cars in localStorage
        const carIndex = cars.findIndex(c => c.id === currentCarId);
        if (carIndex !== -1) {
            cars[carIndex] = car;
            localStorage.setItem('cars', JSON.stringify(cars));
        }
        
        // Reload car images
        loadCarImages(currentCarId);
    }
    
    // Set as primary car image
    function setAsPrimaryCarImage(index) {
        if (currentCarId === null) return;
        
        const car = cars.find(c => c.id === currentCarId);
        if (!car || !car.images || index >= car.images.length) return;
        
        // Move image to the first position
        const image = car.images[index];
        car.images.splice(index, 1);
        car.images.unshift(image);
        
        // Update cars in localStorage
        const carIndex = cars.findIndex(c => c.id === currentCarId);
        if (carIndex !== -1) {
            cars[carIndex] = car;
            localStorage.setItem('cars', JSON.stringify(cars));
        }
        
        // Reload car images
        loadCarImages(currentCarId);
    }
    
    // Handle file upload
    function handleFileUpload(files, type) {
        if (!files || files.length === 0) return;
        
        // Show progress bar
        const uploadArea = type === 'website' ? websiteUploadArea : bannerUploadArea;
        const progressBar = uploadArea.querySelector('.progress-bar-fill');
        const progressText = uploadArea.querySelector('.progress-text');
        const uploadProgress = uploadArea.querySelector('.upload-progress');
        
        uploadProgress.style.display = 'block';
        
        // Process each file
        Array.from(files).forEach((file, index) => {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert(`O arquivo "${file.name}" não é uma imagem válida.`);
                return;
            }
            
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `Enviando... ${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Read file as data URL
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imageUrl = e.target.result;
                        
                        // Create image object
                        const image = {
                            id: Date.now() + index,
                            name: file.name,
                            url: imageUrl,
                            category: 'other',
                            size: file.size,
                            type: file.type,
                            date: new Date().toISOString()
                        };
                        
                        // Add image to appropriate array
                        if (type === 'website') {
                            websiteImages.push(image);
                            localStorage.setItem('websiteImages', JSON.stringify(websiteImages));
                            loadWebsiteImages();
                        } else if (type === 'banner') {
                            bannerImages.push(image);
                            localStorage.setItem('bannerImages', JSON.stringify(bannerImages));
                            loadBannerImages();
                        }
                        
                        // Reset progress
                        setTimeout(() => {
                            uploadProgress.style.display = 'none';
                            progressBar.style.width = '0%';
                            progressText.textContent = 'Enviando... 0%';
                        }, 500);
                    };
                    
                    reader.readAsDataURL(file);
                }
            }, 200);
        });
    }
    
    // Handle car image upload
    function handleCarImageUpload(files) {
        if (!files || files.length === 0 || currentCarId === null) return;
        
        const file = files[0]; // Only take the first file
        
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert(`O arquivo "${file.name}" não é uma imagem válida.`);
            return;
        }
        
        // Read file as data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            
            // Get car
            const car = cars.find(c => c.id === currentCarId);
            if (!car) return;
            
            // Initialize images array if it doesn't exist
            if (!car.images) {
                car.images = [];
            }
            
            // Check if we're replacing an existing image
            const replaceIndex = carImageUpload.dataset.replaceIndex;
            if (replaceIndex !== undefined) {
                car.images[replaceIndex] = imageUrl;
                delete carImageUpload.dataset.replaceIndex;
            } else {
                // Add new image
                car.images.push(imageUrl);
            }
            
            // Update cars in localStorage
            const carIndex = cars.findIndex(c => c.id === currentCarId);
            if (carIndex !== -1) {
                cars[carIndex] = car;
                localStorage.setItem('cars', JSON.stringify(cars));
            }
            
            // Reload car images
            loadCarImages(currentCarId);
        };
        
        reader.readAsDataURL(file);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Tab navigation
        adminTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                adminTabs.forEach(t => t.classList.remove('active'));
                adminTabContents.forEach(c => c.style.display = 'none');
                
                // Add active class to clicked tab and show content
                this.classList.add('active');
                document.getElementById(`${tabId}-content`).style.display = 'block';
                
                currentTab = tabId;
            });
        });
        
        // Image category filter
        imageCategories.forEach(category => {
            category.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-category');
                
                // Remove active class from all categories
                imageCategories.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked category
                this.classList.add('active');
                
                currentCategory = categoryId;
                loadWebsiteImages();
            });
        });
        
        // Website image upload
        websiteUploadArea.addEventListener('click', function() {
            websiteImageUpload.click();
        });
        
        websiteUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        websiteUploadArea.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        websiteUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            handleFileUpload(files, 'website');
        });
        
        websiteImageUpload.addEventListener('change', function() {
            handleFileUpload(this.files, 'website');
            this.value = ''; // Reset input
        });
        
        // Banner image upload
        bannerUploadArea.addEventListener('click', function() {
            bannerImageUpload.click();
        });
        
        bannerUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        bannerUploadArea.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        bannerUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            handleFileUpload(files, 'banner');
        });
        
        bannerImageUpload.addEventListener('change', function() {
            handleFileUpload(this.files, 'banner');
            this.value = ''; // Reset input
        });
        
        // Car select
        carSelect.addEventListener('change', function() {
            const carId = this.value;
            
            if (carId) {
                loadCarImages(carId);
            } else {
                carImageManager.style.display = 'none';
                currentCarId = null;
            }
        });
        
        // Add car image
        addCarImage.addEventListener('click', function() {
            carImageUpload.click();
        });
        
        carImageUpload.addEventListener('change', function() {
            handleCarImageUpload(this.files);
            this.value = ''; // Reset input
        });
        
        // Image preview modal
        previewModalClose.addEventListener('click', closeImagePreviewModal);
        previewModalCancel.addEventListener('click', closeImagePreviewModal);
        previewModalSave.addEventListener('click', saveImageChanges);
        
        // Delete confirmation modal
        deleteModalClose.addEventListener('click', closeDeleteConfirmModal);
        deleteModalCancel.addEventListener('click', closeDeleteConfirmModal);
        deleteModalConfirm.addEventListener('click', deleteImage);
    }
    
    // Public API
    return {
        init: init
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    AdminImagesModule.init();
});