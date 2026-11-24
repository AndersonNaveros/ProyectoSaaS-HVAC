import test from 'node:test'
import assert from 'node:assert/strict'
import {canWrite,navForRole,toForm,workPermissions,moduleInfo} from '../src/PortalConfig.js'

test('el registro de un cliente solo accede a su historial y perfil',()=>{
  const nav=navForRole({role:'CLIENT',permissions:[]}).map(([key])=>key)
  assert.deepEqual(nav,['overview','my/requests','my/jobs','my/orders','profile'])
  assert.equal(nav.includes('users'),false)
  assert.equal(canWrite({role:'CLIENT',permissions:[]},'products'),false)
})

test('la consola del desarrollador solo muestra la gestion de empresas',()=>{
  const nav=navForRole({role:'DEVELOPER',permissions:[]}).map(([key])=>key)
  assert.deepEqual(nav,['overview','companies','profile'])
  assert.equal(canWrite({role:'DEVELOPER'},'companies'),true)
  assert.equal(canWrite({role:'DEVELOPER'},'users'),false)
})

test('el trabajador ve unicamente las secciones de su permiso',()=>{
  const user={role:'WORKER',permissions:['JOBS_READ','JOBS_WRITE','APPOINTMENTS_READ']}
  const nav=navForRole(user).map(([key])=>key)
  assert.deepEqual(nav,['overview','appointments','jobs','profile'])
  assert.equal(canWrite(user,'jobs'),true)
  assert.equal(canWrite(user,'appointments'),false)
  assert.equal(nav.includes('users'),false)
})

test('el administrador puede gestionar subroles, stock y agenda',()=>{
  const user={role:'ADMIN',permissions:[]}
  const nav=navForRole(user).map(([key])=>key)
  assert.ok(['stock','subroles','users','appointments','products','orders'].every(x=>nav.includes(x)))
  assert.ok(moduleInfo.subroles.fields.find(([key])=>key==='permissions'))
  assert.ok(workPermissions.includes('PRODUCTS_WRITE'))
})

test('el formulario convierte datos de PostgreSQL al modelo de React',()=>{
  const x=toForm({subrole_id:17,permissions:'JOBS_READ, JOBS_WRITE',starts_at:'2026-11-23T15:00:00Z'},'users')
  assert.equal(x.subroleId,17)
  assert.deepEqual(x.permissions,['JOBS_READ','JOBS_WRITE'])
  assert.equal(x.startsAt,'2026-11-23T15:00')
})
