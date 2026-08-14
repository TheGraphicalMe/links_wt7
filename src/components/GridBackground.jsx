import { useEffect, useRef, useCallback } from 'react'

export default function GridBackground() {
  const canvasRef = useRef(null)
  const targetMouseRef = useRef({ x: -9999, y: -9999 })
  const currentMouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef(null)
  const particlesRef = useRef([])
  const orbsRef = useRef([])
  const timeRef = useRef(0)

  const CELL_SIZE = 70
  const GAP = 4
  const CORNER_RADIUS = 10
  const GLOW_RADIUS = 280
  const MAX_SCALE = 1.15

  const initParticlesAndOrbs = (width, height) => {
    // Particles (dust)
    const pCount = Math.floor((width * height) / 4000)
    const p = []
    for (let i = 0; i < pCount; i++) {
      p.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.4 + 0.1,
        timeOffset: Math.random() * 100
      })
    }
    particlesRef.current = p

    // Removed roaming orbs in favor of specific localized corner gradients
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    
    timeRef.current += 0.016
    const time = timeRef.current

    // Smooth mouse interpolation (lerp)
    currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.08
    currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.08
    
    const mx = currentMouseRef.current.x
    const my = currentMouseRef.current.y

    // 1. Draw Deep Base Background
    ctx.fillStyle = '#040509' 
    ctx.fillRect(0, 0, width, height)

    // 2. Localized Ambient Gradients (Complementing Hover: Rose, Gold, Lavender)
    // Kept in specific corners (Top-Right and Bottom-Left)
    const breath = Math.sin(time * 0.6) * 0.02

    // Top Right Area (Lavender & Rose)
    const gradTR = ctx.createRadialGradient(width, 0, 0, width, 0, width * 0.5)
    gradTR.addColorStop(0, `rgba(167, 139, 219, ${0.1 + breath})`) // Lavender
    gradTR.addColorStop(0.5, `rgba(212, 132, 122, ${0.05 + breath})`) // Rose
    gradTR.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradTR
    ctx.fillRect(0, 0, width, height)

    // Bottom Left Area (Gold)
    const gradBL = ctx.createRadialGradient(0, height, 0, 0, height, width * 0.5)
    gradBL.addColorStop(0, `rgba(201, 168, 124, ${0.08 - breath})`) // Gold
    gradBL.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradBL
    ctx.fillRect(0, 0, width, height)

    // 3. Draw Grid
    const cols = Math.ceil(width / (CELL_SIZE + GAP)) + 2
    const rows = Math.ceil(height / (CELL_SIZE + GAP)) + 2

    const totalW = cols * (CELL_SIZE + GAP)
    const totalH = rows * (CELL_SIZE + GAP)
    const offX = (width - totalW) / 2
    const offY = (height - totalH) / 2

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellX = offX + c * (CELL_SIZE + GAP)
        const cellY = offY + r * (CELL_SIZE + GAP)
        const centerX = cellX + CELL_SIZE / 2
        const centerY = cellY + CELL_SIZE / 2

        const dx = mx - centerX
        const dy = my - centerY
        const dist = Math.sqrt(dx * dx + dy * dy)

        const intensity = Math.max(0, 1 - dist / GLOW_RADIUS)
        const eased = intensity * intensity * intensity // Sharper falloff for premium feel

        const wave1 = Math.sin(cellX * 0.001 + time * 0.8)
        const wave2 = Math.cos(cellY * 0.0015 - time * 0.6)
        const ambientShimmer = (wave1 + wave2 + 2) / 4

        const scale = 1 + (MAX_SCALE - 1) * eased
        const scaledSize = CELL_SIZE * scale
        const drawX = centerX - scaledSize / 2
        const drawY = centerY - scaledSize / 2
        const r_scaled = CORNER_RADIUS * scale

        // Base cell fill - glassy and translucent
        const baseAlpha = 0.01 + ambientShimmer * 0.015
        const hoverAlpha = baseAlpha + eased * 0.18
        
        ctx.fillStyle = `rgba(255, 255, 255, ${hoverAlpha})`
        
        // Shadow for depth
        if (eased > 0.01) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
          ctx.shadowBlur = 15 * eased
          ctx.shadowOffsetY = 8 * eased
        } else {
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
        }

        drawRoundedRect(ctx, drawX, drawY, scaledSize, scaledSize, r_scaled)
        ctx.fill()
        ctx.shadowColor = 'transparent' // reset

        // Inner top-left highlight (glass bevel)
        const bevelAlpha = 0.015 + ambientShimmer * 0.02 + eased * 0.2
        ctx.strokeStyle = `rgba(255, 255, 255, ${bevelAlpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(drawX + r_scaled, drawY)
        ctx.lineTo(drawX + scaledSize - r_scaled, drawY)
        ctx.moveTo(drawX, drawY + r_scaled)
        ctx.lineTo(drawX, drawY + scaledSize - r_scaled)
        ctx.stroke()

        // Reactive border stroke (Rose Gold / Gold / Lavender mix)
        const borderAlpha = 0.02 + ambientShimmer * 0.03 + eased * 0.8
        const r_c = 212 - eased * 11
        const g_c = 168 + eased * 20
        const b_c = 124 + eased * 50
        
        ctx.strokeStyle = `rgba(${r_c}, ${g_c}, ${b_c}, ${borderAlpha})`
        ctx.lineWidth = 1 + eased * 1.5
        drawRoundedRect(ctx, drawX, drawY, scaledSize, scaledSize, r_scaled)
        ctx.stroke()
      }
    }

    // 4. Update & Draw Particles (Dust)
    particlesRef.current.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      
      // Wrap around
      if (p.x < 0) p.x = width
      if (p.x > width) p.x = 0
      if (p.y < 0) p.y = height
      if (p.y > height) p.y = 0

      // Mouse interaction
      const dx = mx - p.x
      const dy = my - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      let currentAlpha = p.baseAlpha + Math.sin(time * 2 + p.timeOffset) * 0.2
      if (currentAlpha < 0) currentAlpha = 0
      
      // Highlight particles near cursor
      if (dist < GLOW_RADIUS) {
        currentAlpha += (1 - dist / GLOW_RADIUS) * 0.6
      }

      ctx.fillStyle = `rgba(212, 180, 150, ${currentAlpha})` // Soft gold tint
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    })

    // 5. Cursor Radial Glow (Premium multi-stop gradient)
    if (mx > -1000) {
      const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, GLOW_RADIUS * 1.5)
      gradient.addColorStop(0, 'rgba(212, 132, 122, 0.15)') // Rose
      gradient.addColorStop(0.3, 'rgba(201, 168, 124, 0.08)') // Gold
      gradient.addColorStop(0.6, 'rgba(167, 139, 219, 0.03)') // Lavender
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

    animFrameRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticlesAndOrbs(canvas.width, canvas.height)
    }

    const handleMouseMove = (e) => {
      targetMouseRef.current = { x: e.clientX, y: e.clientY }
      if (currentMouseRef.current.x < -1000) {
        currentMouseRef.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        targetMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        if (currentMouseRef.current.x < -1000) {
          currentMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        }
      }
    }

    const handleInteractionEnd = () => {
      targetMouseRef.current = { x: -9999, y: -9999 }
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchstart', handleTouchMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('mouseleave', handleInteractionEnd)
    window.addEventListener('touchend', handleInteractionEnd)

    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouchMove)
      window.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mouseleave', handleInteractionEnd)
      window.removeEventListener('touchend', handleInteractionEnd)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className="grid-bg"
      aria-hidden="true"
    />
  )
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
