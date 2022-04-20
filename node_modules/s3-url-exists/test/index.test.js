import { script } from 'lab'
import { expect } from 'code'
import S3UrlExists from '../index'

const Mock = require('./mocks')
const lab = exports.lab = script()
const describe = lab.describe
const it = lab.it

describe('S3 Url Exists Package Test', () => {
  it('Expect get validate error ',
    () => {
      return new Promise((resolve, reject) => {
        try {
          S3UrlExists(Mock.invalid)
            .catch((err) => {
              expect(err).not.be.equal(null)
              expect(typeof err.message).to.be.equal('object')
              expect(err.message.name).to.be.equal('ValidationError')
              resolve(null)
            })
        } catch (err) {
          reject(err)
        }
      })
    }
  )

  it('Expect get public url',
    () => {
      return new Promise((resolve, reject) => {
        try {
          S3UrlExists(Mock.valid)
            .then((result) => {
              expect(typeof result).to.be.equal('object')
              expect(result.status).to.be.equal(true)
              resolve(null)
            })
            .catch(reject)
        } catch (err) {
          reject(err)
        }
      })
    }
  )
})
