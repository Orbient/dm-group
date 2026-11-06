import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Tier } from '../lib/perf'

/**
 * Procedural staircase that assembles itself as `progress` goes 0 → 1:
 * blueprint lines → concrete steps rise → oak treads drop → glass slides up → LEDs glow.
 */
const STEPS = 13
const RUN = 0.3
const RISE = 0.19
const WIDTH = 1.05

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
// per-item window inside a phase, so items arrive one after another
const stagger = (p: number, i: number, n: number, spread = 0.55) => {
  const start = (i / n) * spread
  return clamp01((p - start) / (1 - spread))
}

function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const cv = document.createElement('canvas')
  cv.width = w; cv.height = h
  draw(cv.getContext('2d')!)
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function oakTexture() {
  return canvasTexture(512, 128, (c) => {
    c.fillStyle = '#8a6844'; c.fillRect(0, 0, 512, 128)
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * 128
      c.strokeStyle = `rgba(${Math.random() > 0.5 ? '30,18,10' : '150,104,62'},${0.12 + Math.random() * 0.25})`
      c.lineWidth = 0.5 + Math.random() * 2.2
      c.beginPath(); c.moveTo(0, y)
      for (let x = 0; x <= 512; x += 32) c.lineTo(x, y + Math.sin(x * 0.012 + i) * 3 + (Math.random() - 0.5) * 1.5)
      c.stroke()
    }
  })
}

function concreteTexture() {
  return canvasTexture(256, 256, (c) => {
    c.fillStyle = '#7a7672'; c.fillRect(0, 0, 256, 256)
    const img = c.getImageData(0, 0, 256, 256)
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 34
      img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n
    }
    c.putImageData(img, 0, 0)
    for (let i = 0; i < 40; i++) {
      c.fillStyle = `rgba(40,38,36,${Math.random() * 0.25})`
      c.beginPath(); c.arc(Math.random() * 256, Math.random() * 256, Math.random() * 2.2, 0, Math.PI * 2); c.fill()
    }
  })
}

export type StairScene = { setProgress: (p: number) => void; setPointer: (x: number, y: number) => void; setQuality: (t: Tier) => void; resize: () => void; dispose: () => void }

const DPR: Record<Tier, number> = { high: 1.5, mid: 1.15, low: 0.9 }

export function createStairScene(canvas: HTMLCanvasElement, opts: { tier: Tier }): StairScene {
  const high = opts.tier === 'high'
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: high, alpha: true, stencil: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR[opts.tier]))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = high
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x080706, 9, 19)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  scene.environmentIntensity = 0.35

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)

  // ---------- lights: one warm key from above, a cold rim, almost no fill ----------
  scene.add(new THREE.HemisphereLight(0x9a948c, 0x0a0a0a, 0.45))
  const key = new THREE.SpotLight(0xffe0bb, 90, 20, 0.62, 0.7, 1.5)
  key.position.set(-1.2, 6.8, 3.6)
  key.target.position.set(0, 1.0, 0)
  key.castShadow = true
  key.shadow.mapSize.set(768, 768)
  key.shadow.bias = -0.0004
  scene.add(key, key.target)
  const rim = new THREE.DirectionalLight(0x9fb4d6, 0.9)
  rim.position.set(-3, 3, -4)
  const fill = new THREE.DirectionalLight(0xffe6cc, 0.35)
  fill.position.set(4, 2, 6)
  scene.add(fill)
  scene.add(rim)

  // ---------- room: floor + wall the stair is anchored to ----------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.85 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.95, map: concreteTexture() })
  wallMat.map!.wrapS = wallMat.map!.wrapT = THREE.RepeatWrapping
  wallMat.map!.repeat.set(16, 6)
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), wallMat)
  wall.position.set(0, 7, -WIDTH / 2 - 0.002)
  wall.receiveShadow = true
  scene.add(wall)

  const stair = new THREE.Group()
  scene.add(stair)

  // ---------- 1. blueprint: edges of every step, drawn progressively ----------
  const linePts: number[] = []
  for (let i = 0; i < STEPS; i++) {
    const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(RUN, RISE * (i + 1), WIDTH))
    const pos = g.attributes.position.array as Float32Array
    for (let k = 0; k < pos.length; k += 3) linePts.push(pos[k] + i * RUN + RUN / 2, pos[k + 1] + (RISE * (i + 1)) / 2, pos[k + 2])
  }
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3))
  const lineMat = new THREE.LineBasicMaterial({ color: 0xd9a86a, transparent: true, opacity: 0.9 })
  const blueprint = new THREE.LineSegments(lineGeo, lineMat)
  const lineCount = linePts.length / 3
  stair.add(blueprint)

  // ---------- 2. concrete monolith: step blocks + sloped waist slab ----------
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x8d8984, roughness: 0.92, map: concreteTexture() })
  const blocks: THREE.Mesh[] = []
  for (let i = 0; i < STEPS; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(RUN, RISE, WIDTH), concreteMat)
    m.castShadow = m.receiveShadow = true
    m.userData.y = RISE * i + RISE / 2
    m.position.set(i * RUN + RUN / 2, m.userData.y, 0)
    blocks.push(m); stair.add(m)
  }
  const length = Math.hypot(STEPS * RUN, STEPS * RISE)
  const slab = new THREE.Mesh(new THREE.BoxGeometry(length, 0.16, WIDTH), concreteMat)
  slab.castShadow = true
  slab.rotation.z = Math.atan2(RISE, RUN)
  slab.position.set((STEPS * RUN) / 2 + 0.04, (STEPS * RISE) / 2 - 0.12, 0)
  stair.add(slab)

  // ---------- 3. oak cladding: thick treads with a nosing overhang ----------
  const oak = oakTexture()
  const oakMat = new THREE.MeshStandardMaterial({ color: 0xe0c4a0, roughness: 0.5, map: oak })
  const riserMat = new THREE.MeshStandardMaterial({ color: 0x6b4a30, roughness: 0.6, map: oak })
  const treads: THREE.Mesh[] = []
  const risers: THREE.Mesh[] = []
  for (let i = 0; i < STEPS; i++) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(RUN + 0.035, 0.045, WIDTH + 0.02), oakMat)
    t.castShadow = t.receiveShadow = true
    t.userData.y = RISE * (i + 1) + 0.0225
    t.position.set(i * RUN + RUN / 2 - 0.0175, t.userData.y, 0.01)
    treads.push(t); stair.add(t)
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.02, RISE, WIDTH), riserMat)
    r.position.set(i * RUN - 0.012, RISE * i + RISE / 2, 0)
    r.scale.y = 0.0001
    risers.push(r); stair.add(r)
  }

  // ---------- 4. frameless glass: one pane per step + handrail ----------
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xdcebec, metalness: 0.1, roughness: 0.05,
    transparent: true, opacity: 0.13, envMapIntensity: 2.4, side: THREE.DoubleSide, depthWrite: false,
  })
  const panes: THREE.Mesh[] = []
  const glassEdge = new THREE.LineBasicMaterial({ color: 0xcfe8ea, transparent: true, opacity: 0.55 })
  const PANE_H = 0.95
  for (let i = 0; i < STEPS; i++) {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0); shape.lineTo(RUN, RISE); shape.lineTo(RUN, RISE + PANE_H); shape.lineTo(0, PANE_H); shape.closePath()
    const geo = new THREE.ShapeGeometry(shape)
    const p = new THREE.Mesh(geo, glassMat)
    p.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), glassEdge))
    p.userData.y = RISE * i + 0.12
    p.position.set(i * RUN, p.userData.y, WIDTH / 2 + 0.03)
    panes.push(p); stair.add(p)
  }
  const railMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 })
  const rail = new THREE.Mesh(new THREE.BoxGeometry(length + 0.05, 0.035, 0.05), railMat)
  rail.rotation.z = Math.atan2(RISE, RUN)
  const railPivot = new THREE.Group()
  railPivot.position.set(0, 0.12 + PANE_H + 0.02, WIDTH / 2 + 0.03)
  railPivot.rotation.z = Math.atan2(RISE, RUN)
  rail.rotation.z = 0
  rail.position.x = (length + 0.05) / 2
  railPivot.add(rail)
  stair.add(railPivot)

  // ---------- 5. LED strip under each nosing ----------
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffb36b, emissiveIntensity: 0 })
  for (let i = 0; i < STEPS; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.014, WIDTH - 0.06), ledMat)
    l.position.set(i * RUN - 0.026, RISE * (i + 1) - 0.016, 0)
    stair.add(l)
  }
  const glow = new THREE.PointLight(0xffa860, 0, 6, 1.4)
  glow.position.set((STEPS * RUN) / 2, 1.2, 0.8)
  scene.add(glow)

  stair.position.set(-((STEPS * RUN) / 2), 0, 0)

  // ---------- camera rig ----------
  const look = new THREE.Vector3(0.15, 1.2, 0)
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let progress = 0
  let shown = -1
  let frame = 0

  const apply = (p: number) => {
    const pBlue = seg(p, 0.0, 0.18)
    const pConc = seg(p, 0.14, 0.42)
    const pOak = seg(p, 0.42, 0.66)
    const pGlass = seg(p, 0.66, 0.86)
    const pLed = seg(p, 0.86, 1.0)

    blueprint.geometry.setDrawRange(0, Math.floor(lineCount * easeInOut(pBlue)))
    lineMat.opacity = 0.9 * (1 - seg(p, 0.3, 0.46))

    blocks.forEach((b, i) => {
      const t = easeOut(stagger(pConc, i, STEPS))
      b.position.y = b.userData.y - (1 - t) * 1.6
      b.scale.setScalar(Math.max(0.0001, t))
      b.visible = t > 0.001
    })
    slab.scale.set(Math.max(0.0001, easeOut(seg(pConc, 0.35, 1))), 1, 1)
    slab.visible = pConc > 0.35

    treads.forEach((t, i) => {
      const k = easeOut(stagger(pOak, i, STEPS))
      t.position.y = t.userData.y + (1 - k) * 1.2
      t.rotation.x = (1 - k) * 0.6
      t.visible = k > 0.001
      ;(t.material as THREE.Material).opacity = 1
    })
    risers.forEach((r, i) => { r.scale.y = Math.max(0.0001, easeOut(stagger(pOak, i, STEPS))) })

    panes.forEach((g, i) => {
      const k = easeOut(stagger(pGlass, i, STEPS, 0.6))
      g.position.y = g.userData.y - (1 - k) * 1.3
      g.visible = k > 0.001
    })
    railPivot.scale.x = Math.max(0.0001, easeInOut(seg(pGlass, 0.45, 1)))
    railPivot.visible = pGlass > 0.45

    ledMat.emissiveIntensity = 14 * pLed
    glow.intensity = 9 * pLed
    key.intensity = 90 - pLed * 35
    renderer.toneMappingExposure = 1.05 + pLed * 0.1

    // orbit: from a high front 3/4 view toward a low, dramatic side view
    const ang = THREE.MathUtils.lerp(0.95, 0.38, easeInOut(p)) + pointer.x * 0.08
    // portrait screens get a wider lens (set in resize) and a slightly longer throw
    const dist = camera.aspect < 1 ? THREE.MathUtils.lerp(12.2, 10.8, p) : THREE.MathUtils.lerp(10.2, 8.8, p)
    const fog = scene.fog as THREE.Fog
    fog.near = dist * 0.9; fog.far = dist * 2
    const h = THREE.MathUtils.lerp(4.8, 2.1, easeInOut(p)) + pointer.y * 0.25
    camera.position.set(-Math.sin(ang) * dist * 0.6, h, Math.cos(ang) * dist)
    camera.lookAt(look)
  }

  const render = () => {
    frame = 0
    pointer.x += (pointer.tx - pointer.x) * 0.08
    pointer.y += (pointer.ty - pointer.y) * 0.08
    shown += (progress - shown) * 0.14
    if (Math.abs(progress - shown) < 0.0005) shown = progress
    apply(shown)
    renderer.render(scene, camera)
    if (shown !== progress || Math.abs(pointer.tx - pointer.x) > 0.001 || Math.abs(pointer.ty - pointer.y) > 0.001) frame = requestAnimationFrame(render)
  }
  const kick = () => { if (!frame) frame = requestAnimationFrame(render) }

  const precompile = () => {
    const hidden: THREE.Object3D[] = []
    scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true } })
    renderer.compile(scene, camera)
    hidden.forEach((o) => { o.visible = false })
  }

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = camera.aspect < 1 ? 54 : 32
    // full-bleed canvas; on wide screens shift the frame so the stair sits right of the copy
    if (w > 900) camera.setViewOffset(w, h, -w * 0.17, h * 0.02, w, h)
    else camera.setViewOffset(w, h, 0, -h * 0.06, w, h)
    camera.updateProjectionMatrix()
    shown = shown < 0 ? 0 : shown
    apply(shown); renderer.render(scene, camera)
  }
  precompile()
  resize()

  return {
    setProgress: (p) => { progress = p; kick() },
    setPointer: (x, y) => { pointer.tx = x; pointer.ty = y; kick() },
    setQuality: (t) => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR[t]))
      if (t !== 'high' && renderer.shadowMap.enabled) {
        renderer.shadowMap.enabled = false
        key.castShadow = false
        scene.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if (m) m.needsUpdate = true })
      }
      resize()
    },
    resize,
    dispose: () => {
      cancelAnimationFrame(frame)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose?.()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.()
      })
      env.dispose(); pmrem.dispose(); renderer.dispose()
    },
  }
}
