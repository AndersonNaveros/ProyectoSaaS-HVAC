import {useEffect,useMemo,useState} from 'react'
import {canWrite,moduleInfo,navForRole,roleLabels,statusLabel,statusOptions,toForm,workPermissions} from '../PortalConfig.js'
import {createApiClient} from '../apiClient.js'
import PortalIcon from './PortalIcon.jsx'
import ArrowIcon from './ArrowIcon.jsx'

const api=createApiClient({demo:false})
const printable=(v,key='')=>{
  if(v===null || v===undefined || v==='')return '—'
  if(typeof v==='boolean')return v?'Activo':'Oculto'
  if(key==='status')return statusLabel[v]||v
  if(key==='created_at'||key==='starts_at')return new Date(v).toLocaleString('es-PE',{dateStyle:'medium',timeStyle:key==='starts_at'?'short':undefined})
  if(key==='total'||key==='quoted_amount'||key==='unit_price')return `S/ ${Number(v).toFixed(2)}`
  return String(v)
}
const columns={
  brands:[['name','Marca']],
  products:[['name','Producto / servicio'],['type','Tipo'],['category','Categoría'],['brand_name','Marca'],['stock','Stock'],['active','Publicación']],
  stock:[['product','Producto'],['delta','Unidades +/-'],['reason','Motivo'],['actor','Responsable'],['created_at','Fecha']],
  suppliers:[['name','Proveedor'],['phone','Teléfono'],['email','Correo'],['contact','Responsable']],
  subroles:[['name','Subrol'],['permissions','Permisos']],
  clients:[['name','Cliente'],['email','Correo'],['phone','Teléfono'],['active','Acceso']],
  users:[['name','Usuario'],['email','Correo'],['role','Rol'],['subrole_name','Subrol'],['active','Estado'],['permissions','Permisos']],
  appointments:[['title','Visita'],['starts_at','Fecha'],['address','Dirección'],['status','Estado']],
  jobs:[['title','Trabajo'],['status','Estado'],['quoted_amount','Importe'],['created_at','Registro']],
  orders:[['product','Producto'],['quantity','Cantidad'],['total','Total'],['created_at','Registro']],
  requests:[['code','Referencia'],['contact_name','Solicitante'],['contact_email','Correo'],['status','Estado'],['created_at','Fecha']],
  audit:[['actor','Autor'],['action','Acción'],['detail','Detalle'],['created_at','Fecha']],
  company:[['name','Empresa'],['slug','Identificador'],['active','Estado']],
  companies:[['name','Empresa'],['slug','Identificador'],['users','Usuarios'],['active','Estado']],
  'my/orders':[['product','Producto'],['quantity','Cantidad'],['total','Importe'],['status','Estado'],['created_at','Fecha']],
  'my/jobs':[['title','Trabajo'],['status','Estado'],['quoted_amount','Importe'],['created_at','Fecha']],
  'my/requests':[['code','Referencia'],['status','Estado'],['created_at','Fecha']],
}
const initialValue={type:'PRODUCT',stock:0,quantity:1,unitPrice:'0',quotedAmount:'0',active:true,status:'PENDING',role:'WORKER',permissions:[]}

function Editor({area,row,clients,workers,products,brands,subroles,user,onClose,onSaved}){
  const config=moduleInfo[area]
  const edit=Boolean(row)
  const [form,setForm]=useState(()=>edit?{...initialValue,...toForm(row,area)}:{...initialValue,...(user.role==='WORKER'?{workerId:user.id}:{})})
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const fields=(config?.fields||[]).filter(([key])=>{
    if(edit && area==='companies')return false
    if(edit && (key==='email'||key==='password'||key==='type'||key==='sku'))return false
    return true
  })
  const write=(field,value)=>setForm(f=>({...f,[field]:value}))
  const selectedOptions=(type)=>{
    if(type==='client')return clients.map(c=>[c.id,c.name])
    if(type==='worker')return (user.role==='WORKER'?[{id:user.id,name:user.name,role:'WORKER'}]:workers).filter(w=>w.role==='WORKER'||w.role==='ADMIN').map(w=>[w.id,w.name])
    if(type==='brand')return brands.map(r=>[r.name,r.name])
    if(type==='subrole')return subroles.map(r=>[r.id,r.name])
    if(type==='product')return products.filter(p=>p.type==='PRODUCT'&&p.active).map(p=>[p.id,`${p.name} · stock ${p.stock}`])
    if(type==='status')return statusOptions.map(s=>[s,statusLabel[s]||s])
    if(type==='quoteStatus')return ['REGISTERED','IN_REVIEW','QUOTED','CLOSED','CANCELLED'].map(s=>[s,statusLabel[s]])
    return type.replace('select:','').split('|').map(s=>[s,s])
  }
  async function save(e){
    e.preventDefault();setBusy(true);setError('')
    try{
      const payload={...form}
      if(area==='appointments' && payload.startsAt)payload.startsAt=new Date(payload.startsAt).toISOString()
      if(area==='clients')delete payload.role
      if(area==='users'&&payload.role!=='WORKER')payload.permissions=[]
      if(area==='requests')payload.status=payload.status||row.status
      if(area==='company')payload.name=payload.name||row.name
      const path=area==='company' ? `/portal/company/${row.id}` : `/portal/${area}${edit?`/${row.id}`:''}`
      await api(path,{method:edit?'PATCH':'POST',body:JSON.stringify(payload)})
      onSaved()
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  return <div className="portal-modal-backdrop" role="presentation" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="portal-modal" role="dialog" aria-modal="true" aria-labelledby="editorHeading">
      <div className="portal-modal-title"><div><span className="portal-kicker">GESTIÓN · {config.title.toUpperCase()}</span><h2 id="editorHeading">{edit?'Editar':'Registrar'} {config.singular}</h2></div><button className="portal-icon-button" aria-label="Cerrar" onClick={onClose}>✕</button></div>
      <form onSubmit={save} className="portal-editor-form">
        {edit&&area==='companies'&&<label className="portal-full"><span className="portal-inline-check"><input type="checkbox" checked={Boolean(form.active)} onChange={e=>write('active',e.target.checked)}/> Empresa activa</span></label>}
        {fields.map(([key,label,type,required])=><label key={key} className={type==='textarea'||type==='permissions'?'portal-full':''}>
          {type==='checkbox' ? <span className="portal-inline-check"><input type="checkbox" checked={Boolean(form[key])} onChange={e=>write(key,e.target.checked)}/>{label}</span> : <><span>{label}</span>
          {type==='permissions'?<div className="permission-grid">{workPermissions.map(p=><label key={p}><input type="checkbox" checked={(form.permissions||[]).includes(p)} onChange={e=>write('permissions',e.target.checked?[...(form.permissions||[]),p]:(form.permissions||[]).filter(v=>v!==p))}/>{p.replace('_',' · ')}</label>)}</div>:
          type==='textarea'?<textarea rows="3" value={form[key]??''} onChange={e=>write(key,e.target.value)}/>:
          type.startsWith('select:')||['client','worker','product','brand','subrole','status','quoteStatus'].includes(type)?<select value={form[key]??''} required={Boolean(required)} onChange={e=>{write(key,e.target.value);if(type==='subrole'){const r=subroles.find(r=>String(r.id)===e.target.value);write('permissions',r?.permissions?r.permissions.split(', ').filter(Boolean):[])}}}><option value="">Seleccionar</option>{selectedOptions(type).map(([value,txt])=><option key={value} value={value}>{txt}</option>)}</select>:
          <input type={type} required={Boolean(required)} step={type==='number'?(key==='unitPrice'||key==='quotedAmount'?'0.01':'1'):undefined} min={type==='number'?0:undefined} value={form[key]??''} onChange={e=>write(key,e.target.value)} autoComplete={type==='password'?'new-password':'off'}/>}</>}
        </label>)}

        {error&&<div className="portal-alert" role="alert">{error}</div>}
        <div className="portal-form-actions"><button type="button" className="portal-btn-light" onClick={onClose}>Cancelar</button><button type="submit" className="portal-btn-primary" disabled={busy}>{busy?'Guardando…':'Guardar cambios'}<ArrowIcon size={18}/></button></div>
      </form>
    </div>
  </div>
}

function AgendaCalendar({rows,month,setMonth}){
  const year=month.getFullYear(),m=month.getMonth();
  const first=(new Date(year,m,1).getDay()+6)%7
  const length=new Date(year,m+1,0).getDate()
  const days=[...Array(first).fill(null),...Array.from({length},(_,i)=>i+1)]
  while(days.length%7)days.push(null)
  const byDay=rows.reduce((acc,r)=>{const d=new Date(r.starts_at);if(d.getFullYear()===year&&d.getMonth()===m)(acc[d.getDate()]??=[]).push(r);return acc},{})
  return <section className="agenda-section"><div className="agenda-heading"><h3>{month.toLocaleDateString('es-PE',{month:'long',year:'numeric'})}</h3><div><button onClick={()=>setMonth(new Date(year,m-1,1))} aria-label="Mes anterior">‹</button><button onClick={()=>setMonth(new Date())}>Hoy</button><button onClick={()=>setMonth(new Date(year,m+1,1))} aria-label="Mes siguiente">›</button></div></div>
    <div className="agenda-calendar">{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(s=><div key={s} className="agenda-day-label">{s}</div>)}{days.map((d,i)=><div key={i} className={'agenda-day'+(d?'':' agenda-empty')}><span>{d||''}</span>{(byDay[d]||[]).map(r=><small key={r.id} title={r.title}>{new Date(r.starts_at).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})} · {r.title}</small>)}</div>)}</div>
  </section>
}

function MetricCards({values,role}){
  const translations={companies:'Empresas',users:'Usuarios',clients:'Clientes',products:'Productos y servicios',jobs:'Trabajos',appointments:'Visitas',lowStock:'Stock bajo',orders:'Pedidos',requests:'Solicitudes',myJobs:'Mis trabajos',myAppointments:'Mis visitas'}
  return <div className="portal-metrics">{Object.entries(values).map(([key,value])=><div className="portal-metric" key={key}><span>{translations[key]||key}</span><strong>{value}</strong><small>{role==='CLIENT'?'En tu historial':'Registros disponibles'}</small></div>)}</div>
}

function Profile({user,onLogout,onUserUpdated}){
  const [profile,setProfile]=useState({name:user.name,phone:user.phone||'',organization:user.organization||''})
  const [editingProfile,setEditingProfile]=useState(false),[profileMsg,setProfileMsg]=useState('')
  const [currentPassword,setCurrent]=useState(''),[nextPassword,setNext]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false)
  async function submit(e){e.preventDefault();setBusy(true);setNotice('');try{const r=await api('/auth/change-password',{method:'POST',body:JSON.stringify({currentPassword,nextPassword})});setNotice(r.message);setTimeout(()=>onLogout(),1000)}catch(e){setNotice(e.message)}finally{setBusy(false)}}
  async function saveProfile(e){e.preventDefault();setProfileMsg('');try{const updated=await api('/auth/profile',{method:'PATCH',body:JSON.stringify(profile)});onUserUpdated(updated);setEditingProfile(false);setProfileMsg('Datos guardados.')}catch(e){setProfileMsg(e.message)}}
  return <><div className="portal-section-heading"><span className="portal-kicker">MI IDENTIDAD</span><h1>Mi perfil</h1><p>Tu información de contacto y seguridad en la plataforma.</p></div><div className="portal-profile-grid"><div className="portal-white-card"><div className="portal-profile-title"><h3>Datos personales</h3><button type="button" className="portal-btn-light" onClick={()=>setEditingProfile(!editingProfile)}>{editingProfile?'Cancelar':'Editar'}</button></div>{editingProfile?<form className="portal-password" onSubmit={saveProfile}><label>Nombre completo<input required maxLength={120} value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Teléfono<input maxLength={30} value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})}/></label><label>Organización<input maxLength={160} value={profile.organization} onChange={e=>setProfile({...profile,organization:e.target.value})}/></label><button className="portal-btn-primary" type="submit">Guardar información</button></form>:<><div className="portal-profile-line"><span>Nombre</span><strong>{user.name}</strong></div><div className="portal-profile-line"><span>Correo</span><strong>{user.email}</strong></div><div className="portal-profile-line"><span>Teléfono</span><strong>{user.phone||'—'}</strong></div><div className="portal-profile-line"><span>Organización</span><strong>{user.organization||'—'}</strong></div><div className="portal-profile-line"><span>Tipo de cuenta</span><strong>{roleLabels[user.role]}</strong></div><div className="portal-profile-line"><span>Empresa</span><strong>{user.companyName}</strong></div></>}{profileMsg&&<p role="status">{profileMsg}</p>}</div><form onSubmit={submit} className="portal-white-card portal-password"><h3>Seguridad de la cuenta</h3><p>Cambia la contraseña para cerrar las sesiones anteriores.</p><label>Contraseña actual<input type="password" required autoComplete="current-password" value={currentPassword} onChange={e=>setCurrent(e.target.value)}/></label><label>Nueva contraseña<input type="password" required minLength={10} autoComplete="new-password" value={nextPassword} onChange={e=>setNext(e.target.value)}/></label><small>Mínimo 10 caracteres, con letras y números.</small>{notice&&<p role="status">{notice}</p>}<button type="submit" className="portal-btn-primary" disabled={busy}>Actualizar contraseña <ArrowIcon size={18}/></button></form></div></>
}

export default function PortalWorkspace({user,onLogout,onPublic,onUserUpdated}){
  const nav=useMemo(()=>navForRole(user),[user])
  const initial=location.pathname.startsWith('/panel/')?decodeURIComponent(location.pathname.substring('/panel/'.length)):'overview'
  const [section,setSection]=useState(nav.some(([k])=>k===initial)?initial:'overview')
  const [rows,setRows]=useState([]),[overview,setOverview]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
  const [editing,setEditing]=useState(null),[showEditor,setShowEditor]=useState(false),[search,setSearch]=useState('')
  const [clients,setClients]=useState([]),[workers,setWorkers]=useState([]),[products,setProducts]=useState([]),[subroles,setSubroles]=useState([]),[brands,setBrands]=useState([]),[month,setMonth]=useState(new Date())
  const meta=moduleInfo[section]
  const isClient=user.role==='CLIENT'
  const isDeveloper=user.role==='DEVELOPER'
  const current=nav.some(([key])=>key===section)?section:'overview'
  const switchTo=(key)=>{setSection(key);setSearch('');setError('');history.replaceState({},'',`/panel/${key}`);window.scrollTo({top:0,behavior:'smooth'})}
  const load=async()=>{
    setBusy(true);setError('')
    try{
      const result=await api(current==='overview'?'/portal/overview':current==='profile'?'/auth/me':`/portal/${current}`)
      if(current==='overview')setOverview(result);else if(current==='profile'){}else setRows(result)
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  useEffect(()=>{load()},[current])
  useEffect(()=>{if(showEditor){Promise.allSettled(['/portal/clients','/portal/users','/portal/products','/portal/subroles','/portal/brands'].map(p=>api(p))).then(res=>{if(res[0].status==='fulfilled')setClients(res[0].value);if(res[1].status==='fulfilled')setWorkers(res[1].value);if(res[2].status==='fulfilled')setProducts(res[2].value);if(res[3].status==='fulfilled')setSubroles(res[3].value);if(res[4].status==='fulfilled')setBrands(res[4].value)})}},[showEditor])
  const filtered=rows.filter(row=>JSON.stringify(row).toLocaleLowerCase().includes(search.toLocaleLowerCase()))
  function afterSave(){setShowEditor(false);setEditing(null);load()}
  const openNew=()=>{setEditing(null);setShowEditor(true)}
  const openEdit=(row)=>{setEditing(row);setShowEditor(true)}
  const panelTitle=isClient?'Mi cuenta':isDeveloper?'Consola SaaS':user.role==='ADMIN'?'Centro de gestión':'Centro de operaciones'
  return <div className="portal-shell">
    <aside className="portal-sidebar">
      <div className="portal-side-brand"><div className="portal-side-logo">HC</div><div><strong>HVAC CONTROLS</strong><span>{panelTitle}</span></div></div>
      <div className="portal-side-user"><span className="portal-user-avatar">{user.name.slice(0,1).toUpperCase()}</span><div><strong>{user.name}</strong><small>{roleLabels[user.role]}</small></div></div>
      <p className="portal-nav-caption">{isClient?'MI ESPACIO':isDeveloper?'PLATAFORMA':'GESTIÓN DE '+(user.role==='ADMIN'?'LA EMPRESA':'MIS TAREAS')}</p>
      <nav aria-label="Navegación del espacio personal" className="portal-side-nav">{nav.map(([key,label,icon])=><button key={key} className={current===key?'selected':''} type="button" onClick={()=>switchTo(key)}><PortalIcon name={icon}/><span>{label}</span>{current===key&&<ArrowIcon size={17}/>}</button>)}</nav>
      <div className="portal-side-bottom"><button onClick={onPublic}><PortalIcon name="arrow"/> Ir al sitio público</button><button onClick={onLogout}><PortalIcon name="logout"/> Cerrar sesión</button></div>
    </aside>
    <div className="portal-main-area">
      <div className="portal-topbar"><div><span className="portal-kicker">{user.companyName} · {roleLabels[user.role]}</span></div><button type="button" onClick={onPublic} className="portal-btn-light">Ver catálogo <ArrowIcon size={17}/></button></div>
      {error&&<div className="portal-alert" role="alert">{error} <button onClick={load}>Reintentar</button></div>}
      {current==='profile' ? <Profile user={user} onLogout={onLogout} onUserUpdated={onUserUpdated}/> : current==='overview'?<>
        <div className="portal-section-heading"><span className="portal-kicker">{isClient?'TU INFORMACIÓN':isDeveloper?'CONTROL DE PLATAFORMA':'RESUMEN OPERATIVO'}</span><h1>{isClient?`Hola, ${user.name.split(' ')[0]}.`:isDeveloper?'Gestión de la plataforma':`Bienvenido, ${user.name.split(' ')[0]}.`}</h1><p>{isClient?'Aquí puedes consultar tus solicitudes, servicios y pedidos.':isDeveloper?'Consulta las empresas activas y las cuentas registradas.':'Continúa con tus tareas y revisa los registros recientes de tu empresa.'}</p></div>
        {busy?<div className="portal-loading">Cargando información…</div>:overview&&<MetricCards values={overview} role={user.role}/>}
        <section className="portal-white-card"><h2>{isClient?'Mis movimientos':'Accesos rápidos'}</h2><div className="portal-shortcuts">{nav.filter(([key])=>!['overview','profile'].includes(key)).slice(0,6).map(([key,label,icon])=><button key={key} onClick={()=>switchTo(key)}><PortalIcon name={icon}/>{label}<ArrowIcon size={18}/></button>)}</div></section>
      </> : <>
        <div className="portal-section-heading portal-heading-with-action"><div><span className="portal-kicker">{isClient?'MI HISTORIAL':isDeveloper?'PLATAFORMA SAAS':'GESTIÓN DE LA EMPRESA'}</span><h1>{meta?.title||({'my/jobs':'Mis trabajos','my/orders':'Mis pedidos','my/requests':'Mis solicitudes'})[current]||current}</h1><p>{meta?.lead||(isClient?'Revisa únicamente los registros asociados a tu cuenta.':'Revisa tus registros autorizados.')}</p></div>
        {meta?.fields&&canWrite(user,current)&&!['requests','company'].includes(current)&&<button className="portal-btn-primary" onClick={openNew}><PortalIcon name="plus" size={19}/>Nuevo {meta.singular}</button>}</div>
        {current==='appointments'&&<AgendaCalendar rows={rows} month={month} setMonth={setMonth}/>}
        <div className="portal-list-header"><span>{filtered.length} {filtered.length===1?'registro':'registros'}</span><div><input type="search" aria-label="Buscar registros" placeholder="Buscar en esta sección" value={search} onChange={e=>setSearch(e.target.value)}/><button onClick={load} className="portal-btn-light">Actualizar</button></div></div>
        {busy?<div className="portal-loading">Consultando registros…</div>:filtered.length===0?<div className="portal-empty"><PortalIcon name={meta?.icon||'file'} size={32}/><h2>No hay registros para mostrar</h2><p>{search?'Prueba otro término de búsqueda.':'Cuando se registren datos, aparecerán aquí.'}</p></div>:<div className="portal-table-wrap"><table className="portal-table"><thead><tr>{(columns[current]||[]).map(([key,label])=><th key={key}>{label}</th>)}{canWrite(user,current)&&!['orders','audit','stock'].includes(current)&&<th>Acciones</th>}</tr></thead><tbody>{filtered.map(row=><tr key={row.id||row.code}>{(columns[current]||[]).map(([key])=><td data-label={key} key={key}><span className={key==='status'?'portal-status':''}>{printable(row[key],key)}</span></td>)}{canWrite(user,current)&&!['orders','audit','stock'].includes(current)&&<td><button className="portal-action" onClick={()=>openEdit(row)}><PortalIcon name="edit" size={17}/> Editar</button></td>}</tr>)}</tbody></table></div>}
        {current==='orders'&&canWrite(user,current)&&<p className="portal-list-note">El registro de cada venta descuenta el stock. No se modifica el pedido después de confirmado.</p>}
        {current==='requests'&&canWrite(user,current)&&<p className="portal-list-note">Las solicitudes se revisan y actualizan desde Editar. Los datos de contacto se mantienen dentro del espacio autorizado.</p>}
      </>}
    </div>
    {showEditor&&meta&&<Editor area={current} row={editing} clients={clients} workers={workers} products={products} brands={brands} subroles={subroles} user={user} onClose={()=>{setShowEditor(false);setEditing(null)}} onSaved={afterSave}/>}
  </div>
}
