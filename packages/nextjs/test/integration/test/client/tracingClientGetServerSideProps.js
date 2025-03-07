const {
  expectRequestCount,
  isTransactionRequest,
  expectTransaction,
  extractEnvelopeFromRequest,
} = require('../utils/client');
const assert = require('assert').strict;

module.exports = async ({ page, url, requests }) => {
  const requestPromise = page.waitForRequest(isTransactionRequest);
  await page.goto(`${url}/1337/withServerSideProps`);
  await requestPromise;

  const transactionEnvelope = extractEnvelopeFromRequest(requests.transactions[0]);

  expectTransaction(requests.transactions[0], {
    contexts: {
      trace: {
        op: 'pageload',
      },
    },
  });

  const nextDataTag = await page.waitForSelector('#__NEXT_DATA__');
  const nextDataTagValue = JSON.parse(await nextDataTag.evaluate(tag => tag.innerText));

  assert.strictEqual(
    nextDataTagValue.props.pageProps.data,
    '[some getServerSideProps data]',
    'Returned data must contain original data returned from getServerSideProps.',
  );

  assert.ok(nextDataTagValue.props.pageProps._sentryTraceData, '_sentryTraceData must exist in __NEXT_DATA__ tag');
  assert.ok(nextDataTagValue.props.pageProps._sentryBaggage, '_sentryBaggage must exist in __NEXT_DATA__ tag');

  assert.strictEqual(
    nextDataTagValue.props.pageProps._sentryTraceData.split('-')[0],
    transactionEnvelope.envelopeHeader.trace.trace_id,
    'Trace id in envelope header must be the same as in trace parent data returned from getServerSideProps',
  );

  assert.strictEqual(
    nextDataTagValue.props.pageProps._sentryBaggage.match(/sentry-trace_id=([a-f0-9]*),/)[1],
    transactionEnvelope.envelopeHeader.trace.trace_id,
    'Trace id in envelope header must be the same as in baggage returned from getServerSideProps',
  );

  await expectRequestCount(requests, { transactions: 1 });
};
