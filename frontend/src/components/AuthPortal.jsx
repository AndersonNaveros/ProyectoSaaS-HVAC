import {useEffect,useState} from 'react'
import {createApiClient} from '../apiClient.js'
import PortalIcon from './PortalIcon.jsx'
import PortalWorkspace from './PortalWorkspace.jsx'
import ArrowIcon from './ArrowIcon.jsx'

const api=createApiClient({demo:false})
export default function AuthPortal({onPublic,onAuthChange}){
  const [user,setUser]=useState(null),[mode,setMode]=useState('login'),[loading,setLoading]=useState(true)
  const [form,setForm]=useState({name:'',email:'',password:'',confirm:'',phone:''})
  const [busy,setBusy]=useState(false),[error,setError]=useState('')
  const change=(k,v)=>setForm(f=>({...f,[k]:v}))
  useEffect(()=>{
    if(!sessionStorage.getItem('hvacSessionToken')){setLoading(false);return}
    api('/auth/me').then(u=>{setUser(u);onAuthChange?.(u)}).catch(()=>{
      sessionStorage.removeItem('hvacSessionToken');onAuthChange?.(null)
    }).finally(()=>setLoading(false))
  },[])
  async function submit(e){
    e.preventDefault();setBusy(true);setError('')
    if(mode==='register'&&form.password!==form.confirm){setError('Las contraseñas deben coincidir.');setBusy(false);return}
    try{
      const result=await api(mode==='login'?'/auth/login':'/auth/register',{method:'POST',body:JSON.stringify(mode==='login'?{email:form.email,password:form.password}:{name:form.name,email:form.email,password:form.password,phone:form.phone})})
      sessionStorage.setItem('hvacSessionToken',result.token)
      setUser(result.user);onAuthChange?.(result.user);history.replaceState({},'', '/panel/overview')
      setForm({name:'',email:'',password:'',confirm:'',phone:''})
    }catch(err){setError(err.message)}finally{setBusy(false)}
  }
  async function logout(){
    try{await api('/auth/logout',{method:'POST'})}catch(_){}
    sessionStorage.removeItem('hvacSessionToken');setUser(null);onAuthChange?.(null)
    setMode('login');history.replaceState({},'', '/cuenta')
  }
  if(loading)return <div className="portal-auth-loading">Verificando sesión…</div>
  if(user)return <PortalWorkspace user={user} onLogout={logout} onPublic={onPublic} onUserUpdated={updated=>{setUser(updated);onAuthChange?.(updated)}}/>
  return <div className="portal-auth-page"><div className="portal-auth-info"><span className="portal-kicker">HVAC CONTROLS · ACCESO A PLATAFORMA</span><h1>Tu espacio para organizar cada proyecto.</h1><p>Consulta tus solicitudes y el historial de atención desde tu cuenta personal. Si formas parte del equipo, accede a las herramientas de gestión asignadas a tu usuario.</p><div className="portal-auth-benefits"><div><PortalIcon name="shield"/><span>Acceso protegido con usuario y contraseña</span></div><div><PortalIcon name="file"/><span>Solicitudes e historial vinculados a tu cuenta</span></div><div><PortalIcon name="wrench"/><span>Panel de trabajo según tus permisos</span></div></div></div>
    <section className="portal-auth-card"><div className="portal-auth-card-heading"><PortalIcon name="lock" size={25}/><h2>{mode==='login'?'Iniciar sesión':'Crear mi cuenta'}</h2><p>{mode==='login'?'Ingresa con los datos de tu cuenta.':'El registro público crea automáticamente una cuenta de cliente.'}</p></div>
      <div className="portal-auth-tabs" role="tablist" aria-label="Acceso a cuenta"><button type="button" className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('')}}>Ingresar</button><button type="button" className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('')}}>Registrarme</button></div>
      <form onSubmit={submit} className="portal-auth-form">{mode==='register'&&<label>Nombre y apellidos<input required maxLength={120} autoComplete="name" value={form.name} onChange={e=>change('name',e.target.value)} placeholder="Tu nombre completo"/></label>}
        <label>Correo electrónico<input type="email" required maxLength={180} autoComplete="email" value={form.email} onChange={e=>change('email',e.target.value)} placeholder="correo@ejemplo.com"/></label>
        {mode==='register'&&<label>Teléfono (opcional)<input type="tel" maxLength={30} autoComplete="tel" value={form.phone} onChange={e=>change('phone',e.target.value)} placeholder="+51 ..."/></label>}
        <label>Contraseña<input required minLength={mode==='register'?10:1} maxLength={72} type="password" autoComplete={mode==='register'?'new-password':'current-password'} value={form.password} onChange={e=>change('password',e.target.value)} placeholder="••••••••••"/></label>
        {mode==='register'&&<><label>Confirmar contraseña<input type="password" required autoComplete="new-password" value={form.confirm} onChange={e=>change('confirm',e.target.value)}/></label><small>Utiliza al menos 10 caracteres, con letras y números.</small></>}
        {error&&<div className="portal-alert" role="alert">{error}</div>}
        <button type="submit" disabled={busy} className="portal-btn-primary portal-auth-submit">{busy?'Procesando…':mode==='login'?'Acceder a mi cuenta':'Crear cuenta de cliente'} <ArrowIcon size={20}/></button>
      </form><p className="portal-auth-foot">¿Eres trabajador o administrador? Utiliza la cuenta creada por la empresa. Los privilegios no se solicitan desde el registro público.</p>
    </section>
  </div>
}
