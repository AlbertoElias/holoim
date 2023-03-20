import { AnimationGroup, TransformNode } from '@babylonjs/core'
import * as GUI from '@babylonjs/gui'
import { App } from './app'

interface ReadyPlayerMeResponse {
  source: string
  eventName: string
  data: {
    url: string
    id: string
  }
}

interface AnimationGroupObject {
  [key: string]: AnimationGroup
}

export class Avatar {
  app: App
  url: string | null = null
  hasLoaded: Function = () => {}
  waitForRPM: Promise<string>
  buttonAnchor: TransformNode | null = null

  constructor (app: App) {
    this.app = app
    this.waitForRPM = new Promise((resolve) => {
      this.hasLoaded = resolve
    })
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
      this.save(json.data.url)
      this.hideIframe()
      this.hideButton()
      this.hasLoaded(json.data.url)
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
    const manager = new GUI.GUI3DManager(this.app.scene)
    const button = new GUI.HolographicButton('ReadyPlayerMe')
    manager.addControl(button)
    button.linkToTransformNode(anchor)
    button.position.z = 1.5
    button.position.y = 1
    button.text = 'Load Avatar'
    button.onPointerClickObservable.add(() => {
      this.showIframe()
    })
    button.onPointerEnterObservable.add(() => {
      document.body.style.cursor = 'pointer'
    })
    button.onPointerOutObservable.add(() => {
      document.body.style.cursor = ''
    })
    this.buttonAnchor = anchor
  }

  hideButton (): void {
    if (this.buttonAnchor === null) return
    this.buttonAnchor.setEnabled(false)
  }

  save (url: string): void {
    localStorage.setItem('avatar', url)
  }

  async load (): Promise<string> {
    const url = localStorage.getItem('avatar')
    if (url !== null) {
      this.save(url)
      this.hasLoaded(url)
    } else {
      this.showButton()
    }
    return await this.waitForRPM
  }

  // Creates AnimationGroup objects
  createAnimationGroups (aG: AnimationGroup[]): AnimationGroupObject {
    return {
      fall: aG[0],
      idle: aG[1],
      idleJump: aG[2],
      run: aG[3],
      runJump: aG[4],
      strafeLeft: aG[5],
      strafeRight: aG[6],
      walk: aG[7],
      walkBack: aG[8],
      walkBackFast: aG[9]
    }
  }
}

function parse (event): object | null {
  try {
    return JSON.parse(event.data)
  } catch (error) {
    return null
  }
}
