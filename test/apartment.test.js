const app = require('../src/app')
const supertest = require('supertest')

const request = supertest(app)

const projectLinks = {
  erros: 'https://projetohotelparaiso.dev/docs/erros'
}

describe("Suite de testes das rotas de Apartment.", function() {
  describe("CREATE", function() {
    describe("Testes de SUCESSO.", function() {})
    describe("Testes de FALHA.", function() {

      // Cadastro de apartamento
      test("/POST - Deve retornar 400 pela ausência do campo de Piso (floor) do apartamento.", function() {
        return request.post('/apartments').send({
          floor: "",
          number: "9",
          status: "1",
          user_id: "507f1f77bcf86cd799439011",
          start: "2023-11-12T11:49:04.421Z",
          end: "2024-01-12T14:49:04.421Z"
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Piso do apartamento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptFloor')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo de Piso do apartamento é obrigatório')
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
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