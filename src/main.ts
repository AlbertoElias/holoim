

import './style.css'
import { App } from './app'
import { Avatar } from './avatar'

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
  const app = new App(canvas)
  app.run()

  const avatar = new Avatar(app.scene)
})
