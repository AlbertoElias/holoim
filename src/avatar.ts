import { Scene, SceneLoader, TransformNode } from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import * as GUI from '@babylonjs/gui'

interface ReadyPlayerMeResponse {
  source: string
  eventName: string
  data: {
    url: string
    id: string
  }
}

export class Avatar {
  hasLoaded: boolean = false
  scene: Scene
  buttonAnchor: TransformNode | null = null

  constructor (scene: Scene) {
    this.scene = scene
    const url = localStorage.getItem('avatar')
    if (url !== null) {
      this.load(url)
    } else {
      this.showButton()
    }
  }

  showIframe (): void {
    const iframe = document.getElementById('iframe') as HTMLIFrameElement
    if (iframe === null) return
    const subdomain = 'holoim'
    iframe.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`
    iframe.style.display = 'block'

    window.addEventListener('message', this.subscribe.bind(this))
    document.addEventListener('message', this.subscribe.bind(this))
  }

  hideIframe (): void {
    const iframe = document.getElementById('iframe')
    if (iframe === null) return
    iframe.style.display = 'none'
  }

  subscribe (event): void {
    const json = parse(event) as ReadyPlayerMeResponse

    if (json?.source !== 'readyplayerme') {
      return
    }

    // Susbribe to all events sent from Ready Player Me once frame is ready
    if (json.eventName === 'v1.frame.ready') {
      const iframe = document.getElementById('iframe') as HTMLIFrameElement
      if (iframe === null) return
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.**'
        }),
        '*'
      )
    }

    // Get avatar GLB URL
    if (json.eventName === 'v1.avatar.exported') {
      this.load(json.data.url)
    }

    // Get user id
    if (json.eventName === 'v1.user.set') {
      console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`)
    }
  }

  showButton (): void {
    if (this.buttonAnchor !== null) {
      this.buttonAnchor.setEnabled(true)
      return
    }

    const anchor = new TransformNode('anchor')
    const manager = new GUI.GUI3DManager(this.scene)
    const button = new GUI.HolographicButton('ReadyPlayerMe')
    manager.addControl(button)
    button.linkToTransformNode(anchor)
    button.position.z = 1.5
    button.position.y = 1
    if (button.node !== null) {
      button.node.rotation.y = Math.PI
    }
    button.text = 'Load Avatar'
    button.onPointerClickObservable.add(() => {
      this.showIframe()
    })
    this.buttonAnchor = anchor
  }

  hideButton (): void {
    if (this.buttonAnchor === null) return
    this.buttonAnchor.setEnabled(false)
  }

  load (url: string): void {
    SceneLoader.Append(url, '', this.scene, () => {
      localStorage.setItem('avatar', url)
      this.hasLoaded = true
      this.hideIframe()
      this.hideButton()
    })
  }
}

function parse (event): object | null {
  try {
    return JSON.parse(event.data)
  } catch (error) {
    return null
  }
}
