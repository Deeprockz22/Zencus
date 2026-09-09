import React, { useEffect, useRef } from 'react';

/**
 * Parses color string (hex or rgb) into RGB float array [0..1]
 */
function parseColorToRgb(colorStr, fallback = [0.89, 0.7, 0.92]) {
  if (!colorStr) return fallback;
  if (Array.isArray(colorStr) && colorStr.length >= 3) return colorStr;

  if (typeof colorStr === 'string' && colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const num = parseInt(hex, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  if (typeof colorStr === 'string' && colorStr.includes('rgb')) {
    const parts = colorStr.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return [parseFloat(parts[0]) / 255, parseFloat(parts[1]) / 255, parseFloat(parts[2]) / 255];
    }
  }

  return fallback;
}

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_density;
uniform float u_starCount;
uniform vec3 u_color;
uniform vec2 u_center;
uniform float u_starSize;
uniform float u_brightness;
uniform float u_opacity;
uniform float u_flowerIntensity;
uniform float u_twinkleSpeed;
uniform float u_wobbleAmount;
uniform float u_innerLayerIntensity;
uniform float u_outerLayerIntensity;
uniform float u_fadeHeight;

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - u_center;
  p.x *= u_resolution.x / u_resolution.y;

  float r = length(p);
  float theta = atan(p.y, p.x);

  // Dynamic wobble oscillation
  float wobble = sin(u_time * u_speed * 0.9 + theta * 3.0) * 0.08 * u_wobbleAmount;
  
  // Spokes / Star rays calculation
  float spokes = cos(theta * u_starCount * 0.5 + wobble);
  float raySharpness = max(0.01, u_starSize * 0.12);
  float ray = pow(clamp(spokes * 0.5 + 0.5, 0.0, 1.0), 1.0 / raySharpness);

  // Twinkle modulation per ray
  float rayIndex = floor((theta + 3.14159) / 6.28318 * u_starCount);
  float twinkle = sin(u_time * u_twinkleSpeed * 7.0 + rayIndex * 47.123) * 0.5 + 0.5;

  // Center flower / bloom effect
  float flower = cos(theta * 8.0 - u_time * u_speed * 0.6) * u_flowerIntensity;
  
  // Density radial falloff
  float falloff = exp(-r * u_density * 3.2);
  
  // Inner layer
  float inner = u_innerLayerIntensity * exp(-r * 5.5) * (1.0 + flower * 0.45);
  
  // Outer layer
  float outer = u_outerLayerIntensity * ray * falloff * (0.65 + 0.35 * twinkle);
  
  // Vertical fade
  float vFade = 1.0 - smoothstep(0.0, u_fadeHeight, abs(uv.y - u_center.y));

  float intensity = (inner + outer) * u_brightness * vFade;
  vec3 col = u_color * intensity;
  float alpha = clamp(intensity * u_opacity, 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`;

/**
 * StarBurst - React Bits Pro Component
 * High-performance WebGL star burst explosion background with animated particles,
 * radial spikes, center bloom, and twinkling effects.
 * 
 * Spec: https://pro.reactbits.dev/docs/components/star-burst
 */
export default function StarBurst({
  speed = 1,
  density = 0.5,
  starCount = 100,
  color = '#e3b3ea',
  centerX = 0.5,
  centerY = 0.5,
  starSize = 0.3,
  brightness = 1,
  opacity = 1,
  flowerIntensity = 0.5,
  twinkleSpeed = 0.2,
  wobbleAmount = 1,
  innerLayerIntensity = 1,
  outerLayerIntensity = 1.5,
  fadeHeight = 2.5,
  className = '',
  style = {},
  children
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    let animationFrameId = null;

    if (!gl) {
      console.warn('WebGL not supported for StarBurst, rendering canvas 2D fallback');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let time = 0;
      const render2D = () => {
        time += 0.016 * speed;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;
        const cx = w * centerX;
        const cy = h * centerY;
        const rgb = parseColorToRgb(color);

        ctx.save();
        ctx.globalAlpha = opacity * 0.8;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
        grad.addColorStop(0, `rgba(${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255}, 0.8)`);
        grad.addColorStop(0.3, `rgba(${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255}, 0.25)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw radial spikes
        ctx.strokeStyle = `rgba(${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255}, 0.35)`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < starCount; i++) {
          const angle = (i / starCount) * Math.PI * 2 + time * 0.1;
          const len = (Math.sin(i * 3.7 + time * twinkleSpeed * 10) * 0.2 + 0.8) * Math.max(w, h) * 0.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
          ctx.stroke();
        }
        ctx.restore();
        animationFrameId = requestAnimationFrame(render2D);
      };
      render2D();
      return () => cancelAnimationFrame(animationFrameId);
    }

    // Compile Shader helper
    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Quad geometry covering full canvas
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uSpeed = gl.getUniformLocation(program, 'u_speed');
    const uDensity = gl.getUniformLocation(program, 'u_density');
    const uStarCount = gl.getUniformLocation(program, 'u_starCount');
    const uColor = gl.getUniformLocation(program, 'u_color');
    const uCenter = gl.getUniformLocation(program, 'u_center');
    const uStarSize = gl.getUniformLocation(program, 'u_starSize');
    const uBrightness = gl.getUniformLocation(program, 'u_brightness');
    const uOpacity = gl.getUniformLocation(program, 'u_opacity');
    const uFlowerIntensity = gl.getUniformLocation(program, 'u_flowerIntensity');
    const uTwinkleSpeed = gl.getUniformLocation(program, 'u_twinkleSpeed');
    const uWobbleAmount = gl.getUniformLocation(program, 'u_wobbleAmount');
    const uInnerLayerIntensity = gl.getUniformLocation(program, 'u_innerLayerIntensity');
    const uOuterLayerIntensity = gl.getUniformLocation(program, 'u_outerLayerIntensity');
    const uFadeHeight = gl.getUniformLocation(program, 'u_fadeHeight');

    // Handle canvas resizing
    const resize = () => {
      const displayWidth = canvas.clientWidth || window.innerWidth;
      const displayHeight = canvas.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(displayWidth * dpr);
      const height = Math.floor(displayHeight * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    let startTime = performance.now();

    const render = (now) => {
      resize();
      const elapsed = (now - startTime) * 0.001;
      const rgb = parseColorToRgb(color);

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uSpeed, speed);
      gl.uniform1f(uDensity, density);
      gl.uniform1f(uStarCount, starCount);
      gl.uniform3f(uColor, rgb[0], rgb[1], rgb[2]);
      gl.uniform2f(uCenter, centerX, centerY);
      gl.uniform1f(uStarSize, starSize);
      gl.uniform1f(uBrightness, brightness);
      gl.uniform1f(uOpacity, opacity);
      gl.uniform1f(uFlowerIntensity, flowerIntensity);
      gl.uniform1f(uTwinkleSpeed, twinkleSpeed);
      gl.uniform1f(uWobbleAmount, wobbleAmount);
      gl.uniform1f(uInnerLayerIntensity, innerLayerIntensity);
      gl.uniform1f(uOuterLayerIntensity, outerLayerIntensity);
      gl.uniform1f(uFadeHeight, fadeHeight);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [
    speed,
    density,
    starCount,
    color,
    centerX,
    centerY,
    starSize,
    brightness,
    opacity,
    flowerIntensity,
    twinkleSpeed,
    wobbleAmount,
    innerLayerIntensity,
    outerLayerIntensity,
    fadeHeight
  ]);

  return (
    <div
      className={`rb-star-burst-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      {children}
    </div>
  );
}
