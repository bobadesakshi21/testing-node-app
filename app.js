/* eslint-disable no-unused-vars */
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')


const MONGODB_URI = 'mongodb+srv://Sakshi:sakshi123@cluster0.vpzlm.mongodb.net/messages?retryWrites=true&w=majority'

const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')

const app = express()

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + ' - ' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (
    file.mimeType === 'image/jpeg' ||
    file.mimeType === 'image/jpg' ||
    file.mimeType === 'image/png'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

// app.use(bodyParser.urlencoded({})) // x-www-form-urlencoded
app.use(bodyParser.json()) //application/json
app.use(multer({ storage: fileStorage, filter: fileFilter }).single('image'))

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)


app.use((error, req, res, next) => {
  console.log(error)
  const statusCode = error.statusCode || 500
  const message = error.message
  const data = error.data
  res.status(statusCode).json({
    message: message,
    data: data
  })
})

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(8080)
  })
  .catch(err => {
    console.log('CONNECTION ERR', err)
  })
