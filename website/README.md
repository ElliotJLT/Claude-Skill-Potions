# Skill Potions Website

A cozy 8-bit potion shop interface for browsing and downloading Claude Code skills.

## Local Development

```bash
# From the website directory
npx serve .

# Or with Python
python -m http.server 8000
```

Open `http://localhost:8000`

## Deploy to Netlify

### Option 1: Drag & Drop
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `website` folder
3. Done!

### Option 2: GitHub Integration
1. Connect your GitHub repo to Netlify
2. Set build settings:
   - **Base directory:** `website`
   - **Publish directory:** `website`
   - **Build command:** (leave empty)
3. Deploy

## Email Capture Setup (Buttondown)

1. Create account at [buttondown.email](https://buttondown.email)
2. Get your API key from Settings → API
3. Add to `scripts/app.js`:
   ```javascript
   const CONFIG = {
     // ...
     BUTTONDOWN_KEY: 'your-api-key-here',
   };
   ```

### Alternative: Netlify Forms
Add this hidden form to `index.html`:
```html
<form name="email-capture" netlify netlify-honeypot="bot-field" hidden>
  <input type="email" name="email" />
</form>
```

Then update `app.js` to POST to `/.netlify/forms/email-capture`.

## Audio Files

Add royalty-free audio to `/audio`:
- `ambient-cave.mp3` - Background ambience
- `bubble.mp3` - Bubbling loop
- `pop.mp3` - Selection sound
- `clink.mp3` - Filter sound

See `audio/README.md` for suggested sources.

## Customization

### Add New Skills
Edit `data/skills.json`:
```json
{
  "id": "new-skill",
  "name": "New Skill",
  "description": "What it does",
  "category": "planning",
  "color": "red",
  "problem": "What problem it solves"
}
```

### Colors
Available: `red`, `green`, `blue`, `yellow`, `purple`, `orange`, `gold`, `pink`

### Categories
`planning`, `quality`, `data`, `debug`, `discipline`, `productivity`, `elixir`, `fun`

## Structure

```
website/
├── index.html          # Main page
├── netlify.toml        # Deployment config
├── data/
│   └── skills.json     # Skill metadata
├── styles/
│   ├── main.css        # Layout, theme
│   ├── potions.css     # Potion sprites
│   └── animations.css  # Effects
├── scripts/
│   └── app.js          # Main logic
└── audio/
    └── README.md       # Audio file guide
```
