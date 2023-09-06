class Generator {
  static async genID() {
    try {
      return await [...Array(24)].map(() => Math.floor(Math.random() * 24).toString(24)).join('')
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = Generator