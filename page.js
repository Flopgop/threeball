import * as THREE from 'three';
//import * as ADDONS from './node_modules/three/examples/jsm/Addons.js';

const width = window.innerWidth, height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(90, width/height, 0.01, 1000);
camera.position.z = 1;

const scene = new THREE.Scene();

const box = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh(box, material);
scene.add(mesh);

const ray = new THREE.BoxGeometry(0.01,0.01, 0.5);

const raymesh = new THREE.Mesh(ray, material);
scene.add(raymesh);

var canvas1 = document.createElement('canvas');
var ctx1 = canvas1.getContext('2d');
ctx1.font = "Bold 10px Arial";
ctx1.fillStyle = "rgba(255,255,255,1)";
ctx1.fillText('Balls!', 0, 60);

var tex = new THREE.Texture(canvas1);
tex.needsUpdate = true;

var material1 = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.DoubleSide
});
material1.transparent = true;

var mesh1 = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 10),
    material1
);
mesh1.position.set(25, 0, -5);
scene.add(mesh1);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
document.body.append(renderer.domElement);

window.addEventListener('resize', (_) => {
    const width = window.innerWidth, height = window.innerHeight;
    renderer.setSize(width,height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
});

window.addEventListener('mousemove', (e) => {
    const x = e.pageX-(window.innerWidth/2), y = e.pageY-(window.innerHeight/2);
    const mousePos = new THREE.Vector3(camera.position.x + (x/width), camera.position.y + -(y/height), camera.position.z);
    const matrix = new THREE.Matrix4();
    matrix.lookAt(mesh.position, mousePos, new THREE.Vector3(0,1,0));
    mesh.matrix.multiply(matrix);
    mesh.rotation.setFromRotationMatrix(matrix);
    raymesh.rotation.setFromRotationMatrix(matrix);
    renderer.render(scene, camera);
});