const { buildSchema } = require('graphql');
module.exports = buildSchema(`
type Game {
  _id: ID!
  name: String!
  price: Float!
  platforms: [String]
}

type Seller {
  _id: ID!
  label: String!
  locations: Int!
  headquarter: String!
  game: ID!
}

type User {
  _id: ID!
  name: String
  email: String!
}

input UserInput {
  email: String!
  password: String!
}

input SellerInput {
  label: String!
  locations: Int!
  headquarter: String!
  game: ID!
}

input GameInput {
  name: String! 
  price: Float!
  platforms: [String]
}

type RootQuery {
    games: [Game!]!
    sellers: [Seller!]!
    game(id: ID): Game!
    seller(id: ID): Seller!
}

type RootMutation {
    createGame(gameInput: GameInput) : Game
    createSeller(sellerInput: SellerInput) : Seller
    createUser(userInput: UserInput) : User
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);
