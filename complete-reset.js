// Complete reset script - removes all car data and reinitializes
(function() {
  console.log("COMPLETE RESET: Removing all car data from localStorage...");
  
  // Remove car database completely
  localStorage.removeItem('carDatabase');
  localStorage.removeItem('userFavorites');
  
  console.log("COMPLETE RESET: Car data completely removed.");
  console.log("COMPLETE RESET: Please refresh the page to reinitialize the database.");
})();