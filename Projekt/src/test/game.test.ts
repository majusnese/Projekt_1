import * as mocha from "mocha";
import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as spiel_neu from "./spiel_neu.json";
import * as spiel_neu_falsch from "./spiel_neu_falsch.json";
import app from "../App";
import asserArrays = require("chai-arrays");
import * as shell from 'shelljs';
import {init} from './init';

chai.use(asserArrays);
chai.use(chaiHttp);
const expect = chai.expect;

const login = {
  "email": "test@rest.de",
  "password": "qwertz"
}

let token = '';

after(() => {
  shell.exec('npm run mongo import')
});

before((done: MochaDone) => {
  init();
  chai.request(app)
  .post("/user/login")
  .send(login)
  .end((error, response) => {
    if(error){
      return done(error);
    }
    token = response.body.token;
    expect(token).to.not.be.empty;
    done()
  })
})

describe("GET /games/", () => {
  it("Alle Games", async () => {
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
});

describe("POST /games/", () => {
  it("Neues Game",() => {
    chai
      .request(app)
      .post("/games/")
      .set('Authorization', `Bearer ${token}`)
      .send(spiel_neu)
      .then(res => {
        expect(res.status).to.equal(201);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message", "createdGame");
      });
  });
});

describe("POST /games/", () => {
  it("Neues Game mit falschen Daten", () => {
    return chai
      .request(app)
      .post("/games/")
      .set('Authorization', `Bearer ${token}`)
      .send(spiel_neu_falsch)
      .then(res => {
        expect(res.status).to.equal(409);
      });
  });
});

describe("DELETE /games/:id", () => {
  it("Game löschen zu vorhandener ID", async () => {
    let game = await chai
      .request(app)
      .post("/games/")
      .set('Authorization', `Bearer ${token}`)
      .send(spiel_neu)
      .then(res => {
        return res.body.createdGame._id;
      });
    return chai
      .request(app)
      .del("/games/" + game)
      .set('Authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message");
      });
  });
});

describe("DELETE /games/:id", () => {
  it("Versuchen nicht vorhandenes Game zu löschen", async () => {
    return chai
      .request(app)
      .del("/games/" + "4cc339821b820f1f2dfdfb42")
      .set('Authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.status).to.equal(404);
      });
  });
});

describe("GET /games/:id", () => {
  it("Game zu vorhandener ID", async () => {
    let game = await chai
      .request(app)
      .get("/games/")
      .then(res => {
        return res.body.games[0]._id;
      });
    return chai
      .request(app)
      .get("/games/" + game)
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
        expect(res.body.id).to.equal(game);
      });
  });
});

describe("GET /games/:name", () => {
  it('Es existiert ein Game namens "Super Mario Bros."', async () => {
    let game = await chai
      .request(app)
      .post("/games/")
      .set('Authorization', `Bearer ${token}`)
      .send(spiel_neu)
      .then(res => {
        return res.body.createdGame._id;
      });
    return chai
      .request(app)
      .get("/games/" + game)
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
        expect(res.body.id).to.equal(game);
      });
  });
});

describe("GET /games/:name", () => {
  it('Es existiert kein Game mit "COD" im Namen', async () => {
    chai
      .request(app)
      .get(`/games/?name=COD`)
      .then(res => {
        expect(res.status).to.equal(404);
      });
  });
});
