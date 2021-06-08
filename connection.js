const { GraphQLClient } = require('graphql-request')
const gql = require('graphql-tag')
const graphqlRequest = require('graphql-request')

exports.FETCH_ROUTE_INTELLIGENCE = gql`
  query FetchRouteManagerData {
    carriers {
      ...carrierFields
      __typename
    }
    routes {
      ...routeFields
      __typename
    }
    regions {
      ...regionFields
      __typename
    }
    products {
      ...productFields
      __typename
    }
    priceIndices {
      ...priceIndexFields
      __typename
    }
  }

  fragment carrierFields on Carrier {
    id
    name
    carrierType
    isRouteRateUpdated
    __typename
  }

  fragment routeFields on Route {
    id
    routeCode
    miles
    carrier {
      id
      name
      carrierType
      __typename
    }
    originRegion {
      id
      name
      shortForm
      __typename
    }
    destinationRegion {
      id
      name
      shortForm
      __typename
    }
    __typename
  }

  fragment regionFields on Region {
    id
    name
    shortForm
    __typename
  }

  fragment productFields on Product {
    id
    name
    __typename
  }

  fragment priceIndexFields on PriceIndex {
    id
    value
    name
    __typename
  }
`

exports.FETCH_CURRENT_FREIGHT_RATES = gql`
 query FetchCurrentFreightRates($routeIds: [ID!]!, $productId: ID!) {
    routes(query: {ids: $routeIds}) {
      ...routeFields
      carrier {
        ...carrierFields
        currentRouteRate {
          ...routeRateFields
          __typename
        }
        __typename
      }
      currentFreightRate(productId: $productId) {
        ...freightRateFields
        __typename
      }
      __typename
    }
  }

  fragment routeFields on Route {
    id
    routeCode
    miles
    carrier {
      id
      name
      carrierType
      __typename
    }
    originRegion {
      id
      name
      shortForm
      __typename
    }
    destinationRegion {
      id
      name
      shortForm
      __typename
    }
    __typename
  }

  fragment freightRateFields on FreightRate {
    id
    rate
    startDate
    endDate
    product {
      id
      name
      __typename
    }
    route {
      id
      routeCode
      __typename
    }
    carrier {
      id
      name
      carrierType
      __typename
    }
    __typename
  }

  fragment routeRateFields on RouteRate {
    id
    carrier {
      id
      name
      carrierType
      __typename
    }
    fsc
    startDate
    endDate
    __typename
  }

  fragment carrierFields on Carrier {
    id
    name
    carrierType
    isRouteRateUpdated
    __typename
  }
`

const endpoint = 'http://8c93f1744ea4.ngrok.io/graphql'
const client = new graphqlRequest.GraphQLClient(endpoint, {
    headers: {
        auth_token: 'jFXxjRMaH-sa4_-XU-Ja'
    }
})

exports.getRouteIntelligence = () => client.request(this.FETCH_ROUTE_INTELLIGENCE)

exports.getCurrentFreightRates = (variables) => client.request(this.FETCH_CURRENT_FREIGHT_RATES, variables)