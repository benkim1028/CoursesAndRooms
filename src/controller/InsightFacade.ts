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

function findId(id: string, info:any[]):boolean {
    for(let course of info) {
        if (course.includes(id)) {
            return true
        }
    }
}
function finalObj (data:any):any {
    let wholeData:any = JSON.parse(data);
    //console.log(wholeData);
    let dataKeys:any = Object.keys(wholeData);
    for (let dataKey of dataKeys) {
        if (dataKey == 'result') {
            return wholeData[dataKey];
        }
    }
}

function createData(files: string[]):Promise<any>[] {
    let promiseList:Promise<any>[] = [];
    let zipContent: any = null;
    for (let file of files ) {
        fs.readFile(file, function(err, data) {
            if (err) throw err
            zipContent = Buffer.from(fs.readFileSync("courses.zip")).toString('base64');;
            promiseList.push(zipContent);
            // promiseList.push(JSZip.loadAsync(data[, options.base64]));
        });

    }
    return promiseList;
}




export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            //var promiseList:Promise<any>[];
            fs.readFile('courses.zip', function(err, data) {
                if (err) throw err;
                zip.loadAsync(data)
                    .then(function (contents:any) {
                        //var keys = Object.keys(contents); // keys : [ 'files', 'comment', 'root', 'clone' ]
                        var filepaths = Object.keys(contents.files);

                        /*For debugging*/
                        // zip.files['courses/AANB551'].async('string').then(function(data:any){
                        //     // console.log(data)
                        //     //let item:any = Object.keys(data["result"]);
                        //
                        //
                        //     finalObj(data);
                        //     console.log(finalObj(data));
                        //
                        // })


                        for (let filepath of filepaths) { // {"result":[],"rank":0}
                        if (!fs.lstatSync(filepath).isDirectory()) {
                            zip.files[filepath].async('string').then(function(data:any){
                                finalObj(data);
                                console.log(finalObj(data));
                            })

                        }
                        }




                    })

                    .catch(function () {
                        reject ('error: my text');
                    });
        })
        });

    }

    removeDataset(id: string): Promise<InsightResponse> {
        return null;
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return null;
    }
}
