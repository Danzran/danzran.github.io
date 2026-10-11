import json, glob, numpy as np, cv2, mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
opts = vision.PoseLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path='pose_heavy.task'),
    running_mode=vision.RunningMode.VIDEO, output_segmentation_masks=True, min_pose_detection_confidence=.4, min_tracking_confidence=.4)
lm = vision.PoseLandmarker.create_from_options(opts)
files = sorted(glob.glob('raw/f*.png')); out = []
import os; os.makedirs('mask', exist_ok=True)
for i, f in enumerate(files):
    img = cv2.cvtColor(cv2.imread(f), cv2.COLOR_BGR2RGB)
    r = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=img), int(i * 1000 / 30))
    if r.pose_landmarks:
        out.append([[round(p.x, 4), round(p.y, 4), round(p.visibility, 3)] for p in r.pose_landmarks[0]])
        m = (r.segmentation_masks[0].numpy_view() * 255).astype(np.uint8)
        cv2.imwrite(f'mask/m{i+1:03d}.png', m)
    else:
        out.append(None)
json.dump(out, open('pose30.json', 'w'))
print('frames', len(files), 'detected', sum(o is not None for o in out))
