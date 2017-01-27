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



function convert_to_code(key:string ):string {
    if (key == 'courses_avg') {
        return 'Avg';
    }
    else if (key == 'courses_dept') {
        return 'Subject';
    }
    else if (key == 'courses_id') {
        return 'Course';
    }
    else if (key == 'courses_instructor') {
        return 'Professor';
    }
    else if (key == 'courses_title') {
        return 'title';
    }
    else if (key == 'courses_pass') {
        return 'Pass';
    }
    else if (key == 'courses_fail') {
        return 'Fail';
    }
    else if (key == 'courses_audit') {
        return 'Audit';
    }
    else if (key == 'courses_uuid') {
        return 'id';
    }
}




function return_LTGTEQ(query:any) {
    let keys = Object.keys(query);
    for (let key of keys) {
        if (key == 'WHERE') {
            let where_Contents = query[key];
            for (let key of Object.keys(where_Contents)) {
                if (key == 'LT') {
                    return 'LT';
                }
                else if (key == 'GT') {
                    return 'GT';
                }
                else if (key == 'EQ') {
                    return 'EQ';
                }
            }
        }
    }
}

function return_LTGTEQ_Key(query:any):string {
    let key = return_LTGTEQ(query);
    let where_Contents = query["WHERE"];
    let LTGTEQ_Key = Object.keys(where_Contents[key])[0];
    return LTGTEQ_Key; //avg


}

function return_LTGTEQ_Key_Value(query:any):number {
    let key = return_LTGTEQ(query);
    let where_Contents = query["WHERE"];
    let LTGTEQ_Key_Value = where_Contents[key][return_LTGTEQ_Key(query)];
    return LTGTEQ_Key_Value; //score
}

function return_columns(query:any) {
    let keys = Object.keys(query);
    for (let key of keys) {
        if (key == "OPTIONS") {
            let optionsVal = query[key]; // { COLUMNS: [ 'courses_dept', 'courses_avg' ],ORDER: 'courses_avg', FORM: 'TABLE' }
            // console.log(optionsVal);
            let optionsKeys = Object.keys(optionsVal);
            console.log(optionsKeys);
            for (let optionsKey of optionsKeys){
                if (optionsKey == "COLUMNS"){
                    let optionVal = optionsVal[optionsKey]; //[ 'courses_dept', 'courses_avg' ]
                    return optionVal;
                }

            }

        }
    }
}

function return_Order(query:any) {
    let keys = Object.keys(query);
    for (let key of keys) {
        if (key == "OPTIONS") {
            let optionsVal = query[key]; // { COLUMNS: [ 'courses_dept', 'courses_avg' ],ORDER: 'courses_avg', FORM: 'TABLE' }
            // console.log(optionsVal);
            let optionsKeys = Object.keys(optionsVal);
            console.log(optionsKeys);
            for (let optionsKey of optionsKeys){
                if (optionsKey == "ORDER"){
                    let optionVal = optionsVal[optionsKey]; //[ 'courses_dept', 'courses_avg' ]
                    return optionVal;
                }

            }

        }
    }
}

function return_Form(query:any) {
    let keys = Object.keys(query);
    for (let key of keys) {
        if (key == "OPTIONS") {
            let optionsVal = query[key]; // { COLUMNS: [ 'courses_dept', 'courses_avg' ],ORDER: 'courses_avg', FORM: 'TABLE' }
            // console.log(optionsVal);
            let optionsKeys = Object.keys(optionsVal);
            console.log(optionsKeys);
            for (let optionsKey of optionsKeys){
                if (optionsKey == "FORM"){
                    let optionVal = optionsVal[optionsKey]; //[ 'courses_dept', 'courses_avg' ]
                    return optionVal;
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
            let columns = return_columns(query);
            console.log(columns);
            let order = return_Order(query);
            console.log("order is " + order);
            let form = return_Form(query);
            console.log("Form is " + form);
            let output: any = {'render': '','result': []};
            let mcomparion = return_LTGTEQ(query);
            let mcomparison_Key = return_LTGTEQ_Key(query);
            let mcomparison_Key_Value = return_LTGTEQ_Key_Value(query);
            let convtered_code = convert_to_code(mcomparison_Key);
            if (form != undefined) {
                output['render'] = form;
            }
            var data = fs.readFileSync('testfile.json', 'utf-8');
            var parse_data:any = JSON.parse(data);
            let total:any= {};
            for (let item of parse_data) {
                var keys = Object.keys(item);
                var course_info = item[keys[0]];
                //console.log(course_info);
                for (let each of course_info) {
                    var keys = Object.keys(each);
                    for (let item of keys) {
                        //console.log(item);
                        if(item == convtered_code) {
                            // console.log(item);
                            if (mcomparion == 'LT') {
                                if (mcomparison_Key_Value > each[convtered_code]) {
                                    for (let column of columns) {
                                        let obj = Object.assign(total, {[column]: each[convert_to_code(column)]});
                                        output['result'].push(obj);
                                    }
                                    total = {};

                                }
                                // output['result'].push(total);
                            }

                            else if (mcomparion == 'GT') {
                                if (mcomparison_Key_Value < each[convtered_code]) {
                                    for (let column of columns) {
                                        let obj = Object.assign(total, {[column]: each[convert_to_code(column)]});
                                        output['result'].push(obj);
                                    }
                                    total = {};

                                }

                            }
                            else if (mcomparion == 'EQ') {
                                if (mcomparison_Key_Value == each[convtered_code]) {
                                    for (let column of columns) {
                                        let obj = Object.assign(total, {[column]: each[convert_to_code(column)]});
                                        output['result'].push(obj);
                                    }
                                    total = {};
                                }
                            }

                        }
                    }
                }

            }
            //output['result'].push(total);

            console.log(output);
            // reject({code: 400, body: {"error": "my text"}});
            fulfill({code: 201, body: {}})
        })




    }
}