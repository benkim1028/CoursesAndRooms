/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');


var rp = require('request-promise-native');
var JSZip = require('jszip');
var zip = new JSZip();
var extract = require('extract-zip')
const http = require('http');
const unzipResponse = require('unzip-response');


// function getQueryValue(query:string, queryData:any[]): any[] {
//     for(let item of queryData) {
//         var keys = Object.keys(item);
//         var valueList: any[] = [];
//         for(let key of keys) {
//             if (key == query) {
//                 let value:any = item[key];
//                 return value;
//             }
//         }
//     }
// }
//
// function createList (zip_file:any): any[] {
//     var dataList: any[] = [];
//     if (zip_file != undefined){
//         for (let object of zip_file) {
//             dataList.push(object);
//         }
//         return dataList;
//     }
//     else {"error"}
//
// }

function findId(id: string, courses:string[]):boolean {
    for(let course of courses) {
        if (course.includes(id)) {
            return true
        }
    }
}



export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            fs.readFile("courses.zip", function(err, data) {
                if (err) throw err;
                JSZip.loadAsync(data)
                    .then(function (zip:any) {
                        var files = zip['files'];
                        let keys = Object.keys(files);
                        //console.log(keys); //Object.keys(zip['files'])
                        if(findId(id, keys)){
                            console.log("1");
                            fulfill(201);
                        }
                        else {
                            fulfill(204);

                        }
                     })
                    .catch(function () {
                        reject ('error: my text');
                    });
            });
        });

    }

    removeDataset(id: string): Promise<InsightResponse> {
        return null;
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return null;
    }
}
