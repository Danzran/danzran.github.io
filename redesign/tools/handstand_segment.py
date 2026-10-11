import cv2, numpy as np, mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
img = cv2.cvtColor(cv2.imread('hs.png'), cv2.COLOR_BGR2RGB)
res = {}
# A: pose landmarker segmentation on original and on 180-rotated image
pl = vision.PoseLandmarker.create_from_options(vision.PoseLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path='../golf/pose_heavy.task'), output_segmentation_masks=True))
for name, im in ():  #, ('pose_rot', np.ascontiguousarray(img[::-1, ::-1]))):
    r = pl.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=im))
    if r.segmentation_masks:
        m = r.segmentation_masks[0].numpy_view()
        if name == 'pose_rot': m = m[::-1, ::-1]
        res[name] = np.squeeze(m)
# B: multiclass selfie segmenter (category 0 = background), on rotated too
sg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(base_options=mpt.BaseOptions(model_asset_path='seg.tflite'), output_confidence_masks=True))
for name, im in (('seg', img), ('seg_rot', np.ascontiguousarray(img[::-1, ::-1]))):
    r = sg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=im))
    m = 1 - r.confidence_masks[0].numpy_view()
    if name == 'seg_rot': m = m[::-1, ::-1]
    res[name] = np.squeeze(m)
tiles = []
for k, m in res.items():
    vis = (img * (m[..., None] > .5) * .85 + img * .15).astype(np.uint8)
    vis = cv2.resize(vis, (256, 384)); cv2.putText(vis, k, (8, 24), 0, .8, (255, 255, 0), 2)
    tiles.append(vis); np.save(f'm_{k}.npy', m.astype(np.float32))
cv2.imwrite('cmp.jpg', cv2.cvtColor(np.hstack(tiles), cv2.COLOR_RGB2BGR))
print(list(res))
