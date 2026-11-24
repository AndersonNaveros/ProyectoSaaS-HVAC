import { useEffect, useMemo, useRef, useState } from 'react'
import equipmentImage from '../assets/hvacEquipment.webp'
import ductsImage from '../assets/ventilationDucts.webp'
import blueprintImage from '../assets/technicalPlanning.webp'
import officeImage from '../assets/officeEnvironment.webp'
import maintenanceImage from '../assets/hvacMaintenance.webp'
import { catalogCategories, filterCatalog } from '../catalogUtils.js'
import ArrowIcon from './ArrowIcon.jsx'
import { inferMediaKey } from '../catalogMedia.js'

function Arrow(props) { return <ArrowIcon {...props} /> }
function Info({ children }) { return <div className="info"><span aria-hidden="true">ⓘ</span><span>{children}</span></div> }
function ErrorNotice({ children }) { return children ? <div className="error" role="alert">{children}</div> : null }
const labelType = type => type === 'PRODUCT' ? 'Producto' : 'Servicio'

// Fotos referenciales del prototipo: las imágenes finales necesitan aprobación de HVAC
const mosaicPositions = {
  split: '0% 0%',
  cassette: '50% 0%',
  diffuser: '100% 0%',
  extractor: '0% 100%',
  condenser: '50% 100%',
  handler: '100% 100%',
}
const serviceImages = {
  maintenance: maintenanceImage,
  technical: blueprintImage,
  ducts: ductsImage,
}

function CatalogMedia({ item, large = false }) {
  const key = inferMediaKey(item)
  const name = item.name || 'Equipo o servicio'
  const classes = `catalog-visual ${large ? 'catalog-visual-large' : ''}`

  if (item.imageUrl) {
    return <div className={classes}><img src={item.imageUrl} alt={name} loading="lazy" /></div>
  }
  if (mosaicPositions[key]) {
    return (
      <div
        className={`${classes} catalog-visual-mosaic`}
        style={{ backgroundImage: `url(${equipmentImage})`, backgroundPosition: mosaicPositions[key] }}
        role="img"
        aria-label={`Fotografía referencial de ${name}`}
      />
    )
  }
  if (serviceImages[key]) {
    return <div className={classes}><img src={serviceImages[key]} alt={`Imagen referencial de ${name}`} loading="lazy" /></div>
  }
  return (
    <div className={`${classes} catalog-visual-placeholder`} role="img" aria-label={`Sin imagen disponible para ${name}`}>
      <span aria-hidden="true">{item.type === 'SERVICE' ? '⌁' : '▤'}</span>
    </div>
  )
}

function CatalogDetailDialog({ item, onClose, onAdd }) {
  const modalRef = useRef(null)

  useEffect(() => {
    const dialog = modalRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    return () => { if (dialog.open) dialog.close() }
  }, [])

  return (
    <dialog
      className="catalog-dialog"
      ref={modalRef}
      onCancel={onClose}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}
      aria-labelledby="catalog-detail-title"
    >
      <div className="catalog-dialog-inner">
        <div className="catalog-dialog-top">
          <span className="eyebrow">{labelType(item.type)} · {item.category}</span>
          <button className="catalog-close" type="button" onClick={onClose} aria-label="Cerrar detalles">×</button>
        </div>
        <CatalogMedia item={item} large />
        <h2 id="catalog-detail-title">{item.name}</h2>
        <p>{item.summary}</p>
        {item.sku && <p className="catalog-item-sku">Referencia: {item.sku}</p>}
        <p className="catalog-dialog-footnote">
          {item.type === 'SERVICE'
            ? 'El alcance, la programación y las condiciones de este servicio se revisan con la empresa antes de confirmar la atención.'
            : 'La disponibilidad, compatibilidad y condiciones comerciales del equipo se confirman al preparar la cotización.'}
        </p>
        <div className="catalog-dialog-actions">
          <button type="button" className="outline" onClick={onClose}>Volver al catálogo</button>
          <button type="button" className="primary" onClick={() => { onAdd(item); onClose() }}>
            Agregar a solicitud <Arrow />
          </button>
        </div>
      </div>
    </dialog>
  )
}


export default function CatalogPage({ items, cart, totalQuantity, loadingItems, catalogError, onHome, onCart, onAdd }) {
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tipo') === 'servicios' ? 'SERVICE' : 'ALL')
  const [filter, setFilter] = useState('')
  const [category, setCategory] = useState('ALL')
  const [sort, setSort] = useState('name-asc')
  const [visibleCount, setVisibleCount] = useState(8)
  const [detailItem, setDetailItem] = useState(null)

  const categories = useMemo(() => catalogCategories(items, tab), [items, tab])
  const shown = useMemo(() => filterCatalog(items, { type: tab, category, query: filter, sort }), [items, tab, category, filter, sort])
  const visibleItems = shown.slice(0, visibleCount)
  const catalogProductCount = items.filter(item => item.type === 'PRODUCT').length
  const catalogServiceCount = items.filter(item => item.type === 'SERVICE').length
  const quickCategories = [
    { name: 'Climatización', image: equipmentImage },
    { name: 'Ventilación', image: ductsImage },
    { name: 'Control', image: blueprintImage },
    { name: 'Mantenimiento', image: maintenanceImage },
    { name: 'Diagnóstico', image: officeImage },
  ].filter(entry => items.some(item => item.category === entry.name))
  const hasCatalogFilters = filter.trim() || tab !== 'ALL' || category !== 'ALL' || sort !== 'name-asc'

  function chooseType(nextType) {
    setTab(nextType)
    setCategory('ALL')
    setVisibleCount(8)
  }

  function clearCatalogFilters() {
    setTab('ALL')
    setCategory('ALL')
    setFilter('')
    setSort('name-asc')
    setVisibleCount(8)
  }

  return (
    <>
          <section id="catalogo" className="catalog-section catalog-redesign">
            <div className="catalog-breadcrumb"><button type="button" onClick={onHome}>Inicio</button><span aria-hidden="true">/</span><span>Catálogo</span></div>
            <div className="catalog-heading">
              <div>
                <span className="eyebrow">EQUIPOS Y SERVICIOS TÉCNICOS</span>
                <h1>Encuentra lo que necesitas.</h1>
                <p>Explora los equipos y servicios disponibles para consulta. Agrégalos a una misma solicitud y nuestro equipo evaluará tu requerimiento.</p>
              </div>
              <button type="button" className="outline catalog-cart-link" onClick={onCart}>
                Mi solicitud <span className="catalog-cart-badge">{totalQuantity}</span> <Arrow />
              </button>
            </div>

            <section className="catalog-discover" aria-labelledby="catalog-discover-title">
              <div className="catalog-discover-title">
                <div><span className="eyebrow">ENCUENTRA TU SOLUCIÓN</span><h2 id="catalog-discover-title">Explora por categoría.</h2></div>
                <p>Elige lo que necesitas. Después puedes afinar tu búsqueda con los filtros.</p>
              </div>
              <div className="catalog-quick-categories">
                {quickCategories.map(entry => (
                  <button type="button" className={`catalog-category-tile ${category === entry.name ? 'catalog-category-active' : ''}`} key={entry.name} onClick={() => { setTab('ALL'); setCategory(entry.name); setVisibleCount(8) }}>
                    <img src={entry.image} alt="" loading="lazy" />
                    <span>{entry.name} <Arrow direction="right" /></span>
                  </button>
                ))}
              </div>
            </section>

            <div className="catalog-highlight">
              <div>
                <span className="eyebrow">SERVICIOS TÉCNICOS</span>
                <h2>No todo comienza eligiendo un equipo.</h2>
                <p>También puedes solicitar una revisión, mantenimiento o instalación. Nuestro equipo te ayuda a definir el alcance.</p>
                <button type="button" className="catalog-highlight-button" onClick={() => chooseType('SERVICE')}>Explorar servicios <Arrow /></button>
              </div>
              <img src={maintenanceImage} alt="Revisión de un equipo de aire acondicionado" loading="lazy" />
            </div>

            <div className="catalog-controls">
              <div className="catalog-search">
                <span>Buscar en el catálogo</span>
                <div className="catalog-search-field">
                  <span className="catalog-search-icon" aria-hidden="true">⌕</span>
                  <input type="search" aria-label="Buscar en el catálogo" value={filter} onChange={event => { setFilter(event.target.value); setVisibleCount(8) }} placeholder="Ej. termostato, mantenimiento, ventilación" />
                  {filter && <button type="button" onClick={() => { setFilter(''); setVisibleCount(8) }}>Limpiar</button>}
                </div>
              </div>
              <div className="catalog-control-lower">
                <div className="catalog-type-tabs" role="group" aria-label="Tipo de elemento">
                  <button type="button" className={tab === 'ALL' ? 'active' : ''} aria-pressed={tab === 'ALL'} onClick={() => chooseType('ALL')}>
                    Todo <span>{items.length}</span>
                  </button>
                  <button type="button" className={tab === 'PRODUCT' ? 'active' : ''} aria-pressed={tab === 'PRODUCT'} onClick={() => chooseType('PRODUCT')}>
                    Equipos <span>{catalogProductCount}</span>
                  </button>
                  <button type="button" className={tab === 'SERVICE' ? 'active' : ''} aria-pressed={tab === 'SERVICE'} onClick={() => chooseType('SERVICE')}>
                    Servicios <span>{catalogServiceCount}</span>
                  </button>
                </div>
                <div className="catalog-selects">
                  <label>
                    <span>Categoría</span>
                    <select value={category} onChange={event => { setCategory(event.target.value); setVisibleCount(8) }}>
                      <option value="ALL">Todas las categorías</option>
                      {categories.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Ordenar</span>
                    <select value={sort} onChange={event => { setSort(event.target.value); setVisibleCount(8) }}>
                      <option value="name-asc">Nombre A–Z</option>
                      <option value="name-desc">Nombre Z–A</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="catalog-results-top" aria-live="polite">
              <p>{loadingItems ? 'Cargando catálogo…' : `${shown.length} ${shown.length === 1 ? 'resultado' : 'resultados'}`}</p>
              {hasCatalogFilters && <button type="button" className="catalog-reset" onClick={clearCatalogFilters}>Restablecer filtros</button>}
              {totalQuantity > 0 && <button className="catalog-inline-cart" type="button" onClick={onCart}>{totalQuantity} seleccionados · Revisar solicitud <Arrow /></button>}
            </div>

            <ErrorNotice>{catalogError}</ErrorNotice>
            <div className="catalog-grid" aria-label="Resultados del catálogo">
              {visibleItems.map(item => (
                <article className="catalog-card catalog-card-redesign" key={item.id}>
                  <div className="catalog-media-wrap">
                    <CatalogMedia item={item} />
                    <span className="catalog-tag">{labelType(item.type)}</span>
                  </div>
                  <div className="catalog-body">
                    <span className="catalog-card-category">{item.category}</span>
                    <h3>{item.name}</h3>
                    <p>{item.summary}</p>
                    <div className="catalog-card-actions">
                      <button className="catalog-detail-button" type="button" onClick={() => setDetailItem(item)}>Ver detalles</button>
                      <button className="catalog-add-button" type="button" onClick={() => onAdd(item)} aria-label={`Agregar ${item.name} a mi solicitud`}>
                        <span aria-hidden="true">+</span> Agregar
                      </button>
                    </div>
                    {Number(cart[item.id]) > 0 && <span className="catalog-added">✓ {cart[item.id]} en tu solicitud</span>}
                  </div>
                </article>
              ))}
            </div>

            {!loadingItems && !catalogError && shown.length === 0 && (
              <div className="catalog-empty">
                <h2>No encontramos coincidencias.</h2>
                <p>Prueba con otro nombre o elimina algún filtro. Si necesitas un equipo específico, también puedes consultarnos directamente.</p>
                <button className="outline" onClick={clearCatalogFilters}>Ver todo el catálogo <Arrow /></button>
              </div>
            )}
            {visibleCount < shown.length && (
              <div className="catalog-load-wrap">
                <span>Mostrando {visibleItems.length} de {shown.length} resultados</span>
                <button className="outline" type="button" onClick={() => setVisibleCount(count => count + 8)}>
                  Mostrar más resultados <Arrow direction="down" />
                </button>
              </div>
            )}
          </section>
      {detailItem && <CatalogDetailDialog item={detailItem} onClose={() => setDetailItem(null)} onAdd={onAdd} />}
    </>
  )
}
