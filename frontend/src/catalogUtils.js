// Filtros del catálogo compartidos por React y las pruebas
const normalize = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('es')
  .trim()

export function filterCatalog(items, { type = 'ALL', category = 'ALL', query = '', sort = 'name-asc' } = {}) {
  const needle = normalize(query)

  const matches = items.filter(item => {
    if (type !== 'ALL' && item.type !== type) return false
    if (category !== 'ALL' && item.category !== category) return false
    const searchable = normalize([item.name, item.summary, item.category, item.sku, item.brand].join(' '))
    return !needle || searchable.includes(needle)
  })

  return [...matches].sort((a, b) => {
    const order = String(a.name).localeCompare(String(b.name), 'es', { sensitivity: 'base' })
    return sort === 'name-desc' ? -order : order
  })
}

export function catalogCategories(items, type = 'ALL') {
  return [...new Set(items
    .filter(item => type === 'ALL' || item.type === type)
    .map(item => item.category)
    .filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
}
