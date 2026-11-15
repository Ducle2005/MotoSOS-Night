import type { Map as MapLibreMap } from 'maplibre-gl';

interface PinConfig {
  bg: string;
  paths: string[];
  hasOnlineBadge?: boolean;
}

const PIN_CONFIGS: Record<string, PinConfig> = {
  'pin-mechanic': {
    bg: '#1D63ED',
    paths: [
      'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    ],
    hasOnlineBadge: true,
  },
  'pin-fuel': {
    bg: '#F59E0B',
    paths: [
      'M3 22h12', 'M4 9h10',
      'M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18',
      'M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5',
    ],
  },
  'pin-police': {
    bg: '#4338CA',
    paths: [
      'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
    ],
  },
  'pin-store': {
    bg: '#10B981',
    paths: [
      'm2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7',
      'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8',
      'M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4',
      'M2 7h20',
    ],
  },
};

export function createCircularPinImageData(config: PinConfig): ImageData | null {
  if (typeof document === 'undefined' || typeof Path2D === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 88;
  canvas.height = 88;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = 44;
  const cy = 44;
  const radius = 34; // Đường kính 68px

  // 1. Bóng đổ mềm bên dưới
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  // 2. Hình tròn nền 68px
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = config.bg;
  ctx.fill();

  // 3. Viền trắng bao quanh lineWidth = 5
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  // 4. Biểu tượng nét mảnh Lucide ở tâm (lineWidth = 3.2)
  ctx.save();
  ctx.translate(cx, cy);
  const scale = 1.35;
  ctx.scale(scale, scale);
  ctx.translate(-12, -12);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3.2 / scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const d of config.paths) {
    ctx.stroke(new Path2D(d));
  }
  ctx.restore();

  // 5. Chấm tròn xanh ngọc online (pin-mechanic): đường kính 16px, viền trắng 3px, hướng 1h30 (68, 20)
  if (config.hasOnlineBadge) {
    ctx.shadowColor = 'rgba(15, 23, 42, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;

    ctx.beginPath();
    ctx.arc(68, 20, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  }

  ctx.restore();
  return ctx.getImageData(0, 0, 88, 88);
}

export function registerMotoSosMapIcons(map: MapLibreMap): void {
  if (typeof document === 'undefined') return;
  for (const [name, config] of Object.entries(PIN_CONFIGS)) {
    if (!map.hasImage(name)) {
      const imgData = createCircularPinImageData(config);
      if (imgData) {
        map.addImage(name, imgData, { pixelRatio: 2 });
      }
    }
  }
}
