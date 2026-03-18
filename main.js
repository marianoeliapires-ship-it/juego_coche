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
  1000
);

// RENDER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LUCES
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// SUELO
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x228b22 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// CARRETERA
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

const road1 = new THREE.Mesh(
  new THREE.BoxGeometry(20, 0.1, 100),
  roadMaterial
);
scene.add(road1);

const curve = new THREE.Mesh(
  new THREE.BoxGeometry(20, 0.1, 50),
  roadMaterial
);
curve.position.set(25, 0, -25);
curve.rotation.y = Math.PI / 4;
scene.add(curve);

const road2 = new THREE.Mesh(
  new THREE.BoxGeometry(20, 0.1, 80),
  roadMaterial
);
road2.position.set(50, 0, -60);
road2.rotation.y = Math.PI / 4;
scene.add(road2);

// 🚗 GRUPO DEL COCHE
let carGroup = new THREE.Group();
scene.add(carGroup);

let car;
let speed = 0;

// CONFIG
let maxSpeed = 0.5;
let acceleration = 0.01;
let deceleration = 0.02;
let turnSpeed = 0.04;

// CARGAR MODELO
const loader = new GLTFLoader();
loader.load('/car.glb', function (gltf) {
  car = gltf.scene;

  car.scale.set(3, 3, 3);
  car.position.y = 0.5;

  car.rotation.y = Math.PI / 2;

  carGroup.add(car);
});

// CONTROLES
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ANIMACIÓN
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

  // 🎥 CÁMARA MÁS LEJOS (AQUÍ EL CAMBIO)
  const offset = new THREE.Vector3(0, 7, -20);
  offset.applyMatrix4(carGroup.matrixWorld);

  camera.position.lerp(offset, 0.08);

  const lookAt = new THREE.Vector3(0, 2, 5);
  lookAt.applyMatrix4(carGroup.matrixWorld);

  camera.lookAt(lookAt);

  renderer.render(scene, camera);
}

animate();

// RESPONSIVE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});