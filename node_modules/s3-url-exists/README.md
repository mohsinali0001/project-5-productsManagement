# S3-URL-EXISTS

![npm](https://img.shields.io/badge/npm-v5.6.1-blue.svg) ![yarn](https://img.shields.io/badge/yarn-v1.3.2-blue.svg) ![node](https://img.shields.io/badge/node-v8.9.0-brightgreen.svg) ![babel](https://img.shields.io/badge/babel-v6.26.0-red.svg)

## About

S3 Url Exists is an abstraction package made to check if the key into the buckets is really exists and are public

## Example
```js
const S3UrlExists = require('s3-url-exists')
const options = {
  region: 'sa-east-1',
  bucket: 'bucket-name',
  key: 'file-name'
}

S3UrlExists(options)
  .then((result) => {
    /*
    * { status: true, url: 'https://s3-region.amazonaws.com/bucket-name/file-name' }
    */
  })
  .catch(err => {
    /*
    * Request Error
    */
  })
```
