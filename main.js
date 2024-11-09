import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('canvas');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-20, 50, -20);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

class Planet {
    constructor(radius, textureName, albedo, x, y, z) {
        const sphere = new THREE.SphereGeometry(radius);
        const texture = new THREE.TextureLoader().load(textureName);
        texture.encoding = THREE.SRGBColorSpace;
        const material = new THREE.MeshStandardMaterial({ 
            map: texture,
            emissive: new THREE.Color(0xffffab),
            emissiveIntensity: albedo,
         });

        this.planet = new THREE.Mesh(sphere, material);
        this.planet.position.set(x, y, z);
        scene.add(this.planet);
    }
    getPlanet() {
        return this.planet;
    }
}

function generateStars(amount, scarcity) {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(500));

    star.position.set(x, y, z);
    scene.add(star);
}

Array(200).fill().forEach(generateStars); // thanks fireship

const sun = new Planet(15, "textures/sun.jpg", 0.75, 1, -5, 1);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

// background

const loader = new THREE.CubeTextureLoader();
const spaceBg = loader.load([
    'textures/skybox/_px.png',
    'textures/skybox/_nx.png',
    'textures/skybox/_py.png',
    'textures/skybox/_ny.png', 
    'textures/skybox/_pz.png', 
    'textures/skybox/_nz.png' 
]);

spaceBg.colorSpace = THREE.SRGBColorSpace;
scene.background = spaceBg;

// RENDERING

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.setPixelRatio(0.7);

camera.position.x = 40;
camera.position.y = 0;
camera.position.z = 40;
camera.lookAt(0,0,0);

// Bloom effect settings
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.9
);
composer.addPass(bloomPass);

function renderBloomedScene() {
    composer.render();
    renderer.clearDepth();
    bloomComposer.render();
}

function animate() {
    requestAnimationFrame(animate);
    renderBloomedScene();
}

const originalSunPosition = {
    x: sun.getPlanet().position.x,
    z: sun.getPlanet().position.z
};

function moveCamera() {
    const t = document.body.getBoundingClientRect().top;

    sun.getPlanet().position.x = originalSunPosition.x + t * 0.05;
    sun.getPlanet().position.z = originalSunPosition.z + t * 0.05;
}
  
document.body.onscroll = moveCamera;
moveCamera();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(animate);
