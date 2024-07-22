import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';
import { color } from 'three/examples/jsm/nodes/Nodes.js'
// grounded skybox 

/**
 * GLTF Loader
*/

const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const rgbLoader = new RGBELoader()
const textureLoader = new THREE.TextureLoader()

/* Models */
gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        console.log('success')
        console.log(gltf)

        gltf.scene.scale.set(10, 10, 10)
        scene.add(gltf.scene)
    },
    (progress) => {
        console.log('progress')
        console.log(progress)
    },
    (error) => {
        console.log('error')
        console.log(error)
    }
)

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/* Env Map */
// LDR Textures
/* const envMap = cubeTextureLoader.load([
    '/environmentMaps/0/px.png',
    '/environmentMaps/0/nx.png',
    '/environmentMaps/0/py.png',
    '/environmentMaps/0/ny.png',
    '/environmentMaps/0/pz.png',
    '/environmentMaps/0/nz.png'
])

scene.background = envMap
scene.environment = envMap */

// HDR (RGBE) Textures
const envMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg', () => {
    // Render the scene

    envMap.mapping = THREE.EquirectangularReflectionMapping;
    envMap.encoding = THREE.SRGBColorSpace
    scene.background = envMap




    /*   const skybox = new GroundedSkybox(envMap, 15, 70)
  
      skybox.position.y = 15
      scene.add(skybox) */
})





/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({
        metalness: 0.9,
        roughness: 0.0,
        envMap: envMap
    })
)

torusKnot.position.x = -4
torusKnot.position.y = 4



scene.add(torusKnot)


// Holy donut

const donut = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.5),
    new THREE.MeshBasicMaterial({
        color: new THREE.Color(10, 4, 2),
    })
)

donut.layers.enable(1)
donut.position.y = 3.5

scene.add(donut)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

/* 
  GUI Debbuger
*/

scene.environmentIntensity = 1
scene.backgroundBlurriness = 0
scene.backgroundIntensity = 1

gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001).name('Environment Intensity')
gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001).name('Background Blurriness')
gui.add(scene, 'backgroundIntensity').min(0).max(1).step(0.001).name('Background Intensity')

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Cube Render Targe
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    type: THREE.HalfFloatType

})

scene.environment = cubeRenderTarget.texture

// cube camera
const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget)


/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
    // Time
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()


    // rotate holy donut
    donut.rotation.y = elapsedTime * 1.2
    cubeCamera.update(renderer, scene)
    // Update the skybox

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()