class Generator {
  static async genID() {
    try {
      return await [...Array(24)].map(() => Math.floor(Math.random() * 24).toString(24)).join('')
    } catch (error) {
      console.log(error)
    }
  }

  static genCPF() {
    let cpf = ''
      for (let v = 1; v <= 11; v++) {
        let num = Math.floor(Math.random() * 10)
        cpf += num
      }
    return cpf
  }
}

module.exports = Generator