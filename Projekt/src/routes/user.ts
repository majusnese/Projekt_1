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

    public async del(req: Request, res: Response, next: NextFunction) {
       User.remove({_id: req.params.uid})
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
    };    

    init() {
        this.router.post('/signup', this.signup);
        this.router.delete('/uid', this.del);
    }
}

const userRoutes = new UserRouter();
userRoutes.init();

export default userRoutes.router;