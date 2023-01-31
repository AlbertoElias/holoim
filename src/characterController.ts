import { TransformNode, Scene, Mesh, ShadowGenerator, UniversalCamera, Vector3 } from '@babylonjs/core'

export class Player extends TransformNode {
  public camera
  public scene: Scene
  private _input

  public mesh: Mesh // outer collisionbox of player

  private _camRoot: TransformNode | undefined

  constructor (mesh, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
    super('player', scene)
    this.scene = scene
    this._setupPlayerCamera()

    this.mesh = mesh
    this.mesh.parent = this

    shadowGenerator.addShadowCaster(mesh)

    this._input = input // inputs we will get from inputController.ts
  }

  private _setupPlayerCamera (): UniversalCamera {
    // root camera parent that handles positioning of the camera to follow the player
    this._camRoot = new TransformNode('root')
    this._camRoot.position = new Vector3(0, 0, 0)
    // to face the player from behind (180 degrees)
    // this._camRoot.rotation = new Vector3(0, Math.PI, 0)

    // our actual camera that's pointing at our root's position
    // this.camera = new UniversalCamera('Camera', new Vector3(0, 0, 0), this.scene)
    // this.camera.attachControl(canvas, true)
    // this.camera.lockedTarget = this._camRoot.position
    // this.camera.fov = 0.47350045992678597
    // this.camera.parent = this._camRoot

    // this.scene.activeCamera = this.camera
    return this.camera
  }

  private _updateCamera (): void {
    const centerPlayer = this.mesh.position.y + 2
    if (this._camRoot === undefined) return
    // this._camRoot.position = Vector3.Lerp(this._camRoot.position, new Vector3(this.mesh.position.x, centerPlayer, this.mesh.position.z), 0.4)
  }

  activatePlayerCamera (): UniversalCamera {
    this.scene.registerBeforeRender(() => {
      // this._beforeRenderUpdate();
      this._updateCamera()
    })
    return this.camera
  }
}
