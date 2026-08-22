"use client";
import Playground from './components/Playground';

const Editor = () => {
  return (
    <Playground
      code={`
<div class="a"></div>
<div class="b"></div>
<style>
body{background:#fff}
.a,.b{position:absolute;width:70px;height:70px;top:40px}
.a{left:20px;background:#dd6b4d}
.b{left:70px;background:#8a8a8a}
</style>
        `}
    />
  )
}

export default Editor 