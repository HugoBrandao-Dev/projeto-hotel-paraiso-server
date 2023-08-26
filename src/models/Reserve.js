let ApartmentCollection = require('../data/ApartmentCollection.json')
let DateFormated = require('../tools/DateFormated')

const date = new DateFormated('mongodb')

class Reserve {
  async findOne(id) {
    try {
      let apartment = ApartmentCollection.apartments.data.find(apto => apto.id == id)
      let reserve = apartment.reserve
      return reserve
    } catch (error) {
      console.log(error)
      return []
    }
  }

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