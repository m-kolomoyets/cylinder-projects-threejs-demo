import * as THREE from 'three';
import { faker } from '@faker-js/faker';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import CustomEase from 'gsap/CustomEase';

import TWEEN from 'three/addons/libs/tween.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { MOCK_PROJECTS } from './projects';

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(CustomEase)

ScrollTrigger.defaults({
  immediateRender: false,
  ease: "power1.inOut",
  scrub: true
});

let camera, scene, renderer;
const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };
let prevTime = performance.now();
let movingLeft = false;
let movingRight = false;
const velocity = new THREE.Vector3();

const controlButtons = {
  left: document.getElementById('left'),
  right: document.getElementById('right')
}

console.log(controlButtons);

controlButtons.left.addEventListener('mousedown', () => {
  movingLeft = true;
}, false);
controlButtons.right.addEventListener('mousedown', () => {
  movingRight = true;
}, false);

controlButtons.left.addEventListener('mouseup', () => {
  movingLeft = false;
}, false);
controlButtons.right.addEventListener('mouseup', () => {
  movingRight = false;
}, false);

const onKeyDown = function (event) {
  switch (event.keyCode) {
    case 68: // d 
    case 39: // right
      movingRight = true;
      break;
    case 65: // a 
    case 37: // left
      movingLeft = true;
      break;
  }
}

const onKeyUp = function (event) {
  switch (event.keyCode) {
    case 68: // d 
    case 39: // right
      movingRight = false;
      break;
    case 65: // a 
    case 37: // left
      movingLeft = false;
      break;
  }
}

document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10_000);
  // camera.position.z = 1;
  camera.position.z = 8000;

  scene = new THREE.Scene();

  // table

  for (let i = 0; i < MOCK_PROJECTS.length; i++) {
    const currentProject = MOCK_PROJECTS[i];

    const element = document.createElement('div');
    element.className = 'element';
    // element.style.backgroundColor = 'rgba(249,166,2,' + 1 / currentProject.priority + ')';
    element.style.opacity = 1 / currentProject.priority;

    const number = document.createElement('div');
    number.className = 'number';
    number.textContent = currentProject.id;
    element.appendChild(number);

    const symbol = document.createElement('div');
    symbol.className = 'symbol';
    symbol.textContent = currentProject.name;
    element.appendChild(symbol);

    const details = document.createElement('div');
    details.className = 'details';
    details.innerHTML = `Priority: ${currentProject.priority}`;
    element.appendChild(details);

    const objectCSS = new CSS3DObject(element);
    objectCSS.position.x = Math.random() * 4000 - 2000;
    objectCSS.position.y = Math.random() * 4000 - 2000;
    objectCSS.position.z = Math.random() * 4000 - 2000;
    scene.add(objectCSS);

    objects.push(objectCSS);

    //

    const object = new THREE.Object3D();
    object.position.x = (faker.number.int({
      min: 1,
      max: 30
    }) * 140) - 1330;
    object.position.y = - (faker.number.int({
      min: 1,
      max: 30
    }) * 180) + 990;

    targets.table.push(object);

  }

  // helix

  const vector = new THREE.Vector3();

  for (let i = 0, l = objects.length; i < l; i++) {

    const theta = i * 1 + Math.PI;
    const y = - (i * 30) + 450;
    const radius = MOCK_PROJECTS[i].priority * faker.number.int({
      min: 1200,
      max: 2500
    });

    const object = new THREE.Object3D();

    object.position.setFromCylindricalCoords(radius, theta, y);

    vector.x = object.position.x * 2;
    vector.y = object.position.y;
    vector.z = object.position.z * 2;
    // vector.multiplyScalar(-1);
    vector.multiplyVectors(vector, new THREE.Vector3(-1, 1, -1));

    object.lookAt(vector);

    targets.helix.push(object);
  }
  //

  renderer = new CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container').prepend(renderer.domElement);

  transform(targets.helix, 2000);

  const loaderTimeline = gsap.timeline();
  const cameraTimeline = gsap.timeline();
  const instructionsTimeline = gsap.timeline();
  const controlsTimeline = gsap.timeline();

  cameraTimeline.to(camera.position, {
    delay: 1,
    duration: 3,
    z: 1,
    ease: CustomEase.create("custom", "M0,0 C0.402,0 0.5,0.47 0.538,0.534 0.564,0.578 0.584,1 1,1 "),
    // ease: "expo.in"
  });

  window.addEventListener('resize', onWindowResize);



  cameraTimeline.to(camera.position, {
    y: -2_000,
    ease: "power1.inOut",
    scrollTrigger: {
      trigger: '.space__wrap .space.first',
      endTrigger: '.space__wrap .space.last',
      end: "bottom bottom",
    }
  });

  instructionsTimeline.to('.instruction', {
    opacity: 0,
    display: 'none',
    scrollTrigger: {
      trigger: '.space__wrap .space.pre-last',
      endTrigger: '.space__wrap .space.last',
      end: "bottom bottom",
    }
  });

  controlsTimeline.to('.controls', {
    opacity: 0,
    display: 'none',
    scrollTrigger: {
      trigger: '.space__wrap .space.pre-last',
      endTrigger: '.space__wrap .space.last',
      end: "bottom bottom",
    }
  });

  loaderTimeline.to('.counter__percent', {
    delay: 1,
    duration: 0.3,
    opacity: 0
  });

  loaderTimeline.to('.loader__bar', {
    duration: 1.2,
    delay: 0.5,
    height: 0,
    stagger: {
      amount: 0.5
    },
    ease: 'power4.inOut'
  });

  loaderTimeline.to('#loader', {
    delay: 2,
    duration: 0,
    zIndex: -1,
    display: 'none'
  });

}

function transform(targets, duration) {

  TWEEN.removeAll();

  for (let i = 0; i < objects.length; i++) {

    const object = objects[i];
    const target = targets[i];

    new TWEEN.Tween(object.position)
      .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    new TWEEN.Tween(object.rotation)
      .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

  }

  new TWEEN.Tween(this)
    .to({}, duration * 2)
    .onUpdate(render)
    .start();

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();

}

function animate() {

  requestAnimationFrame(animate);

  TWEEN.update();

  render();

  camera.rotation.y += 0.0005;
}

function render() {
  renderer.render(scene, camera);

  var time = performance.now();
  var delta = (time - prevTime) / 1000;

  velocity.y -= velocity.y * delta;
  //if the user pressed 'up' or 'w', set velocity.z to a value > 0.  
  if (movingLeft) velocity.y += 1.5 * delta;
  if (movingRight) velocity.y -= 1.5 * delta;

  // camera.translateY(velocity.y * delta);
  camera.rotation.y += velocity.y * delta;

  prevTime = time;
}