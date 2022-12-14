import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import merge from "deepmerge";
import isEqual from "lodash/isEqual";
import { useMemo } from "react";

export const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";

let apolloClient = null;

const httpLink = createHttpLink({
  uri: "https://graphqlzero.almansi.me/api",
});

function createApolloClient(ctx) {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: httpLink,
    cache: new InMemoryCache(),
  });
}

export function initializeApollo({ ctx, initialState }) {
  const _apolloClient = apolloClient ?? createApolloClient(ctx || undefined);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the initialState from getStaticProps/getServerSideProps in the existing cache
    const data = merge(existingCache, initialState, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) => sourceArray.every((s) => !isEqual(d, s))),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(client, pageProps) {
  pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  return pageProps;
}

export function useApollo(pageProps) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(() => initializeApollo({ initialState: state }), [state]);
  return store;
}