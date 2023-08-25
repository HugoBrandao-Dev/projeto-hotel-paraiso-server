let ApartmentCollection = require('../data/ApartmentCollection.json')
let DateFormated = require('../tools/DateFormated')

const date = new DateFormated('mongodb')

class Reserve {
  async edit(reserve) {
    try {
      let apartmentIndex = await ApartmentCollection.apartments.data.findIndex(apto => apto.id == reserve.apartment_id)
      let infos = Object.keys(reserve)
      for (let info of infos) {
        if (info != 'apartment_id') {
          ApartmentCollection.apartments.data[apartmentIndex]["reserve"][info] = reserve[info]
        }
      }
      ApartmentCollection.apartments.data[apartmentIndex]["reserve"].date = date.getDateTime()
      return
    } catch (error) {
      console.log(error)
      return []
    }
  }
}

module.exports = new Reserve()