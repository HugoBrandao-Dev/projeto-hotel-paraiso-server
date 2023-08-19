const app = require('../src/app')
const supertest = require('supertest')

const request = supertest(app)

let baseURL = 'http://localhost:4000'
const projectLinks = {
  erros: 'https://projetohotelparaiso.dev/docs/erros'
}

describe("Suite de testes das rotas de Apartment.", function() {
  describe("CREATE", function() {
    describe("Testes de SUCESSO.", function() {
      test("/POST - Deve retornar 201, para sucesso no cadastro de um apartamento.", function() {
        let apartment = {
          floor: "1",
          number: "3",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(201)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })

    describe("Testes de FALHA.", function() {

      // Validação do Piso do apartamento.
      test("/POST - Deve retornar 400 pela ausência do campo de Piso (floor) do apartamento.", function() {
        let apartment = {
          floor: "",
          number: "9",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
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
        let apartment = {
          floor: "occuped",
          number: "9",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }

        // O valor de floor deve ser NUMÉRICO.
        return request.post('/apartments').send(apartment)
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
        let apartment = {
          floor: "88",
          number: "9",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
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
        let apartment = {
          floor: "3",
          number: "",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
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
        let apartment = {
          floor: "3",
          number: "um",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        // O valor de Número do Apartamento deve ser NUMÉRICO.
        return request.post('/apartments').send(apartment)
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
        let apartment = {
          floor: "3",
          number: "11",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
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

      // Validação dos cômodos
      test("/POST - Deve retornar 400, pela ausência dos valores dos cômodos do apartamento.", function() {
        return request.post('/apartments').send({
          floor: "3",
          number: "10",
          rooms: [],
          daily_price: '200'
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

      test("/POST - Deve retornar 400, pela ausência do valor do nome do campo obrigatório.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: '',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe('Um dos campos dos comodos informados não possui valor')
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('Um dos campos dos comodos informados não possui valor')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, pela presença de campos inválidos nos cômodos do apartamento.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              // Não é 'rooms' e sim 'room'
              rooms: 'sala de estar',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe('A lista de cômodos possui campos inválidos')
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('A lista de cômodos possui campos inválidos')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, pela presença de um caracter inválido no nome do cômodo do apartamento.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar*',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe(`'${ apartment.rooms[0].room }' possui caracteres inválidos`)
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe(`'${ apartment.rooms[0].room }' possui caracteres inválidos`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, pela ausência de um campo no cômodo do apartamento.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe('Faltam campos em um dos cômodos informados')
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe('Faltam campos em um dos cômodos informados')
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos na quantidade de um determinado comodo.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: 'um'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe(`A quantidade de ${ apartment.rooms[0].room } possui caracteres inválidos`)
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe(`A quantidade de ${ apartment.rooms[0].room } possui caracteres inválidos`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, pela ausência de um campo no cômodo do apartamento.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'cozinha',
              quantity: '-1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe(`A quantidade de ${ apartment.rooms[0].room } é inválida`)
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe(`A quantidade de ${ apartment.rooms[0].room } é inválida`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, pela ausência de um campo no cômodo do apartamento.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'cozinha',
              quantity: '-1'
            }
          ],
          daily_price: '200'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe(`A quantidade de ${ apartment.rooms[0].room } é inválida`)
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptRooms')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe(`A quantidade de ${ apartment.rooms[0].room } é inválida`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      // Validação da diária do apartamento.
      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no valor da diária.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: ''
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("1")
            expect(response.body.RestException.Message).toBe("O campo de Diária do Apartamento é obrigatório")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/1`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptDailyPrice')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O campo de Diária do Apartamento é obrigatório")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no valor da diária.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '-800'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O valor da diária é inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptDailyPrice')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O valor da diária é inválido")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no valor da diária.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '800a'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O valor da diária contém caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptDailyPrice')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O valor da diária contém caracteres inválidos")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no valor da diária.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '800,52'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O separador de decimal do valor da diária é inválido")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptDailyPrice')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("O separador de decimal do valor da diária é inválido")
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/POST - Deve retornar 400, devido a presença de caracteres inválidos no valor da diária.", function() {
        let apartment = {
          floor: "3",
          number: "10",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '800.525'
        }
        return request.post('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("A quantidade de casas decimais é inválida")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
            expect(response.body.RestException.ErrorFields[0].field).toBe('iptDailyPrice')
            expect(response.body.RestException.ErrorFields[0].hasError.error).toBe("A quantidade de casas decimais é inválida")
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })
  describe("READ", function() {
    describe("Testes de SUCESSO.", function() {
      test("/GET - Deve retornar 200, para busca de um apartamento pelo seu ID.", function() {
        let apartment = { id: 'd9d62beecdde62af82efd82c' }
        return request.get(`/apartments/${ apartment.id }`)
          .then(function(response) {
            const {
              id,
              floor,
              number,
              rooms,
              daily_price,
              reserve,
              created,
              updated,
              _links
            } = response.body

            expect(response.statusCode).toEqual(200)

            expect(id).toBeDefined()
            expect(id).toBe(apartment.id)

            expect(floor).toBeDefined()
            expect(floor).toBe("3")

            expect(number).toBeDefined()
            expect(number).toBe("12")

            expect(rooms).toBeDefined()
            expect(rooms).toHaveLength(4)

            expect(rooms[0]).toBeDefined()
            expect(rooms[0]).toMatchObject({
              room: "sala de estar",
              quantity: "1"
            })

            expect(rooms[1]).toBeDefined()
            expect(rooms[1]).toMatchObject({
              room: "cozinha",
              quantity: "1"
            })

            expect(rooms[2]).toBeDefined()
            expect(rooms[2]).toMatchObject({
              room: "banheiro",
              quantity: "2"
            })

            expect(rooms[3]).toBeDefined()
            expect(rooms[3]).toMatchObject({
              room: "quarto",
              quantity: "2"
            })

            expect(daily_price).toBeDefined()
            expect(daily_price).toEqual("500")

            expect(reserve).toBeDefined()
            expect(reserve).toMatchObject({
              status: "ocupado",
              user_id: "600f191e810c19829de900ea",
              date: "2022-08-12T22:49:04.421Z",
              start: "2022-11-12T01:49:04.421Z",
              end: "2023-01-12T19:49:04.421Z"
            })

            expect(created).toBeDefined()
            expect(created).toMatchObject({
              createdAt: "2022-06-12T22:01:20.596Z",
              createdBy: "5da9ea674234635bdff45c02"
            })

            expect(updated).toBeDefined()
            expect(updated).toMatchObject({
              updatedAt: "2023-01-12T10:25:49.045Z",
              updatedBy: "507f1f77bcf86cd799439011"
            })

            expect(_links).toBeDefined()
            expect(_links).toHaveLength(4)
            expect(_links[0]).toMatchObject({
              href: `${ baseURL }/apartments/${ id }`,
              method: 'GET',
              rel: 'self_apartment'
            })
            expect(_links[1]).toMatchObject({
              href: `${ baseURL }/apartments/${ id }`,
              method: 'PUT',
              rel: 'edit_apartment'
            })
            expect(_links[2]).toMatchObject({
              href: `${ baseURL }/apartments/${ id }`,
              method: 'DELETE',
              rel: 'delete_apartment'
            })
            expect(_links[3]).toMatchObject({
              href: `${ baseURL }/apartments`,
              method: 'GET',
              rel: 'apartment_list'
            })
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/GET - Deve retornar 200 e uma lista com 2 apartamentos", function() {
        return request.get('/apartments')
          .then(function(response) {
            expect(response.statusCode).toEqual(200)

            expect(response.body.apartments).toBeDefined()
            expect(response.body.apartments[0]).toBeDefined()
            expect(response.body.apartments[0]._links).toHaveLength(3)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })

    describe("Testes de FALHA.", function() {

      // Leituras individuais de apartamentos
      test("/GET - Deve retornar 400, já que o ID do apartamento não foi informado.", function() {
        return request.get('/apartments/856377c88f8fd9fc65fd3ef*')
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O parâmetro ID possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/GET - Deve retornar 404, já que o ID não pertence a um apartamento cadastrado.", function() {
        return request.get('/apartments/d9d62beecdde62af82efd82d')
          .then(function(response) {
            expect(response.statusCode).toEqual(404)

            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/3`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })
  describe("UPDATE", function() {
    describe("Testes de SUCESSO.", function() {
      test("/PUT - Deve retornar 200, para sucesso na atualização das informações de uma apartamento.", function() {

        let apartment = {
          id: "d9d62beecdde62af82efd82c",
          floor: "3",
          number: "7",
          rooms: [
            {
              room: "sala de estar",
              quantity: "1"
            },
            {
              room: "cozinha",
              quantity: "1"
            },
            {
              room: "banheiro",
              quantity: "1"
            },
            {
              room: "quarto",
              quantity: "1"
            }
          ],
          daily_price: "400",
        }

        return request.put('/apartments').send(apartment)
          .then(function(responsePUT) {
            if (responsePUT.body.RestException) {
              console.log(responsePUT.body.RestException)
            }

            expect(responsePUT.statusCode).toEqual(200)

            return request.get(`/apartments/${ apartment.id }`)
              .then(function(responseGET) {
                const {
                  id,
                  floor,
                  number,
                  rooms,
                  updated,
                  _links
                } = responseGET.body

                expect(id).toBeDefined()
                expect(id).toBe(apartment.id)

                expect(floor).toBeDefined()
                expect(floor).toBe("3")

                expect(number).toBeDefined()
                expect(number).toBe("7")

                expect(rooms).toBeDefined()
                expect(rooms).toHaveLength(4)

                expect(updated).toBeDefined()
                expect(updated).toMatchObject({
                  updatedAt: expect.any(String),
                  updatedBy: expect.any(String)
                })

                expect(_links).toBeDefined()
                expect(_links).toHaveLength(4)
                expect(_links[0]).toMatchObject({
                  href: `${ baseURL }/apartments/${ id }`,
                  method: 'GET',
                  rel: 'self_apartment'
                })
                expect(_links[1]).toMatchObject({
                  href: `${ baseURL }/apartments/${ id }`,
                  method: 'PUT',
                  rel: 'edit_apartment'
                })
                expect(_links[2]).toMatchObject({
                  href: `${ baseURL }/apartments/${ id }`,
                  method: 'DELETE',
                  rel: 'delete_apartment'
                })
                expect(_links[3]).toMatchObject({
                  href: `${ baseURL }/apartments`,
                  method: 'GET',
                  rel: 'apartment_list'
                })
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
      test("/PUT - Deve retornar 400, uma vez que o ID informado é inválido.", function() {
        let apartment = { 
          id: 'ljb9kf3d5a65f17ljf2i0kc*',
          floor: "3",
          number: "9",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.put('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(400)

            expect(response.body.RestException.Code).toBe("2")
            expect(response.body.RestException.Message).toBe("O parâmetro ID possui caracteres inválidos")
            expect(response.body.RestException.Status).toBe("400")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/2`)
          })
          .catch(function(error) {
            fail(error)
          })
      })

      test("/PUT - Deve retornar 404, uma vez que o ID informado não pertence a um apartamento.", function() {
        let apartment = { 
          id: 'ljb9kf3d5a65f17ljf2i0kc7',
          floor: "3",
          number: "9",
          rooms: [
            {
              room: 'sala de estar',
              quantity: '1'
            },
            {
              room: 'cozinha',
              quantity: '1'
            },
            {
              room: 'banheiro',
              quantity: '1'
            },
            {
              room: 'quarto',
              quantity: '1'
            }
          ],
          daily_price: '200'
        }
        return request.put('/apartments').send(apartment)
          .then(function(response) {
            expect(response.statusCode).toEqual(404)

            expect(response.body.RestException.Code).toBe("3")
            expect(response.body.RestException.Message).toBe("Nenhum apartamento com o ID informado está cadastrado")
            expect(response.body.RestException.Status).toBe("404")
            expect(response.body.RestException.MoreInfo).toBe(`${ projectLinks.erros }/3`)
          })
          .catch(function(error) {
            fail(error)
          })
      })
    })
  })
  describe("DELETE", function() {
    describe("Testes de SUCESSO.", function() {})
    describe("Testes de FALHA.", function() {})
  })
})