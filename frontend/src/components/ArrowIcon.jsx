// Una sola flecha para los enlaces y botones de toda la interfaz
// Cambiamos la direccion segun el movimiento real que hace la acción
export default function ArrowIcon({ direction = 'right', size = 20 }) {
  const paths = {
    right: <><path d="M4 12h15"/><path d="m12 5 7 7-7 7"/></>,
    left: <><path d="M20 12H5"/><path d="m12 5-7 7 7 7"/></>,
    down: <><path d="M12 4v15"/><path d="m5 12 7 7 7-7"/></>,
  }
  return (
    <svg
      aria-hidden="true"
      className={`cta-arrow cta-arrow-${direction}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {paths[direction] || paths.right}
    </svg>
  )
}
