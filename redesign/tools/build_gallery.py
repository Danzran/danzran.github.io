"""Scan the mockup folders and write STYLE-LAB/manifest.js for STYLE-LAB/index.html.
Run from anywhere: python3 redesign/tools/build_gallery.py  (stdlib only)."""
import json, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
LAB = os.path.join(ROOT, 'STYLE-LAB')
IMG = ('.png', '.jpg', '.jpeg', '.webp')

# (folder relative to repo root, title, blurb)
GROUPS = [
    ('STYLE-LAB/water-r3', 'Water round 3 · tuning the winner', 'Ink ladder 1–5 for the water hero, the v8 river storyboard, a night-tide variant, a water close-up sheet for building it in code, and the green-free recolours.'),
    ('STYLE-LAB/a-cloud-soft-ink', 'A · Cloud world, soft ink', 'Ghibli-like painted clouds with soft indigo linework (ink ladder 2–3).'),
    ('STYLE-LAB/b-sakuga-impact', 'B · Sakuga impact frames', 'Bold brush ink, hatching and emphasis lines on airy pastel (ladder 4–5).'),
    ('STYLE-LAB/c-genga-pencil', 'C · Animator key-frame pencils', 'Blue/red construction lines, timing sheets, onion skins: behind the frame.'),
    ('STYLE-LAB/d-manga-panels', 'D · Pastel manga page', 'Panels, screentone clouds, SFX lettering; scrolling is reading.'),
    ('STYLE-LAB/e-edit-grade', 'E · COD-edit / Beautiful World', 'Dreamy colour grade, scratchy white hand-lettering, light leaks.'),
    ('STYLE-LAB/f-fluffy-ui', 'F · Fluffy cloud UI', 'Clean product-like cloud interface with small ink accents.'),
    ('STYLE-LAB/g-dusk-dream', 'G · Dusk to night', 'Golden hour to starry pastel night as you scroll; glowing ink.'),
    ('STYLE-LAB/h-cel-90s', 'H · 90s pastel cel anime', 'Hand-inked cels, airbrushed skies, sparkles and VHS warmth.'),
    ('STYLE-LAB/codex-session', 'X · Codex terra picks', 'Interpretations the Codex agent thought were missing.'),
    ('HANDSTAND-DRAFTS', 'Handstand camera drafts (Codex session)', 'Water/ink/light treatments around your handstand plus a scroll camera path (hands → torso → feet). See CAMERA-PATH.md.'),
    ('STYLE-BLEND', 'Blend tests (first round)', 'Cloud world × anime ink at different strengths. 05 is the ink ladder.'),
    ('CLOUD-MOCKUPS', 'Cloud mockups (Codex session)', 'The fluffy cloud direction that started this.'),
    ('redesign/mockups', 'Earlier mockups (rejected directions)', 'Lime/dark reveal and paper-crayon explorations, kept for reference.'),
]
for extra in sorted(os.listdir(LAB)):
    p = f'STYLE-LAB/{extra}'
    if os.path.isdir(os.path.join(ROOT, p)) and not extra.startswith('_') and p not in [g[0] for g in GROUPS]:
        GROUPS.append((p, extra, ''))

PROTOS = [
    ('redesign/drafts/v8-tide/index.html', 'v8 · Tide (water round, live)', 'One hand-inked water river runs the whole page: it unwinds from the ribbons around your handstand and grows as you scroll, weaving between frosted ivory cards, and ends in a pool at contact. Azure/ivory/gold sky that warms as you go down. On twos by default.'),
    ('redesign/drafts/v7-manga/index.html', 'v7 · Pastel manga page (live)', 'The homepage as a manga chapter: screentone clouds, speech-bubble nav, SFX lettering, panels that wipe open on threes as you read down.'),
    ('redesign/drafts/v6-edit/index.html', 'v6 · The edit (COD / Beautiful World, live)', 'Graded footage, glowing scratchy titles, REC/timecode chrome, flash-frame cuts, and an edit bay where scrolling drives the playhead through your projects.'),
    ('redesign/drafts/v5-elemental/index.html', 'v5 · Elemental flow (latest direction, live)', 'Cotton-sky water scene that actually flows (WebGL flow map), water ribbons wrapping the handstand, camera travels hands → torso → feet. Toggle smooth vs on-twos water.'),
    ('redesign/drafts/v4-sakuga/index.html', 'v4 · Sakuga impact frames (live)', 'Bold ink, concentration lines redrawn on threes, impact-frame flashes and smears on scroll, sakuga golf rotoscope.'),
    ('redesign/drafts/v3-cloud-ink/index.html', 'v3 · Cloud world + soft ink (live)', 'Painted sky, drifting clouds, redrawn handstand + rays, brush title that boils, golf rotoscope.'),
    ('redesign/drafts/v2-scribble/index.html', 'v2 · Paper & crayon (rejected)', 'Redrawn crayon letters, pastel rotoscope golf.'),
    ('redesign/drafts/v1-reveal/index.html', 'v1 · Machine-vision reveal (rejected)', 'Dark/lime cursor reveal.'),
    ('redesign/drafts/paper-motion-study/index.html', 'Paper motion study (Codex)', 'Cadence comparisons for redrawn letters.'),
]

def notes_summary(folder):
    p = os.path.join(ROOT, folder, 'NOTES.md')
    if not os.path.exists(p): return ''
    txt = open(p, encoding='utf-8', errors='ignore').read()
    paras = [x.strip() for x in re.split(r'\n\s*\n', txt) if x.strip() and not x.strip().startswith('#')]
    return re.sub(r'\s+', ' ', paras[0]).replace('**', '').replace('`', '')[:420] if paras else ''

groups = []
for folder, title, blurb in GROUPS:
    d = os.path.join(ROOT, folder)
    if not os.path.isdir(d): continue
    imgs = sorted(f for f in os.listdir(d) if f.lower().endswith(IMG))
    if not imgs: continue
    groups.append({
        'id': folder.replace('/', '-'), 'title': title, 'blurb': blurb, 'notes': notes_summary(folder),
        'hasNotes': os.path.exists(os.path.join(d, 'NOTES.md')),
        'images': [{'src': os.path.relpath(os.path.join(d, f), LAB).replace(os.sep, '/'), 'name': f} for f in imgs],
        'folder': os.path.relpath(d, LAB).replace(os.sep, '/'),
    })
# cross-folder view: every round-2 "Cotton Sky + elemental water" mockup side by side, first in the gallery
water = []
for g in groups:
    if not g['folder'].startswith(('a-', 'b-', 'c-', 'd-', 'e-', 'f-', 'g-', 'h-')): continue
    water += [{'src': im['src'], 'name': g['folder'].split('-')[0] + ' / ' + im['name']} for im in g['images'] if 'water' in im['name']]
if water:
    groups.insert(0, {'id': 'water-round', 'title': 'Water round · all styles (newest)',
        'blurb': 'Round 2: every style agent\'s take on Cotton Sky + elemental water (blue/azure/ivory/gold, less pink, no green). Same images also appear in their own folders below.',
        'notes': '', 'hasNotes': False, 'images': water, 'folder': ''})

protos = [{'href': os.path.relpath(os.path.join(ROOT, h), LAB).replace(os.sep, '/'), 'title': t, 'blurb': b}
          for h, t, b in PROTOS if os.path.exists(os.path.join(ROOT, h))]
with open(os.path.join(LAB, 'manifest.js'), 'w', encoding='utf-8') as f:
    f.write('/* generated by redesign/tools/build_gallery.py */\nwindow.LAB = ' + json.dumps({'groups': groups, 'protos': protos}, indent=1) + ';\n')
print(sum(len(g['images']) for g in groups), 'images in', len(groups), 'groups;', len(protos), 'prototypes')
