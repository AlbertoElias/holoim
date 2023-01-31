import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'
import { Engine, Scene, Vector3, HemisphericLight, MeshBuilder, Mesh, PointLight, Color3, ShadowGenerator } from '@babylonjs/core'

export class App {
  engine: Engine
  scene: Scene

  constructor (readonly canvas: HTMLCanvasElement) {
    // initialize babylon scene and engine
    this.canvas = canvas
    this.engine = new Engine(this.canvas, true)
    this.scene = createScene(this.engine)

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

function createScene (engine: Engine): Scene {
  // This creates a basic Babylon Scene object (non-mesh)
  const scene = new Scene(engine)
  scene.ambientColor = new Color3(0.9, 0.4, 0.2)

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light: HemisphericLight = new HemisphericLight('light', new Vector3(0, 10, -5), scene)
  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7

  const sparklight = new PointLight('sparklight', new Vector3(0, 10, 0), scene)
  sparklight.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825)
  sparklight.intensity = 0.5
  sparklight.radius = 1

  const shadowGenerator = new ShadowGenerator(1024, sparklight)
  shadowGenerator.darkness = 0.4

  // Our built-in 'ground' shape.
  const ground: Mesh = MeshBuilder.CreateGround('ground', { width: 12, height: 12 }, scene)
  ground.receiveShadows = true
  ground.checkCollisions = true

  return scene
}
