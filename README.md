# 🏔️ Météo Alpe Grenoble • Dashboard Randonnée & Montagne

Un **cockpit météo interactif et autonome (PWA / SPA)** conçu sur mesure pour les randonneurs, skieurs de randonnée et alpinistes grenoblois. Il regroupe au même endroit les meilleurs modèles météo et les capteurs de terrain pour les 4 massifs ceinturant Grenoble : **Belledonne**, **Chartreuse**, **Vercors** et **Taillefer / Oisans**.

---

## 🚀 Démarrage Rapide

Cette application est **100% autonome** et ne nécessite **aucune installation complexe, ni Node.js, ni clé d'API**.

### Option A — Ouverture directe (Le plus simple)
Double-cliquez simplement sur le fichier :
```text
index.html
```
Il s'ouvre instantanément dans votre navigateur habituel (Chrome, Edge, Firefox, Safari).

### Option B — Serveur local (Recommandé pour tester le mode PWA)
Ouvrez un terminal dans le dossier et lancez :
```bash
python -m http.server 8080
```
Puis accédez à `http://localhost:8080` dans votre navigateur. Vous pourrez alors cliquer sur **"Installer l'application"** ou **"Ajouter à l'écran d'accueil"** sur votre smartphone.

---

## 🎯 Fonctionnalités et Modules

### 0. Module Météociel • Grenoble (Ville & Départ)
Reproduction fidèle et intégrale des **3 composants plébiscités de Météociel** pour la ville de Grenoble :
- **Encart Éphéméride & Lune** : Date, Saint du jour (calendrier français complet), heures de lever/coucher du soleil avec variation journalière en minutes `( -3 min. )` et phase lunaire exacte (nom + icône).
- **Diagramme précipitations (mm)** : Reproduction exacte du graphique à barres 3D bleues Météociel avec séparateurs journaliers (`Lun | Mar | Mer | Jeu | Ven`) et échelle millimétrique pour visualiser immédiatement les créneaux pluvieux.
- **Grand Tableau Horaire Météociel** : Prévisions par pas de 3 heures avec la palette de couleurs légendaire (températures colorées jaune/vert/cyan, vent avec flèches de direction et rafales sur fond cyan, intensité de pluie sur 3h surlignée en bleu ciel/teal/bleu foncé, humidité et pression).

### 1. Sélecteur de Massifs & Sommets Phares
- **Belledonne** : Croix de Belledonne (2926m), Le Grand Colon (2394m), Croix de Chamrousse (2250m), Chamrousse Recoin (1780m).
- **Chartreuse** : Chamechaude (2082m), Dent de Crolles (2062m), Col de Porte (1325m).
- **Vercors** : Grand Veymont (2341m), Pic Saint-Michel (1966m), Le Moucherotte (1901m).
- **Taillefer / Oisans** : Le Taillefer (2857m), La Meije / Grand Pic (3984m), La Grave (1500m).
- Les coordonnées GPS et l'altitude exacte de chaque sommet sont prises en compte pour ajuster la température réelle au sommet et l'isotherme 0°C.

### 2. Module AROME 1.3km HD (Météo-France / Météociel) — Court terme (J & J+1)
- Exploite le modèle **AROME France HD (résolution maille 1.3 km)** de Météo-France via l'API Open-Meteo.
- **Métriques en direct** : Température au sommet, température ressentie (formule Windchill au vent), rafales maximales, isotherme 0°C et statut (gel / dégel), précipitations pluie et cumul de neige fraîche.
- **Deux modes d'affichage** :
  - *Timeline heure par heure* fluide avec icônes WMO, couleurs thermiques et alertes vent fort.
  - *Graphique Canvas interactif* haute performance affichant les courbes de température, la ligne de gel 0°C, les rafales et les barres de pluie/neige.
- **Liens directs Météociel** pré-paramétrés sur les coordonnées exactes du sommet pour ouvrir les cartes synoptiques et le radar de pluie haute définition.

### 3. Module ECMWF / Yr.no — Météogramme Officiel au Sommet & Tendance 7j
- **Météogramme officiel Yr.no reproduit fidèlement** à l'altitude exacte du sommet sélectionné :
  - *Panneau supérieur* : bandeau d'icônes de couverture nuageuse, courbe de température rouge continue (°C), et barres de pluie bleues synchronisées (mm).
  - *Panneau inférieur* : courbe continue violette du vent avec ligne de flèches directionnelles d'orientation sur les crêtes.
  - *Sélecteur d'unité* : affichage du vent au choix en **km/h** ou en **m/s** (standard Yr.no).
- Vue tendance synthétique sur 7 jours (ECMWF) avec températures min/max et cumuls journaliers.
- Lien direct vers la fiche officielle sur **Yr.no**.

### 4. Module ROMMA — Capteurs physiques réels & Webcams
- Stations automatiques du **Réseau d'Observation Météo du Massif Alpin** associées aux massifs :
  - *Belledonne* : Croix de Chamrousse 2250m, Chamrousse 1800m, La Ferrière Fond-de-France 1000m.
  - *Chartreuse* : Saint-Pierre de Chartreuse 900m, Le Sappey-en-Chartreuse 925m, La Ruchère 1150m, Nivôse Col de Porte 1325m.
  - *Vercors* : Lans-en-Vercors - Les Allières 1449m (pied du Pic Saint-Michel), Corrençon-en-Vercors 1272m (porte du Veymont), Gresse-en-Vercors Gerland 1512m, Lans Village 990m.
  - *Taillefer / Oisans* : Villard-Reymond 1688m, Séchilienne 550m, Glacier de la Meije 3200m.
- Liens directs vers les relevés officiels 24h sur `romma.fr` et vers les webcams panoramiques haute résolution locales (Chamrousse Roundshot, Coeur de Chartreuse, Villard/Corrençon, Téléphérique de La Grave).

### 5. Module Sécurité & Météo-France (BERA & Secours)
- **Accès direct en 1 clic aux BERA (Bulletins d'Estimation du Risque d'Avalanche)** actualisés quotidiennement à 16h par Météo-France pour chaque massif (Belledonne, Chartreuse, Vercors, Oisans).
- **Lien vers le bulletin départemental Météo-France Isère Montagne**.
- **Numéros d'urgence vitaux pré-enregistrés** :
  - PGHM Grenoble / Le Versoud : `04 76 77 57 70`
  - Secours européens : `112`
  - Urgence par SMS (zones blanches à faible réseau) : `114`
  - SAMU 15 / Pompiers 18
- **Les 4 réflexes du montagnard grenoblois** (horaires matinaux anti-orages, surveillance isotherme 0°C, trio DVA/Pelle/Sonde, contrôle balises ROMMA).

### 6. Design & Ergonomie Alpine
- Interface **Alpine Pro** moderne avec thème sombre immersif (idéal pour les réveils à 5h du matin en refuge) et thème clair plein soleil.
- **Cache intelligent (15 min)** en mémoire pour garantir un affichage instantané et éviter les surcharges d'API.
- Support du deep linking par ancre URL (ex: `index.html#croix-belledonne`).
- 100% responsive smartphone, tablette et grand écran de bureau.

---

## 📁 Architecture des Fichiers

```text
meteo-grenoble/dashboard/
├── index.html       # Structure HTML5 sémantique, métriques hero et sections modulaires
├── style.css        # Styles CSS Alpine Pro (Dark/Light mode, layout responsive, graphiques)
├── app.js           # Logique JS (API Open-Meteo AROME/ECMWF, calculs isotherme/windchill, canvas)
├── manifest.json    # Manifeste PWA pour installation mobile
├── sw.js            # Service Worker pour mise en cache hors-ligne
└── README.md        # Documentation complète
```
