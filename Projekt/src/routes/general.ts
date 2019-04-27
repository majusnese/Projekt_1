import { Router, Request, Response, NextFunction } from "express";
import Game from "../models/games";
import mongoose = require("mongoose");
import Seller from "../models/seller";
const checkAuth = require('../utils/check-auth');

export class GeneralRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    const seller_temp = Seller.findById(req.body.seller);
    Game.findById(req.body.game)
      .then(game => {
        if (!game) {
          const game = new Game({
            id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            platforms: req.body.platforms,
            price: req.body.price
          });
          game.save();
        }
        if (!seller_temp) {
          const seller = new Seller({
            id: new mongoose.Types.ObjectId(),
            label: req.body.label,
            locations: req.body.locations,
            headquarter: req.body.headquarter,
            game: req.body.game
          });
          seller.save();
        }
        res.status(201).json({
          message: "worked"
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  }

  init() {
    this.router.post("/", checkAuth, this.create);
  }
}

const generalRoutes = new GeneralRouter();
generalRoutes.init();

export default generalRoutes.router;
