/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');


const JSZip = require('jszip');
const zip = new JSZip();

let query:QueryRequest = {"WHERE":
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
};

function string_to_op(s_op:string, k:number):boolean {
    let x = Number(s_op.substring(2));
    if (s_op.charAt(1) == '>') {
        return k > x;
    }
    else if (s_op.charAt(1) == '<') {
        return k < x;
    }

    else if (s_op.charAt(1) == '=') {
        return k == x;
    }
}

function classify(s_op:string):string {
    let creiterion = s_op.charAt(0);
    if (creiterion == 'a') {
        return 'Avg';
    }
    else if  (creiterion == 'p') {
        return 'Pass';
    }
    else if  (creiterion == 'f') {
        return 'Fail';
    }
    else if  (creiterion == 't') {
        return 'Audt';
    }

}




function q(query:any) {
    let keys = Object.keys(query);
    for (let key of keys) {
        if (key == "WHERE") {
            let whereVal = query[key];
            let whereKeys = Object.keys(whereVal);
            for (let wherekey of whereKeys){
                let gtVal = whereVal[wherekey];
                let gtKeys = Object.keys(gtVal);
                for (let gtKey of gtKeys) {
                    if (gtKey == "courses_avg"){
                        let avg = gtVal[gtKey];
                        if (wherekey == 'GT'){
                            return 'a' + '>' + avg;
                        }
                        else if (wherekey == 'LT') {
                            return 'a' + '<' + avg;
                        }
                        else if (wherekey == 'EQ') {
                            return 'a' + '=' + avg;
                        }
                    }

                    else if (gtKey == "courses_pass"){
                        let pass = gtVal[gtKey];
                        if (wherekey == 'GT'){
                            return 'p' + '>' + pass;
                        }
                        else if (wherekey == 'LT') {
                            return 'p' + '<' + pass;
                        }
                        else if (wherekey == 'EQ') {
                            return 'p' + '=' + pass;
                        }
                    }

                    else if (gtKey == "courses_fail"){
                        let fail = gtVal[gtKey];
                        console.log('cf');
                        if (wherekey == 'GT'){
                            return 'f' + '>' + fail;
                        }
                        else if (wherekey == 'LT') {
                            return 'f' + '<' + fail;
                        }
                        else if (wherekey == 'EQ') {
                            return 'f' + '=' + fail;
                        }
                    }

                    else if (gtKey == "courses_audit"){
                        let audit = gtVal[gtKey];
                        if (wherekey == 'GT'){
                            return 't' + '>' + audit;
                        }
                        else if (wherekey == 'LT') {
                            return 't' + '<' + audit;
                        }
                        else if (wherekey == 'EQ') {
                            return 't' + '=' + audit;
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
                    let filepaths = Object.keys(contents.files);
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
            let output: any = {'result': []};
            // let promiseList: Promise<any>[] =[];
            var data = fs.readFileSync('testfile.json', 'utf-8');
            var parse_data:any = JSON.parse(data);
            // console.log(k);
            for (let item of parse_data) {
                // console.log(t);
                var keys = Object.keys(item);
                var course_info = item[keys[0]];
                // console.log(course_info);
                for (let each of course_info){
                    var keys = Object.keys(each);
                    // console.log(keys);
                    for (let key of keys) {
                        if (classify(foo) == 'Avg') {
                            if (key == 'Avg' && string_to_op(foo, each['Avg'])) {
                                // console.log(each['Avg']);
                                output['result'].push({courses_avg: each[key]});
                                console.log(output);
                            }
                        }
                        else if (classify(foo) == 'Pass') {
                            if (key == 'Pass' && string_to_op(foo, each[key])) {
                                // let output:any = {'result': []};
                                output['result'].push({courses_pass: each[key]});

                            }
                        }
                        else if (classify(foo) == 'Fail') {
                            if (key == 'Fail' && string_to_op(foo, each['Fail'])) {
                                // let output:any = {'result': []};
                                output['result'].push({courses_fail: each[key]});
                                console.log(output);
                            }
                        }
                        else if (classify(foo) == 'Audit') {
                            if (key == 'Audit' && string_to_op(foo, each['Audit'])) {
                                // let output:any = {'result': []};
                                output['result'].push({courses_audit: each[key]});
                                console.log(output);
                            }
                        }
                    }

                }
            }

            console.log(output);
            // reject({code: 400, body: {"error": "my text"}});
            fulfill({code: 201, body: {}})
        })




    }
}