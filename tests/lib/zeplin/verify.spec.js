const supertest = require('supertest'),
      faker = require('faker'),
      crypto = require('crypto'),
      server = require('../../fixtures/server'),
      payload = require('../../fixtures/payload'),
      Zeplin = require('../../../lib/zeplin'),
      request = supertest(server),
      secretKey = faker.random.hexaDecimal(),
      zeplin = new Zeplin(secretKey);

const createSignature = (secret, timestamp = Date.now(), payload = {}) =>
  crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${JSON.stringify(payload)}`)
    .digest('hex');

beforeAll(() => server.post('/zeplin-webhook', zeplin.verify, (_, res) => res.status(204).end()));

describe('Zeplin.prototype.verify', () => {
  it('works when zeplin-signature is valid', async (done) => {
    const requestBody = payload['project.screen.version'];
    const zeplinDeliveryTimestamp = Date.now();
    const zeplinSignature = createSignature(secretKey, zeplinDeliveryTimestamp, requestBody);
    const response = await request
      .post('/zeplin-webhook')
      .set('Content-Type', 'application/json')
      .set('Zeplin-Signature', zeplinSignature)
      .set('Zeplin-Delivery-Timestamp', zeplinDeliveryTimestamp)
      .send(requestBody);
    expect(response.statusCode).toBe(204);
    done();
  })

  it('bails "Request is not authorized" when zeplin-signature not valid', async (done) => {
    const requestBody = payload['project.screen.version'];
    const zeplinDeliveryTimestamp = Date.now();
    const zeplinSignature = createSignature(faker.random.hexaDecimal(), zeplinDeliveryTimestamp, requestBody);
    const response = await request
      .post('/zeplin-webhook')
      .set('Content-Type', 'application/json')
      .set('Zeplin-Signature', zeplinSignature)
      .set('Zeplin-Delivery-Timestamp', zeplinDeliveryTimestamp)
      .send(requestBody);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Request is not authorized!');
    done();
  })

  it('bails "Request is expired!" when zeplin-signature not valid', async (done) => {
    zeplin.expirationTime = 60000
    const requestBody = payload['project.screen.version'];
    const zeplinDeliveryTimestamp = Date.now() + 70000;
    const zeplinSignature = createSignature(faker.random.hexaDecimal(), zeplinDeliveryTimestamp, requestBody);
    const response = await request
      .post('/zeplin-webhook')
      .set('Content-Type', 'application/json')
      .set('Zeplin-Signature', zeplinSignature)
      .set('Zeplin-Delivery-Timestamp', zeplinDeliveryTimestamp)
      .send(requestBody);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Request is expired!');
    done();
  })
})
