const REGION = process.env.REGION
const BUCKET = process.env.BUCKET
const KEY = process.env.KEY

module.exports = {
  invalid: {
    key: 'abcd1234'
  },
  valid: {
    bucket: BUCKET,
    region: REGION,
    key: KEY
  }
}
