import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'
import { Engine, Scene, Vector3, HemisphericLight, TransformNode, Color3, ArcRotateCamera, Color4, SceneLoader, Mesh, MeshBuilder } from '@babylonjs/core'

export class App {
  engine: Engine
  scene: Scene

  constructor (readonly canvas: HTMLCanvasElement) {
    // initialize babylon scene and engine
    this.canvas = canvas
    this.engine = new Engine(this.canvas, true)
    this.scene = this.createScene()

    window.addEventListener('resize', () => {
      this.engine.resize()
    })

    window.addEventListener('keydown', (ev) => {
      if (ev.ctrlKey && ev.key === 'i') {
        ev.preventDefault()
        if (this.scene === null) return
        if (this.scene.debugLayer.isVisible()) {
          void this.scene.debugLayer.hide()
        } else {
          void this.scene.debugLayer.show({ overlay: true })
        }
      }
    })
  }

  createScene (): Scene {
    const scene = new Scene(this.engine)
    scene.clearColor = new Color4(0.5, 0.8, 0.5, 1.0)
    scene.ambientColor = new Color3(1, 1, 1)
    return scene
  }

  async createEnvironment (): Promise<Scene> {
    const light: HemisphericLight = new HemisphericLight('light', new Vector3(0, 10, -10), this.scene)
    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.5

    const alpha = Math.PI / 2 + Math.PI
    const beta = Math.PI / 2.5
    const target = new Vector3(0, 1.7, 0)
    const camera = new ArcRotateCamera('Camera', alpha, beta, 5, target, this.scene)
    camera.attachControl(this.canvas, true)

    // // Our built-in 'ground' shape.
    // const ground: Mesh = MeshBuilder.CreateGround('ground', { width: 12, height: 12 }, this.scene)
    // ground.receiveShadows = true
    // ground.checkCollisions = true

    await SceneLoader.ImportMeshAsync(null, '/', 'room.glb', this.scene)
      .then(({ meshes }) => {
        const room = new TransformNode('room')
        // Add collissions and shadows to all meshes
        meshes.forEach((mesh) => {
          mesh.setParent(room)
          mesh.receiveShadows = true
          mesh.checkCollisions = true
        })
        room.position.set(0, -0.5, -2)
      })

    // SceneLoader.ImportMesh('', '/', 'low_poly_forest.glb', scene, (meshes) => {
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

    return this.scene
  }

  run (): void {
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })
  }
}
