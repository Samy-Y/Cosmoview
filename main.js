import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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
        texture.colorSpace = THREE.SRGBColorSpace;
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
        .map(() => THREE.MathUtils.randFloatSpread(1000));

    star.position.set(x, y, z);
    scene.add(star);
}

Array(200).fill().forEach(generateStars); // thanks fireship

const sun = new Planet(15, "textures/sun.jpg", 6, new THREE.Color(0xffffab), 1, -5, 1);
const mercury = new Planet(5, "textures/mercury.png", 0, new THREE.Color(0xffffff), 50, -5, 30);
const venus = new Planet(7, "textures/venus.png", 0, new THREE.Color(0xffffff), 90, -5, 60);
const earth = new Planet(7, "textures/earth.jpg", 0, new THREE.Color(0xffffff), 140, -5, 110);
const mars = new Planet(6, "textures/mars.jpg", 0, new THREE.Color(0xffffff), 190, -5, 140);
const jupiter = new Planet(10, "textures/jupiter.jpg", 0, new THREE.Color(0xffffff), 220, -5, 200);
const saturn = new Planet(9, "textures/saturn.jpg", 0, new THREE.Color(0xffffff), 270, -5, 230);

function createSaturnRings() {
    const ringTexture = new THREE.TextureLoader().load('textures/saturn_rings.png');
    ringTexture.colorSpace = THREE.SRGBColorSpace;

    const innerRadius = 30;
    const outerRadius = 14;
    const segments = 64;

    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);

    // Correct UV mapping
    const pos = ringGeometry.attributes.position;
    const v3 = new THREE.Vector3();
    const uv = ringGeometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        uv.setXY(
            i,
            (v3.x / outerRadius + 1) / 2,
            (v3.y / outerRadius + 1) / 2
        );
    }

    const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(saturn.getPlanet().position);
    scene.add(ring);

    // Rotate the rings with Saturn
    saturn.ring = ring;
}
createSaturnRings();

const uranus = new Planet(8, "textures/uranus.jpg", 0, new THREE.Color(0xffffff), 305, -5, 260);
uranus.getPlanet().rotation.z = THREE.MathUtils.degToRad(98);
const neptune = new Planet(7, "textures/neptune.jpg", 0, new THREE.Color(0xffffff), 350, -5, 300);

const sunLight = new THREE.DirectionalLight(0xffffff, 5);
sunLight.castShadow = true;
sunLight.position.set(0,-5,0); // Position the light at a distance
sunLight.target = sun.getPlanet(); // Point the light towards the sun

const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
scene.add(ambientLight);

scene.add(sunLight);

// background

//const loader = new THREE.CubeTextureLoader();
//const spaceBg = loader.load([
//    'textures/skybox/_px.png',
//    'textures/skybox/_nx.png',
//    'textures/skybox/_py.png',
//    'textures/skybox/_ny.png', 
//    'textures/skybox/_pz.png', 
//    'textures/skybox/_nz.png' 
//]);

//spaceBg.colorSpace = THREE.SRGBColorSpace;
//scene.background = spaceBg;

// RENDERING

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.setPixelRatio(1);

// Bloom effect settings
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.6,
    1.5
);
composer.addPass(bloomPass);

function animate() {
    composer.render();
    renderer.clearDepth();
}

camera.position.x = 0;
camera.position.y = 0;
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

    mercury.getPlanet().rotation.y += 0.001;
    venus.getPlanet().rotation.y -= 0.001;
    earth.getPlanet().rotation.y += 0.005;
    mars.getPlanet().rotation.y += 0.005;
    jupiter.getPlanet().rotation.y += 0.01;
    saturn.getPlanet().rotation.y += 0.01;
    uranus.getPlanet().rotation.x += 0.01;
    neptune.getPlanet().rotation.y += 0.01;
}
  
document.body.onscroll = moveCamera;
moveCamera();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(animate);
