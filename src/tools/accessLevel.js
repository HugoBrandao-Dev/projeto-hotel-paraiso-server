const Analyzer = require('../tools/Analyzer')
const User = require('../models/User')

// Verifica se a conta tem permissão de realizar uma determinada ação.
async function isActionAllowed(decodedToken, method, params, body) {
  try {
    const upperMethod = method.toUpperCase()
    let allowed = false

    switch (decodedToken.role) {
      case '0':
        switch (upperMethod) {
          case 'POST':
            break
          case 'GET':

            // Verifica se o ID passado no parâmetro é o mesmo do armazenado no Token.
            if (params.id && params.id === decodedToken.id) {
              allowed = true
            }
            break
          case 'PUT':

            // Verifica se o ID passado no corpo é o mesmo do armazenado no Token.
            if (body.id === decodedToken.id) {

              // Verifica se o Cliente está tentando alterar sua função.
              if (!(body.role >= 0)) {
                allowed = true
              }
            }
            break
          case 'DELETE':

            // Verifica se o ID passado no parâmetro é o mesmo do armazenado no Token.
            if (params.id && decodedToken.id === params.id) {
              allowed = true
            }
            break
        }
        break
      case '1':
        switch (upperMethod) {
          case 'POST':

            // Verifica se o Funcionário está tentando informar uma Função.
            if (!(body.role >= 0)) {
              allowed = true
            }
            break
          case 'GET':
            allowed = true
            break
          case 'PUT':

            // Verifica se o Funcionário está tentando alterar a função.
            if (!(body.role > 0)) {
              allowed = true
            }
            break
          case 'DELETE':

            // Analisa o ID do parâmetro.
            let idResult = await Analyzer.analyzeID(params.id)

            // Verifica se o ID passado no parâmetro tem algum erro.
            if (!idResult.hasError.value) {

              // Busca pelo usuário que será deletado.
              let userToBeDeleted = await User.findOne(params.id)

              // Verifica se a conta a ser deletada é do tipo Cliente (0).
              if (userToBeDeleted.role < 1) {
                allowed = true
              }
            }
            break
        }
        break
      case '2':
        switch (upperMethod) {
          case 'POST':
            // Verifica se o Gerente está tentando passar um valor de Função maior que o dele (2).
            if (!(body.role >= 2)) {
              allowed = true
            }
            break
          case 'GET':
            break
          case 'PUT':

            // Verifica se o Gerente está tentando passar um valor de Função maior que o dele (2).
            if (!(body.role >= 2)) {
              allowed = true
            }
            break
          case 'DELETE':
            break
        }
        break
      case '4':
        allowed = true
        break
    }

    return allowed
  } catch (error) {
    console.log(error)
  }
}

module.exports = isActionAllowed