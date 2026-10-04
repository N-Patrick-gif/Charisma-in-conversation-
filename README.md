# PRÉSENCE — Charisme & Conversation

Version 1.0 — application web progressive (PWA), gratuite et sans compte.

## Ce que l'application fait
- entraînement quotidien court ;
- exercices de respiration, débit et articulation ;
- small talk et conversation ;
- mises en situation : professionnel, social, rencontre, prise de parole, affirmation ;
- réponse au micro via Web Speech API lorsque le navigateur le permet ;
- synthèse vocale française ;
- analyse locale heuristique de la réponse (longueur, questions, remplissages, concision) ;
- suivi de progression dans `localStorage` ;
- fonctionnement hors ligne après première visite sur une version HTTPS/PWA.

## Important
L'application ne promet pas de rendre quelqu'un irrésistible ni d'attirer toutes les femmes. Elle travaille des compétences réellement entraînables : clarté, écoute, présence, affirmation, conversation et aisance.

Le module « influence » est volontairement orienté vers la persuasion éthique : pas de manipulation, de pression, de mensonge ou de contournement du consentement.

## Installation
### Option A — test local
Ouvrir `index.html` dans un navigateur. Toutes les fonctions hors PWA sont utilisables, mais la reconnaissance vocale peut être limitée.

### Option B — vraie installation PWA gratuite
1. Créer un dépôt public sur GitHub.
2. Envoyer tout le contenu de ce dossier à la racine du dépôt.
3. Dans Settings → Pages, choisir la branche de publication.
4. Ouvrir l'adresse HTTPS fournie par GitHub Pages.
5. Sur téléphone : menu du navigateur → Installer / Ajouter à l'écran d'accueil.

GitHub Pages est disponible avec GitHub Free pour les dépôts publics et fournit HTTPS.

## Vie privée
Aucun serveur ni clé API n'est utilisé dans cette version. La progression est stockée localement dans le navigateur.
La reconnaissance vocale du navigateur n'est pas garantie comme traitement local : selon le navigateur/appareil, elle peut utiliser un service distant. Voir la documentation Web Speech API.

## Limites
- La reconnaissance vocale `SpeechRecognition` n'est pas uniformément supportée par tous les navigateurs.
- Les scores de conversation sont des heuristiques pédagogiques, pas une mesure scientifique.
- Pour une analyse IA avancée (intonation, débit réel, bégaiement, reformulation sémantique), il faudrait ajouter un moteur vocal/IA externe ou un modèle local ; cette version reste volontairement sans coût d'API.

## Sources techniques
- MDN Web Speech API : https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- MDN SpeechSynthesis : https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- MDN PWA installability : https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- GitHub Pages : https://docs.github.com/en/pages/getting-started-with-github-pages