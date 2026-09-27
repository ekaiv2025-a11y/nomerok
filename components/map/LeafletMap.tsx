"use client";

/* Карта OpenStreetMap. Загружается только в браузере (см. Map.tsx). */
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

export type MapPoint = { lat: number; lng: number; title?: string; subtitle?: string; href?: string; photo?: string | null };

export const BATUMI: [number, number] = [41.6413, 41.6359];

const pin = L.divIcon({
  className: "",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg"><path d="M17 43s15-14.6 15-26A15 15 0 0 0 2 17c0 11.4 15 26 15 26z" fill="#1f6b4f" stroke="#fff" stroke-width="2.5"/><circle cx="17" cy="17" r="5.5" fill="#fff"/></svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
  popupAnchor: [0, -38],
});

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 15 });
    else if (points.length === 1) map.setView([points[0].lat, points[0].lng], 15);
  }, [map, points]);
  return null;
}

function Picker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function Recenter({ at }: { at: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (at) map.setView(at, Math.max(map.getZoom(), 16));
  }, [map, at]);
  return null;
}

export default function LeafletMap({
  points = [],
  height = 320,
  editable,
  scrollZoom = false,
}: {
  points?: MapPoint[];
  height?: number;
  scrollZoom?: boolean;
  /** Режим выбора точки: клик по карте или перетаскивание метки */
  editable?: { value: [number, number] | null; onChange: (lat: number, lng: number) => void; focus?: [number, number] | null };
}) {
  const center: [number, number] = editable?.value ?? (points[0] ? [points[0].lat, points[0].lng] : BATUMI);
  return (
    <div style={{ height }} className="relative isolate z-0 overflow-hidden rounded-2xl border border-line">
      <MapContainer center={center} zoom={editable?.value || points.length === 1 ? 15 : 13} scrollWheelZoom={scrollZoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!editable && <FitBounds points={points} />}
        {!editable &&
          points.map((p, i) => (
            <Marker key={i} position={[p.lat, p.lng]} icon={pin}>
              {p.title && (
                <Popup>
                  <a href={p.href} style={{ display: "flex", gap: 10, alignItems: "center", textDecoration: "none", color: "inherit", minWidth: 180 }}>
                    {p.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
                    )}
                    <span>
                      <b style={{ display: "block", fontSize: 14 }}>{p.title}</b>
                      {p.subtitle && <span style={{ fontSize: 12, color: "#6b6a65" }}>{p.subtitle}</span>}
                    </span>
                  </a>
                </Popup>
              )}
            </Marker>
          ))}
        {editable && (
          <>
            <Picker onPick={editable.onChange} />
            <Recenter at={editable.focus ?? null} />
            {editable.value && (
              <Marker
                position={editable.value}
                icon={pin}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const ll = (e.target as L.Marker).getLatLng();
                    editable.onChange(ll.lat, ll.lng);
                  },
                }}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
