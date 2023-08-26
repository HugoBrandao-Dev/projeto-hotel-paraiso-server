let ApartmentCollection = require('../data/ApartmentCollection.json')
let DateFormated = require('../tools/DateFormated')

const date = new DateFormated('mongodb')

class Reserve {
  async findOne(id) {
    try {
      let apartment = await ApartmentCollection.apartments.data.find(apto => apto.id == id)
      let reserve = apartment.reserve
      reserve.apartment_id = id
      return reserve
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async findMany(status = '') {
    try {
      let reserves = null
      if (status) {

        // Faz a buscas por reservas tenham um status igual ao informado.
        let reservesWithStatus = await ApartmentCollection.apartments.data.filter(apto => apto.reserve.status == status)

        reserves = await reservesWithStatus.map(apto => {
          return {
            apartment_id: apto.id,
            ...apto.reserve
          }
        })
      } else {
        reserves = await ApartmentCollection.apartments.data.map(apto => {
          return {
            apartment_id: apto.id,
            ...apto.reserve
          }
        })
      }

      return reserves
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