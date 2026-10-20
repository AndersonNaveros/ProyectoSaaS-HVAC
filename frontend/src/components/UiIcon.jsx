// Iconos de interfaz propios, consistentes con el estilo visual de HVAC
const paths = {
  message: <><path d="M4 5.5h16v11H9l-5 4v-15Z"/><path d="M8 9h8M8 13h5"/></>,
  evaluate: <><path d="m4 20 7-16 9 16"/><path d="M7 14h10"/><path d="m15.8 6.7 2-2 2.3 2.3-2 2"/></>,
  agree: <><path d="M8 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="m9 12 3 3L21 5"/></>,
  document: <><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v6h5M9 13h6M9 17h6"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  phone: <path d="M7 3H5a2 2 0 0 0-2 2c0 9 7 16 16 16a2 2 0 0 0 2-2v-2l-5-3-2 2a14 14 0 0 1-6-6l2-2-3-5Z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  equipment: <><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M7 9h10M7 13h10M7 16h4"/></>,
  wind: <><path d="M3 8h12c4 0 4-5 1-5-2 0-3 1-3 2M3 12h16M3 16h11c4 0 4 5 1 5-2 0-3-1-3-2"/></>,
  wrench: <path d="M20 7a6 6 0 0 1-8 6l-7 7a2 2 0 0 1-3-3l7-7a6 6 0 0 1 8-8l-4 4 4 4 3-3Z"/>,
  shield: <><path d="M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></>,
}

export default function UiIcon({ name, size = 26, className = '' }) {
  return <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name] || paths.equipment}</svg>
}
