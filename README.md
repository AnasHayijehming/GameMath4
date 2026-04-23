# Math Adventure

## AI Art Asset Pipeline

### 1) Set API key

```bash
export OPENAI_API_KEY="your_api_key_here"
```

### 2) Regenerate assets

The generator uses a fixed prompt map and writes files to deterministic folders from `assets/manifest.json`.

```bash
node tools/generate-art.js
```

Generated outputs are written to:

- `assets/ui/`
- `assets/zones/forest/`
- `assets/zones/city/`
- `assets/zones/castle/`
- `assets/npcs/`
- `assets/items/`

### 3) Prompt/style constraints (consistency)

All prompts are constrained to a shared style so assets look coherent in-game:

- kid-safe educational fantasy art
- bright, consistent palette and painterly texture
- no text, numbers, logos, or watermarks
- clean silhouettes for readability

### 4) Runtime loading and fallback

`js/render/asset-loader.js` resolves stable manifest keys (for example `title_bg`, `zone_forest_bg`) into URLs. If an asset key is missing, it returns an inline SVG placeholder so rendering still works.

`index.html` preloads critical assets (`title_bg` + current zone background) to reduce first-render flicker.
