import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/* GLTF Loader */
const gltfLoader = new GLTFLoader()

let glft;

gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf2) => {
        console.log('success')
        console.log(gltf2)

        gltf2.scene.scale.set(0.025, 0.025, 0.025)
        scene.add(gltf2.scene)

        glft = gltf2
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

/* Lights */

const ambientLight = new THREE.AmbientLight(0xffffff,1)

scene.add(ambientLight)

/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, /* object2, */ object3)


/* 
    Raycaster
*/

object1.updateMatrixWorld()
object2.updateMatrixWorld()
object3.updateMatrixWorld()
const raycaster = new THREE.Raycaster()

const rayOrigin = new THREE.Vector3(-3, 0, 0)
const rayDirection = new THREE.Vector3(1, 0, 0)

rayDirection.normalize()

raycaster.set(rayOrigin, rayDirection)

const intersect = raycaster.intersectObject(object2)
console.log(intersect)

const intersects = raycaster.intersectObjects([object1, object2, object3])
console.log(intersects)


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


// Mouse
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1

    console.log(mouse)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

// Arrow helper
const arrowHelper = new THREE.ArrowHelper(rayDirection, rayOrigin, 7, '#ff0000')

scene.add(arrowHelper)

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Update objects
    object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
    object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

    // Cast a ray

    /* rayDirection.normalize()

    raycaster.set(rayOrigin, rayDirection)

    const intersects = raycaster.intersectObjects([object1, object2, object3])

    object1.material.color.set('#ff0000')
    object2.material.color.set('#ff0000')
    object3.material.color.set('#ff0000')
    for (const intersect of intersects) {
        intersect.object.material.color.set('#0000ff')
    } */


    // Mouse 

    raycaster.setFromCamera(mouse, camera)

    const objectsToTest = [object1, object2, object3]
    const intersectsMouse = raycaster.intersectObjects(objectsToTest)
    object1.material.color.set('#ff0000')
    object2.material.color.set('#ff0000')
    object3.material.color.set('#ff0000')
    for (const intersect of intersectsMouse) {
        intersect.object.material.color.set('#0000ff')
    }

    // Test intersects with gltf object
    if (glft) {
        glft.scene.updateMatrixWorld()
        glft.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                /// set default color
                child.material.color.set('#FFFFFF')
            }
        })
        const intersectsMouse = raycaster.intersectObject(glft.scene, true)
        for (const intersect of intersectsMouse) {
            intersect.object.material.color.set('#0000ff')
        }
    }



    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()