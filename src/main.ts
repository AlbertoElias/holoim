import { SceneLoader, Vector3, ArcRotateCamera, Mesh, AbstractMesh, MeshBuilder, Plane, StandardMaterial, MirrorTexture, PointLight, Color3, ShadowGenerator, Scene, SceneLoaderAnimationGroupLoadingMode, WebXRState } from '@babylonjs/core'
import { GLTFFileLoader, GLTFLoaderAnimationStartMode } from '@babylonjs/loaders/glTF'
import { CharacterController } from './libs/CharacterController'

import './style.css'
import { App } from './app'
import { Avatar } from './avatar'
import { XR } from './xr'

SceneLoader.RegisterPlugin(new GLTFFileLoader())

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
  const app = new App(canvas)
  const xr = new XR()
  const avatar = new Avatar(app)

  app.createEnvironment()
    .then(async () => {
      app.run()
      window.scene = app.scene
      return await xr.setUp(app.scene)
    })
    .then(async () => {
      return await avatar.load()
    })
    .then((url) => {
      console.log(url)
      SceneLoader.ImportMeshAsync(null, `${url}?meshLod=2&textureAtlas=none&useDracoMeshCompression=true&morphTargets=ARKit`, '', app.scene)
        .then(async ({ meshes }) => {
          console.log(meshes)
          const avatar = meshes[0]
          avatar.checkCollisions = true
          avatar.ellipsoid = new Vector3(0.5, 1, 0.5)
          avatar.ellipsoidOffset = new Vector3(0, 1, 0)
          createMirror(meshes, app.scene)

          const sparklight = new PointLight('sparklight', new Vector3(2, 1, 4), app.scene)
          sparklight.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825)
          sparklight.intensity = 0.1
          sparklight.radius = 3

          const shadowGenerator = new ShadowGenerator(1024, sparklight)
          shadowGenerator.darkness = 0.8
          shadowGenerator.getShadowMap()?.renderList?.push(meshes[1])

          if (avatar.rotationQuaternion !== null) {
            avatar.rotation = avatar.rotationQuaternion.toEulerAngles()
            avatar.rotationQuaternion = null
          }

          // Prevents GLTF animations from auto playing on load
          SceneLoader.OnPluginActivatedObservable.add(function (plugin) {
            if (plugin.name === 'gltf' && plugin instanceof GLTFFileLoader) {
              plugin.animationStartMode = GLTFLoaderAnimationStartMode.NONE
            }
          })

          // Loads the animation groups
          return await SceneLoader.ImportAnimationsAsync('/', 'avatar.glb', app.scene, false, SceneLoaderAnimationGroupLoadingMode.Clean, null)
            .then(() => avatar)
        })
        .then((mesh) => {
          const alpha = Math.PI / 2 + mesh.rotation.y
          const beta = Math.PI / 2.5
          const target = new Vector3(mesh.position.x, mesh.position.y + 1.7, mesh.position.z)
          const camera = new ArcRotateCamera('Camera', alpha, beta, 5, target, app.scene)
          camera.wheelPrecision = 15
          camera.checkCollisions = false
          camera.keysLeft = []
          camera.keysRight = []
          camera.keysUp = []
          camera.keysDown = []
          camera.lowerRadiusLimit = 1.5
          camera.upperRadiusLimit = 20
          camera.attachControl(canvas, false)
          app.scene.activeCamera = camera

          const cc = new CharacterController(mesh as Mesh, [camera, xr.xrHelper?.baseExperience.camera], app.scene, avatar.createAnimationGroups(app.scene.animationGroups), true)
          cc.setNoFirstPerson(false)
          cc.setMode(0)
          cc.setTurningOff(true)
          cc.setCameraTarget(new Vector3(0, 1.7, 0))
          cc.setStepOffset(0.4)
          cc.setSlopeLimit(30, 60)
          cc.enableBlending(0.05)
          cc.setCameraElasticity(false)
          cc.makeObstructionInvisible(true)
          cc.setIdleJumpAnim(null, 0.74, false)
          cc.setRunJumpAnim(null, 0.48, false)
          cc.start()

          // Handle all states
          xr.xrHelper?.baseExperience.onStateChangedObservable.add((state) => {
            switch (state) {
              case WebXRState.NOT_IN_XR:
                // cc.setIsInXR(false)
                break
              case WebXRState.IN_XR:
                // cc.setIsInXR(true)
                // cc.goFirstPerson()
                break
              case WebXRState.EXITING_XR:
                cc.setIsInXR(false)
                cc.setMode(0)
                cc.resumeAnim()
                break
              case WebXRState.ENTERING_XR:
                xr.xrHelper?.baseExperience.camera.setTransformationFromNonVRCamera(camera, true)
                cc.setIsInXR(true)
                cc.goFirstPerson()
                cc.pauseAnim()
                cc.idle()
                cc._skeleton?.returnToRest()
                break
            }
          })
        })
        .catch(console.log)
    })
    .catch(console.log)
})

function createMirror (reflectedMeshes: AbstractMesh[], scene: Scene): void {
  const glass = MeshBuilder.CreatePlane('glass', { width: 2, height: 3 }, scene)
  glass.position = new Vector3(2, 1.2, 8.8)
  // Create reflecting surface for mirror
  const reflector = Plane.FromPositionAndNormal(glass.position, glass.getFacetNormal(0).scale(-1))
  // Create mirror material
  const mirrorTexture = new MirrorTexture('mirror', 4096, scene, true)
  mirrorTexture.mirrorPlane = reflector
  mirrorTexture.level = 0.5
  mirrorTexture.renderList = reflectedMeshes
  // const room = scene.getNodeByName('room')
  // if (room !== null) {
  //   for (const child of room.getChildMeshes()) {
  //     mirrorTexture.renderList.push(child)
  //   }
  // }
  const mirrorMaterial = new StandardMaterial('mirror', scene)
  mirrorMaterial.reflectionTexture = mirrorTexture
  glass.material = mirrorMaterial
}
