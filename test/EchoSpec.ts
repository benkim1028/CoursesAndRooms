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

    var zipContentForCourses: any = null;
    var zipContentForRooms: any = null;

    let query: QueryRequest = {
        "WHERE": {

            "GT": {
                "courses_avg": "hi"
            }

        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };

    let querya: QueryRequest = {
        "WHERE": {

            "AND": []

        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };
    let queryb: QueryRequest = {
        "WHERE": {

            "OR": []

        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };
    let queryc: QueryRequest = {
        "WHERE": {

            "GT": "aksjdfii"

        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };
    let queryd: QueryRequest = {
        "WHERE": {

            "GT": {"courses_avg": 90}

        },
        "OPTIONS": {
            "COLUMNS": [],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };
    let queryEQ: QueryRequest = {
        "WHERE": {

            "EQ": {"courses_avg": 80.25}

        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };

    let query2: QueryRequest = {
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
                            "courses_avg": 20
                        }
                    }
                ]
            }

        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_pass",
                "courses_audit",
                "courses_uuid"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    }
    let query3: QueryRequest = {
        "WHERE": {

            "IS": {
                "courses_dept": "adhe"
            }

        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_title",
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "courses_title",
            "FORM": "TABLE"
        }
    }
    let query4: QueryRequest = {
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
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "invalid",
            "FORM": "TABLE"
        }
    }
    let query5: QueryRequest = {
        "WHERE": {
            "NOT": {
                "NOT": {
                    "GT": {
                        "courses_avg": 98
                    }
                }
            }

        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    }
    let query6: QueryRequest = {
        "WHERE": {
            "IS": {
                "courses_title": "* anat"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    }
    let query7: QueryRequest = {
        "WHERE": {

            "AND": [
                {
                    "GT": {
                        "courses_avg": 90
                    }
                },
                {
                    "IS": {
                        "courses_instructor": "a*"
                    }
                }
            ]

        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    }
    let query8: QueryRequest = {
        "WHERE": {

            "AND": [
                {
                    "LT": {
                        "courses_avg": 10
                    }
                },
                {
                    "IS": {
                        "courses_instructor": "*a"
                    }
                }
            ]

        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_audit",
                "courses_uuid",
                "courses_avg",
                "courses_pass",
                "courses_title",
                "courses_fail"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    }
    let query9: QueryRequest = {
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
        "WHERE": {
            "OR": [
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
                    "GT": {
                        "courses_avg": 90
                    }
                },
                {
                    "IS": {
                        "courses_dept": "adhe"
                    }
                }
                ,
                {
                    "EQ": {
                        "courses_avg": 95
                    }
                }
            ]
        },

        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };

    let query11: QueryRequest = {
        "WHERE": {
            "OR": [
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
                    "GT": {
                        "courses_avg": 90
                    }
                },
                {
                    "IS": {
                        "courses_dept": "adhe"
                    }
                }
                ,
                {
                    "EQ": {
                        "courses_avg": 95
                    }
                }
            ]
        },

        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };

    let query13: QueryRequest = {
        "WHERE": {
            "AND": [
                {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "NOT": {
                                        "GT": {
                                            "courses_avg": 87.5
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
                    "GT": {
                        "courses_avg": 87
                    }
                },
                {
                    "IS": {
                        "courses_instructor": ""
                    }
                }
                ,
                {
                    "LT": {
                        "courses_avg": 88
                    }
                }
            ]
        },

        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"

            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };

    let query14: QueryRequest = {
        "WHERE": {
            "AND": [
                {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "NOT": {
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
                    "GT": {
                        "courses_avg": 87
                    }
                },
                {
                    "IS": {
                        "courses_instructor": ""
                    }
                }
                ,
                {
                    "LT": {
                        "courses_avg": 88
                    }
                }
            ]
        },

        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"

            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    };
    let query16: QueryRequest = {
        "WHERE": {
            "IS": {
                "courses_title": "noe*"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    }
    let query17: QueryRequest = {
        "WHERE": {
            "IS": {
                "courses_title": "*geo*"
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_title",
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    }
    let query18: QueryRequest = {
        "WHERE": {
            "NOT": {
                "IS": {
                    "courses_title": "*a"
                }
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    }
    let query19: QueryRequest = {
        "WHERE": {
            "NOT": {
                "IS": {
                    "courses_title": "a*"
                }
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    }
    let query20: QueryRequest = {
        "WHERE": {
            "NOT": {
                "IS": {
                    "courses_title": "*a*"
                }
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"
            ],
            "ORDER": "courses_avg",
            "FORM": "TABLE"
        }
    }

    let query21: QueryRequest = {
        "WHERE": {
            "NOT": {
                "IS": {
                    "courses_title": "*a*"
                }
            }
        },
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_avg",
                "courses_instructor"
            ],
            "ORDER": "courses_fail",
            "FORM": "TABLE"
        }
    }


    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    var insightFacade: InsightFacade = null; //added


    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
        insightFacade = new InsightFacade(); //added
        zipContentForCourses = Buffer.from(fs.readFileSync("courses.zip")).toString('base64');
        zipContentForRooms = Buffer.from(fs.readFileSync("rooms.zip")).toString('base64');
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

    it("Create a new dataset with unique id ", function () {
        return insightFacade.addDataset("courses", zipContentForCourses).then(function (value: any) {
            Log.test('Value ' + value);
            var response: InsightResponse = {
                code: 204,
                body: {}
            };
            expect(value.code).to.equal(response.code);
        })
    });

    it("Create a new dataset with non-unique id", function () {
        return insightFacade.addDataset("courses", zipContentForCourses).then(function (value: any) {
            Log.test('Value ' + value);
            var response: InsightResponse = {code: 201, body: {}};
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('query', function () {
        return insightFacade.performQuery(query).then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            var response: InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('querya', function () {
        return insightFacade.performQuery(querya).then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            var response: InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('queryb', function () {
        return insightFacade.performQuery(queryb).then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            var response: InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('queryc', function () {
        return insightFacade.performQuery(queryc).then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            var response: InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('queryd', function () {
        return insightFacade.performQuery(queryd).then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            var response: InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });

    it('successquery3', function () {
        return insightFacade.performQuery(query3).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('InvalidOrderquery4', function () {
        return insightFacade.performQuery(query4).then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            var response: InsightResponse = {
                code: 400, body: {"error": "my text"}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
        })
    });
    it('query5', function () {
        return insightFacade.performQuery(query5).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('queryEQ', function () {
        return insightFacade.performQuery(queryEQ).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query2', function () {
        return insightFacade.performQuery(query2).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query6', function () {
        return insightFacade.performQuery(query6).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query7', function () {
        return insightFacade.performQuery(query7).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query8', function () {
        return insightFacade.performQuery(query8).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query9', function () {
        return insightFacade.performQuery(query9).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('query10', function () {
        return insightFacade.performQuery(query10).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('query11', function () {
        return insightFacade.performQuery(query11).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query13', function () {
        return insightFacade.performQuery(query11).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('query14', function () {
        return insightFacade.performQuery(query11).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('query16', function () {
        return insightFacade.performQuery(query16).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query17', function () {
        return insightFacade.performQuery(query17).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query18', function () {
        return insightFacade.performQuery(query18).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it('query19', function () {
        return insightFacade.performQuery(query19).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('query20', function () {
        return insightFacade.performQuery(query20).then(function (value: any) {
            var response: InsightResponse = {
                code: 200, body: {}
            };
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('query21', function () {
        return insightFacade.performQuery(query21).then(function (value: any) {
            Log.test('Value ' + value);
            expect.fail();
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    });

    it("For test purpose", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "GT": {
                        "courses_avg": 90
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });


    it('removedatasetfail1', function () {
        return insightFacade.removeDataset('couresssssssssss').then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            var response: InsightResponse = {
                code: 404, body: {}
            };
            expect(err.code).to.equal(response.code);
        })
    });
    it('removedatasetfail2', function () {
        return insightFacade.removeDataset(null).then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            var response: InsightResponse = {
                code: 404, body: {}
            };
            expect(err.code).to.equal(response.code);
        })
    });

    it('removedatasetfail', function () {
        return insightFacade.removeDataset('').then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            var response: InsightResponse = {
                code: 404, body: {}
            };
            expect(err.code).to.equal(response.code);
        })
    });

    it("For test purpose", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "GT": {
                        "courses_avg": 90
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass",
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it('removedatasetfail', function () {
        return insightFacade.removeDataset('couresssssssssss').then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            var response: InsightResponse = {
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
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("removeDataset with non-existing file", function () {
        return insightFacade.removeDataset('courses10000').then(value => {
            Log.test('Value ' + value);
            expect.fail();
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(404);
        })
    }); //added


    it("Basic query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "GT": {
                        "courses_avg": 97
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass",
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added

    it("Basic query wiht invalid input", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "GT": {
                        "courses_av": 97
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass",
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            Log.test('Value ' + value);
            expect.fail();
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("Basic query with dep", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "IS": {
                        "courses_dept": "aanb"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added

    it("Complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "courses_avg": 90
                                    }
                                },
                                {
                                    "IS": {
                                        "courses_dept": "adhe"
                                    }
                                }
                            ]
                        },
                        {
                            "EQ": {
                                "courses_avg": 95
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added

    it("GT error with simple query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "GT": {
                        "courses_dept": "lol"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass",
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added


    it("Colunms empty with simple query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "GT": {
                        "courses_dept": "lol"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added


    it("LT error with simple query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "LT": {
                        "courses_dept": "lol"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass",
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("EQ error with simple query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "EQ": {
                        "courses_dept": "lol"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass",
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("Should be able to find all sections in a dept not taught by a specific person.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "NOT": {
                        "IS": {
                            "courses_instructor": "gossen, david"
                        }
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            // Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("Should be able to find all sections in a dept not taught by a specific person.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_dept": "adhe"
                            }
                        },
                        {
                            "IS": {
                                "courses_instructor": "chan*"
                            }
                        },
                        {
                            "IS": {
                                "courses_title": "*educ"
                            }
                        }

                    ]
                }
                ,
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            // Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("Should be able to find all sections in a dept not taught by a specific person.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_dept": "adhe*"
                            }
                        },
                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "chan*"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_title": "*educ"
                            }
                        }

                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            // Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("Should be able to find all sections in a dept not taught by a specific person.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_dept": "adhe*"
                            }
                        },
                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "chan*"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_title": "*educ"
                            }
                        },
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        }

                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            // Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("Should be able to find all sections in a dept not taught by a specific person.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_dept": "adhe*"
                            }
                        },
                        {
                            "NOT": {
                                "GT": {
                                    "courses_avg": 91
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_title": "*educ"
                            }
                        },
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        }

                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            // Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("find all sections in a dept not taught by a specific person with *chan instructor.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_instructor": "*chan"
                            }
                        },
                        {
                            "NOT": {
                                "GT": {
                                    "courses_avg": 91
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_title": "*educ*"
                            }
                        },
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        }

                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            // Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("find all sections in a dept not taught by a specific person with *chan instructor and not LT.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_instructor": "*chan"
                            }
                        },
                        {
                            "NOT": {
                                "LT": {
                                    "courses_avg": 95
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_title": "*educ*"
                            }
                        },
                        {
                            "GT": {
                                "courses_avg": 90
                            }
                        }

                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            // Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("1find all sections in a dept not taught by a specific person with *chan instructor and not EQ.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_4324": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_234234": "*chan"
                            }
                        },
                        {
                            "NOT": {
                                "EQ": {
                                    "courses_avg": 90
                                }
                            }
                        },
                        {
                            "IS": {
                                "csfdafa": "*educ*"
                            }
                        },
                        {
                            "GT": {
                                "courses_avg": 95
                            }
                        }

                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    }); //added

    it("2find all sections in a dept not taught by a specific person with *chan instructor and not EQ.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_4324": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_234234": "*chan"
                            }
                        },
                        {
                            "NOT": {
                                "EQ": {
                                    "courses_avg": 90
                                }
                            }
                        },
                        {
                            "IS": {
                                "csfdafa_dsfsdf": "*educ*"
                            }
                        },
                        {
                            "GT": {
                                "sdjldsjf_dsjf": 95
                            }
                        }

                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(424);
        })
    }); //added

    it("22find all sections in a dept not taught by a specific person with *chan instructor and not EQ.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_4324": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_234234": "*chan"
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    }); //added

    it("3find all sections in a dept not taught by a specific person with *chan instructor and not EQ.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_dept": "*chan"
                            }
                        },
                        {
                            "NOT": {
                                "EQ": {
                                    "courses_avg": 90
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_dept": "*educ*"
                            }
                        },
                        {
                            "GT": {
                                "courses_avg": 95
                            }
                        }

                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "djfslf_sdfsdf",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(424);
        })
    }); //added

    it("4find all sections in a dept not taught by a specific person with *chan instructor and not EQ.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "gossen, david"
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_dept": "*chan"
                            }
                        },
                        {
                            "NOT": {
                                "EQ": {
                                    "courses_avg": 90
                                }
                            }
                        },
                        {
                            "IS": {
                                "courses_dept": "*educ*"
                            }
                        },
                        {
                            "GT": {
                                "courses_avg": 95
                            }
                        }

                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "djfslf_sdfsdf",
                        "csdfsdfavg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_avg",
                        "courses_pass"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(424);
        })
    }); //added

    // it("1Firetruck: Should be able to find all courses in a dept except some specific examples.", function () {
    //     return insightFacade.performQuery(
    //         {"WHERE":
    //             {"AND": [
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_dept": "inst adul educ"
    //                         }
    //                     }
    //                 },
    //
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_dept": "*a*"
    //                         }
    //                     }
    //                 },
    //
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_dept": "*b*"
    //                         }
    //                     }
    //                 },
    //
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_dept": "*c*"
    //                         }
    //                     }
    //                 },
    //
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_dept": "d*"
    //                         }
    //                     }
    //                 },
    //
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_dept": "*e"
    //                         }
    //                     }
    //                 },
    //
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_dept": "*f"
    //                         }
    //                     }
    //                 },
    //
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_dept": "*g"
    //                         }
    //                     }
    //                 },
    //
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_dept": "*h"
    //                         }
    //                     }
    //                 },
    //
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_dept": "*i"
    //                         }
    //                     }
    //                 },
    //
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_instructor": "gossen, david"
    //                         }
    //                     }
    //                 }
    //
    //
    //             ]
    //             },
    //             "OPTIONS":{
    //                 "COLUMNS":[
    //                     "courses_dept"
    //                 ],
    //                 "ORDER":"courses_dept",
    //                 "FORM":"TABLE"
    //             }
    //         }).then(value => {
    //         // expect.fail();
    //         // Log.test('Value ' + value);
    //         expect(value.code).to.equal(200);
    //         // expect(value.body).to.equal({});
    //     }).catch(function (err:any) {
    //         Log.test('Error: ' + err);
    //         expect.fail();
    //         // expect(err.code).to.equal(400);
    //     })
    // }); //added

    //
    // it("Flamingo: Should be able to find all courses taught by a set of instructors.", function () {
    //     return insightFacade.performQuery(
    //         {"WHERE":
    //             {"OR": [
    //                 {
    //                     "IS":
    //                         {
    //                             "courses_instructor":"chan, jennifer"
    //                         }
    //                 },
    //
    //                 {
    //                     "IS":
    //                         {
    //                             "courses_instructor":"elfert, maren"
    //                         }
    //                 },
    //
    //                 {
    //                     "IS":
    //                         {
    //                             "courses_instructor":"vanwynsberghe, robert"
    //                         }
    //                 }
    //             ]
    //             },
    //             "OPTIONS":{
    //                 "COLUMNS":[
    //                     "courses_dept"
    //                 ],
    //                 "ORDER": "courses_dept",
    //                 "FORM":"TABLE"
    //             }
    //         }).then(value => {
    //         // expect.fail();
    //         // Log.test('Value ' + value);
    //         expect(value.code).to.equal(200);
    //         // expect(value.body).to.equal({});
    //     }).catch(function (err:any) {
    //         Log.test('Error: ' + err);
    //         expect.fail();
    //         // expect(err.code).to.equal(400);
    //     })
    // }); //added

    it("2Firetruck: Should be able to find all courses in a dept except some specific examples.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_dept": "inst adul educ"
                                }
                            }
                        },

                        {
                            "NOT": {
                                "IS": {
                                    "courses_dept": "*a*"
                                }
                            }
                        },

                        {
                            "NOT": {
                                "IS": {
                                    "courses_dept": "*b*"
                                }
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept"
                    ],
                    "ORDER": "courses_dept",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("3Firetruck: Should be able to find all courses in a dept except some specific examples.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "IS": {
                                "courses_dept": "inst adul educ"
                            }
                        },

                        {
                            "NOT": {
                                "GT": {
                                    "courses_avg": 95
                                }
                            }
                        },

                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "gossen, david"
                                }
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept"
                    ],
                    "ORDER": "courses_dept",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("4Firetruck: Should be able to find all courses in a dept except some specific examples.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "IS": {
                                "courses_dept": "inst adul educ"
                            }
                        },

                        {
                            "NOT": {
                                "IS": {
                                    "courses_title": "*i*"
                                }
                            }
                        },

                        {
                            "NOT": {
                                "IS": {
                                    "courses_uuid": "1342"
                                }
                            }
                        },

                        {
                            "NOT": {
                                "IS": {
                                    "courses_instructor": "*b*"
                                }
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_title"
                    ],
                    "ORDER": "courses_title",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("2Firetruck: Should be able to find all courses in a dept except some specific examples.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "NOT": {
                                "IS": {
                                    "courses_dept": "inst adul educ"
                                }
                            }
                        },

                        {
                            "NOT": {
                                "IS": {
                                    "courses_uuid": "1342"
                                }
                            }
                        },

                        {
                            "NOT": {
                                "IS": {
                                    "courses_dept": "*b*"
                                }
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept"
                    ],
                    "ORDER": "courses_dept",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added


    it("1Flamingo: Should be able to find all courses taught by a set of instructors.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "IS": {
                                "courses_instructor": "chan, jennifer"
                            }
                        },

                        {
                            "IS": {
                                "courses_instructor": "elfert, maren"
                            }
                        },

                        {
                            "IS": {
                                "courses_instructor": "vanwynsberghe, robert"
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept"
                    ],
                    "ORDER": "courses_dept",
                    "FORM": "TABLE"
                }
            }).then(value => {
            // expect.fail();
            // Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added


    it("2Flamingo: Should be able to find all courses taught by a set of instructors.", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "NOT": {
                        "LT": {
                            "courses_avg": 50
                        }
                    }

                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "stub_id",
                        "daddy_avg"
                    ],
                    "ORDER": "courses_dept",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(424);
        })
    }); //added

    it("IS error with simple query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "IS": {
                        "courses_avg": 97
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_avg",
                        "courses_uuid",
                        "courses_fail",
                        "courses_pass",
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }).then(value => {
            expect.fail();
            // Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("GT error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "courses_dept": 80
                                    }
                                },
                                {
                                    "IS": {
                                        "courses_dept": "adhe"
                                    }
                                }
                            ]
                        },
                        {
                            "EQ": {
                                "courses_avg": 95
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    }); //added

    it("LT error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "LT": {
                                        "courses_dept": 80
                                    }
                                },
                                {
                                    "IS": {
                                        "courses_dept": "adhe"
                                    }
                                }
                            ]
                        },
                        {
                            "EQ": {
                                "courses_avg": 95
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    }); //added

    it("EQ error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "courses_dept": 80
                                    }
                                },
                                {
                                    "IS": {
                                        "courses_dept": "adhe"
                                    }
                                }
                            ]
                        },
                        {
                            "EQ": {
                                "courses_avg": 95
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    }); //added

    it("1IS error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "LT": {
                                        "courses_avg": 30
                                    }
                                },
                                {
                                    "IS": {
                                        "courses_avg": "adhe"
                                    }
                                }
                            ]
                        },
                        {
                            "EQ": {
                                "courses_avg": 95
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    }); //added

    it("2IS error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "AND": [
                                {
                                    "LT": {
                                        "courses_avg1": 30
                                    }
                                },
                                {
                                    "IS": {
                                        "course_avg": "adhe"
                                    }
                                }
                            ]
                        },
                        {
                            "EQ": {
                                "courses_avg": 95
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(424);
        })
    }); //added


    it("GT  complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "courses_avg": 95
                                    }
                                },
                                {
                                    "IS": {
                                        "courses_instructor": "*a*"
                                    }
                                }
                            ]
                        },
                        {
                            "GT": {
                                "courses_fail": 5
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_instructor"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            // expect.fail();
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect(err.code).to.equal(400);
            expect.fail();
        })
    }); //added

    it("GT GT error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "course_dept": "adhe"
                                    }
                                },
                                {
                                    "IS": {
                                        "courses_instructor": "*a*"
                                    }
                                }
                            ]
                        },
                        {
                            "GT": {
                                "courses_fail": 5
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_instructor"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("LT error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "LT": {
                                        "course_dept": "adhe"
                                    }
                                },
                                {
                                    "IS": {
                                        "courses_instructor": "*a*"
                                    }
                                }
                            ]
                        },
                        {
                            "GT": {
                                "courses_fail": 5
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_instructor"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("EQT error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "course_dept": "adhe"
                                    }
                                },
                                {
                                    "IS": {
                                        "courses_instructor": "*a*"
                                    }
                                }
                            ]
                        },
                        {
                            "GT": {
                                "courses_fail": 5
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_instructor"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added

    it("3IS error with complex query", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "course_avg": 95
                                    }
                                },
                                {
                                    "IS": {
                                        "course_avg": 95
                                    }
                                }
                            ]
                        },
                        {
                            "GT": {
                                "courses_fail": 5
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_instructor"
                    ],
                    "ORDER": "courses_avg",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added


    it.only("Create a new rooms dataset with unique id", function () {
        return insightFacade.addDataset("rooms", zipContentForRooms).then(function (value: any) {
            Log.test('Value ' + value);
            var response: InsightResponse = {code: 204, body: {}};
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });
    it("Create a new rooms dataset with non-unique id", function () {
        return insightFacade.addDataset("rooms", zipContentForRooms).then(function (value: any) {
            Log.test('Value ' + value);
            var response: InsightResponse = {code: 201, body: {}};
            expect(value.code).to.equal(response.code);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });


    it("rooms test1", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "rooms_address": "adhe"
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_address": "*a*"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": "ANGU"
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_type",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "ORDER": "rooms_fullname",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added


    it("rooms test3", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "rooms_lat": 49.26486
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_address": "2053 Main Mall"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added
    it("rooms test2", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "IS": {
                        "rooms_address": "*Agrono*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_address",
                        "rooms_name"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("rooms test11", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "rooms_address": "adhe"
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_address": "*a*"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": "ANGU"
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_type",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "ORDER": "rooms_fullname",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect.fail();
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    }); //added


    it("rooms test4", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "rooms_lat": 49.26486
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_address": "*2053*"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("rooms test5", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "courses_": 49.26486
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_address": "*2053*"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    }); //add

    it("rooms test55", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "rooms_lat": 49.26826
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_href": "*BUCH-D322*"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //add

    it("rooms test6", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "IS": {
                                "courses_instructor": "chan, jennifer"
                            }
                        },

                        {
                            "IS": {
                                "courses_instructor": "elfert, maren"
                            }
                        },

                        {
                            "IS": {
                                "courses_instructor": "vanwynsberghe, robert"
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept"
                    ],
                    "ORDER": "courses_dept",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        })
    }); //add
    it("rooms test7", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "IS": {
                                "courses_instructor": "chan, jennifer"
                            }
                        },

                        {
                            "IS": {
                                "courses_instructor": "elfert, maren"
                            }
                        },

                        {
                            "IS": {
                                "courses_instructor": "vanwynsberghe, robert"
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept"
                    ],
                    "ORDER": "courses_dept",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        })
    }); //add
    it("courses yeartest", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "GT": {
                        "courses_year": 1900
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_year"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        })
    }); //add
    it.only("rooms test8", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "AND": [
                        {
                            "GT": {
                                "rooms_seats": 100
                            }
                        },
                        {
                            "IS": {
                                "rooms_fullname": "Buchanan"
                            }
                        }
                    ]

                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_fullname", "rooms_name", "rooms_seats"
                    ],
                    "ORDER": "rooms_seats",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    })
    it("courses yeartest2", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "IS": {
                        "courses_title": "*tion*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_year", "courses_title"
                    ],
                    "ORDER": "courses_year",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        })
    });//add
    it("rooms test9", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "IS": {
                        "rooms_furniture": "Classroom-Movable Tablets"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_fullname",
                        "rooms_name",
                        "rooms_furniture"
                    ],
                    "ORDER": "rooms_name",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added
//add

    it("rooms test10", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {

                    "AND": [{
                        "GT": {
                            "rooms_lat": 49.2612
                        }
                    },
                        {
                            "LT": {
                                "rooms_lat": 49.26129
                            }
                        },
                        {
                            "LT": {
                                "rooms_lon": -123.2480
                            }
                        },
                        {
                            "GT": {
                                "rooms_lon": -123.24809
                            }
                        }
                    ]

                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name", "rooms_fullname", "rooms_furniture", "rooms_href", "rooms_type", "rooms_address"
                    ],
                    "ORDER": "rooms_name",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            // expect.fail();
            Log.test('Value ' + value);
            expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
            // expect(err.code).to.equal(400);
        })
    }); //added

    it("rooms test11 invalid IS1", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "rooms_lat": 49.26486
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_name": 12345
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    });

    it("rooms test11 invalid IS2", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "rooms_lat": 49.26486
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_lat": "2053 Main Mall"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    });

    it("rooms test11 invalid LT1", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "LT": {
                                        "rooms_name": "BUCH_D304"
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_name": "BUCH_D304"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    });

    it("rooms test11 invalid LT2", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "LT": {
                                        "rooms_seats": "lol"
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_name": "BUCH_D304"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    });

    it("rooms test11 invalid GT1", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "rooms_name": "BUCH_D304"
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_name": "BUCH_D304"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    });

    it("rooms test11 invalid GT2", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "GT": {
                                        "rooms_seats": "lol"
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_name": "BUCH_D304"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    });

    it("rooms test11 invalid EQ1", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "rooms_name": "BUCH_D304"
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_name": "BUCH_D304"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    });

    it("rooms test11 invalid EQ2", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "OR": [
                        {
                            "AND": [
                                {
                                    "EQ": {
                                        "rooms_seats": "lol"
                                    }
                                },
                                {
                                    "IS": {
                                        "rooms_name": "BUCH_D304"
                                    }
                                }
                            ]
                        },
                        {
                            "IS": {
                                "rooms_shortname": 'ANGU'
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_fullname"
                    ],
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    });


    it("rooms test11 invalid EQ2", function () {
        return insightFacade.performQuery(
            {
                "WHERE": {
                    "IS": {
                        "rooms_area": "Classroom-Movable Tablets"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_fullname",
                        "rooms_name",
                        "rooms_furniture"
                    ],
                    "ORDER": "rooms_name",
                    "FORM": "TABLE"
                }
            }
        ).then(value => {
            expect.fail();
            Log.test('Value ' + value);
            // expect(value.code).to.equal(200);
            // expect(value.body).to.equal({});
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            // expect.fail();
            expect(err.code).to.equal(400);
        })
    });

    it("removeDataset with existing file", function () {
        return insightFacade.removeDataset('courses').then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(204);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added

    it('test perfrom query after data is removed', function () {
        return insightFacade.performQuery(query).then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            var response: InsightResponse = {
                code: 424, body: {"missing": ["courses"]}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
            expect(err.body).to.eql(response.body);
        })
    });
    it.only("removeDataset with existing file", function () {
        return insightFacade.removeDataset('rooms').then(value => {
            Log.test('Value ' + value);
            expect(value.code).to.equal(204);
        }).catch(function (err: any) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    }); //added
    it('test perfrom query after data is removed', function () {
        return insightFacade.performQuery(           {
            "WHERE": {
                "IS": {
                    "rooms_furniture": "Classroom-Movable Tablets"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname",
                    "rooms_name",
                    "rooms_furniture"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: any) {
            expect.fail();
        }).catch(function (err: any) {
            var response: InsightResponse = {
                code: 424, body: {"missing": ["rooms"]}
            };
            Log.test('Error: ' + err);
            expect(err.code).to.equal(response.code);
            expect(err.body).to.eql(response.body);
        })
    });
})