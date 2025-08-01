// Fonction pour formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const timeString = date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    if (itemDate.getTime() === today.getTime()) {
        return { category: 'Aujourd\'hui', time: timeString };
    } else if (itemDate.getTime() === yesterday.getTime()) {
        return { category: 'Hier', time: timeString };
    } else {
        return { 
            category: date.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }), 
            time: timeString 
        };
    }
}

// Fonction pour créer l'HTML d'un élément d'historique
function createHistoryItemHTML(item) {
    return `
        <li class="history_item" data-id="${item.id}">
            <div class="flex items-center gap-4">
                <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-color)] text-[var(--text-primary)]">
                    <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"></path>
                    </svg>
                </div>
                <div class="flex-grow">
                    <p class="history_item_description font-medium">${item.title}</p>
                    <p class="history_item_date">${item.time}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="viewItem('${item.id}')" class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                        Voir
                    </button>
                    <button onclick="deleteItem('${item.id}')" class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                        Supprimer
                    </button>
                </div>
            </div>
        </li>
    `;
}

// Fonction pour charger et afficher l'historique
function loadHistory() {
    const historyData = localStorage.getItem('markdownHistory');
    const historyMain = document.getElementById('history-main');
    const noHistoryDiv = document.getElementById('no-history');
    
    if (!historyData) {
        noHistoryDiv.style.display = 'block';
        return;
    }
    
    try {
        const history = JSON.parse(historyData);
        
        if (history.length === 0) {
            noHistoryDiv.style.display = 'block';
            return;
        }
        
        // Grouper par catégorie de date
        const groupedHistory = {};
        
        history.forEach(item => {
            const dateInfo = formatDate(item.date);
            const category = dateInfo.category;
            
            if (!groupedHistory[category]) {
                groupedHistory[category] = [];
            }
            
            groupedHistory[category].push({
                ...item,
                time: dateInfo.time
            });
        });
        
        // Créer le HTML pour chaque catégorie
        let htmlContent = '';
        const categories = Object.keys(groupedHistory);
        
        // Trier les catégories (Aujourd'hui en premier, puis Hier, puis par date)
        categories.sort((a, b) => {
            if (a === 'Aujourd\'hui') return -1;
            if (b === 'Aujourd\'hui') return 1;
            if (a === 'Hier') return -1;
            if (b === 'Hier') return 1;
            return b.localeCompare(a); // Trier les autres dates en ordre décroissant
        });
        
        categories.forEach(category => {
            const items = groupedHistory[category];
            
            // Trier les éléments par heure (plus récent en premier)
            items.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            htmlContent += `
                <div class="mt-8">
                    <h2 class="text-lg font-bold text-[var(--text-primary)]">${category}</h2>
                    <ul class="mt-4 space-y-2">
                        ${items.map(item => createHistoryItemHTML(item)).join('')}
                    </ul>
                </div>
            `;
        });
        
        historyMain.innerHTML = htmlContent;
        
    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        noHistoryDiv.style.display = 'block';
    }
}

// Fonction pour voir un élément
function viewItem(id) {
    const historyData = localStorage.getItem('markdownHistory');
    if (!historyData) return;
    
    try {
        const history = JSON.parse(historyData);
        const item = history.find(h => h.id === id);
        
        if (item) {
            // Stocker l'élément sélectionné pour la page preview
            localStorage.setItem('selectedHistoryItem', JSON.stringify(item));
            // Rediriger vers la page preview
            window.location.href = '/preview';
        }
    } catch (error) {
        console.error('Erreur lors de la visualisation:', error);
    }
}

// Fonction pour supprimer un élément
function deleteItem(id) {
    const historyData = localStorage.getItem('markdownHistory');
    if (!historyData) return;
    
    try {
        const history = JSON.parse(historyData);
        const item = history.find(h => h.id === id);
        
        if (item) {
            showDeletePopup(id, item.title);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

function showDeletePopup(id, title) {
    // Créer la popup de suppression
    const popup = document.createElement('div');
    popup.id = 'delete-popup';
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    popup.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-6 w-96 max-w-90vw">
            <div class="flex items-center mb-4">
                <div class="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.732 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
            </div>
            <div class="text-center">
                <h3 class="text-lg font-bold text-gray-900 mb-2">Supprimer l'élément</h3>
                <p class="text-sm text-gray-500 mb-4">
                    Êtes-vous sûr de vouloir supprimer "<strong>${title}</strong>" ? Cette action est irréversible.
                </p>
            </div>
            <div class="flex gap-3 mt-6">
                <button id="cancel-delete-btn" class="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none">
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
        confirmDeleteItem(id);
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

function confirmDeleteItem(id) {
    const historyData = localStorage.getItem('markdownHistory');
    if (!historyData) return;
    
    try {
        const history = JSON.parse(historyData);
        const updatedHistory = history.filter(h => h.id !== id);
        
        localStorage.setItem('markdownHistory', JSON.stringify(updatedHistory));
        
        // Recharger l'affichage
        loadHistory();
        
        // Afficher une notification
        showNotification('✅ Élément supprimé avec succès!');
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('❌ Erreur lors de la suppression');
    }
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

// Charger l'historique au chargement de la page
document.addEventListener('DOMContentLoaded', loadHistory);
