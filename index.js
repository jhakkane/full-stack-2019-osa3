require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())
morgan.token('bodytext', parseBodyText)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodytext'))

function parseBodyText(req, res) {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
}

app.get('/info', (req, res, next) => {
  Person.find({})
    .then(people => {
      let text = `Phonebook has info for ${people.length} people.`
      let html = '<p>' + text + '<br/><br/>' + new Date() + '</p>'
      res.send(html)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(people => {
      res.json(people.map(person => person.toJSON()))
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'person data is missing' 
    })
  }

  Person.find({}).then(people => {
    let personExists = people.find(person => person.name === body.name)
    if (personExists) {
      return res.status(409).json({ 
        error: 'person is already on the list'
      })
    } else {
      const person = new Person({
        name: body.name,
        number: body.number
      })
    
      person.save().then(savedPerson => {
        res.json(savedPerson.toJSON())
      })
      .catch(error => next(error))
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(req.params.id, person, {new: true})
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint!'})
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log('ErrorHandler: ', error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return res.status(400).send({error: 'malformatted id'})
  }

  next(error);
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})