const socket = io.connect('https://' + document.domain + ':' + location.port);
let socketid = undefined;

socket.on('connect', function() {
    console.log("✅ Connecté avec SID :", socket.id);
    socketid = socket.id;
});

document.addEventListener('DOMContentLoaded', function() {
    const markdownInput = document.getElementById('markdown-input');
    const filenameInput = document.getElementById('filename-input');
    const generateBtn = document.getElementById('generate-pdf-btn');
    const clearBtn = document.getElementById('clear-btn');
    const btnText = document.getElementById('btn-text');

    // Bouton générer PDF
    generateBtn.addEventListener('click', function() {
        const markdownContent = markdownInput.value.trim();
        
        if (!markdownContent) {
            showNotification('❌ Veuillez entrer du contenu Markdown', 'error');
            return;
        }

        // Mettre à jour l'interface
        generateBtn.disabled = true;
        btnText.innerHTML = `
            <div class="w-4 h-4 animate-spin rounded-full border-2 border-dashed border-white mr-2"></div>
            Génération...
        `;

        // Émettre l'événement pour générer le PDF
        socket.emit('convert-markdown-pdf', { 
            data: markdownContent, 
            filename: filenameInput.value.trim() || 'document',
            socketid: socketid 
        });
    });

    // Bouton effacer
    clearBtn.addEventListener('click', function() {
        markdownInput.value = '';
        filenameInput.value = '';
        markdownInput.focus();
        showNotification('✅ Contenu effacé');
    });

    // Raccourci clavier Ctrl+Enter pour générer
    markdownInput.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateBtn.click();
        }
    });
});

// Réception du PDF généré
socket.on('converter_pdf_ready', function(data) {
    console.log("✅ PDF de conversion reçu !");
    const pdfBase64 = data.pdf_base64;
    const filename = data.filename || 'document';

    // Convertir Base64 en Blob
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename + '.pdf';
    link.click();

    window.URL.revokeObjectURL(link.href);

    // Restaurer le bouton
    const generateBtn = document.getElementById('generate-pdf-btn');
    const btnText = document.getElementById('btn-text');
    generateBtn.disabled = false;
    btnText.innerHTML = 'Générer PDF';

    showNotification('✅ PDF généré et téléchargé !');
});

// Gestion d'erreur
socket.on('converter_error', function(data) {
    console.error("❌ Erreur lors de la conversion :", data.error);
    
    // Restaurer le bouton
    const generateBtn = document.getElementById('generate-pdf-btn');
    const btnText = document.getElementById('btn-text');
    generateBtn.disabled = false;
    btnText.innerHTML = 'Générer PDF';

    showNotification('❌ Erreur lors de la génération du PDF', 'error');
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
