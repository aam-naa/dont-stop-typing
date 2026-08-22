/* Goldfish — target set v2 (easier)
 * Canvas is 300x300. Four empty divs are available: #a #b #c #d
 *
 * Rules used when authoring these:
 *   - only position / width / height / background / border-radius
 *   - no blend modes, gradients, transforms or border-triangles
 *   - every number is a multiple of 10, so they're easy to eyeball and type
 *   - three elements maximum
 *   - `dies_first` is the detail most likely to be lost on the first handoff.
 *     That detail is the joke — keep authoring for it.
 */

const TARGETS = [
  {
    name: "eclipse",
    difficulty: 1,
    dies_first: "which circle sits on top",
    css:
`body{background:#F2EFE6}
#a,#b{position:absolute;width:140px;height:140px;border-radius:50%;top:80px}
#a{background:#FF4A6E;left:40px}
#b{background:#2C5CFF;left:120px}`
  },
  {
    name: "crosshair",
    difficulty: 1,
    dies_first: "nothing much — this is the warm-up",
    css:
`body{background:#2C5CFF}
#a,#b{position:absolute;background:#F2EFE6}
#a{width:200px;height:60px;left:50px;top:120px}
#b{width:60px;height:200px;left:120px;top:50px}`
  },
  {
    name: "bullseye",
    difficulty: 2,
    dies_first: "the middle ring is the background colour, not a real ring",
    css:
`body{background:#17161B}
#a,#b,#c{position:absolute;border-radius:50%}
#a{width:240px;height:240px;left:30px;top:30px;background:#FF4A6E}
#b{width:160px;height:160px;left:70px;top:70px;background:#17161B}
#c{width:80px;height:80px;left:110px;top:110px;background:#FFC93F}`
  },
  {
    name: "petal",
    difficulty: 1,
    dies_first: "which two corners are rounded — people mirror it",
    css:
`body{background:#FFC93F}
#a{position:absolute;width:180px;height:180px;left:60px;top:60px;background:#17161B;border-radius:0 90px 0 90px}`
  },
  {
    name: "stairs",
    difficulty: 2,
    dies_first: "three widths and three colours is a lot to hold at once",
    css:
`body{background:#F2EFE6}
#a,#b,#c{position:absolute;height:50px}
#a{width:200px;left:20px;top:50px;background:#2C5CFF}
#b{width:150px;left:60px;top:120px;background:#FF4A6E}
#c{width:100px;left:100px;top:190px;background:#17161B}`
  },
  {
    name: "domino",
    difficulty: 1,
    dies_first: "the diagonal flips",
    css:
`body{background:#F2EFE6}
#a,#b{position:absolute;width:100px;height:100px}
#a{left:40px;top:40px;background:#FF4A6E}
#b{left:160px;top:160px;background:#17161B}`
  },
  {
    name: "arch",
    difficulty: 2,
    dies_first: "the base is a different colour from the arch",
    css:
`body{background:#FF4A6E}
#a{position:absolute;width:160px;height:80px;left:70px;top:90px;background:#F2EFE6;border-radius:80px 80px 0 0}
#b{position:absolute;width:160px;height:60px;left:70px;top:170px;background:#17161B}`
  },
  {
    name: "pill",
    difficulty: 1,
    dies_first: "how round the ends are",
    css:
`body{background:#17161B}
#a{position:absolute;width:220px;height:100px;left:40px;top:100px;background:#FFC93F;border-radius:50px}`
  },
  {
    name: "trio",
    difficulty: 1,
    dies_first: "the spacing between them",
    css:
`body{background:#2C5CFF}
#a,#b,#c{position:absolute;width:60px;height:60px;border-radius:50%;top:120px;background:#FFC93F}
#a{left:30px}
#b{left:120px}
#c{left:210px}`
  },
  {
    name: "horizon",
    difficulty: 1,
    dies_first: "how far the sun overlaps the horizon",
    css:
`body{background:#F2EFE6}
#a{position:absolute;width:300px;height:150px;left:0;top:150px;background:#17161B}
#b{position:absolute;width:120px;height:120px;left:90px;top:90px;border-radius:50%;background:#FF4A6E}`
  }
];

export default TARGETS;
