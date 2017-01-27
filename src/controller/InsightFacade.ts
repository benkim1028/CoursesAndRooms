/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');


var JSZip = require('jszip');
var zip = new JSZip();

var query:QueryRequest = {"WHERE":
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
function string_to_op(s_op:string, k:number):boolean {
    var x = Number(s_op.substring(1));
    if (s_op.charAt(0) == '>') {
        return k > x;
    }
    else if (s_op.charAt(0) == '<') {
        return k < x;
    }

    else if (s_op.charAt(0) == '=') {
        return k == x;
    }
}

function q(query:any) {
    var keys = Object.keys(query);
    for (let key of keys) {
        if (key == "WHERE") {
            var whereVal = query[key];
            var whereKeys = Object.keys(whereVal);
            for (let wherekey of whereKeys){
                var gtVal = whereVal[wherekey];
                var gtKeys = Object.keys(gtVal);
                for (let gtKey of gtKeys) {
                    if (gtKey == "courses_avg"){
                        var avg = gtVal[gtKey];
                        if (wherekey == 'GT'){
                            return '>' + avg;
                        }
                        else if (wherekey == 'LT') {
                            return '<' + avg;
                        }
                        else if (wherekey == 'EQ') {
                            return '=' + avg;
                        }
                    }

                    else if (gtKey == "courses_pass"){
                        var pass = gtVal[gtKey];
                        if (wherekey == 'GT'){
                            return '>' + pass;
                        }
                        else if (wherekey == 'LT') {
                            return '<' + pass;
                        }
                        else if (wherekey == 'EQ') {
                            return '=' + pass;
                        }
                    }

                    else if (gtKey == "courses_fail"){
                        var fail = gtVal[gtKey];
                        if (wherekey == 'GT'){
                            return '>' + fail;
                        }
                        else if (wherekey == 'LT') {
                            return '<' + fail;
                        }
                        else if (wherekey == 'EQ') {
                            return '=' + fail;
                        }
                    }

                    else if (gtKey == "courses_audit"){
                        var audit = gtVal[gtKey];
                        if (wherekey == 'GT'){
                            return '>' + audit;
                        }
                        else if (wherekey == 'LT') {
                            return '<' + audit;
                        }
                        else if (wherekey == 'EQ') {
                            return '=' + audit;
                        }
                    }
                }

            }

        }
    }
}


export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()')
    }

    addDataset(id: string, content: string) : Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            let promiseList: Promise<any>[] =[];
            let code:number = 0;
            zip.loadAsync(content,{base64: true})
                .then(function (contents:any) {
                    var filepaths = Object.keys(contents.files);
                    for (let filepath of filepaths) {
                        promiseList.push(zip.files[filepath].async('string'));

                    }
                    fs.access(id + '.json', (err) => {
                        if (!err) {
                            fs.unlink(id + '.json', (err) =>{
                                if (err) throw err;
                            })
                            code = 201; // id already existed

                        }
                        else {
                            code = 204; // id is new
                        }
                        Promise.all(promiseList)
                            .then(data => {
                                data.shift();
                                fs.writeFile(id + '.json', '[' + data + ']');
                                fulfill({code: code, body: {}});
                            })
                            .catch(function(){
                                reject({code: 400, body: {"error": "my text"}});
                            });

                    });
                })
                .catch(function() {
                   reject({code: 400, body: {"error": "my text"}});
                });
        })
    }
    removeDataset(id: string): Promise<InsightResponse> {
        return null;
    }
    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return new Promise(function (fulfill, reject) {
            var foo = q(query);
            console.log(foo);
            let promiseList: Promise<any>[] =[];
            var test = fs.readFileSync('testfile.json', 'utf-8');
            var k:any = JSON.parse(test);
            // console.log(k);
            for (let t of k) {
                // console.log(t);
                var keys = Object.keys(t);
                var course_info = t[keys[0]];
                // console.log(course_info);
                for (let each of course_info){
                    var keys = Object.keys(each);
                    // console.log(keys);
                    for (let key of keys) {
                        if (key == 'Avg' && string_to_op(foo, each[key])) {
                            console.log(each[key]);
                        }
                        else if (key == 'Fail' && string_to_op(foo, each[key])) {
                            console.log(each[key]);
                        }
                        else if (key == 'Pass' && string_to_op(foo, each[key])) {
                            console.log(each[key]);
                        }
                        else if (key == 'Audit' && string_to_op(foo, each[key])) {
                            console.log(each[key]);
                        }
                    }
                }

            }


            // reject({code: 400, body: {"error": "my text"}});
            fulfill({code: 201, body: {}})
        })




    }
}
