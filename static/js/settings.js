function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
            
    // Synchroniser l'état du toggle avec le localStorage
    darkModeToggle.checked = isDarkMode;

    // Écouter les changements du toggle
    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('darkMode', 'false');
        }
    });
}

document.addEventListener('DOMContentLoaded', initDarkMode);