import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  PenTool,
  Highlighter,
  Eraser,
  RotateCcw,
  Download,
  Check,
  Palette
} from 'lucide-react';
import MagnetButton from '../react-bits/MagnetButton';

const COLORS = [
  '#ffffff',
  '#09090b',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899'
];

export default function SketchCanvasModal({
  isOpen,
  onClose,
  onEmbedDrawing
}) {
  const canvasRef = useRef(null);
  const isLightInitial = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  const [tool, setTool] = useState('pen'); // 'pen' | 'highlighter' | 'eraser'
  const [color, setColor] = useState(isLightInitial ? '#09090b' : '#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      setColor(isLight ? '#09090b' : '#ffffff');
      setTool('pen');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Set resolution
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      saveState();
    }
  }, [isOpen]);

  const saveState = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev.slice(-15), dataUrl]);
  };

  const handleUndo = () => {
    if (history.length <= 1 || !canvasRef.current) return;
    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];
    setHistory(newHistory);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = previous;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
    };
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 4;
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = brushSize * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = brushSize;
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleSaveAndEmbed = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onEmbedDrawing(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card sketch-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="sketch-header-left">
            <h3 className="modal-title">Brain Dump Sketchpad</h3>
            <span className="sketch-subtitle">Draw diagrams, flowcharts, or handwritten notes</span>
          </div>

          <button className="icon-btn close-modal-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Drawing Canvas Area */}
        <div className="sketch-canvas-container">
          <canvas
            ref={canvasRef}
            className="sketch-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Tools Palette */}
        <div className="sketch-toolbar">
          <div className="sketch-tool-group">
            <button
              className={`sketch-tool-btn ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => setTool('pen')}
              title="Pen"
            >
              <PenTool size={16} />
              <span>Pen</span>
            </button>

            <button
              className={`sketch-tool-btn ${tool === 'highlighter' ? 'active' : ''}`}
              onClick={() => setTool('highlighter')}
              title="Highlighter"
            >
              <Highlighter size={16} />
              <span>Highlighter</span>
            </button>

            <button
              className={`sketch-tool-btn ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              title="Eraser"
            >
              <Eraser size={16} />
              <span>Eraser</span>
            </button>
          </div>

          <span className="toolbar-separator" />

          {/* Color Swatches */}
          <div className="color-swatches">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`color-swatch-btn ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => {
                  setColor(c);
                  if (tool === 'eraser') setTool('pen');
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>

          <span className="toolbar-separator" />

          {/* Brush Size Slider */}
          <div className="brush-slider-group">
            <span className="brush-label">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
              className="brush-range-slider"
            />
          </div>

          <span className="toolbar-separator" />

          {/* Undo & Clear */}
          <div className="sketch-actions-group">
            <button className="sketch-icon-btn" onClick={handleUndo} title="Undo">
              <RotateCcw size={15} />
            </button>
            <button className="sketch-text-btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-left">
            <span className="sketch-hint">Tip: Drawings are embedded directly into your note</span>
          </div>
          <div className="footer-right">
            <MagnetButton className="btn-action primary" onClick={handleSaveAndEmbed}>
              <Check size={16} />
              <span>Embed in Note</span>
            </MagnetButton>
          </div>
        </div>
      </div>
    </div>
  );
}
