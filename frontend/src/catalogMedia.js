// Imagenes del catalogo de referencia cuando los registros llegan de PostgreSQL.
// Los nuevos equipos conservan un placeholder hasta tener fotografia aprobada.
export function inferMediaKey(item){
  if(item.mediaKey)return item.mediaKey
  const name=String(item.name||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  if(item.type==='SERVICE'){
    if(/mantenimiento|limpieza|preventivo/.test(name))return 'maintenance'
    if(/ventilacion|conductos/.test(name))return 'ducts'
    return 'technical'
  }
  if(/split/.test(name))return 'split'
  if(/cassette/.test(name))return 'cassette'
  if(/difusor/.test(name))return 'diffuser'
  if(/extractor/.test(name))return 'extractor'
  if(/condensadora/.test(name))return 'condenser'
  if(/manejadora/.test(name))return 'handler'
  return ''
}
