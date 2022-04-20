import * as Joi from 'joi'
import { pick } from 'lodash'
import Request from 'request-promise'
const DEFAULT_PICK_FIELDS = [
  'bucket',
  'region',
  'key'
]
const DEFAULT_SCHEMA = {
  bucket: Joi.string()
    .required()
    .description('the bucket to get url'),

  region: Joi.string()
    .required()
    .description('the region to get url'),

  key: Joi.string()
    .required()
    .description('the key to get url')
}

const defineUri = (params) => {
  return `
    https://s3-${params.region}.amazonaws.com/${params.bucket}/${params.key}
  `.trim()
}

export default function S3UrlExists (options) {
  const params = pick(options, DEFAULT_PICK_FIELDS)
  const isValid = Joi.validate(params, DEFAULT_SCHEMA)

  if (isValid.error) {
    return Promise.reject({ status: false, message: isValid.error })
  }

  return new Promise((resolve, reject) => {
    const uri = defineUri(params)
    return Request({
      method: 'GET',
      uri,
      resolveWithFullResponse: true
    }).then((response) => {
      resolve({ status: response.statusCode === 200, url: uri })
    })
    .catch(err => reject({ status: false, message: err }))
  })
}
