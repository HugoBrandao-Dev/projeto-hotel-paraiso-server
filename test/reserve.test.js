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
    describe("Testes de FALHA.", function() {
      test("/PUT - Deve retornar 400, por não conter o ID do apartamento a ser reservado.", function() {
        let reserve = {
          apartment_id: "",
          status: "livre",
          user_id: "507f1f77bcf86cd799439011",
          date: "2023-08-12T22:49:04.421Z",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put('/reserves').send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O ID do apartamento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('id')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O ID do apartamento é obrigatório')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 400, por conter caracteres inválidos no ID do apartamento.", function() {
        let reserve = {
          apartment_id: "sdf*q98-we7",
          status: "livre",
          user_id: "507f1f77bcf86cd799439011",
          date: "2023-08-12T22:49:04.421Z",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put('/reserves').send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O parâmetro ID possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('id')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O parâmetro ID possui caracteres inválidos')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 400, uma vez que NÃO foi informado o Status.", function() {
        let reserve = {
          apartment_id: "856377c88f8fd9fc65fd3ef5",
          status: "",
          user_id: "507f1f77bcf86cd799439011",
          date: "2023-08-12T22:49:04.421Z",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put('/reserves').send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Status é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptStatus')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O campo de Status é obrigatório')
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })
})