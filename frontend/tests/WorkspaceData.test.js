import test from 'node:test'
import assert from 'node:assert/strict'
import { cloneSeedWorkspace, hasPermission, toggleRolePermission, addCollection, updateCollection } from '../src/WorkspaceData.js'

test('El cliente de ejemplo tiene historial asociado a su cuenta', () => {
  const state = cloneSeedWorkspace()
  assert.equal(state.clientProfile.clientId, 'CL-001')
  assert.ok(state.requests.some(r => r.clientId === 'CL-001'))
  assert.ok(state.workOrders.some(w => w.clientId === 'CL-001'))
})

test('Los permisos de cada trabajador dependen del subrol asignado', () => {
  const state = cloneSeedWorkspace()
  assert.equal(hasPermission(state, 'TR-001', 'work.update'), true)
  assert.equal(hasPermission(state, 'TR-002', 'work.update'), false)
  assert.equal(hasPermission(state, 'TR-002', 'clients.edit'), true)
  assert.equal(hasPermission(state, 'TR-001', 'clients.edit'), false)
})

test('El administrador puede activar y quitar permisos', () => {
  const state = cloneSeedWorkspace()
  const granted = toggleRolePermission(state, 'RL-02', 'work.update')
  assert.equal(hasPermission(granted, 'TR-002', 'work.update'), true)
  const revoked = toggleRolePermission(granted, 'RL-02', 'work.update')
  assert.equal(hasPermission(revoked, 'TR-002', 'work.update'), false)
  assert.equal(hasPermission(state, 'TR-002', 'work.update'), false)
  assert.equal(revoked.audit.length, state.audit.length + 2)
})

test('Desactivar un trabajador impide sus permisos', () => {
  const state = cloneSeedWorkspace()
  const next = updateCollection(state, 'workers', 'TR-001', { active: false }, 'Administrador', 'Trabajador desactivado')
  assert.equal(hasPermission(next, 'TR-001', 'work.update'), false)
})

test('Registrar un trabajo nuevo lo incorpora al mismo estado compartido', () => {
  const state = cloneSeedWorkspace()
  const record = { id:'OT-99', assignedTo:'TR-001', clientId:'CL-001', description:'Revision', status:'Programado', date:'2026-11-29', notes:'' }
  const next = addCollection(state, 'workOrders', record, 'Administrador', 'Orden creada')
  assert.equal(next.workOrders.length, state.workOrders.length + 1)
  assert.equal(next.workOrders[0].assignedTo, 'TR-001')
  assert.equal(next.audit[0].actor, 'Administrador')
})

test('Cambiar una solicitud afecta al estado utilizado por cliente y administrador', () => {
  const state = cloneSeedWorkspace()
  const next = updateCollection(state, 'requests', 'SOL-0041', { status:'En evaluación' }, 'Administrador', 'Solicitud revisada')
  assert.equal(next.requests.find(x => x.id === 'SOL-0041').status, 'En evaluación')
  assert.equal(state.requests.find(x => x.id === 'SOL-0041').status, 'Recibida')
})
