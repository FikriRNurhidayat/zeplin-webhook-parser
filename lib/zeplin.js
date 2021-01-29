const crypto = require('crypto');

/*
 * Create new Zeplin instance, a.k.a one webhook that you define on Zeplin.
 * More: https://docs.zeplin.dev/docs/getting-started-with-webhooks 
 */
class Zeplin {
  /**
   * Represents a Zeplin Instance.
   * @constructor
   * @param {String} secretKey - Zeplin Secret.
   * @param {Object} [options] - Option to apply when verifying webhook request. 
   * @param {Number} [options.expirationTime=null] - Expiration time of a request in miliseconds
   */
  constructor(secretKey, options = {
    expirationTime: null
  }) {
    this.secretKey = secretKey;
    this.options = options; 
  };

  /*
   * Compare key with the instance secret key
   * @param {String} key - The signature key 
   * @param {Function} fn - Function that return hash. 
   * @returns {Boolean} - State of the key being passed 
   */
  verifySignature = (key, fn) => crypto.timingSafeEqual(Buffer.from(fn(this.secretKey)), Buffer.from(key));

  /*
   * Check if the request is expired 
   * based on delivery timestamp
   * @param {Number} timestamp - Milisecond from epoch 
   * @returns {Boolean} - Expires or not.
   */
  isExpired = (timestamp) => {
    if (!this.expirationTime) return false;
    return ((timestamp + this.expirationTime) > Date.now());
  };

  /*
   * Middleware that take HTTP request and give response
   * according to the webhook.
   * @param {Object} req - Request object 
   * @param {Object} res - Response object 
   * @param {Function} next - Function to pass to the next middleware 
   */
  verify = (req, res, next) => {
    try {
      const timestamp = req.headers['zeplin-delivery-timestamp'];
      if (this.isExpired(timestamp)) throw new Error('Request is expired!');
      if (
        this.verifySignature(req.headers['zeplin-signature'], (secret) =>
          crypto
            .createHmac("sha256", secret)
            .update(`${timestamp}.${JSON.stringify(req.body)}`)
            .digest('hex')
        )
      ) return next();
      throw new Error('Request is not authorized!');
    }

    catch(err) {
      res.status(401).json({
        message: err.message
      });
    }
  }
}

module.exports = Zeplin;
