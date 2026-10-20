import test from 'node:test'
import assert from 'node:assert/strict'
import { demoApi } from '../src/demoApi.js'

const storage = new Map()
globalThis.localStorage = {
  getItem: key => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, value),
}

test('El catálogo ficticio combina productos y servicios sin publicar precios', async () => {
  const catalog = await demoApi('/catalog')
  assert.ok(catalog.length >= 4)
  assert.ok(catalog.some(item => item.type === 'PRODUCT'))
  assert.ok(catalog.some(item => item.type === 'SERVICE'))
  assert.ok(catalog.every(item => item.price === undefined))
})

test('Una solicitud de demostración devuelve un seguimiento limitado y sin datos de contacto', async () => {
  const created = await demoApi('/solicitudes', {
    method: 'POST',
    body: JSON.stringify({ contactName:'Persona de prueba', contactPhone:'999999999', lines: [{ catalogItemId:1, quantity:2 },{ catalogItemId:3, quantity:1 }] })
  })
  assert.match(created.code, /^DEMO-/)
  const tracking = await demoApi('/tracking/lookup', { method:'POST', body:JSON.stringify({token:created.token}) })
  assert.equal(tracking.status, 'REGISTERED')
  assert.equal(tracking.lines.length, 2)
  assert.ok(!JSON.stringify(tracking).includes('999999999'))
  assert.ok(!JSON.stringify(tracking).includes('Persona de prueba'))
})

test('Los carritos vacíos y cantidades inválidas se rechazan', async () => {
  const base = { contactName: 'Prueba', contactPhone:'999999999' }
  await assert.rejects(demoApi('/solicitudes', { method:'POST', body:JSON.stringify({ ...base, lines:[] }) }))
  await assert.rejects(demoApi('/solicitudes', { method:'POST', body:JSON.stringify({ ...base, lines:[{catalogItemId:1,quantity:0}] }) }))
})
