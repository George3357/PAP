document.addEventListener('DOMContentLoaded', function() {
  // Check if theme preference is stored
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
  }
  
  // Create dark mode toggle button if it doesn't exist
  if (!document.querySelector('.dark-mode-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'dark-mode-toggle';
      toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
      toggleBtn.setAttribute('title', 'Alternar tema');
      document.body.appendChild(toggleBtn);
      
      // Add event listener to toggle button
      toggleBtn.addEventListener('click', function() {
          document.body.classList.toggle('dark-theme');
          
          // Save preference to localStorage
          if (document.body.classList.contains('dark-theme')) {
              localStorage.setItem('theme', 'dark');
              this.innerHTML = '<i class="fas fa-sun"></i>';
          } else {
              localStorage.setItem('theme', 'light');
              this.innerHTML = '<i class="fas fa-moon"></i>';
          }
      });
      
      // Set initial icon based on current theme
      if (document.body.classList.contains('dark-theme')) {
          toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
      }
  }
});