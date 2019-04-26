import {Router, Request, Response, NextFunction} from 'express';
import Game from '../models/games';
import mongoose = require('mongoose');
import { isString, isArray, isNumber } from 'util';

    
    
export function isGame(game) {
  if (
    !isString(game.name) ||
    !isArray(game.platforms) ||
    !isNumber(game.price)
  ) {
    return false;
  }
  let check;
  game.platform.forEach(element => {
    if (!["PC", "XBOX", "PS4"].includes(element)) {
      check = true;
    }
  });
  if (check) {
    return false;
  }
  return true;
}

export function isSeller (seller){
    if(!isString(seller.label) || !isNumber(seller.locations) || !isString(seller.headquarter) || isGame(seller.game)){
        return false;
    }
    if(seller.locations < 1){
        return false;
    }
    return true;
}
