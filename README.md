# Zeplin Webhook Parser

Zeplin webhook request parser middleware for express.js

### Installation

This repository is a [Node.js](https://nodejs.org/en/) package which avaiable through [NPM Registry](https://www.npmjs.com/).
Installation can be done by using `npm install` command:

```
npm install zeplin-webhook-parser
```

### Usage

Default export for this package is `Zeplin` class, which you can instantiate with secret that is registered via [Zeplin](https://docs.zeplin.dev/docs/setting-up-webhooks).

```javascript
const Zeplin = require('zeplin');
const zeplin = new Zeplin('YourZeplinSecret', {
  expirationTime: 60000
});

/*
 * You can use it as express router callback.
 * It will validate the incoming request and check for the secret and expiration time that you've already set.
 */
const express = require('express');
const app = express();
app.use(express.json()); // It is important to activate this middleware since Zeplin Webhook Request Content-Type is application/json

app.post('/zeplin-webhooks', zeplin.verify, (req, res) => {
  console.log('Webhook Event Name:', req.body.event); // i.e: project.screen.version
  // Do whatever you want!
  res.status(204).end() // It is recommended to set status code into 204 since Zeplin won't be able to do anything with your response body payload anyway.
});
```

### API

The only important method in this package is `Zeplin.prototype.verify` method.

##### `Zeplin.prototype.verify`

What does this method do? It basically checks incoming webhook request signature and its timestamp, determine if the request is valid or not.
As documented on [Zeplin](https://docs.zeplin.dev/docs/securing-webhook-requests), we need to check the `zeplin-signature` and `zeplin-delivery-timestamp` if we want to make our webhook endpoint secure.

Here's the sneak peak of what the implementation look like:

```javascript
Zeplin.prototype.verify = (req, res, next) => {
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
```

Examine the code yourself :)

### Webhook Event Reference

You can checkout Zeplin Documentation to see list of webhook event that can be used, with each payload:

https://docs.zeplin.dev/reference#webhook-events-overview

### License

[MIT](https://en.wikipedia.org/wiki/MIT_License)
