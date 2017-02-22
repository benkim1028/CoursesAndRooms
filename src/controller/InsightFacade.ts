import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');
import {isNullOrUndefined} from "util";

var JSZip = require('jszip');
const parse5 = require('parse5');
var request = require('request');



let DataList: any = {};
class DoEveryThing {
    fail: boolean;
    fail_for_424: boolean;
    fail_for_missingKey: boolean;
    returnMessage: string;
    missingIds: string[];

    constructor() {
        Log.trace('Doeverything::init()');
        this.fail = false;
        this.fail_for_424 = false;
        this.fail_for_missingKey = false;
        this.missingIds = [];

    }

    whatKindofFilter(key: any, value: any, preList: any = [], not: boolean = true) {
        if (this.fail == true)
            return this.returnMessage;
        // this takes filter and its
        let input = key;
        if (input == "OR" && not == false)
            input = "AND";
        if (input == "AND" && not == false)
            input = "OR";
        if (input == "OR") {//logic comparison
            if (value.length == 0) {
                this.fail = true;
                this.returnMessage = "OR has no data"
                return this.returnMessage;
            }
            return this.createORList(value, preList, not);
        } else if (input == "AND") {
            if (value.length == 0) {
                this.fail = true;
                this.returnMessage = "AND has no data"
                return this.returnMessage;
            }
            return this.createANDList(value, preList, not);
        }
        let subKey: any = Object.keys(value);
        let subValue: any = value[subKey[0]];
        if (input == 'GT') {    // MComparison
            return this.createGTList(subKey[0], subValue, preList, not);
        }
        else if (input == 'LT') {
            return this.createLTList(subKey[0], subValue, preList, not);
        }
        else if (input == 'EQ') {     //SComparison
            return this.createEQList(subKey[0], subValue, preList, not);
        }
        else if (input == "IS") {
            return this.createISList(subKey[0], subValue, preList, not);
        }
        else if (input == "NOT") {
            return this.createNOTList(value, preList, not);
        }
        else {
            this.fail = true;
            this.returnMessage = "invalid Filter"
            return this.returnMessage;
        }
    }

    createNOTList(value: any, dataList: any[], not: boolean): any {
        if (this.fail == true)
            return this.returnMessage;
        let key = Object.keys(value)[0];
        let keyValue = value[key];
        if (not) {
            var response = this.whatKindofFilter(key, keyValue, dataList, false);
        } else {
            var response = this.whatKindofFilter(key, keyValue, dataList, true);
        }
        return response;
    }

    createORList(list: any[], preList: any[], not: boolean): any {
        if (this.fail == true)
            return this.returnMessage;
        var sortedList: any[] = [];
        for (let i = 0; i < list.length; i++) {
            var keysOfObject = Object.keys(list[i]);
            let response = this.whatKindofFilter(keysOfObject[0], list[i][keysOfObject[0]], preList, not);
            if (sortedList.length == 0) {
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

    createANDList(list: any[], preList: any[], not: boolean): any {
        if (this.fail == true)
            return this.returnMessage;
        var Initialized = false;
        var resultlist: any[] = [];
        for (let i = 0; i < list.length; i++) {
            var sortedList: any[] = [];
            var keysOfObject = Object.keys(list[i]);
            let response = this.whatKindofFilter(keysOfObject[0], list[i][keysOfObject[0]], preList, not);
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

    createGTList(key: string, value: number, dataList: any[], not: boolean): any {
        if (this.fail == true)
            return this.returnMessage;
        var sortedList: any[] = [];

        if (typeof value !== 'number' || key == "courses_dept" || key == "courses_id" || key == "courses_instructor" || key == "courses_title" || key == "courses_uuid") {
            this.fail = true;
            this.returnMessage = "GT received non-nunmber"
            return this.returnMessage;
        }

        var realKey = this.findKey(key);
        if (not) {
            for (let i = 0; i < dataList.length; i++) {

                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] > value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        }
        else {
            for (let i = 0; i < dataList.length; i++) {

                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] <= value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        }

    }

    createLTList(key: string, value: number, dataList: any[], not: boolean): any {
        if (this.fail == true)
            return this.returnMessage;

        if (typeof value !== 'number' || key == "courses_dept" || key == "courses_id" || key == "courses_instructor" || key == "courses_title" || key == "courses_uuid") {
            this.fail = true;
            this.returnMessage = "LT received non-number"
            return this.returnMessage;
        }
        var sortedList: any[] = [];
        var realKey = this.findKey(key);
        if (not) {
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] < value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        } else {
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] >= value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        }
    }

    createEQList(key: string, value: number, dataList: any[], not: boolean): any {
        if (this.fail == true)
            return this.returnMessage;

        if (typeof value !== 'number' || key == "courses_dept" || key == "courses_id" || key == "courses_instructor" || key == "courses_title" || key == "courses_uuid") {
            this.fail = true;
            this.returnMessage = "EQ received non-number"
            return this.returnMessage;
        }
        var sortedList: any[] = [];
        var realKey = this.findKey(key);
        if (not) {
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] == value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        } else {
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] != value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        }
    }

    createISList(key: string, value: string, dataList: any[], not: boolean): any {
        if (this.fail == true)
            return this.returnMessage;

        if (typeof value !== 'string' || key == "courses_avg" || key == "courses_pass" || key == "courses_fail" || key == "courses_audit") {
            this.fail = true;
            this.returnMessage = "IS received non-string"
            return this.returnMessage;
        }
        var sortedList: any[] = [];
        var realKey = this.findKey(key);
        var firstcase = new RegExp("^\\*(\\s|\\S)*\\S+(\\s|\\S)*$");
        var secondcase = new RegExp("^(\\s|\\S)*\\S+(\\s|\\S)*\\*$");
        var thirdcase = new RegExp("^^\\*(\\s|\\S)*\\S+(\\s|\\S)*\\*$");
        var testcase = new RegExp("\\*");
        if (not) {
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'string') {
                    if (thirdcase.test(value)) {
                        let res = value.replace(testcase, "");
                        res = res.replace(testcase, "");//  *....*
                        var newregex = new RegExp("^.*" + res + ".*$")
                        if (newregex.test(dataList[i][realKey]))
                            sortedList.push(dataList[i]);
                    }
                    else if (firstcase.test(value)) {
                        let res = value.replace(testcase, "");      //"*...."
                        var newregex = new RegExp("^.*" + res + "$");
                        if (newregex.test(dataList[i][realKey]))
                            sortedList.push(dataList[i]);
                    }
                    else if (secondcase.test(value)) {
                        let res = value.replace(testcase, "");// ".....*"
                        var newregex = new RegExp("^" + res + ".*$");
                        if (newregex.test(dataList[i][realKey]))
                            sortedList.push(dataList[i]);
                    }
                    else if (dataList[i][realKey] == value) {
                        sortedList.push(dataList[i]);
                    }
                }
            }
            return sortedList;
        } else {
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'string') {
                    if (thirdcase.test(value)) {
                        let res = value.replace(testcase, "");
                        res = value.replace(testcase, "");// getting only strings from *....*
                        var newregex = new RegExp("^.*" + res + ".*$")
                        if (!newregex.test(dataList[i][realKey]))
                            sortedList.push(dataList[i]);
                    }
                    else if (firstcase.test(value)) {
                        let res = value.replace(testcase, "");// getting only strings from *....*
                        var newregex = new RegExp("^.*" + res + "$");
                        if (!newregex.test(dataList[i][realKey]))
                            sortedList.push(dataList[i]);
                    }
                    else if (secondcase.test(value)) {
                        let res = value.replace(testcase, "");// getting only strings from *....*
                        var newregex = new RegExp("^" + res + ".*$");
                        if (!newregex.test(dataList[i][realKey]))
                            sortedList.push(dataList[i]);
                    }

                    else if (dataList[i][realKey] != value) {
                        sortedList.push(dataList[i]);
                    }
                }
            }
            return sortedList;
        }

    }

    // createISList(key: string, value: string, dataList: any[], not:boolean): any {
    //     if (this.fail == true)
    //         return this.returnMessage;
    //     if(typeof value !== 'string' || key == "courses_avg" || key == "courses_pass" || key == "courses_fail" || key == "courses_audit"){
    //         this.fail= true;
    //         this.returnMessage = "IS received non-string"
    //         return this.returnMessage;
    //     }
    //     var sortedList: any[] = [];
    //     var realKey = this.findKey(key);
    //     var firstcase = new RegExp("^\\*(\\s|\\S)*\\S+(\\s|\\S)*$");
    //     var secondcase = new RegExp("^(\\s|\\S)*\\S+(\\s|\\S)*\\*$");
    //     var thirdcase = new RegExp("^^\\*(\\s|\\S)*\\S+(\\s|\\S)*\\*$");
    //     var testcase = new RegExp("\\*");
    //     if(not) {
    //         for (let i = 0; i < dataList.length; i++) {
    //             if (typeof (dataList[i][realKey]) === 'string') {
    //                 if (thirdcase.test(value)) {
    //                     let res = value.substring(1, value.length - 1);//  *....*
    //                     var newregex = new RegExp("^.*" + res + ".*$")
    //                     if (newregex.test(dataList[i][realKey]))
    //                         sortedList.push(dataList[i]);
    //                 }
    //                 else if (firstcase.test(value)) {
    //                     let res = value.replace(testcase, "");      //"*...."
    //                     var newregex = new RegExp("^.*" + res + "$");
    //                     if (newregex.test(dataList[i][realKey]))
    //                         sortedList.push(dataList[i]);
    //                 }
    //                 else if (secondcase.test(value)) {
    //                     let res = value.replace(testcase, "");// ".....*"
    //                     var newregex = new RegExp("^" + res + ".*$");
    //                     if (newregex.test(dataList[i][realKey]))
    //                         sortedList.push(dataList[i]);
    //                 }
    //                 else if (dataList[i][realKey] == value) {
    //                     sortedList.push(dataList[i]);
    //                 }
    //             }
    //         }
    //         return sortedList;
    //     } else{
    //         for (let i = 0; i < dataList.length; i++) {
    //             if (typeof (dataList[i][realKey]) === 'string'  ) {
    //                 if (thirdcase.test(value)) {
    //                     let res = value.substring(1, value.length - 1);// getting only strings from *....*
    //                     var newregex = new RegExp("^.*" + res + ".*$")
    //                     if (!newregex.test(dataList[i][realKey]))
    //                         sortedList.push(dataList[i]);
    //                 }
    //                 else if (firstcase.test(value)) {
    //                     let res = value.replace(testcase, "");// getting only strings from *....*
    //                     var newregex = new RegExp("^.*" + res + "$");
    //                     if (!newregex.test(dataList[i][realKey]))
    //                         sortedList.push(dataList[i]);
    //                 }
    //                 else if (secondcase.test(value)) {
    //                     let res = value.replace(testcase, "");// getting only strings from *....*
    //                     var newregex = new RegExp("^" + res + ".*$");
    //                     if (!newregex.test(dataList[i][realKey]))
    //                         sortedList.push(dataList[i]);
    //                 }
    //
    //                 else if (dataList[i][realKey] != value) {
    //                     sortedList.push(dataList[i]);
    //                 }
    //             }
    //         }
    //         return sortedList;
    //     }
    //
    // }

    // findKey(key: string){
    //     if(key == "courses_dept")
    //         return "Subject";
    //     if(key == "courses_id")
    //         return "Course";
    //     if(key == "courses_avg")
    //         return "Avg";
    //     if(key == "courses_instructor")
    //         return "Professor";
    //     if(key == "courses_title")
    //         return "Title";
    //     if(key == "courses_pass")
    //         return "Pass";
    //     if(key == "courses_fail")
    //         return "Fail";
    //     if(key == "courses_audit")
    //         return "Audit";
    //     if(key == "courses_uuid")
    //         return "id";
    //     else {
    //         if (key.search("_") != -1) {
    //             let indexOF_= key.indexOf("_");
    //             let missingId = key.substring(0, indexOF_);
    //
    //             if (missingId != "courses"){
    //                 this.fail_for_424 = true;
    //                 this.missingIds.push(missingId);
    //                 this.returnMessage = "provided key is missing id";
    //                 return this.returnMessage;
    //             }
    //             else {
    //                 this.fail_for_missingKey = true;
    //                 this.returnMessage = "provided key is missing key";
    //                 return this.returnMessage;
    //             }
    //         } else {
    //             this.fail = true;
    //             this.returnMessage = "provided key is not valid key";
    //             return this.returnMessage;
    //         }
    //
    //
    //     }
    // }

    findKey(key: string) {
        if (key.search("_") != -1) {
            let indexOF_ = key.indexOf("_");
            let id = key.substring(0, indexOF_);
            if (id == "courses") {
                if (key == "courses_dept")
                    return "Subject";
                if (key == "courses_id")
                    return "Course";
                if (key == "courses_avg")
                    return "Avg";
                if (key == "courses_instructor")
                    return "Professor";
                if (key == "courses_title")
                    return "Title";
                if (key == "courses_pass")
                    return "Pass";
                if (key == "courses_fail")
                    return "Fail";
                if (key == "courses_audit")
                    return "Audit";
                if (key == "courses_uuid")
                    return "id";
                if (key == "courses_year")
                    return "Year";
                else {
                    this.fail_for_missingKey = true;
                    this.returnMessage = "provided key is missing key";
                    return this.returnMessage;
                }
            }
            else if (id == "rooms") {
                return key;
            }
            else {
                this.fail_for_missingKey = true;
                this.returnMessage = "provided key is missing key";
                return this.returnMessage;
            }
        }


        else {
            if (key.search("_") != -1) {
                let indexOF_ = key.indexOf("_");
                let id = key.substring(0, indexOF_);

                if (id != "courses") {
                    this.fail_for_424 = true;
                    this.missingIds.push(id);
                    this.returnMessage = "provided key is missing id";
                    return this.returnMessage;
                }
                else {
                    this.fail_for_missingKey = true;
                    this.returnMessage = "provided key is missing key";
                    return this.returnMessage;
                }
            } else {
                this.fail = true;
                this.returnMessage = "provided key is not valid key";
                return this.returnMessage;
            }


        }
    }

    createModifiedList(list: any, options: any) {
        if (this.fail == true)
            return this.returnMessage;
        let output: any = {'render': '', 'result': []};
        let newlist: any[] = [];
        let optionsKey = Object.keys(options);
        if (optionsKey.length == 3) {
            if (optionsKey[0] != "COLUMNS" || optionsKey[1] != "ORDER" || optionsKey[2] != "FORM") {
                this.fail = true;
                this.returnMessage = "Option is not valid option 3"
                return this.returnMessage;
            }
        } else if (optionsKey.length == 2) {
            if (optionsKey[0] != "COLUMNS" || optionsKey[1] != "FORM") {
                this.fail = true;
                this.returnMessage = "Option is not valid option 2"
                return this.returnMessage;
            }
        } else {
            this.fail = true;
            this.returnMessage = "Option is not valid"
            return this.returnMessage;
        }
        ;
        if (options["FORM"] != "TABLE") {
            this.fail = true;
            this.returnMessage = "FORM is not valid"
            return this.returnMessage;
        }
        output['render'] = options["FORM"];
        let columnsValue = options["COLUMNS"];
        if (columnsValue.length == 0) {
            this.fail = true;
            this.returnMessage = "Columns' length is 0"
            return this.returnMessage;
        }
        for (let i = 0; i < list.length; i++) {
            let element: any = {};
            for (let j = 0; j < columnsValue.length; j++) {
                if (isNullOrUndefined(columnsValue[j])) {
                    this.fail = true;
                    this.returnMessage = "element in Columns is null or undefined"
                    return this.returnMessage;
                }
                let key = this.findKey(columnsValue[j]);
                element[columnsValue[j]] = list[i][key];
            }
            newlist.push(element);
        }

        if (list.length == 0) {
            for (let j = 0; j < columnsValue.length; j++) {
                let key = this.findKey(columnsValue[j]);

            }
        }

        if (optionsKey.length == 3) {

            let order = Object.keys(options)[1];
            let orderValue = options[order];
            if (!columnsValue.includes(orderValue)) {
                this.fail = true;
                this.returnMessage = "Order is not in Columns"
                return this.returnMessage;
            }
            if (orderValue == "courses_avg" || orderValue == "courses_pass" || orderValue == "courses_fail" || orderValue == "courses_audit") {
                newlist.sort(this.sort_by(orderValue, false, parseFloat));
            } else {
                newlist.sort(this.sort_by(orderValue, false, function (a: any) {
                    return a.toUpperCase()
                }));
            }
        }

        for (let i = 0; i < newlist.length; i++)
            output['result'].push(newlist[i]);
        return output;
    }

    sort_by = function (field: any, reverse: any, primer: any) {

        var key = primer ?
            function (x: any) {
                return primer(x[field])
            } :
            function (x: any) {
                return x[field]
            };

        reverse = !reverse ? 1 : -1;

        return function (a: any, b: any) {
            return a = key(a), b = key(b), reverse * (<any>(a > b) - <any>(b > a));
        }
    }

}

function getLatandLon(url: any){
    return new Promise(function(fulfill, reject){
        request.get(url, function (error: any, response: any, body: any) {
            if (!error && response.statusCode == 200) {
                fulfill(body);
            }
            else
                reject(error);
        });
    })
}






var Doeverything: DoEveryThing = null;
var counter: boolean = true;
export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');

    }


    addDataset(id: string, content: string) : Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            let promiseList: Promise<any>[] = [];
            let validData: any[] = [];
            let code: number = 0;
            let zip = new JSZip();
            if (id == 'courses') {
                fs.access(id + '.json', (err) => {
                    if (!err) {
                        fs.unlink(id + '.json', (err) => {
                            //if (err) throw err;
                            code = 201; // id already existed
                        })
                    }
                    else {
                        code = 204; // id is new
                    }
                });
                zip.loadAsync(content, {base64: true})
                    .then(function (contents: any) {
                        let filepaths = Object.keys(contents.files);
                        if (filepaths.length == 1) {
                            reject({code: 400, body: {"error": "my text"}});
                        }
                        else {
                            for (let filepath of filepaths) {
                                promiseList.push(zip.files[filepath].async('string'));
                            }
                        }
                        Promise.all(promiseList).then(data => {
                            var list: any [] = [];
                            var isObject = new RegExp("^\\{.*\\}$");
                            for (let each of data) {
                                if (isObject.test(each)) {
                                    var element: any = JSON.parse(<any>each);
                                    //let keys = Object.keys(element);  // keys = ["result", "rank"]
                                    var course_info = element["result"];  // course_info = value of result = [{....}]
                                    for (let each1 of course_info) {// each = each object in result
                                        if (each1 != [])
                                            list.push(each1);
                                    }
                                }
                            }
                            if (list.length == 0) {
                                reject({code: 400, body: {"error": "this two"}});
                            }
                            DataList[id] = list;
                            fs.writeFile(id + '.json', JSON.stringify(list));
                            fulfill({code: code, body: {}});
                        }).catch(function () {
                            reject({code: 400, body: {"error": "this three"}});
                        });
                    })
                    .catch(function () {
                        reject({code: 400, body: {"error": "this one"}});
                    });
            }
            else if (id == 'rooms') {
                zip.loadAsync(content,{base64: true})
                    .then(function (contents:any) {
                        var validlats: number[] = [];
                        var validlons: number[] = [];
                        let validCodes:string[] = [];
                        let encoded_uri_list:string[] = [];
                        let processList: any[] = [];
                        // let filepaths = Object.keys(contents.files);
                        // if (filepaths.length  == 5) {
                        //     reject({code: 400, body: {"error": "my text"}});
                        // }
                        // else {
                        //     for (let filepath of filepaths) {
                        //         if (filepath.search("campus/discover/buildings-and-classrooms/") != -1) {
                        //             if (filepath.substring(41).length == 3 || filepath.substring(41).length == 4 ) {
                        //                 console.log(filepath);
                        //                 promiseList.push(zip.files[filepath].async('string'));
                        //             }
                        //         }
                        //     }
                        // }
                        zip.file("index.htm").async('string')
                            .then((data: any) => {
                                let document = parse5.parse(data);
                                // console.log(document);
                                for (let item of document.childNodes) {
                                    if (item.tagName == 'html') {
                                        // console.log(item);
                                        for (let item1 of item.childNodes) {
                                            if (item1.tagName == 'body') {
                                                // console.log(item1);
                                                for (let item2 of item1.childNodes) {
                                                    if (item2.tagName == 'div') {
                                                        // console.log(item2.childNodes);
                                                        for (let item3 of item2.childNodes) {
                                                            if (!isNullOrUndefined(item3.attrs) && item3.attrs[0]['value'] == 'main') {
                                                                // console.log(item3.childNodes);
                                                                for (let item4 of item3.childNodes) {
                                                                    // console.log(item4.attrs);
                                                                    if (!isNullOrUndefined(item4.attrs) && item4.attrs[0]['value'] == 'content') {
                                                                        for (let item5 of item4.childNodes) {
                                                                            if (item5.tagName == 'section') {
                                                                                // console.log(item5);
                                                                                for (let item6 of item5.childNodes) {
                                                                                    if (item6.tagName == 'div') {
                                                                                        for (let item7 of item6.childNodes) {
                                                                                            if (!isNullOrUndefined(item7.attrs) && item7.attrs[0]['value'] == 'view-content') {
                                                                                                // console.log(item7);
                                                                                                for (let item8 of item7.childNodes) {
                                                                                                    // console.log(item8.childNodes);
                                                                                                    if (!isNullOrUndefined(item8.childNodes)) {
                                                                                                        for (let item9 of item8.childNodes) {
                                                                                                            if (item9.tagName == 'tbody') {
                                                                                                                // console.log(item9);
                                                                                                                for (let item10 of item9.childNodes) {
                                                                                                                    if (!isNullOrUndefined(item10) && item10.tagName == 'tr') {
                                                                                                                        // console.log(item10.childNodes);
                                                                                                                        for (let item11 of item10.childNodes) {
                                                                                                                            if (item11.tagName == 'td') {
                                                                                                                                // console.log(item11);
                                                                                                                                for (let attr of item11.attrs) {
                                                                                                                                    // console.log(item11);
                                                                                                                                    if (attr['value'] == 'views-field views-field-field-building-code') {
                                                                                                                                        // console.log(item11.childNodes[0]['value'].trim());
                                                                                                                                        validCodes.push(item11.childNodes[0]['value'].trim());
                                                                                                                                    }
                                                                                                                                    else if (attr['value'] == 'views-field views-field-title') {
                                                                                                                                        for (let item12 of item11.childNodes) {
                                                                                                                                            if (item12.tagName == 'a') {
                                                                                                                                                // console.log(item12);
                                                                                                                                                // console.log(item12.attrs[0]['value'].toString());
                                                                                                                                                // console.log(item12.childNodes[0]['value']);
                                                                                                                                                // console.log(item12.attrs[0]['value'].toString().substring(2));
                                                                                                                                                // validFilePaths.push(item12.attrs[0]['value'].toString().substring(2));
                                                                                                                                                // console.log(validFilePaths);
                                                                                                                                                promiseList.push(zip.files[item12.attrs[0]['value'].toString().substring(2)].async('string'));
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }

                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }

                                                                                                }


                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                // for (let encoded_uri of encoded_uri_list) {

                                // }
                                Promise.all(promiseList).then(data => {
                                    // let i:number = 0;
                                    let j:number = 0;
                                    let k:number = 0;

                                    // console.log(document1);
                                    // console.log(promiseList.length);
                                    // console.log(data.length);
                                    for (let each of data) {
                                        let rooms_fullname:string ='';
                                        let rooms_shortname:string ='';
                                        let rooms_number:string = '';
                                        // let rooms_name:string = rooms_shortname + "_" + rooms_number;
                                        let rooms_address:string ='';
                                        let rooms_lat:number = 0;
                                        let rooms_lon:number = 0;
                                        let rooms_seats:number = 0;
                                        let rooms_type:string ='';
                                        let rooms_furniture:string ='';
                                        let rooms_href:string ='';
                                        let document1 = parse5.parse(each);
                                        let i:number = 0 ;
                                        for (let item of document1.childNodes) {
                                            let emptyList:any[]  = [];
                                            if (item.tagName == 'html') {
                                                for (let item1 of item.childNodes) {
                                                    // console.log(item1);
                                                    if (item1.tagName == 'body') {
                                                        // console.log(item1.childNodes);
                                                        for (let item2 of item1.childNodes) {
                                                            if (!isNullOrUndefined(item2.attrs) && item2.attrs.length == 1 && item2.attrs[0]["value"] == "full-width-container") {  //&& item2.attrs[0]["value"] == "full-width-container"
                                                                // console.log(item2.attrs);
                                                                for (let item3 of item2.childNodes) {
                                                                    if (!isNullOrUndefined(item3.attrs) && item3.attrs[0]['value'] == 'main') { // && item3.attrs.length == 1 && item3.attrs[0]["value"] == "expand row-fluid  contentwrapper-node-"
                                                                        // console.log(item3.attrs);
                                                                        for (let item4 of item3.childNodes) {
                                                                            if (!isNullOrUndefined(item4.attrs) && item4.attrs[0]['value'] == 'content') {
                                                                                // console.log(item4.attrs);
                                                                                for (let item5 of item4.childNodes) {
                                                                                    if (item5.tagName == 'section') {
                                                                                        // console.log(item5.childNodes);
                                                                                        for (let item6 of item5.childNodes) {
                                                                                            if (item6.tagName == 'div') {
                                                                                                // console.log(item6.childNodes);
                                                                                                for (let item7 of item6.childNodes) {
                                                                                                    if (!isNullOrUndefined(item7.attrs) && item7.attrs[0]['value'] == 'view-content') {
                                                                                                        // console.log(item7.attrs);
                                                                                                        for (let item8 of item7.childNodes) {
                                                                                                            if (!isNullOrUndefined(item8.attrs)) {
                                                                                                                for (let item9 of item8.childNodes) {
                                                                                                                    // console.log(item9.attrs);
                                                                                                                    if (!isNullOrUndefined(item9.attrs) && item9.attrs.length == 1 && item9.attrs[0]['value'] == 'buildings-wrapper') { //

                                                                                                                        // console.log(item9);


                                                                                                                        for (let item10 of item9.childNodes) {
                                                                                                                            // console.log(item10.attrs);
                                                                                                                            if (!isNullOrUndefined(item10.attrs) && item10.attrs.length == 1 && item10.attrs[0]['value'] == 'building-info') {
                                                                                                                                // console.log(item10);
                                                                                                                                for(let item11 of item10.childNodes) {
                                                                                                                                    if (item11.tagName == 'h2') {
                                                                                                                                        for (let item12 of item11.childNodes) {
                                                                                                                                            // console.log("rooms_fullname : " + item12.childNodes[0]['value']); //building full name
                                                                                                                                            rooms_fullname = item12.childNodes[0]['value'];
                                                                                                                                            // console.log("rooms_shortname : " + validCodes[j]);
                                                                                                                                            rooms_shortname = validCodes[j];
                                                                                                                                            rooms_lat = validlats[j];
                                                                                                                                            // console.log(j);
                                                                                                                                            // console.log(validlats[j]);
                                                                                                                                            rooms_lon = validlons[j];
                                                                                                                                            // console.log(validlats[j]);
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                    else if (item11.tagName == 'div') {
                                                                                                                                        for (let item12 of item11.childNodes) {
                                                                                                                                            if (!isNullOrUndefined(item12.childNodes)) {
                                                                                                                                                for (let item13 of item12.childNodes) {
                                                                                                                                                    if (isNullOrUndefined(item13.attrs)){
                                                                                                                                                        if (item13['value'].search('Building Hour') == -1 && item13['value'].search('Building is') == -1 && item13['value'].search('Opening hours') == -1 ) {
                                                                                                                                                            // console.log("rooms_address : " + item13['value']); //building address
                                                                                                                                                            rooms_address = item13['value'];
                                                                                                                                                            // console.log(rooms_address);
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }

                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                    else if (!isNullOrUndefined(item7.attrs) && item7.attrs[0]['value'] == 'view-footer') {

                                                                                                        for (let item8 of item7.childNodes) {
                                                                                                            if (!isNullOrUndefined(item8.attrs)) {
                                                                                                                // console.log(item8.tagName);
                                                                                                                for (let item9 of item8.childNodes) {
                                                                                                                    // console.log(item9);
                                                                                                                    if (!isNullOrUndefined(item9.attrs) && item9.attrs[0]['value'] == 'view-content') {
                                                                                                                        // console.log(item9.tagName);
                                                                                                                        for (let item10 of item9.childNodes) {
                                                                                                                            if (!isNullOrUndefined(item10.attrs)) {
                                                                                                                                // console.log(item10.attrs);
                                                                                                                                for (let item11 of item10.childNodes) {
                                                                                                                                    // console.log(item11);
                                                                                                                                    if(item11.tagName == 'tbody') {
                                                                                                                                        // console.log(item11);
                                                                                                                                        for (let item12 of item11.childNodes) {
                                                                                                                                            // console.log(item12);
                                                                                                                                            if (item12.tagName == 'tr') {
                                                                                                                                                // console.log(item12);
                                                                                                                                                for (let item13 of item12.childNodes) {
                                                                                                                                                    if (item13.tagName == 'td') {
                                                                                                                                                        // console.log(item13.childNodes);
                                                                                                                                                        for (let item14 of item13.childNodes) {

                                                                                                                                                            let room_info_list:any = {};
                                                                                                                                                            // console.log(item14.childNodes);
                                                                                                                                                            // console.log(item14.attrs);
                                                                                                                                                            if (item14['nodeName'] != '#text') {
                                                                                                                                                                for (let item15  of item14.childNodes) {
                                                                                                                                                                    if (item15['value'] != 'More info') {
                                                                                                                                                                        // console.log("rooms_number : " + item15['value']); //room number
                                                                                                                                                                        // room_info_list.push(("{" + "rooms_number : " + item15['value'] + "}"));
                                                                                                                                                                        rooms_number = item15['value'];
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                            else {
                                                                                                                                                                // let i:number = 0 ;

                                                                                                                                                                if (item14['value'].trim().length >= 1) {
                                                                                                                                                                    if (item14['value'].trim().length < 4 && item14['value'].trim().search('TBD') == -1) {
                                                                                                                                                                        // console.log("rooms_seats : " + item14['value'].trim()); // capacity furniture room_type
                                                                                                                                                                        rooms_seats = item14['value'].trim();
                                                                                                                                                                        // console.log(rooms_seats);
                                                                                                                                                                    }
                                                                                                                                                                    else  if (item14['value'].trim().length <= 18 || item14['value'].trim().search('Purpose') != -1 || item14['value'].trim().search('Group') != -1) {
                                                                                                                                                                        // console.log(item14['value'].trim());
                                                                                                                                                                        rooms_type = item14['value'].trim();
                                                                                                                                                                    }
                                                                                                                                                                    else {
                                                                                                                                                                        rooms_furniture = item14['value'].trim();
                                                                                                                                                                        // console.log(rooms_furniture);
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }

                                                                                                                                                            if (!isNullOrUndefined(item14.attrs) && item14.attrs.length == 1) {
                                                                                                                                                                rooms_href = item14.attrs[0]['value'];
                                                                                                                                                                let url = "http://skaha.cs.ubc.ca:11316/api/v1/team35/" + rooms_address;
                                                                                                                                                                processList.push(getLatandLon(url).then(function (geoResponse: any){
                                                                                                                                                                    var responselat: any = null;
                                                                                                                                                                    var responselon: any = null;
                                                                                                                                                                    let response = JSON.parse(geoResponse);
                                                                                                                                                                    responselat = Number(response.lat);
                                                                                                                                                                    responselon = Number(response.lon);
                                                                                                                                                                    if (rooms_number != '' && rooms_seats != 0 && rooms_type != "" && rooms_furniture != "" && rooms_href != "" ) {
                                                                                                                                                                        var newdata: any = {};
                                                                                                                                                                        newdata["rooms_fullname"] =  rooms_fullname;
                                                                                                                                                                        newdata["rooms_shortname"] =  rooms_shortname;
                                                                                                                                                                        newdata["rooms_number"] = rooms_number;
                                                                                                                                                                        newdata["rooms_name"] = rooms_shortname + "_" + rooms_number;
                                                                                                                                                                        newdata["rooms_address"] = rooms_address;
                                                                                                                                                                        newdata["rooms_lat"] = responselat;
                                                                                                                                                                        newdata["rooms_lon"] = responselon;
                                                                                                                                                                        newdata["rooms_seats"] = rooms_seats;
                                                                                                                                                                        newdata["rooms_type"] = rooms_type;
                                                                                                                                                                        newdata["rooms_furniture"] = rooms_furniture;
                                                                                                                                                                        newdata["rooms_href"] = rooms_href;
                                                                                                                                                                    }
                                                                                                                                                                    validData.push(newdata);
                                                                                                                                                                }).catch(function(){
                                                                                                                                                                    reject({code: 400, body: {"error": "this three"}});
                                                                                                                                                                }))
                                                                                                                                                            }
                                                                                                                                                        }



                                                                                                                                                    }


                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }

                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }

                                                                                                    }
                                                                                                }

                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }


                                                        }

                                                    }
                                                }
                                            }
                                            if (emptyList.length > 0) {
                                                // console.log(emptyList)
                                            };
                                            k++;
                                        }
                                        j++; // for room shortname
                                        if (rooms_number == '' && rooms_seats == 0) {
                                            // console.log(rooms_address);
                                            validData.push({ "rooms_fullname" :  rooms_fullname,
                                                "rooms_shortname" :  rooms_shortname,
                                                "rooms_address" : rooms_address,
                                                "rooms_lat" : rooms_lat,
                                                "rooms_lon" : rooms_lon
                                            })
                                        }
                                        // console.log(k);

                                    }
                                    // console.log(validData[1]["rooms_fullname"]);

                                    Promise.all(processList).then(function (){
                                        DataList[id] = validData;
                                        fs.writeFile(id + '.json', JSON.stringify(validData));
                                        fulfill({code: code, body: {}});
                                    }).catch((err: any) => {
                                        console.log(err);
                                        reject({
                                            code: 400,
                                            body: {"error": "this three"}
                                        });
                                    });
                                }).catch((err: any) => {
                                    console.log(err);
                                    reject({
                                        code: 400,
                                        body: {"error": "this three"}
                                    });
                                });
                            })
                            .catch(function(){
                                reject({code: 400, body: {"error": "this three"}});
                            });
                    })
                    .catch(function() {
                        reject({code: 400, body: {"error": "this one"}});
                    });

            }


        })
    }


    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            if (!id || isNullOrUndefined(id)) {
                reject({code: 404, body: {"error": "this one"}});
            }
            fs.exists('./' + id + '.json', function (value:boolean) {
                if (!value) {
                    reject({code: 404, body: {"error": "path not exist"}});
                }
                else {
                    fs.unlink('./' + id + '.json', function() {
                        delete DataList[id];
                        fulfill({code: 204, body: {}});
                    })
                }
            })
        })
    }



    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return new Promise(function (fulfill, reject) {
            if (counter) {
                Doeverything = new DoEveryThing;
                counter = false;
            }
            //parse QueryRequest using EBFN and create a list = todoList
            let names: any[] = Object.keys(query);
            if(names[0] != "WHERE" || names[1] !="OPTIONS") {
                reject({code: 400, body: {"error": "not valid query(Where, options)"}});
                return;
            }
            let body = query[names[0]];
            let filterKey: any = Object.keys(body)[0];
            let filterValue = body[filterKey];
            let list: any = [];
            let options = query[names[1]];
            if('rooms' in DataList){
                list = Doeverything.whatKindofFilter(filterKey, filterValue, DataList['rooms']);
            } else {
                try {
                    let datalist = JSON.parse(fs.readFileSync('rooms.json', 'utf8'));
                    list = Doeverything.whatKindofFilter(filterKey, filterValue, datalist);
                }catch(e){
                    reject({code: 424, body: {"missing":["courses"]}});
                }
            }
            if (Doeverything.fail) {
                Doeverything.fail = false;
                reject({code: 400, body: {"error" : Doeverything.returnMessage}});
                Doeverything.missingIds = [];
                console.log("1");
                console.log(Doeverything.returnMessage);
                return;
            }

            let response = Doeverything.createModifiedList(list, options);
            if (Doeverything.fail) {
                Doeverything.fail = false;
                if (Doeverything.missingIds.length > 0) {
                    reject({code: 424, body: {"error": Doeverything.returnMessage}});
                    Doeverything.missingIds = [];
                    Doeverything.fail_for_424 = false;
                    console.log("2");
                    console.log(Doeverything.returnMessage);
                }
                else{
                    reject({code: 400, body: {"error": Doeverything.returnMessage}});
                    console.log("3");
                    console.log(Doeverything.returnMessage);
                }
            }
            else if (Doeverything.fail_for_424) {
                reject({code: 424, body: {"error": Doeverything.missingIds}});
                Doeverything.missingIds = [];
                console.log("4");
                console.log(Doeverything.returnMessage);
            }
            else if (Doeverything.fail_for_missingKey) {
                reject({code: 400, body: {"error": Doeverything.missingIds}});
                Doeverything.missingIds = [];
                console.log("5");
                console.log(Doeverything.returnMessage);
            }

            Doeverything.fail_for_missingKey = false;
            Doeverything.fail_for_424 = false;
            Doeverything.fail = false;
            console.log(response);
            fulfill({code: 200, body: response});
        })
    }
}