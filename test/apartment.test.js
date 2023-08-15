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

      /*
      // Validação do Piso do apartamento.
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

      test("/POST - Deve retornar 400, pelo valor do Piso (floor) do apartamento ser inválido.", function() {

        // O valor de floor deve ser NUMÉRICO.
        return request.post('/apartments').send({
          floor: "occuped",
          number: "9",
          status: "1",
          user_id: "507f1f77bcf86cd799439011",
          start: "2023-11-12T11:49:04.421Z",
          end: "2024-01-12T14:49:04.421Z"
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O valor do campo do Piso do apartamento é inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptFloor')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O valor do campo do Piso do apartamento é inválido')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, pelo valor do Piso (floor) do apartamento ser inválido (estar fora do intervalo válido).", function() {
        return request.post('/apartments').send({
          floor: "88",
          number: "9",
          status: "1",
          user_id: "507f1f77bcf86cd799439011",
          start: "2023-11-12T11:49:04.421Z",
          end: "2024-01-12T14:49:04.421Z"
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O Piso informado não existe")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptFloor')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O Piso informado não existe')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Validação do Número do apartamento.
      test("/POST - Deve retornar 400, pela ausência do campo de Número do apartamento.", function() {
        return request.post('/apartments').send({
          floor: "3",
          number: "",
          status: "1",
          user_id: "507f1f77bcf86cd799439011",
          start: "2023-11-12T11:49:04.421Z",
          end: "2024-01-12T14:49:04.421Z"
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo Número do Apartamento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptNumber')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo Número do Apartamento é obrigatório')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, pelo valor do Número do apartamento ser inválido.", function() {

        // O valor de Número do Apartamento deve ser NUMÉRICO.
        return request.post('/apartments').send({
          floor: "3",
          number: "um",
          status: "1",
          user_id: "507f1f77bcf86cd799439011",
          start: "2023-11-12T11:49:04.421Z",
          end: "2024-01-12T14:49:04.421Z"
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O valor do campo de Número do Apartamento é inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptNumber')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O valor do campo de Número do Apartamento é inválido')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, devido ao valor do Número do Apartamento já ter sido cadastrado anteriormente.", function() {
        return request.post('/apartments').send({
          floor: "3",
          number: "11",
          status: "1",
          user_id: "507f1f77bcf86cd799439011",
          start: "2023-11-12T11:49:04.421Z",
          end: "2024-01-12T14:49:04.421Z"
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("4")
            expect(response.body.RestException.Message).toBe("O Número do Apartamento já está cadastrado")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/4`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptNumber')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O Número do Apartamento já está cadastrado")
          })
          .catch(function(error) {
            fail(error)
          })
      })
      */

      // Validação dos cômodos
      test("/POST - Deve retornar 400, pela ausência dos valores dos cômodos do apartamento.", function() {
        return request.post('/apartments').send({
          floor: "3",
          number: "10",
          rooms: []
        })
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Cômodos é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Cômodos é obrigatório")
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