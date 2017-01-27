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


function filter(query:any) {
    let keys = Object.keys(query);
    for (let key of keys) {
        if (key == "WHERE") {
            let whereVal = query[key];
            let whereKeys = Object.keys(whereVal);
            for (let wherekey of whereKeys) {
                let gtVal = whereVal[wherekey];
                let gtKeys = Object.keys(gtVal);
                if (wherekey == 'OR') {
                    for (let gtKey of gtKeys) {
                        if (gtKey == 'OR') {

                        }

                    }

                }
            }
        }
    }
}

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
        return 'Audit';
    }

}

function mathComparison(query:any) {
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
                        let avg_number:number = gtVal[gtKey];
                        if (wherekey == 'GT'){
                            return 'a' + '>' + avg_number;
                        }
                        else if (wherekey == 'LT') {
                            return 'a' + '<' + avg_number;
                        }
                        else if (wherekey == 'EQ') {
                            return 'a' + '=' + avg_number;
                        }
                    }

                    else if (gtKey == "courses_pass"){
                        let pass_number:number = gtVal[gtKey];
                        if (wherekey == 'GT'){
                            return 'p' + '>' + pass_number;
                        }
                        else if (wherekey == 'LT') {
                            return 'p' + '<' + pass_number;
                        }
                        else if (wherekey == 'EQ') {
                            return 'p' + '=' + pass_number;
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

function sComparison(query:any) {
    let keys = Object.keys(query);
    for (let key of keys) {
        if (key == "WHERE") {
            let whereVal = query[key];
            let whereKeys = Object.keys(whereVal);
            for (let wherekey of whereKeys) {
                let gtVal = whereVal[wherekey];
                let gtKeys = Object.keys(gtVal);
                if (wherekey == 'IS') {
                    for (let gtKey of gtKeys) {
                        if (gtKey == "courses_dept") {
                            let courses_dept: string = gtVal[gtKey];
                            return courses_dept;
                        }
                        else if (gtKey == "courses_id") {
                            let courses_id: string = gtVal[gtKey];
                            return courses_id;
                        }
                        else if (gtKey == "courses_instructor") {
                            let courses_instructor: string = gtVal[gtKey];
                            return courses_instructor;
                        }
                        else if (gtKey == "courses_title") {
                            let courses_title: string = gtVal[gtKey];
                            return courses_title;
                        }
                        else if (gtKey == "courses_uuid") {
                            let courses_uuid: string = gtVal[gtKey];
                            return courses_uuid;
                        }
                    }
                }
            }
        }
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
            let foo = mathComparison(query);
            console.log(foo);
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
                                        Object.assign(total, {[column]: each[convert_to_code(column)]});
                                        output['result'].push(total);
                                    }

                                }
                                // output['result'].push(total);
                            }

                            else if (mcomparion == 'GT') {
                                if (mcomparison_Key_Value < each[convtered_code]) {
                                    for (let column of columns) {
                                        Object.assign(total, {[column]: each[convert_to_code(column)]});
                                        // output['result'].push(total);
                                    }

                                }
                                // output['result'].push(total);
                            }
                            else if (mcomparion == 'QT') {
                                if (mcomparison_Key_Value == each[convtered_code]) {
                                    for (let column of columns) {
                                        Object.assign(total, {[column]: each[convert_to_code(column)]});
                                        output['result'].push(total);
                                    }
                                }
                            }
                            output['result'].push(total);
                        }
                    }
                }
            }
            // output['result'].push(total);
            console.log(output);
            // reject({code: 400, body: {"error": "my text"}});
            fulfill({code: 201, body: {}})
        })




    }
}