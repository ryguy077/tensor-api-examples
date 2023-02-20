const {
  HttpLink,
  ApolloClient,
  InMemoryCache,
  gql,
} = require("@apollo/client");
const { ApolloLink, concat } = require("apollo-link");
const fetch = require("cross-fetch");

const API_KEY = process.env.TENSOR_API_KEY ?? "";
if (!API_KEY) throw new Error("please specify envvar TENSOR_API_KEY");

// Setup Apollo client.
const authLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      "X-TENSOR-API-KEY": API_KEY,
    },
  });
  return forward(operation);
});
const httpLink = new HttpLink({ uri: "https://api.tensor.so/graphql", fetch });
const client = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
    },
  },
});

// Run query.
(async () => {
  const resp = await client.query({
    query: gql`
    query CollectionsStats(
      $slugs: [String!],
      $slugsMe: [String!],
      $slugsDisplay: [String!],
      $sortBy: String,
      $page: Int,
      $limit: Int, 
    ) {
      allCollections(
        slugs: $slugs,
        slugsMe: $slugsMe,
        slugsDisplay: $slugsDisplay,  
        sortBy: $sortBy,
        page: $page,
        limit: $limit
      ) {
        total
        collections {
          id 
          slug 
          slugMe 
          slugDisplay 
          statsOverall {
            floor1h
            floor24h
            floor7d
            floorPrice
            numListed
            numMints
            priceUnit
            sales1h
            sales24h
            sales7d
            volume1h
            volume24h
            volume7d
          }
          statsSwap { # TensorSwap + HadeSwap + Elixir
            buyNowPrice
            sellNowPrice
          }
          statsTSwap { # TensorSwap only
            buyNowPrice
            nftsForSale
            numMints
            priceUnit
            sales7d
            sellNowPrice
            solDeposited
            volume7d
          }
          statsHSwap { # HadeSwap only
            buyNowPrice
            nftsForSale
            priceUnit
            sales7d
            sellNowPrice
            solDeposited
            volume7d
          }
          tswapTVL
          firstListDate
          name
        }
      }
    }
    `,
    variables: {
      "slugs": null,
      "slugsDisplay": null,
      "slugsMe": null,
      "sortBy": "stats.volume24h:desc",
      "limit": 50,
      "page": 1
    },
  });

  const results = resp.data.CollectionsStats;
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
