import test from 'node:test'
import assert from 'node:assert/strict'
import { filterCatalog, catalogCategories } from '../src/catalogUtils.js'
import { demoCatalog } from '../src/demoApi.js'

test('El filtro ALL incluye productos y servicios y no altera el original', () => {
  const all = filterCatalog(demoCatalog)
  assert.ok(all.some(item => item.type === 'PRODUCT'))
  assert.ok(all.some(item => item.type === 'SERVICE'))
  assert.equal(all.length, demoCatalog.length)
  assert.notEqual(all, demoCatalog)
})

test('Filtrar por tipo y categoría funciona en combinación', () => {
  const filtered = filterCatalog(demoCatalog, { type: 'SERVICE', category: 'Mantenimiento' })
  assert.ok(filtered.length > 0)
  assert.ok(filtered.every(item => item.type === 'SERVICE' && item.category === 'Mantenimiento'))
})

test('La búsqueda ignora mayúsculas y tildes y soporta SKU', () => {
  const byName = filterCatalog(demoCatalog, { query: 'DIAGNOSTICO' })
  assert.ok(byName.some(item => item.name.includes('Diagnóstico')))
  const bySku = filterCatalog(demoCatalog, { query: 'DEMO-TH-01' })
  assert.equal(bySku[0].name, 'Termostato programable')
})

test('El orden descendente invierte al ascendente', () => {
  const asc = filterCatalog(demoCatalog, { sort: 'name-asc' }).map(i => i.name)
  const desc = filterCatalog(demoCatalog, { sort: 'name-desc' }).map(i => i.name)
  assert.deepEqual(desc, [...asc].reverse())
})

test('Las categorías disponibles respetan el tipo y no se repiten', () => {
  const categories = catalogCategories(demoCatalog, 'SERVICE')
  assert.ok(categories.includes('Diagnóstico'))
  assert.equal(new Set(categories).size, categories.length)
})
