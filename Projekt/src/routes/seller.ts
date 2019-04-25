import {Router, Request, Response, NextFunction} from 'express';
import mongoose = require('mongoose');
import Seller from '../models/seller';
import Game from '../models/games';

export class SellerRouter{
    router: Router

    constructor(){
        this.router = Router();
        this.init();
    }

    public async find(req: Request, res: Response, next: NextFunction) {
        Seller.find()
        .select('label locations _id headquarter game')
        .populate('game')
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
                                type: 'GET',
                                description: 'The link to look at this seller individually',
                                url: 'http://localhost:3000/sellers/' + doc._id
                            }
                        }
                    })
            };
            if(docs.length > 0){
            res.status(200).json(response);
            }else{ 
                res.status(400).json({
                    message: 'There are no entries'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
    };

    public async create(req: Request, res: Response, next: NextFunction) {
        Game.findById(req.body.game)
        .then(game => {
            if (!game){
                return res.status(404).json({
                    message: 'Game not found'
                });
            }
            const seller = new Seller({
                id: new mongoose.Types.ObjectId(),
                label: req.body.label,
                locations: req.body.locations,
                headquarter: req.body.headquarter,
                game: req.body.game
            });
            return seller.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'Post request successful to /sellers',
                createdSeller: {
                    label: result.label,
                    locations: result.locations,
                    headquarter: result.headquarter,
                    _id: result._id,
                    game: result.game,
                    request: {
                        type: 'GET',
                        description: 'Look at the created seller',
                        url: 'http://localhost:3000/sellers/' + result._id
                    },
                    request_getthis: {
                        type: 'GET',
                        description: 'Look at this seller individually',
                        url: 'http://localhost:3000/sellers/' + result._id
                    },
                    delete_request: {
                        type: 'DELETE',
                        description: 'Delete the seller',
                        url: 'http://localhost:3000/sellers/' + result._id
                    }
                }
            });
        })
        .catch(err => { 
            console.log(err);
             res.status(500).json({error: err});
        });
    };

    public async findbyid(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        Seller.findById(id)
            .select('label locations headquarter _id game')
            .populate('game')
            .exec()
            .then(doc => {
                if(doc) {
                    res.status(200).json({
                        label: doc.label,
                        locations: doc.locations,
                        headquarter: doc.headquarter,
                        game: doc.game,
                        delete_request: {
                            type: 'DELETE',
                            description: 'Delete the seller',
                            url: 'http://localhost:3000/sellers/' + doc._id
                        }

                    })
                }else{
                    res.status(404).json({message: 'No Object found'});
                }
            })
            .catch(err => { 
                console.log(err);
                res.status(500).json({error: err});
            }
            );
    };

    public async patch(req: Request, res: Response, next: NextFunction) {
            const id = req.params.id;
            const updateOperations = {};
            for (const ops of req.body) {
                updateOperations[ops.propName] = ops.value;
            }
            Seller.update({_id: id}, { $set: updateOperations})
            .exec()
            .then(result => {
                res.status(200).json({
                    message: 'Seller updated',
                    request: {
                        type: 'GET',
                        description: 'Link to the updated seller',
                        url: 'http://localhost:3000/sellers/' + result._id
                    }
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    };
    
    public async del(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        Seller.deleteOne({_id: id})
            .exec()
            .then(result => {
                res.status(200).json({
                    message: 'Seller deleted'
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    };

    init() {
        this.router.get('/', this.find);
        this.router.post('/', this.create);
        this.router.get('/:id', this.findbyid);
        this.router.patch('/:id', this.patch);
        this.router.delete('/:id', this.del);
    }
}

const sellerRoutes = new SellerRouter();
sellerRoutes.init();

export default sellerRoutes.router;
