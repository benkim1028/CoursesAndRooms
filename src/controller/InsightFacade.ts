import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');

var JSZip = require('jszip');

let DataList: any = {};
class DoEveryThing {
    fail :boolean;
    constructor() {
        Log.trace('Doeverything::init()');
        this.fail = false;
    }
    whatKindofFilter(key: any, value: any, preList: any = [], not: boolean = true) {
        // this takes filter and its
        var input = key;
        if(input == "OR" && not == false)
            input = "AND";
        if(input == "AND" && not == false)
            input = "OR";
        if (input == "OR") {//logic comparison
            if (value.length == 0){
                this.fail = true;
                return [];
            }
            return this.createORList(value, preList, not);
        } else if (input == "AND") {
            if (value.length == 0){
                this.fail = true;
                return [];
            }
            return this.createANDList(value, preList, not);
        }
        var subKey: any = Object.keys(value);
        var subValue: any = value[subKey[0]];
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
            return [];
        }
    }
    createNOTList(value: any, dataList: any[], not:boolean): any[] {
        var key = Object.keys(value)[0];
        var keyValue = value[key];
        if(not) {
            var response = this.whatKindofFilter(key, keyValue, dataList, false);
        } else {
            var response = this.whatKindofFilter(key, keyValue, dataList, true);
        }
        return response;
    }
    createORList(list: any[], preList: any[], not:boolean): any[]{
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

    createANDList(list: any[], preList: any[],not:boolean): any[]{
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
    createGTList(key: string, value: number, dataList: any[],not:boolean): any[] {
        var sortedList: any[] = [];
        var realKey = this.findKey(key);

        if(typeof value !== 'number'){
            this.fail= true;
            return [];
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
    createLTList(key: string, value: number, dataList: any[], not:boolean): any[] {
        var sortedList: any[] = [];
        var realKey = this.findKey(key);
        if(typeof value !== 'number'){
            this.fail= true;
            return [];
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

    createEQList(key: string, value: number, dataList: any[],not:boolean): any[] {
        var sortedList: any[] = [];
        var realKey = this.findKey(key);
        if(typeof value !== 'number'){
            this.fail= true;
            return [];
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

    createISList(key: string, value: string, dataList: any[], not:boolean): any[] {
        var sortedList: any[] = [];
        var realKey = this.findKey(key);
        if(typeof value !== 'string'){
            this.fail= true;
            return [];
        }
        var firstcase = new RegExp("^\\*(\\s|\\S)*\\S+(\\s|\\S)*$");
        var secondcase = new RegExp("^(\\s|\\S)*\\S+(\\s|\\S)*\\*$");
        var thirdcase = new RegExp("^^\\*(\\s|\\S)*\\S+(\\s|\\S)*\\*$");
        var testcase = new RegExp("\\*");
        if(not) {
            for (let i = 0; i < dataList.length; i++) {
                if (typeof (dataList[i][realKey]) === 'string') {
                    if (firstcase.test(value)) {
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

                    else if (thirdcase.test(value)) {
                        let res = value.replace(testcase, "");
                        res = res.replace(testcase, "");//  *....*
                        var newregex = new RegExp("^.*" + res + ".*$")
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
                    if (firstcase.test(value)) {
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

                    else if (thirdcase.test(value)) {
                        let res = value.replace(testcase, "");
                        res = value.replace(testcase, "");// getting only strings from *....*
                        var newregex = new RegExp("^.*" + res + ".*$")
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
        else {
            this.fail = true;
            return "";
        }
    }

    createModifiedList(list: any, options: any){
        let output: any = {'render': '','result': []};
        let newlist: any[] = [];
        let optionsKey = Object.keys(options);
        if (optionsKey.length == 3) {
            if (optionsKey[0] != "COLUMNS" || optionsKey[1] != "ORDER" || optionsKey[2] != "FORM") {
                this.fail = true;
                return [];
            }
        } else if (optionsKey.length == 2){
            if (optionsKey[0] != "COLUMNS" || optionsKey[1] != "FORM"){
                this.fail = true;
                return [];
            }
        }
        let form = Object.keys(options)[2];
        if(options[form] != "TABLE"){
            this.fail = true;
            return [];
        }
        output['render'] = options[form];
        let columnsKey = Object.keys(options)[0];
        let columnsValue = options[columnsKey];
        if (columnsValue.length <= 1){
            this.fail = true;
            return [];
        }
        for(let i = 0; i < list.length; i++){
            let element: any = {};
            for(let j = 0; j < columnsValue.length; j++){
                let key = this.findKey(columnsValue[j]);
                element[columnsValue[j]] = list[i][key];
            }
            newlist.push(element);
        }
        if(optionsKey.length == 3) {
            let order = Object.keys(options)[1];
            let orderValue = options[order];
            if (this.findKey(orderValue) == "") {
                return [];
            }
            newlist.sort(this.sort_by(orderValue, false, parseFloat));
        }
        for(let i = 0; i < newlist.length; i++)
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
        var newPromise = new Promise(function (fulfill, reject){
            var isFail: boolean = true;
            try {
                fs.unlinkSync(id + '.json');
                delete DataList[id];
                counter = true;
            } catch (e) {
                isFail = false;
            }
            if(isFail) {
                fulfill({code: 204, body: {}});
            } else{
                reject({code: 404, body: {}});
            }
        })
        return newPromise;
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
                reject({code: 400, body: {"error": "my text"}});
            }
            let options = query[names[1]];
            let response = Doeverything.createModifiedList(list, options);
            if (Doeverything.fail) {
                Doeverything.fail = false;
                reject({code: 400, body: {"error": "my text"}});
            }
            // console.log(response);
            fulfill({code: 200, body: response});
        })
    }
}
