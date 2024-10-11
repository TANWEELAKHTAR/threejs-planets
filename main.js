import * as THREE from "three";
import gsap from "gsap";
import { RGBELoader } from "three/examples/jsm/Addons.js";
const loader = new RGBELoader();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 9;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const textures = ["mercury.jpg", "earth.jpg", "venus.jpg", "makemakel.jpg"];
const spheres = new THREE.Group();

const starTextureLoader = new THREE.TextureLoader();
const starTexture = starTextureLoader.load("stars.jpg");
const starSphereGeometry = new THREE.SphereGeometry(40, 64, 64);
const starSphereMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  side: THREE.BackSide,
});
const starSphere = new THREE.Mesh(starSphereGeometry, starSphereMaterial);

scene.add(starSphere);

loader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/moonlit_golf_2k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);
const sphereMeshes = [];
for (let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
  spheres.add(sphere);
  sphereMeshes.push(sphere);
  const angle = (i / 4) * Math.PI * 2;
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0;

function throttledWheelHandler(e) {
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttleDelay) {
    lastWheelTime = currentTime;
    scrollCount = (scrollCount + 1) % 4;

    const headings = document.querySelectorAll(".heading");
    gsap.to(headings, {
      y: `-=${100}%`,
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(spheres.rotation, {
      y: `+=${Math.PI / 2}`,
      duration: 1,
      ease: "power2.inOut",
    });
    if (scrollCount === 0) {
      gsap.to(".heading", {
        y: `0`,
        duration: 1,
        ease: "power2.inOut",
      });
    }
  }
}

window.addEventListener("wheel", throttledWheelHandler);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  for (let i = 0; i < sphereMeshes.length; i++) {
    sphereMeshes[i].rotation.y = clock.getElapsedTime() * 0.04;
  }
  starSphere.rotation.y = clock.getElapsedTime() * 0.01;
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
