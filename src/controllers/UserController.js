class UserController {
  isValidName(name) {
    let itsValidPT_BR = validator.isAlpha(name, ['pt-BR'], {
      ignore: ' \''
    })
    let itsValidEN_US = validator.isAlpha(name, ['en-US'], {
      ignore: ' \''
    })

    return itsValidPT_BR || itsValidEN_US
  }
  isValidEmail(email) {
    return validator.isEmail(email)
  }
  isValidPassword(password) {
    return validator.isStrongPassword(password)
  }
  isValidCountry(country) {
    return validator.isISO31661Alpha2(country)
  }

  async create(req, res) {
    try {
      let errorFields = []

      /* ##### CAMPOS OBRIGATÓRIOS ##### */

      if (req.body.name) {
        let name = req.body.name
        if (!this.isValidName(name)) {
          errorFields.push({
            field: 'iptName',
            error: 'O nome informado é inválido.'
          })
        }
      } else {
        errorFields.push({
          field: 'iptName',
          error: 'Este campo é obrigatório.'
        })
      }

      if (req.body.email) {
        let email = req.body.email
        if (!this.isValidEmail(email)) {
          errorFields.push({
            field: 'iptEmail',
            error: 'O email informado é inválido.'
          })
        }
      } else {
        errorFields.push({
          field: 'iptEmail',
          error: 'Este campo é obrigatório.'
        })
      }

      if (req.body.password) {
        let password = req.body.password
        if (!this.isValidPassword(password)) {
          errorFields.push({
            field: 'iptPassword',
            error: 'A senha informada é inválida.'
          })
        }
      } else {
        errorFields.push({
          field: 'iptPassword',
          error: 'Informe uma senha.'
        })
      }

      if (req.body.country) {
        let country = req.body.country
        if (!this.isValidCountry(country)) {
          errorFields.push({
            field: 'iptCountry',
            error: 'País inválido.'
          })
        }
      } else {
        errorFields.push({
          field: 'iptCountry',
          error: 'Informe o seu país de nascimento.'
        })
      }
    } catch (error) {
      res.status(500)
      throw new Error(error)
    }
  }
}

module.exports = new UserController()