class DateFormated {
  constructor(database, number = null) {
    this.number = number || Date.now()
    this.dateTime = new Date(Number.parseInt(this.number))
    // this.dateTimeForDatabase = this.dateTime.toISOString()
    this.database = database
  }
  getDate() {
    let year = this.dateTime.getFullYear()

    let month = this.dateTime.getMonth()

    // Trata o valor de mês, caso ele seja menor que 10.
    if (month < 10) {
      month = `0${ month + 1 }`
    }

    let day = this.dateTime.getDate()

    // Trata o valor de dia, caso ele seja menor que 10.
    if (day < 10) {
      day = `0${ day }`
    }
    return `${ year }-${ month }-${ day }`
  }
  getTime() {
    let hours = this.dateTime.getHours()
    let minutes = this.dateTime.getMinutes()
    let seconds = this.dateTime.getSeconds()
    let milliseconds = this.dateTime.getMilliseconds()
    let msg = ''

    if (hours < 10) {
      hours = `0${ hours }`
    }
    if (minutes < 10) {
      minutes = `0${ minutes }`
    }
    if (seconds < 10) {
      seconds = `0${ seconds }`
    }

    msg = `${ hours }:${ minutes }:${ seconds }`

    if (this.database === 'mongodb') {
      while (milliseconds.toString().length < 3) {
        milliseconds = `0${ milliseconds }`
      }
      msg = msg.concat(`.${ milliseconds }`)
    }

    return msg
  }
  getDateTime() {
    switch (this.database) {
      case 'mongodb':
        return this.dateTime.toISOString()
      default:
        return `${ this.getDate() } ${ this.getTime() }`
    }
  }
  getDateTimeToDisplay(withTime = false, lang = '') {
    let msg = ''
    
    let dateArray = this.getDate().split('-')
    let year = dateArray[0]
    let month = dateArray[1]
    let day = dateArray[2]

    switch (lang) {
      case 'pt-br':
        msg = `${ day }/${ month }/${ year }`
        break
      default:
        msg = `${ year }/${ month }/${ day }`
    }
    if (withTime) {
      let timeArray = this.getTime().split(':')
      let hours = timeArray[0]
      let minutes = timeArray[1]
      msg += ` ${ hours }:${ minutes }`
    }
    return msg
  }
}

module.exports = DateFormated