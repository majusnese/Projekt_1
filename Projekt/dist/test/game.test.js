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
const spiel_neu = require("./spiel_neu1.json");
const App_1 = require("../App");
const asserArrays = require("chai-arrays");
chai.use(asserArrays);
chai.use(chaiHttp);
const expect = chai.expect;
describe('GET /games', () => {
    it('responds with JSON and contains an array with at least one entry', () => __awaiter(this, void 0, void 0, function* () {
        return chai.request(App_1.default).get('/games')
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
    }));
});
describe('POST /games/', () => {
    it('POST working as intended', () => {
        return chai.request(App_1.default).post('/games/')
            .send(spiel_neu)
            .then(res => {
            expect(res.status).to.equal(201);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message", "createdGame");
        });
    });
});
describe('DELETE /games/:id', () => {
    it('DELETE working as intended', () => __awaiter(this, void 0, void 0, function* () {
        let game = yield chai.request(App_1.default).post('/games/')
            .send(spiel_neu)
            .then(res => {
            return res.body.createdGame._id;
        });
        return chai.request(App_1.default).del('/games/' + game)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("message");
        });
    }));
});
describe('GET /games/:id', () => {
    it('findbyid working as intended', () => __awaiter(this, void 0, void 0, function* () {
        let game = yield chai.request(App_1.default).get('/games/')
            .then(res => {
            return res.body.games[0]._id;
        });
        return chai.request(App_1.default).get('/games/' + game)
            .then(res => {
            expect(res.status).to.equal(200);
            expect(res).to.be.json;
            expect(res.body).to.contain.keys("price", "name", "platforms", "delete_request", "id");
            expect(res.body.id).to.equal(game);
        });
    }));
});
