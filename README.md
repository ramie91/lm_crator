# 📝 LM Generator - Générateur de Lettres de Motivation

Une application web moderne pour générer des lettres de motivation personnalisées avec l'intelligence artificielle.

## ✨ Fonctionnalités

### 🤖 Génération IA
- **Génération intelligente** : Utilise OpenAI (via OpenRouter) pour créer des lettres de motivation personnalisées
- **Templates personnalisables** : Modifiez le template de base selon vos besoins
- **Prompts configurables** : Ajustez les instructions données à l'IA

### 📚 Gestion d'historique
- **Sauvegarde locale** : Stockage des lettres générées dans le navigateur (localStorage)
- **Titres personnalisés** : Ajoutez des titres descriptifs à vos générations
- **Organisation par date** : Historique groupé par "Aujourd'hui", "Hier", et dates antérieures
- **Prévisualisation** : Visualisez et éditez vos lettres sauvegardées

### 🎨 Interface moderne
- **Design responsive** : Interface adaptée mobile et desktop
- **Mode sombre/clair** : Basculez entre les thèmes avec un toggle
- **Navigation intuitive** : Barre de navigation fixe avec icônes
- **Animations fluides** : Transitions et feedback visuels

### 📄 Export PDF
- **Génération PDF** : Exportez vos lettres au format PDF
- **Styling professionnel** : Mise en forme GitHub Markdown
- **Nommage intelligent** : Fichiers nommés automatiquement

## 🛠️ Technologies utilisées

### Backend
- **Flask** : Framework web Python
- **Flask-SocketIO** : Communication temps réel
- **OpenAI API** : Génération de contenu IA (via OpenRouter)
- **WeasyPrint** : Génération de PDF
- **Markdown** : Traitement du contenu

### Frontend
- **HTML5/CSS3** : Structure et styling
- **JavaScript ES6+** : Logique côté client
- **Socket.IO** : Communication bidirectionnelle
- **Tailwind CSS** : Framework CSS utilitaire
- **CSS Variables** : Système de thèmes dynamiques

## 📦 Installation

### Prérequis
- Python 3.8+
- Clé API OpenRouter

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd lm
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Configuration des variables d'environnement**
```bash
# Créer un fichier .env
echo "OPENROUTER_API_KEY=votre_clé_api_ici" > .env
```

4. **Lancer l'application**
```bash
python app.py
```

5. **Accéder à l'application**
Ouvrez votre navigateur à `http://localhost:5000`

## 🏗️ Structure du projet

```
lm/
├── app.py                  # Serveur Flask principal
├── requirements.txt        # Dépendances Python
├── README.md              # Documentation
├── passenger_wsgi.py      # Configuration WSGI
├── static/
│   ├── css/              # Styles CSS
│   ├── js/               # Scripts JavaScript
│   │   ├── index.js      # Page principale
│   │   ├── history.js    # Gestion historique
│   │   ├── preview.js    # Prévisualisation
│   │   ├── settings.js   # Paramètres
│   │   └── base.js       # Scripts globaux
│   └── img/              # Images et assets
└── templates/
    ├── base.html         # Template de base
    ├── index.html        # Page principale
    ├── history.html      # Page historique
    ├── preview.html      # Page prévisualisation
    ├── settings.html     # Page paramètres
    └── navbar.html       # Navigation
```

## 🎯 Utilisation

### 1. Génération d'une lettre
1. Saisissez votre demande dans la zone de texte
2. Cliquez sur "Générer"
3. Attendez la génération par l'IA
4. Visualisez le résultat

### 2. Sauvegarde
1. Après génération, une popup s'affiche automatiquement
2. Entrez un titre descriptif
3. Cliquez sur "Enregistrer"

### 3. Consultation de l'historique
1. Cliquez sur l'onglet "Historique"
2. Parcourez vos lettres organisées par date
3. Cliquez sur "Voir" pour prévisualiser

### 4. Personnalisation
1. Accédez aux "Paramètres" via l'icône ⚙️
2. Modifiez le prompt ou le template
3. Activez/désactivez le mode sombre

### 5. Export PDF
1. Depuis la prévisualisation ou après génération
2. Cliquez sur "Exporter en PDF"
3. Le fichier se télécharge automatiquement

## ⚙️ Configuration

### Variables d'environnement
- `OPENROUTER_API_KEY` : Clé API pour OpenRouter (obligatoire)

### Personnalisation
- **Template** : Modifiez le template de lettre via l'interface
- **Prompt** : Ajustez les instructions données à l'IA
- **Thème** : Basculez entre mode clair et sombre

## 🌟 Fonctionnalités avancées

### Système de thèmes
- Variables CSS dynamiques
- Support complet dark/light mode
- Persistence des préférences

### Storage local
- Historique stocké localement (pas de serveur requis)
- Structure JSON organisée
- Gestion des IDs uniques

### Interface responsive
- Design mobile-first
- Navigation adaptive
- Boutons optimisés pour le touch

## 🚀 Déploiement

### Production
- Configurez un serveur WSGI (Gunicorn, uWSGI)
- Utilisez un reverse proxy (Nginx)
- Configurez HTTPS pour la sécurité

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changes (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation
- Vérifiez les logs d'erreur dans la console

## 🔄 Changelog

### v1.0.0
- ✅ Génération de lettres de motivation avec IA
- ✅ Système d'historique complet
- ✅ Interface responsive avec dark mode
- ✅ Export PDF professionnel
- ✅ Personnalisation des templates et prompts

---

**Développé avec ❤️ pour simplifier la création de lettres de motivation professionnelles.**