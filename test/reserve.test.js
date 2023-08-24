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

      test("/PUT - Deve retornar 400, já que o valor de Status é inválido.", function() {
        let reserve = {
          apartment_id: "856377c88f8fd9fc65fd3ef5",
          status: "1",
          user_id: "507f1f77bcf86cd799439011",
          date: "2023-08-12T22:49:04.421Z",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put('/reserves').send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O valor do campo de Status é inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptStatus')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O valor do campo de Status é inválido')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 400, já que o apartamento já está reservado, ocupado ou indisponível.", function() {
        let reserve = {
          apartment_id: "856377c88f8fd9fc65fd3ef5",
          status: "reservado",
          user_id: "507f1f77bcf86cd799439011",
          date: "2023-08-12T22:49:04.421Z",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put('/reserves').send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("4")
            expect(response.body.RestException.Message).toBe("O apartamento escolhido já está Reservado, Ocupado ou Indisponível")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/4`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptStatus')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O apartamento escolhido já está Reservado, Ocupado ou Indisponível")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 400, já que não foi informado o cliente que ocupará o apartamento.", function() {
        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "",
          date: "2023-08-12T22:49:04.421Z",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put('/reserves').send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O ID do cliente/usuário é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptClient')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O ID do cliente/usuário é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 400, já que ID do cliente contém caractere inválido.", function() {
        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "507f1f77bcf86cd79943901*",
          date: "2023-08-12T22:49:04.421Z",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put('/reserves').send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O ID do cliente/usuário contém caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptClient')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O ID do cliente/usuário contém caracteres inválidos")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 404, já que ID do cliente não foi encontrado.", function() {
        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "6kde3ibi8a1d4187c1ji73bj",
          date: "2023-08-12T22:49:04.421Z",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put('/reserves').send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)

            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("Nenhum usuário com o ID informado está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptClient')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("Nenhum usuário com o ID informado está cadastrado")
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })
})