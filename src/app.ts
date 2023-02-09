import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'
import { Engine, Scene, Vector3, HemisphericLight, MeshBuilder, Mesh, TransformNode, Color3, ArcRotateCamera, Color4, SceneLoader } from '@babylonjs/core'

export class App {
  engine: Engine
  scene: Scene

  constructor (readonly canvas: HTMLCanvasElement) {
    // initialize babylon scene and engine
    this.canvas = canvas
    this.engine = new Engine(this.canvas, true)
    this.scene = createScene(this.engine, this.canvas)

    window.addEventListener('resize', () => {
      this.engine.resize()
    })

    window.addEventListener('keydown', (ev) => {
      if (ev.ctrlKey && ev.key === 'i') {
        ev.preventDefault()
        if (this.scene.debugLayer.isVisible()) {
          void this.scene.debugLayer.hide()
        } else {
          void this.scene.debugLayer.show({ overlay: true })
        }
      }
    })
  }

  run (): void {
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })
  }
}

function createScene (engine: Engine, canvas: HTMLCanvasElement): Scene {
  // This creates a basic Babylon Scene object (non-mesh)
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.5, 0.8, 0.5, 1.0)
  scene.ambientColor = new Color3(1, 1, 1)

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light: HemisphericLight = new HemisphericLight('light', new Vector3(0, 10, -10), scene)
  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.5
  const alpha = Math.PI / 2 + Math.PI
  const beta = Math.PI / 2.5
  const target = new Vector3(0, 1.7, 0)
  const camera = new ArcRotateCamera('Camera', alpha, beta, 5, target, scene)
  camera.attachControl(canvas, true)

  // Our built-in 'ground' shape.
  // const ground: Mesh = MeshBuilder.CreateGround('ground', { width: 12, height: 12 }, scene)
  // ground.receiveShadows = true
  // ground.checkCollisions = true

  SceneLoader.ImportMesh('', '/public/', 'room.glb', scene, (meshes) => {
    const room = new TransformNode('room')
    // Add collisisions and shadows to all meshes
    meshes.forEach((mesh) => {
      mesh.setParent(room)
    })
    room.position.set(0, -0.5, -2)
    for (const child of room.getChildMeshes()) {
      console.log(child)
      child.receiveShadows = true
      child.checkCollisions = true
    }
  })

  // SceneLoader.ImportMesh('', '/public/', 'low_poly_forest.glb', scene, (meshes) => {
  //   const forest = new TransformNode('forest')
  //   // Add collisisions and shadows to all meshes
  //   meshes.forEach((mesh) => {
  //     mesh.setParent(forest)
  //   })
  //   forest.scaling.set(0.01, 0.01, 0.01)
  //   forest.rotation.y = Math.PI
  //   forest.position.set(0, -15, 25)
  //   for (const child of forest.getChildMeshes()) {
  //     console.log(child)
  //     child.receiveShadows = true
  //     child.checkCollisions = true
  //   }
  // })

  return scene
}
