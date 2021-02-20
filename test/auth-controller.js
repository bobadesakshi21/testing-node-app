/* eslint-disable no-undef */
const expect = require('chai').expect
const sinon = require('sinon')

const User = require('../models/user')
const AuthController = require('../controllers/auth')

describe('Auth Controller - Login', function () {
  it('Should throw an error with code 500 if accessing the database fails', function (done) {
    sinon.stub(User, 'findOne')
    User.findOne.throws()

    const req = {
      body: {
        email: 'test@test.com',
        password: 'test123'
      }
    }

    // AuthController.login(req, {}, () => { }).then(result => {
    //   expect(result).to.be.an('error')
    //   expect(result).to.have.property('statusCode', 500)
    //   done()
    // }).catch(done)

    AuthController.login(req, {}, () => { }).then(result => {
      expect(result).to.be.an('error')
      expect(result).to.have.property('statusCode', 500)
    }).then(done, done)

    User.findOne.restore()
  })
})