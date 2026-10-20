import ArrowIcon from './ArrowIcon.jsx'
import blueprintImage from '../assets/technicalPlanning.webp'
import UiIcon from './UiIcon.jsx'

const ourApproach = [
  {
    icon: 'message',
    title: 'Escuchar',
    detail: 'Entendemos qué necesita el cliente y las condiciones del espacio antes de proponer una solución.',
  },
  {
    icon: 'evaluate',
    title: 'Evaluar',
    detail: 'Revisamos los datos técnicos del proyecto y, si hace falta, coordinamos una visita de diagnóstico.',
  },
  {
    icon: 'agree',
    title: 'Acordar',
    detail: 'Definimos el alcance, las condiciones y los entregables antes de iniciar el trabajo.',
  },
  {
    icon: 'document',
    title: 'Documentar',
    detail: 'Registramos actividades, observaciones y evidencias según el servicio contratado.',
  },
]

export default function AboutPage({ onHome, onContact, onCatalog }) {
  return (
    <div className="about-page">
      <nav className="about-breadcrumb" aria-label="Ruta de navegación">
        <button type="button" onClick={onHome}>Inicio</button>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Nosotros</span>
      </nav>

      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-intro">
          <span className="eyebrow">SOBRE HVAC CONTROLS S.A.C.</span>
          <h1 id="about-title">Una trayectoria técnica. Una atención cercana.</h1>
          <p>
            HVAC Controls nace como un proyecto independiente, respaldado por la experiencia profesional de su fundador en climatización, ventilación y control.
          </p>
          <p>
            Buscamos acompañar cada necesidad con una evaluación clara, una propuesta técnica comprensible y coordinación directa con el cliente.
          </p>
        </div>
        <div className="about-values" aria-label="Nuestra manera de trabajar">
          <span>NUESTRA MANERA DE TRABAJAR</span>
          <strong>Precisión.<br/>Claridad.<br/>Confianza.</strong>
          <div className="about-values-line" />
          <p>Ingeniería que inspira confianza.</p>
        </div>
      </section>

      <section className="about-founder" aria-labelledby="about-founder-title">
        <div className="about-founder-copy">
          <span className="eyebrow">EL PROFESIONAL DETRÁS DE LA EMPRESA</span>
          <h2 id="about-founder-title">Jesús Manuel Andia Medina</h2>
          <p>
            Ingeniero con aproximadamente 18 años de trayectoria profesional. Su experiencia comprende climatización, ventilación, equipos técnicos e instalación de tableros eléctricos.
          </p>
          <p>
            Ha participado en proyectos en Perú y Bolivia. Actualmente lidera la atención de HVAC Controls y coordina con especialistas cuando las características del trabajo lo requieren.
          </p>
          <p>
            Nuestra prioridad es que cada proyecto tenga un responsable identificable, condiciones conversadas desde el inicio y documentación acorde con el servicio realizado.
          </p>
          <div className="about-specialties" aria-label="Especialidades de la empresa">
            <span>Climatización</span><span>Ventilación</span><span>Control</span>
          </div>
        </div>
        <figure className="about-founder-photo">
          <img
            src={blueprintImage}
            alt="Mesa de trabajo con planos de instalaciones HVAC"
            loading="lazy"
          />
        </figure>
      </section>

      <section className="about-method" aria-labelledby="about-method-title">
        <div className="about-section-heading">
          <span className="eyebrow">NUESTRA FORMA DE TRABAJAR</span>
          <h2 id="about-method-title">Cada proyecto comienza por entender lo que necesitas.</h2>
          <p>Un proceso sencillo para coordinar equipos y servicios técnicos sin perder claridad en cada etapa.</p>
        </div>
        <div className="about-method-grid">
          {ourApproach.map(step => (
            <article className="about-method-step" key={step.title}>
              <div className="about-step-icon"><UiIcon name={step.icon} size={28} /></div>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta" aria-label="Consulta tu proyecto">
        <div>
          <span className="about-cta-label">HABLEMOS DE TU PROYECTO</span>
          <h2>Cuéntanos qué necesitas resolver.</h2>
          <p>Atendemos consultas de equipos y servicios; coordinamos visitas y proyectos según su alcance.</p>
        </div>
        <div className="about-cta-actions">
          <button type="button" className="about-cta-button" onClick={onContact}>
            Preparar mi consulta <ArrowIcon />
          </button>
          <button type="button" className="about-cta-link" onClick={onCatalog}>
            Explorar catálogo <ArrowIcon />
          </button>
        </div>
      </section>
    </div>
  )
}
