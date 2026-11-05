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
const numbered = (n: string | number, on = false) =>
  L.divIcon({
    className: "",
    html: `<div style="width:${on ? 38 : 30}px;height:${on ? 38 : 30}px;border-radius:50%;background:${on ? "#e0a526" : "#1f6b4f"};color:${on ? "#1c1c1a" : "#fff"};border:2.5px solid #fff;box-shadow:0 2px ${on ? 10 : 6}px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font:700 ${on ? 15 : 13}px/1 system-ui,sans-serif">${String(n).replace(/[^\w]/g, "")}</div>`,
    iconSize: on ? [38, 38] : [30, 30],
    iconAnchor: on ? [19, 19] : [15, 15],
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

function Recenter({ at, zoom = 16 }: { at: [number, number] | null; zoom?: number }) {
  const map = useMap();
  const lat = at?.[0];
  const lng = at?.[1];
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], Math.max(map.getZoom(), zoom), { animate: true });
  }, [map, lat, lng, zoom]);
  return null;
}

/** Компактная карточка специалиста: фото слева, имя, направление, бонус, цена. */
function MiniCard({ p }: { p: MapPoint }) {
  const c = p.card!;
  return (
    <span style={{ display: "flex", gap: 10, alignItems: "flex-start", width: 240, whiteSpace: "normal", textAlign: "left" }}>
      {p.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.photo} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", flex: "none" }} />
      ) : (
        <span style={{ width: 56, height: 56, borderRadius: 12, background: "#e7f2ec", color: "#1f6b4f", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18, flex: "none" }}>{(p.title ?? "?").slice(0, 2).toUpperCase()}</span>
      )}
      <span style={{ minWidth: 0 }}>
        <b style={{ display: "block", fontSize: 14, lineHeight: 1.25, color: "#1c1b18" }}>
          {p.title} {c.verified && <span style={{ color: "#1f6b4f" }}>✔</span>}
        </b>
        <span style={{ display: "block", fontSize: 12, color: "#6b6a65", marginTop: 1 }}>
          {c.cat}
          {c.rating ? ` · ${c.rating}` : ""}
        </span>
        {c.bonus && <span style={{ display: "block", marginTop: 4, background: "#fdf3dc", color: "#6b4f12", borderRadius: 6, padding: "2px 6px", fontSize: 11.5, fontWeight: 600, lineHeight: 1.3 }}>🎁 {c.bonus}</span>}
        <b style={{ display: "block", fontSize: 12.5, marginTop: 4, color: "#1c1b18" }}>{c.price}</b>
      </span>
    </span>
  );
}

export default function LeafletMap({
  points = [],
  height = 320,
  editable,
  scrollZoom = true,
  active = null,
  focus = null,
  onSelect,
}: {
  points?: MapPoint[];
  /** выбранная метка (номер в списке подсвечивается и карта к ней перемещается) */
  active?: number | null;
  /** к какой метке переместить карту */
  focus?: number | null;
  onSelect?: (i: number) => void;
  height?: number;
  scrollZoom?: boolean;
  /** Режим выбора точки: клик по карте или перетаскивание метки */
  editable?: { value: [number, number] | null; onChange: (lat: number, lng: number) => void; focus?: [number, number] | null };
}) {
  // телефон/планшет: наведения нет — карточка по нажатию
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const center: [number, number] = editable?.value ?? (points[0] ? [points[0].lat, points[0].lng] : BATUMI);
  return (
    <div style={{ height }} className="relative isolate z-0 overflow-hidden rounded-2xl border border-line">
      <MapContainer center={center} zoom={editable?.value || points.length === 1 ? 15 : 13} scrollWheelZoom={scrollZoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!editable && <FitBounds points={points} />}
        {!editable && focus != null && points[focus] && <Recenter at={[points[focus].lat, points[focus].lng]} zoom={15} />}
        {!editable &&
          points.map((p, i) => (
            <Marker
              key={i}
              position={[p.lat, p.lng]}
              icon={p.label != null ? numbered(p.label, active === i) : p.card?.bonus ? bonusPin : pin}
              zIndexOffset={active === i ? 1000 : p.card?.bonus ? 500 : 0}
              // компьютер: наведение — маленькая карточка, щелчок — сразу анкета; телефон: нажатие — карточка с кнопкой
              eventHandlers={onSelect ? { click: () => onSelect(i) } : p.card && p.href && !touch ? { click: () => (window.location.href = p.href!) } : undefined}
            >
              {p.title && (!p.card || !touch) && (
                <Tooltip direction="top" offset={p.label != null ? [0, -14] : [0, -40]} opacity={1} className={p.card ? "nm-tip" : undefined}>
                  {p.card ? <MiniCard p={p} /> : <b>{p.title}</b>}
                </Tooltip>
              )}
              {p.title && (!p.card || touch) && (
                <Popup minWidth={220} maxWidth={260} closeButton={false}>
                  {p.card ? (
                    <a href={p.href} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                      <MiniCard p={p} />
                      <span style={{ display: "block", marginTop: 8, textAlign: "center", background: "#1f6b4f", color: "#fff", borderRadius: 999, padding: "6px 11px", fontSize: 12.5, fontWeight: 700 }}>{p.card.cta} →</span>
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
