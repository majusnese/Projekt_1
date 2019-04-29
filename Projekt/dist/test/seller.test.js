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
const game_test_1 = require("./game.test");
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
const seller_neu = {
    "label": "Mediamarkt",
    "locations": 333,
    "headquarter": "Suedsee",
    "game": game_test_1.game_id
};
const seller_neu_falsch = {
    "label": "Mediamarkt",
    "locations": "threehundred",
    "headquarter": "Suedsee",
    "game": game_test_1.game_id
};
const update_seller = require("./update_seller.json");
const update_seller_wrong = require("./update_seller_wrong.json");
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
    seller_id = yield chai
        .request(App_1.default)
        .get("/sellers/")
        .then(result => {
        logger_1.logger.debug("\n");
        logger_1.logger.debug("Test-Id: " + seller_id);
        return result.body.sellers[0]._id;
    });
}));
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
            let array_body = res.body.sellers;
            expect(array_body).to.be.array();
            expect(array_body).to.have.lengthOf.at.least(2);
            let count = res.body.count;
            expect(array_body).to.have.lengthOf(count);
        });
    });
    it("Findbyid", () => __awaiter(this, void 0, void 0, function* () {
        return chai
            .request(App_1.default)
            .get("/sellers/" + seller_id)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("label", "locations", "headquarter");
            expect(res.body.id).to.equal(seller_id);
        });
    }));
    it("Findbyid mit falscher id", () => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chai
                .request(App_1.default)
                .get("/sellers/" + wrong_seller_id)
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
    it("Neuer Seller", () => __awaiter(this, void 0, void 0, function* () {
        return yield chai
            .request(App_1.default)
            .post("/sellers/")
            .set("Authorization", `Bearer ${token}`)
            .send(seller_neu)
            .then(res => {
            expect(res.status).to.equal(201);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message", "createdSeller");
        });
    }));
    it("Neues Seller mit falschen Daten", () => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chai
                .request(App_1.default)
                .post("/sellers/")
                .set("Authorization", `Bearer ${token}`)
                .send(seller_neu_falsch)
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
    it("Seller löschen zu vorhandener ID", () => __awaiter(this, void 0, void 0, function* () {
        return yield chai
            .request(App_1.default)
            .del("/sellers/" + seller_id)
            .set("Authorization", `Bearer ${token}`)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message");
        });
    }));
    it("Update seller", () => __awaiter(this, void 0, void 0, function* () {
        seller_id = yield chai
            .request(App_1.default)
            .get("/sellers/")
            .then(result => {
            logger_1.logger.debug("\n");
            logger_1.logger.debug("Test-Id: " + seller_id);
            return result.body.sellers[0]._id;
        });
        return chai
            .request(App_1.default)
            .patch("/sellers/" + seller_id)
            .set("Authorization", `Bearer ${token}`)
            .send(update_seller)
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
                .patch("/sellers/" + wrong_seller_id)
                .set("Authorization", `Bearer ${token}`)
                .send(update_seller)
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
                .patch("/sellers/" + seller_id)
                .set("Authorization", `Bearer ${token}`)
                .send(update_seller_wrong)
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
after(() => {
    shell.exec("npm run mongo importbackup");
});
