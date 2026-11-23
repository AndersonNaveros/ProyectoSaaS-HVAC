import { demoApi } from './demoApi.js'

// Dejamos la comunicacion HTTP en un solo archivo para poder probarla sin React.
export function createApiClient({ demo = false, fetchImpl = fetch, demoImpl = demoApi } = {}) {
  return async function api(path, options = {}) {
    if (!/^\/[a-z0-9/_-]+$/i.test(path)) throw new Error('Ruta de API invalida')
    if (demo) return demoImpl(path, options)

    let response
    try {
      response = await fetchImpl(`/api${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
      })
    } catch {
      throw new Error('No hay conexion con la API. Comprueba que Spring Boot este encendido.')
    }

    const body = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(body?.error || `La API respondio con error ${response.status}`)
    }
    if (body === null) throw new Error('La API no devolvio una respuesta JSON valida')
    return body
  }
}
