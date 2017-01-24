/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import fs = require('fs');

describe("EchoSpec", function () {

    let zipContent: any = null;

    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }
    var insightFacade:InsightFacade = null; //added

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
        insightFacade = new InsightFacade(); //added
        zipContent = Buffer.from(fs.readFileSync("courses.zip")).toString('base64');
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
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

    // it.only("For test purpose", function () {
    //     return insightFacade.addDataset("1234", "average").then(value => {
    //         Log.test('Value ' + value);
    //         expect.fail();
    //     }).catch(function (err:any) {
    //         Log.test('Error: ' + err);
    //         expect(err).to.equal('Error');
    //     })
    // }); //added

    it("Create a new dataset with unique id ", function () {
        return insightFacade.addDataset("courses", zipContent).then(function (value:any) {
            Log.test('Value ' + value);
            expect(value.code).to.equal(204);
            expect(value.body.value).to.equal(undefined);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    // it("Create a new dataset with non-unique id", function () {
    //     return insightFacade.addDataset("courses", zipContent).then(function (value:any) {
    //         Log.test('Value ' + value);
    //         expect(value).to.equal(201);
    //     }).catch(function (err:any) {
    //         Log.test('Error: ' + err);
    //         expect.fail();
    //     })
    // });

});
