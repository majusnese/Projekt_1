import {Router, Request, Response, NextFunction} from 'express';
import Game from '../models/games';
import mongoose = require('mongoose');
import { isString, isArray, isNumber } from 'util';

    
    
export function isGame (game){
        if(!isString(game.name) || !isArray(game.platforms) || !isNumber(game.price)){
            return false;
        }
        let check;
        game.platform.forEach(element => {
        if(!["PC","XBOX","PS4"].includes(element)){
            check = true;
        }
        });
        if(check){
            return false;
        }
        return true;
}

