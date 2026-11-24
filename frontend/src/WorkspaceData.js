// Datos de ejemplo para recorrer interfaces de roles. Ningun cambio de este modulo
// se envia al backend ni sustituye la autorizacion que debe hacer Spring Security.
export const WORKSPACE_KEY = 'hvac-workspace-v14-showcase'
export const permissionOptions = [
  { id: 'agenda.view', label: 'Consultar agenda' },
  { id: 'agenda.edit', label: 'Modificar agenda' },
  { id: 'clients.view', label: 'Consultar clientes' },
  { id: 'clients.edit', label: 'Registrar clientes' },
  { id: 'work.view', label: 'Ver trabajos' },
  { id: 'work.update', label: 'Actualizar trabajos' },
  { id: 'docs.create', label: 'Redactar informes' },
  { id: 'inventory.view', label: 'Consultar inventario' },
]

export const seedWorkspace = {
  company: 'HVAC Controls',
  clientProfile: { clientId: 'CL-001', name: 'María Campos', email: 'maria.c@example.test', phone: '900 000 101' },
  clients: [
    { id: 'CL-001', name: 'María Campos', email: 'maria.c@example.test', phone: '900 000 101', district: 'Los Olivos' },
    { id: 'CL-002', name: 'Carlos Ramos', email: 'carlos.r@example.test', phone: '900 000 102', district: 'San Miguel' },
    { id: 'CL-003', name: 'Comercial Ejemplo S.A.C.', email: 'contacto@example.test', phone: '900 000 103', district: 'Surco' },
  ],
  suppliers: [
    { id: 'PR-001', name: 'Proveedor Clima Norte', category: 'Equipos', contact: 'compras@example.test' },
    { id: 'PR-002', name: 'Suministros Ventec', category: 'Repuestos', contact: 'ventas@example.test' },
  ],
  inventory: [
    { sku: 'DEMO-SP-01', name: 'Aire acondicionado split', stock: 14, minimum: 4 },
    { sku: 'DEMO-CA-01', name: 'Cassette de cuatro vias', stock: 7, minimum: 3 },
    { sku: 'DEMO-DA-01', name: 'Difusor de aire', stock: 22, minimum: 8 },
    { sku: 'DEMO-EX-01', name: 'Extractor para conductos', stock: 12, minimum: 5 },
  ],
  requests: [
    { id: 'SOL-0041', clientId: 'CL-001', description: 'Mantenimiento de aire acondicionado', status: 'Recibida', date: '2026-11-20' },
    { id: 'SOL-0042', clientId: 'CL-002', description: 'Revisión de ventilación', status: 'En evaluación', date: '2026-11-21' },
  ],
  workOrders: [
    { id: 'OT-0012', clientId: 'CL-001', description: 'Mantenimiento preventivo', assignedTo: 'TR-001', status: 'Programado', date: '2026-11-26', notes: 'Verificar filtros y registrar observaciones.' },
    { id: 'OT-0013', clientId: 'CL-002', description: 'Diagnóstico de ventilación', assignedTo: 'TR-002', status: 'En proceso', date: '2026-11-27', notes: 'Inspeccionar conductos y rejillas.' },
  ],
  roles: [
    { id: 'RL-01', name: 'Técnico', permissions: ['agenda.view', 'work.view', 'work.update', 'docs.create'] },
    { id: 'RL-02', name: 'Secretaría', permissions: ['agenda.view', 'agenda.edit', 'clients.view', 'clients.edit', 'work.view'] },
  ],
  workers: [
    { id: 'TR-001', name: 'Diego Torres', email: 'diego.t@example.test', roleId: 'RL-01', active: true },
    { id: 'TR-002', name: 'Ana Salas', email: 'ana.s@example.test', roleId: 'RL-02', active: true },
  ],
  companies: [
    { id: 'TEN-01', name: 'HVAC Controls', plan: 'Piloto', status: 'Activa' },
    { id: 'TEN-02', name: 'Empresa B (referencia)', plan: 'Evaluación', status: 'Suspendida' },
  ],
  documents: [
    { id: 'DOC-01', clientId: 'CL-001', workId: 'OT-0012', title: 'Resumen técnico de mantenimiento', description: 'Registro de revisión y recomendaciones.', date: '2026-11-20' },
  ],
  audit: [
    { id: 'EV-01', at: '2026-11-23 09:00', actor: 'Administrador', action: 'Inicio de recorrido de roles' },
  ],
}

export function cloneSeedWorkspace() { return JSON.parse(JSON.stringify(seedWorkspace)) }
export function loadWorkspace() {
  try {
    const stored = JSON.parse(localStorage.getItem(WORKSPACE_KEY) || 'null')
    if (stored && Array.isArray(stored.workOrders) && Array.isArray(stored.roles) && Array.isArray(stored.inventory)) return stored
  } catch (_) { /* Reiniciar si el almacenamiento esta corrupto */ }
  return cloneSeedWorkspace()
}
export function storeWorkspace(state) {
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(state))
}
export function hasPermission(state, workerId, permission) {
  const worker = state.workers.find(item => item.id === workerId && item.active)
  if (!worker) return false
  const role = state.roles.find(item => item.id === worker.roleId)
  return Boolean(role?.permissions?.includes(permission))
}
export function appendAudit(state, actor, action) {
  return { ...state, audit: [{ id: `EV-${Date.now()}`, at: new Date().toLocaleString('es-PE'), actor, action }, ...state.audit].slice(0, 80) }
}
export function updateCollection(state, key, id, changes, actor, activity) {
  const entry = state[key]?.find(item => item.id === id || item.sku === id)
  if (!entry) return state
  const updated = { ...state, [key]: state[key].map(item => item === entry ? { ...item, ...changes } : item) }
  return appendAudit(updated, actor, activity)
}
export function addCollection(state, key, record, actor, activity) {
  return appendAudit({ ...state, [key]: [record, ...state[key]] }, actor, activity)
}
export function toggleRolePermission(state, roleId, permission) {
  if (!permissionOptions.some(entry => entry.id === permission)) return state
  const role = state.roles.find(entry => entry.id === roleId)
  if (!role) return state
  const next = new Set(role.permissions)
  if (next.has(permission)) next.delete(permission); else next.add(permission)
  return updateCollection(state, 'roles', roleId, { permissions: [...next] }, 'Administrador', `Permisos actualizados para ${role.name}`)
}
export function downloadDemoReport(work, clientName) {
  const report = [
    'HVAC CONTROLS - INFORME DE SERVICIO (EJEMPLO)',
    '',
    `Orden: ${work.id}`,
    `Cliente: ${clientName || 'Cliente'}`,
    `Trabajo: ${work.description}`,
    `Estado: ${work.status}`,
    `Fecha: ${work.date}`,
    `Observaciones: ${work.notes || 'Sin observaciones'}`,
    '',
    'Documento de referencia generado para recorrer la interfaz.',
  ].join('\n')
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Informe${work.id.replace(/[^a-zA-Z0-9]/g, '')}.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
