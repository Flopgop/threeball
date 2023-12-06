import * as THREE from 'three';
import { RapierPhysics } from './node_modules/three/examples/jsm/physics/RapierPhysics.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';

const width = window.innerWidth, height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(90, width/height, 0.01, 1000);
camera.position.z = 3;

const scene = new THREE.Scene();

const material = new THREE.MeshLambertMaterial();

var canvas1 = document.createElement('canvas');
var ctx1 = canvas1.getContext('2d');
ctx1.font = "Bold 10px Arial";
ctx1.fillStyle = "rgba(255,255,255,1)";
ctx1.fillText('Balls!', 137, 75);

var tex = new THREE.Texture(canvas1);
tex.needsUpdate = true;

var material1 = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.DoubleSide
});
material1.transparent = true;

var mesh1 = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    material1
);
mesh1.position.set(0, 0, -5);
scene.add(mesh1);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
renderer.shadowMap.enabled = true
document.body.append(renderer.domElement);


window.addEventListener('resize', (_) => {
    const width = window.innerWidth, height = window.innerHeight;
    renderer.setSize(width,height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
});

let position = new THREE.Vector3();

// stuff
init();
async function init() {
    const physics = await RapierPhysics();

    const hemiLight = new THREE.HemisphereLight();
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
    dirLight.position.set( 5, 5, 5 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.zoom = 2;
    scene.add( dirLight );
    
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry( 4, 5, 4 ),
        new THREE.MeshLambertMaterial( )
    );
    floor.position.y = -3;
    floor.receiveShadow = true;
    floor.userData.physics = { mass: 0 };
    scene.add( floor );

    const wall1 = new THREE.Mesh(
        new THREE.BoxGeometry( 1, 10, 10 ),
        new THREE.ShadowMaterial( { color: 0x444444 } )
    );
    wall1.position.x = -2
    wall1.userData.physics = { mass: 0 };
    scene.add( wall1 );
    const wall2 = new THREE.Mesh(
        new THREE.BoxGeometry( 1, 10, 10 ),
        new THREE.ShadowMaterial( { color: 0x444444 } )
    );
    wall2.position.x = 2
    wall2.userData.physics = { mass: 0 };
    scene.add( wall2 );
    const wall3 = new THREE.Mesh(
        new THREE.BoxGeometry( 10, 10, 1 ),
        new THREE.ShadowMaterial( { color: 0x444444 } )
    );
    wall3.position.z = 2
    wall3.userData.physics = { mass: 0 };
    scene.add( wall3 );
    const wall4 = new THREE.Mesh(
        new THREE.BoxGeometry( 10, 10, 1 ),
        new THREE.ShadowMaterial( { color: 0x444444 } )
    );
    wall4.position.z = -2
    wall4.userData.physics = { mass: 0 };
    scene.add( wall4 );


    const geometrySphere = new THREE.IcosahedronGeometry( 0.05, 4 );
    const spheres = new THREE.InstancedMesh( geometrySphere, material, 1000 );
    spheres.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
    spheres.castShadow = true;
    spheres.receiveShadow = true;
    spheres.userData.physics = { mass: 1 };
    scene.add( spheres );

    let color = new THREE.Color();
    let matrix = new THREE.Matrix4();
    for ( let i = 0; i < spheres.count; i ++ ) {
        matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
        spheres.setMatrixAt( i, matrix );
        spheres.setColorAt( i, color.setHex( 0xffffff * Math.random() ) );
    }

    physics.addScene( scene );

    const stats = new Stats();
    document.body.appendChild(stats.dom);

    let controls = new OrbitControls( camera, renderer.domElement );
    controls.target.y = 0.5;
    controls.update();

    window.addEventListener('mousedown', (e) => {
        if (e.button != THREE.MOUSE.LEFT) return;
        for ( let i = 0; i < spheres.count; i ++ ) {
            physics.setMeshVelocity(spheres, new THREE.Vector3(Math.random()*10-5, Math.random()*10-5, Math.random()*10-5), i);
        }
    });

    animate();

    setInterval( () => {

        let index = Math.floor( Math.random() * spheres.count );

        position.set( 0, Math.random() + 1, 0 );
        physics.setMeshPosition( spheres, position, index );

        if (Math.random() * 10000 <= 3) {
            for ( let i = 0; i < spheres.count; i ++ ) {
                physics.setMeshVelocity(spheres, new THREE.Vector3(Math.random()*10-5, Math.random()*10-5, Math.random()*10-5), i);
            }
        }

    }, 1000 / 60 );

    
    function animate() {

        requestAnimationFrame( animate );

        renderer.render( scene, camera );

        stats.update();
    }
}