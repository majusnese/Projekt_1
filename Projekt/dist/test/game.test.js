"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiHttp = require("chai-http");
const spiel_neu = require("./spiel_neu.json");
const App_1 = require("../App");
const asserArrays = require("chai-arrays");
const shell = require("shelljs");
const init_1 = require("./init");
chai.use(asserArrays);
chai.use(chaiHttp);
const expect = chai.expect;
const login = {
    email: "test@rest.de",
    password: "qwerty"
};
let token = "";
after(() => {
    shell.exec("npm run mongo importbackup");
});
before((done) => {
    init_1.init();
    chai
        .request(App_1.default)
        .post("/user/signup")
        .send(login)
        .then(response => {
        expect([422, 201]).to.include(response.status);
    });
    chai
        .request(App_1.default)
        .post("/user/login")
        .send(login)
        .end((error, response) => {
        if (error) {
            return done(error);
        }
        token = response.body.token;
        expect(token).to.not.be.empty;
        done();
    });
});
describe("Getting stuff", () => {
    it("Alle Games", () => __awaiter(this, void 0, void 0, function* () {
        return chai
            .request(App_1.default)
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
    }));
    it("Game zu vorhandener ID", () => __awaiter(this, void 0, void 0, function* () {
        let game = yield chai
            .request(App_1.default)
            .get("/games/")
            .then(res => {
            return res.body.games[0]._id;
        });
        return chai
            .request(App_1.default)
            .get("/games/" + game)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("price", "name", "platforms", "delete_request", "id");
            expect(res.body.id).to.equal(game);
        });
    }));
    it('Es existiert ein Game namens "Super Mario Bros."', () => __awaiter(this, void 0, void 0, function* () {
        let game = yield chai
            .request(App_1.default)
            .post("/games/")
            .set("Authorization", `Bearer ${token}`)
            .send(spiel_neu)
            .then(res => {
            return res.body.createdGame._id;
        });
        return chai
            .request(App_1.default)
            .get("/games/" + game)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("price", "name", "platforms", "delete_request", "id");
            expect(res.body.id).to.equal(game);
        });
    }));
    it('Es existiert kein Game mit "COD" im Namen', () => __awaiter(this, void 0, void 0, function* () {
        chai
            .request(App_1.default)
            .get(`/games/?name=COD`)
            .then(res => {
            expect(res.status).to.equal(404);
        });
    }));
});
describe("POST /games/", () => {
    it("Neues Game", () => {
        chai
            .request(App_1.default)
            .post("/games/")
            .set("Authorization", `Bearer ${token}`)
            .send(spiel_neu)
            .then(res => {
            expect(res.status).to.equal(201);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message", "createdGame");
        });
    });
});
describe("DELETE /games/:id", () => {
    it("Game löschen zu vorhandener ID", () => __awaiter(this, void 0, void 0, function* () {
        let game = yield chai
            .request(App_1.default)
            .post("/games/")
            .set("Authorization", `Bearer ${token}`)
            .send(spiel_neu)
            .then(res => {
            return res.body.createdGame._id;
        });
        return chai
            .request(App_1.default)
            .del("/games/" + game)
            .set("Authorization", `Bearer ${token}`)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message");
        });
    }));
});
describe("DELETE /games/:id", () => {
    it("Versuchen nicht vorhandenes Game zu löschen", () => __awaiter(this, void 0, void 0, function* () {
        return chai
            .request(App_1.default)
            .del("/games/" + "4cc339821b820f1f2dfdfb42")
            .set("Authorization", `Bearer ${token}`)
            .then(res => {
            expect(res.status).to.equal(404);
        });
    }));
});
