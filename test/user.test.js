const app = require('../src/app')
const supertest = require('supertest')

const request = supertest(app)

describe("Suite de testes das rotas User.", function() {
  test("Deve retornar 201, para caso de sucesso no cadastramento.", async function() {
    try {

      /* ######################### Requisições com todos os dados ######################### */
      // Requisição feita enviando todos os dados + CPF
      let response_withAllData = await request.post('/users').send({
        name: "Tobias de Oliveira",
        email: "tobias@gmail.com",
        password: "@tobias&456871#",
        birthDate: "1985-02-03",
        country: "BR",
        state: "SP",
        city: "São Paulo",
        cpf: "22222222222",
        passportNumber: "AA000261",
        phoneCode: "55",
        phoneNumber: "1120899427",
        cep: "01001000",
        neighborhood: "Sé",
        road: "Praça da Sé",
        number: "1000",
        information: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam aliquam justo est, sit amet ornare enim mattis et. Nam leo est, dignissim nec eros eget, pretium placerat lectus. Vivamus tristique dolor quis luctus rutrum. Aenean convallis metus dolor. Vivamus porttitor nisi erat, et fermentum lectus mattis cursus. Cras dui massa, lobortis eget diam sit amet, lacinia scelerisque arcu. Nulla eget lobortis magna, et aliquam mi. Nunc id leo porta, mattis lorem nec, sollicitudin sem. Praesent augue enim, molestie et mauris nec, porta tempus nisi. Aenean malesuada ipsum at tortor elementum accumsan."
      })
      expect(response_withAllData).toEqual(201)

      /*
      Integer nec nunc vel mauris congue feugiat vel sed nulla. Vivamus mi ligula, ultricies id nisi sed, blandit sagittis mi. Proin nisi risus, pharetra ut ipsum et, faucibus molestie risus. Vivamus dictum leo non blandit consequat. Nam volutpat eleifend scelerisque. Phasellus vel sollicitudin quam, at pretium erat. Nam finibus sapien ac rutrum molestie. Donec ac libero vel magna ultrices suscipit eu in felis. Morbi nec vestibulum neque, vel efficitur massa. Maecenas tellus purus, pulvinar nec condimentum semper, finibus vitae nisi.
      */

      /*
      In hac habitasse platea dictumst. Quisque pulvinar orci odio, ut fringilla leo rutrum lobortis. Sed ut sodales dolor. Quisque vel erat ipsum. Etiam egestas nisl euismod sem porttitor, ac condimentum enim vehicula. Duis a purus at sapien tempor gravida. Mauris mollis pretium viverra. Vivamus condimentum dui et mi faucibus, rutrum pulvinar felis maximus. Nulla quis lorem nibh. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque sit amet urna finibus, suscipit felis id, posuere risus. Nullam vestibulum malesuada nisl dictum tristique. Proin non arcu a turpis venenatis dapibus.
      */

      /*
      Morbi tincidunt nisl a leo pretium mattis. Morbi magna metus, pulvinar ut dolor vel, pellentesque dignissim nibh. Phasellus accumsan magna ut orci tempor fringilla. Morbi ac blandit risus. Aenean egestas magna eu ullamcorper auctor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam erat volutpat. Cras imperdiet augue vel egestas mollis. Nunc eleifend tellus ut urna cursus, sed dapibus ligula congue. Duis fringilla libero sed eleifend vestibulum. Etiam libero leo, suscipit ac aliquet eget, consectetur vitae risus. Suspendisse potenti. Nulla tempus sagittis turpis.
      */
    } catch (error) {
      fail(error)
    }
  })
})