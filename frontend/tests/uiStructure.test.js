import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = relativePath => readFileSync(new URL(relativePath, import.meta.url), 'utf8')

test('Nosotros es un componente propio y el footer sigue compartido desde App', () => {
  const app = read('../src/App.jsx')
  const about = read('../src/components/AboutPage.jsx')
  assert.match(app, /import AboutPage from/)
  assert.match(app, /<AboutPage/)
  assert.equal((app.match(/<footer className="site-footer">/g) || []).length, 1)
  assert.match(about, /NUESTRA FORMA DE TRABAJAR/)
  assert.match(about, /Escuchar/)
  assert.match(about, /Evaluar/)
  assert.match(about, /Acordar/)
  assert.match(about, /Documentar/)
})

test('El botón mostrar más usa la flecha hacia abajo, y la flecha es SVG reutilizable', () => {
  const catalog = read('../src/components/CatalogPage.jsx')
  const arrow = read('../src/components/ArrowIcon.jsx')
  assert.match(catalog, /Mostrar más resultados\s*<Arrow direction="down"\s*\/>/)
  assert.match(arrow, /<svg/)
  assert.match(arrow, /strokeWidth="2\.9"/)
  assert.match(arrow, /down:/)
  assert.match(arrow, /right:/)
  assert.match(arrow, /left:/)
})
