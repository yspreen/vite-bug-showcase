screenshots: https://imgur.com/a/BbfO8NT

![no manual chunks](https://i.imgur.com/GOpePYv.png)
![manual chunks](https://i.imgur.com/EGabEBC.png)

build logs:

```
02:33:44 PM ➜ manual-chunks git:(main) ✗ yarn build
yarn run v1.22.19
$ tsc -b && vite build
vite v5.3.3 building for production...
✓ 1576 modules transformed.
dist/index.html                                0.69 kB │ gzip:   0.35 kB
dist/assets/index-Bin2PfvK.css                 0.39 kB │ gzip:   0.28 kB
dist/assets/index-BrveppYU.js                  1.49 kB │ gzip:   0.77 kB
dist/assets/LazyCanvasPreload-DqTxDxIB.js      4.52 kB │ gzip:   1.86 kB
dist/assets/meshline-CrMtFKUz.js              12.18 kB │ gzip:   3.23 kB
dist/assets/fiber-CXLwAoe4.js                131.50 kB │ gzip:  42.78 kB
dist/assets/leva-BVXuFc5x.js                 174.95 kB │ gzip:  59.55 kB
dist/assets/drei-C01jaACB.js                 293.00 kB │ gzip:  94.55 kB
dist/assets/three-DRAnyDFn.js                678.60 kB │ gzip: 175.04 kB
dist/assets/rapier-Bj7afa-O.js             2,093.54 kB │ gzip: 767.93 kB
```

```
02:34:46 PM ➜ no-manual-chunks git:(main) ✗ yarn build
yarn run v1.22.19
$ tsc -b && vite build
vite v5.3.3 building for production...
✓ 1576 modules transformed.
dist/index.html                                0.46 kB │ gzip:     0.30 kB
dist/assets/index-Bin2PfvK.css                 0.39 kB │ gzip:     0.28 kB
dist/assets/index-BK3RNL_N.js                144.26 kB │ gzip:    46.54 kB
dist/assets/LazyCanvasPreload-DLf-kybj.js  3,247.15 kB │ gzip: 1,099.02 kB
```
