import * as mocha from "mocha";
import * as chai from "chai";
import chaiHttp = require("chai-http");
import app from "../App";
import asserArrays = require("chai-arrays");
import * as shell from "shelljs";
import { init } from "./init";
import { logger } from "../utils/logger";
import stringify from "fast-safe-stringify";
import {game_id} from './game.test';
chai.use(asserArrays);
chai.use(chaiHttp);
const expect = chai.expect;

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Testdaten oder so
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let seller_id;
const wrong_seller_id = "7cc5cd827fad48e5efb6d432";
const seller_name = "Gamestop";
const login = {
  email: "test@rest.de",
  password: "qwerty"
};
let token = "";

const seller_neu ={
    "label": "Mediamarkt",
    "locations": 333,
    "headquarter": "Suedsee",
    "game": game_id
}

const seller_neu_falsch ={
    "label": "Mediamarkt",
    "locations": "threehundred",
    "headquarter": "Suedsee",
    "game": game_id
}
  
import * as update_seller from "./update_seller.json";
import * as update_seller_wrong from "./update_seller_wrong.json";
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

before(async () => {
  init();
  await chai
    .request(app)
    .post("/user/signup")
    .send(login)
    .then(response => {
      expect([422, 201]).to.include(response.status);
    });
  seller_id = await chai
    .request(app)
    .get("/sellers/")
    .then(result => {
      logger.debug("\n");
      logger.debug("Test-Id: " + seller_id);
      return result.body.sellers[0]._id;
    });
});

//Suite fuer Gets
describe("Getting stuff for sellers", () => {
  it("Alle Seller", () => {
    return chai
      .request(app)
      .get("/sellers/")
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.have.keys("count", "sellers");
        let array_body = res.body.sellers;
        expect(array_body).to.be.array();
        expect(array_body).to.have.lengthOf.at.least(2);
        let count = res.body.count;
        expect(array_body).to.have.lengthOf(count);
      });
  });

  it("Findbyid", async () => {
    return chai
      .request(app)
      .get("/sellers/" + seller_id)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys(
          "label",
          "locations",
          "headquarter"
        );
        expect(res.body.id).to.equal(seller_id);
      });
  });

  it("Findbyid mit falscher id", async () => {
    try {
      return await chai
        .request(app)
        .get("/sellers/" + wrong_seller_id)
        .then(res => {
          expect(res.status).to.equal(404);
          expect(res.body).to.contain.keys("message");
          return Promise.reject(new Error("404 not found"));
        });
    } catch (err) {
      logger.error(`Findbyid test Error: ${stringify(err)}`);
    }
  });
});

describe("Mutating stuff", () => {
  it("login", async () => {
    return (token = await chai
      .request(app)
      .post("/user/login")
      .send(login)
      .then(result => {
        expect([422, 201].includes(result.status));
        return result.body.token;
      }));
  });

  it("Neuer Seller", async () => {
    return await chai
      .request(app)
      .post("/sellers/")
      .set("Authorization", `Bearer ${token}`)
      .send(seller_neu)
      .then(res => {
        expect(res.status).to.equal(201);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message", "createdSeller");
      });
  });

  it("Neues Seller mit falschen Daten", async () => {
    try {
      return await chai
        .request(app)
        .post("/sellers/")
        .set("Authorization", `Bearer ${token}`)
        .send(seller_neu_falsch)
        .then(res => {
          expect(res.status).to.equal(422);
          expect(res).to.be.json;
          expect(res.body).to.contain.keys("message");
        });
    } catch (err) {
      logger.error(`New Seller test Error: ${stringify(err)}`);
    }
  });

  it("Seller löschen zu vorhandener ID", async () => {
    return await chai
      .request(app)
      .del("/sellers/" + seller_id)
      .set("Authorization", `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message");
      });
  });

  it("Update seller", async () => {
    seller_id = await chai
      .request(app)
      .get("/sellers/")
      .then(result => {
        logger.debug("\n");
        logger.debug("Test-Id: " + seller_id);
        return result.body.sellers[0]._id;
      });
    return chai
      .request(app)
      .patch("/sellers/" + seller_id)
      .set("Authorization", `Bearer ${token}`)
      .send(update_seller)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message", "request");
      });
  });

  it("Update seller mit nicht existentierender ID", () => {
    try {
      return chai
        .request(app)
        .patch("/sellers/" + wrong_seller_id)
        .set("Authorization", `Bearer ${token}`)
        .send(update_seller)
        .then(res => {
          expect(res.status).to.equal(404);
          expect(res).to.be.json;
          expect(res.body).to.contain.keys("message");
        });
    } catch (err) {
      logger.error(`Update Seller test Error: ${stringify(err)}`);
    }
  });

  it("Update seller mit falschen Daten", () => {
    try {
      return chai
        .request(app)
        .patch("/sellers/" + seller_id)
        .set("Authorization", `Bearer ${token}`)
        .send(update_seller_wrong)
        .then(res => {
          expect(res.status).to.equal(422);
          expect(res).to.be.json;
          expect(res.body).to.contain.keys("message");
        });
    } catch (err) {
      logger.error(`Update Seller test Error: ${stringify(err)}`);
    }
  });
});

after(() => {
  shell.exec("npm run mongo importbackup");
});
