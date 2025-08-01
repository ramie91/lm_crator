// Script global pour gérer le dark mode sur toutes les pages
(function() {
    // Appliquer le thème immédiatement pour éviter le flash
    function applyTheme() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
    
    // Appliquer le thème dès le chargement du script
    applyTheme();
    
    // Réappliquer quand le DOM est chargé (pour être sûr)
    document.addEventListener('DOMContentLoaded', applyTheme);
    
    // Écouter les changements dans le localStorage (pour synchroniser entre onglets)
    window.addEventListener('storage', function(e) {
        if (e.key === 'darkMode') {
            applyTheme();
        }
    });
    
    // Fonction globale pour basculer le thème (utilisée dans settings.js)
    window.toggleTheme = function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const isDark = currentTheme === 'dark';
                
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('darkMode', 'false');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('darkMode', 'true');
        }
    };
})();