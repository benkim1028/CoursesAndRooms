/**
 * Created by ENVY on 2017-02-06.
 */
/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse, QueryRequest} from "../src/controller/IInsightFacade";
import fs = require('fs');

describe("EchoSpec", function () {

    var zipContent: any = null;

    let query: QueryRequest = {
        "WHERE":{

            "GT":{
                "courses_avg": "hi"
            }

        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };

    let querya: QueryRequest = {
        "WHERE":{

            "AND":[]

        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    let queryb: QueryRequest = {
        "WHERE":{

            "OR":[]

        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    let queryc: QueryRequest = {
        "WHERE":{

            "GT": "aksjdfii"

        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    let queryd: QueryRequest = {
        "WHERE":{

            "GT": {"courses_avg":90}

        },
        "OPTIONS":{
            "COLUMNS":[],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    let queryEQ: QueryRequest = {
        "WHERE":{

            "EQ": {"courses_avg" : 80.25}

        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };
    let query1: QueryRequest = {
        "WHERE":{
            "AND":[
                {
                    "OR":[
                        {
                            "GT":{
                                "courses_avg":95
                            }
                        },
                        {
                            "LT":{
                                "courses_fail":2
                            }
                        }
                    ]
                },
                {
                    "OR":[
                        {
                            "EQ":{
                                "courses_avg": 44
                            }
                        },
                        {
                            "IS":{
                                "courses_dept": "cpsc"
                            }
                        },
                        {
                            "GT": {
                                "courses_pass": 200
                            }
                        }
                    ]
                }
            ]
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_pass"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    let query2: QueryRequest =  {
        "WHERE": {
            "NOT": {
                "AND": [
                    {
                        "IS": {
                            "courses_dept": "adhe"
                    }
                },
                    {
                        "GT": {
                            "courses_avg": 80
                        }
                    }
                    ]
            }

        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_pass",
                "courses_audit",
                "courses_uuid"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    let query3: QueryRequest ={
        "WHERE": {

                "IS": {
                    "courses_dept": "adhe"
                }

        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    let query4: QueryRequest ={
        "WHERE": {
            "AND": [{
                "EQ": {
                    "courses_dept": "adhe"
                }
            },
                {
                    "GT": {
                        "courses_avg": 90
                    }
                }]
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "invalid",
            "FORM":"TABLE"
        }
    }
    let query5: QueryRequest ={
        "WHERE": {
            "NOT" :{
                "NOT": {
                    "GT": {
                        "courses_avg": 98
                    }
                }
            }

        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    let query6: QueryRequest = {
        "WHERE":{
                    "IS":{
                        "courses_title" : "* anat"
                    }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg" ,
                "courses_instructor"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    let query7: QueryRequest = {
        "WHERE":{

            "AND":[
                {
                    "GT":{
                        "courses_avg":90
                    }
                },
                {
                    "IS":{
                        "courses_instructor" : "a*"
                    }
                }
            ]

        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg" ,
                "courses_instructor"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    let query8: QueryRequest = {
        "WHERE":{

            "AND":[
                {
                    "LT":{
                        "courses_avg":10
                    }
                },
                {
                    "IS":{
                        "courses_instructor" : "*a"
                    }
                }
            ]

        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_audit",
                "courses_uuid",
                "courses_avg" ,
                "courses_pass",
                "courses_title",
                "courses_fail"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    let query9: QueryRequest ={
        "WHERE": {
            "AND": [
                {
                    "GT": {
                        "courses_avg": 90
                    }
                },
                {
                    "NOT": {
                        "GT": {
                            "courses_avg": 90
                        }
                    }
                }
            ]
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_avg",
                "courses_instructor"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };

    let query10: QueryRequest = {
        "WHERE":{
            "OR":[
                {
                    "AND": [
                        {
                            "OR": [
                                {
                                    "GT": {
                                        "courses_avg": 95
                                    },
                                    "LT": {
                                        "courses_fail": 2
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "GT":{
                        "courses_avg":90
                    }
                },
                {
                    "IS":{
                        "courses_dept":"adhe"
                    }
                }
                ,
                {
                    "EQ":{
                        "courses_avg":95
                    }
                }
            ]
        },

        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };

    let query11: QueryRequest = {
        "WHERE":{
            "OR":[
                {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "courses_avg": 95
                                    },
                                    "LT": {
                                        "courses_fail": 2
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "GT":{
                        "courses_avg":90
                    }
                },
                {
                    "IS":{
                        "courses_dept":"adhe"
                    }
                }
                ,
                {
                    "EQ":{
                        "courses_avg":95
                    }
                }
            ]
        },

        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };

    let query12: QueryRequest = {
        "WHERE":{
            "AND":[
                {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "courses_avg": 87.5
                                    },
                                    "LT": {
                                        "courses_fail": 2
                                    }
                                }
                            ]
                        },
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "courses_avg": 87.6
                                    },
                                    "LT": {
                                        "courses_fail": 10
                                    }
                                }
                            ]
                        }



                    ]
                },
                {
                    "GT":{
                        "courses_avg":87
                    }
                },
                {
                    "IS":{
                        "courses_instructor":""
                    }
                }
                ,
                {
                    "LT":{
                        "courses_avg":88
                    }
                }
            ]
        },

        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"

            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };

    let query13: QueryRequest = {
        "WHERE":{
            "AND":[
                {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "NOT" : {
                                        "GT": {
                                            "courses_avg": 87.5
                                        }
                                    } ,
                                    "LT": {
                                        "courses_fail": 2
                                    }
                                }
                            ]
                        },
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "courses_avg": 87.6
                                    },
                                    "LT": {
                                        "courses_fail": 10
                                    }
                                }
                            ]
                        }



                    ]
                },
                {
                    "GT":{
                        "courses_avg":87
                    }
                },
                {
                    "IS":{
                        "courses_instructor":""
                    }
                }
                ,
                {
                    "LT":{
                        "courses_avg":88
                    }
                }
            ]
        },

        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"

            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };

    let query14: QueryRequest = {
        "WHERE":{
            "AND":[
                {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "NOT" : {
                                        "NOT": {
                                            "GT": {
                                                "courses_avg": 87.5
                                            }
                                        }
                                    },
                                    "LT": {
                                        "courses_fail": 2
                                    }
                                }
                            ]
                        },
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "courses_avg": 87.6
                                    },
                                    "LT": {
                                        "courses_fail": 10
                                    }
                                }
                            ]
                        }



                    ]
                },
                {
                    "GT":{
                        "courses_avg":87
                    }
                },
                {
                    "IS":{
                        "courses_instructor":""
                    }
                }
                ,
                {
                    "LT":{
                        "courses_avg":88
                    }
                }
            ]
        },

        "OPTIONS":{
            "COLUMNS":[
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"

            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    };


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
        // emptyfolder = Buffer.from(fs.readFileSync("course2.zip")).toString('base64');
        // invalidfiletxt = Buffer.from(fs.readFileSync("course3.zip")).toString('base64');
        // invalidzip = Buffer.from(fs.readFileSync("courses.txt")).toString('base64');
        // invalidDataPicture = Buffer.from(fs.readFileSync("courses2.zip")).toString('base64');
        // fewinvalid = Buffer.from(fs.readFileSync("fewinvalid.zip")).toString('base64');
        // zipinzip = Buffer.from(fs.readFileSync("zipinzip.zip")).toString('base64');
        // zipContentnot64 = Buffer.from(fs.readFileSync("courses.zip")).toString();
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

    it.only("Create a new dataset with unique id ", function () {
        return insightFacade.addDataset("courses", zipContent).then(function (value:any) {
            Log.test('Value ' + value);
            var response: InsightResponse = {
                code: 204,
                body: {}
            };
            expect(value.code).to.equal(response.code);
        })
    });

    it("Create a new dataset with non-unique id", function () {
        return insightFacade.addDataset("courses", zipContent).then(function (value:any) {
            Log.test('Value ' + value);
            var response : InsightResponse = { code: 201, body: {} };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('query', function() {
        return insightFacade.performQuery(query).then (function (value: any) {
            expect.fail();
        }).catch(function (err:any) {
            var response : InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('querya', function() {
        return insightFacade.performQuery(querya).then (function (value: any) {
            expect.fail();
        }).catch(function (err:any) {
            var response : InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('queryb', function() {
        return insightFacade.performQuery(queryb).then (function (value: any) {
            expect.fail();
        }).catch(function (err:any) {
            var response : InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('queryc', function() {
        return insightFacade.performQuery(queryc).then (function (value: any) {
            expect.fail();
        }).catch(function (err:any) {
            var response : InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('queryd', function() {
        return insightFacade.performQuery(queryd).then (function (value: any) {
            expect.fail();
        }).catch(function (err:any) {
            var response : InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('query1', function() {
        return insightFacade.performQuery(query1).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('successquery3', function() {
        return insightFacade.performQuery(query3).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('InvalidOrderquery4', function() {
        return insightFacade.performQuery(query4).then (function (value: any) {
            expect.fail();
        }).catch(function (err:any) {
            var response : InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('query5', function() {
        return insightFacade.performQuery(query5).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('queryEQ', function() {
        return insightFacade.performQuery(queryEQ).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query2', function() {
        return insightFacade.performQuery(query2).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query6', function() {
        return insightFacade.performQuery(query6).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query7', function() {
        return insightFacade.performQuery(query7).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query8', function() {
        return insightFacade.performQuery(query8).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query9', function() {
        return insightFacade.performQuery(query9).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('query10', function() {
        return insightFacade.performQuery(query10).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('query11', function() {
        return insightFacade.performQuery(query11).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });


    it('query12', function() {
        return insightFacade.performQuery(query12).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it.only('query13', function() {
        return insightFacade.performQuery(query11).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it.only('query14', function() {
        return insightFacade.performQuery(query11).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("For test purpose", function () {
        return insightFacade.performQuery(
            {"WHERE":
                {"GT":
                    {"courses_avg":90
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            }).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });


    it('removedatasetfail', function(){
        return insightFacade.removeDataset('couresssssssssss').then (function (value: any) {
            expect.fail();
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            var response : InsightResponse = {
                code: 404, body: {}
            };
            expect(err.code).to.equal(response.code);
        })
    });

    it("For test purpose", function () {
        return insightFacade.performQuery(
            {"WHERE":
                {"GT":
                    {"courses_avg":90
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
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('removedatasetfail', function(){
        return insightFacade.removeDataset('couresssssssssss').then (function (value: any) {
            expect.fail();
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            var response : InsightResponse = {
                code: 404, body: {}
            };
            expect(err.code).to.equal(response.code);
        })
    })
    //added


    it("addDataset with non-zip file", function () {
        return insightFacade.addDataset("1234", "average").then(value => {
            Log.test('Value ' + value);
            expect.fail();
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("removeDataset with non-existing file", function () {
        return insightFacade.removeDataset('courses10000').then(value => {
            Log.test('Value ' + value);
            expect.fail();
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(404);
        })
    }); //added



    it("Basic query", function () {
        return insightFacade.performQuery(
            {"WHERE":
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
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added

    it("Basic query wiht invalid input", function () {
        return insightFacade.performQuery(
            {"WHERE":
                {"GT":
                    {"courses_av":97
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
            expect.fail();
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("Basic query with dep", function () {
        return insightFacade.performQuery(
            {"WHERE":
                {"IS":
                    {"courses_dept": "aanb"
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                        // "courses_uuid",
                        // "courses_fail",
                        // "courses_pass",
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            }).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added

    it("Complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE":{
                    "OR":[
                        {
                            "AND":[
                                {
                                    "GT":{
                                        "courses_avg":90
                                    }
                                },
                                {
                                    "IS":{
                                        "courses_dept":"adhe"
                                    }
                                }
                            ]
                        },
                        {
                            "EQ":{
                                "courses_avg":95
                            }
                        }
                    ]
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_id",
                        "courses_avg"
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added

    it("GT error with simple query", function () {
        return insightFacade.performQuery(
            {"WHERE":
                {"GT":
                    {"courses_dept": "lol"
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
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added


    it("Colunms empty with simple query", function () {
        return insightFacade.performQuery(
            {"WHERE":
                {"GT":
                    {"courses_dept": "lol"
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[

                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            }).then(value => {
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added





    it("LT error with simple query", function () {
        return insightFacade.performQuery(
            {"WHERE":
                {"LT":
                    {"courses_dept": "lol"
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
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("EQ error with simple query", function () {
        return insightFacade.performQuery(
            {"WHERE":
                {"EQ":
                    {"courses_dept": "lol"
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
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("IS error with simple query", function () {
        return insightFacade.performQuery(
            {"WHERE":
                {"IS":
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
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("GT error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE":{
                    "AND":[
                        {
                            "AND":[
                                {
                                    "GT":{
                                        "courses_dept": 80
                                    }
                                },
                                {
                                    "IS":{
                                        "courses_dept":"adhe"
                                    }
                                }
                            ]
                        },
                        {
                            "EQ":{
                                "courses_avg":95
                            }
                        }
                    ]
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_id",
                        "courses_avg"
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            // expect.fail();
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("GT error without complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE":{
                    "OR":[
                        {
                            "AND":[
                                {
                                    "GT":{
                                        "courses_avg":95
                                    }
                                },
                                {
                                    "IS":{
                                        "courses_instructor":"*a*"
                                    }
                                }
                            ]
                        },
                        {
                            "GT":{
                                "courses_fail":5
                            }
                        }
                    ]
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            // expect.fail();
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            // expect(err.code).to.equal(400);
            expect.fail();
        })
    }); //added

    it("GT GT error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE":{
                    "OR":[
                        {
                            "AND":[
                                {
                                    "GT":{
                                        "course_dept": "adhe"
                                    }
                                },
                                {
                                    "IS":{
                                        "courses_instructor":"*a*"
                                    }
                                }
                            ]
                        },
                        {
                            "GT":{
                                "courses_fail":5
                            }
                        }
                    ]
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("LT error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE":{
                    "OR":[
                        {
                            "AND":[
                                {
                                    "LT":{
                                        "course_dept": "adhe"
                                    }
                                },
                                {
                                    "IS":{
                                        "courses_instructor":"*a*"
                                    }
                                }
                            ]
                        },
                        {
                            "GT":{
                                "courses_fail":5
                            }
                        }
                    ]
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("EQT error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE":{
                    "OR":[
                        {
                            "AND":[
                                {
                                    "EQ":{
                                        "course_dept": "adhe"
                                    }
                                },
                                {
                                    "IS":{
                                        "courses_instructor":"*a*"
                                    }
                                }
                            ]
                        },
                        {
                            "GT":{
                                "courses_fail":5
                            }
                        }
                    ]
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("IS error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE":{
                    "OR":[
                        {
                            "AND":[
                                {
                                    "GT":{
                                        "course_avg": 95
                                    }
                                },
                                {
                                    "IS":{
                                        "course_avg": 95
                                    }
                                }
                            ]
                        },
                        {
                            "GT":{
                                "courses_fail":5
                            }
                        }
                    ]
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it.only("removeDataset with existing file", function () {
        return insightFacade.removeDataset('courses').then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(204);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added

    it('test perfrom query after data is removed', function() {
        return insightFacade.performQuery(query).then (function (value: any) {
            expect.fail();
        }).catch(function (err:any) {
            var response : InsightResponse = {
                code: 424, body: {"missing": ["courses"]}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
            expect(err.body).to.eql(response.body);
        })
    });



});