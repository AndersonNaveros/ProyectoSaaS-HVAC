import test from 'node:test'
import assert from 'node:assert/strict'
import { inferMediaKey } from '../src/catalogMedia.js'
test('los datos de la API conservan imagenes de referencia por tipo de equipo',()=>{
  assert.equal(inferMediaKey({type:'PRODUCT',name:'Cassette de cuatro vías'}),'cassette')
  assert.equal(inferMediaKey({type:'PRODUCT',name:'Unidad condensadora'}),'condenser')
  assert.equal(inferMediaKey({type:'PRODUCT',name:'Nuevo producto sin foto'}),'')
  assert.equal(inferMediaKey({type:'SERVICE',name:'Mantenimiento preventivo'}),'maintenance')
})
