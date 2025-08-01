const socket = io.connect('https://' + document.domain + ':' + location.port);
let socketid = undefined
socket.on('connect', function() {
    console.log("✅ Connecté avec SID :", socket.id);
    socketid = socket.id;
});

socket.on('response', function(data) {
    console.log("✅ Réponse reçue :", data);
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
                        <button class="button_secondary flex-1 flex items-center justify-center gap-2">
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
    link.download = 'mon_cv.pdf';
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
