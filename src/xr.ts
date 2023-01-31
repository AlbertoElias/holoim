import { Scene } from '@babylonjs/core'

export class XR {
  async setUp (scene: Scene): Promise<T> {
    const ground = scene.getMeshByName('ground')
    if (ground == null) return
    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [ground]
    })
    xr.input.onControllerAddedObservable.add((controller) => {
      controller.onMotionControllerInitObservable.add((motionController) => {
        console.log(motionController)
      })
    })
  }
}
