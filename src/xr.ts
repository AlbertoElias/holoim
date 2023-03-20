import { Scene, WebXRDefaultExperience, WebXRAbstractMotionController } from '@babylonjs/core'

export class XR {
  controllers: WebXRAbstractMotionController[] = []
  xrHelper?: WebXRDefaultExperience

  async setUp (scene: Scene): Promise<WebXRDefaultExperience | undefined> {
    // const ground = scene.getMeshByName('ground')
    const ground = scene.getMeshByName('Object_5')
    const groundReflections = scene.getMeshByName('Object_4')
    // const floorMeshes = [ground, groundReflections]
    if (ground === null || groundReflections === null) return
    const xrHelper = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [ground, groundReflections]
    })
    console.log(xrHelper)
    xrHelper.input.onControllerAddedObservable.add((controller) => {
      controller.onMotionControllerInitObservable.add((motionController) => {
        this.controllers.push(motionController)
        console.log(controller)
        console.log(motionController)
      })
    })
    this.xrHelper = xrHelper
    return xrHelper
  }
}
