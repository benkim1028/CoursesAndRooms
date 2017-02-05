/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse, QueryRequest} from "../src/controller/IInsightFacade";
import fs = require('fs');

var query:any = {"WHERE":
    {"GT":
        {"courses_avg":97
        }
    },
    "OPTIONS":{
        "COLUMNS":[
            "courses_dept",
            "courses_avg"
        ],
        "ORDER":"courses_avg",
        "FORM":"TABLE"
    }
}

describe("EchoSpec", function () {

    let zipContent: any = null;
    let fakezipContent: any = null;
    var query:QueryRequest =
        {"WHERE":
            {"GT":
                {"courses_avg":97
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }

    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }
    var insightFacade:InsightFacade = null; //added
    var query:QueryRequest = null; //added

        before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
        insightFacade = new InsightFacade(); //added
        zipContent = Buffer.from(fs.readFileSync("courses.zip")).toString('base64');
        fakezipContent = Buffer.from(fs.readFileSync("courses.zip"));
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
        insightFacade = null; //added
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
        insightFacade = null; //added
        //zipContent = null;
    });

    it("Should be able to echo", function () {
        let out = Server.performEcho('echo');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: 'echo...echo'});
    });

    it("Should be able to echo silence", function () {
        let out = Server.performEcho('');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: '...'});
    });

    it("Should be able to handle a missing echo message sensibly", function () {
        let out = Server.performEcho(undefined);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to handle a null echo message sensibly", function () {
        let out = Server.performEcho(null);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.have.property('error');
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to handle a null echo message sensibly", function () {
        let out = Server.performEcho(null); // return type : InsightResponse
        Log.test(JSON.stringify(out));
        console.log(out);
        console.log(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.have.property('error');
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Create a new dataset with unique id ", function () {
        return insightFacade.addDataset("testfile", zipContent).then(function (value:any) {
            Log.test('Value ' + value);
            expect(value.code).to.equal(204);
            expect(value.body.value).to.equal(undefined);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("Create a new dataset with non-unique id", function () {
        return insightFacade.addDataset("courses", zipContent).then(function (value:any) {
            Log.test('Value ' + value);
            expect(value.code).to.equal(201);
            expect(value.body.value).to.equal(undefined);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it("Create a new dataset with non-unique id", function () {
        return insightFacade.addDataset("hello", zipContent).then(function (value:any) {
            Log.test('Value ' + value);
            expect(value.code).to.equal(201);
            expect(value.body.value).to.equal(undefined);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("For test purpose", function () {
        return insightFacade.addDataset("1234", "average").then(value => {
            Log.test('Value ' + value);
            expect.fail();
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body.error).to.equal("my text");
        })
    }); //added

    it("For test purpose", function () {
        return insightFacade.performQuery(query).then(value => {
            Log.test('Value ' + value);
            expect.fail();
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body.error).to.equal("my text");
        })
    }); //added


    it.only("For test purpose", function () {
        return insightFacade.performQuery(    {"WHERE":
            {"GT":
                {"courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg",
                    "courses_uuid",
                    "courses_fail",
                    "courses_pass",
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        }).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(201);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added

    it("removeDataset with existing file", function () {
        return insightFacade.removeDataset('hello').then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(204);
            //expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added


    it("removeDataset with non-existing file", function () {
        return insightFacade.removeDataset('hello1').then(value => {
            Log.test('Value ' + value);
            expect.fail();
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(404);
            expect(err.body).to.equal({});
        })
    }); //added


});
