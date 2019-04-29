import * as chai from 'chai';
import chaiHttp = require('chai-http');
import app from '../App';
import asserArrays = require('chai-arrays');
import * as shell from 'shelljs';
import { init } from './init';
import { logger } from '../utils/logger';
import stringify from 'fast-safe-stringify';

chai.use(asserArrays);
chai.use(chaiHttp);
const expect = chai.expect;

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Testdaten oder so
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let GameId;
const WrongGameId = '7cc5cd827fad48e5efb6d438';
const GameName = 'Overwatch';
const login = {
    email: 'test@rest.de',
    password: 'qwerty',
};

const LoginFalsch = {
    email: 'test@rest.de',
    password: 'abcde',
};

let token = '';
let SellerId;
const WrongSellerId = '7cc5cd827fad48e5efb6d432';

let UserId;

import * as UpdateSeller from './update_seller.json';
import * as UpdateSellerWrong from './update_seller_wrong.json';
import * as SpielNeu from './spiel_neu.json';
import * as SpielNeuFalsch from './spiel_neu_falsch.json';
import * as UpdateGame from './update_game.json';
import * as UpdateGameWrong from './update_game_wrong.json';
import * as SignupFalsch from './signup_falsch.json';

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

before(async () => {
    await init();
    await chai
        .request(app)
        .post('/user/signup')
        .send(login)
        .then(response => {
            return expect([422, 201]).to.include(response.status);
        });
    GameId = await chai
        .request(app)
        .get('/games/')
        .then(result => {
            logger.debug('\n');
            logger.debug('Test-Id: ' + GameId);
            return result.body.games[0]._id;
        });
    SellerId = await chai
        .request(app)
        .get('/sellers/')
        .then(result => {
            logger.debug('\n');
            logger.debug('Test-Id: ' + SellerId);
            return result.body.sellers[0]._id;
        });
});

describe('Mutating stuff', () => {
    it('login', async () => {
        return await chai
            .request(app)
            .post('/user/login')
            .send(login)
            .then(result => {
                expect([422, 201].includes(result.status));
                token = result.body.token;
                UserId = result.body.id;
            });
    });

    it('login mit falschen daten', async () => {
        return chai
            .request(app)
            .post('/user/login')
            .send(LoginFalsch)
            .then(result => {
                expect(result.status).to.be.equal(401);
            });
    });

    it('signup mit falschen daten', async () => {
        try {
            return await chai
                .request(app)
                .post('/user/signup')
                .set('Authorization', `Bearer ${token}`)
                .send(SignupFalsch)
                .then(res => {
                    expect(res.status).to.equal(422);
                    expect(res).to.be.json;
                });
        } catch (err) {
            logger.error(`Signup falsch test Error: ${stringify(err)}`);
        }
    });

    it('Neues Game', async () => {
        return await chai
            .request(app)
            .post('/games/')
            .set('Authorization', `Bearer ${token}`)
            .send(SpielNeu)
            .then(res => {
                expect(res.status).to.equal(201);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys('message', 'createdGame');
            });
    });

    it('Neues Game mit falschen Daten', async () => {
        try {
            return await chai
                .request(app)
                .post('/games/')
                .set('Authorization', `Bearer ${token}`)
                .send(SpielNeuFalsch)
                .then(res => {
                    expect(res.status).to.equal(422);
                    expect(res).to.be.json;
                    expect(res.body).to.contain.keys('message');
                });
        } catch (err) {
            logger.error(`New Game test Error: ${stringify(err)}`);
        }
    });

    it('Update game', async () => {
        return await chai
            .request(app)
            .patch('/games/' + GameId)
            .set('Authorization', `Bearer ${token}`)
            .send(UpdateGame)
            .then(res => {
                expect(res.status).to.equal(200);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys('message', 'request');
            });
    });

    it('Update game mit nicht existentierender ID', async () => {
        try {
            return await chai
                .request(app)
                .patch('/games/' + WrongGameId)
                .set('Authorization', `Bearer ${token}`)
                .send(UpdateGame)
                .then(res => {
                    expect(res.status).to.equal(404);
                    expect(res).to.be.json;
                    expect(res.body).to.contain.keys('message');
                });
        } catch (err) {
            logger.error(`Update Game test Error: ${stringify(err)}`);
        }
    });

    it('Update game mit falschen Daten', async () => {
        try {
            return await chai
                .request(app)
                .patch('/games/' + GameId)
                .set('Authorization', `Bearer ${token}`)
                .send(UpdateGameWrong)
                .then(res => {
                    expect(res.status).to.equal(422);
                    expect(res).to.be.json;
                    expect(res.body).to.contain.keys('message');
                });
        } catch (err) {
            logger.error(`Update Game test Error: ${stringify(err)}`);
        }
    });
});

//Suite fuer Gets
describe('Getting stuff for sellers', () => {
    it('Alle Seller', () => {
        return chai
            .request(app)
            .get('/sellers/')
            .then(res => {
                expect(res.status).to.equal(200);
                expect(res).to.be.json;
                expect(res.body).to.have.keys('count', 'sellers');
                let ArrayBody = res.body.sellers;
                expect(ArrayBody).to.be.array();
                expect(ArrayBody).to.have.lengthOf.at.least(2);
                let count = res.body.count;
                expect(ArrayBody).to.have.lengthOf(count);
            });
    });

    it('Alle Seller', () => {
        return chai
            .request(app)
            .get('/sellers/')
            .then(res => {
                expect(res.status).to.equal(200);
                expect(res).to.be.json;
                expect(res.body).to.have.keys('count', 'sellers');
                let ArrayBody = res.body.sellers;
                expect(ArrayBody).to.be.array();
                expect(ArrayBody).to.have.lengthOf.at.least(2);
                let count = res.body.count;
                expect(ArrayBody).to.have.lengthOf(count);
            });
    });

    it('Findbyid', async () => {
        return chai
            .request(app)
            .get('/sellers/' + SellerId)
            .then(res => {
                expect(res.status).to.equal(200);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys('label', 'locations', 'headquarter');
                expect(res.body.id).to.equal(SellerId);
            });
    });

    it('Findbyid mit falscher id', async () => {
        try {
            return await chai
                .request(app)
                .get('/sellers/' + WrongSellerId)
                .then(res => {
                    expect(res.status).to.equal(404);
                    expect(res.body).to.contain.keys('message');
                    return Promise.reject(new Error('404 not found'));
                });
        } catch (err) {
            logger.error(`Findbyid test Error: ${stringify(err)}`);
        }
    });
});

describe('Mutating stuff', () => {
    it('login', async () => {
        return (token = await chai
            .request(app)
            .post('/user/login')
            .send(login)
            .then(result => {
                expect([422, 201].includes(result.status));
                return result.body.token;
            }));
    });

    it('Neuer Seller', async () => {
        const SellerNeu = {
            label: 'Mediamarkt',
            locations: 333,
            headquarter: 'Suedsee',
            game: GameId,
        };
        return await chai
            .request(app)
            .post('/sellers/')
            .set('Authorization', `Bearer ${token}`)
            .send(SellerNeu)
            .then(res => {
                expect(res.status).to.equal(201);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys('message', 'createdSeller');
            });
    });

    it('Neues Seller mit falschen Daten', async () => {
        const SellerNeuFalsch = {
            label: 'Mediamarkt',
            locations: 'threehundred',
            headquarter: 'Suedsee',
            game: GameId,
        };
        try {
            return await chai
                .request(app)
                .post('/sellers/')
                .set('Authorization', `Bearer ${token}`)
                .send(SellerNeuFalsch)
                .then(res => {
                    expect(res.status).to.equal(422);
                    expect(res).to.be.json;
                    expect(res.body).to.contain.keys('message');
                });
        } catch (err) {
            logger.error(`New Seller test Error: ${stringify(err)}`);
        }
    });

    it('Update seller', async () => {
        return chai
            .request(app)
            .patch('/sellers/' + SellerId)
            .set('Authorization', `Bearer ${token}`)
            .send(UpdateSeller)
            .then(res => {
                expect(res.status).to.equal(200);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys('message', 'request');
            });
    });

    it('Update seller mit nicht existentierender ID', () => {
        try {
            return chai
                .request(app)
                .patch('/sellers/' + WrongSellerId)
                .set('Authorization', `Bearer ${token}`)
                .send(UpdateSeller)
                .then(res => {
                    expect(res.status).to.equal(404);
                    expect(res).to.be.json;
                    expect(res.body).to.contain.keys('message');
                });
        } catch (err) {
            logger.error(`Update Seller test Error: ${stringify(err)}`);
        }
    });

    it('Update seller mit falschen Daten', () => {
        try {
            return chai
                .request(app)
                .patch('/sellers/' + SellerId)
                .set('Authorization', `Bearer ${token}`)
                .send(UpdateSellerWrong)
                .then(res => {
                    expect(res.status).to.equal(422);
                    expect(res).to.be.json;
                    expect(res.body).to.contain.keys('message');
                });
        } catch (err) {
            logger.error(`Update Seller test Error: ${stringify(err)}`);
        }
    });
});

//Suite fuer Gets
describe('Getting stuff for games', () => {
    it('Alle Games', () => {
        return chai
            .request(app)
            .get('/games/')
            .then(res => {
                expect(res.status).to.equal(200);
                expect(res).to.be.json;
                expect(res.body).to.have.keys('count', 'games');
                let ArrayBody = res.body.games;
                expect(ArrayBody).to.be.array();
                expect(ArrayBody).to.have.lengthOf.at.least(2);
                let count = res.body.count;
                expect(ArrayBody).to.have.lengthOf(count);
            });
    });

    it('Findbyid', async () => {
        return chai
            .request(app)
            .get('/games/' + GameId)
            .then(res => {
                expect(res.status).to.equal(200);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys('price', 'name', 'platforms', 'delete_request', 'id');
                expect(res.body.id).to.equal(GameId);
            });
    });

    it('Findbyid mit falscher id', async () => {
        try {
            return await chai
                .request(app)
                .get('/games/' + WrongGameId)
                .then(res => {
                    expect(res.status).to.equal(404);
                    expect(res.body).to.contain.keys('message');
                    return Promise.reject(new Error('404 not found'));
                });
        } catch (err) {
            logger.error(`Findbyid test Error: ${stringify(err)}`);
        }
    });

    describe('findbyanything', () => {
        it('Name', () => {
            return chai
                .request(app)
                .get('/games/findbyanything/' + GameName)
                .then(res => {
                    expect(res.status).to.equal(200);
                    expect(res.body.games[0].name).to.be.equal(GameName);
                });
        });

        it('Platform', () => {
            return chai
                .request(app)
                .get('/games/findbyanything/' + 'PC')
                .then(res => {
                    expect(res.status).to.equal(200);
                    expect(res.body.games[0].platforms).to.include('PC');
                });
        });
        it('ID', () => {
            return chai
                .request(app)
                .get('/games/findbyanything/' + GameId)
                .then(res => {
                    expect(res.status).to.equal(200);
                    expect(res.body.games[0]._id).to.be.equal(GameId);
                });
        });

        it('Price', () => {
            return chai
                .request(app)
                .get('/games/findbyanything/' + 30)
                .then(res => {
                    expect(res.status).to.equal(200);
                    expect(res.body.games[0].price).to.be.equal(30);
                });
        });

        it('Findbyanything falscher Param', () => {
            return chai
                .request(app)
                .get('/games/findbyanything/' + 'tkkg')
                .then(res => {
                    expect(res.status).to.equal(404);
                    expect(res.body).to.contain.keys('message');
                    expect(res.body.message).to.be.equal('There are no entries');
                });
        });
    });
});

describe('Deleting', () => {
    it('Seller löschen zu vorhandener ID', async () => {
        return await chai
            .request(app)
            .del('/sellers/' + SellerId)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.equal(200);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys('message');
            });
    });

    it('Game löschen zu vorhandener ID', async () => {
        return chai
            .request(app)
            .del('/games/' + GameId)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.equal(200);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys('message');
            });
    });

    it('User löschen zu vorhandener ID', async () => {
        return await chai
            .request(app)
            .del('/user/' + UserId)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.equal(200);
                expect(res).to.be.json;
                expect(res.body).to.contain.keys('message');
            });
    });
});

after(() => {
    shell.exec('npm run mongo importbackup');
});
