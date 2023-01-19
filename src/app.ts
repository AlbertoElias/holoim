import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder } from '@babylonjs/core'

export class App {
  engine: Engine
  scene: Scene

  constructor (readonly canvas: HTMLCanvasElement) {
    // initialize babylon scene and engine
    this.engine = new Engine(canvas, true)
    this.scene = createScene(this.engine, canvas)

    window.addEventListener('resize', () => {
      this.engine.resize()
    })
  }

  debug (debugOn: boolean = true): void {
    if (debugOn) {
      void this.scene.debugLayer.show({ overlay: true })
    } else {
      void this.scene.debugLayer.hide()
    }
  }

  run (): void {
    this.debug(true)
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })
  }
}

function createScene (engine: Engine, canvas: HTMLCanvasElement): Scene {
  // This creates a basic Babylon Scene object (non-mesh)
  const scene = new Scene(engine)

  // This creates and positions a free camera (non-mesh)
  const camera: ArcRotateCamera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 1, 3), scene)
  // This attaches the camera to the canvas
  camera.attachControl(canvas, true)

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light: HemisphericLight = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 1

  // Our built-in 'ground' shape.
  MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene)

  return scene
}
