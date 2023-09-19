class EndPoints {

  constructor(_substantive = { singular: '', plural: '' }, _withParams = false) {
    this.substantive = _substantive
    this.withParams = _withParams
  }

  get toCreate() {
    return `/${ this.substantive.singular }`
  }

  get toRead() {
    if (this.withParams) {
      return `/${ this.substantive.singular }/:id`
    }
    return `/${ this.substantive.singular }`
  }

  get toList() {
    return `/${ this.substantive.plural }`
  }

  get toSearch() {
    return `/${ this.substantive.plural }/search`
  }

  get toUpdate() {
    return `/${ this.substantive.singular }`
  }

  get toDelete() {
    if (this.withParams) {
      return `/${ this.substantive.singular }/:id`
    }
    return `/${ this.substantive.singular }`
  }

  get toLogin() {
    return '/login'
  }
}

module.exports = EndPoints