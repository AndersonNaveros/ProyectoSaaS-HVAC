import { useEffect, useMemo, useState } from 'react'
import { createApiClient } from './apiClient.js'
import ductsImage from './assets/ventilationDucts.webp'
import blueprintImage from './assets/technicalPlanning.webp'
import maintenanceImage from './assets/hvacMaintenance.webp'
import officeImage from './assets/officeEnvironment.webp'
import CatalogPage from './components/CatalogPage.jsx'
import AboutPage from './components/AboutPage.jsx'
import ContactPage from './components/ContactPage.jsx'
import ArrowIcon from './components/ArrowIcon.jsx'

const DEMO_MODE = import.meta.env.MODE === 'demo'

const WA = (import.meta.env.VITE_HVAC_WHATSAPP_PHONE || '').replace(/\D/g, '')
const WA_CONFIGURED = /^[1-9][0-9]{7,14}$/.test(WA)
const emptyForm = {
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  companyName: '',
  location: '',
  notes: '',
  preferredContact: 'WHATSAPP',
}
const cartKey = DEMO_MODE ? 'hvac-demo-cart-v1' : 'hvac-live-cart-v14'

const homeHighlights = [
  { icon: '◔', title: '18 años de trayectoria', text: 'Experiencia profesional aproximada del ingeniero.' },
  { icon: '⌂', title: 'Atención directa', text: 'Coordinación con el responsable del proyecto.' },
  { icon: '⌖', title: 'Lima y provincias', text: 'Desplazamientos sujetos a coordinación.' },
]

const solutionCards = [
  {
    title: 'Asesoría y selección',
    subtitle: '01 · UNA SOLUCIÓN COMIENZA POR ENTENDER EL ESPACIO.',
    text: 'Revisamos el uso del ambiente, sus condiciones y los equipos que se están evaluando para orientar una propuesta técnica.',
    bullets: ['Consulta sobre equipos y aplicaciones', 'Revisión de necesidades del ambiente', 'Alcance definido antes de cotizar'],
    image: officeImage,
    cta: 'Consultar asesoría',
  },
  {
    title: 'Climatización y ventilación',
    subtitle: '02 · EQUIPOS E INSTALACIONES PENSADOS PARA SU APLICACIÓN.',
    text: 'Atención de sistemas de aire acondicionado y ventilación, desde la evaluación de la necesidad hasta la coordinación de la instalación.',
    bullets: ['Instalación de equipos de climatización', 'Distribución y renovación de aire', 'Revisión del sistema existente'],
    image: ductsImage,
    cta: 'Consultar una solución',
  },
  {
    title: 'Revisión y mantenimiento',
    subtitle: '03 · CONOCER EL ESTADO DEL EQUIPO PARA DECIDIR CÓMO CUIDARLO.',
    text: 'Revisión del funcionamiento y mantenimiento con actividades acordadas según el equipo, su uso y las condiciones de la instalación.',
    bullets: ['Evaluación inicial del equipo', 'Mantenimiento con alcance acordado', 'Observaciones e informe del servicio'],
    image: maintenanceImage,
    cta: 'Consultar sobre mi equipo',
  },
  {
    title: 'Tableros eléctricos y control',
    subtitle: '04 · COORDINACIÓN TÉCNICA PARA CADA REQUERIMIENTO.',
    text: 'Instalación de tableros eléctricos y coordinación de su diseño con los especialistas que requiera el proyecto.',
    bullets: ['Instalación y revisión de tableros', 'Coordinación del diseño requerido', 'Integración según el alcance aprobado'],
    image: blueprintImage,
    cta: 'Consultar sobre tableros',
  },
]

const caseStudies = [
  {
    title: 'Mantenimiento de climatización en una oficina',
    need: 'Un ambiente requiere revisar sus equipos y organizar su mantenimiento.',
    attention: 'Evaluación del estado, limpieza y revisión de funcionamiento según el alcance acordado.',
    delivery: 'Informe con actividades, fotografías, observaciones y recomendaciones.',
    image: maintenanceImage,
  },
  {
    title: 'Revisión de ventilación en un local comercial',
    need: 'El cliente busca evaluar la renovación de aire y las condiciones de su instalación.',
    attention: 'Visita técnica para revisar el ambiente, los conductos y los componentes existentes.',
    delivery: 'Observaciones técnicas y una propuesta de atención para revisar con el cliente.',
    image: ductsImage,
  },
  {
    title: 'Instalación de un tablero de control',
    need: 'Un proyecto necesita un tablero acorde con los equipos y las funciones previstas.',
    attention: 'Coordinación del diseño con el especialista e instalación según la propuesta aprobada.',
    delivery: 'Registro de las actividades, observaciones y documentación acordada para el proyecto.',
    image: blueprintImage,
  },
]

const processSteps = [
  { number: '01', title: 'Consulta', text: 'Nos cuentas qué necesitas y dónde se realizará el trabajo.' },
  { number: '02', title: 'Evaluación', text: 'Coordinamos la información o visita técnica que requiera el caso.' },
  { number: '03', title: 'Propuesta', text: 'Recibes el alcance, las condiciones y la cotización para revisar.' },
  { number: '04', title: 'Aprobación', text: 'Acordamos la atención, los plazos y las condiciones del servicio.' },
  { number: '05', title: 'Ejecución', text: 'Realizamos las actividades y comunicamos las observaciones.' },
  { number: '06', title: 'Cierre', text: 'Entregamos el informe y el comprobante correspondiente al servicio.' },
]

const testimonials = [
  {
    tag: 'Atencion clara',
    quote: 'Nos explicaron el alcance de la revisión y recibimos las observaciones de forma clara.',
    meta: 'Cliente referencial · mantenimiento',
  },
  {
    tag: 'Coordinacion directa',
    quote: 'Pudimos coordinar la visita y revisar la propuesta antes de comenzar el trabajo.',
    meta: 'Cliente referencial · evaluación técnica',
  },
]

function parseCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(cartKey) || '{}')
    if (cart && typeof cart === 'object' && !Array.isArray(cart)) return cart
  } catch (_) {
    /* Datos locales inválidos, iniciar vacío */
  }
  return {}
}

function createIdempotencyKey() {
  return crypto.randomUUID()
}

const api = createApiClient({ demo: DEMO_MODE })

function pageFromPath(path) {
  return ({
    '/': 'home',
    '/catalogo': 'catalog',
    '/nosotros': 'about',
    '/contacto': 'contact',
    '/seguimiento': 'tracking',
    '/solicitud': 'cart',
  })[path] || 'home'
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function copyText(value) {
  return navigator.clipboard.writeText(value)
}

function whatsappLink(message) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(message)}`
}

const labelType = type => (type === 'PRODUCT' ? 'Producto' : 'Servicio')

function Arrow(props) {
  return <ArrowIcon {...props} />
}

function Brand({ goHome }) {
  return (
    <div className="brand" onClick={goHome} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && goHome()}>
      <div className="brand-mark" aria-hidden="true">≋</div>
      <div>
        <strong>HVAC CONTROLS</strong>
        <span>CLIMATIZACIÓN Y VENTILACIÓN</span>
      </div>
    </div>
  )
}

function Info({ children }) {
  return (
    <div className="info">
      <span aria-hidden="true">ⓘ</span>
      <span>{children}</span>
    </div>
  )
}

function ErrorNotice({ children }) {
  return children ? <div className="error" role="alert">{children}</div> : null
}

export default function App() {
  const [page, setPage] = useState(pageFromPath(window.location.pathname))
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [cart, setCart] = useState(parseCart)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [showWhatsappPreview, setShowWhatsappPreview] = useState(false)
  const [trackingToken, setTrackingToken] = useState(new URLSearchParams(window.location.hash.slice(1)).get('token') || '')
  const [tracking, setTracking] = useState(null)
  const [trackingError, setTrackingError] = useState('')
  const [trackingBusy, setTrackingBusy] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    api('/catalog')
      .then(setItems)
      .catch(() => setCatalogError('No se pudo cargar el catálogo. Confirma que Java y PostgreSQL estén encendidos.'))
      .finally(() => setLoadingItems(false))
  }, [])

  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const syncRoute = () => {
      setPage(pageFromPath(location.pathname))
      setTrackingToken(new URLSearchParams(location.hash.slice(1)).get('token') || '')
    }
    window.addEventListener('popstate', syncRoute)
    window.addEventListener('hashchange', syncRoute)
    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [])

  useEffect(() => {
    if (page !== 'tracking' || !trackingToken) return
    setTrackingBusy(true)
    setTrackingError('')
    setTracking(null)
    api('/tracking/lookup', { method: 'POST', body: JSON.stringify({ token: trackingToken }) })
      .then(setTracking)
      .catch(() => setTrackingError('El enlace no es válido o ha caducado. Contacta con HVAC para solicitar ayuda.'))
      .finally(() => setTrackingBusy(false))
  }, [page, trackingToken])

  const selected = useMemo(
    () => items.filter(item => Number(cart[item.id]) > 0).map(item => ({ ...item, quantity: Number(cart[item.id]) })),
    [items, cart],
  )
  const totalQuantity = selected.reduce((sum, item) => sum + item.quantity, 0)
  const hasService = selected.some(item => item.type === 'SERVICE')
  const update = (field, value) => setForm(data => ({ ...data, [field]: value }))

  function navigate(view) {
    const newPath = ({
      home: '/',
      catalog: '/catalogo',
      about: '/nosotros',
      contact: '/contacto',
      cart: '/solicitud',
      done: '/solicitud/confirmada',
      tracking: '/seguimiento',
    })[view] || '/'

    if (window.location.pathname !== newPath) history.pushState({}, '', newPath)
    setPage(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function editQuantity(id, delta) {
    setCart(current => {
      const next = { ...current }
      const value = Number(next[id] || 0) + delta
      if (value <= 0) delete next[id]
      else next[id] = Math.min(999, value)
      return next
    })
  }

  function add(item) {
    editQuantity(item.id, 1)
    setToast(`Agregado: ${item.name}`)
  }

  function followCart() {
    setStep(1)
    navigate('cart')
  }

  function goCatalog() {
    navigate('catalog')
  }

  function goHome() {
    navigate('home')
  }


  async function submitRequest(e) {
    e.preventDefault()
    if (sending || !selected.length) return

    setSendError('')
    const key = sessionStorage.getItem('hvac-pending-key') || createIdempotencyKey()
    sessionStorage.setItem('hvac-pending-key', key)

    const data = {
      ...form,
      idempotencyKey: key,
      lines: selected.map(item => ({ catalogItemId: item.id, quantity: item.quantity })),
    }

    setSending(true)
    try {
      const result = await api('/solicitudes', { method: 'POST', body: JSON.stringify(data) })
      if (result.alreadyRegistered && !result.token) {
        setSendError(`La solicitud ya estaba registrada. Usa el enlace privado guardado o contacta con HVAC con la referencia ${result.code}.`)
        return
      }

      const secretUrl = `${window.location.origin}/seguimiento#token=${result.token}`
      setSubmitted({ ...result, secretUrl })
      setShowWhatsappPreview(false)
      sessionStorage.removeItem('hvac-pending-key')
      setCart({})
      setStep(1)
      navigate('done')
    } catch (err) {
      setSendError(err.message || 'Error inesperado')
    } finally {
      setSending(false)
    }
  }

  async function safeCopy(value, message) {
    try {
      await copyText(value)
      setToast(message)
    } catch (_) {
      setToast('No se pudo copiar. Revisa los permisos de tu navegador.')
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="nav-wrap">
          <Brand goHome={goHome} />
          <nav aria-label="Navegación principal">
            {[
              ['home', 'Inicio'],
              ['catalog', 'Catálogo'],
              ['about', 'Nosotros'],
              ['contact', 'Contacto'],
            ].map(([view, label]) => (
              <button key={view} type="button" onClick={() => navigate(view)} className={page === view ? 'nav-active' : ''}>
                {label}
              </button>
            ))}
          </nav>
          <button className="cart-header" type="button" onClick={followCart}>
            Mi solicitud <span className="count">{totalQuantity}</span>
          </button>
        </div>
      </header>

      <main className="site-main">
        {page === 'home' && (
          <>
            <section className="hero hero-public">
              <div className="hero-copy">
                <div className="eyebrow">CLIMATIZACIÓN · VENTILACIÓN · CONTROL</div>
                <h1>Climatización con experiencia. Atención directa.</h1>
                <p>
                  Soluciones técnicas con Jesús Manuel Andia Medina, ingeniero con aproximadamente 18 años de experiencia profesional
                  en climatización, ventilación y tableros eléctricos.
                </p>
                <div className="hero-actions">
                  <button className="primary" onClick={() => navigate('contact')}>
                    Consultar mi proyecto <Arrow />
                  </button>
                  <button className="outline" onClick={goCatalog}>
                    Explorar equipos <Arrow />
                  </button>
                </div>
                <p className="hero-caption">Un ingeniero responsable, desde la consulta hasta el cierre.</p>
              </div>

              <div className="hero-visual-card">
                <img src={blueprintImage} alt="Plano y coordinación técnica para un proyecto HVAC" className="hero-visual-image" />
                <div className="hero-visual-overlay">
                  <strong>Ingeniería que inspira confianza.</strong>
                  <Arrow />
                </div>
              </div>
            </section>

            <section className="highlights-strip" aria-label="Fortalezas de HVAC Controls">
              {homeHighlights.map(item => (
                <article className="highlight-item" key={item.title}>
                  <span className="highlight-icon" aria-hidden="true">{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </section>

            <section className="home-section split-heading">
              <div>
                <span className="eyebrow">NUESTRAS SOLUCIONES</span>
                <h2>Conocimiento técnico para lo que necesitas resolver.</h2>
              </div>
              <p>
                Desde la elección del equipo hasta el mantenimiento y el control, definimos cada atención a partir de las necesidades del proyecto.
              </p>
            </section>

            <section className="feature-grid">
              {solutionCards.map(card => (
                <article className="feature-card" key={card.title}>
                  <img src={card.image} alt={card.title} className="feature-media" />
                  <div className="feature-body">
                    <span className="feature-kicker">{card.subtitle}</span>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                    <ul className="feature-list">
                      {card.bullets.map(point => <li key={point}>{point}</li>)}
                    </ul>
                    <button type="button" className="link-cta" onClick={() => navigate('contact')}>
                      {card.cta} <Arrow />
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <section className="home-section founder-section">
              <div className="founder-card">
                <div className="founder-badge">JM</div>
                <span className="eyebrow light">INGENIERO RESPONSABLE · FUNDADOR</span>
                <h3>Jesús Manuel Andia Medina</h3>
                <p>Aproximadamente 18 años de trayectoria profesional.</p>
              </div>

              <div className="founder-copy">
                <span className="eyebrow">LA PERSONA DETRÁS DEL PROYECTO</span>
                <h2>Experiencia técnica. Una atención cercana.</h2>
                <p>
                  HVAC CONTROLS S.A.C. nace como una nueva etapa independiente, respaldada por la trayectoria de su fundador en el sector técnico.
                </p>
                <p>
                  Su experiencia incluye climatización, ventilación, instalación de tableros eléctricos y coordinación de su diseño. Ha participado en trabajos en Perú y Bolivia.
                </p>
                <p>
                  Actualmente lidera la atención de la empresa. Cuando el alcance lo requiere, coordina con colegas especialistas para desarrollar el trabajo.
                </p>
                <div className="mini-pills">
                  <span>Criterio técnico</span>
                  <span>Alcance claro</span>
                  <span>Trato directo</span>
                </div>
                <button type="button" className="link-cta" onClick={() => navigate('about')}>
                  Conocer la empresa <Arrow />
                </button>
              </div>
            </section>

            <section className="home-section split-heading cases-heading">
              <div>
                <span className="eyebrow">APLICACIONES DE NUESTROS SERVICIOS</span>
                <h2>De una necesidad concreta a una propuesta de trabajo.</h2>
              </div>
              <p>Explora soluciones para mantenimiento, ventilación e instalaciones de control en distintos espacios.</p>
            </section>

            <section className="case-grid">
              {caseStudies.map(caseItem => (
                <article className="case-card" key={caseItem.title}>
                  <div className="case-image-wrap">
                    <img src={caseItem.image} alt={caseItem.title} className="case-image" />
                  </div>
                  <div className="case-body">
                    <h3>{caseItem.title}</h3>
                    <div className="case-detail">
                      <strong>Necesidad</strong>
                      <p>{caseItem.need}</p>
                    </div>
                    <div className="case-detail">
                      <strong>Atención propuesta</strong>
                      <p>{caseItem.attention}</p>
                    </div>
                    <div className="case-detail">
                      <strong>Entrega prevista</strong>
                      <p>{caseItem.delivery}</p>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <section className="home-section split-heading process-heading">
              <div>
                <span className="eyebrow">ASÍ ORGANIZAMOS LA ATENCIÓN</span>
                <h2>Cada etapa, con un siguiente paso claro.</h2>
              </div>
              <p>La propuesta define el alcance, las condiciones y la documentación. Cualquier trabajo adicional se coordina antes de ejecutarlo.</p>
            </section>

            <section className="steps-grid">
              {processSteps.map(stepItem => (
                <article className="step-card" key={stepItem.number}>
                  <span className="step-number">{stepItem.number}</span>
                  <div>
                    <h3>{stepItem.title}</h3>
                    <p>{stepItem.text}</p>
                  </div>
                </article>
              ))}
            </section>

            <section className="docs-section">
              <div className="docs-main">
                <span className="eyebrow">DOCUMENTACIÓN Y SEGUIMIENTO</span>
                <h2>El trabajo también se entrega por escrito.</h2>
                <p>Una propuesta ordenada y un informe comprensible ayudan a conocer qué se acordó, qué se hizo y qué observaciones conviene atender.</p>
                <div className="docs-list">
                  <div>
                    <strong>Propuesta de servicio</strong>
                    <p>Alcance, condiciones y actividades por aprobar.</p>
                  </div>
                  <div>
                    <strong>Informe técnico</strong>
                    <p>Actividades, observaciones, recomendaciones y evidencias.</p>
                  </div>
                  <div>
                    <strong>Documentos del cliente</strong>
                    <p>Relación de informes, comprobantes y entregables asociados a cada trabajo.</p>
                  </div>
                </div>
                <button type="button" className="outline docs-button" onClick={() => navigate('contact')}>
                  Consultar documentación técnica <Arrow />
                </button>
              </div>

              <aside className="docs-side">
                <span className="eyebrow">CONTINUIDAD DE ATENCIÓN</span>
                <h3>Un mantenimiento que se pueda planificar.</h3>
                <p>Podemos coordinar una atención puntual o revisar una propuesta de mantenimiento programado según los equipos y su uso.</p>
                <ul>
                  <li>Equipos y ubicación identificados.</li>
                  <li>Actividades y frecuencia acordadas.</li>
                  <li>Observaciones para la siguiente visita.</li>
                </ul>
                <button type="button" className="outline" onClick={() => navigate('contact')}>
                  Consultar mantenimiento <Arrow />
                </button>
                <div className="docs-divider" />
                <h3>Tu solicitud, en un solo lugar.</h3>
                <p>Reúne equipos y servicios y comprueba cada elemento antes de realizar tu consulta.</p>
                <button type="button" className="link-cta" onClick={followCart}>
                  Revisar mi solicitud <Arrow />
                </button>
              </aside>
            </section>

            <section className="home-section split-heading testimonial-heading">
              <div>
                <span className="eyebrow">ESPACIO DE OPINIONES</span>
                <h2>La atención que queremos que recuerdes.</h2>
              </div>
              <p>Buscamos que cada cliente recuerde una atención ordenada, clara y fácil de coordinar desde el primer contacto.</p>
            </section>

            <section className="testimonial-grid">
              {testimonials.map(item => (
                <article className="testimonial-card" key={item.meta}>
                  <div className="testimonial-top">
                    <span className="case-label neutral testimonial-badge">{item.tag}</span>
                    <span className="testimonial-mark" aria-hidden="true">“”</span>
                  </div>
                  <blockquote>“{item.quote}”</blockquote>
                  <p>{item.meta}</p>
                </article>
              ))}
            </section>
          </>
        )}

        {page === 'catalog' && <CatalogPage
          items={items}
          cart={cart}
          totalQuantity={totalQuantity}
          loadingItems={loadingItems}
          catalogError={catalogError}
          onHome={goHome}
          onCart={followCart}
          onAdd={add}
        />}

        {page === 'about' && (
          <AboutPage
            onHome={goHome}
            onContact={() => navigate('contact')}
            onCatalog={goCatalog}
          />
        )}

        {page === 'contact' && <ContactPage
          onHome={goHome}
          onCatalog={goCatalog}
          onRequest={followCart}
          onServices={() => { history.pushState({}, '', '/catalogo?tipo=servicios'); setPage('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          totalQuantity={totalQuantity}
        />}

        {page === 'cart' && (
          <div className="narrow-layout">
            <div className="back-link-row"><button type="button" className="back-link" onClick={goCatalog}><Arrow direction="left" /> Volver al catálogo</button></div>
            <span className="eyebrow">SOLICITUD DE COTIZACIÓN</span>
            <h1>Cuéntanos qué necesitas.</h1>
            <p className="intro">Tres pasos breves para organizar tu solicitud. No es necesario crear una cuenta.</p>

            <div className="progress" aria-label={`Paso ${step} de 3`}>
              {['Revisar', 'Tus datos', 'Confirmar'].map((label, index) => (
                <div key={label} className={`progress-segment ${step >= index + 1 ? 'completed' : ''}`}>
                  <span>{index + 1}</span> {label}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="panel">
                <h2>Tu solicitud</h2>
                <p>Productos y servicios en un solo lugar.</p>
                {!selected.length && <Info>Tu solicitud está vacía. Explora el catálogo para comenzar.</Info>}

                <div className="selected-list">
                  {selected.map(item => (
                    <div className="selected-item" key={item.id}>
                      <div className="selected-text">
                        <span className="eyebrow">{labelType(item.type)}</span>
                        <strong>{item.name}</strong>
                        <small>{item.sku || item.category}</small>
                      </div>
                      <div className="quantity">
                        <button aria-label={`Restar ${item.name}`} onClick={() => editQuantity(item.id, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button aria-label={`Agregar ${item.name}`} onClick={() => editQuantity(item.id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <Info>El carrito no reserva existencias y no muestra importes. HVAC preparará una cotización privada.</Info>
                <button className="primary wide" disabled={!selected.length} onClick={() => setStep(2)}>
                  Continuar a mis datos <Arrow />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="panel">
                <h2>¿Cómo prefieres continuar?</h2>
                <div className="identity-row">
                  <div className="identity-option selected-option">
                    <strong>Continuar como invitado</strong>
                    <span>Solo necesitamos datos de contacto.</span>
                  </div>
                  <div className="identity-option disabled-option">
                    <strong>Ingresar con mi cuenta</strong>
                    <span>Disponible en una próxima versión.</span>
                  </div>
                </div>

                <form onSubmit={e => { e.preventDefault(); if (e.currentTarget.reportValidity()) setStep(3) }}>
                  <div className="fields-two">
                    <label>
                      Nombre completo <em>*</em>
                      <input required maxLength={120} value={form.contactName} onChange={e => update('contactName', e.target.value)} placeholder="Tu nombre" />
                    </label>
                    <label>
                      Teléfono / WhatsApp <em>*</em>
                      <input required maxLength={20} pattern="[+0-9 ()-]{7,20}" value={form.contactPhone} onChange={e => update('contactPhone', e.target.value)} placeholder="Ej. +51 999 999 999" type="tel" />
                    </label>
                  </div>

                  <div className="fields-two">
                    <label>
                      Correo electrónico (opcional)
                      <input type="email" maxLength={160} value={form.contactEmail} onChange={e => update('contactEmail', e.target.value)} placeholder="tu@empresa.com" />
                    </label>
                    <label>
                      Empresa (opcional)
                      <input maxLength={180} value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Razón social" />
                    </label>
                  </div>

                  {hasService && (
                    <label>
                      Ubicación del servicio (opcional)
                      <input maxLength={240} value={form.location} onChange={e => update('location', e.target.value)} placeholder="Distrito o dirección referencial" />
                    </label>
                  )}

                  <label>
                    Medio de contacto preferido
                    <select value={form.preferredContact} onChange={e => update('preferredContact', e.target.value)}>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="PHONE">Llamada</option>
                      <option value="EMAIL">Correo electrónico</option>
                    </select>
                  </label>

                  <div className="split-actions">
                    <button className="outline" type="button" onClick={() => setStep(1)}><Arrow direction="left" /> Atrás</button>
                    <button className="primary" type="submit">
                      Revisar solicitud <Arrow />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="panel">
                <h2>Revisa y confirma</h2>
                <p>Esta solicitud se registrará primero. Después podrás preparar el resumen para contactarte con HVAC.</p>
                <div className="summary-lines">
                  <div><span>Solicitante</span><strong>{form.contactName || '—'}</strong></div>
                  <div><span>Contacto</span><strong>{form.contactPhone || '—'}</strong></div>
                  <div><span>Productos y servicios</span><strong>{selected.length} referencias · {totalQuantity} unidades/servicios</strong></div>
                </div>

                <label>
                  ¿Hay algún detalle adicional? (opcional)
                  <textarea maxLength={2000} rows={3} placeholder="Describe brevemente tu requerimiento si lo necesitas" value={form.notes} onChange={e => update('notes', e.target.value)} />
                </label>

                <Info>Una visita de diagnóstico puede tener costo. HVAC confirmará la tarifa y las condiciones antes de coordinarla.</Info>

                <form onSubmit={submitRequest}>
                  <label className="check-row">
                    <input type="checkbox" required />
                    <span>
                      Confirmo que los datos son correctos y acepto que HVAC los utilice para atender esta solicitud.
                      <b> La política de privacidad definitiva debe aprobarse antes de publicar el sitio.</b>
                    </span>
                  </label>
                  <ErrorNotice>{sendError}</ErrorNotice>
                  <div className="split-actions">
                    <button className="outline" type="button" onClick={() => setStep(2)}><Arrow direction="left" /> Editar mis datos</button>
                    <button className="primary" type="submit" disabled={sending}>
                      {sending ? 'Registrando…' : 'Registrar solicitud'} {!sending && <Arrow />}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {page === 'done' && submitted && (
          <div className="narrow-layout">
            <div className="panel success-panel">
              <div className="success-symbol">✓</div>
              <span className="eyebrow">SOLICITUD REGISTRADA</span>
              <h1>¡Solicitud registrada!</h1>
              <p>Tu solicitud quedó guardada. Ahora puedes conservar tu enlace privado y preparar el resumen para continuar el contacto con la empresa.</p>
              <div className="code-box">
                <span>Tu referencia</span>
                <strong>{submitted.code}</strong>
              </div>

              <div className="success-actions">
                <button className="outline wide" onClick={() => safeCopy(submitted.secretUrl, 'Enlace privado copiado')}>
                  Copiar mi enlace privado
                </button>
                <button
                  className="outline wide"
                  onClick={() => {
                    history.pushState({}, '', `/seguimiento#token=${submitted.token}`)
                    setTrackingToken(submitted.token)
                    setPage('tracking')
                  }}
                >
                  Ver seguimiento <Arrow />
                </button>

                {DEMO_MODE ? (
                  <button className="primary wide" onClick={() => setShowWhatsappPreview(value => !value)}>
                    Enviar resumen por WhatsApp a la empresa <Arrow />
                  </button>
                ) : WA_CONFIGURED ? (
                  <a className="primary wide" href={whatsappLink(submitted.whatsappSummary)} target="_blank" rel="noopener noreferrer">
                    Enviar resumen por WhatsApp a la empresa <Arrow />
                  </a>
                ) : (
                  <button className="primary wide" onClick={() => safeCopy(submitted.whatsappSummary, 'Resumen de WhatsApp copiado')}>
                    Copiar resumen para WhatsApp <Arrow />
                  </button>
                )}
              </div>

              {DEMO_MODE && showWhatsappPreview && (
                <div className="wa-preview" aria-live="polite">
                  <strong>Vista previa del mensaje</strong>
                  <p>Revisa el resumen antes de usarlo.</p>
                  <pre>{submitted.whatsappSummary}</pre>
                  <div className="preview-actions">
                    <button className="outline" onClick={() => safeCopy(submitted.whatsappSummary, 'Resumen copiado')}>
                      Copiar mensaje
                    </button>
                    <button className="outline" onClick={() => setShowWhatsappPreview(false)}>
                      Cerrar vista previa
                    </button>
                  </div>
                </div>
              )}

              <Info>El enlace privado permite consultar un estado limitado. Guárdalo con cuidado y no lo compartas públicamente.</Info>
            </div>
          </div>
        )}

        {page === 'tracking' && (
          <div className="narrow-layout">
            <div className="back-link-row"><button type="button" className="back-link" onClick={goCatalog}><Arrow direction="left" /> Volver al catálogo</button></div>
            <span className="eyebrow">SEGUIMIENTO PRIVADO</span>
            <h1>Estado de tu solicitud</h1>
            {!trackingToken && (
              <div className="panel">
                <p>Abre el enlace privado que recibiste al registrar tu solicitud. El código público por sí solo no permite ver el estado.</p>
              </div>
            )}
            {trackingBusy && <p role="status">Consultando estado…</p>}
            <ErrorNotice>{trackingError}</ErrorNotice>
            {tracking && (
              <div className="panel">
                <span className="eyebrow">REFERENCIA</span>
                <h2 className="tracking-code">{tracking.code}</h2>
                <span className="state-chip">{tracking.status === 'REGISTERED' ? 'Solicitud registrada' : tracking.status}</span>
                <p>Fecha de solicitud: {formatDate(tracking.createdAt)}</p>
                <h3>Resumen</h3>
                <div className="selected-list">
                  {tracking.lines.map((line, index) => (
                    <div key={index} className="tracking-row">
                      <span>{line.name}</span>
                      <span>{line.quantity} {line.type === 'PRODUCT' ? 'unidad(es)' : 'servicio(s)'}</span>
                    </div>
                  ))}
                </div>
                <Info>Esta vista no expone precios, datos personales ni documentos privados. Las condiciones económicas las comunica HVAC de forma autorizada.</Info>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-block">
            <div className="footer-brand-title">HVAC CONTROLS S.A.C.</div>
            <p>Climatización · Ventilación · Control</p>
            <small>Soluciones de climatización, ventilación y control con atención técnica y coordinación directa.</small>
          </div>

          <div className="footer-column">
            <strong>Navegación</strong>
            <button type="button" className="footer-link" onClick={goHome}>Inicio</button>
            <button type="button" className="footer-link" onClick={goCatalog}>Catálogo</button>
            <button type="button" className="footer-link" onClick={() => navigate('about')}>Nosotros</button>
            <button type="button" className="footer-link" onClick={() => navigate('contact')}>Contacto</button>
          </div>

          <div className="footer-column">
            <strong>Atención</strong>
            <p>Propuesta técnica, mantenimiento, climatización, ventilación y coordinación de tableros.</p>
            <button type="button" className="footer-link footer-cta" onClick={followCart}>
              Crear mi solicitud <Arrow />
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 HVAC CONTROLS S.A.C.</span>
          <span>Atención técnica y comercial previa coordinación.</span>
        </div>
      </footer>

      {toast && <div className="toast" role="status" onAnimationEnd={() => setToast('')}>{toast}</div>}
    </>
  )
}
