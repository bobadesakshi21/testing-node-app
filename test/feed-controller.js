/* eslint-disable no-undef */
const expect = require('chai').expect
const sinon = require('sinon')
const mongoose = require('mongoose')

const User = require('../models/user')
const FeedController = require('../controllers/feed')

describe('Feed Controller', function () {
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

  it('Should add post to the posts of the creator', function (done) {
    const req = {
      body: {
        title: 'Test Post.',
        content: 'Test Post Here!'
      },
      file: {
        path: 'abc'
      },
      userId: '5c0f66b979af55031b34728e'
    }

    const res = {
      status: function () {
        return this
      },
      json: function () { }
    }

    FeedController.createPost(req, res, () => { })
      .then(savedUser => {
        expect(savedUser).to.have.property('posts')
        expect(savedUser.posts).to.have.length(1)
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