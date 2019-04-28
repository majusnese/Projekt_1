import { Router, Request, Response, NextFunction } from "express";
import mongoose = require("mongoose");
import User from "../models/user";
import bcrypt = require("bcrypt");
import * as jwt from "jsonwebtoken";

export class UserRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async signup(req: Request, res: Response, next: NextFunction) {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length >= 1) {
          return res.status(422).json({
            message: "Mail already in use"
          });
        } else {
          bcrypt.hash(req.body.password, 12, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
                message: "Error occurred."
              });
            } else {
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
              });
              user
                .save()
                .then(result => {
                  console.log(result);
                  res.status(201).json({
                    message: "user created",
                    uid: result._id
                  });
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                    error: err,
                    mesage: "An error occurred after the password was hashed"
                  });
                });
            }
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err,
          mesage: "An error occurred while searching for a duplicate email"
        });
      });
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    const jwt_key = process.env.JWT_KEY;
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length < 1) {
          res.status(401).json({
            message: "Auth failed2"
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            res.status(401).json({
              message: "Auth failed3"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id
              },
              jwt_key,
              {
                expiresIn: "1h"
              } 
            );
            return res.status(200).json({
              message: "Auth succesful",
              token: token
            });
          }
          console.log(req.body.password + user[0].password);
          res.status(401).json({
            message: "Auth failed4"
          });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  }

  public async del(req: Request, res: Response, next: NextFunction) {
    User.remove({ _id: req.params.uid })
      .exec()
      .then(result => {
        res.status(200).json({
          message: "User deleted"
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err,
          message: "Delete was not succesful"
        });
      });
  }

  init() {
    this.router.post("/signup", this.signup);
    this.router.delete("/uid", this.del);
    this.router.post("/login", this.login);
  }
}

const userRoutes = new UserRouter();
userRoutes.init();

export default userRoutes.router;
