import Game from "../../models/games";
import Seller from "../../models/seller";
import User from "../../models/user";
import * as mongoose from 'mongoose';

module.exports = {
    games: () => {
      return Game.find()
        .then(games => {
          return games.map(game => {
            return { ...game._doc };
          });
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    },
    sellers: () => {
      return Seller.find()
        .then(sellers => {
          return sellers.map(seller => {
            return { ...seller._doc };
          });
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    },
    seller: (args) => {
      return Seller.findById(args.id)
        .then(seller => {
          return seller;
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    },
    game: (args) => {
      return Game.findById(args.id)
        .then(game => {
          return game;
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    },
    createSeller: (args) => {
      const seller_instance = new Seller({
        id: new mongoose.Types.ObjectId(),
        label: args.sellerInput.label,
        headquarter: args.sellerInput.headquarter,
        locations: args.sellerInput.locations,
        game: args.sellerInput.game
      });
      return seller_instance
        .save()
        .then(result => {
          console.log(result);
          return { ...result._doc };
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    },
    createGame: (args) => {
      const game_instance = new Game({
        id: new mongoose.Types.ObjectId(),
        name: args.gameInput.name,
        platforms: args.gameInput.platforms,
        price: args.gameInput.price
      });
      return game_instance
        .save()
        .then(result => {
          console.log(result);
          return { ...result._doc };
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    },
    createUser: (args) => {
      const user_instance = new User({
        id: new mongoose.Types.ObjectId(),
        name: args.userInput.name,
        password: args.userInput.password,
        email: args.userInput.email
      });
      return user_instance
        .save()
        .then(result => {
          console.log(result);
          return { ...result._doc, password: "*********" };
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    }
  }