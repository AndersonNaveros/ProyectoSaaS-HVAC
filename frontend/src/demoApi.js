// Datos exclusivamente ficticios para una presentación local sin backend.
// No usar este módulo para gestionar solicitudes reales.
export const demoCatalog = Object.freeze([
  { id: 1, type: 'PRODUCT', name: 'Termostato programable', sku: 'DEMO-TH-01', summary: 'Control de temperatura para instalaciones de climatización.', category: 'Control', mediaKey: 'control' },
  { id: 2, type: 'PRODUCT', name: 'Actuador para compuerta', sku: 'DEMO-AC-01', summary: 'Automatización de compuertas para sistemas de ventilación.', category: 'Control', mediaKey: 'control' },
  { id: 3, type: 'SERVICE', name: 'Diagnóstico técnico HVAC', sku: null, summary: 'Inspección inicial para identificar necesidades. Condiciones y tarifa por confirmar.', category: 'Diagnóstico', mediaKey: 'technical' },
  { id: 4, type: 'SERVICE', name: 'Mantenimiento preventivo', sku: null, summary: 'Revisión y cuidado de equipos según su estado y uso.', category: 'Mantenimiento', mediaKey: 'maintenance' },
  { id: 5, type: 'PRODUCT', name: 'Difusor de aire', sku: 'DEMO-DA-01', summary: 'Elemento de distribución de aire para sistemas de ventilación.', category: 'Ventilación', mediaKey: 'diffuser' },
  { id: 6, type: 'SERVICE', name: 'Instalación y puesta en marcha', sku: null, summary: 'Instalación y configuración de equipos, según alcance acordado.', category: 'Instalación', mediaKey: 'technical' },
  { id: 7, type: 'PRODUCT', name: 'Aire acondicionado split', sku: 'DEMO-SP-01', summary: 'Equipo de climatización para ambientes comerciales o residenciales.', category: 'Climatización', mediaKey: 'split' },
  { id: 8, type: 'PRODUCT', name: 'Cassette de cuatro vías', sku: 'DEMO-CA-01', summary: 'Equipo empotrable para distribuir aire en varias direcciones.', category: 'Climatización', mediaKey: 'cassette' },
  { id: 9, type: 'PRODUCT', name: 'Extractor para conductos', sku: 'DEMO-EX-01', summary: 'Componente de extracción y renovación de aire.', category: 'Ventilación', mediaKey: 'extractor' },
  { id: 10, type: 'PRODUCT', name: 'Unidad condensadora', sku: 'DEMO-UC-01', summary: 'Unidad exterior compatible con proyectos de climatización.', category: 'Climatización', mediaKey: 'condenser' },
  { id: 11, type: 'PRODUCT', name: 'Unidad manejadora de aire', sku: 'DEMO-UMA-01', summary: 'Equipo de tratamiento y distribución de aire.', category: 'Ventilación', mediaKey: 'handler' },
  { id: 12, type: 'SERVICE', name: 'Revisión de ventilación', sku: null, summary: 'Evaluación de condiciones de renovación de aire y conductos.', category: 'Diagnóstico', mediaKey: 'ducts' },
])

const TRACKING_KEY = 'hvac-demo-tracking-v1:'

export async function demoApi(path, options = {}) {
  if (path === '/catalog' && !options.method) return demoCatalog
  if (path === '/solicitudes' && options.method === 'POST') {
    const request = JSON.parse(options.body || '{}')
    if (!Array.isArray(request.lines) || request.lines.length === 0) throw new Error('Agrega al menos un elemento al carrito.')
    if (!request.contactName?.trim() || !/^[+\d ()-]{7,20}$/.test(request.contactPhone || '')) throw new Error('Revisa el nombre y teléfono del solicitante.')
    const lines = request.lines.map(line => {
      const item = demoCatalog.find(c => c.id === line.catalogItemId)
      if (!item || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 999) throw new Error('Hay un producto o cantidad inválida.')
      return { type: item.type, name: item.name, quantity: line.quantity }
    })
    const code = `DEMO-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const token = crypto.randomUUID() + crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const tracking = { code, status: 'REGISTERED', createdAt, lines }
    // Solo se conserva el estado y las líneas ficticias; nunca datos de contacto.
    localStorage.setItem(TRACKING_KEY + token, JSON.stringify(tracking))
    const whatsappSummary = `DEMO HVAC SOLUTIONS – Solicitud ${code}\n${lines.map(line => `• ${line.quantity} × ${line.name}`).join('\n')}\n\nEste mensaje es una demostración, no una cotización real.`
    return { code, token, alreadyRegistered: false, whatsappSummary }
  }
  if (path === '/tracking/lookup' && options.method === 'POST') {
    const { token } = JSON.parse(options.body || '{}')
    const saved = token ? localStorage.getItem(TRACKING_KEY + token) : null
    if (!saved) throw new Error('Enlace de demostración inválido.')
    return JSON.parse(saved)
  }
  throw new Error('Funcionalidad no disponible en el modo demostración.')
}
