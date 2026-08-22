/* Goldfish — targets v3
 *
 * Full-document format: the player writes their own markup and styles,
 * exactly what they type is what renders.
 *
 * Each target has:
 *   starter   what the editor is pre-loaded with. Deliberately wrong size,
 *             position and colour — never accidentally close to the answer.
 *             Right *kind* of element though, so a 10s round is winnable.
 *   solution  the target image. Also the reference answer.
 *   dies_first  the detail most likely to be lost on the first handoff.
 *
 * Canvas is 300x300 and the shell already resets body margin, so targets
 * only ever set `background` on body.
 *
 * If the per-target starters give away too much, swap them all for
 * DEFAULT_STARTER below and re-playtest.
 */
import arch from './assets/arch.png'
import bullseye from './assets/bullseye.png'
import crosshair from './assets/crosshair.png'
import domino from './assets/domino.png'
import eclipse from './assets/eclipse.png'
import horizon from './assets/horizon.png'
import petal from './assets/petal.png'
import pill from './assets/pill.png'
import stairs from './assets/stairs.png'
import trio from './assets/trio.png'

const SHELL = src => `<!DOCTYPE html><html><head><style>
html,body{margin:0;padding:0;width:300px;height:300px;overflow:hidden;background:#fff}
*{box-sizing:border-box}
</style></head><body>${src}</body></html>`;

const DEFAULT_STARTER =
`<div class="a"></div>
<style>
body{background:#fff}
.a{position:absolute;left:60px;top:60px;width:100px;height:60px;background:#dd6b4d}
</style>`;

const TARGETS = [
  {
    name: "eclipse",
    difficulty: 1,
    dies_first: "which circle sits on top",
    id: 0,
    image: eclipse,
    starter:
`<div class="a"></div>
<div class="b"></div>
<style>
body{background:#fff}
.a,.b{position:absolute;width:70px;height:70px;top:40px}
.a{left:20px;background:#dd6b4d}
.b{left:70px;background:#8a8a8a}
</style>`,
    solution:
`<div class="a"></div>
<div class="b"></div>
<style>
body{background:#F2EFE6}
.a,.b{position:absolute;width:140px;height:140px;border-radius:50%;top:80px}
.a{left:40px;background:#FF4A6E}
.b{left:120px;background:#2C5CFF}
</style>`
  },
  {
    name: "crosshair",
    difficulty: 1,
    dies_first: "nothing much — this is the warm-up",
    id: 1,
    image: crosshair,
    starter:
`<div class="a"></div>
<div class="b"></div>
<style>
body{background:#fff}
.a,.b{position:absolute;background:#dd6b4d}
.a{width:120px;height:30px;left:40px;top:80px}
.b{width:30px;height:120px;left:40px;top:80px}
</style>`,
    solution:
`<div class="a"></div>
<div class="b"></div>
<style>
body{background:#2C5CFF}
.a,.b{position:absolute;background:#F2EFE6}
.a{width:200px;height:60px;left:50px;top:120px}
.b{width:60px;height:200px;left:120px;top:50px}
</style>`
  },
  {
    name: "bullseye",
    difficulty: 2,
    dies_first: "the middle ring is the background colour, not a real ring",
    id: 2,
    image: bullseye,
    starter:
`<div class="a"></div>
<div class="b"></div>
<div class="c"></div>
<style>
body{background:#fff}
.a,.b,.c{position:absolute}
.a{width:120px;height:120px;left:30px;top:30px;background:#dd6b4d}
.b{width:80px;height:80px;left:50px;top:50px;background:#fff}
.c{width:40px;height:40px;left:70px;top:70px;background:#8a8a8a}
</style>`,
    solution:
`<div class="a"></div>
<div class="b"></div>
<div class="c"></div>
<style>
body{background:#17161B}
.a,.b,.c{position:absolute;border-radius:50%}
.a{width:240px;height:240px;left:30px;top:30px;background:#FF4A6E}
.b{width:160px;height:160px;left:70px;top:70px;background:#17161B}
.c{width:80px;height:80px;left:110px;top:110px;background:#FFC93F}
</style>`
  },
  {
    name: "petal",
    difficulty: 1,
    dies_first: "which two corners are rounded — people mirror it",
    id: 3,
    image: petal,
    starter:
`<div class="a"></div>
<style>
body{background:#fff}
.a{position:absolute;width:110px;height:80px;left:40px;top:40px;background:#dd6b4d;border-radius:0 30px 0 30px}
</style>`,
    solution:
`<div class="a"></div>
<style>
body{background:#FFC93F}
.a{position:absolute;width:180px;height:180px;left:60px;top:60px;background:#17161B;border-radius:0 90px 0 90px}
</style>`
  },
  {
    name: "stairs",
    difficulty: 2,
    dies_first: "three widths and three colours is a lot to hold at once",
    id: 4,
    image: stairs,
    starter:
`<div class="a"></div>
<div class="b"></div>
<div class="c"></div>
<style>
body{background:#fff}
.a,.b,.c{position:absolute;height:30px;background:#dd6b4d}
.a{width:120px;left:30px;top:40px}
.b{width:120px;left:30px;top:90px}
.c{width:120px;left:30px;top:140px}
</style>`,
    solution:
`<div class="a"></div>
<div class="b"></div>
<div class="c"></div>
<style>
body{background:#F2EFE6}
.a,.b,.c{position:absolute;height:50px}
.a{width:200px;left:20px;top:50px;background:#2C5CFF}
.b{width:150px;left:60px;top:120px;background:#FF4A6E}
.c{width:100px;left:100px;top:190px;background:#17161B}
</style>`
  },
  {
    name: "domino",
    difficulty: 1,
    dies_first: "the diagonal flips",
    id: 5,
    image: domino,
    starter:
`<div class="a"></div>
<div class="b"></div>
<style>
body{background:#fff}
.a,.b{position:absolute;width:60px;height:60px;background:#dd6b4d}
.a{left:40px;top:40px}
.b{left:120px;top:40px}
</style>`,
    solution:
`<div class="a"></div>
<div class="b"></div>
<style>
body{background:#F2EFE6}
.a,.b{position:absolute;width:100px;height:100px}
.a{left:40px;top:40px;background:#FF4A6E}
.b{left:160px;top:160px;background:#17161B}
</style>`
  },
  {
    name: "arch",
    difficulty: 2,
    dies_first: "the base is a different colour from the arch",
    id: 6,
    image: arch,
    starter:
`<div class="a"></div>
<div class="b"></div>
<style>
body{background:#fff}
.a{position:absolute;width:100px;height:50px;left:40px;top:60px;background:#dd6b4d;border-radius:50px 50px 0 0}
.b{position:absolute;width:100px;height:30px;left:40px;top:110px;background:#dd6b4d}
</style>`,
    solution:
`<div class="a"></div>
<div class="b"></div>
<style>
body{background:#FF4A6E}
.a{position:absolute;width:160px;height:80px;left:70px;top:90px;background:#F2EFE6;border-radius:80px 80px 0 0}
.b{position:absolute;width:160px;height:60px;left:70px;top:170px;background:#17161B}
</style>`
  },
  {
    name: "pill",
    difficulty: 1,
    dies_first: "how round the ends are",
    id: 7,
    image: pill,
    starter:
`<div class="a"></div>
<style>
body{background:#fff}
.a{position:absolute;width:140px;height:60px;left:40px;top:60px;background:#dd6b4d;border-radius:10px}
</style>`,
    solution:
`<div class="a"></div>
<style>
body{background:#17161B}
.a{position:absolute;width:220px;height:100px;left:40px;top:100px;background:#FFC93F;border-radius:50px}
</style>`
  },
  {
    name: "trio",
    difficulty: 1,
    dies_first: "the spacing between them",
    id: 8,
    image: trio,
    starter:
`<div class="a"></div>
<div class="b"></div>
<div class="c"></div>
<style>
body{background:#fff}
.a,.b,.c{position:absolute;width:40px;height:40px;top:60px;background:#dd6b4d}
.a{left:30px}
.b{left:80px}
.c{left:130px}
</style>`,
    solution:
`<div class="a"></div>
<div class="b"></div>
<div class="c"></div>
<style>
body{background:#2C5CFF}
.a,.b,.c{position:absolute;width:60px;height:60px;border-radius:50%;top:120px;background:#FFC93F}
.a{left:30px}
.b{left:120px}
.c{left:210px}
</style>`
  },
  {
    name: "horizon",
    difficulty: 1,
    dies_first: "how far the sun overlaps the horizon",
    id: 9,
    image: horizon,
    starter:
`<div class="a"></div>
<div class="b"></div>
<style>
body{background:#fff}
.a{position:absolute;width:200px;height:80px;left:0;top:120px;background:#dd6b4d}
.b{position:absolute;width:70px;height:70px;left:40px;top:60px;background:#8a8a8a}
</style>`,
    solution:
`<div class="a"></div>
<div class="b"></div>
<style>
body{background:#F2EFE6}
.a{position:absolute;width:300px;height:150px;left:0;top:150px;background:#17161B}
.b{position:absolute;width:120px;height:120px;left:90px;top:90px;border-radius:50%;background:#FF4A6E}
</style>`
  }
];

export default { TARGETS, SHELL, DEFAULT_STARTER }

