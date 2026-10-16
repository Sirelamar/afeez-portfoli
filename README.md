# Afeez Opeyemi Oyewumi: portfolio website

A static, single-page portfolio (HTML + CSS + vanilla JS, no build step, no dependencies).

Features: loading animation, dark/light theme (remembers the visitor's choice), mobile menu, scroll animations, animated stats,
and **You Draw It**, a data game where visitors sketch how the naira, Nigeria's fuel imports or Bitcoin moved, then see the real data and a score.

```
afeez-portfolio/
├── index.html      # page content
├── styles.css      # design (dark + light themes, responsive)
├── app.js          # interactions and the data game
├── vercel.json     # optional Vercel settings
└── assets/
    ├── afeez.jpg / afeez-square.jpg    # profile photo (desktop / mobile crop)
    ├── favicon.jpg
    ├── import.jpg / crypto.jpg         # project charts
    └── Afeez_Opeyemi_Oyewumi_CV.pdf    # downloadable CV
```

## Preview locally

Double-click `index.html`, or run `python -m http.server 8000` in this folder and open http://localhost:8000.

## Deploy to Vercel (free)

1. Push this folder to its own GitHub repo (for example `afeez-portfolio`).
2. On vercel.com: **Add New → Project**, import the repo, keep **Framework Preset: Other**, and click **Deploy**.
3. Your site will be live at `https://<project-name>.vercel.app`.

## Updating

- Text: edit `index.html`.
- Game data: edit the `DATA` object near the bottom of `app.js`.
- CV: replace `assets/Afeez_Opeyemi_Oyewumi_CV.pdf` (keep the same name).
- Photo: replace `assets/afeez.jpg` (portrait, about 4:5).
