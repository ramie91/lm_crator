import base64
import re
from flask import Flask, jsonify, render_template, url_for, request, redirect, send_file, make_response
from flask_socketio import SocketIO, send, emit
from openai import OpenAI
import markdown
from weasyprint import HTML, CSS
import io
import os
TEMPLATE = """**Ramie NASSERALDIN**  
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

**Ramie NASSERALDIN**"""

PROMPT =f"""Tu es une IA spécialisée dans la rédaction de lettres de motivation professionnelles.

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
- **Template** : {TEMPLATE}
- **Informations à utiliser** : l’offre d’emploi fournie par l’utilisateur + informations personnelles de l’utilisateur (nom, poste, expériences, motivations).

⚠️ **Important :**
- Ne modifie pas la structure du template sauf pour adapter le contenu.
- Ne génère pas de texte hors de la lettre.

"""



app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'  # Remplace par une clé secrète plus sûre en prod

socketio = SocketIO(app)

def br_forcer(md_text):
    lines = md_text.split('\n')
    result_lines = []

    for i, line in enumerate(lines):
        stripped = line.lstrip()

        # Si la ligne est un titre, liste, blockquote, code, séparateur => on ne touche pas la fin
        if (re.match(r'^(#{1,6} )', stripped) or  # titres # ...
            re.match(r'^([-*+]|[0-9]+\.) ', stripped) or  # listes
            re.match(r'^(> )', stripped) or  # blockquote
            re.match(r'^```', stripped) or  # début code block
            re.match(r'^---$', stripped) or  # séparateur
            stripped == ''):
            # Ligne markdown de bloc ou vide => on ne met pas <br>
            result_lines.append(line)
        else:
            # Sinon on force un <br> en fin de ligne (sauf si déjà fin de texte)
            if i < len(lines) -1 and lines[i+1].strip() != '':
                # ajouter <br> pour le saut simple
                result_lines.append(line + '<br>')
            else:
                result_lines.append(line)

    return '\n'.join(result_lines)

@app.route('/')
def index():
    return render_template('index.html') 


@app.route('/history')
def history():
    return render_template("history.html")

@app.route('/settings')
def settings():
    return render_template("settings.html")

@app.route('/preview')
def preview():
    return render_template("preview.html")

@app.route('/converter')
def converter():
    return render_template("converter.html")


@socketio.on('generate_cv')
def handle_generate_cv(data):
    print(f'Received generate_cv with data: {data}')

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    completion = client.chat.completions.create(
        model="gpt-4.1-mini",  # ou "gpt-4.1-mini" si disponible
        messages=[
            {
                "role": "system",
                "content": data.get('prompt', PROMPT)
            },
            {
                "role": "user",
                "content": data['text']
            }
        ]
    )

    print(f'Completion: {completion.choices[0].message.content}')
    emit('response', {'data': completion.choices[0].message.content}, to=request.sid)

@socketio.on('export-pdf')
def export_pdf(data):
    md_text = data['data']  # Ton Markdown depuis le client
    md_text = br_forcer(md_text)

    # 1️⃣ Markdown → HTML
    html_body = markdown.markdown(md_text, extensions=['fenced_code', 'tables'])

    # 2️⃣ HTML avec CSS GitHub + font-size custom
    html_content = f"""
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-light.min.css">
        <style>
          body {{
            box-sizing: border-box;
            min-width: 200px;
            max-width: 800px;
            margin: auto;
            padding: 40px;
          }}
          .markdown-body {{
            font-size: 9pt; /* 👈 Forcer la taille de police */
          }}
        </style>
      </head>
      <body class="markdown-body">
        {html_body}
      </body>
    </html>
    """

    pdf_io = io.BytesIO()
    HTML(string=html_content).write_pdf(pdf_io)
    pdf_io.seek(0)

    pdf_base64 = base64.b64encode(pdf_io.read()).decode('utf-8')

    emit('pdf_ready', {'pdf_base64': pdf_base64})

@socketio.on('convert-markdown-pdf')
def convert_markdown_pdf(data):
    try:
        md_text = data['data']  # Contenu Markdown depuis le client
        filename = data.get('filename', 'document')  # Nom du fichier
        md_text = br_forcer(md_text)

        # 1️⃣ Markdown → HTML
        html_body = markdown.markdown(md_text, extensions=['fenced_code', 'tables'])

        # 2️⃣ HTML avec CSS GitHub + font-size custom
        html_content = f"""
        <html>
        <head>
            <meta charset="utf-8">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-light.min.css">
            <style>
            body {{
                box-sizing: border-box;
                min-width: 200px;
                max-width: 800px;
                margin: auto;
                padding: 40px;
            }}
            .markdown-body {{
                font-size: 9pt; /* 👈 Forcer la taille de police */
            }}
            </style>
        </head>
        <body class="markdown-body">
            {html_body}
        </body>
        </html>
        """

        # 3️⃣ Génération du PDF
        pdf_io = io.BytesIO()
        HTML(string=html_content).write_pdf(pdf_io)
        pdf_io.seek(0)

        pdf_base64 = base64.b64encode(pdf_io.read()).decode('utf-8')

        # 4️⃣ Envoyer le PDF au client
        emit('converter_pdf_ready', {
            'pdf_base64': pdf_base64,
            'filename': filename
        })

    except Exception as e:
        print(f"Erreur lors de la conversion PDF: {e}")
        emit('converter_error', {'error': str(e)})



if __name__ == '__main__':
    socketio.run(app, debug=True)
