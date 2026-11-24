import { useEffect, useMemo, useState } from 'react'
import ArrowIcon from './ArrowIcon.jsx'
import UiIcon from './UiIcon.jsx'
import {
  WORKSPACE_KEY, seedWorkspace, cloneSeedWorkspace, loadWorkspace, storeWorkspace,
  hasPermission, appendAudit, addCollection, updateCollection,
  toggleRolePermission, permissionOptions, downloadDemoReport,
} from '../WorkspaceData.js'

const menus = {
  client: [['overview', 'Mi inicio', 'equipment'], ['requests', 'Mis solicitudes', 'document'], ['works', 'Mis servicios', 'wrench'], ['documents', 'Mis documentos', 'document'], ['profile', 'Mi perfil', 'agree']],
  admin: [['overview', 'Resumen', 'equipment'], ['inventory', 'Productos y stock', 'equipment'], ['requests', 'Solicitudes', 'document'], ['clients', 'Clientes', 'message'], ['suppliers', 'Proveedores', 'wind'], ['agenda', 'Agenda', 'clock'], ['works', 'Trabajos y documentos', 'wrench'], ['workers', 'Trabajadores', 'message'], ['roles', 'Roles y permisos', 'shield'], ['audit', 'Registro de actividad', 'document']],
  worker: [['overview', 'Mi jornada', 'equipment'], ['agenda', 'Agenda', 'clock'], ['works', 'Mis trabajos', 'wrench'], ['clients', 'Clientes', 'message'], ['documents', 'Informes', 'document'], ['inventory', 'Inventario', 'equipment']],
  developer: [['overview', 'Plataforma', 'equipment'], ['companies', 'Empresas', 'wind'], ['architecture', 'Arquitectura', 'shield'], ['audit', 'Actividad', 'document']],
}
const roles = [
  ['client', 'Cliente', 'Historial y solicitudes'],
  ['admin', 'Administrador', 'Gestion de la empresa'],
  ['worker', 'Trabajador', 'Atenciones asignadas'],
  ['developer', 'Desarrollador', 'Plataforma SaaS'],
]
const roleLabel = key => roles.find(role => role[0] === key)?.[1] || 'Cliente'
const resolveClient = (state, id) => state.clients.find(item => item.id === id)?.name || 'Cliente de ejemplo'
const resolveWorker = (state, id) => state.workers.find(item => item.id === id)?.name || 'Sin asignar'
const makeId = prefix => `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
const formatISO = () => new Date().toISOString().slice(0, 10)

function Panel({ title, subtitle, actions, children, className = '' }) {
  return <section className={`workspace-panel ${className}`}>
    {(title || actions) && <div className="workspace-panel-heading"><div>{title && <h2>{title}</h2>}{subtitle && <p>{subtitle}</p>}</div>{actions}</div>}
    {children}
  </section>
}
function Empty({ text = 'Todavia no hay registros en esta seccion.' }) {
  return <div className="workspace-empty"><UiIcon name="document" size={30} /><span>{text}</span></div>
}
function Status({ value }) {
  const positive = ['Finalizado', 'Completado', 'Activa', 'Activo', 'Emitida', 'Confirmado'].includes(value)
  const negative = ['Cancelado', 'Suspendida', 'Inactivo'].includes(value)
  return <span className={`workspace-status ${positive ? 'positive' : negative ? 'negative' : ''}`}>{value}</span>
}
function Stat({ icon, label, value, detail }) {
  return <div className="workspace-stat"><span className="workspace-stat-icon"><UiIcon name={icon} size={23}/></span><div><span className="workspace-stat-label">{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div></div>
}
function RecordTable({ headings, children }) {
  return <div className="workspace-table-scroll"><table className="workspace-table"><thead><tr>{headings.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
}
function MiniForm({ children, onSubmit, submitLabel = 'Guardar registro' }) {
  return <form className="workspace-inline-form" onSubmit={onSubmit}>{children}<button className="workspace-button primary-workspace" type="submit">{submitLabel}<ArrowIcon size={18}/></button></form>
}
function ActionsButton({ children, onClick, variant = 'quiet', disabled = false }) {
  return <button type="button" disabled={disabled} className={`workspace-button ${variant}`} onClick={onClick}>{children}</button>
}
function ClientPortal({ state, change, tab, setTab, notify }) {
  const profile = state.clientProfile
  const clientId = profile.clientId || ''
  const requests = state.requests.filter(item => item.clientId === clientId)
  const works = state.workOrders.filter(item => item.clientId === clientId)
  const documents = state.documents.filter(item => item.clientId === clientId)
  const [signupOpen, setSignupOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [requestText, setRequestText] = useState('')
  const [editProfile, setEditProfile] = useState({ name: profile.name, email: profile.email, phone: profile.phone })
  useEffect(() => setEditProfile({ name: profile.name, email: profile.email, phone: profile.phone }), [profile.name, profile.email, profile.phone])
  function register(e) {
    e.preventDefault()
    const id = makeId('CL')
    const record = { id, name: name.trim(), email: email.trim(), phone: phone.trim(), district: 'Por coordinar' }
    change(prev => appendAudit({ ...prev, clients: [record, ...prev.clients], clientProfile: { name: record.name, email: record.email, phone: record.phone, clientId: id } }, 'Cliente', `Perfil local creado para ${record.name}`))
    setSignupOpen(false); setTab('overview'); notify('Perfil local creado')
  }
  function selectExample() {
    change(prev => ({ ...prev, clientProfile: { ...seedWorkspace.clientProfile, clientId: 'CL-001' } }))
    setSignupOpen(false); setTab('overview'); notify('Perfil de ejemplo abierto')
  }
  function submitRequest(e) {
    e.preventDefault()
    if (!requestText.trim()) return
    change(prev => addCollection(prev, 'requests', { id: makeId('SOL'), clientId, description: requestText.trim(), status: 'Recibida', date: formatISO() }, 'Cliente', 'Nueva solicitud del portal'))
    setRequestText(''); setTab('requests'); notify('Solicitud guardada en el recorrido de roles')
  }
  const header = <div className="workspace-client-welcome"><div><span className="workspace-kicker">AREA DEL CLIENTE</span><h2>Hola, {profile.name.split(' ')[0] || 'cliente'}.</h2><p>Consulta tus solicitudes, servicios y documentos desde un mismo lugar.</p></div><ActionsButton onClick={() => setSignupOpen(v => !v)}>{signupOpen ? 'Cancelar' : 'Crear perfil local'}</ActionsButton></div>
  if (tab === 'overview') return <>
    {header}
    {signupOpen && <Panel title="Registrar un perfil" subtitle="Para recorrer el flujo de registro sin usar contraseñas ni datos reales."><MiniForm onSubmit={register} submitLabel="Crear perfil"><label>Nombre<input required maxLength={90} value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de ejemplo"/></label><label>Correo de ejemplo<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="persona@example.test"/></label><label>Telefono<input required minLength={7} maxLength={20} value={phone} onChange={e => setPhone(e.target.value)} placeholder="900 000 000"/></label></MiniForm><ActionsButton onClick={selectExample}>Entrar con cliente de ejemplo</ActionsButton></Panel>}
    <div className="workspace-stats"><Stat icon="document" label="Mis solicitudes" value={requests.length} detail="Registradas"/><Stat icon="wrench" label="Mis servicios" value={works.length} detail="Atenciones"/><Stat icon="document" label="Mis documentos" value={documents.length} detail="Disponibles"/></div>
    <Panel title="Preparar una consulta" subtitle="Agrega una solicitud para visualizarla tambien en el panel administrativo."><MiniForm onSubmit={submitRequest} submitLabel="Enviar solicitud"><label className="workspace-form-grow">¿Que necesitas?<input required value={requestText} maxLength={180} onChange={e => setRequestText(e.target.value)} placeholder="Ej. Mantenimiento de un equipo split"/></label></MiniForm></Panel>
    <div className="workspace-two-columns"><Panel title="Solicitudes recientes" actions={<ActionsButton onClick={() => setTab('requests')}>Ver todas <ArrowIcon size={17}/></ActionsButton>}>{requests.length ? requests.slice(0, 3).map(item => <div className="workspace-list-row" key={item.id}><div><strong>{item.description}</strong><small>{item.id} · {item.date}</small></div><Status value={item.status}/></div>) : <Empty/>}</Panel><Panel title="Atenciones registradas" actions={<ActionsButton onClick={() => setTab('works')}>Mis servicios <ArrowIcon size={17}/></ActionsButton>}>{works.length ? works.map(item => <div className="workspace-list-row" key={item.id}><div><strong>{item.description}</strong><small>{item.id} · {item.date}</small></div><Status value={item.status}/></div>) : <Empty/>}</Panel></div>
  </>
  if (tab === 'requests') return <Panel title="Mis solicitudes" subtitle="Seguimiento de las consultas asociadas al perfil seleccionado.">{requests.length ? <RecordTable headings={['Referencia', 'Solicitud', 'Fecha', 'Estado']}>{requests.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.description}</td><td>{r.date}</td><td><Status value={r.status}/></td></tr>)}</RecordTable> : <Empty/>}</Panel>
  if (tab === 'works') return <Panel title="Mis servicios" subtitle="Estado de los trabajos vinculados a tu perfil.">{works.length ? <RecordTable headings={['Orden', 'Servicio', 'Fecha', 'Estado']}>{works.map(w => <tr key={w.id}><td>{w.id}</td><td>{w.description}</td><td>{w.date}</td><td><Status value={w.status}/></td></tr>)}</RecordTable> : <Empty/>}</Panel>
  if (tab === 'documents') return <Panel title="Mis documentos" subtitle="Descarga un resumen de referencia de las ordenes registradas.">{documents.length ? documents.map(d => {const w = works.find(item => item.id === d.workId); return <div className="workspace-list-row" key={d.id}><div><strong>{d.title}</strong><small>{d.description} · {d.date}</small></div><ActionsButton disabled={!w} onClick={() => downloadDemoReport(w, profile.name)}>Descargar <ArrowIcon size={17}/></ActionsButton></div>}) : <Empty text="Cuando se adjunten informes apareceran en esta seccion."/>}</Panel>
  return <Panel title="Mi perfil" subtitle="Edita la informacion de tu perfil de recorrido."><MiniForm submitLabel="Guardar cambios" onSubmit={e => {e.preventDefault(); change(prev => ({ ...prev, clientProfile: { ...prev.clientProfile, ...editProfile } })); notify('Perfil actualizado')}}><label>Nombre<input value={editProfile.name} required onChange={e => setEditProfile(p => ({ ...p, name: e.target.value }))}/></label><label>Correo<input type="email" required value={editProfile.email} onChange={e => setEditProfile(p => ({ ...p, email: e.target.value }))}/></label><label>Telefono<input required value={editProfile.phone} onChange={e => setEditProfile(p => ({ ...p, phone: e.target.value }))}/></label></MiniForm><p className="workspace-hint">Los perfiles y sus cambios se conservan unicamente en este navegador.</p></Panel>
}

function AdminPortal({ state, change, tab, setTab, notify }) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [supplierContact, setSupplierContact] = useState('')
  const [workClient, setWorkClient] = useState('CL-001')
  const [workWorker, setWorkWorker] = useState('TR-001')
  const [workDescription, setWorkDescription] = useState('')
  const [workDate, setWorkDate] = useState('2026-11-26')
  const [workerName, setWorkerName] = useState('')
  const [workerEmail, setWorkerEmail] = useState('')
  const [roleName, setRoleName] = useState('')
  const [search, setSearch] = useState('')
  const [stockReason, setStockReason] = useState('Reposicion o ajuste autorizado')
  const lowStock = state.inventory.filter(i => i.stock <= i.minimum)
  const pending = state.requests.filter(i => i.status !== 'Finalizada' && i.status !== 'Cancelada')
  function setStock(item, amount) {
    if (!stockReason.trim() || item.stock + amount < 0) { notify('Indica un motivo y evita cantidades negativas'); return }
    change(s => updateCollection(s, 'inventory', item.sku, { stock: item.stock + amount }, 'Administrador', `${amount > 0 ? 'Entrada' : 'Salida'} ${Math.abs(amount)} en ${item.sku}: ${stockReason.trim()}`))
    notify('Movimiento registrado en inventario local')
  }
  if (tab === 'overview') return <>
    <div className="workspace-section-title"><span className="workspace-kicker">PANEL DE GESTION</span><h2>Lo importante, a la vista.</h2><p>Control de solicitudes, equipos, personas y atenciones de la empresa.</p></div>
    <div className="workspace-stats"><Stat icon="message" label="Solicitudes por atender" value={pending.length}/><Stat icon="equipment" label="Equipos registrados" value={state.inventory.length}/><Stat icon="wrench" label="Trabajos activos" value={state.workOrders.filter(x => x.status !== 'Finalizado').length}/><Stat icon="shield" label="Alertas de stock" value={lowStock.length}/></div>
    <div className="workspace-two-columns"><Panel title="Solicitudes recientes" actions={<ActionsButton onClick={() => setTab('requests')}>Gestionar <ArrowIcon size={17}/></ActionsButton>}>{state.requests.slice(0, 4).map(r => <div className="workspace-list-row" key={r.id}><div><strong>{r.description}</strong><small>{resolveClient(state, r.clientId)} · {r.id}</small></div><Status value={r.status}/></div>)}</Panel><Panel title="Proximos trabajos" actions={<ActionsButton onClick={() => setTab('agenda')}>Abrir agenda <ArrowIcon size={17}/></ActionsButton>}>{state.workOrders.slice(0, 4).map(w => <div className="workspace-list-row" key={w.id}><div><strong>{w.description}</strong><small>{w.date} · {resolveWorker(state, w.assignedTo)}</small></div><Status value={w.status}/></div>)}</Panel></div>
  </>
  if (tab === 'inventory') return <Panel title="Productos y stock" subtitle="Control interno de existencias y movimientos. Los precios y cantidades no aparecen en el catalogo publico."><label className="workspace-form-alone">Motivo del ajuste<input maxLength={100} value={stockReason} onChange={e => setStockReason(e.target.value)}/></label><RecordTable headings={['Producto', 'SKU', 'Existencias', 'Minimo', 'Ajustar']}>{state.inventory.map(item => <tr key={item.sku}><td><strong>{item.name}</strong></td><td>{item.sku}</td><td><Status value={item.stock <= item.minimum ? `Bajo: ${item.stock}` : String(item.stock)}/></td><td>{item.minimum}</td><td><div className="workspace-quantity"><ActionsButton onClick={() => setStock(item, -1)} disabled={item.stock === 0}>−</ActionsButton><ActionsButton onClick={() => setStock(item, 1)}>＋</ActionsButton></div></td></tr>)}</RecordTable><p className="workspace-hint">Los movimientos se reflejan en el historial de actividad de este recorrido.</p></Panel>
  if (tab === 'requests') return <Panel title="Solicitudes y comunicaciones" subtitle="Organiza las peticiones antes de emitir una propuesta tecnica privada.">{state.requests.length ? <RecordTable headings={['Codigo', 'Cliente', 'Requerimiento', 'Estado']}>{state.requests.map(item => <tr key={item.id}><td>{item.id}</td><td>{resolveClient(state, item.clientId)}</td><td>{item.description}</td><td><select aria-label={`Estado ${item.id}`} value={item.status} onChange={e => change(s => updateCollection(s, 'requests', item.id, { status: e.target.value }, 'Administrador', `Solicitud ${item.id} actualizada a ${e.target.value}`))}>{['Recibida', 'En evaluación', 'Propuesta enviada', 'Finalizada', 'Cancelada'].map(status => <option key={status}>{status}</option>)}</select></td></tr>)}</RecordTable> : <Empty/>}</Panel>
  if (tab === 'clients') return <Panel title="Directorio de clientes" subtitle="Consulta y registra los contactos con los que trabaja la empresa."><MiniForm onSubmit={e => {e.preventDefault(); const rec = { id: makeId('CL'), name: customerName.trim(), email: customerEmail.trim(), phone: 'Por registrar', district: 'Por coordinar' }; change(s => addCollection(s, 'clients', rec, 'Administrador', `Cliente registrado: ${rec.name}`)); setCustomerName(''); setCustomerEmail(''); notify('Cliente agregado')}} submitLabel="Nuevo cliente"><label>Nombre<input required value={customerName} onChange={e => setCustomerName(e.target.value)}/></label><label>Correo<input type="email" required value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}/></label></MiniForm><label className="workspace-form-alone">Buscar cliente<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre o correo"/></label><RecordTable headings={['Cliente', 'Correo', 'Zona', 'Referencia']}>{state.clients.filter(c => `${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase())).map(item => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.email}</td><td>{item.district}</td><td>{item.id}</td></tr>)}</RecordTable></Panel>
  if (tab === 'suppliers') return <Panel title="Proveedores" subtitle="Centraliza contactos y proveedores de equipos o repuestos."><MiniForm onSubmit={e => {e.preventDefault(); const rec = { id: makeId('PR'), name: supplierName.trim(), category: 'General', contact: supplierContact.trim() }; change(s => addCollection(s, 'suppliers', rec, 'Administrador', `Proveedor registrado: ${rec.name}`)); setSupplierName(''); setSupplierContact(''); notify('Proveedor agregado')}} submitLabel="Nuevo proveedor"><label>Empresa<input required value={supplierName} onChange={e => setSupplierName(e.target.value)}/></label><label>Contacto<input type="email" required value={supplierContact} onChange={e => setSupplierContact(e.target.value)}/></label></MiniForm><RecordTable headings={['Proveedor', 'Categoria', 'Correo']}>{state.suppliers.map(item => <tr key={item.id}><td>{item.name}</td><td>{item.category}</td><td>{item.contact}</td></tr>)}</RecordTable></Panel>
  if (tab === 'agenda') return <Panel title="Agenda de atenciones" subtitle="Programa trabajos y asigna al personal responsable."><MiniForm submitLabel="Programar trabajo" onSubmit={e => { e.preventDefault(); const rec = { id: makeId('OT'), clientId: workClient, assignedTo: workWorker, description: workDescription.trim(), status: 'Programado', date: workDate, notes: '' }; change(s => addCollection(s, 'workOrders', rec, 'Administrador', `Trabajo ${rec.id} programado`)); setWorkDescription(''); notify('Trabajo programado')}}><label className="workspace-form-grow">Servicio<input required value={workDescription} onChange={e => setWorkDescription(e.target.value)} placeholder="Descripcion de la visita"/></label><label>Cliente<select value={workClient} onChange={e => setWorkClient(e.target.value)}>{state.clients.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>Responsable<select value={workWorker} onChange={e => setWorkWorker(e.target.value)}>{state.workers.filter(w => w.active).map(w => <option value={w.id} key={w.id}>{w.name}</option>)}</select></label><label>Fecha<input required type="date" value={workDate} onChange={e => setWorkDate(e.target.value)}/></label></MiniForm><RecordTable headings={['Fecha', 'Servicio', 'Cliente', 'Tecnico', 'Estado']}>{state.workOrders.map(w => <tr key={w.id}><td>{w.date}</td><td><strong>{w.description}</strong><small className="workspace-block">{w.id}</small></td><td>{resolveClient(state, w.clientId)}</td><td>{resolveWorker(state, w.assignedTo)}</td><td><Status value={w.status}/></td></tr>)}</RecordTable></Panel>
  if (tab === 'works') return <Panel title="Trabajos y documentos" subtitle="Revisa, actualiza el estado y descarga un resumen tecnico de cada atencion."><div className="workspace-card-list">{state.workOrders.map(w => <WorkCard key={w.id} work={w} state={state} actor="Administrador" update={change} notify={notify}/>)}</div></Panel>
  if (tab === 'workers') return <Panel title="Trabajadores" subtitle="Asigna roles y controla si cada trabajador tiene acceso al recorrido."><MiniForm onSubmit={e => {e.preventDefault(); const rec = { id: makeId('TR'), name: workerName.trim(), email: workerEmail.trim(), roleId: state.roles[0].id, active: true }; change(s => addCollection(s, 'workers', rec, 'Administrador', `Trabajador registrado: ${rec.name}`)); setWorkerName(''); setWorkerEmail(''); notify('Trabajador creado')}} submitLabel="Agregar trabajador"><label>Nombre<input required value={workerName} onChange={e => setWorkerName(e.target.value)}/></label><label>Correo<input required type="email" value={workerEmail} onChange={e => setWorkerEmail(e.target.value)}/></label></MiniForm><RecordTable headings={['Trabajador', 'Rol asignado', 'Acceso']}>{state.workers.map(w => <tr key={w.id}><td><strong>{w.name}</strong><small className="workspace-block">{w.email}</small></td><td><select aria-label={`Rol de ${w.name}`} value={w.roleId} onChange={e => change(s => updateCollection(s, 'workers', w.id, { roleId: e.target.value }, 'Administrador', `Rol de ${w.name} actualizado`))}>{state.roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select></td><td><label className="workspace-check"><input type="checkbox" checked={w.active} onChange={e => change(s => updateCollection(s, 'workers', w.id, { active: e.target.checked }, 'Administrador', `${w.name}: acceso ${e.target.checked ? 'habilitado' : 'deshabilitado'}`))}/> Activo</label></td></tr>)}</RecordTable></Panel>
  if (tab === 'roles') return <Panel title="Roles y permisos" subtitle="El administrador puede crear subroles y asignar las funciones visibles a cada trabajador."><MiniForm onSubmit={e => {e.preventDefault(); if(state.roles.some(r => r.name.toLowerCase() === roleName.trim().toLowerCase())) {notify('Ya existe un rol con ese nombre'); return}; const rec = { id: makeId('RL'), name: roleName.trim(), permissions: [] }; change(s => addCollection(s, 'roles', rec, 'Administrador', `Subrol creado: ${rec.name}`)); setRoleName(''); notify('Subrol creado')}} submitLabel="Crear subrol"><label className="workspace-form-grow">Nombre del subrol<input required maxLength={55} value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="Ej. Supervisor de mantenimiento"/></label></MiniForm><div className="workspace-role-cards">{state.roles.map(role => <section className="workspace-role-card" key={role.id}><h3>{role.name}</h3><p>{state.workers.filter(w => w.roleId === role.id).length} trabajadores asignados</p><div className="workspace-permissions">{permissionOptions.map(p => <label key={p.id} className="workspace-check"><input type="checkbox" checked={role.permissions.includes(p.id)} onChange={() => change(s => toggleRolePermission(s, role.id, p.id))}/><span>{p.label}</span></label>)}</div></section>)}</div></Panel>
  return <Panel title="Registro de actividad" subtitle="Historial de movimientos realizados desde este navegador."><RecordTable headings={['Fecha', 'Usuario', 'Operacion']}>{state.audit.map(e => <tr key={e.id}><td>{e.at}</td><td>{e.actor}</td><td>{e.action}</td></tr>)}</RecordTable></Panel>
}

function WorkCard({ work, state, actor, update, notify, restricted = false }) {
  const [notes, setNotes] = useState(work.notes || '')
  useEffect(() => setNotes(work.notes || ''), [work.notes])
  return <article className="workspace-work-card"><div><small>{work.id} · {work.date}</small><h3>{work.description}</h3><p>{resolveClient(state, work.clientId)} · {resolveWorker(state, work.assignedTo)}</p><Status value={work.status}/></div><div className="workspace-work-editor"><label>Estado<select disabled={restricted} value={work.status} onChange={e => {update(s => updateCollection(s, 'workOrders', work.id, { status: e.target.value }, actor, `${work.id} ahora esta ${e.target.value}`)); notify('Estado actualizado')}}>{['Programado', 'En proceso', 'Finalizado', 'Cancelado'].map(s => <option key={s}>{s}</option>)}</select></label><label>Observaciones<textarea rows={2} maxLength={600} disabled={restricted} value={notes} onChange={e => setNotes(e.target.value)}/></label><div className="workspace-card-actions"><ActionsButton disabled={restricted} variant="accent" onClick={() => { update(s => updateCollection(s, 'workOrders', work.id, { notes }, actor, `Observaciones de ${work.id} actualizadas`)); notify('Observaciones guardadas') }}>Guardar notas</ActionsButton><ActionsButton onClick={() => downloadDemoReport({ ...work, notes }, resolveClient(state, work.clientId))}>Informe TXT <ArrowIcon size={17}/></ActionsButton></div></div></article>
}
function WorkerPortal({ state, change, tab, notify }) {
  const [workerId, setWorkerId] = useState(state.workers[0]?.id)
  const selected = state.workers.find(w => w.id === workerId) || state.workers[0]
  const can = key => hasPermission(state, selected?.id, key)
  const ownWork = state.workOrders.filter(w => w.assignedTo === selected?.id)
  const access = { agenda: 'agenda.view', works: 'work.view', clients: 'clients.view', documents: 'docs.create', inventory: 'inventory.view' }
  const [workerNote, setWorkerNote] = useState('')
  const heading = <div className="workspace-worker-heading"><div><span className="workspace-kicker">ESPACIO DEL PERSONAL</span><h2>Hola, {selected?.name.split(' ')[0] || 'trabajador'}.</h2><p>Las funciones cambian cuando el administrador modifica los permisos.</p></div><label>Trabajador<select value={selected?.id || ''} onChange={e => setWorkerId(e.target.value)}>{state.workers.map(w => <option key={w.id} value={w.id}>{w.name}{!w.active ? ' (sin acceso)' : ''}</option>)}</select></label></div>
  if (!selected?.active) return <>{heading}<Panel title="Acceso suspendido" subtitle="Este trabajador fue desactivado desde el panel administrativo."/></>
  if (tab !== 'overview' && !can(access[tab])) return <>{heading}<Panel title="Acceso no disponible" subtitle="El rol asignado no tiene permiso para consultar este modulo. Actualizalo desde Roles y permisos del administrador."/></>
  if (tab === 'overview') return <>{heading}<div className="workspace-stats"><Stat icon="wrench" label="Trabajos asignados" value={ownWork.length}/><Stat icon="clock" label="Pendientes" value={ownWork.filter(w => w.status !== 'Finalizado').length}/><Stat icon="shield" label="Permisos activos" value={state.roles.find(r => r.id === selected.roleId)?.permissions.length || 0}/></div><Panel title="Mis actividades" subtitle="Atenciones asignadas a tu usuario.">{can('work.view') ? ownWork.map(w => <div className="workspace-list-row" key={w.id}><div><strong>{w.description}</strong><small>{w.date} · {resolveClient(state, w.clientId)}</small></div><Status value={w.status}/></div>) : <Empty text="Este rol no tiene permiso para consultar trabajos."/>}</Panel></>
  if (tab === 'agenda') return <>{heading}<Panel title="Agenda personal" subtitle="Tareas asignadas con fecha de atencion."><RecordTable headings={['Fecha', 'Orden', 'Cliente', 'Estado']}>{ownWork.map(w => <tr key={w.id}><td>{w.date}</td><td>{w.description}</td><td>{resolveClient(state, w.clientId)}</td><td><Status value={w.status}/></td></tr>)}</RecordTable></Panel></>
  if (tab === 'works') return <>{heading}<Panel title="Mis trabajos" subtitle="Registra avances y observaciones segun los permisos del rol."><div className="workspace-card-list">{ownWork.length ? ownWork.map(w => <WorkCard key={w.id} work={w} state={state} actor={selected.name} update={change} notify={notify} restricted={!can('work.update')}/>) : <Empty/>}</div></Panel></>
  if (tab === 'clients') return <>{heading}<Panel title="Clientes" subtitle="Directorio interno de consulta."><RecordTable headings={['Cliente', 'Correo', 'Zona']}>{state.clients.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{c.district}</td></tr>)}</RecordTable></Panel></>
  if (tab === 'documents') return <>{heading}<Panel title="Informes de atencion" subtitle="Prepara un texto de informe y descargalo en formato TXT."><label className="workspace-form-alone">Notas del informe<textarea rows={5} maxLength={1000} value={workerNote} onChange={e => setWorkerNote(e.target.value)} placeholder="Actividades realizadas y observaciones..."/></label>{ownWork.map(w => <div className="workspace-list-row" key={w.id}><div><strong>{w.description}</strong><small>{w.id}</small></div><ActionsButton onClick={() => {downloadDemoReport({ ...w, notes: workerNote || w.notes }, resolveClient(state, w.clientId)); notify('Informe generado')}}>Descargar <ArrowIcon size={17}/></ActionsButton></div>)}</Panel></>
  return <>{heading}<Panel title="Inventario interno" subtitle="Consulta de existencias sin capacidad de modificarlas."><RecordTable headings={['Equipo', 'Stock', 'Minimo']}>{state.inventory.map(i => <tr key={i.sku}><td>{i.name}</td><td>{i.stock}</td><td>{i.minimum}</td></tr>)}</RecordTable></Panel></>
}
function DeveloperPortal({ state, change, tab, notify }) {
  const [tenantName, setTenantName] = useState('')
  if (tab === 'overview') return <><div className="workspace-section-title"><span className="workspace-kicker">PROVEEDOR DE SOFTWARE</span><h2>Una plataforma. Varias empresas.</h2><p>Vista del operador del SaaS, separada de la administracion del negocio HVAC.</p></div><div className="workspace-stats"><Stat icon="wind" label="Empresas configuradas" value={state.companies.length}/><Stat icon="shield" label="Empresas activas" value={state.companies.filter(c => c.status === 'Activa').length}/><Stat icon="equipment" label="Tecnologia" value="React + Java"/><Stat icon="document" label="Base de datos" value="PostgreSQL"/></div><Panel title="Proximas capacidades" subtitle="Diseño de la futura gestion multiempresa."><div className="workspace-feature-row"><div><UiIcon name="shield"/><strong>Aislamiento por empresa</strong><p>El servidor debera filtrar los datos por una empresa validada.</p></div><div><UiIcon name="equipment"/><strong>Roles internos</strong><p>Administrador y trabajadores con permisos propios de cada organizacion.</p></div><div><UiIcon name="document"/><strong>Auditoria</strong><p>Registrar cambios importantes e identificar al responsable.</p></div></div></Panel></>
  if (tab === 'companies') return <Panel title="Empresas de la plataforma" subtitle="Vista de configuracion local para estudiar el modelo SaaS. Cada empresa se administra por separado."><MiniForm submitLabel="Agregar empresa" onSubmit={e => {e.preventDefault(); const rec = { id: makeId('TEN'), name: tenantName.trim(), plan: 'Evaluación', status: 'Activa' }; change(s => addCollection(s, 'companies', rec, 'Desarrollador', `Empresa añadida: ${rec.name}`)); setTenantName(''); notify('Empresa incorporada al recorrido')}}><label className="workspace-form-grow">Nombre de empresa<input required value={tenantName} maxLength={80} onChange={e => setTenantName(e.target.value)} placeholder="Nueva organizacion"/></label></MiniForm><RecordTable headings={['Empresa', 'Plan', 'Estado', 'Accion']}>{state.companies.map(c => <tr key={c.id}><td><strong>{c.name}</strong><small className="workspace-block">{c.id}</small></td><td>{c.plan}</td><td><Status value={c.status}/></td><td><ActionsButton onClick={() => change(s => updateCollection(s, 'companies', c.id, { status: c.status === 'Activa' ? 'Suspendida' : 'Activa' }, 'Desarrollador', `Estado de ${c.name} actualizado`))}>{c.status === 'Activa' ? 'Suspender' : 'Activar'}</ActionsButton></td></tr>)}</RecordTable></Panel>
  if (tab === 'architecture') return <Panel title="Arquitectura prevista" subtitle="Separacion de responsabilidades que guiara las proximas versiones."><div className="workspace-flow"><div>Navegador del cliente <small>React + Vite</small></div><ArrowIcon direction="down"/><div>API empresarial <small>Java / Spring Boot</small></div><ArrowIcon direction="down"/><div>Persistencia <small>PostgreSQL / Flyway</small></div></div><p className="workspace-hint">El control real de sesiones, permisos y aislamiento por empresa se implementara en Spring Security. La seleccion de roles de esta pagina sirve para mostrar las interfaces y no autentica usuarios.</p></Panel>
  return <Panel title="Actividad de la plataforma" subtitle="Operaciones realizadas durante el recorrido local."><RecordTable headings={['Fecha', 'Actor', 'Accion']}>{state.audit.map(a => <tr key={a.id}><td>{a.at}</td><td>{a.actor}</td><td>{a.action}</td></tr>)}</RecordTable></Panel>
}

export default function RoleWorkspace({ initialRole = 'client', onCatalog }) {
  const [role, setRole] = useState(initialRole)
  const [tab, setTab] = useState('overview')
  const [state, setState] = useState(loadWorkspace)
  const [notification, setNotification] = useState('')
  useEffect(() => storeWorkspace(state), [state])
  useEffect(() => {setRole(initialRole); setTab('overview')}, [initialRole])
  const activeRole = roles.some(r => r[0] === role) ? role : 'client'
  const headerMessage = useMemo(() => ({client:'Tu espacio personal',admin:'Gestion empresarial',worker:'Mi espacio de trabajo',developer:'Administracion SaaS'})[activeRole], [activeRole])
  function change(fn) { setState(fn) }
  function notify(text) {setNotification(text)}
  function restore() {
    if (!window.confirm('¿Restablecer los datos locales de este recorrido?')) return
    localStorage.removeItem(WORKSPACE_KEY)
    setState(cloneSeedWorkspace()); setTab('overview'); notify('Datos de ejemplo restaurados')
  }
  return <div className="workspace-shell">
    <div className="workspace-topline"><span className="workspace-kicker">HVAC CONTROLS · PLATAFORMA EMPRESARIAL</span><button type="button" onClick={onCatalog} className="workspace-text-link"><ArrowIcon direction="left" size={18}/> Volver al catalogo</button></div>
    <div className="workspace-main-heading"><div><h1>{headerMessage}</h1><p>Explora las funciones de cada perfil y como se conectan los procesos de la empresa.</p></div><label>Explorar perfil<select value={activeRole} onChange={e => {setRole(e.target.value); setTab('overview'); setNotification('')}}>{roles.map(r => <option key={r[0]} value={r[0]}>{r[1]}</option>)}</select></label></div>
    <div className="workspace-demo-bubble"><UiIcon name="shield" size={17}/><span>Recorrido interactivo de interfaces. Los cambios internos se guardan en este navegador; no habilitan acceso real a otros usuarios.</span></div>
    <div className="workspace-layout">
      <aside className="workspace-sidebar"><div className="workspace-sidebar-title"><span className="workspace-sidebar-icon"><UiIcon name="shield" size={26}/></span><div><strong>{roleLabel(activeRole)}</strong><small>{roles.find(r => r[0] === activeRole)?.[2]}</small></div></div><nav aria-label="Modulos de la plataforma">{menus[activeRole].map(([id, name, icon]) => <button key={id} type="button" className={tab === id ? 'workspace-nav-active' : ''} onClick={() => {setTab(id); setNotification('')}}><UiIcon name={icon} size={19}/><span>{name}</span>{tab === id && <ArrowIcon size={16}/>}</button>)}</nav><div className="workspace-sidebar-footer"><ActionsButton onClick={restore}>Restaurar datos del recorrido</ActionsButton></div></aside>
      <div className="workspace-content" aria-live="polite">
        {notification && <div className="workspace-flash" role="status">✓ {notification}<button aria-label="Cerrar notificacion" type="button" onClick={() => setNotification('')}>×</button></div>}
        {activeRole === 'client' && <ClientPortal state={state} change={change} tab={tab} setTab={setTab} notify={notify}/>}
        {activeRole === 'admin' && <AdminPortal state={state} change={change} tab={tab} setTab={setTab} notify={notify}/>}
        {activeRole === 'worker' && <WorkerPortal state={state} change={change} tab={tab} notify={notify}/>}
        {activeRole === 'developer' && <DeveloperPortal state={state} change={change} tab={tab} notify={notify}/>}
      </div>
    </div>
  </div>
}
