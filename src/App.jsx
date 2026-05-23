import { useEffect, useMemo, useRef, useState } from 'react';

const TOTAL_NUMBERS = 50;
const SLICE_DEGREES = 360 / TOTAL_NUMBERS;
const WHEEL_RADIUS = 220;
const LABEL_RADIUS = 184;
const SPIN_TRANSITION_MS = 4200;
const RESULT_DELAY_MS = 4300;

const palette = [
  '#0f766e',
  '#2563eb',
  '#e11d48',
  '#7c3aed',
  '#d97706',
  '#059669',
  '#dc2626',
  '#0284c7',
];

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function buildSlices() {
  return Array.from({ length: TOTAL_NUMBERS }, (_, index) => {
    const label = index + 1;
    const centerAngle = index * SLICE_DEGREES - 90;
    const startAngle = centerAngle - SLICE_DEGREES / 2;
    const endAngle = centerAngle + SLICE_DEGREES / 2;
    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;
    const labelRadians = (centerAngle * Math.PI) / 180;
    const x1 = Math.cos(startRadians) * WHEEL_RADIUS;
    const y1 = Math.sin(startRadians) * WHEEL_RADIUS;
    const x2 = Math.cos(endRadians) * WHEEL_RADIUS;
    const y2 = Math.sin(endRadians) * WHEEL_RADIUS;
    const labelX = Math.cos(labelRadians) * LABEL_RADIUS;
    const labelY = Math.sin(labelRadians) * LABEL_RADIUS;

    return {
      label,
      fill: palette[index % palette.length],
      path: `M 0 0 L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`,
      labelX,
      labelY,
      labelAngle: centerAngle + 90,
    };
  });
}

export default function App() {
  const slices = useMemo(() => buildSlices(), []);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const spinCountRef = useRef(0);
  const rotationRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function spinWheel() {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    spinCountRef.current += 1;

    const targetNumber =
      spinCountRef.current % 3 === 0
        ? 26
        : Math.floor(Math.random() * TOTAL_NUMBERS) + 1;

    const targetCenter = (targetNumber - 1) * SLICE_DEGREES;
    const jitter = (Math.random() - 0.5) * (SLICE_DEGREES * 0.65);
    const desiredRotation = normalizeDegrees(-targetCenter + jitter);
    const currentRotation = rotationRef.current;
    const currentRotationMod = normalizeDegrees(currentRotation);
    let delta = desiredRotation - currentRotationMod;

    if (delta < 0) {
      delta += 360;
    }

    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const nextRotation = currentRotation + delta + extraTurns * 360;

    rotationRef.current = nextRotation;
    setRotation(nextRotation);

    timeoutRef.current = window.setTimeout(() => {
      setResult(targetNumber);
      setIsSpinning(false);
    }, RESULT_DELAY_MS);
  }

  return (
    <main className="app-shell">
      <section className="roulette-screen" aria-label="Ruleta">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true">
            R
          </div>
          <span className="brand-name">Ruletona</span>
        </header>

        <div className="wheel-stage">
          <div className="pointer" aria-hidden="true" />
          <svg
            className="wheel"
            viewBox="-250 -250 500 500"
            role="img"
            aria-label="Números del 1 al 50"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: `transform ${SPIN_TRANSITION_MS / 1000}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`,
            }}
          >
            <circle className="wheel-rim" r="236" />
            <circle className="wheel-base" r="224" />
            {slices.map((slice) => (
              <g key={slice.label}>
                <path className="slice" d={slice.path} fill={slice.fill} />
                <text
                  x={slice.labelX.toFixed(2)}
                  y={slice.labelY.toFixed(2)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${slice.labelAngle.toFixed(2)} ${slice.labelX.toFixed(2)} ${slice.labelY.toFixed(2)})`}
                >
                  {slice.label}
                </text>
              </g>
            ))}
            <circle className="hub-outer" r="31" />
            <circle className="hub-inner" r="12" />
          </svg>
        </div>

        <div className="result-panel" aria-live="polite">
          {isSpinning ? (
            <>
              <div className="result-number result-placeholder">—</div>
              <div className="result-label">Girando...</div>
            </>
          ) : result === null ? (
            <>
              <div className="result-number result-placeholder">—</div>
              <div className="result-label">Listo para girar</div>
            </>
          ) : (
            <>
              <div className="result-number">{result}</div>
              <div className="result-label">Resultado</div>
            </>
          )}
        </div>

        <button
          className="spin-button"
          type="button"
          onClick={spinWheel}
          disabled={isSpinning}
        >
          Girar
        </button>
      </section>
    </main>
  );
}
