import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');
import {isNullOrUndefined} from "util";
import {error} from "util";
var http = require("http");
var JSZip = require('jszip');
const parse5 = require('parse5');


let DataList: any = {};
class DoEveryThing {
    id: string;
    fail: boolean;
    fail_for_424: boolean;
    fail_for_missingKey: boolean;
    returnMessage: string;
    missingIds: string[];
    columsLists:string[];
    columsLists_for_Apply:string[];

    constructor() {
        Log.trace('Doeverything::init()');
        this.fail = false;
        this.fail_for_424 = false;
        this.fail_for_missingKey = false;
        this.missingIds = [];
        this.columsLists = [];
        this.columsLists_for_Apply = [];

    }

    identifyID(){
        if (this.id == "courses"){
            return "id";
        } else if (this.id == "rooms"){
            return "rooms_name";
        }
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
        var identifier = this.identifyID();
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
                        if (sortedList[k][identifier] == response[j][identifier]) {
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
        var identifier = this.identifyID();
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
                        if (resultlist[k][identifier] == response[j][identifier]) {
                            sortedList.push(response[j]);
                        }
                    }
                }
                resultlist = sortedList;
            }
        }
        return resultlist;
    }

    OrderValueChecker(orderValue: any){
        if(this.id == "courses"){
            if (orderValue.search("_") != -1) {
                return orderValue == "courses_avg" || orderValue == "courses_pass" || orderValue == "courses_fail" || orderValue == "courses_audit" || orderValue == "courses_year";
            } else return true;
        } if (this.id == "rooms"){
            if (orderValue.search("_") != -1) {
                return orderValue == "rooms_lat" || orderValue == "rooms_lon" || orderValue == "rooms_seats";
            } else return true;
        }
    }

    Typechecker(filterkey: any,shouldbe: string, value: any, key: string){
        if(this.id == "courses"){
            if (shouldbe == "number") {
                if (typeof value !== shouldbe || key == "courses_dept" || key == "courses_id" || key == "courses_instructor" || key == "courses_title" || key == "courses_uuid") {
                    this.fail = true;
                    this.returnMessage =  filterkey + " received non-nunmber"
                }
            } else if (shouldbe == "string"){
                if (typeof value !== shouldbe || key == "courses_avg" || key == "courses_pass" || key == "courses_fail" || key == "courses_audit" || key == "courses_year"){
                    this.fail = true;
                    this.returnMessage = filterkey + " received non-string"
                }
            }
        }
        else if (this.id == "rooms"){
            if (shouldbe == "number") {
                if (typeof value !== shouldbe || key == "rooms_fullname" || key == "rooms_shortname" || key == "rooms_number" || key == "rooms_name" || key == "rooms_address" ||
                    key == "rooms_type" || key == "rooms_furniture" || key == "rooms_href") {
                    this.fail = true;
                    this.returnMessage =  filterkey + " received non-nunmber"
                }
            } else if (shouldbe == "string"){
                if (typeof value !== shouldbe || key == "rooms_lat" || key == "rooms_lon" || key == "rooms_seat"){
                    this.fail = true;
                    this.returnMessage = filterkey + " received non-string"
                }
            }
        }
    }

    createGTList(key: string, value: number, dataList: any[], not: boolean): any {
        this.Typechecker("GT",'number', value, key);
        if (this.fail == true)
            return this.returnMessage;
        var sortedList: any[] = [];

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
        this.Typechecker("LT",'number', value, key);
        if (this.fail == true)
            return this.returnMessage;
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
        this.Typechecker("EQ",'number', value, key);
        if (this.fail == true)
            return this.returnMessage;

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
        this.Typechecker("IS",'string', value, key);
        if (this.fail == true)
            return this.returnMessage;
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

    findKey(key: string) {
        if (key.search("_") != -1) {
            let indexOF_ = key.indexOf("_");
            let id = key.substring(0, indexOF_);
            if  (id == "courses"){
                if (this.id == "courses") {
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
                } else {
                    this.fail = true;
                    this.returnMessage = "Rooms and Courses can't exist together";
                    return this.returnMessage;
                }
            }
            if  (id == "rooms"){
                if (this.id == "rooms") {
                    if (key == "rooms_fullname" || key == "rooms_shortname" || key == "rooms_number" || key == "rooms_name" || key == "rooms_address" ||
                        key == "rooms_type" || key == "rooms_furniture" || key == "rooms_href" || key == "rooms_lat" || key == "rooms_lon" || key == "rooms_seats") {
                        return key;
                    }

                    else {
                        this.fail_for_missingKey = true;
                        this.returnMessage = "provided key is missing key";
                        return this.returnMessage;
                    }
                }
                else {
                    this.fail = true;
                    this.returnMessage = "Rooms and Courses can't exist together";
                    return this.returnMessage;
                }
            }

            else {
                this.fail_for_424 = true;
                this.missingIds.push(id);
                this.returnMessage = "provided key is missing id";
                return this.returnMessage;
            }

        }
        return "appliedKey";

        // else {
        //     return this.checkToken(key);
        // }
    }

    createModifiedList(list: any, options: any, transformations: any) {
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
            } // faill
        } else if (optionsKey.length == 2) {
            if (optionsKey[0] != "COLUMNS" || optionsKey[1] != "FORM") {
                this.fail = true;
                this.returnMessage = "Option is not valid option 2"
                return this.returnMessage;
            } // fail
        } else {
            this.fail = true;
            this.returnMessage = "Option is not valid"
            return this.returnMessage;
        } // fail
        if (options["FORM"] != "TABLE") {
            this.fail = true;
            this.returnMessage = "FORM is not valid"
            return this.returnMessage;
        } // fail
        output['render'] = options["FORM"];
        let columnsValue = options["COLUMNS"];
        if (list.length == 0) {
            for (let j = 0; j < columnsValue.length; j++) {
                let key = this.findKey(columnsValue[j]);

            }
        }
        if (columnsValue.length == 0) {
            this.fail = true;
            this.returnMessage = "Columns' length is 0"
            return this.returnMessage;
        }  // fail
        if (!isNullOrUndefined(transformations)) {
            //fail if transformation is not valid
            if (isNullOrUndefined(transformations["APPLY"]) || isNullOrUndefined(transformations["GROUP"])){
                this.fail = true;
                this.returnMessage = "transformations is not valid";
                return this.returnMessage;
            }else if(transformations["GROUP"].length == 0){
                this.fail = true;
                this.returnMessage = "GROUP is empty list";
                return this.returnMessage;
            }
            let groupkeys: any[] = [];
            let applykeys: any[] = [];
            let applykeys_in_Trans:any[] = [];
            let common_apply_objects:any[] = [];
            for (let k = 0; k < transformations["APPLY"].length; k++) {
                let applykey_in_Trans = Object.keys(transformations["APPLY"][k]);
                applykeys_in_Trans.push(applykey_in_Trans[0]);
            }

            // split elements in Columns into 2 parts, groupkeys and applykeys
            for (let i = 0; i < columnsValue.length; i++){
                if (columnsValue[i].search("_") != -1)
                    groupkeys.push(columnsValue[i]);
                else
                    applykeys.push(columnsValue[i]);
            }
            //check if all the keys with _ belong to GROUP if not throw error
            for (let x = 0; x < groupkeys.length; x ++) {
                if (!transformations["GROUP"].includes(groupkeys[x])) {
                    this.fail = true;
                    this.returnMessage = "Each Column value has to be in Group"
                    return this.returnMessage;
                }
            }
            //check if all the keys without _ belong to APPLY if not throw error
            if (applykeys_in_Trans.length != 0 && applykeys.length != 0) {
                for (let x = 0; x < applykeys.length; x++) {
                    if (!applykeys_in_Trans.includes(applykeys[x])) {
                        this.fail = true;
                        this.returnMessage = "2Each Column value has to be in Group"
                        return this.returnMessage;
                    }
                }
            }
            let valid_group_keys:string[] = this.find_Common_Group_Key(transformations["GROUP"], groupkeys);
            common_apply_objects = this.find_Common_Apply_Object(transformations["APPLY"], applykeys)
            let groupedList: any = this.createGroup(list, transformations["GROUP"]);
            let appliedList: any = this.applyQuery(groupedList, common_apply_objects, valid_group_keys);
            newlist = appliedList;
        } else {
            for (let i = 0; i < list.length; i++) {
                let element: any = {};
                for (let j = 0; j < columnsValue.length; j++) {
                    if (isNullOrUndefined(columnsValue[j])) {
                        this.fail = true;
                        this.returnMessage = "element in Columns is null or undefined"
                        return this.returnMessage;
                    }  // fail
                    let key = this.findKey(columnsValue[j]);
                    element[columnsValue[j]] = list[i][key];

                }
                newlist.push(element);
            }
        }
        if (optionsKey.length == 3) {
            let order = Object.keys(options)[1];
            let orderValue = options[order];

            if (!isNullOrUndefined(transformations)) {
                let apply:any = transformations["APPLY"];
                if (typeof orderValue === 'object') {
                    let dir:string = orderValue["dir"];
                    let keys:string[] = orderValue["keys"];
                    // fail if order is not valid
                    if (isNullOrUndefined(dir) || isNullOrUndefined(keys) || keys.length == 0){
                        this.fail = true;
                        this.returnMessage = "Order(OBJECT) is not Valid";
                        return this.returnMessage;
                    }
                    else for(let key of keys){
                        if (!columnsValue.includes(key)){
                            this.fail = true;
                            this.returnMessage = "Order(OBJECT) is not Valid - key is not included in column";
                            return this.returnMessage;
                        }
                    }
                    this.sort(dir, keys, newlist);
                }

                if (typeof orderValue === 'string') {
                    //fail if order is not valid
                    if (!columnsValue.includes(orderValue)) {
                        this.fail = true;
                        this.returnMessage = "Order is not in Columns";
                        return this.returnMessage;
                    }
                    if (this.OrderValueChecker(this.findKey_in_Apply(apply, orderValue))) {
                        this.sort_by(orderValue, false, parseFloat);
                    } else {
                        this.sort_by(orderValue, false, function (a: any) {
                            return a.toUpperCase()
                        });
                    }
                }

            }

            else {
                // if ORDER is OBJECT (e.g has dir and keys)
                if (typeof orderValue === 'object') {
                    let dir:string = orderValue["dir"];
                    let keys:string[] = orderValue["keys"];
                    // fail if order is not valid
                    if (isNullOrUndefined(dir) || isNullOrUndefined(keys) || keys.length == 0){
                        this.fail = true;
                        this.returnMessage = "Order(OBJECT) is not Valid";
                        return this.returnMessage;
                    }
                    else for(let key of keys){
                        if (!columnsValue.includes(key)){
                            this.fail = true;
                            this.returnMessage = "Order(OBJECT) is not Valid - key is not included in column";
                            return this.returnMessage;
                        }
                    }
                    this.sort(dir, keys, newlist);
                }
                //if ORDER is NOT OBJECT, do normal sorting
                if (typeof orderValue === 'string') {
                    //fail if order is not valid
                    if (!columnsValue.includes(orderValue)) {
                        this.fail = true;
                        this.returnMessage = "Order is not in Columns";
                        return this.returnMessage;
                    }
                    if (this.OrderValueChecker(orderValue)) {
                        this.sort_by(orderValue, false, parseFloat);
                    } else {
                        this.sort_by(orderValue, false, function (a: any) {
                            return a.toUpperCase()
                        });
                    }
                }
            }
        }

        for (let i = 0; i < newlist.length; i++)
            output['result'].push(newlist[i]);
        return output;
    }

    sort_by (field: any, reverse: any, primer: any) {

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
    fieldSorter(fields: any) {
        return function (a: any, b: any) {
            return fields
                .map(function (o: any) {
                    var dir = 1;
                    if (o[0] === '-') {
                        dir = -1;
                        o = o.substring(1);
                    }
                    if (a[o] > b[o]) return dir;
                    if (a[o] < b[o]) return -(dir);
                    return 0;
                })
                .reduce(function firstNonZeroValue(p: any, n: any) {
                    return p ? p : n;
                }, 0);
        };
    }
    findKey_in_Apply(apply_lists:any[], orderValue:string) {
        // console.log(apply_lists);
        if (orderValue.search("_") != -1) {
            return orderValue;
        }
        else {
            for (let apply_object of apply_lists) {
                let keys = Object.keys(apply_object);
                // console.log(apply_object);
                if (orderValue == keys[0]) {
                    let short_apply_key = Object.keys(apply_object[orderValue])[0]
                    return apply_object[orderValue][short_apply_key];
                }
            }
        }
    }
    find_Common_Apply_Object(apply_lists:any[], applyKey_in_column:string[]) {
        let common_AO_lists:any[] = [];
        for (let i:number = 0; i < apply_lists.length; i++) {
            let keys = Object.keys(apply_lists[i]);
            for (let applyKey of applyKey_in_column) {
                if (keys[0] == applyKey) {
                    common_AO_lists.push(apply_lists[i])
                }
            }
        }
        return common_AO_lists;
    }
    find_Common_Group_Key(groupKey_lists:string[], groupKey_in_column:string[]) {
        let common_GroupKey_list:any[] = [];
        for (let i:number = 0; i < groupKey_lists.length; i++) {
            for (let key of groupKey_in_column) {
                if(groupKey_lists[i] == key) {
                    common_GroupKey_list.push(groupKey_lists[i]);
                }
            }
        }
        return common_GroupKey_list
    }
    createGroup(data:any, group: any) {
        if (typeof group === "undefined") {
            Log.info("Not doing GROUP query");
            return data;
        }

        Log.info("Started GROUP query");
        let result:any = this.groupQueryHelper(data, function (item: any) {
            let grouped: any = [];
            // console.log(item);
            for (let value of group) {
                let real_value = Doeverything.findKey(value);
                grouped.push(item[real_value]);
            }
            return grouped;
        });
        return result;
    }
    groupQueryHelper(data:any, f:any) {
        let groups:any = {};
        data.forEach(function(content:any) {
            let group = JSON.stringify(f(content));
            groups[group] = groups[group] || [];
            groups[group].push(content);
        });
        return Object.keys(groups).map(function(group) {
            return groups[group];
        });
    }
    applyQuery(data:any[], apply:any, group: any):any {
        if (typeof apply  === "undefined") {
            Log.info("Not doing APPLY query and SHOULD NOT have done GROUP query");
            return data;
        }
        Log.info("Started APPLY query");
        let result:any[] = [];
        // traverse through each group of data
        for(let content of data){
            let jsonApply:any = {};
            for (let i = 0; i < apply.length; i++) {
                let applykey = Object.keys(apply[i])[0];
                let applytoken = Object.keys(apply[i][applykey])[0];
                let key: string = this.findKey(apply[i][applykey][applytoken]);

                let queryResult: any;
                if (applytoken == "MAX")
                {
                    let max = content[0][key];
                    for (let obj of content) {
                        if (obj[key] > max) {
                            max = obj[key];
                        }
                    }
                    queryResult = max;
                }
                else if (applytoken == "MIN")
                {
                    let min = content[0][key];
                    for (let obj of content) {
                        if (obj[key] < min) {
                            min = obj[key];
                        }
                    }
                    queryResult = min;
                }
                else if (applytoken == "AVG")
                {
                    let sum = 0;
                    let temp = 0;
                    for (let obj of content) {
                        temp = obj[key];
                        temp = temp * 10;
                        temp = Number(temp.toFixed(0))
                        sum += temp;
                    }
                    queryResult = Number(((sum / content.length)/10).toFixed(2));
                }
                else if (applytoken == "SUM")
                {
                    let sum = 0;
                    for (let obj of content){
                        sum+=obj[key]
                    }
                    queryResult = Number(sum);
                }
                else if (applytoken == "COUNT")
                {
                    let values: any[] = [];
                    for (let obj of content) {
                        values.push(obj[key]);
                    }

                    values = values.filter(function (e, i, values) {
                        return values.lastIndexOf(e) === i;
                    });

                    queryResult = values.length;
                }

                // save result as a json object
                jsonApply[applykey] = queryResult;
            }

            // put into a JSON object
            let jsonContent:any = {};
            for (let key of group) {
                jsonContent[key] = content[0][this.findKey(key)];
            }
            Object.keys(jsonApply).forEach(function (key:any) {
                jsonContent[key] = jsonApply[key];
            });
            // add to result array
            result.push(jsonContent);
        }

        Log.info("Finished APPLY query");
        return result;
    }
    sort(dir:string, keys:string[], collected_data:any) {
        let dataKeys:string[] = Object.keys(collected_data[0]);
        for (let key of keys) {
            for (let dataKey of dataKeys) {
                if (dataKey == key) {
                    if (dir == "DOWN") {
                        if (typeof collected_data[0][key] == "number") {
                            collected_data.sort(this.sort_by(key, true, parseFloat));
                        }
                        else {
                            collected_data.sort(this.sort_by(key, true, function (a: any) {
                                return a.toUpperCase()
                            }));
                        }
                    }

                    else if (dir == "UP") {
                        for (let key of keys) {
                            if (typeof collected_data[0][key] == "number") {
                                collected_data.sort(this.sort_by(key, false, parseFloat));
                            }
                            else {
                                collected_data.sort(this.sort_by(key, false, function (a: any) {
                                    return a.toUpperCase()
                                }));
                            }
                        }
                    }
                }
            }
        }
    }
}

var Doeverything: DoEveryThing = null;
var counter: boolean = true;
function getLatandLon(address: any){
    let res = encodeURI(address);
    let path = "/api/v1/team35/"+res;

    let options = {
        host: "skaha.cs.ubc.ca",
        port: 11316,
        path: path
    };

    return new Promise(function (fulfill, reject) {
        http.get(options, function (res:any) {
            let str:string = "";
            res.on("data", function (data:any) {
                str+=data;
            });

            res.on("end", function () {
                fulfill(str);
            });
        }).on("error", function(error:any) {
            reject(error);
        });
    });
}
function identifyID(options: any): string{
    let columnsValue = options["COLUMNS"];
    if(columnsValue == 0){
        throw error;
    }
    let indexOF_ = columnsValue[0].indexOf("_");
    let id = columnsValue[0].substring(0, indexOF_);
    return id;
}
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
                    if (id == 'courses') {
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
                                            if(each1["Section"] == "overall"){
                                                each1["Year"] = 1900;
                                            } else {
                                                each1["Year"] = Number(each1["Year"]);
                                            }
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
                    }

                    else if (id == 'rooms') {

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
                                    let qq:number = 0;

                                    // console.log(document1);
                                    // console.log(promiseList.length);
                                    // console.log(data.length);
                                    for (let each of data) {
                                        let rooms_fullname:string ='';
                                        let rooms_shortname:string ='';
                                        // let rooms_number:string = '';
                                        let rooms_number:string = '';
                                        let rooms_number_list:string[] = [];
                                        let rooms_name:string = rooms_shortname + "_" + rooms_number;
                                        let rooms_address:string ='';
                                        let rooms_lat:number = 0;
                                        let rooms_lon:number = 0;
                                        let rooms_seats:number = 0;
                                        let rooms_seats_list:number[] = [];
                                        let rooms_type:string ='';
                                        let rooms_type_list:string[] = [];
                                        let rooms_furniture:string ='';
                                        let rooms_furniture_list:string[] = [];
                                        let rooms_href:string ='';
                                        let rooms_href_list:string[] = [];
                                        let document1 = parse5.parse(each);
                                        let a:number = 0;
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
                                                                                                                                                            // let rooms_number:string = '';
                                                                                                                                                            let room_info_list:any = {};
                                                                                                                                                            // console.log(item14.childNodes);
                                                                                                                                                            // console.log(item14.attrs);
                                                                                                                                                            if (item14['nodeName'] != '#text') {
                                                                                                                                                                for (let item15  of item14.childNodes) {
                                                                                                                                                                    if (item15['value'] != 'More info') {
                                                                                                                                                                        // console.log("rooms_number : " + item15['value']); //room number
                                                                                                                                                                        // room_info_list.push(("{" + "rooms_number : " + item15['value'] + "}"));
                                                                                                                                                                        rooms_number = item15['value'];
                                                                                                                                                                        rooms_number_list.push(item15['value']);
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                            else {
                                                                                                                                                                // let i:number = 0 ;

                                                                                                                                                                if (item14['value'].trim().length >= 1) {
                                                                                                                                                                    // console.log(item14['value'].trim()); // capacity furniture room_type
                                                                                                                                                                    if (item14['value'].trim().length < 4 && item14['value'].trim().search('TBD') == -1) {

                                                                                                                                                                        rooms_seats = item14['value'].trim();
                                                                                                                                                                        rooms_seats_list.push(rooms_seats);
                                                                                                                                                                        // console.log(rooms_seats);
                                                                                                                                                                    }
                                                                                                                                                                    else  if (item14['value'].trim().length <= 18 || item14['value'].trim().search('Purpose') != -1 || item14['value'].trim().search('Group') != -1) {
                                                                                                                                                                        // console.log(item14['value'].trim());
                                                                                                                                                                        rooms_type = item14['value'].trim();
                                                                                                                                                                        rooms_type_list.push(rooms_type);
                                                                                                                                                                    }
                                                                                                                                                                    else {

                                                                                                                                                                        rooms_furniture = item14['value'].trim();
                                                                                                                                                                        rooms_furniture_list.push(rooms_furniture);
                                                                                                                                                                        // console.log(rooms_furniture);
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }

                                                                                                                                                            if (!isNullOrUndefined(item14.attrs) && item14.attrs.length == 1) {
                                                                                                                                                                rooms_href = item14.attrs[0]['value'];
                                                                                                                                                                rooms_href_list.push(rooms_href);
                                                                                                                                                                // console.log(rooms_number);
                                                                                                                                                                let address = rooms_address;


                                                                                                                                                                processList.push(getLatandLon(address).then(function (geoResponse: any){
                                                                                                                                                                    var responselat: any = null;
                                                                                                                                                                    var responselon: any = null;
                                                                                                                                                                    let response = JSON.parse(geoResponse);
                                                                                                                                                                    responselat = Number(response.lat);
                                                                                                                                                                    responselon = Number(response.lon);
                                                                                                                                                                    rooms_lat = responselat;
                                                                                                                                                                    rooms_lon = responselon;
                                                                                                                                                                    // console.log(rooms_number_list);
                                                                                                                                                                    let rooms_number_index:number = rooms_number_list.length;

                                                                                                                                                                    let each_rooms_number:string = rooms_number_list[a];
                                                                                                                                                                    let each_rooms_seats:number = Number(rooms_seats_list[a]);
                                                                                                                                                                    let each_rooms_type:string = rooms_type_list[a];
                                                                                                                                                                    let each_rooms_furniture:string = rooms_furniture_list[a];
                                                                                                                                                                    let each_rooms_href:string = rooms_href_list[a];

                                                                                                                                                                    if (rooms_number != '' && rooms_seats != 0 && rooms_type != "" && rooms_furniture != "" && rooms_href != "" ) {
                                                                                                                                                                        var newdata: any = {};
                                                                                                                                                                        newdata["rooms_fullname"] =  rooms_fullname;
                                                                                                                                                                        newdata["rooms_shortname"] =  rooms_shortname;
                                                                                                                                                                        newdata["rooms_number"] = each_rooms_number;
                                                                                                                                                                        newdata["rooms_name"] = rooms_shortname + "_" + each_rooms_number;
                                                                                                                                                                        newdata["rooms_address"] = rooms_address;
                                                                                                                                                                        newdata["rooms_lat"] = responselat;
                                                                                                                                                                        newdata["rooms_lon"] = responselon;
                                                                                                                                                                        newdata["rooms_seats"] = each_rooms_seats;
                                                                                                                                                                        newdata["rooms_type"] = each_rooms_type;
                                                                                                                                                                        newdata["rooms_furniture"] = each_rooms_furniture;
                                                                                                                                                                        newdata["rooms_href"] = each_rooms_href;
                                                                                                                                                                        if (a < rooms_number_index) {
                                                                                                                                                                            a++;
                                                                                                                                                                        }

                                                                                                                                                                    }

                                                                                                                                                                    // console.log(newdata);
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

                                    }
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
                            .catch(function() {
                                reject({code: 400, body: {"error": "this one"}});
                            });
                    }
                })
                .catch(function () {
                    reject({code: 400, body: {"error": "my text"}});
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
            let options = query[names[1]];
            let transformations = query[names[2]];
            // console.log(transformations);

            try {
                var id = identifyID(options);
                Doeverything.id = id;
            } catch(e){
                reject({code: 400, body: {"error" : "this is not valid ID"}});
            }
            /////////
            if(id in DataList){
                if (isNullOrUndefined(filterKey))
                    list = DataList[id];
                else
                    list = Doeverything.whatKindofFilter(filterKey, filterValue, DataList[id]);
            } else {
                try {
                    let datalist = JSON.parse(fs.readFileSync(id+".json", 'utf8'));
                    if (isNullOrUndefined(filterKey))
                        list = datalist;
                    else
                        list = Doeverything.whatKindofFilter(filterKey, filterValue, datalist);
                }catch(e){
                    reject({code: 424, body: {"missing":[id]}});
                }
            }
            if (Doeverything.fail) {
                Doeverything.fail = false;
                reject({code: 400, body: {"error" : Doeverything.returnMessage}});
                Doeverything.missingIds = [];
                console.log("1");
                console.log(Doeverything.returnMessage);
                Doeverything.fail_for_missingKey = false;
                Doeverything.fail_for_424 = false;
                Doeverything.fail = false;
                return;
            }

            let response = Doeverything.createModifiedList(list, options, transformations);
            // let finalOutput = Doeverything.processTransformations(response, transformations);
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
            if (Doeverything.fail_for_424) {
                reject({code: 424, body: {"error": Doeverything.missingIds}});
                Doeverything.missingIds = [];
                console.log("4");
                console.log(Doeverything.returnMessage);
            }
            if (Doeverything.fail_for_missingKey) {
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