import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'
import { texture } from 'three/examples/jsm/nodes/Nodes.js'
import gsap from 'gsap'

// GLTF model Variables
var model
var model_roof
var model_roof_rack
var force_bumper_rear
var force_bumper_front
var normal_bumper_front
var normal_bumper_rear
var snorchel_model




var is_secondary_color_added = false
var is_roof_added = false
var controller_secondary_color


const gui = new GUI()




// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const exrLoader = new EXRLoader()
exrLoader.load('environment/forest.exr', (environmentMap) => {
    console.log(environmentMap)
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = new THREE.Color(0xF8F9F9)
    
    scene.environment = environmentMap
    scene.environmentIntensity = 1.5
    scene.environmentRotation.y = 3
})
/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
//Load BASE CAR
gltfLoader.load(
    '/models/Uaz/base_buchanka.glb',
    (gltf) => {
        gltf.scene.scale.set(1, 1, 1)

        model = gltf.scene
        model.name = "base_car"

        

        console.log(model.name)

        model.traverse((obj) => {
            if (obj.castShadow !== undefined) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          })
        


        model.position.setX(0)
        scene.add(model)
        console.log(scene.children[1])
        for (let child in scene.children[1].children){
            console.log(child.name)
        }


        normal_bumper_rear = scene.children[1].children[192] // rear bumper_normal
        normal_bumper_front = scene.children[1].children[191] // front bumper_normal
        model_roof_rack = scene.children[1].children[193] // roof rack
        force_bumper_front = scene.children[1].children[194] // force bumper front
        force_bumper_rear = scene.children[1].children[195] // force bumper rear
        snorchel_model = scene.children[1].children[196] // snorchel


        console.log(scene.children[1].children[192].name) // rear bumper_normal
        console.log(scene.children[1].children[191].name) // front bumper_normal
        console.log(scene.children[1].children[193].name) // roof rack
        console.log(scene.children[1].children[194].name) // force bumper front
        console.log(scene.children[1].children[195].name) // force bumper rear
        console.log(scene.children[1].children[196].name) // snorchel

        scene.children[1].children[193].visible = false
        scene.children[1].children[194].visible = false  
        scene.children[1].children[195].visible = false  
        scene.children[1].children[196].visible = false  


        
        


        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        ; // Object
    }
)
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
// Base camera + camera helper
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 8, 2)


scene.add(camera)


// GUI
const UazObject = {
    roof_rack: false,
    roof: 'Standard',
    bumpers: 'Standard',
    two_tone_paint: false,
    primary: '0x1e241c',
    secondary:'0x1e241c',
    snorchel: false
};

// GUI Controllers
var roof_controller 
var roof_rack_controller
var snorchel_controller
var bumper_controller



//GUI
gui.title( 'Buchanka' )
roof_controller = gui.add(UazObject, 'roof', { "Standard": 0, "High roof": 1, "Folding roof": 2 })
bumper_controller = gui.add(UazObject, 'bumpers', { "Standard": 0, "Force": 1})
roof_rack_controller = gui.add(UazObject, 'roof_rack')
gui.add(UazObject, 'two_tone_paint')
snorchel_controller = gui.add(UazObject, 'snorchel')
gui.addColor(UazObject, 'primary')


// add conditional controls



// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true
controls.screenSpacePanning = false
controls.minDistance = 4 // Zoom min
controls.maxDistance = 8 // Zoom max
controls.rotateSpeed = 0.5
controls.panSpeed = 0
controls.minPolarAngle = 0
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas

})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0



// rotate models
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 65: // A
            model.rotation.y -= 0.05
            model_roof.rotation.y -= 0.05
            
            break;
        case 68: // D
            //model.rotation.y += 0.05;
            model.rotation.y += 0.05
            model_roof.rotation.y += 0.05
            
            break;
    }
});


UazObject.roof = 0

 

var current_roof
var previous_roof = 0

roof_rack_controller.onChange( function( v ) {   
    if (v == false){
            model_roof_rack.visible = false
        }
        if (v == true){
            model_roof_rack.visible = true
        }} 

)

bumper_controller.onChange(
    function(input){
        if (input == 0){ // add normal bumper
            normal_bumper_rear.visible = true
            normal_bumper_front.visible = true 
            force_bumper_front.visible = false     
            force_bumper_rear.visible = false
        }
        if (input == 1){ // add force bumper
            //hide normal bumpers
            normal_bumper_front.visible = false
            normal_bumper_rear.visible = false
            force_bumper_front.visible = true
            force_bumper_rear.visible = true
        }
    }
)
roof_controller.onChange(
    function(input){
        if (input == 0){
            roof_rack_controller.enable()
            
        }
        if(input == 1){
            roof_rack_controller.disable()
            scene.children[1].children[193].visible = false
        }
        if(input == 2){
            roof_rack_controller.disable()
            scene.children[1].children[193].visible = false
        }
    }
)
snorchel_controller.onChange(
    function(input){
        if(input == false){
            snorchel_model.visible = false
        }
        if(input == true){
            snorchel_model.visible = true
        }
    }
)


const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    var primary_color = UazObject.primary
    var secondary_color = UazObject.secondary
    


   
    
    if (UazObject.two_tone_paint == false){
        secondary_color = primary_color
    } 


    primary_color = primary_color.replace("#", "0x")
    secondary_color = secondary_color.replace("#", "0x")



    //select the car and change colors by color picker
    model = scene.getObjectByName('base_car')
    
    
    scene.traverse( function( object ) {

        if ( object.isMesh ) {
            if (object.material.name == "Paint_upper"){
                
                object.material.color.setHex(primary_color) //hex has to be in this format! 0x1A75FF
                object.material.metalness = 1
            }
            if (object.material.name == "Paint_lower"){
                object.material.color.setHex(secondary_color)
                object.material.metalness = 1
            }
            
        }
    
    } );

    // Model animation
    if (mixer) {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    if (UazObject.two_tone_paint == true && is_secondary_color_added == false) {
        controller_secondary_color = gui.addColor(UazObject, 'secondary')
        is_secondary_color_added = true
    }
    if (UazObject.two_tone_paint == false && is_secondary_color_added == true) {
        controller_secondary_color.hide()
        is_secondary_color_added = false
    }
    current_roof = UazObject.roof

    switch(current_roof){
        case 0: //Standard roof
            scene.traverse((obj) => {
                if (obj.name == "folding_roof_unfolded" || obj.name == "high_roof") {
                scene.remove(obj)
                }
            })
            break
        case 1: // add High roof
            if(is_roof_added == false){
            
                 
                gltfLoader.load(
                    '/models/Uaz/highroof.glb',
                    (gltf) => {
                        gltf.scene.scale.set(1, 1, 1)
                        model_roof = gltf.scene
                        model_roof.name = "high_roof"
                        model_roof.rotation.y = model.rotation.y
                        scene.add(model_roof)
                        
                    }
                )
                previous_roof = current_roof    
            }
            // remove folding roof
            if(is_roof_added == true && current_roof != previous_roof){
                scene.traverse((obj) => {
                    if (obj.name == "folding_roof_unfolded") {
                      scene.remove(obj)
                    }
                  })
                gltfLoader.load(
                    '/models/Uaz/highroof.glb',
                    (gltf) => {
                        gltf.scene.scale.set(1, 1, 1)
                        model_roof = gltf.scene
                        model_roof.name = "high_roof"
                        model_roof.rotation.y = model.rotation.y
                        scene.add(model_roof)
                        
                    }
                )
                previous_roof = current_roof 
            }
            is_roof_added = true
            
            break
        case 2: // Folding roof
            if(is_roof_added == false){
                // remove folding roof
                    
                    gltfLoader.load(
                        '/models/Uaz/foldingroof.glb',
                        (gltf) => {
                            gltf.scene.scale.set(1, 1, 1)
                            model_roof = gltf.scene
                            model_roof.name = "folding_roof_unfolded"
                            model_roof.rotation.y = model.rotation.y
                            scene.add(model_roof)
                            
                        }
                    )
                    previous_roof = current_roof    
                }
                if(is_roof_added == true && current_roof != previous_roof){
                    scene.traverse((obj) => {
                        if (obj.name == "high_roof") {
                          scene.remove(obj)
                        }
                      })  
                    gltfLoader.load(
                        '/models/Uaz/foldingroof.glb',
                        (gltf) => {
                            gltf.scene.scale.set(1, 1, 1)
                            model_roof = gltf.scene
                            model_roof.name = "folding_roof_unfolded"
                            model_roof.rotation.y = model.rotation.y
                            scene.add(model_roof)
                            
                        }
                    )
                    previous_roof = current_roof 
                }
                is_roof_added = true
                
                break
    }




    
    
    // Render
    renderer.render(scene, camera)
    camera.lookAt(0, 10, 0); // Fix camera to vehicle
    if (camera.position.y < 1.2) {  // To prevent camera from going lower than desired
        camera.position.y = 1.2;
    }
    if (camera.position.y > 3.2) {  // To prevent camera from going lower than desired
        camera.position.y = 3.2;
    }

    controls.target.set(0, 0, 0);
    controls.update();
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

