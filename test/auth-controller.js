/* eslint-disable no-undef */
const expect = require('chai').expect
const sinon = require('sinon')
const mongoose = require('mongoose')

const User = require('../models/user')
const AuthController = require('../controllers/auth')

describe('Auth Controller - Login', function () {
  before(function (done) {
    mongoose.connect('mongodb+srv://Sakshi:sakshi123@cluster0.vpzlm.mongodb.net/test-messages?retryWrites=true&w=majority')
      .then(() => {
        const user = new User({
          email: 'test@test.com',
          password: 'test123',
          name: 'test',
          posts: [],
          _id: '5c0f66b979af55031b34728e'
        })
        return user.save()
      })
      .then(() => {
        done()
      })
  })

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

  it('Should send a response with a valid user status for an existing user', function (done) {
    const req = {
      userId: '5c0f66b979af55031b34728e'
    }
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code
        return this
      },
      json: function (data) {
        this.userStatus = data.status
      }
    }
    AuthController.getUserStatus(req, res, () => { })
      .then(() => {
        expect(res.statusCode).to.be.equal(200)
        expect(res.userStatus).to.be.equal('New User')
        done()
      })
  })

  after(function (done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect()
      })
      .then(() => {
        done()
      })
  })
})