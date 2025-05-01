/**
 * Contact Module - Gerenciamento de contato
 */
const ContactModule = (function () {
    // Cache DOM elements
    const contactForm = document.getElementById('contact-form');
    const contactModal = document.getElementById('contact-modal');
    const contactButtons = document.querySelectorAll('.contact-button');
    const contactClose = document.getElementById('contact-close');
    const contactCancel = document.getElementById('contact-cancel');
    const contactSubmit = document.getElementById('contact-submit');
    const contactSuccess = document.getElementById('contact-success');
    
    // Initialize
    function init() {
      setupEventListeners();
    }
    
    // Setup event listeners
    function setupEventListeners() {
      // Contact buttons
      contactButtons.forEach(button => {
        button.addEventListener('click', openContactModal);
      });
      
      // Close modal
      if (contactClose) {
        contactClose.addEventListener('click', closeContactModal);
      }
      
      // Cancel button
      if (contactCancel) {
        contactCancel.addEventListener('click', closeContactModal);
      }
      
      // Form submission
      if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
      }
    }
    
    // Open contact modal
    function openContactModal() {
      if (contactModal) {
        contactModal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Reset form
        if (contactForm) {
          contactForm.reset();
        }
        
        // Hide success message
        if (contactSuccess) {
          contactSuccess.style.display = 'none';
        }
        
        // Show form
        if (contactForm) {
          contactForm.style.display = 'block';
        }
      }
    }
    
    // Close contact modal
    function closeContactModal() {
      if (contactModal) {
        contactModal.style.display = 'none';
        document.body.classList.remove('modal-open');
      }
    }
    
    // Handle contact form submission
    function handleContactSubmit(event) {
      event.preventDefault();
      
      // Get form data
      const formData = new FormData(contactForm);
      const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };
      
      // Validate form data
      if (!validateContactForm(contactData)) {
        return;
      }
      
      // Simulate form submission
      contactSubmit.disabled = true;
      contactSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      
      setTimeout(() => {
        // Save contact message to localStorage
        saveContactMessage(contactData);
        
        // Show success message
        contactForm.style.display = 'none';
        contactSuccess.style.display = 'block';
        
        // Reset form
        contactForm.reset();
        contactSubmit.disabled = false;
        contactSubmit.innerHTML = 'Enviar Mensagem';
        
        // Close modal after 3 seconds
        setTimeout(closeContactModal, 3000);
      }, 1500);
    }
    
    // Validate contact form
    function validateContactForm(data) {
      // Reset previous errors
      const errorElements = contactForm.querySelectorAll('.error-message');
      errorElements.forEach(el => el.remove());
      
      let isValid = true;
      
      // Validate name
      if (!data.name || data.name.trim() === '') {
        showError('name', 'Por favor, informe seu nome');
        isValid = false;
      }
      
      // Validate email
      if (!data.email || !isValidEmail(data.email)) {
        showError('email', 'Por favor, informe um email válido');
        isValid = false;
      }
      
      // Validate phone
      if (!data.phone || !isValidPhone(data.phone)) {
        showError('phone', 'Por favor, informe um telefone válido');
        isValid = false;
      }
      
      // Validate subject
      if (!data.subject || data.subject.trim() === '') {
        showError('subject', 'Por favor, informe o assunto');
        isValid = false;
      }
      
      // Validate message
      if (!data.message || data.message.trim() === '') {
        showError('message', 'Por favor, escreva sua mensagem');
        isValid = false;
      }
      
      return isValid;
    }
    
    // Show error message
    function showError(fieldName, message) {
      const field = contactForm.querySelector(`[name="${fieldName}"]`);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      
      field.parentNode.appendChild(errorDiv);
      field.classList.add('error');
    }
    
    // Validate email
    function isValidEmail(email) {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }
    
    // Validate phone
    function isValidPhone(phone) {
      const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      return re.test(String(phone));
    }
    
    // Save contact message to localStorage
    function saveContactMessage(contactData) {
      const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
      
      // Add timestamp
      contactData.timestamp = new Date().toISOString();
      contactData.status = 'new';
      
      messages.push(contactData);
      localStorage.setItem('contactMessages', JSON.stringify(messages));
    }
    
    // Initialize module
    init();
    
    // Return public methods
    return {
      openContactModal: openContactModal,
      closeContactModal: closeContactModal
    };
  })();