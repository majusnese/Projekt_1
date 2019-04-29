import { Router, Request, Response, NextFunction } from "express";
import Game from "../models/games";
import mongoose = require("mongoose");
import { isGame } from "../utils/Validator";
const checkAuth = require("../utils/check-auth");
import { logger } from "../utils/logger";
import stringify from "fast-safe-stringify";
import { isValidValue } from "../utils/Validator";
import { isPropName } from "../utils/Validator";

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
          logger.debug(`findall did not find entries:`);
          res.status(404).json({
            message: "There are no entries"
          });
        }
      })
      .catch(err => {
        logger.error(
          `Findall game error while trying to execute operation: ${stringify(
            err
          )}`
        );
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
    if (isGame(game)) {
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
              requestGetThis: {
                type: "GET",
                description: "Look at this game individually",
                url: "http://localhost:3000/games/" + result._id
              },
              deleteRequest: {
                type: "DELETE",
                description: "Delete the game",
                url: "http://localhost:3000/games/" + result._id
              }
            }
          });
        })
        .catch(err => {
          logger.error(
            `Post game error whily trying to execute operation: ${stringify(
              err
            )}`
          );
        });
    } else {
      logger.error(`Post game was not succesful due to wrong data`);
      res.status(422).json({
        message: "please provide proper data"
      });
    }
  }

  public async findbyanything(req: Request, res: Response, next: NextFunction) {
    if (!req.params.anything) {
      logger.error(`findbyanything did not get an argument`);
      res.status(422).json({
        message: "Please give an argument!"
      });
    }
    const param = req.params.anything;

    let isString = false;
    if (typeof param === "string") {
      isString = true;
    }
    let objid = "123456789012";
    let isObjectId = false;
    if (mongoose.Types.ObjectId.isValid(param)) {
      objid = mongoose.Types.ObjectId(param);
      isObjectId = true;
    }

    let isNumber = false;
    let numberTest = 1234567890;
    if (!isNaN(param) && !isObjectId) {
      numberTest = Number(param);
      isNumber = true;
    }

    let isPlatform = false;
    let platformTest = "AAAAA";
    if (["PC", "XBOX", "PS4"].includes(param)) {
      platformTest = param;
      isPlatform = true;
    }

    if (!isNumber && !isObjectId && !isPlatform && !isString) {
      logger.error(
        `findbyanything error because unprocessable arguments were passed`
      );
      res.status(422).json({
        message: "Argument could not be processed"
      });
    }
    await Game.find()
      .or([
        { _id: objid },
        { name: param },
        { price: numberTest },
        { platforms: platformTest }
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
          logger.error(`findbyanything did not find entries:`);
          res.status(404).json({
            message: "There are no entries"
          });
        }
      })
      .catch(err => {
        logger.error(
          `findbyanything game error while trying to execute operation: ${stringify(
            err
          )}`
        );
      });
  }

  public async findbyid(req: Request, res: Response, next: NextFunction) {
    let id;
    try {
      id = mongoose.Types.ObjectId(req.params.id);
    } catch {
      err => {
        logger.error(
          `Findbyid game error because an invalid id was passed: ${stringify(
            err
          )}`
        );
        res.status(422).json({
          message: "Please pass a valid ID"
        });
      };
    }

    await Game.findById(id)
      .select("name price platforms _id")
      .exec()
      .then(doc => {
        if (doc) {
          res.status(200).json({
            id: doc._id,
            name: doc.name,
            price: doc.price,
            platforms: doc.platforms,
            deleteRequest: {
              type: "DELETE",
              description: "Delete the game",
              url: "http://localhost:3000/games/" + doc._id
            }
          });
        } else {
          logger.error(`No Game found`);
          res.status(404).json({ message: "No Object found" });
        }
      })
      .catch(err => {
        logger.error(
          `Findbyid game error whily trying to findbyid: ${stringify(err)}`
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
          `Update game error because an invalid id was passed: ${stringify(
            err
          )}`
        );
        res.status(422).json({
          message: "Please pass a valid ID"
        });
      };
    }
    let gameInstance = await Game.findById(id)
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
          `Update game failed while trying to find the game: ${stringify(
            error
          )}`
        );
      });

    if (gameInstance) {
      const updateOperations = {};
      for (const ops of req.body) {
        if (
          !isPropName(ops.propName) ||
          !isValidValue(ops.propName, ops.value)
        ) {
          logger.error(`Update game failed, wrong arguments`);
          res.status(422).json({
            message: "Field or Value is not valid"
          });
        }
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
              url: "http://localhost:3000/games/" + id
            }
          });
        })
        .catch(err => {
          logger.error(
            `Update game Error while trying to update: ${stringify(err)}`
          );
        });
    } else {
      logger.error(`No Game to update`);
      res.status(404).json({
        message: "Game not found"
      });
    }
  }

  public async del(req: Request, res: Response, next: NextFunction) {
    let id;
    try {
      id = mongoose.Types.ObjectId(req.params.id);
    } catch {
      err => {
        logger.error(
          `Delete game Error because an invalid id was passed: ${stringify(
            err
          )}`
        );
        res.status(422).json({
          message: "Please pass a valid ID"
        });
      };
    }
    Game.findById(id)
      .exec()
      .then(doc => {
        if (doc) {
          Game.deleteOne({ _id: id })
            .exec()
            .then(result => {
              if (result) {
                res.status(200).json({
                  message: "Game deleted"
                });
              }
            })
            .catch(err => {
              logger.error(
                `Delete game Error while trying to delete the Game: ${stringify(
                  err
                )}`
              );
            });
        } else {
          logger.error(`No Game to delete`);
          res.status(404).json({ message: "No Object found" });
        }
      })
      .catch(err => {
        logger.error(
          `Delete game Error while trying to find the Game: ${stringify(err)}`
        );
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
