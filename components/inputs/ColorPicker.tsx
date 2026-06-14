"use client";

import { useEffect, useRef, useState } from "react";

type ColorPickerProps = {
  value?: string;
  onChange: (hex: string) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hsvToRgb = (h: number, s: number, v: number) => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`.toUpperCase();

const ColorPicker = ({ value = "#E8FF00", onChange }: ColorPickerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hue, setHue] = useState(68);
  const [brightness, setBrightness] = useState(1);
  const [cursor, setCursor] = useState({ x: 0.92, y: 0.08 });

  const selectedHex = rgbToHex(hsvToRgb(hue, cursor.x, brightness * (1 - cursor.y)));

  useEffect(() => {
    onChange(selectedHex);
  }, [onChange, selectedHex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const baseColor = rgbToHex(hsvToRgb(hue, 1, brightness));

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
    whiteGradient.addColorStop(0, "#FFFFFF");
    whiteGradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = whiteGradient;
    ctx.fillRect(0, 0, width, height);

    const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
    blackGradient.addColorStop(0, "rgba(0,0,0,0)");
    blackGradient.addColorStop(1, "#000000");
    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, 0, width, height);
  }, [brightness, hue]);

  const updateCursor = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setCursor({
      x: clamp((clientX - rect.left) / rect.width, 0, 1),
      y: clamp((clientY - rect.top) / rect.height, 0, 1),
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    updateCursor(event.clientX, event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.buttons !== 1) return;
    updateCursor(event.clientX, event.clientY);
  };

  return (
    <div className="grid gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={420}
          height={260}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="h-56 w-full cursor-crosshair border border-[var(--color-border)]"
        />
        <span
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.55)]"
          style={{
            left: `${cursor.x * 100}%`,
            top: `${cursor.y * 100}%`,
            backgroundColor: selectedHex,
          }}
        />
      </div>

      <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">
        Hue
        <input
          type="range"
          min={0}
          max={359}
          value={hue}
          onChange={(event) => setHue(Number(event.target.value))}
          className="h-3 cursor-pointer appearance-none rounded-full"
          style={{
            background:
              "linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red)",
          }}
        />
      </label>

      <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">
        Brightness
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(brightness * 100)}
          onChange={(event) => setBrightness(Number(event.target.value) / 100)}
          className="h-3 cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(90deg, #000000, ${rgbToHex(hsvToRgb(hue, 1, 1))})`,
          }}
        />
      </label>

      <div className="flex items-center justify-between border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 border border-[var(--color-border)]" style={{ backgroundColor: selectedHex }} />
          <span className="font-mono text-sm font-bold">{selectedHex}</span>
        </div>
        <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">
          Selected
        </span>
      </div>
    </div>
  );
};

export default ColorPicker;
