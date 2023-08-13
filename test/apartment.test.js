const app = require('../src/app')
const supertest = require('supertest')

const request = supertest(app)

const projectLinks = {
  erros: 'https://projetohotelparaiso.dev/docs/erros'
}

describe("Suite de testes das rotas de Apartment.", function() {
  describe("CREATE", function() {
    describe("Testes de SUCESSO.", function() {})
    describe("Testes de FALHA.", function() {})
  })
  describe("READ", function() {
    describe("Testes de SUCESSO.", function() {})
    describe("Testes de FALHA.", function() {})
  })
  describe("UPDATE", function() {
    describe("Testes de SUCESSO.", function() {})
    describe("Testes de FALHA.", function() {})
  })
  describe("DELETE", function() {
    describe("Testes de SUCESSO.", function() {})
    describe("Testes de FALHA.", function() {})
  })
})