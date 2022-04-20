'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = S3UrlExists;

var _joi = require('joi');

var Joi = _interopRequireWildcard(_joi);

var _lodash = require('lodash');

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var DEFAULT_PICK_FIELDS = ['bucket', 'region', 'key'];
var DEFAULT_SCHEMA = {
  bucket: Joi.string().required().description('the bucket to get url'),

  region: Joi.string().required().description('the region to get url'),

  key: Joi.string().required().description('the key to get url')
};

var defineUri = function defineUri(params) {
  return ('\n    https://s3-' + params.region + '.amazonaws.com/' + params.bucket + '/' + params.key + '\n  ').trim();
};

function S3UrlExists(options) {
  var params = (0, _lodash.pick)(options, DEFAULT_PICK_FIELDS);
  var isValid = Joi.validate(params, DEFAULT_SCHEMA);

  if (isValid.error) {
    return Promise.reject({ status: false, message: isValid.error });
  }

  return new Promise(function (resolve, reject) {
    var uri = defineUri(params);
    return (0, _requestPromise2.default)({
      method: 'GET',
      uri: uri,
      resolveWithFullResponse: true
    }).then(function (response) {
      resolve({ status: response.statusCode === 200, url: uri });
    }).catch(function (err) {
      return reject({ status: false, message: err });
    });
  });
}
