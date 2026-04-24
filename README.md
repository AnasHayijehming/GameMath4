# Math Adventure

## AI Art Asset Pipeline

### Existing asset summary

Current `assets/` contents are manifest-driven. In this checkout, `assets/manifest.json`
defines the game asset slots, while the concrete PNG/WebP folders are absent until
assets are generated or supplied.

Current manifest asset categories:

- 1 title/background
- 2 UI textures
- 3 zone backgrounds
- 12 map tiles
- 6 NPC portraits
- 4 item icons

Run a local scan at any time:

```bash
node tools/improve-assets scan
```

The scan reports image types, image folders, manifest asset count, and missing
manifest outputs.

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

## AI-Assisted Asset Improvement

Use `tools/improve-assets` to improve or regenerate selected assets with the
OpenAI Image API model `gpt-image-2`. The workflow never overwrites existing
game assets. Outputs and metadata are written to `assets/ai-generated/`.
When editing an existing source image, the original is copied once into
`assets/ai-generated/original-backups/` and the generated metadata records that
backup path.

The tool uses `OPENAI_API_KEY` from the environment:

```bash
export OPENAI_API_KEY="your_api_key_here"
```

PowerShell:

```powershell
$env:OPENAI_API_KEY="your_api_key_here"
```

### Dry run

Preview the prompt, endpoint, size, output format, and output path without
calling the API:

```bash
node tools/improve-assets generate --key title_bg --format both --dry-run
```

### Edit an existing asset

When an existing image is provided, the tool uses the Image API edit endpoint
and asks the model to preserve style, palette, camera angle, sprite size, and
transparency behavior.

```bash
node tools/improve-assets edit --key title_bg --prompt "increase detail and readability" --format png
```

You can also pass a direct source image:

```bash
node tools/improve-assets edit --input assets/ui/title-bg.png --key title_bg --format both
```

### Generate a replacement asset

Generate a new candidate for a manifest slot without replacing the manifest
path:

```bash
node tools/improve-assets generate --key npc_forest_teacher --format webp --count 2
```

### Generate missing variations

Generate candidates for manifest assets whose target files are missing:

```bash
node tools/improve-assets missing-variations --format png
```

### Output files

Each generated image is saved under:

```text
assets/ai-generated/
```

Every image receives a sibling metadata JSON file containing the model, prompt,
mode, source asset details when available, output path, requested format, size,
and preservation constraints.
