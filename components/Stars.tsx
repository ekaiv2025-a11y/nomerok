/** Звёзды оценки (только показ). */
export function Stars({ value, size = 16, className = "" }: { value: number; size?: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" width={size} height={size} aria-hidden className={i <= full ? "text-[#e5a50a]" : "text-[#dcd8cc]"}>
          <path
            fill="currentColor"
            d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
          />
        </svg>
      ))}
    </span>
  );
}

/** Короткая строка «★ 4.8 · 12 отзывов» для карточек и профиля. */
export function RatingLine({ rating, count, label }: { rating: number; count: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[14px]">
      <Stars value={rating} size={15} />
      <b>{rating.toFixed(1)}</b>
      <span className="text-muted">· {label}</span>
    </span>
  );
}
