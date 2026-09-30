import { useEffect, useState } from 'react'

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

let webglSupport

function readProfile() {
  const nav = navigator
  const cores = nav.hardwareConcurrency || 8
  const memory = nav.deviceMemory || 8
  webglSupport ??= detectWebGL()
  const profile = {
    isMobile: window.matchMedia('(max-width: 767px)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: !!nav.connection?.saveData,
    lowPower: cores <= 4 || memory <= 4,
    finePointer: window.matchMedia('(pointer: fine)').matches,
    webgl: webglSupport,
  }
  /**
   * Qualidade do 3D:
   *  - 'full'   → desktop com GPU razoável
   *  - 'lite'   → celulares / aparelhos modestos (DPR menor, menos efeitos)
   *  - 'poster' → sem WebGL ou modo economia de dados (imagem estática)
   */
  profile.quality =
    !profile.webgl || profile.saveData ? 'poster' : profile.isMobile || profile.lowPower ? 'lite' : 'full'
  return profile
}

/**
 * Perfil do dispositivo. Retorna `null` na renderização do servidor e no
 * primeiro render do cliente (evita divergência de hidratação); o valor
 * real chega logo em seguida, no efeito.
 */
export function useDeviceProfile() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const update = () => setProfile(readProfile())
    update()
    const queries = ['(max-width: 767px)', '(prefers-reduced-motion: reduce)'].map((q) => window.matchMedia(q))
    queries.forEach((q) => q.addEventListener('change', update))
    return () => queries.forEach((q) => q.removeEventListener('change', update))
  }, [])

  return profile
}
