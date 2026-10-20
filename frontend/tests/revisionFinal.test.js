import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8')

test('Contáctanos mantiene navegación, contacto, coordinación, cobertura y CTA', () => {
  const contact = read('../src/components/ContactPage.jsx')
  assert.match(contact, /Contáctanos/)
  assert.match(contact, /Estamos para escucharte/)
  assert.match(contact, /INFORMACIÓN COMERCIAL/)
  assert.match(contact, /ASÍ TE ACOMPAÑAMOS/)
  assert.match(contact, /proyectos en provincias/)
  assert.match(contact, /Preparar mi solicitud/)
})

test('El footer se mantiene en una sola posición compartida', () => {
  const app = read('../src/App.jsx')
  assert.equal((app.match(/<footer className="site-footer">/g) || []).length, 1)
  assert.match(app, /<ContactPage/)
  assert.match(app, /<CatalogPage/)
  assert.match(app, /<AboutPage/)
})

test('Nosotros usa iconos vectoriales, no números, en la forma de trabajar', () => {
  const about = read('../src/components/AboutPage.jsx')
  const icons = read('../src/components/UiIcon.jsx')
  assert.match(about, /<UiIcon name=\{step.icon\}/)
  assert.doesNotMatch(about, /about-step-number/)
  assert.match(icons, /<svg/)
})

test('El catálogo incluye descubrimiento visual, filtros y servicios', () => {
  const catalog = read('../src/components/CatalogPage.jsx')
  assert.match(catalog, /Explora por categoría/)
  assert.match(catalog, /catalog-category-tile/)
  assert.match(catalog, /No todo comienza eligiendo un equipo/)
  assert.match(catalog, /onClick=\{\(\) => chooseType\('SERVICE'\)\}/)
  assert.match(catalog, /Mostrar más resultados <Arrow direction="down"/)
})
