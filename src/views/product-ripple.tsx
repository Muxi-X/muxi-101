'use client'

import { useEffect, useRef, type RefObject } from 'react'

const MAX_WAVES = 32
const BRUSH_SIZE = 40
const STRENGTH = 0.05
const SWIRL = 0.3
const RINGS = 1.75
const SPREAD = 0.5
const SPACING = 10
const DISPERSION = 0.1
const TINT = [251 / 255, 246 / 255, 1] as const
const IMAGE_SIZE = [578, 1013] as const
const SCREEN_CROP = [95, 149, 381, 707] as const
const MAX_AGE = 1.1

const vertexShader = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

varying vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uResolution;
uniform vec3 uWaves[${MAX_WAVES}];
uniform int uWaveCount;
uniform float uTime;
uniform float uBrushSize;
uniform float uStrength;
uniform float uSwirl;
uniform float uRings;
uniform float uSpread;
uniform float uDispersion;
uniform vec3 uTint;
uniform vec2 uImageSize;
uniform vec4 uScreenCrop;

const float PI = 3.141592653589793;

vec2 imageUv(vec2 screenUv) {
  return vec2(
    (uScreenCrop.x + screenUv.x * uScreenCrop.z) / uImageSize.x,
    (uScreenCrop.y + screenUv.y * uScreenCrop.w) / uImageSize.y
  );
}

void main() {
  vec2 screenUv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 displacement = vec2(0.0);
  float tintAmount = 0.0;

  for (int i = 0; i < ${MAX_WAVES}; i++) {
    if (i >= uWaveCount) break;

    vec3 wave = uWaves[i];
    float age = uTime - wave.z;
    if (age < 0.0 || age > ${MAX_AGE}) continue;

    vec2 delta = (screenUv - wave.xy) * uResolution;
    float distanceFromCenter = length(delta);
    float radius = age * uBrushSize * uSpread * 1.8;
    float edgeDistance = distanceFromCenter - radius;
    float bandWidth = uBrushSize * 0.42;
    float envelope = exp(-pow(edgeDistance / bandWidth, 2.0));
    float oscillation = sin(edgeDistance / (uBrushSize / uRings) * PI * 2.0);
    float fade = 1.0 - age / ${MAX_AGE};
    float waveAmount = oscillation * envelope * fade;
    vec2 radial = normalize(delta + vec2(0.0001));
    vec2 tangent = vec2(-radial.y, radial.x);
    vec2 direction = radial + tangent * uSwirl;

    displacement += direction * waveAmount * uStrength * uBrushSize / uResolution;
    tintAmount = max(tintAmount, envelope * fade * 0.1);
  }

  vec2 minUv = imageUv(vec2(0.0));
  vec2 maxUv = imageUv(vec2(1.0));
  vec2 sampleOffset = displacement;
  vec2 redUv = clamp(imageUv(screenUv - sampleOffset * (1.0 + uDispersion)), minUv, maxUv);
  vec2 greenUv = clamp(imageUv(screenUv - sampleOffset), minUv, maxUv);
  vec2 blueUv = clamp(imageUv(screenUv - sampleOffset * (1.0 - uDispersion)), minUv, maxUv);
  vec3 color = vec3(
    texture2D(uImage, redUv).r,
    texture2D(uImage, greenUv).g,
    texture2D(uImage, blueUv).b
  );

  gl_FragColor = vec4(mix(color, uTint, tintAmount), 1.0);
}
`

interface ProductRippleProps {
  screenRef: RefObject<HTMLDivElement | null>
  imageRef: RefObject<HTMLImageElement | null>
}

interface Wave {
  x: number
  y: number
  createdAt: number
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) {
    console.error('Unable to create the product ripple shader.')
    return null
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Unable to compile the product ripple shader:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export default function ProductRipple({ screenRef, imageRef }: ProductRippleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const screen = screenRef.current
    const image = imageRef.current
    if (!canvas || !screen || !image) return

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl || gl.isContextLost()) {
      console.error('WebGL is unavailable; the product screen will use its static artwork.')
      return
    }

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader)
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
    if (!vertex || !fragment) return

    const program = gl.createProgram()
    if (!program) {
      console.error('Unable to create the product ripple program.')
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      return
    }

    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Unable to link the product ripple program:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return
    }

    const buffer = gl.createBuffer()
    const texture = gl.createTexture()
    if (!buffer || !texture) {
      console.error('Unable to allocate product ripple graphics resources.')
      gl.deleteBuffer(buffer)
      gl.deleteTexture(texture)
      gl.deleteProgram(program)
      return
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )
    gl.useProgram(program)

    const positionLocation = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const uniform = (name: string) => gl.getUniformLocation(program, name)
    const uniforms = {
      image: uniform('uImage'),
      resolution: uniform('uResolution'),
      waves: uniform('uWaves[0]'),
      waveCount: uniform('uWaveCount'),
      time: uniform('uTime'),
      brushSize: uniform('uBrushSize'),
      strength: uniform('uStrength'),
      swirl: uniform('uSwirl'),
      rings: uniform('uRings'),
      spread: uniform('uSpread'),
      dispersion: uniform('uDispersion'),
      tint: uniform('uTint'),
      imageSize: uniform('uImageSize'),
      screenCrop: uniform('uScreenCrop'),
    }

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(uniforms.image, 0)
    gl.uniform2f(uniforms.imageSize, ...IMAGE_SIZE)
    gl.uniform4f(uniforms.screenCrop, ...SCREEN_CROP)
    gl.uniform1f(uniforms.brushSize, BRUSH_SIZE)
    gl.uniform1f(uniforms.strength, STRENGTH)
    gl.uniform1f(uniforms.swirl, SWIRL)
    gl.uniform1f(uniforms.rings, RINGS)
    gl.uniform1f(uniforms.spread, SPREAD)
    gl.uniform1f(uniforms.dispersion, DISPERSION)
    gl.uniform3f(uniforms.tint, ...TINT)

    const waves: Wave[] = []
    let animationFrame = 0
    let lastPoint: { x: number; y: number } | null = null
    let disposed = false

    const draw = (timestamp: number) => {
      animationFrame = 0
      if (disposed) return

      const rect = screen.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.round(rect.width * pixelRatio))
      const height = Math.max(1, Math.round(rect.height * pixelRatio))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
        gl.uniform2f(uniforms.resolution, rect.width, rect.height)
      }

      const now = timestamp / 1000
      while (waves.length && now - waves[0].createdAt > MAX_AGE) waves.shift()
      const packedWaves = new Float32Array(MAX_WAVES * 3)
      waves.forEach((wave, index) => {
        packedWaves.set([wave.x, wave.y, wave.createdAt], index * 3)
      })

      gl.uniform1f(uniforms.time, now)
      gl.uniform1i(uniforms.waveCount, waves.length)
      gl.uniform3fv(uniforms.waves, packedWaves)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      if (waves.length) animationFrame = requestAnimationFrame(draw)
    }

    const scheduleDraw = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(draw)
    }

    const uploadImage = () => {
      if (disposed || !image.complete || !image.naturalWidth) return
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      scheduleDraw()
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const rect = screen.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const point = { x: x / rect.width, y: y / rect.height }

      if (!lastPoint) {
        waves.push({ ...point, createdAt: performance.now() / 1000 })
      } else {
        const distanceInPixels = Math.hypot(x - lastPoint.x, y - lastPoint.y)
        const steps = Math.min(24, Math.max(1, Math.ceil(distanceInPixels / SPACING)))
        for (let step = 1; step <= steps; step++) {
          const progress = step / steps
          waves.push({
            x: (lastPoint.x + (x - lastPoint.x) * progress) / rect.width,
            y: (lastPoint.y + (y - lastPoint.y) * progress) / rect.height,
            createdAt: performance.now() / 1000,
          })
        }
      }

      lastPoint = { x, y }
      if (waves.length > MAX_WAVES) waves.splice(0, waves.length - MAX_WAVES)
      scheduleDraw()
    }

    const onLeave = () => {
      lastPoint = null
    }

    if (image.complete && image.naturalWidth) uploadImage()
    else image.addEventListener('load', uploadImage, { once: true })
    screen.addEventListener('pointermove', onMove, { passive: true })
    screen.addEventListener('pointerleave', onLeave)

    const resizeObserver = new ResizeObserver(scheduleDraw)
    resizeObserver.observe(screen)

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      screen.removeEventListener('pointermove', onMove)
      screen.removeEventListener('pointerleave', onLeave)
      image.removeEventListener('load', uploadImage)
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [imageRef, screenRef])

  return <canvas className="product-ripple" ref={canvasRef} aria-hidden="true" />
}
