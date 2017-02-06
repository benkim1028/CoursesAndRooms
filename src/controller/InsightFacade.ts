import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');

var JSZip = require('jszip');


export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string) : Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            let promiseList: Promise<any>[] =[];
            let code:number = 0;
            let zip = new JSZip();
            fs.access(id + '.json', (err) => {
                if (!err) {
                    fs.unlink(id + '.json', (err) =>{
                        if (err) throw err;
                        code = 201; // id already existed
                    })
                }
                else {
                    code = 204; // id is new
                }
            });
            zip.loadAsync(content,{base64: true})
                .then(function (contents:any) {
                    let filepaths = Object.keys(contents.files);
                    if (filepaths.length  == 0) {
                        reject({code: 400, body: {"error": "my text"}});
                    }
                    else {
                        for (let filepath of filepaths) {
                            promiseList.push(zip.files[filepath].async('string'));
                        }
                    }
                    Promise.all(promiseList)
                        .then(data => {
                            // console.log(Object.keys(data));
                            // console.log(data[0]);
                            for (let each of data) {
                                let result:string = each[2] + each[3] + each[4] + each[5] + each[6] + each[7];
                                // console.log(result);
                                if (result != 'result') {
                                    var index = data.indexOf(each, 0);
                                    if (index > -1) {
                                        data.splice(index, 1);
                                    }
                                }
                            }
                            data.shift();
                            fs.writeFile(id + '.json', '[' + data + ']');
                            fulfill({code: code, body: {}});
                        })
                        .catch(function(){
                            reject({code: 400, body: {"error": "my text"}});
                        });
                })
                .catch(function() {
                    reject({code: 400, body: {"error": "my text"}});
                });
        })
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            fs.access(id + '.json', (err) => {
                if (err) {
                    reject({code: 404, body: {}});
                    return;
                } else if (!err) {
                    fs.unlink(id + '.json', (err) => {
                        if (!err) {
                            fulfill({code: 204, body: {}});
                            return;
                        }
                        else {
                            reject({code: 404, body: {}});
                            return;
                        }
                    })
                }
            })
        })
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return new Promise(function (fulfill, reject) {
            var globallist = dataFromLocal();
            try {
                //parse QueryRequest using EBFN and create a list = todoList
                let names: any[] = Object.keys(query);
                let body     = query[names[0]];
                let filterKey = Object.keys(body)[0];
                let filterValue = body[filterKey];
                let list = whatKindofFilter(filterKey, filterValue, globallist);
                let options = query[names[1]];
                let response = createModifiedList(list, options);
                console.log(response);

                fulfill({code: 200, body: response});
            } catch (e) {
                reject({code: 400, body: {"error": "my text"}});
            }
        })
    }
}

function whatKindofFilter(input: any, value: any, preList: any = []) {
    // this takes filter and its
    if (input == "OR") {             //logic comparison
        if (value.length == 0)
            throw "error";
        return createORList(value, preList);
    } else if (input == "AND") {
        if (value.length == 0)
            throw "error";
        return createANDList(value, preList);
    }
    var subKey: any = Object.keys(value);
    var subValue: any = value[subKey[0]];
    if (input == 'GT') {    // MComparison
        return createGTList(subKey[0], subValue, preList);
    }
    else if (input == 'LT') {
        return createLTList(subKey[0], subValue, preList);
    }
    else if (input == 'EQ') {     //SComparison
        return createEQList(subKey[0], subValue, preList);
    }
    else if (input == "IS") {
        return createISList(subKey[0], subValue, preList);
    } else if (input == "NOT") {
        return createNOTList(value, preList);
    }
}

function createNOTList(value: any, dataList: any[]): any[] {
    var key = Object.keys(value)[0];
    var keyValue = value[key];
    var response = whatKindofFilter(key, keyValue, dataList);
    var sortedList: any[] = [];
    for (var k = 0; k < response.length; k++) {
        for(var j= 0; j < dataList.length; j++) {
            if (response[k]["id"] != dataList[j]["id"])
                sortedList.push(response[k]);
        }
    }
    return sortedList;
}
function createORList(list: any[], preList: any[]): any[]{
    var sortedList: any[] = [];
    for(let i = 0; i < list.length; i++){
        var keysOfObject = Object.keys(list[i]);
        let response = whatKindofFilter(keysOfObject[0], list[i][keysOfObject[0]], preList);
        if(sortedList.length == 0){
            sortedList = response;
        } else {
            for (var j = 0; j < response.length; j++) {
                var counter = 0;
                for (var k = 0; k < sortedList.length; k++) {
                    if (sortedList[k]["id"] == response[j]["id"]) {
                        counter = 1;
                        break;
                    }
                }
                if (counter == 0)
                    sortedList.push(response[j])
            }
        }
    }
    return sortedList;
}

function createANDList(list: any[], preList: any[]): any[]{
    var Initialized = false;
    var resultlist: any[] = [];
    for(let i = 0; i < list.length; i++){
        var sortedList: any[] = [];
        var keysOfObject = Object.keys(list[i]);
        let response = whatKindofFilter(keysOfObject[0], list[i][keysOfObject[0]], preList);
        if (!Initialized) {
            resultlist = response;
            Initialized = true;
        } else {
            for (var j = 0; j < response.length; j++) {
                for (var k = 0; k < resultlist.length; k++) {
                    if (resultlist[k]["id"] == response[j]["id"]) {
                        sortedList.push(response[j]);
                    }
                }
            }
            resultlist = sortedList;
        }
    }
    return resultlist;
}
function createGTList(key: string, value: number, dataList: any[]): any[] {
    var sortedList: any[] = [];
    var realKey = findKey(key);
    for(let i = 0; i < dataList.length; i++){
        if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] > value) {
            sortedList.push(dataList[i]);
        }
        else if (typeof (dataList[i][realKey]) !== 'number' ) {
            throw "error";
        }
    }
    return sortedList;
}
function createLTList(key: string, value: number, dataList: any[]): any[] {
    var sortedList: any[] = [];
    var realKey = findKey(key);
    for(let i = 0; i < dataList.length; i++){
        if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] < value) {
            sortedList.push(dataList[i]);
        }
        else if (typeof (dataList[i][realKey]) !== 'number' ) {
            throw "error";
        }
    }
    return sortedList;
}

function createEQList(key: string, value: number, dataList: any[]): any[] {
    var sortedList: any[] = [];
    var realKey = findKey(key);
    for(let i = 0; i < dataList.length; i++){
        if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] == value) {
            sortedList.push(dataList[i]);
        }
        else if (typeof (dataList[i][realKey]) !== 'number' ) {
            throw "error";
        }
    }
    return sortedList;
}

function createISList(key: string, value: string, dataList: any[]): any[] {
    var sortedList: any[] = [];
    var realKey = findKey(key);
    //var regex = /[a-z]+(\\;|\\-|\\s)?[a-z]*(\\,[a-z]+(\\;|\\-|\\s)?[a-z]*)*/
    for(let i = 0; i < dataList.length; i++){
        if (typeof (dataList[i][realKey]) === 'string') {
            if (/^\\*.*$/.test(value)){
                var patt = new RegExp("[a-z]+(\\;|\\-|\\s)?[a-z]*(\\,[a-z]+(\\;|\\-|\\s)?[a-z]*)*");
                var res = patt.exec(value);// getting only strings from *....*
                var newregex = new RegExp ("^.*" + (res[0]));
                if(newregex.test(dataList[i][realKey]))
                    sortedList.push(dataList[i]);
            }
            else if (/^.*\\*$/.test(value)){
                var patt = new RegExp("[a-z]+(\\;|\\-|\\s)?[a-z]*(\\,[a-z]+(\\;|\\-|\\s)?[a-z]*)*");
                var res = patt.exec(value);// getting only strings from *....*
                var newregex = new RegExp ((res[0]) + ".*$")
                if(newregex.test(dataList[i][realKey]))
                    sortedList.push(dataList[i]);
            }

            else if (/\\*.*\\*/.test(value)){
                var patt = new RegExp("[a-z]+(\\;|\\-|\\s)?[a-z]*(\\,[a-z]+(\\;|\\-|\\s)?[a-z]*)*");
                var res = patt.exec(value);// getting only strings from *....*
                var newregex = new RegExp ("^.*" + (res[0]) + ".*$")
                if(newregex.test(dataList[i][realKey]))
                    sortedList.push(dataList[i]);
            }

            else if (dataList[i][realKey] == value) {
                sortedList.push(dataList[i]);
            }
        }
        else if (typeof (dataList[i][realKey]) !== 'string' ) {
            throw "error";
        }
    }
    return sortedList;
}

function dataFromLocal(): any {
    // return data's from local file
    var test = fs.readFileSync('courses.json', 'utf-8');
    var parsed: any = JSON.parse(test);
    var list: any [] = [];
    // console.log(k);
    for (let element of parsed) {           // element = {"result":[...] , "rank":0}
        let keys = Object.keys(element);  // keys = ["result", "rank"]
        var course_info = element[keys[0]];  // course_info = value of result = [{....}]
        for (let each of course_info) {// each = each object in result
            if (each != [])
                list.push(each);
        }
    }
    return list;
}


function findKey(key: string) : string {
    if(key == "courses_dept")
        return "Subject";
    if(key == "courses_id")
        return "Course";
    if(key == "courses_avg")
        return "Avg";
    if(key == "courses_instructor")
        return "Professor";
    if(key == "courses_title")
        return "Title";
    if(key == "courses_pass")
        return "Pass";
    if(key == "courses_fail")
        return "Fail";
    if(key == "courses_audit")
        return "Audit";
    if(key == "courses_uuid")
        return "id";
    else
        throw "error";
}

function createModifiedList(list: any, options: any): any {
    let output: any = {'render': '','result': []};
    let newlist: any[] = [];
    let form = Object.keys(options)[2];
    output['render'] = options[form];
    let columnsKey = Object.keys(options)[0];
    let columnsValue = options[columnsKey];
    if (columnsValue == 0){
        throw "error";
    }
    for(let i = 0; i < list.length; i++){
        let element: any = {};
        for(let j = 0; j < columnsValue.length; j++){
            let key = findKey(columnsValue[j]);
            element[columnsValue[j]] = list[i][key];
        }
        newlist.push(element);
    }
    let order = Object.keys(options)[1];
    let orderValue = options[order];
    newlist.sort(sort_by(orderValue, false, parseFloat));
    for(let i = 0; i < newlist.length; i++)
        output['result'].push(newlist[i]);
    return output;
}

var sort_by = function(field: any, reverse: any, primer: any){

    var key = primer ?
        function(x: any) {return primer(x[field])} :
        function(x: any) {return x[field]};

    reverse = !reverse ? 1 : -1;

    return function (a: any, b: any) {
        return a = key(a), b = key(b), reverse * (<any>(a > b) - <any>(b > a));
    }
}

