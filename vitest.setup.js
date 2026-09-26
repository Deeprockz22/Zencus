import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Global matchMedia mock
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() {},
    };
  };

  // Mock HTMLCanvasElement getContext for both 2d and webgl/webgl2
  const mock2DContext = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 0 }),
    createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
    createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  };

  const mockWebGLContext = {
    getContextAttributes: vi.fn().mockReturnValue({ stencil: true, depth: true, antialias: true, alpha: true }),
    getExtension: vi.fn().mockReturnValue({ UNMASKED_RENDERER_WEBGL: 0x9246 }),
    getParameter: vi.fn().mockImplementation((p) => {
      if (p === 0x1f00) return 'WebKit';
      if (p === 0x1f01) return 'WebKit WebGL';
      return 'WebGL 2.0 (OpenGL ES 3.0 Chromium)';
    }),
    getShaderPrecisionFormat: vi.fn().mockReturnValue({
      rangeMin: 127,
      rangeMax: 127,
      precision: 23
    }),
    getShaderParameter: vi.fn().mockReturnValue(true),
    getProgramParameter: vi.fn().mockReturnValue(true),
    createShader: vi.fn().mockReturnValue({}),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    createProgram: vi.fn().mockReturnValue({}),
    attachShader: vi.fn(),
    bindAttribLocation: vi.fn(),
    linkProgram: vi.fn(),
    useProgram: vi.fn(),
    getProgramInfoLog: vi.fn().mockReturnValue(''),
    getShaderInfoLog: vi.fn().mockReturnValue(''),
    getActiveUniform: vi.fn().mockReturnValue({ name: 'uTime', size: 1, type: 5126 }),
    getActiveAttrib: vi.fn().mockReturnValue({ name: 'position', size: 1, type: 5126 }),
    getAttachedShaders: vi.fn().mockReturnValue([]),
    createBuffer: vi.fn().mockReturnValue({}),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    bufferSubData: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    viewport: vi.fn(),
    scissor: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    clearDepth: vi.fn(),
    createTexture: vi.fn().mockReturnValue({}),
    bindTexture: vi.fn(),
    texParameteri: vi.fn(),
    texParameterf: vi.fn(),
    texImage2D: vi.fn(),
    texImage3D: vi.fn(),
    texStorage2D: vi.fn(),
    texStorage3D: vi.fn(),
    texSubImage2D: vi.fn(),
    texSubImage3D: vi.fn(),
    generateMipmap: vi.fn(),
    createFramebuffer: vi.fn().mockReturnValue({}),
    bindFramebuffer: vi.fn(),
    createRenderbuffer: vi.fn().mockReturnValue({}),
    bindRenderbuffer: vi.fn(),
    renderbufferStorage: vi.fn(),
    framebufferTexture2D: vi.fn(),
    framebufferRenderbuffer: vi.fn(),
    checkFramebufferStatus: vi.fn().mockReturnValue(36053),
    deleteTexture: vi.fn(),
    deleteBuffer: vi.fn(),
    clearColor: vi.fn(),
    clearDepth: vi.fn(),
    clearStencil: vi.fn(),
    stencilMask: vi.fn(),
    stencilFunc: vi.fn(),
    stencilOp: vi.fn(),
    deleteProgram: vi.fn(),
    deleteShader: vi.fn(),
    deleteFramebuffer: vi.fn(),
    deleteRenderbuffer: vi.fn(),
    getUniformLocation: vi.fn().mockReturnValue({}),
    getAttribLocation: vi.fn().mockReturnValue(0),
    vertexAttribPointer: vi.fn(),
    vertexAttribIPointer: vi.fn(),
    vertexAttribDivisor: vi.fn(),
    drawElementsInstanced: vi.fn(),
    drawArraysInstanced: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform2i: vi.fn(),
    uniform3f: vi.fn(),
    uniform3i: vi.fn(),
    uniform4f: vi.fn(),
    uniform4i: vi.fn(),
    uniform1fv: vi.fn(),
    uniform2fv: vi.fn(),
    uniform3fv: vi.fn(),
    uniform4fv: vi.fn(),
    uniform1iv: vi.fn(),
    uniform2iv: vi.fn(),
    uniform3iv: vi.fn(),
    uniform4iv: vi.fn(),
    uniformMatrix2fv: vi.fn(),
    uniformMatrix3fv: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    pixelStorei: vi.fn(),
    cullFace: vi.fn(),
    frontFace: vi.fn(),
    blendFunc: vi.fn(),
    blendEquation: vi.fn(),
    blendFuncSeparate: vi.fn(),
    blendEquationSeparate: vi.fn(),
    depthMask: vi.fn(),
    colorMask: vi.fn(),
    depthFunc: vi.fn(),
    activeTexture: vi.fn(),
    createVertexArray: vi.fn().mockReturnValue({}),
    bindVertexArray: vi.fn(),
    deleteVertexArray: vi.fn(),
    canvas: { width: 800, height: 600 }
  };

  HTMLCanvasElement.prototype.getContext = function(type) {
    if (type === '2d') return mock2DContext;
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return mockWebGLContext;
    return null;
  };
}
