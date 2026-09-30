/** Ícones SVG inline (sem biblioteca externa). Decorativos por padrão. */
const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
}

const make = (paths) =>
  function Icon({ className = 'h-5 w-5', ...props }) {
    return (
      <svg {...base} className={className} {...props}>
        {paths}
      </svg>
    )
  }

export const CrownIcon = make(
  <>
    <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5L3 8z" />
    <path d="M5 21h14" />
  </>,
)
export const FabricIcon = make(
  <>
    <path d="M4 4h16v16H4z" />
    <path d="M4 9h16M4 14h16M9 4v16M14 4v16" opacity=".55" />
  </>,
)
export const BoltIcon = make(<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />)
export const ArrowRightIcon = make(<path d="M5 12h14M13 6l6 6-6 6" />)
export const ArrowDownIcon = make(<path d="M12 5v14M6 13l6 6 6-6" />)
export const ChevronLeftIcon = make(<path d="M15 18l-6-6 6-6" />)
export const ChevronRightIcon = make(<path d="M9 18l6-6-6-6" />)
export const CheckIcon = make(<path d="M5 12.5l4.5 4.5L19 7.5" />)
export const MenuIcon = make(<path d="M4 7h16M4 12h16M4 17h10" />)
export const CloseIcon = make(<path d="M6 6l12 12M18 6L6 18" />)
export const MapPinIcon = make(
  <>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </>,
)
export const ClockIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
)
export const TruckIcon = make(
  <>
    <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17.5" cy="18" r="1.8" />
  </>,
)
export const RotateIcon = make(
  <>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v4.5h-4.5" />
  </>,
)
export const PauseIcon = make(<path d="M9 5v14M15 5v14" />)
export const PlayIcon = make(<path d="M7 5l12 7-12 7V5z" />)
export const HandIcon = make(
  <>
    <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11" />
    <path d="M11 10.5V4a1.5 1.5 0 0 1 3 0v7" />
    <path d="M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6.5 7-3 0-4.5-1.5-6-4l-1.7-3a1.4 1.4 0 0 1 2.3-1.6L8 15" />
  </>,
)
export const SparkIcon = make(<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" />)
export const LinkIcon = make(
  <>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </>,
)
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />)

/* Ícones de marca (preenchidos) */
export function WhatsAppIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.73 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  )
}

export function InstagramIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true" focusable="false" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false" {...props}>
      <path d="M13.5 21.5v-8h2.7l.4-3.2h-3.1V8.3c0-.9.3-1.6 1.6-1.6h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4v3.2h2.8v8h3.3z" />
    </svg>
  )
}

/** Peça do rei (símbolo da marca). */
export function ChessKingMark({ className = 'h-8 w-8', title }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id="ri-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="1" stopColor="#d9a21e" />
        </linearGradient>
      </defs>
      <g fill="url(#ri-gold)">
        <rect x="30" y="5" width="4" height="12" rx="1" />
        <rect x="26" y="8.5" width="12" height="4" rx="1" />
        <path d="M19 19h26l-4.5 10h-17z" />
        <rect x="22" y="30.5" width="20" height="3.5" rx="1.75" />
        <path d="M25 35.5h14l3 14.5H22z" />
        <rect x="18" y="51" width="28" height="4" rx="2" />
        <rect x="15" y="56" width="34" height="4" rx="2" />
      </g>
    </svg>
  )
}
