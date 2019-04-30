import { Router, Request, Response, NextFunction } from "express";
import mongoose = require("mongoose");
import Seller from "../models/seller";
import Game from "../models/games";
const checkAuth = require("../utils/check-auth");
import { logger } from "../utils/logger";
import stringify from "fast-safe-stringify";
import { isSeller } from "../utils/Validator";
import { isValidValueSeller } from "../utils/Validator";
import { isPropNameSeller } from "../utils/Validator";

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
          logger.debug(`Findall did not find entries`);
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
    let id = req.body.game;
    try {
      id = mongoose.Types.ObjectId(req.body.game);
    } catch {
      err => {
        logger.error(
          `Create seller failed due to a wrong ID ${stringify(err)}`
        );
        res.status(422).json({
          message: "Please pass a valid ID"
        });
      };
    }
    let check = await Game.findById(id)
      .exec()
      .then(doc => {
        if (doc) {
          return true;
        }
        return false;
      })
      .catch(error => {
        logger.error(
          `Update failed while trying to find correlated Game: ${stringify(
            error
          )}`
        );
      });

    if (check) {
      const seller = new Seller({
        id: new mongoose.Types.ObjectId(),
        label: req.body.label,
        locations: req.body.locations,
        headquarter: req.body.headquarter,
        game: req.body.game
      });
      if (isSeller(seller)) {
        seller
          .save()
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
                requestGetThis: {
                  type: "GET",
                  description: "Look at this seller individually",
                  url: "http://localhost:3000/sellers/" + result._id
                },
                deleteRequest: {
                  type: "DELETE",
                  description: "Delete the seller",
                  url: "http://localhost:3000/sellers/" + result._id
                }
              }
            });
          })
          .catch(err => {
            logger.error(
              `Post seller Error while trying to update: ${stringify(err)}`
            );
          });
      } else {
        logger.error(`Post seller didnt work due to wrong arguments`);
        res.status(422).json({
          message: "You provided unprocessable Data"
        });
      }
    } else {
      logger.error(`Update seller failed due to wrong data for the game!)}`);
      res.status(404).json({
        message: "Game not found"
      });
    }
  }

  public async findbyid(req: Request, res: Response, next: NextFunction) {
    let id;
    try {
      id = mongoose.Types.ObjectId(req.params.id);
    } catch {
      err => {
        logger.error(
          `Findbyid seller Error because an invalid id was passed: ${stringify(
            err
          )}`
        );
        res.status(422).json({
          message: "Please pass a valid ID"
        });
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
            id: doc._id,
            deleteRequest: {
              type: "DELETE",
              description: "Delete the seller",
              url: "http://localhost:3000/sellers/" + doc._id
            }
          });
        } else {
          logger.error(`Findbyid seller did not find a seller!`);
          res.status(404).json({ message: "No Object found" });
        }
      })
      .catch(err => {
        logger.error(
          `Findbyid seller Error while executing operation: ${stringify(err)}`
        );
      });
  }

  public async patch(req: Request, res: Response, next: NextFunction) {
    let id;
    try {
      id = mongoose.Types.ObjectId(req.params.id);
    } catch {
      err => {
        logger.error(
          `Update seller error because an invalid id was passed: ${stringify(
            err
          )}`
        );
        res.status(422).json({
          message: "Please pass a valid ID"
        });
      };
    }

    let sellerInstance = await Seller.findById(id)
      .select("name price platforms _id")
      .exec()
      .then(doc => {
        if (doc) {
          return true;
        } else {
          return false;
        }
      })
      .catch(error => {
        logger.error(
          `Update seller error while trying to find the seller: ${stringify(
            error
          )}`
        );
      });

    if (sellerInstance) {
      const updateOperations = {};
      for (const ops of req.body) {
        if (
          !isPropNameSeller(ops.propName) ||
          !isValidValueSeller(ops.propName, ops.value)
        ) {
          logger.error(
            `Update seller failed because unprocessable arguments were passed!`
          );
          res.status(422).json({
            message: "Field or Value is not valid"
          });
        }
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
          logger.error(
            `Update seller Error while trying to update: ${stringify(err)}`
          );
        });
    } else {
      logger.error(`Update seller did not find a seller!`);
      res.status(404).json({
        message: "Seller not found"
      });
    }
  }

  public async del(req: Request, res: Response, next: NextFunction) {
    let id;
    try {
      id = mongoose.Types.ObjectId(req.params.id);
    } catch {
      logger.error(`Delete seller error because an invalid id was passed`);
      res.status(422).json({
        message: "Please pass a valid ID"
      });
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
          logger.error(`Delete seller did not find a seller to delete!`);
          res.status(404).json({ message: "No Object found" });
        }
      })
      .catch(err => {
        logger.error(
          `Del seller Error while trying to find the seller: ${stringify(err)}`
        );
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
