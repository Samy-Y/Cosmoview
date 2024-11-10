import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('canvas');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-20, 50, -20);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

class Planet {
    constructor(radius, textureName, albedo, color, x, y, z) {
        const sphere = new THREE.SphereGeometry(radius);
        const texture = new THREE.TextureLoader().load(textureName);
        texture.encoding = THREE.SRGBColorSpace;
        const material = new THREE.MeshStandardMaterial({ 
            map: texture,
            emissive: color,
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
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1,
     });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(500));

    star.position.set(x, y, z);
    scene.add(star);
}

Array(200).fill().forEach(generateStars); // thanks fireship

const sun = new Planet(15, "textures/sun.jpg", 1.5, new THREE.Color(0xffffab), 1, -5, 1);
const mercury = new Planet(5, "textures/mercury.png", 0, new THREE.Color(0xffffff), 50, -5, 30);
const venus = new Planet(7, "textures/venus.png", 0, new THREE.Color(0xffffff), 75, -5, 60);

const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(0,-5,0); // Position the light at a distance
sunLight.target = sun.getPlanet(); // Point the light towards the sun

scene.add(sunLight);

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

// Bloom effect settings
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    2.5,
    0.6,
    0.85
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

camera.position.x = 0;
camera.position.y = -5;
camera.position.z = 50;
camera.lookAt(0,-5,0);

const originalCamPosition = {
    x: camera.position.x,
    z: camera.position.z,
};

function moveCamera() {
    const t = document.body.getBoundingClientRect().top;

    camera.position.x = originalCamPosition.x - t * 0.055;
    camera.position.z = originalCamPosition.z - t * 0.045;

    mercury.getPlanet().rotation.y += 0.005;
    venus.getPlanet().rotation.y += 0.005;

}
  
document.body.onscroll = moveCamera;
moveCamera();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(animate);
