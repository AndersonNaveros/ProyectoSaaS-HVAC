import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiClient } from '../src/apiClient.js'

test('el modo demo usa el simulador sin llamar al backend', async () => {
  let called = false
  const api = createApiClient({
    demo: true,
    demoImpl: async path => ({ path, mode: 'demo' }),
    fetchImpl: async () => { called = true },
  })
  assert.deepEqual(await api('/catalog'), { path: '/catalog', mode: 'demo' })
  assert.equal(called, false)
})

test('el modo real envia al backend mediante el proxy de Vite', async () => {
  let request
  const api = createApiClient({
    fetchImpl: async (url, options) => {
      request = { url, options }
      return { ok: true, json: async () => [{ id: 1, type: 'PRODUCT' }] }
    },
  })
  const result = await api('/catalog')
  assert.equal(request.url, '/api/catalog')
  assert.equal(request.options.headers['Content-Type'], 'application/json')
  assert.equal(result[0].type, 'PRODUCT')
})

test('la API muestra el error devuelto por Spring Boot', async () => {
  const api = createApiClient({
    fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ error: 'Solicitud invalida' }) }),
  })
  await assert.rejects(api('/solicitudes', { method: 'POST' }), /Solicitud invalida/)
})

test('un backend apagado genera un mensaje entendible', async () => {
  const api = createApiClient({ fetchImpl: async () => { throw new Error('ECONNREFUSED') } })
  await assert.rejects(api('/catalog'), /No hay conexion con la API/)
})

test('una respuesta no JSON o ruta inesperada produce error', async () => {
  const api = createApiClient({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new Error('HTML') } }) })
  await assert.rejects(api('/catalog'), /no devolvio una respuesta JSON valida/)
  await assert.rejects(api('https://otro-sitio/', {}), /Ruta de API invalida/)
})
