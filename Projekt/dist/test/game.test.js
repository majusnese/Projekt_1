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
let game_id;
const wrong_game_id = "7cc5cd827fad48e5efb6d438";
const game_name = "Overwatch";
const login = {
    email: "test@rest.de",
    password: "qwerty"
};
let token = "";
const spiel_neu = require("./spiel_neu.json");
const spiel_neu_falsch = require("./spiel_neu_falsch.json");
const update_game = require("./update_game.json");
const update_game_wrong = require("./update_game_wrong.json");
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
    game_id = yield chai
        .request(App_1.default)
        .get("/games/")
        .then(result => {
        logger_1.logger.debug("\n");
        logger_1.logger.debug("Test-Id: " + game_id);
        return result.body.games[0]._id;
    });
}));
//Suite fuer Gets
describe("Getting stuff for games", () => {
    it("Alle Games", () => {
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
    });
    it("Findbyid", () => __awaiter(this, void 0, void 0, function* () {
        return chai
            .request(App_1.default)
            .get("/games/" + game_id)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("price", "name", "platforms", "delete_request", "id");
            expect(res.body.id).to.equal(game_id);
        });
    }));
    it("Findbyid mit falscher id", () => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chai
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
        it("Name", () => {
            return chai
                .request(App_1.default)
                .get("/games/findbyanything/" + game_name)
                .then(res => {
                expect(res.status).to.equal(200);
                expect(res.body.games[0].name).to.be.equal(game_name);
            });
        });
        it("Platform", () => {
            return chai
                .request(App_1.default)
                .get("/games/findbyanything/" + "PC")
                .then(res => {
                expect(res.status).to.equal(200);
                expect(res.body.games[0].platforms).to.include("PC");
            });
        });
        it("ID", () => {
            return chai
                .request(App_1.default)
                .get("/games/findbyanything/" + game_id)
                .then(res => {
                expect(res.status).to.equal(200);
                expect(res.body.games[0]._id).to.be.equal(game_id);
            });
        });
        it("Price", () => {
            return chai
                .request(App_1.default)
                .get("/games/findbyanything/" + 30)
                .then(res => {
                expect(res.status).to.equal(200);
                expect(res.body.games[0].price).to.be.equal(30);
            });
        });
        it("Findbyanything falscher Param", () => {
            return chai
                .request(App_1.default)
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
    it("login", () => __awaiter(this, void 0, void 0, function* () {
        return (token = yield chai
            .request(App_1.default)
            .post("/user/login")
            .send(login)
            .then(result => {
            expect([422, 201].includes(result.status));
            return result.body.token;
        }));
    }));
    it("Neues Game", () => {
        return chai
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
    it("Neues Game mit falschen Daten", () => {
        try {
            return chai
                .request(App_1.default)
                .post("/games/")
                .set("Authorization", `Bearer ${token}`)
                .send(spiel_neu_falsch)
                .then(res => {
                expect(res.status).to.equal(422);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys("message");
            });
        }
        catch (err) {
            logger_1.logger.error(`New Game test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    });
    it("Game löschen zu vorhandener ID", () => __awaiter(this, void 0, void 0, function* () {
        return chai
            .request(App_1.default)
            .del("/games/" + game_id)
            .set("Authorization", `Bearer ${token}`)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message");
        });
    }));
    it("Update game", () => __awaiter(this, void 0, void 0, function* () {
        game_id = yield chai
            .request(App_1.default)
            .get("/games/")
            .then(result => {
            logger_1.logger.debug("\n");
            logger_1.logger.debug("Test-Id: " + game_id);
            return result.body.games[0]._id;
        });
        return chai
            .request(App_1.default)
            .patch("/games/" + game_id)
            .set("Authorization", `Bearer ${token}`)
            .send(update_game)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message", "request");
        });
    }));
    it("Update game mit nicht existentierender ID", () => {
        try {
            return chai
                .request(App_1.default)
                .patch("/games/" + wrong_game_id)
                .set("Authorization", `Bearer ${token}`)
                .send(update_game)
                .then(res => {
                expect(res.status).to.equal(404);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys("message");
            });
        }
        catch (err) {
            logger_1.logger.error(`Update Game test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    });
    it("Update game mit falschen Daten", () => {
        try {
            return chai
                .request(App_1.default)
                .patch("/games/" + game_id)
                .set("Authorization", `Bearer ${token}`)
                .send(update_game_wrong)
                .then(res => {
                expect(res.status).to.equal(422);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys("message");
            });
        }
        catch (err) {
            logger_1.logger.error(`Update Game test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    });
});
after(() => {
    shell.exec("npm run mongo importbackup");
});
