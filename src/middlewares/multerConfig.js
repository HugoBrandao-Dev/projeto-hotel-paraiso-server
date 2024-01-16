const multer = require('multer')
const Generator = require('../tools/Generator')

const path = require('path')
const fileSystem = require('fs')

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

function fileFilter (req, file, callback) {

  // Só é possível aceitar arquivos que tenham extensão JPG.
  let validExtensions = ['.jpg']

  let fileExtension = path.extname(file.originalname)
  if (!validExtensions.includes(fileExtension)) {
    callback(null, false)

    // Necessário para que seja capturado no multerFiles.
    callback(new Error())
  } else {
    callback(null, true)
  }

}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (!req.body.apartment) {
      callback(new Error('format'))
    } else {

      let src = path.resolve(__dirname, `../tmp/uploads/pictures`)

      // Cria uma pasta com o nome do número do apto, para armazenar as imagens.
      fileSystem.mkdir(src, { recursive: true }, (error, response) => {

        if (error) {
          console.log(error)
        } else {
          callback(null, src)
        }

      })
    }
  },
  filename: function (req, file, callback) {
    let extension = path.extname(file.originalname)
    let name = path.basename(file.originalname, extension)
    let prefix = Generator.genID()
    let result = `${ prefix }&${ name }${ extension }`
    callback(null, result)
  }
})

const upload = multer({ storage, fileFilter }).array('iptImages')

function multerFiles(req, res, next) {

  // O async/await é necessário para evitar erros READ e WRITE de arquivos.
  upload(req, res, async function(error) {
    try {
      if (error) {
        let result = { field: '', hasError: { value: true, type: 2, error: '' }}

        if (error.message == 'format') {
          result.hasError.error = 'A estrutura enviada é inválida'
        } else {
          result.field = 'iptImages'
          result.hasError.error = 'A extensão das imagens é inválida'
        }

        let RestException = Generator.genRestException([result], !!result.field)
        res.status(400)
        res.json({ RestException })
        return
      }
      next()
    } catch (error) {
      console.log(error)
    }
  })
}

module.exports = multerFiles