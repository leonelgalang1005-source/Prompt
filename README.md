# ✦ PROMPTLY — AI Prompt Shop

> **Unlock your AI potential.** A tiny, beautiful one-page shop that sells an AI prompt for **₱10.00**.

No backend, no login, no paid services — just HTML, CSS and vanilla JavaScript. Works on GitHub Pages.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure (all screens) |
| `style.css` | Purple / lavender / white design, animations, responsive layout |
| `script.js` | Screen navigation, progress steps, clipboard copy, toast, "tomorrow" date (Asia/Manila) |
| `README.md` | This guide |

## Run it locally

**Easiest:** double-click `index.html` to open it in your browser.

**Optional local server** (closer to how GitHub Pages behaves):

```bash
# with Python
python -m http.server 8000
# then open http://localhost:8000
```

> Note: the one-click "copy" uses the modern Clipboard API, which needs `https://` or `localhost`. When opened as a plain file, a built-in fallback is used. On GitHub Pages (HTTPS) it works perfectly.

## Upload to GitHub and enable GitHub Pages

1. Create a free account at <https://github.com> and sign in.
2. Click **+ → New repository**. Name it e.g. `promptly`, set it to **Public**, then click **Create repository**.
3. On the new repo page click **uploading an existing file**.
4. Drag in `index.html`, `style.css`, `script.js` and `README.md` (the files themselves, not a folder around them).
5. Click **Commit changes**.
6. Go to **Settings → Pages**.
7. Under **Build and deployment → Source**, choose **Deploy from a branch**.
8. Under **Branch**, choose **main** and folder **/ (root)**, then click **Save**.
9. Wait 1–2 minutes and refresh the page. Your link will be:
   `https://YOUR-USERNAME.github.io/promptly/`
10. Share that link with your friends. 🎉

## Customize

- **GCash number:** edit it in `index.html` (the `#gcash-number` text) and in `script.js` (`GCASH_NUMBER_RAW`).
- **Price:** search for `₱10` in `index.html`.
- **Colors:** change the CSS variables at the top of `style.css`.

## Important notes

- The site **does not process or verify** GCash payments. Friends send the money in GCash, then message you their confirmation, and you send the prompt manually.
- "Tomorrow" is computed in the **Asia/Manila** timezone, whatever the visitor's device timezone is.
- The delivery of the prompt itself is up to you (e.g. via message once payment is confirmed).

Made with ✦ for curious minds · PROMPTLY
