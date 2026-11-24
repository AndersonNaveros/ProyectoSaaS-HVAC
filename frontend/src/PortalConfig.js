// Configuracion de navegacion y formularios de la plataforma V1.4.
export const workPermissions = [
  'PRODUCTS_READ','PRODUCTS_WRITE','BRANDS_READ','BRANDS_WRITE',
  'SUPPLIERS_READ','SUPPLIERS_WRITE','CLIENTS_READ',
  'APPOINTMENTS_READ','APPOINTMENTS_WRITE','JOBS_READ','JOBS_WRITE',
  'ORDERS_READ','ORDERS_WRITE','REQUESTS_READ','REQUESTS_WRITE',
]
export const statusOptions = ['PENDING','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED']
export const statusLabel = { PENDING:'Pendiente', SCHEDULED:'Programado', IN_PROGRESS:'En curso', COMPLETED:'Finalizado', CANCELLED:'Cancelado', REGISTERED:'Registrada', IN_REVIEW:'En revisión', QUOTED:'Cotizada', CLOSED:'Cerrada' }
export const roleLabels = {CLIENT:'Cliente',WORKER:'Trabajador',ADMIN:'Administrador',DEVELOPER:'Desarrollador'}
export const moduleInfo = {
  brands: { title:'Marcas del catálogo',lead:'Organiza los fabricantes disponibles en el catálogo.',icon:'tag',singular:'marca', fields:[['name','Marca','text',true]] },
  products: {title:'Productos y servicios',lead:'Controla los equipos publicados, servicios, categorías y existencias.',icon:'box',singular:'producto o servicio', fields:[['name','Nombre','text',true],['type','Tipo','select:PRODUCT|SERVICE',true],['sku','SKU','text'],['category','Categoría','text',true],['brandName','Marca','brand'],['stock','Existencias','number',true],['summary','Descripción','textarea',true],['active','Visible en catálogo','checkbox']]},
  subroles:{title:'Subroles de trabajadores',lead:'Crea perfiles como Técnico, Ventas o Coordinación y define sus permisos.',icon:'shield',singular:'subrol',fields:[['name','Nombre del subrol','text',true],['permissions','Permisos autorizados','permissions']]},
  stock:{title:'Movimientos de stock',lead:'Cada ingreso, ajuste y venta deja un registro asociado al equipo.',icon:'box'},
  suppliers: {title:'Proveedores',lead:'Conserva contactos comerciales y personas responsables.',icon:'truck',singular:'proveedor',fields:[['name','Empresa o proveedor','text',true],['phone','Teléfono','text'],['email','Correo','email'],['contact','Encargado','text'],['notes','Observaciones','textarea']]},
  clients:{title:'Clientes',lead:'Las cuentas de clientes permiten consultar su historial privado.',icon:'users',singular:'cliente',fields:[['name','Nombre completo','text',true],['email','Correo','email',true],['phone','Teléfono','text'],['password','Contraseña inicial','password',true]]},
  users:{title:'Usuarios y permisos',lead:'Activa o desactiva cuentas, asigna roles y limita el acceso de los trabajadores.',icon:'shield',singular:'usuario',fields:[['name','Nombre completo','text',true],['email','Correo','email',true],['phone','Teléfono','text'],['password','Contraseña inicial','password',true],['role','Rol','select:CLIENT|WORKER|ADMIN',true],['subroleId','Subrol asignado','subrole'],['permissions','Permisos para trabajador','permissions'],['active','Cuenta activa','checkbox']]},
  appointments:{title:'Agenda de atención',lead:'Coordina visitas, responsables, direcciones y fechas de servicio.',icon:'calendar',singular:'visita',fields:[['title','Motivo de visita','text',true],['startsAt','Fecha y hora','datetime-local',true],['address','Dirección','text'],['customerId','Cliente','client'],['workerId','Responsable','worker'],['status','Estado','status'],['notes','Detalles','textarea']]},
  jobs:{title:'Trabajos y seguimiento',lead:'Organiza órdenes de trabajo, responsables y estados de atención.',icon:'wrench',singular:'trabajo',fields:[['title','Servicio o trabajo','text',true],['description','Descripción','textarea'],['customerId','Cliente','client'],['workerId','Trabajador responsable','worker'],['status','Estado','status'],['quotedAmount','Importe cotizado (S/)','number',true]]},
  orders:{title:'Pedidos y ventas',lead:'Registra ventas y descuenta las unidades del inventario de manera segura.',icon:'shopping',singular:'pedido',fields:[['customerId','Cliente','client',true],['itemId','Equipo','product',true],['quantity','Unidades','number',true],['unitPrice','Precio unitario acordado (S/)','number',true]]},
  requests:{title:'Solicitudes de cotización',lead:'Consulta peticiones recibidas y actualiza su estado comercial.',icon:'file',singular:'solicitud',fields:[['status','Estado','quoteStatus']]},
  audit:{title:'Registro de actividad',lead:'Consulta qué modificaciones realizaron los usuarios de la empresa.',icon:'history'},
  company:{title:'Datos de la empresa',lead:'Información corporativa del espacio de gestión.',icon:'building',singular:'empresa',fields:[['name','Nombre de la empresa','text',true]]},
  companies:{title:'Empresas SaaS',lead:'Gestiona los espacios independientes registrados en la plataforma.',icon:'building',singular:'empresa',fields:[['name','Razón social','text',true],['slug','Identificador URL','text',true],['adminName','Nombre del primer administrador','text',true],['adminEmail','Correo del primer administrador','email',true],['password','Contraseña inicial','password',true]]},
}
export const navForRole = (user) => {
  if(!user) return []
  if(user.role === 'CLIENT') return [ ['overview','Mi inicio','home'], ['my/requests','Mis solicitudes','file'], ['my/jobs','Mis trabajos','wrench'], ['my/orders','Mis pedidos','shopping'], ['profile','Mi perfil','user'] ]
  if(user.role === 'DEVELOPER') return [['overview','Resumen SaaS','home'],['companies','Empresas','building'],['profile','Mi perfil','user']]
  const admin = [['overview','Resumen y accesos','home'],['appointments','Agenda de atención','calendar'],['products','Productos y stock','box'],['stock','Movimientos de stock','history'],['brands','Marcas','tag'],['clients','Clientes','users'],['suppliers','Proveedores','truck'],['jobs','Trabajos','wrench'],['orders','Pedidos','shopping'],['requests','Cotizaciones','file'],['users','Usuarios y permisos','shield'],['subroles','Subroles de trabajo','shield'],['audit','Registro de actividad','history'],['company','Datos de la empresa','building'],['profile','Mi perfil','user']]
  if(user.role === 'ADMIN')return admin
  return [['overview','Mi jornada','home'], ...admin.filter(([key]) => {
    if(key==='profile') return true
    const permission=(key==='stock'?'PRODUCTS':key.toUpperCase())+'_READ'
    return user.permissions.includes(permission)
  })]
}
export const toForm = (row,area) => {
  const base={...row}
  const names={brand_name:'brandName',starts_at:'startsAt',customer_id:'customerId',worker_id:'workerId',quoted_amount:'quotedAmount',item_id:'itemId',unit_price:'unitPrice',subrole_id:'subroleId'}
  Object.entries(names).forEach(([from,to])=>{if(base[from]!==undefined)base[to]=base[from]})
  if(base.startsAt)base.startsAt=String(base.startsAt).slice(0,16)
  if(['users','subroles'].includes(area) && typeof base.permissions==='string') base.permissions=base.permissions?base.permissions.split(', ').filter(Boolean):[]
  return base
}
export const canWrite = (user,area) => {
  if(user?.role==='ADMIN')return !['audit','ordersEdit'].includes(area)
  if(user?.role==='DEVELOPER')return area==='companies'
  return user?.role==='WORKER' && user.permissions.includes(`${area.toUpperCase()}_WRITE`)
}
