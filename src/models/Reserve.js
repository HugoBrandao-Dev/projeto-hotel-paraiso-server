let ApartmentCollection = require('../data/ApartmentCollection.json')
let DateFormated = require('../tools/DateFormated')

const date = new DateFormated('mongodb')

class Reserve {
  async save(reserve) {
    try {
      let apartmentIndex = await ApartmentCollection.apartments.data.findIndex(apto => apto.id == reserve.apartment_id)

      for (let info of Object.keys(reserve)) {
        ApartmentCollection.apartments.data[apartmentIndex].reserve[info] = reserve[info]
      }

      ApartmentCollection.apartments.data[apartmentIndex].reserve.reservedIn = date.getDateTime()

      return
    } catch (error) {
      console.log(error)
      return []
    }
  }

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

  async findMany(status = '', skip = 0, limit = 20) {
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

      if ((skip || skip == 0) && limit) {
        return await reserves.slice(skip, (skip + limit))
      }

      return reserves

    } catch (error) {
      console.log(error)
      return []
    }
  }

  async edit(reserve) {
    try {

      // Encontra o index do apartamento que tenha o ID igual ao passado dentro do reserve.
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

  async delete(id) {
    try {

      // Encontra o index do apartamento que tenha o ID igual ao passado para o método.
      let apartmentIndex = await ApartmentCollection.apartments.data.findIndex(apto => apto.id == id)

      ApartmentCollection.apartments.data[apartmentIndex].reserve = {
        "status": "livre",
        "user_id": "",
        "date": "",
        "start": "",
        "end": ""
      }
    } catch (error) {
      console.log(error)
      return
    }
  }
}

module.exports = new Reserve()