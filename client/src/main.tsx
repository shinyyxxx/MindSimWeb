import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element "#root" not found')
}
const rootContainer: HTMLElement = rootEl

async function setupIwer(): Promise<void> {
  const hasNativeWebXR = typeof navigator !== 'undefined' && 'xr' in navigator
  if (!import.meta.env.DEV || hasNativeWebXR) {
    return
  }

  const { XRDevice, metaQuest3 } = await import('iwer')
  const { DevUI } = await import('@iwer/devui')
  const xrDevice = new XRDevice(metaQuest3)
  xrDevice.installRuntime()

  const existingDevUI = document.querySelector('[data-mindsim-iwer-devui="true"]')
  if (existingDevUI) {
    return
  }

  const devui = new DevUI(xrDevice)
  devui.devUIContainer.setAttribute('data-mindsim-iwer-devui', 'true')
  devui.devUIContainer.style.zIndex = '9999'
  document.body.appendChild(devui.devUIContainer)

  const renderDevUI = (time: number) => {
    devui.render(time)
    requestAnimationFrame(renderDevUI)
  }
  requestAnimationFrame(renderDevUI)
}

function renderApp(): void {
  createRoot(rootContainer).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

void setupIwer()
  .catch((error) => {
    console.warn('IWER setup failed, continuing without emulator.', error)
  })
  .finally(() => {
    renderApp()
  })







