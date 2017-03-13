/**
 * Created by mobileheo on 2017-03-12.
 */
import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import fs = require('fs');
import chai = require('chai');
import ChaiHttp = require('chai-http');
chai.use(ChaiHttp);

describe("RestTest", function () {
    var new_Server:Server = new Server(4321);
    let url = 'http://localhost:4321';
    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
        new_Server.start().then().catch();
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);

    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
        new_Server.stop().then().catch();
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
        //zipContent = null;

    });

    it("PUT with addDataset(courses) returns 204", function () {
        return chai.request(url)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "courses.zip")
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(204);
            });

    });

    it("PUT with addDataset(courses) returns 201", function () {
        return chai.request(url)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "courses.zip")
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
            });
    });

    it("PUT with addDataset(rooms) returns 204", function () {
        return chai.request(url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(204);
            });

    });



    it("PUT with addDataset(rooms) returns 201", function () {
        return chai.request(url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
            });
    });

    it("post query1 for courses returns 201", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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
                }
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it(" fsfdf apost query2 for courses returns 400", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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
                }

            ).end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query3 for courses returns 200", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": "courses_avg",
                        "FORM": "TABLE"
                    }
                }
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query4 for courses returns 200", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query5 for courses returns 400", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query6 for courses returns 400", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query7 for courses returns 400", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query8 for courses returns 400", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query9 for courses returns 200", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query10 for courses returns 200", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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
                }
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query11 for courses returns 424", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(424);
            });
    });

    it("post query12 for courses returns 424", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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
                }
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(424);
            });
    });

    it("post query13 for courses returns 424", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(424);
            });
    });

    it("post query14 for courses returns 400", function () {
        return chai.request(url)
            .post('/dataset/courses')
            .query(
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

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query1 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query2 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query3 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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


            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query4 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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


            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query5 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query6 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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



            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query7 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query8 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query9 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query10 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query11 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query11 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                        "AND": [{"GT": {"rooms_lat": 49.2612}},
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query12 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query13 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query14 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query15 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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


            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query16 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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


            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query17 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query18 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                        "AND": [
                            {"IS": {"rooms_furniture": "*Tables*"}},
                            {"GT": {"rooms_seats": 300}}
                        ]
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_name",
                            "avgSeats",
                            "rooms_shortname",
                            "maxLat"


                        ],
                        "ORDER": "avgSeats",
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": [
                            "rooms_shortname",
                            "rooms_name"
                        ],
                        "APPLY": [
                            {
                                "maxLat": {
                                    "MAX": "rooms_lat"
                                }
                            },
                            {
                                "avgSeats": {
                                    "MAX": "rooms_seats"
                                }
                            },
                            {
                                "avSeats": {
                                    "MAX": "rooms_seats"
                                }
                            }
                        ]
                    }
                }
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query19 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                        "AND": [
                            {
                                "IS": {
                                    "rooms_furniture": "*Tables*"
                                }
                            },
                            {
                                "GT": {
                                    "rooms_seats": 300
                                }
                            }
                        ]
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "avgSeats"

                        ],
                        "ORDER": "avgSeats",
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": [
                            "rooms_shortname"
                        ],
                        "APPLY": [
                            {
                                "avgSeats": {
                                    "AVG": "rooms_seats"
                                }
                            },
                            {
                                "maxSeats": {
                                    "MAX": "rooms_seats"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query20 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                        "AND": [
                            {
                                "IS": {
                                    "rooms_furniture": "*Tables*"
                                }
                            },
                            {
                                "GT": {
                                    "rooms_seats": 300
                                }
                            }
                        ]
                    },
                    "OPTIONS": {
                        "COLUMNS": [

                            "rooms_name",
                            "avgSeats"


                        ],
                        "ORDER": "avgSeats",
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": [
                            "rooms_shortname",
                            "rooms_name"
                        ],
                        "APPLY": [
                            {
                                "roomsname": {
                                    "AVG": "rooms_seats"
                                }
                            },
                            {
                                "avgSeats": {
                                    "MAX": "rooms_seats"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query21 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                        "AND": [
                            {"IS": {"rooms_furniture": "*Tables*"}},
                            {"GT": {"rooms_seats": 200}}
                        ]
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_name",
                            "avgSeats",
                            "rooms_shortname",
                            "maxLat"


                        ],
                        "ORDER": "avgSeats",
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": [
                            "rooms_shortname",
                            "rooms_name"
                        ],
                        "APPLY": [
                            {
                                "maxLat": {
                                    "MAX": "rooms_lat"
                                }
                            },
                            {
                                "avgSeats": {
                                    "MAX": "rooms_seats"
                                }
                            },
                            {
                                "avSeats": {
                                    "MAX": "rooms_seats"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query22 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                        "AND": [
                            {"EQ": {"rooms_lat": 49.26236}},
                            {"GT": {"rooms_seats": 300}}
                        ]
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "rooms_lat",
                            "maxSeats"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["maxSeats"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname", "rooms_name", "rooms_lat"],
                        "APPLY": [{
                            "maxSeats": {
                                "MAX": "rooms_seats"
                            }
                        }]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query23 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                        "AND": [
                            {"EQ": {"rooms_lat": 49.26236}},
                            {"GT": {"rooms_seats": 200}}
                        ]
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "minLon",
                            "rooms_lat",
                            "maxSeats"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["maxSeats"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname", "rooms_name", "rooms_lat"],
                        "APPLY": [
                            {
                                "maxSeats": {
                                    "MAX": "rooms_seats"
                                }
                            },
                            {
                                "minLon": {
                                    "MIN": "rooms_lon"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query24 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                        "AND": [
                            {"LT": {"rooms_seats": 300}},
                            {"GT": {"rooms_seats": 100}}
                        ]
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "countRoom",
                            "rooms_lat",
                            "maxSeats"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["rooms_shortname", "maxSeats"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname", "rooms_lat"],
                        "APPLY": [
                            {
                                "maxSeats": {
                                    "MAX": "rooms_seats"
                                }
                            },
                            {
                                "countRoom": {
                                    "COUNT": "rooms_name"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query25 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "maxSeats"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["rooms_shortname"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname"],
                        "APPLY": [
                            {
                                "maxSeats": {
                                    "MAX": "rooms_seats"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query26 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname"
                        ],
                        "ORDER": "rooms_shortname",
                        "FORM": "TABLE"
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query27 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "rooms_name",
                            "rooms_address"
                        ],
                        "ORDER": "rooms_address",
                        "FORM": "TABLE"
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query28 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "maxSeats",
                            "minSeats"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["rooms_shortname", "maxSeats", "minSeats"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname"],
                        "APPLY": [
                            {
                                "maxSeats": {
                                    "MAX": "rooms_seats"
                                }
                            },
                            {
                                "minSeats": {
                                    "MIN" : "rooms_seats"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query29 for rooms returns 200", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["rooms_shortname"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname"],
                        "APPLY": []
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });

    it("post query30 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "maxSeats"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["rooms_shortname", "maxSeats"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname"],
                        "APPLY": [
                            {
                                "maxSeats": {
                                    "MAX": "rooms_shortname"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query31 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "sumSeats"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["rooms_shortname", "sumSeats"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname"],
                        "APPLY": [
                            {
                                "sumSeats": {
                                    "SUM": "rooms_seats"
                                }
                            },
                            {
                                "sumSeats": {
                                    "SUM": "rooms_seats"
                                }
                            }
                        ]
                    }
                }
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query32 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname"
                        ],
                        "ORDER": {
                            "keys": ["rooms_shortname"]
                        },
                        "FORM": "TABLE"
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query33 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname"
                        ],
                        "ORDER": {
                            "keys": ["rooms_shortname"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname"],
                        "APPLY": [
                            {
                                "maxSeats": {
                                    "MAX": "rooms_seats"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query34 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname"
                        ],
                        "ORDER": {
                            "dir": "DOWN"
                        },
                        "FORM": "TABLE"
                    }
                }
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });
    

    it("post query35 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": []
                        },
                        "FORM": "TABLE"
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query36 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": []
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname"],
                        "APPLY": [
                            {
                                "maxSeats": {
                                    "MAX": "rooms_seats"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query37 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["rooms_short"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname"],
                        "APPLY": [
                            {
                                "maxSeats": {
                                    "MAX": "rooms_seats"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query38 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "maxSeats"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["rooms_shortname"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_short"]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query39 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "maxSeats"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["rooms_shortname"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": [],
                        "APPLY": [
                            {
                                "maxSeats": {
                                    "MAX": "rooms_seats"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });

    it("post query40 for rooms returns 400", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
                {
                    "WHERE": {
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "max_Seats"
                        ],
                        "ORDER": {
                            "dir": "DOWN",
                            "keys": ["rooms_shortname"]
                        },
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname", "max_Seats"],
                        "APPLY": [
                            {
                                "max_Seats": {
                                    "MAX": "rooms_seats"
                                }
                            }
                        ]
                    }
                }

            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });
    });
    


    it("PUT with addDataset(courses, invalid zip file) returns 400", function () {
            // var chai = require('chai');
            return chai.request(url)
                .put('/dataset/courses')
                .attach("body", fs.readFileSync("./fake_courses.zip"), "fake_courses.zip")
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                });

    });

    it("PUT with addDataset(course, non-zip.file) returns 400", function () {
        // var chai = require('chai');
        return chai.request(url)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./README.md"), "nothing")
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
            });

    });

    it("Del Dataset(courses) returns 204", function () {
        return chai.request(url)
            .del('/dataset/courses')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(204);
            });
    });

    it("Del with addDataset(rooms) returns 204", function () {
        return chai.request(url)
            .del('/dataset/rooms')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(204);
            });
    });

    it("Del Dataset(courses) returns 404", function () {
        return chai.request(url)
            .del('/dataset/courses')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
            });
    });

    it("Del Dataset(rooms) returns 404", function () {
        return chai.request(url)
            .del('/dataset/rooms')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
            });
    });

    it("post query for rooms returns 424 after rooms dataset removed", function () {
        return chai.request(url)
            .post('/dataset/rooms')
            .query(
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
            )
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(424);
            });
    });


})