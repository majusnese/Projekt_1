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
const logger_1 = require("../utils/logger");
const fast_safe_stringify_1 = require("fast-safe-stringify");
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
before(() => __awaiter(this, void 0, void 0, function* () {
    init_1.init();
    yield chai
        .request(App_1.default)
        .post("/user/signup")
        .send(login)
        .then(response => {
        expect([422, 201]).to.include(response.status);
    });
}));
//Suite fuer Gets
describe("Getting stuff", () => {
    it("Alle Games", () => {
        chai
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
    });
    it("Findbyid", () => {
        chai
            .request(App_1.default)
            .get("/games/" + game_id)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("price", "name", "platforms", "delete_request", "id");
            expect(res.body.id).to.equal(game_id);
        });
    });
    it("Findbyid mit falscher id", () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield chai
                .request(App_1.default)
                .get("/games/" + wrong_game_id)
                .then(res => {
                expect(res.status).to.equal(404);
                expect(res.body).to.contain.keys("message");
                return Promise.reject(new Error("404 not found"));
            });
        }
        catch (err) {
            logger_1.logger.error(`Findbyid test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    }));
    describe("findbyanything", () => {
        it("Findbyanything", () => {
            it("Name", () => {
                chai
                    .request(App_1.default)
                    .get("/findbyanything/" + game_name)
                    .then(res => {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.contain.keys("name id platforms request");
                    expect(res.body.name).to.be.equal(game_name);
                });
            });
            it("Platform", () => {
                chai
                    .request(App_1.default)
                    .get("/findbyanything/" + "PC")
                    .then(res => {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.contain.keys("name id platforms request");
                    expect(res.body.platforms).to.include("PC");
                });
            });
            it("ID", () => {
                chai
                    .request(App_1.default)
                    .get("/findbyanything/" + game_id)
                    .then(res => {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.contain.keys("name id platforms request");
                    expect(res.body.id).to.be.equal(game_id);
                });
            });
            it("Price", () => {
                chai
                    .request(App_1.default)
                    .get("/findbyanything/" + 30)
                    .then(res => {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.contain.keys("name id platforms request");
                    expect(res.body.price).to.be.equal(30);
                });
            });
            it("Findbyanything falscher Param", () => {
                chai
                    .request(App_1.default)
                    .get("/findbyanything/" + "tkkg")
                    .then(res => {
                    expect(res.status).to.equal(422);
                    expect(res.body).to.contain.keys("message");
                    expect(res.body.message).to.be.equal("Argument could not be processed");
                });
            });
        });
    });
});
describe("Mutating stuff", () => {
    it("login", () => __awaiter(this, void 0, void 0, function* () {
        token = yield chai
            .request(App_1.default)
            .post("/user/login")
            .send(login)
            .then(result => {
            expect([422, 201].includes(result.status));
            return result.body.token;
        });
    }));
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
after(() => {
    shell.exec("npm run mongo importbackup");
});
