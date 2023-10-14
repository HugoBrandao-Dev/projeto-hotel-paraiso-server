const multer = require('multer')
const Generator = require('../tools/Generator')

const path = require('path')
const fileSystem = require('fs')

const projectLinks = {
  errors: 'https://projetohotelparaiso.dev/docs/erros'
}

// Só é possível aceitar arquivos que sejam do tipo JPEG
function fileFilter (req, file, callback) {
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
    let apartment = JSON.parse(req.body.apartment)

    let src = path.resolve(__dirname, `../tmp/uploads/apartments/${ apartment.number }`)

    fileSystem.mkdir(src, { recursive: true }, (error, response) => {

      if (error) {
        console.log(error)
      } else {
        callback(null, src)
      }

    })
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
  upload(req, res, async function(error) {
    try {
      if (error) {
        let RestException = {}
        RestException.Code = '2'
        RestException.Message = 'A extensão das imagens é inválida'
        RestException.Status = '400'
        RestException.MoreInfo = `${ projectLinks.errors }/2`
        RestException.ErrorFields = [{
          field: 'iptImages',
          hasError: {
            error: "A extensão das imagens é inválida"
          }
        }]
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