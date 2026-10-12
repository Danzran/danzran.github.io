import sys, glob, os
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
for f in glob.glob(os.path.join(src, '*.png')):
    im = Image.open(f).convert('RGB'); im.thumbnail((900, 900), Image.LANCZOS)
    out = os.path.join(dst, os.path.basename(f)[:-4] + '.webp'); im.save(out, 'WEBP', quality=82, method=6)
    print(os.path.basename(out), os.path.getsize(out) // 1024, 'KB')
