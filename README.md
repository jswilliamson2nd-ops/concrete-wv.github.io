# ACI West Virginia Interest Group Website

This repository contains the **official website** for the *ACI West Virginia Interest Group*, a forming professional network dedicated to advancing concrete knowledge, quality, and innovation across the Mountain State.

## Live Site
https://concrete-wv.org 
(Will later be mapped to https://www.aciwv.org)

## About
The **ACI West Virginia Interest Group** is the first step toward forming an officially recognized ACI Chapter serving the state of West Virginia. Our mission is to connect engineers, contractors, suppliers, educators, and students to promote excellence in concrete design, construction, and materials through education, collaboration, and professional development.

## Website Structure
| File | Purpose |
|------|---------|
| `index.html` | Main webpage with all content and embedded Google Form |
| `styles.css` | Responsive layout and styling |
| `/assets/` | Logo and image files (header and favicon) |
| `README.md` | Documentation for this repository |

The site is designed as a **static HTML/CSS** website — lightweight, mobile-friendly, and easy to maintain.

## Embedded Google Form
The **Get Involved** section of the website embeds our live signup form:  
https://forms.gle/QfaPUHFHfi9S4Zgc6

## Deployment via GitHub Pages
1. Ensure repository name = **concrete-wv.org**
2. In the repo: **Settings → Pages → Source → Deploy from branch**  
   - Select branch: `main`  
   - Folder: `/ (root)`
3. Save → wait 1–2 minutes → site will publish automatically.

## Custom Domain Setup (Optional)
To use `www.aciwv.org`:
1. Add a **CNAME** record in your domain DNS:  
   `www → aciwv.github.io`
2. (Optional root domain support)  
   Add A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. In repo **Settings → Pages → Custom domain**, enter `www.aciwv.org` and enforce HTTPS.

## Maintenance Notes
- Edit text content in `index.html`
- Adjust layout or colors in `styles.css`
- Upload new logos to `/assets/`
- Commit and push — GitHub Pages automatically updates the live site

## Disclaimer
The **ACI West Virginia Interest Group** is a volunteer-led organization currently in formation and **not yet an officially chartered ACI Chapter**. “American Concrete Institute” and “ACI” are registered trademarks of the American Concrete Institute and are used here with acknowledgment and respect.

### Maintainer
**Project Lead:** S. Williamson  
info@concrete-wv.org  
West Virginia, USA
