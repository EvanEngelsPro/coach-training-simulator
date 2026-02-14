# Implémentation du Timer d'Entraînement

## 🎯 Objectif
Afficher la durée totale de la session d'entraînement sur l'écran de fin ("Entraînement terminé").

## 📋 Analyse
Le moteur d'entraînement (`trainingEngine.js`) capture déjà les timestamps :
- `session.startedAt` : Défini au début de la session.
- `session.completedAt` : Défini à la fin de la dernière évaluation.

Il suffit donc de calculer la différence et de l'afficher.

## 🛠️ Changements Proposés

### 1. Vue (`src/views/training.js`)
Modification de la fonction `showComplete` pour :
1.  Calculer la durée : `durationMs = new Date(session.completedAt) - new Date(session.startedAt)`
2.  Formater la durée en `minutes : secondes`.
3.  Injecter cette information dans le HTML de l'écran de fin, à côté du score moyen.

### Maquette Visuelle
Ajout d'un bloc "Durée" à côté du score global :

```html
<div class="stat-card">
  <div class="stat-value">04:12</div>
  <div class="stat-label">Durée</div>
</div>
```

## ✅ Plan de Vérification
1.  Lancer un entraînement court.
2.  Prendre environ 10 secondes pour répondre.
3.  Vérifier que l'écran de fin affiche une durée cohérente (ex: "00:15" si on compte les délais d'animation).
