#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'assets/manifest.json');
const MODEL = 'gpt-image-2';

const STYLE_CONSTRAINTS = [
  'kid-safe educational fantasy art',
  'consistent palette and painterly texture',
  'no text, numbers, logos, or watermarks',
  'clean silhouettes and high readability',
  'single subject focus when applicable'
].join('; ');

const PROMPTS = {
  title_bg: 'Title screen background: magical learning forest clearing with soft rays of light and whimsical geometry motifs.',
  ui_panel_texture: 'UI panel texture tile: parchment-like fantasy panel with subtle math glyph embossing.',
  ui_button_texture: 'UI button texture tile: bright rounded fantasy button surface with gentle gradient and edge highlight.',

  zone_forest_bg: 'Forest zone top-down backdrop: enchanted greenery, paths, and playful math motifs.',
  zone_city_bg: 'City zone top-down backdrop: cheerful number-themed streets and colorful market architecture.',
  zone_castle_bg: 'Castle zone top-down backdrop: mysterious purple stone halls and geometric arcane accents.',

  zone_forest_tile_grass: 'Seamless forest grass tile, top-down, vibrant green with hand-painted detail.',
  zone_forest_tile_floor: 'Seamless forest path floor tile, top-down, compact dirt with subtle texture.',
  zone_forest_tile_obstacle: 'Seamless forest obstacle tile, top-down, dense shrubs and roots.',
  zone_forest_tile_portal: 'Forest portal tile icon, top-down, glowing blue rune circle.',

  zone_city_tile_grass: 'Seamless city park grass tile, top-down, clean stylized blades and flowers.',
  zone_city_tile_floor: 'Seamless city street tile, top-down, friendly cobblestone pattern.',
  zone_city_tile_obstacle: 'Seamless city obstacle tile, top-down, crate-and-barrier cluster.',
  zone_city_tile_portal: 'City portal tile icon, top-down, radiant cyan gate marker.',

  zone_castle_tile_grass: 'Seamless castle moss tile, top-down, dark fantasy but child-friendly palette.',
  zone_castle_tile_floor: 'Seamless castle stone tile, top-down, worn purple-gray blocks.',
  zone_castle_tile_obstacle: 'Seamless castle obstacle tile, top-down, broken pillar cluster.',
  zone_castle_tile_portal: 'Castle portal tile icon, top-down, magical violet ring.',

  npc_forest_teacher: 'NPC portrait: wise tree teacher character, warm smile, educational fantasy style.',
  npc_forest_rabbit: 'NPC portrait: energetic rabbit math adventurer with playful expression.',
  npc_city_merchant: 'NPC portrait: friendly fraction merchant with colorful accessories.',
  npc_city_engineer: 'NPC portrait: inventive decimal engineer with goggles and tools.',
  npc_castle_geomancer: 'NPC portrait: calm geometry mage with angular motifs and staff.',
  npc_castle_boss: 'NPC portrait: dramatic but kid-safe shadow math king boss character.',

  item_icon_hint_scroll: 'Item icon: magical hint scroll with sparkling rune seal.',
  item_icon_time_boost: 'Item icon: hourglass power-up with bright magical glow.',
  item_icon_coin_magnet: 'Item icon: coin magnet charm in playful fantasy style.',
  item_icon_armor: 'Item icon: child-friendly fantasy armor chestplate with gem accent.'
};

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required.');
  }

  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
  const entries = Object.entries(manifest.assets);

  for (const [key, relPath] of entries) {
    const prompt = PROMPTS[key];
    if (!prompt) {
      console.warn(`Skipping ${key}: no prompt configured.`);
      continue;
    }
    const absPath = path.join(ROOT, relPath);
    await fs.mkdir(path.dirname(absPath), { recursive: true });

    const finalPrompt = `${prompt} Style constraints: ${STYLE_CONSTRAINTS}.`;
    console.log(`Generating ${key} -> ${relPath}`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: finalPrompt,
        size: pickSize(key)
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Image API failed for ${key}: ${response.status} ${body}`);
    }

    const json = await response.json();
    const base64 = json && json.data && json.data[0] && json.data[0].b64_json;
    if (!base64) throw new Error(`No image payload returned for ${key}`);
    await fs.writeFile(absPath, Buffer.from(base64, 'base64'));
  }

  console.log('Done. Assets generated from manifest at assets/manifest.json');
}

function pickSize(key) {
  if (key.includes('bg')) return '1536x1024';
  if (key.includes('tile')) return '1024x1024';
  return '1024x1024';
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
