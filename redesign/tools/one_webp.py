import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert("RGB"); im.save(sys.argv[2],"WEBP",quality=int(sys.argv[3]) if len(sys.argv)>3 else 85,method=6); print(im.size)
