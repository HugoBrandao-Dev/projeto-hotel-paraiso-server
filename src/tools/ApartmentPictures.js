const fileSystem = require('fs')
const path = require('path')

const tmp = path.resolve(__dirname, `../../src/tmp/uploads/pictures`)
const apartments = path.resolve(__dirname, `../../src/data/apartments`)

class ApartmentPictures {

  static readPicturesFromApartment(_apartmentNumber) {
    try {
      let src = path.resolve(`${ apartments }/${ _apartmentNumber }`)

      // Verifica se a pasta do apto existe.
      // OBS: Os métodos accessSync() e statSync() NÃO ACEITAM OPERADORES TERNÁRIOS.
      let hasFolder = fileSystem.existsSync(src) ? true : false

      let pictures = []

      if (hasFolder) {
        let pictureNames = fileSystem.readdirSync(src)

        for (let file of pictureNames) {
          let fileSrc = path.resolve(`${ apartments }/${ _apartmentNumber }/${ file }`)
          pictures.push(fileSrc)
        }

      }

      return pictures
    } catch (error) {
      console.error(error)
    }
  }

  static movePicturesFromTempToApartmentFolder(_pictures, _apartmentNumber) {
    try {
      let folderDest = path.resolve(`${ apartments }/${ _apartmentNumber }`)
      let hasFolder = fileSystem.existsSync(folderDest) ? true : false
      if (!hasFolder)
        fileSystem.mkdirSync(folderDest, { recursive: true })

      for (let pic of _pictures) {
        let fileOrigin = path.resolve(`${ tmp }/${ pic }`)
        let fileDest = path.resolve(`${ apartments }/${ _apartmentNumber }/${ pic }`)
        fileSystem.copyFileSync(fileOrigin, fileDest)
        fileSystem.unlinkSync(fileOrigin)
      }
    } catch (error) {
      console.error(error)
    }
  }

  static changeApartmentNumber(_old, _new) {
    try {
      let oldSrc = path.resolve(`${ apartments }/${ _old }`)
      let newSrc = path.resolve(`${ apartments }/${ _new }`)
      fileSystem.renameSync(oldSrc, newSrc)
    } catch (error) {
      console.error(error)
    }
  }

  static deletePicturesFromTemp(_pictures) {
    try {
      for (let pic of _pictures) {
        let src = path.resolve(`${ tmp }/${ pic }`)
        let fileExists = fileSystem.existsSync(src)
        if (fileExists)
          fileSystem.unlinkSync(src)
      }
    } catch (error) {
      console.error(error)
    }
  }

  static deletePicturesFromApartment(_apartmentNumber, _pictures) {
    try {
      for (let pic of _pictures) {
        let src = path.resolve(`${ apartments }/${ _apartmentNumber }/${ pic }.jpg`)
        fileSystem.unlinkSync(src)
      }
    } catch (error) {
      console.error(error)
    }
  }

  static deleteApartmentFolder(_apartmentNumber) {
    try {
      // Faz a deleção da pasta de imagens do apto.
      let src = path.resolve(__dirname, `../../src/data/apartments/${ _apartmentNumber }`)
      let hasFolder = fileSystem.existsSync(src) ? true : false
      if (hasFolder)
        fileSystem.rmdirSync(src, { recursive: true, retryDelay: 1000 })
    } catch (error) {
      console.error(error)
    }
  }

}

module.exports = ApartmentPictures