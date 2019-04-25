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
        User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length >= 1){
                return res.status(422).json({
                    message: "Mail already in use"
                });
            }else {
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
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
                mesage: "An error occurred while searching for a duplicate email"
            });
        });   
    };





    init() {
        this.router.post('/signup', this.signup);
    }
}

const userRoutes = new UserRouter();
userRoutes.init();

export default userRoutes.router;