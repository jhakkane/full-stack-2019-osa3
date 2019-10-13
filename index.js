const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors())
morgan.token('bodytext', parseBodyText)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodytext'))
app.use(express.static('build'))

function parseBodyText(req, res) {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
}

let persons = [
  {
    name: 'Billy Cimmerian',
    number: '345345',
    id: 1
  },
  {
    name: 'Speedy Pasanen',
    number: '345345',
    id: 2
  }
]

app.get('/info', (req, res) => {
  let text = `Phonebook has info for ${persons.length} persons.`
  let html = '<p>' + text + '<br/><br/>' + new Date() + '</p>'
  res.send(html)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.post('/api/persons', (req, res) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'person data is missing' 
    })
  }
  let personExists = persons.find(person => person.name === body.name)
  if (personExists) {
    return res.status(409).json({ 
      error: 'person is already on the list'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }
  persons = persons.concat(person)
  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  let person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end() 
  }
})

function generateId() {
  return Math.floor(Math.random()*100000)
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})