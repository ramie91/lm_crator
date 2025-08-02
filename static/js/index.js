const socket = io.connect('https://' + document.domain + ':' + location.port);
let socketid = undefined
socket.on('connect', function() {
    console.log("✅ Connecté avec SID :", socket.id);
    socketid = socket.id;
});
let titleForPDF = ""
let currentGeneratedData = null;

let TEMPLATE = `
**Ramie NASSERALDIN**  
32 rue du Château d'Eau, 91130 Ris-Orangis  
📞 06 77 03 26 43  
✉️ nasseraldin.ramie@gmail.com  

---

<div style="text-align: right;">


**Konibo**  
15 Av. Descartes
Morangis, 91420  
administratif@konibo.fr  

</div>

### Objet : Candidature pour un contrat d'apprentissage – Développement Informatique, IA, Automatisation & Intégration Web

---

À Ris-Orangis, le 31 juillet 2025

Madame, Monsieur,

Actuellement en fin de cursus de BUT Informatique et sur le point d'intégrer l'ENSIIE en cycle ingénieur, je suis à la recherche d’un contrat d’apprentissage de 3 ans. Cette opportunité m’a particulièrement attiré, en raison de son orientation technique concrète autour de l’IA, de l’automatisation des processus informatiques, et de l’intégration web avec le CRM Odoo.

Durant mon parcours, j’ai eu l’occasion de travailler sur plusieurs projets qui font directement écho aux missions proposées :  
- **Chez Renault Group**, j’ai développé un **RAG** avec une interface utilisateur complète avec **Flask**, en lien avec un système de récupération de données vectorielles ;  
- **Chez Avince Consulting**, j’ai automatisé la collecte et le traitement de données web via **Python** et **Selenium**, réduisant considérablement les interventions manuelles ;  

Passionné par les technologies IA et le développement backend comme frontend, je suis également à l’aise avec les enjeux liés à la productivité informatique en entreprise. L’idée de concevoir un agent IA interne pour améliorer l’efficacité des techniciens hotline est un challenge que je trouve particulièrement motivant.

Curieux, autonome, rigoureux, je suis toujours en quête d’amélioration continue et j’aime faire le lien entre technique et besoins métiers.

Je serais ravi de pouvoir rejoindre votre équipe et participer activement à la transformation digitale portée par Konibo.

Restant à votre disposition pour un entretien, je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.

---

**Ramie NASSERALDIN**
`

let instruction = `
Tu es une IA spécialisée dans la rédaction de lettres de motivation professionnelles.

🎯 **Objectif :**
- Génère une lettre de motivation adaptée à l’offre et au profil de l’utilisateur.
- La lettre doit être personnalisée et pertinente.
- Utilise le template fourni comme structure et ton de référence.

📜 **Instructions :**
- Respecte scrupuleusement la structure et le style du template.
- Réutilise les sections du template et remplace le contenu par du texte cohérent en fonction de l’offre et du profil.
- Si une section du template ne s’applique pas, adapte-la intelligemment.
- Fournis le résultat en **Markdown** identique au template : titres, gras, paragraphes.
- Ne fournis que la lettre finale, sans explication ni commentaire.

✅ **Données fournies :**
- **Template** : ${TEMPLATE}
- **Informations à utiliser** : l’offre d’emploi fournie par l’utilisateur + informations personnelles de l’utilisateur (nom, poste, expériences, motivations).

⚠️ **Important :**
- Ne modifie pas la structure du template sauf pour adapter le contenu.
- Ne génère pas de texte hors de la lettre.
`

if(localStorage.getItem("prompt") === null){
    localStorage.setItem("prompt",instruction)
}

if(localStorage.getItem("template") === null){
    localStorage.setItem("template",TEMPLATE)
}

socket.on('response', function(data) {
    console.log("✅ Réponse reçue :", data);
    currentGeneratedData = data.data;
    
    document.getElementById('cv-generator').innerHTML = `
                <div class="container mx-auto p-4">
                <div class="bg-[var(--background-color)] border border-[var(--accent-color)] rounded-lg shadow-sm">
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
        socket.emit('generate_cv', { text: text, prompt: localStorage.getItem("prompt"), socketid: socketid });

        const cvGenerator = document.getElementById('cv-generator');
        cvGenerator.className = 'flex flex-grow flex-col items-center justify-center p-4 text-center';

        cvGenerator.innerHTML = `
            <div class="w-16 h-16 animate-spin rounded-full border-4 border-dashed border-[var(--primary-color)]"></div>
            <p class="typography_body mt-4 text-lg font-medium text-[var(--text-secondary)]">Génération en cours...</p>
        `;
    });
    document.getElementById('parameters-button').addEventListener('click', () => {
        showParametersPopup();
    });
});

function showParametersPopup() {
    const popup = document.createElement('div');
    popup.id = 'parameters-popup';
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    popup.innerHTML = `
        <div class="bg-[var(--background-color)] rounded-lg shadow-xl p-6 w-96 max-w-90vw">
            <div class="flex items-center mb-4">
                <div class="flex-shrink-0 w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear text-blue-600" viewBox="0 0 16 16">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                    </svg>
                </div>
            </div>
            <div class="text-center">
                <h3 class="text-lg font-bold text-[var(--text-primary)] mb-2">Paramètres</h3>
                <p class="text-sm text-[var(--text-secondary)] mb-4">
                    Modifiez le prompt et le template pour personnaliser la génération.
                </p>
            </div>
            <div class="flex gap-3 mt-6">
                <button id="prompt-edit-btn" class="flex-1 bg-[var(--accent-color)] text-[var(--text-primary)] font-bold py-2 px-4 rounded-md hover:opacity-90 focus:outline-none">
                    Prompt
                </button>
                <button id="template-edit-btn" class="button_primary flex-1">
                    Template
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Gestion des événements
    document.getElementById('prompt-edit-btn').addEventListener('click', () => {
        document.body.removeChild(popup);
        showPromptEditor();
    });
    
    document.getElementById('template-edit-btn').addEventListener('click', () => {
        document.body.removeChild(popup);
        showTemplateEditor();
    });
    
    // Fermer en cliquant à l'extérieur
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}

function showPromptEditor() {
    const popup = document.createElement('div');
    popup.id = 'prompt-editor-popup';
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    popup.innerHTML = `
        <div class="bg-[var(--background-color)] rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col w-full">
            <div class="flex items-center justify-between p-4 border-b border-[var(--accent-color)]">
                <h3 class="text-lg font-bold text-[var(--text-primary)]">Éditeur de Prompt</h3>
                <button id="close-prompt-editor" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                    </svg>
                </button>
            </div>
            <div class="flex-1 overflow-auto p-4">
                <textarea id="prompt-textarea" class="w-full h-96 p-3 border border-[var(--accent-color)] bg-[var(--background-color)] text-[var(--text-primary)] rounded-md font-mono text-sm resize-none focus:outline-none focus:border-[var(--primary-color)]">${localStorage.getItem('prompt') || ''}</textarea>
            </div>
            <div class="flex gap-3 p-4 border-t border-[var(--accent-color)]">
                <button id="reset-prompt-btn" class="bg-[var(--accent-color)] text-[var(--text-primary)] font-bold py-2 px-4 rounded-md hover:opacity-90 focus:outline-none">
                    Réinitialiser
                </button>
                <button id="save-prompt-btn" class="button_primary flex-1">
                    Sauvegarder
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Focus sur le textarea
    document.getElementById('prompt-textarea').focus();
    
    // Gestion des événements
    document.getElementById('close-prompt-editor').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    
    document.getElementById('reset-prompt-btn').addEventListener('click', () => {
        document.getElementById('prompt-textarea').value = instruction;
    });
    
    document.getElementById('save-prompt-btn').addEventListener('click', () => {
        const newPrompt = document.getElementById('prompt-textarea').value;
        localStorage.setItem('prompt', newPrompt);
        document.body.removeChild(popup);
        showNotification('✅ Prompt sauvegardé!');
    });
    
    // Fermer avec Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(popup);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function showTemplateEditor() {
    const popup = document.createElement('div');
    popup.id = 'template-editor-popup';
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    popup.innerHTML = `
        <div class="bg-[var(--background-color)] rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col w-full">
            <div class="flex items-center justify-between p-4 border-b border-[var(--accent-color)]">
                <h3 class="text-lg font-bold text-[var(--text-primary)]">Éditeur de Template</h3>
                <button id="close-template-editor" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                    </svg>
                </button>
            </div>
            <div class="flex-1 overflow-auto p-4">
                <textarea id="template-textarea" class="w-full h-96 p-3 border border-[var(--accent-color)] bg-[var(--background-color)] text-[var(--text-primary)] rounded-md font-mono text-sm resize-none focus:outline-none focus:border-[var(--primary-color)]">${localStorage.getItem('template') || ''}</textarea>
            </div>
            <div class="flex gap-3 p-4 border-t border-[var(--accent-color)]">
                <button id="reset-template-btn" class="bg-[var(--accent-color)] text-[var(--text-primary)] font-bold py-2 px-4 rounded-md hover:opacity-90 focus:outline-none">
                    Réinitialiser
                </button>
                <button id="save-template-btn" class="button_primary flex-1">
                    Sauvegarder
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Focus sur le textarea
    document.getElementById('template-textarea').focus();
    
    // Gestion des événements
    document.getElementById('close-template-editor').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    
    document.getElementById('reset-template-btn').addEventListener('click', () => {
        document.getElementById('template-textarea').value = TEMPLATE;
    });
    
    document.getElementById('save-template-btn').addEventListener('click', () => {
        const newTemplate = document.getElementById('template-textarea').value;
        localStorage.setItem('template', newTemplate);
        document.body.removeChild(popup);
        showNotification('✅ Template sauvegardé!');
    });
    
    // Fermer avec Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(popup);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

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
        <div class="bg-[var(--background-color)] rounded-lg shadow-xl p-6 w-96 max-w-90vw">
            <h3 class="text-lg font-bold text-[var(--text-primary)] mb-4">Sauvegarder dans l'historique</h3>
            <input 
                type="text" 
                id="save-title" 
                class="w-full mb-4 p-3 border border-[var(--accent-color)] bg-[var(--background-color)] text-[var(--text-primary)] rounded-md focus:outline-none focus:border-[var(--primary-color)]" 
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
