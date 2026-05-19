import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { SampleRoute, Coord } from '../../types';
import { STEP_DEFINITIONS } from '../../data/sample-tracking-mock';

// ── Route colours ─────────────────────────────────────────────────────────────
const PARENT_COLOR = '#4F46E5'; // indigo
const CHILD_COLORS = ['#10B981', '#F59E0B', '#8B5CF6']; // emerald, amber, violet

function routeColor(index: number): string {
  return CHILD_COLORS[index % CHILD_COLORS.length];
}

// ── Numbered pin DivIcon ──────────────────────────────────────────────────────
function makePin(stepNum: number, color: string, status: string): L.DivIcon {
  const bg = status === 'breach' ? '#EF4444' : color;
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${bg};
      color:#fff;
      width:26px;height:26px;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:10px;font-weight:bold;
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
      ">${stepNum}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

// ── Auto-fit-bounds ───────────────────────────────────────────────────────────
function FitBounds({ coords }: { coords: Coord[] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 0) return;
    const bounds = L.latLngBounds(coords.map((c) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, coords]);
  return null;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface SampleMapViewProps {
  parentRoute: SampleRoute;
  childRoutes: SampleRoute[];
  onPinClick: (sampleId: string, stepIdx: number) => void;
}

export default function SampleMapView({ parentRoute, childRoutes, onPinClick }: SampleMapViewProps) {
  const allCoords: Coord[] = [
    ...parentRoute.polyline,
    ...childRoutes.flatMap((r) => r.polyline),
  ];

  const missingGpsCount =
    STEP_DEFINITIONS.length -
    parentRoute.pins.length +
    childRoutes.reduce((acc, r) => acc + (r.pins.length === 0 ? 1 : 0), 0);

  return (
    <div className="bg-white border border-border-slate rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 pt-5 pb-3 border-b border-slate-50 flex items-center gap-2">
        <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900">
          GPS Chain of Custody — Map View
        </h3>
      </div>

      <div className="relative">
        <MapContainer
          center={[17.5450, 78.5050]}
          zoom={15}
          className="h-[520px] w-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {allCoords.length > 0 && <FitBounds coords={allCoords} />}

          {/* Parent polyline */}
          {parentRoute.polyline.length > 1 && (
            <Polyline
              positions={parentRoute.polyline.map((c) => [c.lat, c.lng])}
              pathOptions={{ color: PARENT_COLOR, weight: 3, opacity: 0.8 }}
            />
          )}

          {/* Parent pins */}
          {parentRoute.pins.map((pin) => (
            <Marker
              key={`parent-${pin.stepNum}`}
              position={[pin.coord.lat, pin.coord.lng]}
              icon={makePin(pin.stepNum, PARENT_COLOR, pin.status)}
              title={`Step ${pin.stepNum}: ${STEP_DEFINITIONS[pin.stepNum - 1]?.title}`}
              eventHandlers={{
                click: () => onPinClick(parentRoute.sampleId, pin.stepNum - 1),
              }}
            >
              <Tooltip>{`Step ${pin.stepNum}: ${STEP_DEFINITIONS[pin.stepNum - 1]?.title}`}</Tooltip>
            </Marker>
          ))}

          {/* Child routes */}
          {childRoutes.map((childRoute, idx) => {
            const color = routeColor(idx);
            return (
              <span key={childRoute.sampleId}>
                {childRoute.polyline.length > 1 && (
                  <Polyline
                    positions={childRoute.polyline.map((c) => [c.lat, c.lng])}
                    pathOptions={{ color, weight: 2, opacity: 0.75, dashArray: '6 4' }}
                  />
                )}
                {childRoute.pins.map((pin) => (
                  <Marker
                    key={`child-${childRoute.sampleId}-${pin.stepNum}`}
                    position={[pin.coord.lat, pin.coord.lng]}
                    icon={makePin(pin.stepNum, color, pin.status)}
                    title={`${childRoute.sampleId} Step ${pin.stepNum}: ${STEP_DEFINITIONS[pin.stepNum - 1]?.title}`}
                    eventHandlers={{
                      click: () => onPinClick(childRoute.sampleId, pin.stepNum - 1),
                    }}
                  >
                    <Tooltip>{`${childRoute.sampleId} — Step ${pin.stepNum}: ${STEP_DEFINITIONS[pin.stepNum - 1]?.title}`}</Tooltip>
                  </Marker>
                ))}
              </span>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-border-slate shadow-sm text-[10px] space-y-1.5 min-w-[160px]">
          <p className="font-bold text-text-slate-900 uppercase tracking-widest text-[9px] mb-2">Legend</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 rounded-full" style={{ background: PARENT_COLOR }} />
            <span className="text-text-slate-600 font-medium">Parent route</span>
          </div>
          {childRoutes.map((cr, idx) => (
            <div key={cr.sampleId} className="flex items-center gap-2">
              <div className="w-3 h-1 rounded-full" style={{ background: routeColor(idx) }} />
              <span className="text-text-slate-600 font-medium data-mono">{cr.sampleId.replace('CHLD-', '')}</span>
            </div>
          ))}
          <div className="border-t border-slate-100 mt-1 pt-1 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success-emerald" />
              <span className="text-text-slate-600 font-medium">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-text-slate-600 font-medium">Breach</span>
            </div>
          </div>
          {missingGpsCount > 0 && (
            <p className="text-text-slate-400 font-medium border-t border-slate-100 pt-1 mt-1">
              {missingGpsCount} step{missingGpsCount > 1 ? 's' : ''} without GPS
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
