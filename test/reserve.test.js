const app = require('../src/app')
const supertest = require('supertest')

let request = supertest(app)

let baseURL = 'http://localhost:4000'
const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}
const endpoints = {
  toCreate: '/reserve',
  toRead: '/reserve',
  toUpdate: '/reserve',
  toDelete: '/reserve',
  toList: '/reserves'
}

describe("Suite de teste para as Reservas.", function() {
  describe("READ", function() {
    describe("Testes de SUCESSO.", function() {

      // Busca por uma única reserva, baseada no ID do apartamento.
      test("/GET - Faz a busca de uma reserva, baseada no ID do apartamento.", function() {
        const apartment = { id: '856377c88f8fd9fc65fd3ef5' }
        return request.get(`${ endpoints.toRead }/${ apartment.id }`)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            const {
              apartment_id,
              status,
              user_id,
              date,
              start,
              end,
              _links
            } = response.body

            expect(apartment_id).toBeDefined()
            expect(apartment_id).toBe(apartment.id)
            
            expect(status).toBeDefined()
            expect(status).toBe("reservado")
            
            expect(user_id).toBeDefined()
            expect(user_id).toBe("507f1f77bcf86cd799439011")
            
            expect(date).toBeDefined()
            expect(date).toBe("2023-08-12T22:49:04.421Z")
            
            expect(start).toBeDefined()
            expect(start).toBe("2023-11-12")
            
            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)
            expect(_links[0]).toMatchObject({
              href: `${ baseURL }/reserves/${ apartment.id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(_links[1]).toMatchObject({
              href: `${ baseURL }/reserves/${ apartment.id }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(_links[2]).toMatchObject({
              href: `${ baseURL }/reserves/${ apartment.id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(_links[3]).toMatchObject({
              href: `${ baseURL }/reserves`,
              method: 'GET',
              rel: 'reserve_list'
            })
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Busca várias reservas.
      test("/GET - Deve retornar 200, na listagem de reservas.", function() {
        return request.get(endpoints.toList)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            for (let reserve of response.body.reserves) {
              expect(reserve).toBeDefined()
              expect(reserve._links).toHaveLength(4)
            }
          })
          .catch(function(error) {
            fail(error)
          })
      })


      // Busca reservas que possuem um determinado Status.
      test("/GET - Deve retornar 200, na listagem de reservas LIVRES.", function() {
        return request.get(`${ endpoints.toList }?status=livre`)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            for (let reserve of response.body.reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('livre')
            }
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/GET - Deve retornar 200, na listagem de apartamento/reservas RESERVADOS.", function() {
        return request.get(endpoints.toList)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            for (let reserve of response.body.reserves) {
              expect(reserve).toBeDefined()
              expect(reserve._links).toHaveLength(4)
            }
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/GET - Deve retornar 200, na listagem de apartamento/reservas OCUPADO.", function() {
        return request.get(`${ endpoints.toList }?status=ocupado`)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            for (let reserve of response.body.reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('ocupado')
            }
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/GET - Deve retornar 200, na listagem de apartamento/reservas INDISPONÍVEL.", function() {
        return request.get(`${ endpoints.toList }?status=indisponível`)
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            for (let reserve of response.body.reserves) {
              expect(reserve).toBeDefined()
              expect(reserve.status).toBe('indisponível')
            }
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })

    describe("Testes de FALHA.", function() {
      test("/GET - Deve retornar 400, pelo ID do apartamento conter caracteres inválidos.", function() {
        return request.get(`${ endpoints.toRead }/856377c88f8fd9fc65fd3e*5`)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)
            
            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/GET - Deve retornar 400, pelo ID do apartamento não pertencer a um apartamento.", function() {
        return request.get(`${ endpoints.toRead }/856377c88f8fd9fc65fd6666`)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)
            
            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })

  describe("UPDATE", function() {
    describe("Testes de SUCESSO.", function() {
      test("/PUT - Deve retornar 200, para sucesso na atualização de uma reserva.", function() {
        let reserve = {
          apartment_id: "27ibm1he7gl4ei9i7jcacbl6",
          status: "reservado",
          user_id: "507f1f77bcf86cd799439011",
          start: "2023-12-01",
          end: "2024-01-30"
        }

        return request.put(endpoints.toUpdate).send(reserve)
          .then(function(responsePUT) {
            expect(responsePUT.statusCode).toEqual(200)

            expect(responsePUT.body._links).toBeDefined()
            expect(responsePUT.body._links).toHaveLength(4)
            expect(responsePUT.body._links[0]).toMatchObject({
              href: `${ baseURL }/reserves/${ reserve.apartment_id }`,
              method: 'GET',
              rel: 'self_reserve'
            })
            expect(responsePUT.body._links[1]).toMatchObject({
              href: `${ baseURL }/reserves/${ reserve.apartment_id }`,
              method: 'PUT',
              rel: 'edit_reserve'
            })
            expect(responsePUT.body._links[2]).toMatchObject({
              href: `${ baseURL }/reserves/${ reserve.apartment_id }`,
              method: 'DELETE',
              rel: 'delete_reserve'
            })
            expect(responsePUT.body._links[3]).toMatchObject({
              href: `${ baseURL }/reserves`,
              method: 'GET',
              rel: 'reserve_list'
            })

            return request.get(`${ endpoints.toRead }/${ reserve.apartment_id }`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(200)

                const {
                  status,
                  date,
                  user_id,
                  start,
                  end
                } = responseGET.body.reserve

                expect(status).toBeDefined()
                expect(status).toBe("reservado")

                expect(date).toBeDefined()

                expect(user_id).toBeDefined()
                expect(user_id).toBe("507f1f77bcf86cd799439011")

                expect(start).toBeDefined()
                expect(start).toBe("2023-12-01")

                expect(end).toBeDefined()
                expect(end).toBe("2024-01-30")

              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorPUT) {
            fail(errorPUT)
          })
      })
    })

    describe("Testes de FALHA.", function() {

      // Falhas no ID do apartamento escolhido.
      test("/PUT - Deve retornar 400, por não conter o ID do apartamento a ser reservado.", function() {
        let reserve = {
          apartment_id: "",
          status: "livre",
          user_id: "507f1f77bcf86cd799439011",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O ID do apartamento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptApartment')
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
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptApartment')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('O ID do apartamento contém caracteres inválidos')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Falhas no Status da reserva.
      test("/PUT - Deve retornar 400, uma vez que NÃO foi informado o Status.", function() {
        let reserve = {
          apartment_id: "856377c88f8fd9fc65fd3ef5",
          status: "",
          user_id: "507f1f77bcf86cd799439011",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
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
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
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
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
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

      // Falhas no ID do cliente.
      test("/PUT - Deve retornar 400, já que não foi informado o cliente que ocupará o apartamento.", function() {
        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "",
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
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
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
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
          start: "2023-11-12",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
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

      // Falhas na Data de Início da reserva.
      test("/PUT - Deve retornar 400, devido a ausência da Data de Início da reserva.", function() {
        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "600f191e810c19829de900ea",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Data de Início da reserva é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptStartDate')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Data de Início da reserva é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 400, devido a presença de caracteres inválidos na Data de Início da reserva.", function() {
        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "600f191e810c19829de900ea",
          start: "2023-12-*2",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O campo de Data de Início da reserva possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptStartDate')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Data de Início da reserva possui caracteres inválidos")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 400, já que a Data de Início é anterior a data Atual.", function() {
        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "600f191e810c19829de900ea",
          start: "2023-08-02",
          end: "2024-01-12"
        }
        return request.put(endpoints.toUpdate).send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("A Data de Início escolhida é inválida")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptStartDate')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Início escolhida é inválida")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Falhas na Data de Fim da reserva.
      test("/PUT - Deve retornar 400, devido a ausência da Data de Fim da reserva.", function() {
        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "600f191e810c19829de900ea",
          start: "2023-12-01"
        }
        return request.put(endpoints.toUpdate).send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Data de Fim da reserva é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptEndDate')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Data de Fim da reserva é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 400, devido a presença de caracteres inválidos na Data de Fim da reserva.", function() {
        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "600f191e810c19829de900ea",
          start: "2023-12-02",
          end: "2024-01-*2"
        }
        return request.put(endpoints.toUpdate).send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O campo de Data de Fim da reserva possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptEndDate')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Data de Fim da reserva possui caracteres inválidos")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 400, por ter informado uma Data de Fim anterior a Data de Início da reserva.", function() {
        let reserve = {
          apartment_id: "02n07j2d1hf5a2f26djjj92a",
          status: "reservado",
          user_id: "600f191e810c19829de900ea",
          start: "2023-12-02",
          end: "2023-12-01"
        }
        return request.put(endpoints.toUpdate).send(reserve)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("A Data de Fim escolhida é inválida")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptEndDate')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("A Data de Fim escolhida é inválida")
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })

  // A Deletação/Cancelamento de uma reserva se baseia no ID do apartamento.
  describe("DELETE", function() {
    describe("Teste de SUCESSO.", function() {
      test("/DELETE - Deve retornar 200, para cancelamento/deleção da reserva.", function() {
        const apartment = { id: 'f5gee7kf7l3dl2950gbn3ckf' }

        return request.delete(`${ endpoints.toDelete }/${ apartment.id }`)
          .then(function(responseDELETE) {
            expect(responseDELETE.statusCode).toEqual(200)

            return request.get(`${ endpoints.toRead }/${ apartment.id }`)
              .then(function(responseGET) {
                expect(responseGET.statusCode).toEqual(200)
                expect(responseGET.body).toMatchObject({
                  apartment_id: apartment.id,
                  status: 'livre',
                  user_id: '',
                  date: '',
                  start: '',
                  end: ''
                })
              })
              .catch(function(errorGET) {
                fail(errorGET)
              })
          })
          .catch(function(errorDELETE) {
            fail(errorDELETE)
          })
      })
    })

    describe("Teste de FALHA.", function() {
      test("/DELETE - Deve retornar 400, já que o ID do apartamento é inválido.", function() {
        const apartment = { id: '27ibm1he7gl4ei9i7jcacb*6' }

        return request.delete(`${ endpoints.toDelete }/${ apartment.id }`)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O ID do apartamento contém caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/DELETE - Deve retornar 404, já que o ID informado não corresponde a um apartamento cadastrado.", function() {
        const apartment = { id: '27ibm1he7gl4ei9i7jcaccc' }

        return request.delete(`${ endpoints.toDelete }/${ apartment.id }`)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)

            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.errors }/3`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })
})