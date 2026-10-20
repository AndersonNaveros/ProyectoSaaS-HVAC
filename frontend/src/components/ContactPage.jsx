import UiIcon from './UiIcon.jsx'
import ArrowIcon from './ArrowIcon.jsx'
import blueprintImage from '../assets/technicalPlanning.webp'

const stages = [
  { icon: 'message', title: 'Nos cuentas tu idea', text: 'Explícanos qué equipo buscas o qué sucede con tu instalación.' },
  { icon: 'evaluate', title: 'Revisamos el alcance', text: 'Evaluamos la información y confirmamos si hace falta un diagnóstico técnico.' },
  { icon: 'agree', title: 'Coordinamos contigo', text: 'Acordamos la propuesta, los tiempos y las condiciones antes de ejecutar.' },
]

const contacts = [
  { icon: 'message', title: 'Consultas comerciales', value: 'Prepara tu solicitud de cotización', detail: 'Selecciona equipos y servicios para que podamos revisar tu necesidad.' },
  { icon: 'phone', title: 'Coordinación directa', value: 'Atención según cada proyecto', detail: 'El siguiente paso se acuerda según el alcance de la solicitud.' },
  { icon: 'clock', title: 'Atención administrativa', value: 'Lunes a viernes', detail: 'Los horarios y las visitas se acuerdan según el tipo de solicitud.' },
]

export default function ContactPage({ onHome, onCatalog, onRequest, onServices, totalQuantity }) {
  return (
    <div className="contact-page">
      <nav className="contact-breadcrumb" aria-label="Ruta de navegación">
        <button type="button" onClick={onHome}>Inicio</button><span aria-hidden="true">/</span><span aria-current="page">Contáctanos</span>
      </nav>

      <section className="contact-hero" aria-labelledby="contact-title">
        <div className="contact-intro">
          <span className="eyebrow">CONTACTO Y ASESORÍA</span>
          <h1 id="contact-title">Tu proyecto empieza con una conversación.</h1>
          <p>Cuéntanos si necesitas un equipo, una revisión o una solución para tu instalación. Te ayudamos a ordenar la consulta y preparar el siguiente paso.</p>
          <div className="contact-hero-actions">
            <button type="button" className="primary" onClick={totalQuantity > 0 ? onRequest : onCatalog}>
              {totalQuantity > 0 ? `Revisar mi solicitud (${totalQuantity})` : 'Explorar equipos y servicios'} <ArrowIcon />
            </button>
            <button type="button" className="outline" onClick={onServices}>Ver servicios técnicos <ArrowIcon /></button>
          </div>
        </div>
        <div className="contact-hero-photo">
          <img src={blueprintImage} alt="Planificación de instalaciones técnicas HVAC" loading="lazy" />
          <div className="contact-photo-caption">Cada necesidad tiene una solución que evaluar.</div>
        </div>
      </section>

      <section className="contact-cards" aria-label="Información de contacto y empresa">
        <div className="contact-info-card">
          <span className="eyebrow">HABLEMOS DE TU NECESIDAD</span>
          <h2>Estamos para escucharte.</h2>
          <div className="contact-methods">
            {contacts.map(item => (
              <div className="contact-method" key={item.title}>
                <div className="contact-method-icon"><UiIcon name={item.icon} size={23} /></div>
                <div><strong>{item.title}</strong><p className="contact-method-value">{item.value}</p><small>{item.detail}</small></div>
              </div>
            ))}
          </div>
        </div>
        <div className="contact-info-card contact-company-card">
          <span className="eyebrow">INFORMACIÓN COMERCIAL</span>
          <h2>HVAC CONTROLS S.A.C.</h2>
          <p>Climatización, ventilación, mantenimiento y coordinación de tableros eléctricos.</p>
          <div className="contact-company-row"><strong>Responsable técnico</strong><span>Jesús Manuel Andia Medina</span></div>
          <div className="contact-company-row"><strong>Visitas de diagnóstico</strong><span>Sujetas a autorización y coordinación. Pueden tener costo, que se comunica antes de confirmar.</span></div>
        </div>
      </section>

      <section className="contact-process" aria-labelledby="contact-process-heading">
        <div className="contact-section-heading">
          <span className="eyebrow">ASÍ TE ACOMPAÑAMOS</span>
          <h2 id="contact-process-heading">De la consulta a una propuesta clara.</h2>
          <p>Un proceso simple para que sepas qué información se necesita y qué sucede después.</p>
        </div>
        <div className="contact-process-grid">
          {stages.map(item => (
            <article className="contact-process-step" key={item.title}>
              <div className="contact-process-icon"><UiIcon name={item.icon} size={28} /></div>
              <h3>{item.title}</h3><p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-coverage" aria-label="Zonas de atención">
        <div className="contact-coverage-icon"><UiIcon name="pin" size={28} /></div>
        <div><h2>Atendemos en Lima y evaluamos proyectos en provincias.</h2><p>La ubicación, el desplazamiento y la disponibilidad se coordinan según cada trabajo.</p></div>
        <button type="button" className="outline" onClick={onServices}>Explorar servicios <ArrowIcon /></button>
      </section>

      <section className="contact-final-cta">
        <div><span className="eyebrow">EMPECEMOS</span><h2>¿Ya sabes qué necesitas?</h2><p>Selecciona los equipos o servicios que te interesan y reúnelos en una sola solicitud.</p></div>
        <button type="button" className="contact-final-button" onClick={totalQuantity > 0 ? onRequest : onCatalog}>
          {totalQuantity > 0 ? 'Continuar mi solicitud' : 'Preparar mi solicitud'} <ArrowIcon />
        </button>
      </section>
    </div>
  )
}
