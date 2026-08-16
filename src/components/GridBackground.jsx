import { useEffect, useRef, useCallback } from 'react'

export default function GridBackground() {
  const canvasRef = useRef(null)
  const targetMouseRef = useRef({ x: -9999, y: -9999 })
  const currentMouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef(null)
  const candlesRef = useRef([])
  const timeRef = useRef(0)

  const GLOW_RADIUS = 320

  // Generate candlestick data with volume
  const initCandles = (width, height) => {
    const candles = []
    const candleWidth = 14
    const spacing = 28
    const count = Math.ceil(width / spacing) + 4
    
    // Generate base random walk
    let currentPrice = height * 0.5
    const prices = []
    for (let i = 0; i <= count; i++) {
      prices.push(currentPrice)
      currentPrice += (Math.random() - 0.48) * 40
    }
    
    // Smooth out drift so the end perfectly matches the start
    const drift = prices[count] - prices[0]
    for (let i = 0; i <= count; i++) {
      prices[i] -= (i / count) * drift
    }

    for (let i = 0; i < count; i++) {
      const open = prices[i]
      const close = prices[i + 1]
      const high = Math.max(open, close) - Math.random() * 25
      const low = Math.min(open, close) + Math.random() * 25
      const bullish = close < open

      candles.push({
        x: i * spacing,
        open, close, high, low, bullish,
        width: candleWidth,
        alpha: 0.06 + Math.random() * 0.06,
        timeOffset: Math.random() * 10,
        volume: 15 + Math.random() * 45, // volume bar height
      })
    }
    candlesRef.current = candles
  }

  // Smooth price line
  const getPriceLine = (width, height, time) => {
    const points = []
    const segments = 120
    const step = width / segments
    for (let i = 0; i <= segments; i++) {
      const x = i * step
      const y =
        height * 0.45 +
        Math.sin(i * 0.08 + time * 0.4) * height * 0.08 +
        Math.sin(i * 0.03 + time * 0.2) * height * 0.12 +
        Math.cos(i * 0.15 + time * 0.6) * height * 0.03
      points.push({ x, y })
    }
    return points
  }


  // Draw a smooth curve through points
  const drawCurve = (ctx, points) => {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2)
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas

    timeRef.current += 0.008
    const time = timeRef.current

    // Smooth mouse interpolation
    currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.08
    currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.08
    const mx = currentMouseRef.current.x
    const my = currentMouseRef.current.y

    // 1. Deep dark background to maximize contrast
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
    bgGrad.addColorStop(0, '#070a14') // Very dark navy
    bgGrad.addColorStop(1, '#020305') // Almost pitch black
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    // 2. Single intense concentrated gradient
    const breath = Math.sin(time * 0.8) * 0.05

    // Intense Cyan/Teal glow localized behind the profile avatar
    // Adjusted radius and position so it's perfectly visible on mobile screens
    const intenseGrad = ctx.createRadialGradient(
      width * 0.5, height * 0.35, 0, 
      width * 0.5, height * 0.35, Math.max(width * 0.4, 300)
    )
    
    intenseGrad.addColorStop(0, `rgba(14, 224, 224, ${0.35 + breath})`) // Very bright core
    intenseGrad.addColorStop(0.4, `rgba(14, 224, 224, ${0.1 + breath * 0.5})`) // Fast falloff
    intenseGrad.addColorStop(1, 'rgba(0,0,0,0)') // Fades to nothing
    
    ctx.fillStyle = intenseGrad
    ctx.fillRect(0, 0, width, height)

    // 3. Horizontal price levels
    const levelCount = 12
    for (let i = 1; i < levelCount; i++) {
      const y = (height / levelCount) * i
      const shimmer = Math.sin(time * 0.5 + i * 0.7) * 0.01
      const lineDist = Math.abs(my - y)
      const lineGlow = mx > -1000 ? Math.max(0, 1 - lineDist / 150) * 0.15 : 0

      ctx.strokeStyle = `rgba(201, 168, 124, ${0.03 + shimmer + lineGlow})`
      ctx.lineWidth = 0.5
      ctx.setLineDash([6, 12])
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // 4. Volume bars at the bottom
    const totalWidth = candlesRef.current.length * 28 // count * spacing
    const scrollOffset = time * 12 // Continuous scroll speed
    const volBaseY = height - 10
    
    candlesRef.current.forEach((c) => {
      let drawX = c.x - (scrollOffset % totalWidth)
      if (drawX < -60) drawX += totalWidth // Seamless wrap around

      if (drawX < -30 || drawX > width + 30) return

      const vdx = mx - (drawX + c.width / 2)
      const vdy = my - (volBaseY - c.volume / 2)
      const vDist = Math.sqrt(vdx * vdx + vdy * vdy)
      const vGlow = mx > -1000 ? Math.max(0, 1 - vDist / GLOW_RADIUS) : 0
      const vEased = vGlow * vGlow

      // Glow — always a subtle base, stronger on hover
      ctx.shadowColor = c.bullish
        ? `rgba(14, 224, 224, ${0.3 + Math.min(vEased * 1.2, 0.7)})`
        : `rgba(255, 50, 50, ${0.3 + Math.min(vEased * 1.2, 0.7)})`
      ctx.shadowBlur = 8 + 30 * vEased

      const vAlpha = 0.35 + vEased * 0.4
      ctx.fillStyle = c.bullish
        ? `rgba(14, 220, 170, ${vAlpha})`
        : `rgba(220, 70, 70, ${vAlpha})`
      ctx.fillRect(drawX + 2, volBaseY - c.volume, c.width - 4, c.volume)

      // Second glow pass for bloom
      if (vEased > 0.1) {
        ctx.shadowBlur = 45 * vEased
        ctx.fillRect(drawX + 2, volBaseY - c.volume, c.width - 4, c.volume)
      }

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    })

    // 5. Candlesticks with enhanced glow
    candlesRef.current.forEach((c) => {
      let drawX = c.x - (scrollOffset % totalWidth)
      if (drawX < -60) drawX += totalWidth // Seamless wrap around

      if (drawX < -30 || drawX > width + 30) return

      const cdx = mx - (drawX + c.width / 2)
      const cdy = my - ((c.open + c.close) / 2)
      const cDist = Math.sqrt(cdx * cdx + cdy * cdy)
      const cGlow = mx > -1000 ? Math.max(0, 1 - cDist / GLOW_RADIUS) : 0
      const eased = cGlow * cGlow

      const alpha = 0.25 + c.alpha + Math.sin(time + c.timeOffset) * 0.02 + eased * 0.85
      const bodyTop = Math.min(c.open, c.close)
      const bodyHeight = Math.max(Math.abs(c.close - c.open), 3)

      // Always a subtle ambient glow, intensifies on hover
      ctx.shadowColor = c.bullish
        ? `rgba(14, 224, 224, ${0.25 + Math.min(eased * 1.5, 0.75)})`
        : `rgba(255, 50, 50, ${0.25 + Math.min(eased * 1.5, 0.75)})`
      ctx.shadowBlur = 6 + 45 * eased

      // Wick
      ctx.strokeStyle = c.bullish
        ? `rgba(14, 220, 180, ${alpha * 0.9})`
        : `rgba(220, 70, 70, ${alpha * 0.9})`
      ctx.lineWidth = 1 + eased * 2
      ctx.beginPath()
      ctx.moveTo(drawX + c.width / 2, c.high)
      ctx.lineTo(drawX + c.width / 2, c.low)
      ctx.stroke()

      // Body
      ctx.fillStyle = c.bullish
        ? `rgba(14, 220, 170, ${alpha})`
        : `rgba(220, 70, 70, ${alpha})`
      ctx.fillRect(drawX, bodyTop, c.width, bodyHeight)

      // Second glow pass — wide bloom
      if (eased > 0.05) {
        ctx.shadowBlur = 60 * eased
        ctx.fillRect(drawX, bodyTop, c.width, bodyHeight)
      }

      // Third glow pass — tight bright core
      if (eased > 0.15) {
        ctx.shadowColor = c.bullish
          ? `rgba(180, 255, 240, ${eased * 0.6})`
          : `rgba(255, 150, 150, ${eased * 0.6})`
        ctx.shadowBlur = 20 * eased
        ctx.fillRect(drawX, bodyTop, c.width, bodyHeight)
      }

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      // Border
      ctx.strokeStyle = c.bullish
        ? `rgba(14, 224, 224, ${alpha * 0.5 + eased * 0.6})`
        : `rgba(230, 100, 100, ${alpha * 0.5 + eased * 0.6})`
      ctx.lineWidth = 0.5 + eased * 2
      ctx.strokeRect(drawX, bodyTop, c.width, bodyHeight)
    })

    // 6. Main price line
    const points = getPriceLine(width, height, time)

    // Line glow
    ctx.shadowColor = 'rgba(14, 224, 224, 0.3)'
    ctx.shadowBlur = 8

    const lineGrad = ctx.createLinearGradient(0, 0, width, 0)
    lineGrad.addColorStop(0, 'rgba(201, 168, 124, 0.0)')
    lineGrad.addColorStop(0.2, 'rgba(201, 168, 124, 0.4)')
    lineGrad.addColorStop(0.5, 'rgba(14, 224, 224, 0.5)')
    lineGrad.addColorStop(0.8, 'rgba(201, 168, 124, 0.4)')
    lineGrad.addColorStop(1, 'rgba(201, 168, 124, 0.0)')

    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1.8
    drawCurve(ctx, points)
    ctx.stroke()

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // Glowing dot at the leading edge of the price line
    const tipPoint = points[points.length - 1]
    const pulseSize = 3 + Math.sin(time * 4) * 1.5
    ctx.shadowColor = 'rgba(14, 224, 224, 0.8)'
    ctx.shadowBlur = 15
    ctx.fillStyle = 'rgba(14, 224, 224, 0.9)'
    ctx.beginPath()
    ctx.arc(tipPoint.x, tipPoint.y, pulseSize, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // Area fill under price line
    const areaGrad = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.75)
    areaGrad.addColorStop(0, 'rgba(14, 224, 224, 0.06)')
    areaGrad.addColorStop(1, 'rgba(14, 224, 224, 0.0)')

    ctx.fillStyle = areaGrad
    drawCurve(ctx, points)
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fill()

    // 8. Cursor interaction
    if (mx > -1000) {
      // Radial glow
      const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, GLOW_RADIUS * 1.2)
      gradient.addColorStop(0, 'rgba(14, 224, 224, 0.14)')
      gradient.addColorStop(0.35, 'rgba(201, 168, 124, 0.07)')
      gradient.addColorStop(0.7, 'rgba(167, 139, 219, 0.02)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Crosshairs
      ctx.strokeStyle = 'rgba(14, 224, 224, 0.15)'
      ctx.lineWidth = 0.5
      ctx.setLineDash([4, 8])

      ctx.beginPath()
      ctx.moveTo(0, my)
      ctx.lineTo(width, my)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(mx, 0)
      ctx.lineTo(mx, height)
      ctx.stroke()

      ctx.setLineDash([])

      // Price tag on crosshair (right edge)
      const tagW = 58
      const tagH = 22
      const tagX = width - tagW - 4
      const tagY = my - tagH / 2
      ctx.fillStyle = 'rgba(14, 224, 224, 0.15)'
      ctx.beginPath()
      ctx.roundRect(tagX, tagY, tagW, tagH, 4)
      ctx.fill()
      ctx.strokeStyle = 'rgba(14, 224, 224, 0.3)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      ctx.fillStyle = 'rgba(14, 224, 224, 0.6)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const fakePrice = (1000 - my * 0.5).toFixed(2)
      ctx.fillText(fakePrice, tagX + tagW / 2, my)

      // Time tag on crosshair (bottom edge)
      const tTagW = 52
      const tTagH = 18
      const tTagX = mx - tTagW / 2
      const tTagY = height - tTagH - 4
      ctx.fillStyle = 'rgba(201, 168, 124, 0.12)'
      ctx.beginPath()
      ctx.roundRect(tTagX, tTagY, tTagW, tTagH, 4)
      ctx.fill()
      ctx.strokeStyle = 'rgba(201, 168, 124, 0.25)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      ctx.fillStyle = 'rgba(201, 168, 124, 0.5)'
      ctx.font = '9px monospace'
      const mins = Math.floor((mx / width) * 60)
      ctx.fillText(`${String(Math.floor(mins / 60) + 9).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`, mx, tTagY + tTagH / 2)
    }

    animFrameRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initCandles(canvas.width, canvas.height)
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

    const handleMouseLeave = () => {
      targetMouseRef.current = { x: -9999, y: -9999 }
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchstart', handleTouchMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouchMove)
      window.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
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
