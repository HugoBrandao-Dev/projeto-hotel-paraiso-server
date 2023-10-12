const multer = require('multer')
const path = require('path')

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
    callback(null, 'src/tmp/uploads')
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    callback(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage, fileFilter }).array('iptImages')

function multerFiles(req, res, next) {
  upload(req, res, function(error) {
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
  })
}

module.exports = multerFiles