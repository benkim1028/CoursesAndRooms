import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');
import {isNullOrUndefined} from "util";
import {error} from "util";
var http = require("http");
var JSZip = require('jszip');
const parse5 = require('parse5');

export interface roomData {
    fullname?: string,
    shortname?: string,
    number?: string,
    name?: string,
    address?: string,
    lat?: number,
    lon?: number,
    seats?: number,
    type?: string,
    furniture?: string,
    href?: string
}


let DataList: any = {};
class setRoomData {
    constructor() {
    }

    setRoomData(filename: string, node: any): Promise<roomData[]> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            let result: roomData[] = [];

            // array for promise
            let processList: any[] = [];

            // search for building name and address
            let roomInfo: any[] = [];
            let text: string[] = [];
            that.searchRecursively(node, "id", "building-info", roomInfo);


            // get fullname and address and set initial info
            roomInfo.forEach(function (info: any) {
                that.getInfo(info, text);
            });
            let fullname = text[0];
            let address = text[1];
            let shortname = filename;

            // clear fields
            roomInfo = [];

            let roomData: any[] = [];
            let parent: any;

            // search for first room info and get the parent
            that.searchRecursively(node, "class", "odd views-row-first", roomInfo);
            if (roomInfo.length == 0) {
                that.searchRecursively(node, "class", "odd views-row-first views-row-last", roomInfo);
            }
            if (roomInfo.length > 0) {
                parent = roomInfo[0].parentNode;

                // filter only needed info
                parent.childNodes.forEach(function (child: any) {
                    if (child.nodeName == "tr") {
                        roomData.push(child);
                    }
                });


                processList.push(
                    that.getLatAndLon(address).then(function (geoResponse) {
                        // set data again
                        roomData.forEach(function (child: any) {
                            let data: roomData = {};
                            data.fullname = fullname;
                            data.address = address;
                            data.shortname = shortname;
                            text = [];
                            that.getInfo(child, text);
                            data.number = text[0];
                            data.seats = Number(text[1]);
                            data.furniture = text[2];
                            data.type = text[3];
                            data.name = data.shortname + "_" + data.number;

                            // get href
                            let reference: string[] = [];
                            that.getHref(child, reference);
                            let href: string = reference[0];

                            data.href = href;

                            let latlon = JSON.parse(geoResponse);
                            data.lat = Number(latlon.lat);
                            data.lon = Number(latlon.lon);

                            result.push(data);
                        });
                    }).catch(function (err) {
                        if (err) throw err;
                    })
                );
            }

            Promise.all(processList).then(function () {
                fulfill(result);
            }).catch(function (err) {
                reject(err);
            })
        });
    }

    private searchRecursively(node: any, name: string, value: string, roomInfo: any[]) {
        if (typeof node.attrs !== "undefined") {
            node.attrs.forEach(function (attribute: any) {
                if (attribute.name == name && attribute.value == value) {
                    roomInfo.push(node);
                }
            });
        }

        if (typeof node.childNodes !== "undefined") {
            let that = this;
            node.childNodes.forEach(function (child: any) {
                that.searchRecursively(child, name, value, roomInfo);
            });
        }
    }

    // get text info
    private getInfo(node: any, array: string[]) {
        if (typeof node.value !== "undefined") {
            if (node.value.trim() != "") {
                array.push(node.value.trim());
            }
        }

        if (typeof node.childNodes !== "undefined") {
            let that = this;
            node.childNodes.forEach(function (child: any) {
                that.getInfo(child, array);
            });
        }
    }

    // get href
    private getHref(node: any, array: string[]) {
        if (typeof node.attrs !== "undefined") {
            node.attrs.forEach(function (attribute: any) {
                if (attribute.name == "href") {
                    array.push(attribute.value);
                }
            });
        }

        if (typeof node.childNodes !== "undefined") {
            let that = this;
            node.childNodes.forEach(function (child: any) {
                that.getHref(child, array);
            });
        }
    }


    private getLatAndLon(address: string): Promise<any> {
        let res = encodeURI(address);
        let path = "/api/v1/team35/" + res;

        let options = {
            host: "skaha.cs.ubc.ca",
            port: 11316,
            path: path
        };

        return new Promise(function (fulfill, reject) {
            http.get(options, function (res: any) {
                let str: string = "";
                res.on("data", function (data: any) {
                    str += data;
                });

                res.on("end", function () {
                    fulfill(str);
                });
            }).on("error", function (error: any) {
                reject(error);
            });
        });
    }

    getValidBuildings(index: any) {
        let info: any[] = [];
        this.searchRecursively(index, "class", "views-field views-field-field-building-code", info);
        let names: any[] = [];
        let that = this;
        info.forEach(function (node) {
            that.getInfo(node, names);
        });

        return names;
    }
}
class DoEveryThing {
    id: string;
    fail: boolean;
    fail_for_424: boolean;
    fail_for_missingKey: boolean;
    returnMessage: string;
    missingIds: string[];
    columsLists: string[];
    columsLists_for_Apply: string[];

    constructor() {
        Log.trace('Doeverything::init()');
        this.fail = false;
        this.fail_for_424 = false;
        this.fail_for_missingKey = false;
        this.missingIds = [];
        this.columsLists = [];
        this.columsLists_for_Apply = [];

    }

    identifyID() {
        if (this.id == "courses") {
            return "id";
        } else if (this.id == "rooms") {
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

    OrderValueChecker(orderValue: any) {
        if (this.id == "courses") {
            if (orderValue.search("_") != -1) {
                return orderValue == "courses_avg" || orderValue == "courses_pass" || orderValue == "courses_fail" || orderValue == "courses_audit" || orderValue == "courses_year" || orderValue == "courses_size";
            } else
                return true;
        }
        if (this.id == "rooms") {
            if (orderValue.search("_") != -1) {
                return orderValue == "rooms_lat" || orderValue == "rooms_lon" || orderValue == "rooms_seats";
            } else
                return true;
        }
    }

    Typechecker(filterkey: any, shouldbe: string, value: any, key: string) {
        if (this.id == "courses") {
            if (shouldbe == "number") {
                if (typeof value !== shouldbe || key == "courses_dept" || key == "courses_id" || key == "courses_instructor" || key == "courses_title" || key == "courses_uuid") {
                    this.fail = true;
                    this.returnMessage = filterkey + " received non-nunmber"
                }
            } else if (shouldbe == "string") {
                if (typeof value !== shouldbe || key == "courses_avg" || key == "courses_pass" || key == "courses_fail" || key == "courses_audit" || key == "courses_year" || key == "courses_size") {
                    this.fail = true;
                    this.returnMessage = filterkey + " received non-string"
                }
            }
        }
        else if (this.id == "rooms") {
            if (shouldbe == "number") {
                if (typeof value !== shouldbe || key == "rooms_fullname" || key == "rooms_shortname" || key == "rooms_number" || key == "rooms_name" || key == "rooms_address" ||
                    key == "rooms_type" || key == "rooms_furniture" || key == "rooms_href") {
                    this.fail = true;
                    this.returnMessage = filterkey + " received non-nunmber"
                }
            } else if (shouldbe == "string") {
                if (typeof value !== shouldbe || key == "rooms_lat" || key == "rooms_lon" || key == "rooms_seat") {
                    this.fail = true;
                    this.returnMessage = filterkey + " received non-string"
                }
            }
        }
    }

    createGTList(key: string, value: number, dataList: any[], not: boolean): any {
        this.Typechecker("GT", 'number', value, key);
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
        this.Typechecker("LT", 'number', value, key);
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
        this.Typechecker("EQ", 'number', value, key);
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
        this.Typechecker("IS", 'string', value, key);
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
            if (id == "courses") {
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
                    if (key == "courses_size")
                        return "Size";
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
            if (id == "rooms") {
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
            if (isNullOrUndefined(transformations["APPLY"]) || isNullOrUndefined(transformations["GROUP"])) {
                this.fail = true;
                this.returnMessage = "transformations is not valid";
                return this.returnMessage;
            } else if (transformations["GROUP"].length == 0) {
                this.fail = true;
                this.returnMessage = "GROUP is empty list";
                return this.returnMessage;
            }
            let groupkeys: any[] = [];
            let applykeys: any[] = [];
            let applykeys_in_Trans: any[] = [];
            let common_apply_objects: any[] = [];
            for (let k = 0; k < transformations["APPLY"].length; k++) {
                if (Object.keys(transformations["APPLY"][k])[0].search("_") != -1) {
                    this.fail = true;
                    this.returnMessage = "APPLY key cannot have _ ";
                    return this.returnMessage;
                }
                let applykey_in_Trans = Object.keys(transformations["APPLY"][k]);
                applykeys_in_Trans.push(applykey_in_Trans[0]);
            }
            if (this.hasDuplicates(applykeys_in_Trans)) {
                this.fail = true;
                this.returnMessage = "Duplicates in Apply keys"
                return this.returnMessage;
            }

            // split elements in Columns into 2 parts, groupkeys and applykeys
            for (let i = 0; i < columnsValue.length; i++) {
                if (columnsValue[i].search("_") != -1)
                    groupkeys.push(columnsValue[i]);
                else
                    applykeys.push(columnsValue[i]);
            }
            for (let i = 0; i < transformations["GROUP"].length; i++) {
                if (this.findKey(transformations["GROUP"][i]) == "appliedKey") {
                    this.fail = true;
                    this.returnMessage = "Group cannot contain appliedkey"
                    return this.returnMessage;
                }
            }

            //check if all the keys with _ belong to GROUP if not throw error
            for (let x = 0; x < groupkeys.length; x++) {
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
            let valid_group_keys: string[] = this.find_Common_Group_Key(transformations["GROUP"], groupkeys);
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
                let apply: any = transformations["APPLY"];
                if (typeof orderValue === 'object') {
                    let dir: string = orderValue["dir"];
                    let keys: string[] = orderValue["keys"];
                    // fail if order is not valid
                    if (isNullOrUndefined(dir) || isNullOrUndefined(keys) || keys.length == 0) {
                        this.fail = true;
                        this.returnMessage = "Order(OBJECT) is not Valid";
                        return this.returnMessage;
                    }
                    else for (let key of keys) {
                        if (!columnsValue.includes(key)) {
                            this.fail = true;
                            this.returnMessage = "Order(OBJECT) is not Valid - key is not included in column";
                            return this.returnMessage;
                        }
                    }
                    newlist = this.sort(dir, keys, newlist);
                }

                if (typeof orderValue === 'string') {
                    //fail if order is not valid
                    if (!columnsValue.includes(orderValue)) {
                        this.fail = true;
                        this.returnMessage = "Order is not in Columns";
                        return this.returnMessage;
                    }
                    if (this.OrderValueChecker(orderValue)) {
                        newlist.sort(this.sort_by(orderValue, false, parseFloat));
                    } else {
                        newlist.sort(this.sort_by(orderValue, false, function (a: any) {
                            return a.toUpperCase()
                        }));
                    }
                }

            }

            else {
                // if ORDER is OBJECT (e.g has dir and keys)
                if (typeof orderValue === 'object') {
                    let dir: string = orderValue["dir"];
                    let keys: string[] = orderValue["keys"];
                    // fail if order is not valid
                    if (isNullOrUndefined(dir) || isNullOrUndefined(keys) || keys.length == 0) {
                        this.fail = true;
                        this.returnMessage = "Order(OBJECT) is not Valid";
                        return this.returnMessage;
                    }
                    else for (let key of keys) {
                        if (!columnsValue.includes(key)) {
                            this.fail = true;
                            this.returnMessage = "Order(OBJECT) is not Valid - key is not included in column";
                            return this.returnMessage;
                        }
                    }
                    newlist = this.sort(dir, keys, newlist);
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
                        newlist.sort(this.sort_by(orderValue, false, parseFloat));
                    } else {
                        newlist.sort(this.sort_by(orderValue, false, function (a: any) {
                            return a.toUpperCase()
                        }));
                    }
                }
            }
        }

        for (let i = 0; i < newlist.length; i++)
            output['result'].push(newlist[i]);
        return output;
    }

    sort_by(field: any, reverse: any, primer: any) {

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

    hasDuplicates(array: any) {
        var valuesSoFar = Object.create(null);
        for (var i = 0; i < array.length; ++i) {
            var value = array[i];
            if (value in valuesSoFar) {
                return true;
            }
            valuesSoFar[value] = true;
        }
        return false;
    }

    find_Common_Apply_Object(apply_lists: any[], applyKey_in_column: string[]) {
        let common_AO_lists: any[] = [];
        for (let i: number = 0; i < apply_lists.length; i++) {
            let keys = Object.keys(apply_lists[i]);
            for (let applyKey of applyKey_in_column) {
                if (keys[0] == applyKey) {
                    common_AO_lists.push(apply_lists[i])
                }
            }
        }
        return common_AO_lists;
    }

    find_Common_Group_Key(groupKey_lists: string[], groupKey_in_column: string[]) {
        let common_GroupKey_list: any[] = [];
        for (let i: number = 0; i < groupKey_lists.length; i++) {
            for (let key of groupKey_in_column) {
                if (groupKey_lists[i] == key) {
                    common_GroupKey_list.push(groupKey_lists[i]);
                }
            }
        }
        return common_GroupKey_list
    }

    createGroup(data: any, group: any) {
        if (typeof group === "undefined") {
            Log.info("Not doing GROUP query");
            return data;
        }

        Log.info("Started GROUP query");
        let result: any = this.groupQueryHelper(data, function (item: any) {
            let grouped: any = [];
            // console.log(item);
            for (let value of group) {
                let real_value = Doeverything.findKey(value);
                if (real_value == "appliedKey") {
                    Doeverything.fail = true;
                    Doeverything.returnMessage = "group has invalud key"
                    return Doeverything.returnMessage;
                }

                grouped.push(item[real_value]);
            }
            return grouped;
        });
        return result;
    }

    groupQueryHelper(data: any, f: any) {
        let groups: any = {};
        data.forEach(function (content: any) {
            let group = JSON.stringify(f(content));
            groups[group] = groups[group] || [];
            groups[group].push(content);
        });
        return Object.keys(groups).map(function (group) {
            return groups[group];
        });
    }

    applyQuery(data: any[], apply: any, group: any): any {
        if (typeof apply === "undefined") {
            Log.info("Not doing APPLY query and SHOULD NOT have done GROUP query");
            return data;
        }
        Log.info("Started APPLY query");
        let result: any[] = [];
        // traverse through each group of data
        for (let content of data) {
            let jsonApply: any = {};
            for (let i = 0; i < apply.length; i++) {
                let applykey = Object.keys(apply[i])[0];
                let applytoken = Object.keys(apply[i][applykey])[0];
                let key: string = this.findKey(apply[i][applykey][applytoken]);

                let queryResult: any;
                if (applytoken == "MAX") {
                    if (!this.OrderValueChecker(key)) {
                        this.fail = true;
                        this.returnMessage = "MAX received non number"
                        return this.returnMessage;
                    }
                    let max = content[0][key];
                    for (let obj of content) {
                        if (obj[key] > max) {
                            max = obj[key];
                        }
                    }
                    queryResult = max;
                }
                else if (applytoken == "MIN") {
                    if (!this.OrderValueChecker(key)) {
                        this.fail = true;
                        this.returnMessage = "MIN received non number"
                        return this.returnMessage;
                    }
                    let min = content[0][key];
                    for (let obj of content) {
                        if (obj[key] < min) {
                            min = obj[key];
                        }
                    }
                    queryResult = min;
                }
                else if (applytoken == "AVG") {
                    if (!this.OrderValueChecker(key)) {
                        this.fail = true;
                        this.returnMessage = "AVG received non number"
                        return this.returnMessage;
                    }
                    let sum = 0;
                    let temp = 0;
                    for (let obj of content) {
                        temp = obj[key];
                        temp = temp * 10;
                        temp = Number(temp.toFixed(0))
                        sum += temp;
                    }
                    queryResult = Number(((sum / content.length) / 10).toFixed(2));
                }
                else if (applytoken == "SUM") {
                    if (!this.OrderValueChecker(key)) {
                        this.fail = true;
                        this.returnMessage = "SUM received non number"
                        return this.returnMessage;
                    }
                    let sum = 0;
                    for (let obj of content) {
                        sum += obj[key]
                    }
                    queryResult = Number(sum);
                }
                else if (applytoken == "COUNT") {
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
            let jsonContent: any = {};
            for (let key of group) {
                jsonContent[key] = content[0][this.findKey(key)];
            }
            Object.keys(jsonApply).forEach(function (key: any) {
                jsonContent[key] = jsonApply[key];
            });
            // add to result array
            result.push(jsonContent);
        }

        Log.info("Finished APPLY query");
        return result;
    }

    groupSort(data: any[], sortkey: any, dir: any): any {
        Log.info("Started groupsort query");
        let result: any[] = [];
        // traverse through each group of data
        for (let content of data) {
            let sortedEachData = this.mergeSort(content, sortkey, dir);
            for (let eachData of sortedEachData) {
                result.push(eachData);
            }
        }
        Log.info("Finished groupsort query");
        return result;
    }

    sort(dir: string, keys: string[], collected_data: any) {
        let datalist = [];
        let temp = [];
        let keyslist = [];
        for (let i = 0; i < keys.length; i++) {
            if (i == 0) {
                datalist = this.mergeSort(collected_data, keys[0], dir);
                keyslist.push(keys[0]);
            }
            else {
                temp = this.createGroup(datalist, keyslist);
                datalist = this.groupSort(temp, keys[i], dir);
                keyslist.push(keys[i]);
            }
        }
        return datalist;
    }

    mergeSort(data: any, key: string, dir: string): any[] {
        if (data.length < 2) {
            return data;
        }

        let middle = Math.floor(data.length / 2);
        let left = data.slice(0, middle);
        let right = data.slice(middle);

        return this.merge(this.mergeSort(left, key, dir), this.mergeSort(right, key, dir), key, dir);
    }

    merge(left: any, right: any, key: string, dir: string): any[] {
        let result: any[] = [];
        let il = 0;
        let ir = 0;

        while (il < left.length && ir < right.length) {
            if (dir == "UP") {
                if (left[il][key] <= right[ir][key]) {
                    result.push(left[il]);
                    il++;
                } else {
                    result.push(right[ir]);
                    ir++;
                }
            } else if (dir == "DOWN") {
                if (left[il][key] <= right[ir][key]) {
                    result.push(right[ir]);
                    ir++;
                } else {
                    result.push(left[il]);
                    il++;
                }
            }
        }

        if (dir == "UP") {
            return result.concat(left.slice(il)).concat(right.slice(ir));
        } else {
            return result.concat(right.slice(ir)).concat(left.slice(il));
        }
    }
}

var Doeverything: DoEveryThing = null;
var setroomData: setRoomData = null;
var counter: boolean = true;

function identifyID(options: any): string {
    let columnsValue = options["COLUMNS"];
    if (columnsValue == 0) {
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

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            let promiseList: Promise<any>[] = [];
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
                                    var courses_size = 0;
                                    for (let each1 of course_info) {
                                        if (each1["Section"] != "overall") {
                                            let size = each1["Pass"] + each1["Fail"];
                                            if (courses_size < size) {
                                                courses_size = size;
                                            }
                                        }
                                    }
                                    for (let each1 of course_info) {// each = each object in result
                                        if (each1 != []) {
                                            each1["Size"] = courses_size;
                                            if (each1["Section"] == "overall") {
                                                each1["Year"] = 1900;
                                                each1["id"] = each1["id"].toString();
                                            } else {
                                                each1["Year"] = Number(each1["Year"]);
                                                each1["id"] = each1["id"].toString();
                                            }

                                            list.push(each1);
                                        }
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
                        let processedDataset: Array<{}> = [];
                        let processList: any[] = [];
                        let processList2: any[] = [];
                        let buildings: string[] = [];
                        setroomData = new setRoomData;

                        // Iterate through each file
                        Object.keys(zip.files).forEach(function (filename) {
                            if (zip.file(filename) != null) {
                                if (!zip.file(filename).dir) {
                                    // Add async to promise array
                                    processList.push(
                                        zip.file(filename).async('string').then(function (content: any) {
                                            let htmlContent = parse5.parse(content);
                                            if (!filename.includes(".")) {
                                                let regex = /.*\/(\w*)/;
                                                let shortname: string;
                                                if (regex.test(filename)) {
                                                    shortname = regex.exec(filename)[1];
                                                } else {
                                                    shortname = filename;
                                                }
                                                processList2.push(
                                                    setroomData.setRoomData(shortname, htmlContent).then(function (result: any) {
                                                        for (let data of result) {
                                                            processedDataset.push(data);
                                                        }
                                                    }).catch(function (err) {
                                                        reject({code: 400, body: {"error": "my text"}});
                                                    })
                                                );
                                            } else if (filename.includes("index.")) {
                                                buildings = setroomData.getValidBuildings(htmlContent);
                                            }
                                        }).catch(function (err: any) {
                                            Log.error("Unable to read files " + err);
                                            reject({code: 400, body: {"error": "my text"}});
                                            if (err) throw err;
                                        })
                                    );
                                }
                            }
                        });

                        Promise.all(processList).then(function () {
                            Promise.all(processList2).then(function () {
                                let filteredDataset: any[] = [];
                                processedDataset.forEach(function (data: any) {
                                    if (buildings.includes(data.shortname)) {
                                        filteredDataset.push(data);
                                    }
                                });
                                Log.info("Complete, length of dataset: " + filteredDataset.length);
                                fs.writeFile(id + '.json', JSON.stringify(filteredDataset));
                                fulfill({code: code, body: {}});
                            }).catch(function (err) {
                                reject({code: 400, body: {"error": "my text"}});
                            });
                        }).catch(function (err) {
                            Log.error(err);
                            reject({code: 400, body: {"error": "my text"}});
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
            fs.exists('./' + id + '.json', function (value: boolean) {
                if (!value) {
                    reject({code: 404, body: {"error": "path not exist"}});
                }
                else {
                    fs.unlink('./' + id + '.json', function () {
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
            if (names[0] != "WHERE" || names[1] != "OPTIONS") {
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
            } catch (e) {
                reject({code: 400, body: {"error": "this is not valid ID"}});
            }
            /////////
            if (id in DataList) {
                if (isNullOrUndefined(filterKey))
                    list = DataList[id];
                else
                    list = Doeverything.whatKindofFilter(filterKey, filterValue, DataList[id]);
            } else {
                try {
                    let datalist = JSON.parse(fs.readFileSync(id + ".json", 'utf8'));
                    if (isNullOrUndefined(filterKey))
                        list = datalist;
                    else
                        list = Doeverything.whatKindofFilter(filterKey, filterValue, datalist);
                } catch (e) {
                    reject({code: 424, body: {"missing": [id]}});
                }
            }
            if (Doeverything.fail) {
                Doeverything.fail = false;
                reject({code: 400, body: {"error": Doeverything.returnMessage}});
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
                else {
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