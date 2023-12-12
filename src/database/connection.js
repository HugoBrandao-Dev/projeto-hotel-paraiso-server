let mongoose = require('mongoose')

async function connect() {

  try {

    await mongoose.connect('mongodb+srv://hugobrandaodev:6TViVMHszp4AfEya@cluster0.kmycn36.mongodb.net/?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

  } catch(err) {
    console.error(err)
  }

}

module.exports = { connect }