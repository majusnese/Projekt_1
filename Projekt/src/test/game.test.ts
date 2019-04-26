import * as mocha from "mocha";
import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as spiel_neu from "./spiel_neu1.json";
import app from "../App";
import asserArrays = require("chai-arrays");

chai.use(asserArrays);
chai.use(chaiHttp);
const expect = chai.expect;

describe("GET /games", () => {
  it("responds with JSON and contains an array with at least one entry", async () => {
    return chai
      .request(app)
      .get("/games")
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.have.keys("count", "games");
        let array_body = res.body.games;
        expect(array_body).to.be.array();
        expect(array_body).to.have.lengthOf.at.least(1);
        let count = res.body.count;
        expect(array_body).to.have.lengthOf(count);
      });
  });
});

describe("POST /games/", () => {
  it("POST working as intended", () => {
    return chai
      .request(app)
      .post("/games/")
      .send(spiel_neu)
      .then(res => {
        expect(res.status).to.equal(201);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message", "createdGame");
      });
  });
});

describe("DELETE /games/:id", () => {
  it("DELETE working as intended", async () => {
    let game = await chai
      .request(app)
      .post("/games/")
      .send(spiel_neu)
      .then(res => {
        return res.body.createdGame._id;
      });
    return chai
      .request(app)
      .del("/games/" + game)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys("message");
      });
  });
});

describe("GET /games/:id", () => {
  it("findbyid working as intended", async () => {
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
