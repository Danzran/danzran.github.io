"""Promote the v9 draft to the site root: writes <repo>/index.html from redesign/drafts/v9-night/index.html.
Relative src/href/poster attributes are re-based onto the draft folder, and window.V9_BASE tells the scripts
(which build a few asset URLs at runtime) where the draft lives. Re-run after every change to the draft.
    python3 redesign/tools/promote_v9.py"""
import re, posixpath, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = 'redesign/drafts/v9-night/'
src = (ROOT / BASE / 'index.html').read_text(encoding='utf-8')

def rebase(m):
    attr, q, url = m.group(1), m.group(2), m.group(3)
    if re.match(r'^(?:[a-z]+:|#|/|data:)', url): return m.group(0)
    path, _, frag = url.partition('#')
    new = posixpath.normpath(BASE + path) + ('#' + frag if frag else '')
    return f'{attr}={q}{new}{q}'

out = re.sub(r'\b(src|href|poster)=(["\'])([^"\']+)\2', rebase, src)
out = out.replace('<head>', '<head>\n<!-- generated from redesign/drafts/v9-night/index.html by redesign/tools/promote_v9.py; edit the draft, not this file -->\n<script>window.V9_BASE = ' + repr(BASE) + ';</script>', 1)
(ROOT / 'index.html').write_text(out, encoding='utf-8', newline='\n')
print('wrote index.html,', len(out), 'bytes')
