// Admin Access Helper
document.addEventListener('DOMContentLoaded', function() {
    // Add admin access button to footer for easy access during development
    const footerBottom = document.querySelector('.footer-bottom');
    
    if (footerBottom) {
        const adminAccessDiv = document.createElement('div');
        adminAccessDiv.style.marginTop = '20px';
        adminAccessDiv.style.textAlign = 'center';
        adminAccessDiv.innerHTML = `
            <p style="font-size: 12px; color: #999;">
                Acesso rápido para desenvolvimento: 
                <a href="admin.html" style="color: #999; text-decoration: underline;">Painel Admin</a>
                (Login: admin@cardealz.com / Senha: admin123)
            </p>
        `;
        
        footerBottom.appendChild(adminAccessDiv);
    }
});