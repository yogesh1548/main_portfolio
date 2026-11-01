# Yogesh Shah – Portfolio (v2)

Static site: HTML + CSS + vanilla JS. No build step, no backend.

## Use with your existing files
Copy `index.html`, `css/` and `js/` over your current ones. Keep your own files:
- images/profile.png
- images/certificate-1.jpeg ... certificate-5.jpeg
- assets/yogesh_cv.pdf

If an image is missing, a placeholder is shown instead (no broken icons).

## Edit your projects
Each project is an `<article class="project-card">` in the Projects section of `index.html`.
- Change the title, description and tags.
- Replace the GitHub link with the project's own repo, e.g. https://github.com/yogesh1548/repo-name
- To add a live demo, add: `<a href="DEMO_URL" target="_blank" rel="noopener noreferrer">Live demo</a>` inside `.project-links`.
- `data-category` must be one of: web, tool, ai, other (used by the filter buttons).
The "Projects" counter updates automatically.

## Features
Dark/light mode (remembers choice), project filter + search, scroll animations, scroll progress bar,
back-to-top, typing effect, animated counters, certificate lightbox (keyboard + swipe),
WhatsApp floating button and "send on WhatsApp" form, copy-email button, CV chatbot, SEO/social meta tags.

## Deploy
Netlify Drop (drag the folder) or GitHub Pages (push, then Settings > Pages).
