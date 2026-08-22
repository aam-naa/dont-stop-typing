"use client";
import Playground from './components/Playground';
import {useLocation} from 'react-router-dom';
import {TARGETS} from './targets.js';

const Editor = () => {
  const location = useLocation();

  const target = TARGETS.find(t => t.id === location.state?.picId) ?? TARGETS[0];

  return (
    <Playground
      code={target.starter} image={target.image}
    />
  )
}

export default Editor 