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
    // var emptyfolder: any = null;
    // var nopath: any = null;
    // var invalidfiletxt: any = null;
    // var invalidzip: any = null;
    // var invalidDataPicture: any = null;
    // var fewinvalid: any = null;
    // var zipinzip: any = null;
    // var zipContentnot64: any = null;
    var sampleResponse : InsightResponse = {
        code: 200, body: { render: 'TABLE',
            result:
                [ { courses_dept: 'adhe', courses_id: '329', courses_avg: 90.02 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 90.16 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.17 },
                    { courses_dept: 'adhe', courses_id: '412', courses_avg: 90.18 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.5 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.72 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 90.82 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.85 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.29 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.33 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.33 },
                    { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.48 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 92.54 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 93.33 },
                    { courses_dept: 'rhsc', courses_id: '501', courses_avg: 95 },
                    { courses_dept: 'bmeg', courses_id: '597', courses_avg: 95 },
                    { courses_dept: 'bmeg', courses_id: '597', courses_avg: 95 },
                    { courses_dept: 'cnps', courses_id: '535', courses_avg: 95 },
                    { courses_dept: 'cnps', courses_id: '535', courses_avg: 95 },
                    { courses_dept: 'cpsc', courses_id: '589', courses_avg: 95 },
                    { courses_dept: 'cpsc', courses_id: '589', courses_avg: 95 },
                    { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                    { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                    { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                    { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                    { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                    { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                    { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                    { courses_dept: 'sowk', courses_id: '570', courses_avg: 95 },
                    { courses_dept: 'econ', courses_id: '516', courses_avg: 95 },
                    { courses_dept: 'edcp', courses_id: '473', courses_avg: 95 },
                    { courses_dept: 'edcp', courses_id: '473', courses_avg: 95 },
                    { courses_dept: 'epse', courses_id: '606', courses_avg: 95 },
                    { courses_dept: 'epse', courses_id: '682', courses_avg: 95 },
                    { courses_dept: 'epse', courses_id: '682', courses_avg: 95 },
                    { courses_dept: 'kin', courses_id: '499', courses_avg: 95 },
                    { courses_dept: 'kin', courses_id: '500', courses_avg: 95 },
                    { courses_dept: 'kin', courses_id: '500', courses_avg: 95 },
                    { courses_dept: 'math', courses_id: '532', courses_avg: 95 },
                    { courses_dept: 'math', courses_id: '532', courses_avg: 95 },
                    { courses_dept: 'mtrl', courses_id: '564', courses_avg: 95 },
                    { courses_dept: 'mtrl', courses_id: '564', courses_avg: 95 },
                    { courses_dept: 'mtrl', courses_id: '599', courses_avg: 95 },
                    { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                    { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                    { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                    { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                    { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                    { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                    { courses_dept: 'nurs', courses_id: '424', courses_avg: 95 },
                    { courses_dept: 'nurs', courses_id: '424', courses_avg: 95 },
                    { courses_dept: 'obst', courses_id: '549', courses_avg: 95 },
                    { courses_dept: 'psyc', courses_id: '501', courses_avg: 95 },
                    { courses_dept: 'psyc', courses_id: '501', courses_avg: 95 },
                    { courses_dept: 'econ', courses_id: '516', courses_avg: 95 },
                    { courses_dept: 'adhe', courses_id: '329', courses_avg: 96.11 } ] }
    };

    let query: QueryRequest = {
        "WHERE":{

            "IS":{
                "abe":"adhe"
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
            "OR":[
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
            "AND": [{
                "IS": {
                    "courses_dept": "adhe"
                }},
                {"GT" : {"courses_avg": 80}
                }]

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
                }},
                {"GT" : {"courses_avg": 90}
                }]

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
    let query5: QueryRequest ={
        "WHERE": {
            "IS": {
                "courses_dept": "adhe"
            }
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_id"
            ],
            "ORDER":"courses_avg",
            "FORM":"TABLE"
        }
    }
    let query6: QueryRequest = {
        "WHERE":{

            "AND":[
                {
                    "GT":{
                        "courses_avg":90
                    }
                },
                {
                    "IS":{
                        "courses_instructor" : "*a*"
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
            "NOT" : {"GT": {
                "courses_avg": "98"
            }}
        },
        "OPTIONS":{
            "COLUMNS":[
                "courses_id"
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
    // it('adddatasetEmptyFolder', function() {
    //     return insightFacade.addDataset("emptyfolder", emptyfolder).then (function (value: any) {
    //         expect.fail();
    //     }).catch(function (err:any) {
    //         var response : InsightResponse = {
    //             code: 400, body: {"error": "fail"}
    //         };
    //         Log.test('Error: ' + err);
    //         expect(err.code).to.equal(response.code);
    //     })
    // });
    // it('adddatasetnot64', function() {
    //     return insightFacade.addDataset("emptyfolder", zipContentnot64).then (function (value: any) {
    //         expect.fail();
    //     }).catch(function (err:any) {
    //         var response : InsightResponse = {
    //             code: 400, body: {"error": "fail"}
    //         };
    //         Log.test('Error: ' + err);
    //         expect(err.code).to.equal(response.code);
    //     })
    // });
    // it('adddatasetNoPath', function() {
    //     return insightFacade.addDataset("nopath", nopath).then (function (value: any) {
    //         expect.fail();
    //     }).catch(function (err:any) {
    //         var response : InsightResponse = {
    //             code: 400, body: {"error": "fail"}
    //         };
    //         Log.test('Error: ' + err);
    //         expect(err.code).to.equal(response.code);
    //     })
    // });
    // it('adddatasetInvalidfiletxt', function() {
    //     return insightFacade.addDataset("invalidfiletxt", invalidfiletxt).then (function (value: any) {
    //         expect.fail();
    //     }).catch(function (err:any) {
    //         var response : InsightResponse = {
    //             code: 400, body: {"error": "fail"}
    //         };
    //         Log.test('Error: ' + err);
    //         expect(err.code).to.equal(response.code);
    //     })
    // });
    // it('adddatasetinvalidzip', function() {
    //     return insightFacade.addDataset("invalidzip", invalidzip).then (function (value: any) {
    //         expect.fail();
    //     }).catch(function (err:any) {
    //         var response : InsightResponse = {
    //             code: 400, body: {"error": "fail"}
    //         };
    //         Log.test('Error: ' + err);
    //         expect(err.code).to.equal(response.code);
    //     })
    // });
    // it('adddatasetFailinvalidDatapicture', function() {
    //     return insightFacade.addDataset("invalidDataPicture", invalidDataPicture ).then (function (value: any) {
    //         expect.fail();
    //     }).catch(function (err:any) {
    //         var response : InsightResponse = {
    //             code: 400, body: {"error": "fail"}
    //         };
    //         Log.test('Error: ' + err);
    //         expect(err.code).to.equal(response.code);
    //     })
    // });
    // //problem
    // it('adddatasetFailFewInvalid', function() {
    //     return insightFacade.addDataset("fewinvalid", fewinvalid).then (function (value: any) {
    //         var response : InsightResponse = {
    //             code: 204, body: {}
    //         };
    //         expect(value.code).to.equal(response.code);
    //     })
    // });
    // it('adddatasetzipinzip', function() {
    //     return insightFacade.addDataset("zipinzip", zipinzip).then (function (value: any) {
    //         expect.fail();
    //     }).catch(function (err:any) {
    //         console.log(zipinzip);
    //         var response : InsightResponse = {
    //             code: 400, body: {"error": "fail"}
    //         };
    //         Log.test('Error: ' + err);
    //         expect(err.code).to.equal(response.code);
    //     })
    // });

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
    })
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
    })
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
    })
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
    })
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
    })
    it.only('query1', function() {
        return insightFacade.performQuery(query1).then (function (value: any) {
            expect(value).to.eql(sampleResponse);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    })
    it('query3', function() {
        return insightFacade.performQuery(query3).then (function (value: any) {
            var response : InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err:any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    })
    it('query4', function() {
        return insightFacade.performQuery(query4).then (function (value: any) {
            expect.fail();
        }).catch(function (err:any) {
            var response : InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    })
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
    })

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
    })
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
    })
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
    })
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
    })
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
    })
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
    })

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
    it('removedataset', function(){
        return insightFacade.removeDataset('courses').then(function (value: any){
            var response : InsightResponse = {
                code: 204, body: {}
            };
            expect(value.code).to.equal(response.code);
        })
    })
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

});