/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const expect = require('chai').expect
const jwt = require('jsonwebtoken')
const sinon = require('sinon')

const authmiddleware = require('../middleware/is-auth')

describe('Auth Middleware', () => {
  it('should throw an error when no authorization header is present', () => {
    const req = {
      get: function (headerName) {
        return null
      }
    }
    // const err = new Error('No authorization header')
    expect(authmiddleware.bind(this, req, {}, () => { })).to.throw('Not Authenticated')
  })

  it('Should throw an error if authorization header is only one string', function () {
    const req = {
      get: function (headerName) {
        return 'xyz'
      }
    }
    expect(authmiddleware.bind(this, req, {}, () => { })).to.throw()
  })

  it('Should throw an error if token is invalid', function () {
    const req = {
      get: function (headerName) {
        return 'Bearer xyz'
      }
    }
    expect(authmiddleware.bind(this, req, {}, () => { })).to.throw()
  })

  it('Should yeild a userId after decoding a token', function () {
    const req = {
      get: function (headerName) {
        return 'Bearer xyz'
      }
    }
    // jwt.verify = function () {
    //   return { userId: 'abc' }
    // }
    sinon.stub(jwt, 'verify')
    jwt.verify.returns({ userId: 'abc' })
    authmiddleware(req, {}, () => { })
    expect(req).to.have.property('userId')
    expect(jwt.verify.called).to.be.true
    jwt.verify.restore()
  })

})


