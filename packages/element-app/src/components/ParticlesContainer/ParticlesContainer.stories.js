import React from 'react';

import { storiesOf } from '@storybook/react';

import { ParticlesContainer } from './ParticlesContainer';

const svgParams = {
  fps_limit: 28,
  particles: {
    number: {
      value: 200,
      density: {
        enable: false,
      },
    },
    line_linked: {
      color: '#3CA9D1',
      enable: true,
      distance: 30,
      opacity: 0.4,
    },
    move: {
      speed: 1,
    },
    opacity: {
      anim: {
        enable: true,
        opacity_min: 0.05,
        speed: 2,
        sync: false,
      },
      value: 0.4,
    },
  },
  polygon: {
    enable: true,
    scale: 0.5,
    type: 'inline',
    move: {
      radius: 10,
    },
    url: '/svg/small-deer.2a0425af.svg',
    inline: {
      arrangement: 'equidistant',
    },
    draw: {
      enable: true,
      stroke: {
        color: 'rgba(255, 255, 255, .2)',
      },
    },
  },
  retina_detect: false,
  interactivity: {
    events: {
      onhover: {
        enable: true,
        mode: 'bubble',
      },
    },
    modes: {
      bubble: {
        size: 6,
        distance: 40,
      },
    },
  },
};

const imgParams = {
  particles: {
    number: {
      value: 10,
      density: {
        enable: true,
        value_area: 100,
      },
    },
    line_linked: {
      enable: false,
    },
    move: {
      speed: 1,
      out_mode: 'out',
    },
    shape: {
      type: ['images', 'circles'],
      images: [
        {
          src: './cys/png/001-lock.png',
          height: 100,
          width: 100,
        },
        {
          src: './cys/png/003-password.png',
          height: 100,
          width: 100,
        },
      ],
    },
    color: {
      value: '#CCC',
    },
    size: {
      value: 30,
      random: false,
      anim: {
        enable: true,
        speed: 4,
        size_min: 10,
        sync: false,
      },
    },
  },
  retina_detect: false,
};

storiesOf('Particles Container', module)
  .add('basic', () => <ParticlesContainer>Basic</ParticlesContainer>)
  .add('svg', () => <ParticlesContainer params={svgParams}>SVG</ParticlesContainer>)
  .add('image', () => <ParticlesContainer params={imgParams}>SVG</ParticlesContainer>);
