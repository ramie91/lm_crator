const socket = io.connect('https://' + document.domain + ':' + location.port);
let socketid = undefined
socket.on('connect', function() {
    console.log("✅ Connecté avec SID :", socket.id);
    socketid = socket.id;
});
let titleForPDF = ""

document.addEventListener('DOMContentLoaded', function() {
    const selectedItemData = localStorage.getItem('selectedHistoryItem');
    const previewContent = document.getElementById('preview-content');
    const noContent = document.getElementById('no-content');
    const previewTitle = document.getElementById('preview-title');
    const markdownDisplay = document.getElementById('markdown-display');
    
    if (!selectedItemData) {
        previewContent.style.display = 'none';
        noContent.style.display = 'block';
        return;
    }
    
    try {
        const item = JSON.parse(selectedItemData);
        

        // Mettre à jour le titre
        previewTitle.textContent = item.title;

        titleForPDF = item.title || 'Mon_cv';
        // Afficher le contenu markdown
        markdownDisplay.textContent = item.markdown;
        
        // Bouton copier
        document.getElementById('copy-btn').addEventListener('click', function() {
            navigator.clipboard.writeText(item.markdown).then(function() {
                showNotification('✅ Copié dans le presse-papiers!');
            }).catch(function() {
                // Fallback pour les navigateurs plus anciens
                const textArea = document.createElement('textarea');
                textArea.value = item.markdown;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('✅ Copié dans le presse-papiers!');
            });
        });
        
        // Bouton supprimer
        document.getElementById('delete-btn').addEventListener('click', function() {
            showDeletePopup(item.id, item.title);
        });
        
        // Bouton export PDF
        document.getElementById('export-pdf-btn').addEventListener('click', function() {
            socket.emit('export-pdf', { data: item.markdown, socketid: socketid });
        });
        
    } catch (error) {
        console.error('Erreur lors du chargement de l\'aperçu:', error);
        previewContent.style.display = 'none';
        noContent.style.display = 'block';
    }
});

function deleteItem(id) {
    const historyData = localStorage.getItem('markdownHistory');
    if (!historyData) return;
    
    try {
        const history = JSON.parse(historyData);
        const updatedHistory = history.filter(h => h.id !== id);
        
        localStorage.setItem('markdownHistory', JSON.stringify(updatedHistory));
        
        // Nettoyer le localStorage de l'élément sélectionné
        localStorage.removeItem('selectedHistoryItem');
        
        // Rediriger vers l'historique
        showNotification('✅ Élément supprimé!');
        setTimeout(() => {
            window.location.href = '/history';
        }, 1000);
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

socket.on('pdf_ready', function(data) {
    console.log("✅ PDF reçu !");
    const pdfBase64 = data.pdf_base64;

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
    link.download = titleForPDF + '_Nasseraldin_Ramie.pdf';
    link.click();

    window.URL.revokeObjectURL(link.href);
});

function showDeletePopup(id, title) {
    // Créer la popup de suppression
    const popup = document.createElement('div');
    popup.id = 'delete-popup';
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    popup.innerHTML = `
        <div class="bg-[var(--background-color)] rounded-lg shadow-xl p-6 w-96 max-w-90vw">
            <div class="flex items-center mb-4">
                <div class="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.732 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
            </div>
            <div class="text-center">
                <h3 class="text-lg font-bold text-[var(--text-primary)] mb-2">Supprimer l'élément</h3>
                <p class="text-sm text-[var(--text-secondary)] mb-4">
                    Êtes-vous sûr de vouloir supprimer "<strong>${title}</strong>" ? Cette action est irréversible.
                </p>
            </div>
            <div class="flex gap-3 mt-6">
                <button id="cancel-delete-btn" class="flex-1 button_secondary">
                    Annuler
                </button>
                <button id="confirm-delete-btn" class="flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none">
                    Supprimer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Gestion des événements
    document.getElementById('cancel-delete-btn').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    
    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
        document.body.removeChild(popup);
        deleteItem(id);
    });
    
    // Fermer avec Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(popup);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Fermer en cliquant à l'extérieur
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
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