const socket = io.connect('https://' + document.domain + ':' + location.port);
let socketid = undefined
socket.on('connect', function() {
    console.log("✅ Connecté avec SID :", socket.id);
    socketid = socket.id;
});
let titleForPDF = ""
let currentGeneratedData = null;

socket.on('response', function(data) {
    console.log("✅ Réponse reçue :", data);
    currentGeneratedData = data.data;
    
    document.getElementById('cv-generator').innerHTML = `
                <div class="container mx-auto p-4">
                <div class="bg-white rounded-lg shadow-sm">
                <pre class="p-4 text-base text-[var(--text-secondary)] whitespace-pre-wrap font-mono">
                ${data.data}
                            </pre>
                </div>
                </div>
                </div>

                <div class="container mx-auto">
                    <div class="flex gap-4">
                        <button id="copy-btn" class="button_secondary flex-1 flex items-center justify-center gap-2">
                            <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M216,32H88a8,8,0,0,0-8,8V88H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V168h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V104h40v64a8,8,0,0,0,8,8h64Zm48-48H104V48H208Z"></path>
                            </svg>
                            <span>Copier</span>
                        </button>
                        <button id="export-pdf" class="button_primary flex-1 flex items-center justify-center gap-2">
                            <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M224,128a8,8,0,0,1-8,8h-8v40a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H96V32a8,8,0,0,1,8-8h88a8,8,0,0,1,5.66,2.34l32,32A8,8,0,0,1,232,64v56h8A8,8,0,0,1,224,128ZM112,80H64V176h88V136h21.66L152,114.34V40h-8v40a8,8,0,0,0,8,8h40v32H120a8,8,0,0,1-8-8ZM216,85.66,194.34,64H168v40h40Z"></path>
                            </svg>
                            <span>Exporter En PDF</span>
                        </button>
                    </div>
                </div>
                `;
    document.getElementById('export-pdf').addEventListener('click', () => {
        socket.emit('export-pdf', { data: data.data, socketid: socketid });
    });
    document.getElementById('copy-btn').addEventListener('click', function() {
            navigator.clipboard.writeText(currentGeneratedData).then(function() {
                showNotification('✅ Copié dans le presse-papiers!');
            }).catch(function() {
                // Fallback pour les navigateurs plus anciens
                const textArea = document.createElement('textarea');
                textArea.value = currentGeneratedData;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('✅ Copié dans le presse-papiers!');
            });
        });
        

    // Afficher la pop-up pour sauvegarder
    showSavePopup(data.data);
});

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


document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const inputText = document.getElementById('input-text');
    generateButton.addEventListener('click', async () => {
        const text = inputText.value;
        if (text.trim() === '') {
            alert('Please enter some text to generate a CV.');
            return;
        }
        console.log('Generating CV with text:', text);
        socket.emit('generate_cv', { text: text, socketid: socketid });

        const cvGenerator = document.getElementById('cv-generator');
        cvGenerator.className = 'flex flex-grow flex-col items-center justify-center p-4 text-center';

        cvGenerator.innerHTML = `
            <div class="w-16 h-16 animate-spin rounded-full border-4 border-dashed border-[var(--primary-color)]"></div>
            <p class="typography_body mt-4 text-lg font-medium text-[var(--text-secondary)]">Génération en cours...</p>
        `;
    });
});

// Fonctions pour gérer l'historique
function generateId() {
    return 'cv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
}

function saveToHistory(title, markdown) {
    const id = generateId();
    const date = new Date();
    
    const historyItem = {
        id: id,
        title: title,
        markdown: markdown,
        date: date.toISOString(),
        formattedDate: formatDate(date)
    };
    titleForPDF = title || 'Mon_cv';

    // Récupérer l'historique existant
    let history = JSON.parse(localStorage.getItem('markdownHistory') || '[]');
    
    // Ajouter le nouvel élément au début
    history.unshift(historyItem);
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('markdownHistory', JSON.stringify(history));
    
    console.log('✅ Sauvegardé dans l\'historique:', historyItem);
}

function showSavePopup(markdownData) {
    // Créer la popup
    const popup = document.createElement('div');
    popup.id = 'save-popup';
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    popup.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-6 w-96 max-w-90vw">
            <h3 class="text-lg font-bold text-[var(--text-primary)] mb-4">Sauvegarder dans l'historique</h3>
            <input 
                type="text" 
                id="save-title" 
                class="input w-full mb-4" 
                placeholder="Entrez un titre pour cette génération..."
                maxlength="100"
            >
            <div class="flex gap-3">
                <button id="delete-btn" class="button_secondary flex-1">
                    <svg fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg" class="inline mr-2">
                        <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                    </svg>
                    Supprimer
                </button>
                <button id="save-btn" class="button_primary flex-1">
                    <svg fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg" class="inline mr-2">
                        <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM128,48l72,72H56ZM48,136H208v80H48Z"></path>
                    </svg>
                    Enregistrer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Focus sur l'input
    const titleInput = document.getElementById('save-title');
    titleInput.focus();
    
    // Gestion des événements
    document.getElementById('delete-btn').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    
    document.getElementById('save-btn').addEventListener('click', () => {
        const title = titleInput.value.trim();
        if (title) {
            saveToHistory(title, markdownData);
            document.body.removeChild(popup);
            
            // Afficher un message de confirmation
            showNotification('✅ Sauvegardé dans l\'historique!');
        } else {
            titleInput.focus();
            titleInput.style.borderColor = '#ef4444';
            setTimeout(() => {
                titleInput.style.borderColor = '';
            }, 2000);
        }
    });
    
    // Fermer avec Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(popup);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Sauvegarder avec Entrée
    titleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('save-btn').click();
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
