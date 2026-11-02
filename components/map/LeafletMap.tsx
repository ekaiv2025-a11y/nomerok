"use client";

/* Карта OpenStreetMap. Загружается только в браузере (см. Map.tsx). */
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";

export type MapPoint = {
  lat: number;
  lng: number;
  title?: string;
  subtitle?: string;
  href?: string;
  photo?: string | null;
  label?: string | number;
  /** карточка специалиста во всплывающем окне */
  card?: { cat: string; tip: string; rating: string | null; price: string; verified: boolean; bonus: string | null; cta: string };
};

/** Метка с номером — для подборок (номер совпадает с номером в списке). */
const numbered = (n: string | number) =>
  L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;border-radius:50%;background:#1f6b4f;color:#fff;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font:700 13px/1 system-ui,sans-serif">${String(n).replace(/[^\w]/g, "")}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });

export const BATUMI: [number, number] = [41.6413, 41.6359];

/** Метка специалиста с бонусом — янтарная, с подарком. */
const bonusPin = L.divIcon({
  className: "",
  html: `<svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg"><path d="M19 47s17-16 17-28.5A17 17 0 0 0 2 18.5C2 31 19 47 19 47z" fill="#e0a526" stroke="#fff" stroke-width="2.5"/><text x="19" y="25" text-anchor="middle" font-size="16">🎁</text></svg>`,
  iconSize: [38, 48],
  iconAnchor: [19, 47],
  popupAnchor: [0, -42],
});

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
  scrollZoom = true,
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
            <Marker
              key={i}
              position={[p.lat, p.lng]}
              icon={p.label != null ? numbered(p.label) : p.card?.bonus ? bonusPin : pin}
              zIndexOffset={p.card?.bonus ? 500 : 0}
              // карточка специалиста открывается уже при наведении (на телефоне — по нажатию)
              eventHandlers={p.card ? { mouseover: (e) => (e.target as L.Marker).openPopup() } : undefined}
            >
              {p.title && !p.card && (
                <Tooltip direction="top" offset={p.label != null ? [0, -14] : [0, -40]} opacity={1}>
                  <b>{p.title}</b>
                </Tooltip>
              )}
              {p.title && (
                <Popup minWidth={230} maxWidth={260}>
                  {p.card ? (
                    <a href={p.href} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                      {p.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photo} alt="" style={{ width: "100%", height: 130, borderRadius: 12, objectFit: "cover", display: "block" }} />
                      )}
                      <b style={{ display: "block", fontSize: 15, marginTop: 8, lineHeight: 1.25 }}>
                        {p.title} {p.card.verified && <span style={{ color: "#1f6b4f" }}>✔</span>}
                      </b>
                      <span style={{ display: "block", fontSize: 12.5, color: "#6b6a65", marginTop: 2 }}>
                        {p.card.cat}
                        {p.card.rating ? ` · ${p.card.rating}` : ""}
                      </span>
                      {p.card.bonus && (
                        <span style={{ display: "block", marginTop: 6, background: "#fdf3dc", color: "#6b4f12", borderRadius: 8, padding: "4px 8px", fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>🎁 {p.card.bonus}</span>
                      )}
                      {p.subtitle && <span style={{ display: "block", fontSize: 12, color: "#6b6a65", marginTop: 6 }}>📍 {p.subtitle}</span>}
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
                        <b style={{ fontSize: 13 }}>{p.card.price}</b>
                        <span style={{ background: "#1f6b4f", color: "#fff", borderRadius: 999, padding: "5px 11px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{p.card.cta} →</span>
                      </span>
                    </a>
                  ) : (
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
                  )}
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
