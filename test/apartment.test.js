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