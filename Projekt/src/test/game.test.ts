import * as mocha from "mocha";
import * as chai from "chai";
import chaiHttp = require("chai-http");
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
let game_id;
const wrong_game_id = "7cc5cd827fad48e5efb6d438";
const game_name = "Overwatch";
const login = {
  email: "test@rest.de",
  password: "qwerty"
};
let token = "";

import * as spiel_neu from "./spiel_neu.json";
import * as spiel_neu_falsch from "./spiel_neu_falsch.json";
import * as update_game from "./update_game.json";
import * as update_game_wrong from "./update_game_wrong.json";
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
  game_id = await chai
    .request(app)
    .get("/games/")
    .then(result => {
      logger.debug("\n");
      logger.debug("Test-Id: " + game_id);
      return result.body.games[0]._id;
    });
});

//Suite fuer Gets
describe("Getting stuff for games", () => {
  it("Alle Games", () => {
    return chai
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

  it("Findbyid", async () => {
    return chai
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
    try {
      return await chai
        .request(app)
        .get("/games/" + wrong_game_id)
        .then(res => {
          expect(res.status).to.equal(404);
          expect(res.body).to.contain.keys("message");
          return Promise.reject(new Error("404 not found"));
        });
    } catch (err) {
      logger.error(`Findbyid test Error: ${stringify(err)}`);
    }
  });

  describe("findbyanything", () => {
    it("Name", () => {
      return chai
        .request(app)
        .get("/games/findbyanything/" + game_name)
        .then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.games[0].name).to.be.equal(game_name);
        });
    });

    it("Platform", () => {
      return chai
        .request(app)
        .get("/games/findbyanything/" + "PC")
        .then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.games[0].platforms).to.include("PC");
        });
    });
    it("ID", () => {
      return chai
        .request(app)
        .get("/games/findbyanything/" + game_id)
        .then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.games[0]._id).to.be.equal(game_id);
        });
    });

    it("Price", () => {
      return chai
        .request(app)
        .get("/games/findbyanything/" + 30)
        .then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.games[0].price).to.be.equal(30);
        });
    });

    it("Findbyanything falscher Param", () => {
      return chai
        .request(app)
        .get("/games/findbyanything/" + "tkkg")
        .then(res => {
          expect(res.status).to.equal(400);
          expect(res.body).to.contain.keys("message");
          expect(res.body.message).to.be.equal("There are no entries");
        });
    });
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

  it("Neues Game", () => {
    return chai
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

  it("Neues Game mit falschen Daten", () => {
    try {
      return chai
        .request(app)
        .post("/games/")
        .set("Authorization", `Bearer ${token}`)
        .send(spiel_neu_falsch)
        .then(res => {
          expect(res.status).to.equal(422);
          expect(res).to.be.json;
          expect(res.body).to.contain.keys("message");
        });
    } catch (err) {
      logger.error(`New Game test Error: ${stringify(err)}`);
    }
  });

  it("Game löschen zu vorhandener ID", async () => {
    return chai
      .request(app)
      .del("/games/" + game_id)
      .set("Authorization", `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message");
      });
  });

  it("Update game", async () => {
    game_id = await chai
      .request(app)
      .get("/games/")
      .then(result => {
        logger.debug("\n");
        logger.debug("Test-Id: " + game_id);
        return result.body.games[0]._id;
      });
    return chai
      .request(app)
      .patch("/games/" + game_id)
      .set("Authorization", `Bearer ${token}`)
      .send(update_game)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message", "request");
      });
  });

  it("Update game mit nicht existentierender ID", () => {
    try {
      return chai
        .request(app)
        .patch("/games/" + wrong_game_id)
        .set("Authorization", `Bearer ${token}`)
        .send(update_game)
        .then(res => {
          expect(res.status).to.equal(404);
          expect(res).to.be.json;
          expect(res.body).to.contain.keys("message");
        });
    } catch (err) {
      logger.error(`Update Game test Error: ${stringify(err)}`);
    }
  });

  it("Update game mit falschen Daten", () => {
    try {
      return chai
        .request(app)
        .patch("/games/" + game_id)
        .set("Authorization", `Bearer ${token}`)
        .send(update_game_wrong)
        .then(res => {
          expect(res.status).to.equal(422);
          expect(res).to.be.json;
          expect(res.body).to.contain.keys("message");
        });
    } catch (err) {
      logger.error(`Update Game test Error: ${stringify(err)}`);
    }
  });
});

after(() => {
  shell.exec("npm run mongo importbackup");
});
