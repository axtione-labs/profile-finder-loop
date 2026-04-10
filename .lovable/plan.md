

## Plan : Vidéo Formation "Comment devenir apporteur d'affaires" (MP4)

### Objectif
Générer une vidéo motion design professionnelle (~25 secondes) présentant les 6 modules de formation, du débutant à l'expert, téléchargeable en MP4.

### Direction créative
- **Style** : Tech Product / Cinematic Minimal — tons bleus (palette du site), fond sombre avec accents lumineux
- **Polices** : Plus Jakarta Sans (titres) + Inter (corps) — cohérent avec le site
- **Palette** : `#2563EB` (primary), `#7C3AED` (accent violet), `#0F172A` (fond), `#F8FAFC` (texte)
- **Motion** : Spring snappy pour les entrées, transitions wipe/slide entre les scènes

### Structure vidéo (6 scènes + intro/outro)

1. **Intro** (~3s) — Logo/titre "Devenez Apporteur d'Affaires IT" avec reveal animé
2. **Module 1** (~3s) — "Les Bases" : icône + titre + badge Débutant
3. **Module 2** (~3s) — "Construire son Réseau" : networking visuel
4. **Module 3** (~3s) — "Détecter les Besoins" : cible animée
5. **Module 4** (~3s) — "Déclarer et Suivre" : pipeline visuel
6. **Module 5** (~3s) — "Négocier sa Commission" : graphique montant
7. **Module 6** (~3s) — "Devenir Expert" : couronne/trophée avec effet doré
8. **Outro** (~3s) — Barre de progression complète + texte "Du débutant à l'expert"

### Mise en oeuvre technique
- Projet Remotion dans `remotion/` avec scènes séparées
- TransitionSeries pour des transitions fluides entre modules
- Rendu MP4 1920x1080 à 30fps vers `/mnt/documents/formation-apporteur.mp4`
- Fond gradient animé persistant + particules/accents flottants

### Livrable
- Fichier MP4 téléchargeable (~25s, Full HD)

