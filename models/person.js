const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

const url = process.env.MONGODB_URI
console.log('connecting to url', url)

mongoose.connect(url, {useNewUrlParser: true})
  .then(() => {
    console.log('successfully connected to MongoDB')
  })
  .catch(error => {
    console.log('error when connecting to MongoDB: ', error)
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)