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

// UI
const ui = document.createElement('div');
ui.style.position = 'absolute';
ui.style.top = '20px';
ui.style.left = '20px';
ui.style.color = 'white';
ui.style.fontSize = '22px';
ui.style.background = 'rgba(0,0,0,0.4)';
ui.style.padding = '10px';
ui.style.borderRadius = '10px';
document.body.appendChild(ui);

// BOTÓN
const button = document.createElement('button');
button.innerText = "Reiniciar";
button.style.position = 'absolute';
button.style.top = '80px';
button.style.left = '20px';
button.style.padding = '10px';
button.style.border = 'none';
button.style.borderRadius = '8px';
button.style.background = '#ff4444';
button.style.color = 'white';
button.style.cursor = 'pointer';
document.body.appendChild(button);

// LUCES
scene.add(new THREE.AmbientLight(0xffffff, 1));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(50, 100, 50);
scene.add(light);

// COCHE
let carGroup = new THREE.Group();
scene.add(carGroup);

let carVisual = new THREE.Group();
carGroup.add(carVisual);

let speed = 0;
let drift = 0;

const loader = new GLTFLoader();

// 🚗 COCHE
loader.load('public/car.glb', (gltf) => {
  const car = gltf.scene;
  car.scale.set(2, 2, 2);
  car.position.y = 1;
  car.rotation.y = -Math.PI / 2;
  carVisual.add(car);
});

// 🛣️ TRACK
loader.load('public/track.glb', (gltf) => {
  const track = gltf.scene;
  track.scale.set(5, 5, 5);
  scene.add(track);
});

// 🚦 SEMÁFORO
loader.load('public/traffic.glb', (gltf) => {
  const traffic = gltf.scene;
  traffic.scale.set(0.12, 0.12, 0.12);
  traffic.position.set(2, 0, -2);
  traffic.rotation.y = Math.PI / 2;
  scene.add(traffic);
});

// LÍNEA
const startZ = -2;

const finishLine = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 0.4),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);

finishLine.rotation.x = -Math.PI / 2;
finishLine.position.set(0, 0.05, startZ);
scene.add(finishLine);

// META
const finishBox = new THREE.Box3(
  new THREE.Vector3(-2, 0, startZ - 1),
  new THREE.Vector3(2, 5, startZ + 1)
);

// POSICIÓN INICIAL
carGroup.position.set(0, 0, 0);

// VARIABLES
let laps = 0;
let canCountLap = true;
let startTime = null;
let finalTime = null;

// CONTROLES
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// RESET
button.onclick = () => {
  laps = 0;
  startTime = null;
  finalTime = null;
  carGroup.position.set(0, 0, 0);
  speed = 0;
};

// LOOP
function animate() {
  requestAnimationFrame(animate);

  if (keys['arrowup']) speed += 0.01;
  if (keys['arrowdown']) speed -= 0.01;

  speed *= 0.95;

  if (keys['arrowleft']) drift += 0.002;
  if (keys['arrowright']) drift -= 0.002;

  drift *= 0.95;

  carGroup.rotation.y += drift * 2;

  carGroup.position.x += Math.sin(carGroup.rotation.y) * speed;
  carGroup.position.z += Math.cos(carGroup.rotation.y) * speed;

  if (startTime === null && Math.abs(speed) > 0.01) {
    startTime = Date.now();
  }

  if (finishBox.containsPoint(carGroup.position)) {
    if (canCountLap) {
      laps++;
      canCountLap = false;

      if (laps === 3 && finalTime === null && startTime !== null) {
        finalTime = Math.floor((Date.now() - startTime) / 1000);
      }
    }
  } else {
    canCountLap = true;
  }

  if (finalTime === null) {
    let t = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    ui.innerText = `Vuelta: ${laps} | Tiempo: ${t}s`;
  } else {
    ui.innerText = `🏆 GANASTE en ${finalTime}s`;
  }

  const offset = new THREE.Vector3(0, 16, -32);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carGroup.rotation.y);

  camera.position.lerp(carGroup.position.clone().add(offset), 0.08);
  camera.lookAt(carGroup.position);

  renderer.render(scene, camera);
}

animate();

// RESPONSIVE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});