import { Router, Request, Response, NextFunction } from "express";
import mongoose = require("mongoose");
import Seller from "../models/seller";
import Game from "../models/games";
const checkAuth = require("../utils/check-auth");
import { logger } from "../utils/logger";
import stringify from "fast-safe-stringify";

export class SellerRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async find(req: Request, res: Response, next: NextFunction) {
    Seller.find()
      .select("label locations _id headquarter game")
      .populate("game")
      .exec()
      .then(docs => {
        const response = {
          count: docs.length,
          sellers: docs.map(doc => {
            return {
              label: doc.label,
              locations: doc.locations,
              _id: doc._id,
              game: doc.game,
              request: {
                type: "GET",
                description: "The link to look at this seller individually",
                url: "http://localhost:3000/sellers/" + doc._id
              }
            };
          })
        };
        if (docs.length > 0) {
          res.status(200).json(response);
        } else {
          res.status(400).json({
            message: "There are no entries"
          });
        }
      })
      .catch(err => {
        logger.error(`Findall seller Error: ${stringify(err)}`);
      });
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    Game.findById(req.body.game)
      .then(game => {
        if (!game) {
          return res.status(404).json({
            message: "Game not found"
          });
        }
        const seller = new Seller({
          id: new mongoose.Types.ObjectId(),
          label: req.body.label,
          locations: req.body.locations,
          headquarter: req.body.headquarter,
          game: req.body.game
        });
        return seller.save();
      })
      .then(result => {
        res.status(201).json({
          message: "Post request successful to /sellers",
          createdSeller: {
            label: result.label,
            locations: result.locations,
            headquarter: result.headquarter,
            _id: result._id,
            game: result.game,
            request: {
              type: "GET",
              description: "Look at the created seller",
              url: "http://localhost:3000/sellers/" + result._id
            },
            request_getthis: {
              type: "GET",
              description: "Look at this seller individually",
              url: "http://localhost:3000/sellers/" + result._id
            },
            delete_request: {
              type: "DELETE",
              description: "Delete the seller",
              url: "http://localhost:3000/sellers/" + result._id
            }
          }
        });
      })
      .catch(err => {
        logger.error(`Post seller Error: ${stringify(err)}`);
      });
  }

  public async findbyid(req: Request, res: Response, next: NextFunction) {
    let id;
    try {
      id = mongoose.Types.ObjectId(req.params.id);
    } catch {
      err => {
        res.status(422).json({
          message: "Please pass a valid ID"
        });
        logger.error(`Findbyid seller Error: ${stringify(err)}`);
      };
    }
    Seller.findById(id)
      .select("label locations headquarter _id game")
      .populate("game")
      .exec()
      .then(doc => {
        if (doc) {
          res.status(200).json({
            label: doc.label,
            locations: doc.locations,
            headquarter: doc.headquarter,
            game: doc.game,
            delete_request: {
              type: "DELETE",
              description: "Delete the seller",
              url: "http://localhost:3000/sellers/" + doc._id
            }
          });
        } else {
          res.status(404).json({ message: "No Object found" });
        }
      })
      .catch(err => {
        logger.error(`Findbyid seller Error: ${stringify(err)}`);
      });
  }

  public async patch(req: Request, res: Response, next: NextFunction) {
    let id;
    try {
      id = mongoose.Types.ObjectId(req.params.id);
    } catch {
      err => {
        res.status(422).json({
          message: "Please pass a valid ID"
        });
        logger.error(`Update seller Error: ${stringify(err)}`);
      };
    }
    const updateOperations = {};
    for (const ops of req.body) {
      updateOperations[ops.propName] = ops.value;
    }
    Seller.update({ _id: id }, { $set: updateOperations })
      .exec()
      .then(result => {
        res.status(200).json({
          message: "Seller updated",
          request: {
            type: "GET",
            description: "Link to the updated seller",
            url: "http://localhost:3000/sellers/" + result._id
          }
        });
      })
      .catch(err => {
        logger.error(`Update seller Error: ${stringify(err)}`);
      });
  }

  public async del(req: Request, res: Response, next: NextFunction) {
    let id;
    try {
      id = mongoose.Types.ObjectId(req.params.id);
    } catch {
      err => {
        res.status(422).json({
          message: "Please pass a valid ID"
        });
        logger.error(`del seller Error: ${stringify(err)}`);
      };
    }
    Seller.findById(id)
      .exec()
      .then(doc => {
        if (doc) {
          Seller.deleteOne({ _id: id })
            .exec()
            .then(result => {
              res.status(200).json({
                message: "Seller deleted"
              });
            });
        } else {
          res.status(404).json({ message: "No Object found" });
        }
      })
      .catch(err => {
        logger.error(`Del seller Error: ${stringify(err)}`);
      });
  }

  init() {
    this.router.get("/", this.find);
    this.router.post("/", checkAuth, this.create);
    this.router.get("/:id", this.findbyid);
    this.router.patch("/:id", checkAuth, this.patch);
    this.router.delete("/:id", checkAuth, this.del);
  }
}

const sellerRoutes = new SellerRouter();
sellerRoutes.init();

export default sellerRoutes.router;