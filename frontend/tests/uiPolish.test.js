import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')

test('Volver al catálogo ocupa su propia fila en la solicitud', () => {
  const app = read('../src/App.jsx')
  const css = read('../src/globalStyles.css')
  assert.match(app, /<div className="back-link-row"><button type="button" className="back-link"/)
  assert.match(css, /\.back-link-row\s*\{[^}]*display:\s*flex;/)
  assert.match(css, /\.back-link-row\s*\{[^}]*margin-bottom:\s*25px;/)
})

test('Las leyendas de contenido provisional no aparecen en las páginas públicas', () => {
  const pages = [read('../src/App.jsx'), read('../src/components/AboutPage.jsx'), read('../src/components/ContactPage.jsx')]
  for (const page of pages) {
    assert.doesNotMatch(page, /Imagen ilustrativa|Fotografía ilustrativa|Brochure corporativo|Espacio para su fotografía profesional|Imagen por confirmar/)
  }
})

test('Los comandos propios se nombran en camelCase y las rutas de estilos existen', () => {
  const pkg = JSON.parse(read('../package.json'))
  for (const name of ['devDemo', 'buildDemo', 'testAll']) assert.ok(pkg.scripts[name])
  const main = read('../src/main.jsx')
  for (const name of ['globalStyles.css', 'catalogPage.css', 'aboutPage.css', 'contactPage.css']) {
    assert.ok(main.includes(`'./${name}'`))
  }
})
