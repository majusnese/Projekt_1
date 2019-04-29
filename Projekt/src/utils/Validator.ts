import { Router, Request, Response, NextFunction } from "express";
import Game from "../models/games";
import mongoose = require("mongoose");
import { isString, isArray, isNumber } from "util";

export function isGame(game) {
  if (
    !isString(game.name) ||
    !isArray(game.platforms) ||
    !isNumber(game.price)
  ) {
    return false;
  }
  let check = true;
  game.platforms.forEach(element => {
    if (!["PC", "XBOX", "PS4"].includes(element)) {
      check = false;
    }
  });
  if (!check) {
    return false;
  }
  return true;
}

export function isSeller(seller) {
  if (
    !isString(seller.label) ||
    !isNumber(seller.locations) ||
    !isString(seller.headquarter) ||
    isGame(seller.game)
  ) {
    return false;
  }
  if (seller.locations < 1) {
    return false;
  }
  return true;
}

export function isValidValue(prop, value) {
  if (prop == "_id") {
    return false;
  }
  let typeValue = typeof value;
  if (prop === "name" && typeValue === "string") {
    return true;
  }
  if (prop === "platforms" && isArray(value)) {
    return true;
  }
  if (prop === "price" && typeValue == "number") {
    return true;
  }
  return false;
}

export function isPropName (prop){
  if(["name","platforms","price"].includes(prop)){
    return true;
  }
  return false;
}

export function isValidValueSeller(prop, value) {
  if (prop == "_id") {
    return false;
  }
  let typeValue = typeof value;
  if (prop === "label" && typeValue === "string") {
    return true;
  }
  if (prop === "headquarter" && typeValue === "string") {
    return true;
  }
  if (prop === "locations" && typeValue == "number") {
    return true;
  }
  if (prop === "game" && mongoose.Types.ObjectId.isValid(value)){
    return true;
  }
  return false;
}

export function isPropNameSeller (prop){
  if(["label","headquarter","game","locations"].includes(prop)){
    return true;
  }
  return false;
}

export const regex = RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);