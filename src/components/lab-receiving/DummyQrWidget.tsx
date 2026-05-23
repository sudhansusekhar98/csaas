import { useState } from 'react';
import { ScanLine } from 'lucide-react';

const GRID = 21;

function hashString(s: string): number[] {
  const cells: number[] = [];
  for (let i = 0; i < GRID * GRID; i++) {
    const charCode = s.charCodeAt(i % s.length) + i;
    cells.push(charCode % 3 === 0 ? 1 : 0);
  }
  const setFinder = (row: number, col: number) => {
    for (let r = row; r < row + 7; r++) {
      for (let c = col; c < col + 7; c++) {
        const edge = r === row || r === row + 6 || c === col || c === col + 6;
        const inner = r >= row + 2 && r <= row + 4 && c >= col + 2 && c <= col + 4;
        cells[r * GRID + c] = (edge || inner) ? 1 : 0;
      }
    }
  };
  setFinder(0, 0);
  setFinder(0, GRID - 7);
  setFinder(GRID - 7, 0);
  return cells;
}

// Generic "ready to scan" pattern shown when no specific sample is active
const IDLE_PATTERN = hashString('CSAAS-READY');

interface DummyQrWidgetProps {
  pendingIds: string[];
  onScan: (id: string) => void;
}

export default function DummyQrWidget({ pendingIds, onScan }: DummyQrWidgetProps) {
  const [scanIndex, setScanIndex] = useState(0);
  const [scanning, setScanning] = useState(false);

  const canScan = pendingIds.length > 0 && !scanning;
  const currentId = pendingIds[scanIndex % Math.max(pendingIds.length, 1)] ?? null;
  const cells = currentId ? hashString(currentId) : IDLE_PATTERN;

  const cellSize = 8;
  const size = GRID * cellSize;

  const handleSimulate = () => {
    if (!canScan || !currentId) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onScan(currentId);
      setScanIndex(i => i + 1);
    }, 700);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="label-caps text-center">
        {currentId ? `Ready to scan: ${currentId}` : 'No pending samples'}
      </p>

      <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
        scanning ? 'ring-4 ring-primary-indigo ring-offset-2 animate-pulse' : 'ring-1 ring-border-slate'
      } ${!canScan && !scanning ? 'opacity-30' : ''}`}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block"
          style={{ background: 'white' }}
        >
          {cells.map((filled, i) => {
            const row = Math.floor(i / GRID);
            const col = i % GRID;
            return filled ? (
              <rect
                key={i}
                x={col * cellSize}
                y={row * cellSize}
                width={cellSize}
                height={cellSize}
                fill={scanning ? '#4f46e5' : '#0f172a'}
              />
            ) : null;
          })}
        </svg>

        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-indigo/10">
            <ScanLine size={48} className="text-primary-indigo opacity-80 animate-bounce" />
          </div>
        )}
      </div>

      {pendingIds.length > 1 && !scanning && (
        <p className="text-[10px] text-text-slate-400 font-medium text-center">
          {pendingIds.length} samples queued · will cycle on each scan
        </p>
      )}

      <button
        onClick={handleSimulate}
        disabled={!canScan}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-indigo text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
      >
        <ScanLine size={14} />
        {scanning ? 'Scanning...' : 'Simulate Scan'}
      </button>
    </div>
  );
}
