import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// CÁMARA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

// RENDER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LUCES
scene.add(new THREE.AmbientLight(0xffffff, 1));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(50, 100, 50);
scene.add(light);

// 🚗 GRUPO MOVIMIENTO
let carGroup = new THREE.Group();
scene.add(carGroup);

// 🚗 VISUAL
let carVisual = new THREE.Group();
carGroup.add(carVisual);

let speed = 0;

const loader = new GLTFLoader();

// CARGAR COCHE
loader.load('/car.glb', (gltf) => {
  const car = gltf.scene;

  car.scale.set(2, 2, 2);
  car.position.y = 1;

  // 🔥 ROTACIÓN FINAL CORRECTA
  car.rotation.y = -Math.PI / 2;

  carVisual.add(car);
});

// TRACK
loader.load('/track.glb', (gltf) => {
  const track = gltf.scene;

  track.scale.set(5, 5, 5);
  track.position.set(0, 0, 0);

  scene.add(track);
});

// CONTROLES
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// CONFIG
let maxSpeed = 0.5;
let acceleration = 0.01;
let deceleration = 0.02;
let turnSpeed = 0.04;

// LOOP
function animate() {
  requestAnimationFrame(animate);

  if (keys['arrowup']) speed += acceleration;
  if (keys['arrowdown']) speed -= acceleration;

  if (!keys['arrowup'] && !keys['arrowdown']) {
    if (speed > 0) speed -= deceleration;
    if (speed < 0) speed += deceleration;
  }

  speed = Math.max(-maxSpeed / 2, Math.min(speed, maxSpeed));

  if (keys['arrowleft']) carGroup.rotation.y += turnSpeed;
  if (keys['arrowright']) carGroup.rotation.y -= turnSpeed;

  carGroup.position.x += Math.sin(carGroup.rotation.y) * speed;
  carGroup.position.z += Math.cos(carGroup.rotation.y) * speed;

  // 🎥 CÁMARA CINEMÁTICA
  const offset = new THREE.Vector3(0, 6, -15);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carGroup.rotation.y);

  const targetPos = carGroup.position.clone().add(offset);

  camera.position.lerp(targetPos, 0.08);
  camera.lookAt(carGroup.position.clone().add(new THREE.Vector3(0, 2, 0)));

  renderer.render(scene, camera);
}

animate();

// RESPONSIVE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});