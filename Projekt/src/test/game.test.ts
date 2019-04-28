import * as mocha from "mocha";
import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as spiel_neu from "./spiel_neu.json";
import * as spiel_neu_falsch from "./spiel_neu_falsch.json";
import app from "../App";
import asserArrays = require("chai-arrays");
import * as shell from "shelljs";
import { init } from "./init";
import { logger } from "../utils/logger";
import stringify from "fast-safe-stringify";

chai.use(asserArrays);
chai.use(chaiHttp);
const expect = chai.expect;

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Testdaten oder so
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const game_id = "5cc5cd827fad48e5efb6d438";
const wrong_game_id = "7cc5cd827fad48e5efb6d438";
const game_name = "League of Legends";
const login = {
  email: "test@rest.de",
  password: "qwerty"
};
let token = "";
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
});

//Suite fuer Gets
describe("Getting stuff", () => {
  it("Alle Games", () => {
    chai
      .request(app)
      .get("/games/")
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.have.keys("count", "games");
        let array_body = res.body.games;
        expect(array_body).to.be.array();
        expect(array_body).to.have.lengthOf.at.least(2);
        let count = res.body.count;
        expect(array_body).to.have.lengthOf(count);
      });
  });

  it("Findbyid", () => {
    chai
      .request(app)
      .get("/games/" + game_id)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys(
          "price",
          "name",
          "platforms",
          "delete_request",
          "id"
        );
        expect(res.body.id).to.equal(game_id);
      });
  });

  it("Findbyid mit falscher id", async () => {
    try{
    await chai
      .request(app)
      .get("/games/" + wrong_game_id)
      .then(res => {
        expect(res.status).to.equal(404);
        expect(res.body).to.contain.keys("message");
        return Promise.reject(new Error("404 not found"));
      });
    }catch(err){
      logger.error(`Findbyid test Error: ${stringify(err)}`);
    }
  });

  describe("findbyanything", () => {
    it("Findbyanything", () => {
      it("Name", () => {
        chai
          .request(app)
          .get("/findbyanything/" + game_name)
          .then(res => {
            expect(res.status).to.equal(200);
            expect(res.body).to.contain.keys("name id platforms request");
            expect(res.body.name).to.be.equal(game_name);
          });
      });

      it("Platform", () => {
        chai
          .request(app)
          .get("/findbyanything/" + "PC")
          .then(res => {
            expect(res.status).to.equal(200);
            expect(res.body).to.contain.keys("name id platforms request");
            expect(res.body.platforms).to.include("PC");
          });
      });
      it("ID", () => {
        chai
          .request(app)
          .get("/findbyanything/" + game_id)
          .then(res => {
            expect(res.status).to.equal(200);
            expect(res.body).to.contain.keys("name id platforms request");
            expect(res.body.id).to.be.equal(game_id);
          });
      });

      it("Price", () => {
        chai
          .request(app)
          .get("/findbyanything/" + 30)
          .then(res => {
            expect(res.status).to.equal(200);
            expect(res.body).to.contain.keys("name id platforms request");
            expect(res.body.price).to.be.equal(30);
          });
      });

      it("Findbyanything falscher Param", () => {
        chai
          .request(app)
          .get("/findbyanything/" + "tkkg")
          .then(res => {
            expect(res.status).to.equal(422);
            expect(res.body).to.contain.keys("message");
            expect(res.body.message).to.be.equal(
              "Argument could not be processed"
            );
          });
      });
    });
  });
});

describe("Mutating stuff", () => {
  it("login", async () => {
    token = await chai
      .request(app)
      .post("/user/login")
      .send(login)
      .then(result => {
        expect([422, 201].includes(result.status));
        return result.body.token;
      });
  });

  it("Neues Game", () => {
    chai
      .request(app)
      .post("/games/")
      .set("Authorization", `Bearer ${token}`)
      .send(spiel_neu)
      .then(res => {
        expect(res.status).to.equal(201);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message", "createdGame");
      });
  });

  it("Game löschen zu vorhandener ID", async () => {
    let game = await chai
      .request(app)
      .post("/games/")
      .set("Authorization", `Bearer ${token}`)
      .send(spiel_neu)
      .then(res => {
        return res.body.createdGame._id;
      });
    return chai
      .request(app)
      .del("/games/" + game)
      .set("Authorization", `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message");
      });
  });

  it("Versuchen nicht vorhandenes Game zu löschen", async () => {
    return chai
      .request(app)
      .del("/games/" + "4cc339821b820f1f2dfdfb42")
      .set("Authorization", `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.equal(404);
      });
  });
});

after(() => {
  shell.exec("npm run mongo importbackup");
});
