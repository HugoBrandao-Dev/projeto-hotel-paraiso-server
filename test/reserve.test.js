const app = require('../src/app')
const supertest = require('supertest')

let request = supertest(app)

let baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

describe("Suite de teste para as Reservas.", function() {
  describe("UPDATE", function() {
    describe("Testes de SUCESSO.", function() {})
    describe("Testes de FALHA.", function() {})
  })
})