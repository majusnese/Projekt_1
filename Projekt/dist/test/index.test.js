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
let GameId;
const WrongGameId = "7cc5cd827fad48e5efb6d438";
const GameName = "Overwatch";
const login = {
    email: "test@rest.de",
    password: "qwerty"
};
const LoginFalsch = {
    email: "test@rest.de",
    password: "abcde"
};
let token = "";
let SellerId;
const WrongSellerId = "7cc5cd827fad48e5efb6d432";
let UserId;
const UpdateSeller = require("./daten/update_seller.json");
const UpdateSellerWrong = require("./daten/update_seller_wrong.json");
const SpielNeu = require("./daten/spiel_neu.json");
const SpielNeuFalsch = require("./daten/spiel_neu_falsch.json");
const UpdateGame = require("./daten/update_game.json");
const UpdateGameWrong = require("./daten/update_game_wrong.json");
const SignupFalsch = require("./daten/signup_falsch.json");
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
before(() => __awaiter(this, void 0, void 0, function* () {
    yield init_1.init();
    yield chai
        .request(App_1.default)
        .post("/user/signup")
        .send(login)
        .then(response => {
        return expect([422, 201]).to.include(response.status);
    });
    GameId = yield chai
        .request(App_1.default)
        .get("/games/")
        .then(result => {
        logger_1.logger.debug("\n");
        logger_1.logger.debug("Test-Id: " + GameId);
        return result.body.games[0]._id;
    });
    SellerId = yield chai
        .request(App_1.default)
        .get("/sellers/")
        .then(result => {
        logger_1.logger.debug("\n");
        logger_1.logger.debug("Test-Id: " + SellerId);
        return result.body.sellers[0]._id;
    });
}));
describe("Mutating games", () => {
    it("login", () => __awaiter(this, void 0, void 0, function* () {
        return yield chai
            .request(App_1.default)
            .post("/user/login")
            .send(login)
            .then(result => {
            expect([422, 201].includes(result.status));
            token = result.body.token;
            UserId = result.body.id;
        });
    }));
    it("login mit falschen daten", () => __awaiter(this, void 0, void 0, function* () {
        return chai
            .request(App_1.default)
            .post("/user/login")
            .send(LoginFalsch)
            .then(result => {
            expect(result.status).to.be.equal(401);
        });
    }));
    it("signup mit falschen daten", () => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chai
                .request(App_1.default)
                .post("/user/signup")
                .set("Authorization", `Bearer ${token}`)
                .send(SignupFalsch)
                .then(res => {
                expect(res.status).to.equal(422);
                expect(res).to.be.json;
            });
        }
        catch (err) {
            logger_1.logger.error(`Signup falsch test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    }));
    it("Neues Game", () => __awaiter(this, void 0, void 0, function* () {
        return yield chai
            .request(App_1.default)
            .post("/games/")
            .set("Authorization", `Bearer ${token}`)
            .send(SpielNeu)
            .then(res => {
            expect(res.status).to.equal(201);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message", "createdGame");
        });
    }));
    it("Neues Game mit falschen Daten", () => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chai
                .request(App_1.default)
                .post("/games/")
                .set("Authorization", `Bearer ${token}`)
                .send(SpielNeuFalsch)
                .then(res => {
                expect(res.status).to.equal(422);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys("message");
            });
        }
        catch (err) {
            logger_1.logger.error(`New Game test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    }));
    it("Update game", () => __awaiter(this, void 0, void 0, function* () {
        return yield chai
            .request(App_1.default)
            .patch("/games/" + GameId)
            .set("Authorization", `Bearer ${token}`)
            .send(UpdateGame)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message", "request");
        });
    }));
    it("Update game mit nicht existentierender ID", () => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chai
                .request(App_1.default)
                .patch("/games/" + WrongGameId)
                .set("Authorization", `Bearer ${token}`)
                .send(UpdateGame)
                .then(res => {
                expect(res.status).to.equal(404);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys("message");
            });
        }
        catch (err) {
            logger_1.logger.error(`Update Game test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    }));
    it("Update game mit falschen Daten", () => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chai
                .request(App_1.default)
                .patch("/games/" + GameId)
                .set("Authorization", `Bearer ${token}`)
                .send(UpdateGameWrong)
                .then(res => {
                expect(res.status).to.equal(422);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys("message");
            });
        }
        catch (err) {
            logger_1.logger.error(`Update Game test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    }));
});
//Suite fuer Gets
describe("Getting stuff for sellers", () => {
    it("Alle Seller", () => {
        return chai
            .request(App_1.default)
            .get("/sellers/")
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.have.keys("count", "sellers");
            let ArrayBody = res.body.sellers;
            expect(ArrayBody).to.be.array();
            expect(ArrayBody).to.have.lengthOf.at.least(2);
            let count = res.body.count;
            expect(ArrayBody).to.have.lengthOf(count);
        });
    });
    it("Findbyid", () => __awaiter(this, void 0, void 0, function* () {
        return chai
            .request(App_1.default)
            .get("/sellers/" + SellerId)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("label", "locations", "headquarter");
            expect(res.body.id).to.equal(SellerId);
        });
    }));
    it("Findbyid mit falscher id", () => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chai
                .request(App_1.default)
                .get("/sellers/" + WrongSellerId)
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
});
describe("Mutating seller", () => {
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
    it("Neuer Seller", () => __awaiter(this, void 0, void 0, function* () {
        const SellerNeu = {
            label: "Mediamarkt",
            locations: 333,
            headquarter: "Suedsee",
            game: GameId
        };
        return yield chai
            .request(App_1.default)
            .post("/sellers/")
            .set("Authorization", `Bearer ${token}`)
            .send(SellerNeu)
            .then(res => {
            expect(res.status).to.equal(201);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message", "createdSeller");
        });
    }));
    it("Neues Seller mit falschen Daten", () => __awaiter(this, void 0, void 0, function* () {
        const SellerNeuFalsch = {
            label: "Mediamarkt",
            locations: "threehundred",
            headquarter: "Suedsee",
            game: GameId
        };
        try {
            return yield chai
                .request(App_1.default)
                .post("/sellers/")
                .set("Authorization", `Bearer ${token}`)
                .send(SellerNeuFalsch)
                .then(res => {
                expect(res.status).to.equal(422);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys("message");
            });
        }
        catch (err) {
            logger_1.logger.error(`New Seller test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    }));
    it("Neues Seller mít nicht existentem game", () => __awaiter(this, void 0, void 0, function* () {
        const SellerNeuFalsch = {
            label: "Mediamarkt",
            locations: 300,
            headquarter: "Suedsee",
            game: WrongGameId
        };
        try {
            return yield chai
                .request(App_1.default)
                .post("/sellers/")
                .set("Authorization", `Bearer ${token}`)
                .send(SellerNeuFalsch)
                .then(res => {
                expect(res.status).to.equal(404);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys("message");
                expect(res.body.message).to.be.equal("You provided unprocessable Data");
            });
        }
        catch (err) {
            logger_1.logger.error(`New Seller test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    }));
    it("Update seller", () => __awaiter(this, void 0, void 0, function* () {
        return chai
            .request(App_1.default)
            .patch("/sellers/" + SellerId)
            .set("Authorization", `Bearer ${token}`)
            .send(UpdateSeller)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message", "request");
        });
    }));
    it("Update seller mit nicht existentierender ID", () => {
        try {
            return chai
                .request(App_1.default)
                .patch("/sellers/" + WrongSellerId)
                .set("Authorization", `Bearer ${token}`)
                .send(UpdateSeller)
                .then(res => {
                expect(res.status).to.equal(404);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys("message");
            });
        }
        catch (err) {
            logger_1.logger.error(`Update Seller test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    });
    it("Update seller mit falschen Daten", () => {
        try {
            return chai
                .request(App_1.default)
                .patch("/sellers/" + SellerId)
                .set("Authorization", `Bearer ${token}`)
                .send(UpdateSellerWrong)
                .then(res => {
                expect(res.status).to.equal(422);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys("message");
            });
        }
        catch (err) {
            logger_1.logger.error(`Update Seller test Error: ${fast_safe_stringify_1.default(err)}`);
        }
    });
});
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
            let ArrayBody = res.body.games;
            expect(ArrayBody).to.be.array();
            expect(ArrayBody).to.have.lengthOf.at.least(2);
            let count = res.body.count;
            expect(ArrayBody).to.have.lengthOf(count);
        });
    });
    it("Findbyid", () => __awaiter(this, void 0, void 0, function* () {
        return chai
            .request(App_1.default)
            .get("/games/" + GameId)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("price", "name", "platforms", "deleteRequest", "id");
            expect(res.body.id).to.equal(GameId);
        });
    }));
    it("Findbyid mit falscher id", () => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chai
                .request(App_1.default)
                .get("/games/" + WrongGameId)
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
                .get("/games/findbyanything/" + GameName)
                .then(res => {
                expect(res.status).to.equal(200);
                expect(res.body.games[0].name).to.be.equal(GameName);
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
                .get("/games/findbyanything/" + GameId)
                .then(res => {
                expect(res.status).to.equal(200);
                expect(res.body.games[0]._id).to.be.equal(GameId);
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
                expect(res.status).to.equal(404);
                expect(res.body).to.contain.keys("message");
                expect(res.body.message).to.be.equal("There are no entries");
            });
        });
    });
});
describe("Deleting", () => {
    it("Seller löschen zu vorhandener ID", () => __awaiter(this, void 0, void 0, function* () {
        return yield chai
            .request(App_1.default)
            .del("/sellers/" + SellerId)
            .set("Authorization", `Bearer ${token}`)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message");
        });
    }));
    it("Game löschen zu vorhandener ID", () => __awaiter(this, void 0, void 0, function* () {
        return chai
            .request(App_1.default)
            .del("/games/" + GameId)
            .set("Authorization", `Bearer ${token}`)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message");
        });
    }));
    it("User löschen zu vorhandener ID", () => __awaiter(this, void 0, void 0, function* () {
        return yield chai
            .request(App_1.default)
            .del("/user/" + UserId)
            .set("Authorization", `Bearer ${token}`)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message");
        });
    }));
});
after(() => {
    shell.exec("npm run mongo importbackup");
});
