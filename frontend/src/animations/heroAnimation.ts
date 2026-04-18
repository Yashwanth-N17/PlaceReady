import { animate } from 'animejs';

export const animateHero = () => {
  const el = document.querySelector('.hero-title');

  if (!el) {
    console.log("❌ hero-title NOT FOUND");
    return;
  }

  console.log("✅ hero-title FOUND");

  animate(el, {
    scale: [0.5, 1.5, 1],
    rotate: [0, 20, 0],
    duration: 1500,
    easing: 'easeInOutQuad'
  });
};