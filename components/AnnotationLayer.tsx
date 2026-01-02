
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Point, ToolType, AnnotationPath } from '../types';

interface AnnotationLayerProps {
  pageIndex: number;
  width: number;
  height: number;
  tool: ToolType;
  color: string;
  onSave: (path: AnnotationPath) => void;
  existingAnnotations: AnnotationPath[];
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  pageIndex,
  width,
  height,
  tool,
  color,
  onSave,
  existingAnnotations
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    existingAnnotations.forEach(path => {
      if (path.pageIndex !== pageIndex || path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = path.tool === 'highlighter' ? `${path.color}44` : path.color;
      ctx.lineWidth = path.width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      if (path.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [existingAnnotations, pageIndex, width, height]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    if (!ctx || !rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPoint = { x, y };
    
    // Draw immediate feedback
    ctx.beginPath();
    ctx.strokeStyle = tool === 'highlighter' ? `${color}44` : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : (tool === 'highlighter' ? 30 : 2);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    const lastPoint = currentPath[currentPath.length - 1];
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    setCurrentPath(prev => [...prev, newPoint]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length > 1) {
      onSave({
        id: Math.random().toString(36).substr(2, 9),
        tool,
        color: tool === 'eraser' ? '#ffffff' : color,
        width: tool === 'eraser' ? 20 : (tool === 'highlighter' ? 30 : 2),
        points: currentPath,
        pageIndex
      });
    }
    setCurrentPath([]);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`absolute top-0 left-0 z-10 cursor-crosshair touch-none ${tool === 'highlighter' ? 'mix-blend-multiply' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};
