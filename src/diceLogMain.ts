import './app.css'
import DiceLogApp from './DiceLogApp.svelte'

const app = new DiceLogApp({
  target: document.getElementById('app'),
})

export default app
