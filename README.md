# Afeez Opeyemi Oyewumi: portfolio website

A static, single-page portfolio (HTML + CSS, no build step).

```
afeez-portfolio/
├── index.html      # page content
├── styles.css      # design (wine / cream / earth palette, light and dark mode)
├── vercel.json     # optional Vercel settings
└── assets/
    ├── afeez.jpg                       # profile photo
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
- CV: replace `assets/Afeez_Opeyemi_Oyewumi_CV.pdf` (keep the same name).
- Photo: replace `assets/afeez.jpg` (portrait, about 4:5).
