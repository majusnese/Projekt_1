import { Router, Request, Response, NextFunction } from "express";
import Game from "../models/games";
import mongoose = require("mongoose");
import { isGame } from "../utils/Validator";
const checkAuth = require("../utils/check-auth");
import { logger } from "../utils/logger";
import stringify from "fast-safe-stringify";

export class GameRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async find(req: Request, res: Response, next: NextFunction) {
    Game.find()
      .select("name price _id platforms")
      .exec()
      .then(docs => {
        const response = {
          count: docs.length,
          games: docs.map(doc => {
            return {
              name: doc.name,
              price: doc.price,
              _id: doc._id,
              request: {
                type: "GET",
                description: "The link matching the request",
                url: "http://localhost:3000/games/" + doc._id
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
        logger.error(`Findall game Error: ${stringify(err)}`);
        res.status(500).json({
          error: err
        });
      });
  }

  //422: unprocessable Entity 
  public async create(req: Request, res: Response, next: NextFunction) {
    const game = new Game({
      id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      platforms: req.body.platforms,
      price: req.body.price
    });
    if (!isGame(game)) {
      res.status(422).json({
        message: "please provide proper data"
      });
    }
    game
      .save()
      .then(result => {
        res.status(201).json({
          message: "Post request successful to /games",
          createdGame: {
            name: result.name,
            price: result.price,
            platforms: result.platforms,
            _id: result._id,
            request: {
              type: "GET",
              description: "Look at the created game",
              url: "http://localhost:3000/games/" + result._id
            },
            request_getthis: {
              type: "GET",
              description: "Look at this game individually",
              url: "http://localhost:3000/games/" + result._id
            },
            delete_request: {
              type: "DELETE",
              description: "Delete the game",
              url: "http://localhost:3000/games/" + result._id
            }
          }
        });
      })
      .catch(err => {
        logger.error(`Post game Error: ${stringify(err)}`);
        res.status(500).json({ error: err });
      });
  }

  public async findbyanything(req: Request, res: Response, next: NextFunction) {
    if (!req.params.anything) {
      res.status(422).json({
        message: "Please give an argument!"
      });
    }
    const param = req.params.anything;
    console.log(param);

    let objid = "123456789012";
    let isObjectId = false;
    if (mongoose.Types.ObjectId.isValid(param)) {
      objid = mongoose.Types.ObjectId(param);
      isObjectId = true;
    }

    let isNumber = false;
    let number_t = 1234567890;
    if (!isNaN(param) && !isObjectId) {
      number_t = Number(param);
      isNumber = true;
    }

    let isPlatform = false;
    let platform_t = "AAAAA";
    if (["PC", "XBOX", "PS4"].includes(param)) {
      platform_t = param;
      isPlatform = true;
    }

    if(!isNumber && !isObjectId && !isPlatform){
      res.status(422).json({
        message: "Argument could not be processed"
      });
    }
    Game.find()
      .or([
        { _id: objid },
        { name: param },
        { price: number_t },
        { platforms: platform_t }
      ])
      .exec()
      .then(docs => {
        const response = {
          count: docs.length,
          games: docs.map(doc => {
            return {
              name: doc.name,
              price: doc.price,
              _id: doc._id,
              platforms: doc.platforms,
              request: {
                type: "GET",
                description: "The link matching the request",
                url: "http://localhost:3000/games/" + doc._id
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
        logger.error(`findbyanything game Error: ${stringify(err)}`);
        res.status(500).json({ error: err });
      });
  }

  public async findbyid(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    Game.findById(id)
      .select("name price platforms _id")
      .exec()
      .then(doc => {
        if (doc) {
          res.status(200).json({
            id: doc._id,
            name: doc.name,
            price: doc.price,
            platforms: doc.platforms,
            delete_request: {
              type: "DELETE",
              description: "Delete the game",
              url: "http://localhost:3000/games/" + doc._id
            }
          });
        } else {
          res.status(404).json({ message: "No Object found" });
        }
      })
      .catch(err => {
        logger.error(`Findbyid game Error: ${stringify(err)}`);
        res.status(500).json({ error: err });
      });
  }

  public async patch(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    const updateOperations = {};
    for (const ops of req.body) {
      updateOperations[ops.propName] = ops.value;
    }
    Game.update({ _id: id }, { $set: updateOperations })
      .exec()
      .then(result => {
        res.status(200).json({
          message: "Game updated",
          request: {
            type: "GET",
            description: "Link to the updated game",
            url: "http://localhost:3000/games/" + result._id
          }
        });
      })
      .catch(err => {
        logger.error(`Update game Error: ${stringify(err)}`);
        res.status(500).json({
          error: err
        });
      });
  }

  public async del(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    Game.findById(id)
      .exec()
      .then(doc => {
        if (doc) {
          Game.deleteOne({ _id: id })
            .exec()
            .then(result => {
              res.status(200).json({
                message: "Game deleted"
              });
            });
        } else {
          res.status(404).json({ message: "No Object found" });
        }
      })
      .catch(err => {
        logger.error(`Delete game Error: ${stringify(err)}`);
        res.status(500).json({ error: err });
      });
  }

  init() {
    this.router.get("/", this.find);
    this.router.post("/", checkAuth, this.create);
    this.router.get("/:id", this.findbyid);
    this.router.patch("/:id", checkAuth, this.patch);
    this.router.delete("/:id", checkAuth, this.del);
    this.router.get("/findbyanything/:anything", this.findbyanything);
  }
}

const gameRoutes = new GameRouter();
gameRoutes.init();

export default gameRoutes.router;