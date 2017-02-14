import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');
import {isNullOrUndefined} from "util";

var JSZip = require('jszip');

let DataList: any = {};
class DoEveryThing {
    fail :boolean;
    returnMessage : string;
    constructor() {
        Log.trace('Doeverything::init()');
        this.fail = false;
    }
    whatKindofFilter(key: any, value: any, preList: any = [], not: boolean = true) {
        if (this.fail == true)
            return this.returnMessage;
        // this takes filter and its
        let input = key;
        if(input == "OR" && not == false)
            input = "AND";
        if(input == "AND" && not == false)
            input = "OR";
        if (input == "OR") {//logic comparison
            if (value.length == 0){
                this.fail = true;
                this.returnMessage = "OR has no data"
                return this.returnMessage;
            }
            return this.createORList(value, preList, not);
        } else if (input == "AND") {
            if (value.length == 0){
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
    createNOTList(value: any, dataList: any[], not:boolean) : any {
        if (this.fail == true)
            return this.returnMessage;
        let key = Object.keys(value)[0];
        let keyValue = value[key];
        if(not) {
            var response = this.whatKindofFilter(key, keyValue, dataList, false);
        } else {
            var response = this.whatKindofFilter(key, keyValue, dataList, true);
        }
        return response;
    }
    createORList(list: any[], preList: any[], not:boolean): any {
        if (this.fail == true)
            return this.returnMessage;
        var sortedList: any[] = [];
        for(let i = 0; i < list.length; i++){
            var keysOfObject = Object.keys(list[i]);
            let response = this.whatKindofFilter(keysOfObject[0], list[i][keysOfObject[0]], preList, not);
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

    createANDList(list: any[], preList: any[],not:boolean): any{
        if (this.fail == true)
            return this.returnMessage;
        var Initialized = false;
        var resultlist: any[] = [];
        for(let i = 0; i < list.length; i++){
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
    createGTList(key: string, value: number, dataList: any[],not:boolean): any{
        if (this.fail == true)
            return this.returnMessage;
        var sortedList: any[] = [];
        var realKey = this.findKey(key);

        if(typeof value !== 'number'){
            this.fail= true;
            this.returnMessage = "GT received non-nunmber"
            return this.returnMessage;
        }
        if (not) {
            for (let i = 0; i < dataList.length; i++) {

                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] > value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        }
        else{
            for (let i = 0; i < dataList.length; i++) {

                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] <= value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        }

    }
    createLTList(key: string, value: number, dataList: any[], not:boolean): any {
        if (this.fail == true)
            return this.returnMessage;
        var sortedList: any[] = [];
        var realKey = this.findKey(key);
        if(typeof value !== 'number'){
            this.fail= true;
            this.returnMessage = "LT received non-number"
            return this.returnMessage;
        }
        if(not) {
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] < value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        } else{
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] >= value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        }
    }

    createEQList(key: string, value: number, dataList: any[],not:boolean): any {
        if (this.fail == true)
            return this.returnMessage;
        var sortedList: any[] = [];
        var realKey = this.findKey(key);
        if(typeof value !== 'number'){
            this.fail= true;
            this.returnMessage = "EQ received non-number"
            return this.returnMessage;
        }
        if(not) {
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] == value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        } else{
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'number' && dataList[i][realKey] != value) {
                    sortedList.push(dataList[i]);
                }
            }
            return sortedList;
        }
    }

    createISList(key: string, value: string, dataList: any[], not:boolean): any {
        if (this.fail == true)
            return this.returnMessage;
        var sortedList: any[] = [];
        var realKey = this.findKey(key);
        if(typeof value !== 'string'){
            this.fail= true;
            this.returnMessage = "IS received non-string"
            return this.returnMessage;
        }
        var firstcase = new RegExp("^\\*(\\s|\\S)*\\S+(\\s|\\S)*$");
        var secondcase = new RegExp("^(\\s|\\S)*\\S+(\\s|\\S)*\\*$");
        var thirdcase = new RegExp("^^\\*(\\s|\\S)*\\S+(\\s|\\S)*\\*$");
        var testcase = new RegExp("\\*");
        if(not) {
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
        } else{
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

    findKey(key: string){
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
        // if (key.search("_") != -1){
        //     this.fail = true;
        //     this.returnMessage = "provided key is not missing data";
        //     return this.returnMessage;
        // }
        else {
            if (key.search("_") != -1) {
                this.returnMessage = "provided key is missing data";
            } else {
                this.fail = true;
                this.returnMessage = "provided key is not valid key";
            }

            return this.returnMessage;
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
        };
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
                if (isNullOrUndefined(columnsValue[j])){
                    this.fail = true;
                    this.returnMessage = "element in Columns is null or undefined"
                    return this.returnMessage;
                }
                let key = this.findKey(columnsValue[j]);
                element[columnsValue[j]] = list[i][key];
            }
            newlist.push(element);
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

    sort_by = function(field: any, reverse: any, primer: any){

        var key = primer ?
            function(x: any) {return primer(x[field])} :
            function(x: any) {return x[field]};

        reverse = !reverse ? 1 : -1;

        return function (a: any, b: any) {
            return a = key(a), b = key(b), reverse * (<any>(a > b) - <any>(b > a));
        }
    }

}

var Doeverything: DoEveryThing = null;
var counter: boolean = true;
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
                        //if (err) throw err;
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
                    if (filepaths.length  == 1) {
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
                        for(let each of data) {
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
                        if(list.length == 0){
                            reject({code: 400, body: {"error": "this two"}});
                        }
                        DataList[id] = list;
                        fs.writeFile(id + '.json', JSON.stringify(list));
                        fulfill({code: code, body: {}});
                    }).catch(function(){
                        reject({code: 400, body: {"error": "this three"}});
                    });
                })
                .catch(function() {
                    reject({code: 400, body: {"error": "this one"}});
                });
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
            if('courses' in DataList){
                list = Doeverything.whatKindofFilter(filterKey, filterValue, DataList['courses']);
            } else {
                try {
                    let datalist = JSON.parse(fs.readFileSync('courses.json', 'utf8'));
                    list = Doeverything.whatKindofFilter(filterKey, filterValue, datalist);

                }catch(e){
                    reject({code: 424, body: {"missing":["courses"]}});
                }
            }
            if (Doeverything.fail) {
                Doeverything.fail = false;
                reject({code: 400, body: {"error" : Doeverything.returnMessage}});
                console.log(Doeverything.returnMessage);
                return;
            }
            let options = query[names[1]];
            let response = Doeverything.createModifiedList(list, options);
            if (Doeverything.fail) {
                Doeverything.fail = false;

                reject({code: 400, body: {"error" : Doeverything.returnMessage}});
            }
            else if (Doeverything.returnMessage == "provided key is missing data") {
                Doeverything.returnMessage = null;
                reject({code: 424, body: {"missing":["courses"]}});
                console.log(Doeverything.returnMessage);
                return;
            }

            console.log(response);
            fulfill({code: 200, body: response});
        })
    }
}