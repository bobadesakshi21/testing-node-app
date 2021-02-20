/* eslint-disable no-unused-vars */
const express = require('express')
const { body } = require('express-validator')
const isAuth = require('../middleware/is-auth')


const User = require('../models/user')
const authController = require('../controllers/auth')

const router = express.Router()

router.put('/signup', [
  body('email')
    .isEmail()
    .withMessage('Please Enter a valid email')
    .custom((value, { req }) => {
      return User.findOne({ email: value })
        .then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email Address already exists!')
          }
        })
    })
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 4 }),
  body('name')
    .trim()
    .not().isEmpty()
], authController.signup)

router.post('/login', authController.login)

router.get('/status', isAuth, authController.getUserStatus)

router.patch('/status',
  isAuth,
  [
    body('status')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.updateUserStatus)

module.exports = router
