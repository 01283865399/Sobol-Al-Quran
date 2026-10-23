import * as React from 'react';

const STORAGE_KEY = 'subul-glass-player-size-v1';
const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 460;
const MIN_WIDTH = 280;
const MIN_HEIGHT = 240;
const MAX_WIDTH = 960;

type ResizeEdge = 'left' | 'right' | 'top' | 'bottom';
type PlayerSize = { width: number | null; height: number | null };

const RESIZE_HANDLE_CLASSES: Record<ResizeEdge, string> = {
  left: 'glass-player-resize-handle--left',
  right: 'glass-player-resize-handle--right',
  top: 'glass-player-resize-handle--top',
  bottom: 'glass-player-resize-handle--bottom',
};

interface DragState {
  edge: ResizeEdge;
  pointerId: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
}

function getBounds() {
  const viewportWidth = typeof window === 'undefined' ? DEFAULT_WIDTH : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? 720 : window.innerHeight;
  const maxWidth = Math.max(1, Math.min(MAX_WIDTH, viewportWidth - 36));
  const minWidth = Math.min(MIN_WIDTH, maxWidth);
  const maxHeight = Math.max(160, viewportHeight - 118);
  const minHeight = Math.min(MIN_HEIGHT, maxHeight);

  return { minWidth, maxWidth, minHeight, maxHeight };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function readStoredSize(): PlayerSize {
  if (typeof window === 'undefined') return { width: null, height: null };
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return { width: null, height: null };
    const parsed: unknown = JSON.parse(rawValue);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new TypeError('Saved player size must be an object');
    }

    const { width, height } = parsed as Record<string, unknown>;
    if (
      (width !== null && width !== undefined && (typeof width !== 'number' || !Number.isFinite(width))) ||
      (height !== null && height !== undefined && (typeof height !== 'number' || !Number.isFinite(height)))
    ) {
      throw new TypeError('Saved player dimensions must be finite numbers');
    }

    const bounds = getBounds();
    return {
      width: typeof width === 'number' ? clamp(width, bounds.minWidth, bounds.maxWidth) : null,
      height: typeof height === 'number' ? clamp(height, bounds.minHeight, bounds.maxHeight) : null,
    };
  } catch (error) {
    console.error('Unable to load saved glass player size', error);
    return { width: null, height: null };
  }
}

function saveSize(size: PlayerSize) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
  } catch (error) {
    console.error('Unable to save glass player size', error);
  }
}

export function useGlassPlayerSize() {
  const [size, setSize] = React.useState<PlayerSize>(readStoredSize);
  const sizeRef = React.useRef(size);
  const dragRef = React.useRef<DragState | null>(null);
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const resizeToViewport = () => {
      const bounds = getBounds();
      const current = sizeRef.current;
      const nextSize = {
        width: current.width === null
          ? null
          : clamp(current.width, bounds.minWidth, bounds.maxWidth),
        height: current.height === null
          ? null
          : clamp(current.height, bounds.minHeight, bounds.maxHeight),
      };
      sizeRef.current = nextSize;
      setSize(nextSize);
    };

    window.addEventListener('resize', resizeToViewport);
    return () => window.removeEventListener('resize', resizeToViewport);
  }, []);

  React.useEffect(() => {
    if (size.width === null && size.height === null) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveSize(size), 150);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [size]);

  const updateFromDelta = React.useCallback((drag: DragState, deltaX: number, deltaY: number) => {
    const bounds = getBounds();
    const current = sizeRef.current;
    const nextSize = {
      width: drag.edge === 'left' || drag.edge === 'right'
        ? clamp(
            drag.width + (drag.edge === 'right' ? deltaX : -deltaX),
            bounds.minWidth,
            bounds.maxWidth
          )
        : current.width,
      height: drag.edge === 'top' || drag.edge === 'bottom'
        ? clamp(
            drag.height + (drag.edge === 'bottom' ? deltaY : -deltaY),
            bounds.minHeight,
            bounds.maxHeight
          )
        : current.height,
    };
    sizeRef.current = nextSize;
    setSize(nextSize);
  }, []);

  const handlePointerDown = React.useCallback((
    edge: ResizeEdge,
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const card = event.currentTarget.parentElement;
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    dragRef.current = {
      edge,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: bounds.width,
      height: bounds.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = React.useCallback((
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    updateFromDelta(drag, event.clientX - drag.startX, event.clientY - drag.startY);
  }, [updateFromDelta]);

  const finishPointerDrag = React.useCallback((
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveSize(sizeRef.current);
  }, []);

  const handleKeyDown = React.useCallback((
    edge: ResizeEdge,
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    const bounds = getBounds();
    const isHorizontal = edge === 'left' || edge === 'right';
    const currentSize = sizeRef.current;
    const currentValue = isHorizontal
      ? currentSize.width ?? Math.min(DEFAULT_WIDTH, bounds.maxWidth)
      : currentSize.height ?? Math.min(DEFAULT_HEIGHT, bounds.maxHeight);
    const minimum = isHorizontal ? bounds.minWidth : bounds.minHeight;
    const maximum = isHorizontal ? bounds.maxWidth : bounds.maxHeight;
    const increaseKey = isHorizontal
      ? edge === 'right' ? 'ArrowRight' : 'ArrowLeft'
      : edge === 'bottom' ? 'ArrowDown' : 'ArrowUp';
    const decreaseKey = isHorizontal
      ? edge === 'right' ? 'ArrowLeft' : 'ArrowRight'
      : edge === 'bottom' ? 'ArrowUp' : 'ArrowDown';

    let nextValue: number;
    if (event.key === increaseKey) {
      nextValue = currentValue + (event.shiftKey ? 48 : 16);
    } else if (event.key === decreaseKey) {
      nextValue = currentValue - (event.shiftKey ? 48 : 16);
    } else if (event.key === 'Home') {
      nextValue = minimum;
    } else if (event.key === 'End') {
      nextValue = maximum;
    } else {
      return;
    }

    event.preventDefault();
    const clampedValue = clamp(nextValue, minimum, maximum);
    const nextSize = isHorizontal
      ? { ...currentSize, width: clampedValue }
      : { ...currentSize, height: clampedValue };
    sizeRef.current = nextSize;
    setSize(nextSize);
    saveSize(nextSize);
  }, []);

  const style = React.useMemo<React.CSSProperties>(() => {
    const scale = clamp(Math.min(
      (size.width ?? DEFAULT_WIDTH) / DEFAULT_WIDTH,
      (size.height ?? 360) / 360
    ), 0.64, 1.25);

    return {
      '--glass-player-width': `${size.width ?? DEFAULT_WIDTH}px`,
      '--glass-player-padding': `${clamp(8, 14 * scale, 18)}px`,
      '--glass-player-gap': `${clamp(4, 12 * scale, 14)}px`,
      '--glass-player-track-height': `${clamp(40, 68 * scale, 78)}px`,
      '--glass-player-track-gap': `${clamp(7, 14 * scale, 18)}px`,
      '--glass-player-avatar-size': `${clamp(32, 50 * scale, 58)}px`,
      '--glass-player-control-size': `${clamp(32, 44 * scale, 52)}px`,
      '--glass-player-play-size': `${clamp(42, 58 * scale, 68)}px`,
      '--glass-player-favorite-size': `${clamp(34, 44 * scale, 48)}px`,
      '--glass-player-control-gap': `${clamp(8, 14 * scale, 18)}px`,
      '--glass-player-progress-track': `${clamp(3, 4 * scale, 5)}px`,
      '--glass-player-speed-font': `${clamp(11, 14 * scale, 15)}px`,
      '--glass-player-utility-height': `${clamp(34, 48 * scale, 56)}px`,
      '--glass-player-range-height': `${clamp(14, 20 * scale, 22)}px`,
      '--glass-player-time-font': `${clamp(10, 12 * scale, 13)}px`,
      '--glass-player-surah-font': `${clamp(15, 24 * scale, 27)}px`,
      '--glass-player-reciter-font': `${clamp(12, 16 * scale, 18)}px`,
      '--glass-player-status-font': `${clamp(10, 12 * scale, 14)}px`,
      '--glass-player-utility-font': `${clamp(10, 11 * scale, 13)}px`,
      '--glass-player-hadith-lines': scale < 0.8 ? '1' : '2',
      '--glass-player-radius': `${clamp(20, 28 * scale, 32)}px`,
      ...(size.height === null ? {} : { '--glass-player-height': `${size.height}px` }),
    } as React.CSSProperties;
  }, [size]);

  const handles = (['left', 'right', 'top', 'bottom'] as const).map((edge) => {
    const bounds = getBounds();
    const isHorizontal = edge === 'left' || edge === 'right';
    const currentValue = isHorizontal
      ? size.width ?? Math.min(DEFAULT_WIDTH, bounds.maxWidth)
      : size.height ?? Math.min(DEFAULT_HEIGHT, bounds.maxHeight);
    const minimum = isHorizontal ? bounds.minWidth : bounds.minHeight;
    const maximum = isHorizontal ? bounds.maxWidth : bounds.maxHeight;
    const label = isHorizontal ? 'عرض' : 'ارتفاع';

    return (
      <button
        key={edge}
        type="button"
        role="slider"
        className={`glass-player-resize-handle ${RESIZE_HANDLE_CLASSES[edge]}`}
        aria-controls="glass-listening-player"
        aria-label={`تغيير ${label} المشغل`}
        aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
        aria-valuemin={Math.round(minimum)}
        aria-valuemax={Math.round(maximum)}
        aria-valuenow={Math.round(currentValue)}
        aria-valuetext={`${label} المشغل ${Math.round(currentValue)} بكسل`}
        title={`اسحب لتغيير ${label} المشغل`}
        onPointerDown={(event) => handlePointerDown(edge, event)}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={finishPointerDrag}
        onLostPointerCapture={finishPointerDrag}
        onKeyDown={(event) => handleKeyDown(edge, event)}
      >
        <span aria-hidden="true" />
      </button>
    );
  });

  return { style, handles };
}