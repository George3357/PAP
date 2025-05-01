// Function to update car images
function updateCarImages(carId, newImages) {
    // Get all cars
    const cars = JSON.parse(localStorage.getItem('carDatabase')) || [];
    
    // Find the car by ID
    const carIndex = cars.findIndex(car => car.id === carId);
    
    if (carIndex !== -1) {
        // Update the images
        cars[carIndex].images = newImages;
        
        // Save back to localStorage
        localStorage.setItem('carDatabase', JSON.stringify(cars));
        
        return true;
    }
    
    return false;
}

// Example usage:
// updateCarImages(1, [
//     'https://example.com/ferrari-812-1.jpg',
//     'https://example.com/ferrari-812-2.jpg',
//     'https://example.com/ferrari-812-3.jpg'
// ]);