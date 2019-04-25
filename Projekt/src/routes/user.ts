import {Router, Request, Response, NextFunction} from 'express';
import mongoose = require('mongoose');
import User from '../models/user';
import bcrypt = require('bcrypt');

export class UserRouter{
    router: Router

    constructor(){
        this.router = Router();
        this.init();
    }

    public async signup(req: Request, res: Response, next: NextFunction) {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err,
                        message: "Error occurred."
                    });   
                } else {
                    const user = new User ({
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: hash
                });
                user
                    .save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: "user created"
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





    init() {
        this.router.post('/signup', this.signup);
    }
}

const userRoutes = new UserRouter();
userRoutes.init();

export default userRoutes.router;