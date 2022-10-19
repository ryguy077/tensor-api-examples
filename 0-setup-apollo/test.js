const {  HttpLink, ApolloClient, InMemoryCache, ApolloProvider, gql } = require('@apollo/client');
const { ApolloLink, concat } = require("apollo-link");
const fetch = require('cross-fetch');

const API_KEY = '<YOUR API KEY HERE>';


// Setup Apollo client.
const authLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      'X-TENSOR-API-KEY': API_KEY,
    },
  });
  return forward(operation);
});
const httpLink = new HttpLink({ uri: 'https://api.tensor.so/graphql', fetch });
const client = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    }
  },
});

// Run query.
(async () => {
	const resp = await client
	  .query({
	    query: gql`
				query TswapBuyNftTx($buyer: String!, $maxPriceLamports: Decimal!, $mint: String!, $pool: String!) {
				  tswapBuyNftTx(buyer: $buyer, maxPriceLamports: $maxPriceLamports, mint: $mint, pool: $pool) {
				    txs {
				      lastValidBlockHeight
				      tx
				    }
				  }
				}
	    `,
			variables: {
			  "buyer": "ACZtzuJpk9LXAN6x9rYPpBDZnLXSf5svK6vN56vhjmcM",
			  "maxPriceLamports": "2900000000",
			  "mint": "DqbDQvm9Va1RmnsnUPHxpU87oBLHMMKvFqC3DhZUdHDN",
			  "pool": "5yEpsbcaN4LmCF1qJ3Dn1L2GmS3fCHMLhfsQvacCy76U"
			},
	  });

	const results = resp.data.tswapBuyNftTx;
  console.log(results);
  // {
  //   txs: [
  //     {
  //       lastValidBlockHeight: 141160615,
  //       tx: [0, 0, 0, ...],
  //       __typename: 'OnchainTx'
  //     }
  //   ],
  //   __typename: 'TxResponse'
  // }
})();
