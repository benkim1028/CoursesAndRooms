/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');


var rp = require('request-promise-native');
var JSZip = require('jszip');
var zip = new JSZip();
var jsonfile = require('jsonfile')


export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string) : Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            let promiseList: Promise<any>[] =[];
            zip.loadAsync(content,{base64: true})
                .then(function (contents:any) {
                    var filepaths = Object.keys(contents.files);
                    for (let filepath of filepaths) {
                        promiseList.push(zip.files[filepath].async('string'));
                    }
                    Promise.all(promiseList)
                        .then(data => {
                            var writeFile = require('write-file');
                            writeFile('courses.json', data);
                            fulfill({code: 204, body: {}});
                        })
                        .catch(function(){
                            reject({code: 400, body: {}});
                        });
                    /*create all files in json format in folder[courses] without using Promise.all*/
                    // for (let filepath of filepaths) { // {"result":[],"rank":0}
                    //     zip.files[filepath].async('string').then(function(data:any){
                    //         let wholeData:any = JSON.parse(data);
                    //         fullData.push(JSON.stringify(data));
                    //         var writeFile = require('write-file');
                    //         writeFile(filepath + '.json', wholeData);
                    //     });
                    // }
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
        return null;

        // return new Promise(function (fulfill, reject) {
        //     //var promiseList:Promise<any>[];
        //     fs.readFile('courses.zip', function(err, data) {
        //         if (err) throw err;
        //         zip.loadAsync(data)
        //             .then(function (contents:any) {
        //                 //var keys = Object.keys(contents); // keys : [ 'files', 'comment', 'root', 'clone' ]
        //                 var filepaths = Object.keys(contents.files);

        /*For debugging*/
        // zip.files['courses/AANB551'].async('string').then(function(data:any){
        //
        //     for (let finalObj of finalObjs(data)) {
        //         // let keys = Object.keys(finalObj);
        //         // console.log(keys);
        //
        //
        //         let id_number:number = finalObj['id'];
        //         let id_string:string = id_number.toString();
        //         console.log(id_string);
        //         if (id == id_string) {
        //             reject("error: This dataset already contains the input id");
        //         }
        //         else {
        //
        //         }
        //
        //     }
        //
        //
        //
        // })
        /*Real Code*/
        // for (let filepath of filepaths) { // {"result":[],"rank":0}
        //     if (!fs.lstatSync(filepath).isDirectory()) {
        //         zip.files[filepath].async('string').then(function(data:any){
        //
        //             for (let finalObj of finalObjs(data)) {
        //                 let id_number:number = finalObj['id'];
        //                 let id_string:string = id_number.toString();
        //
        //                 //console.log(id_string);
        //                 if (id == id_string) {
        //                     fulfill(201); //  the operation was successful and the id already existed
        //                     return;
        //                 }
        //                 // else {
        //                 //
        //                 //
        //                 // }
        //
        //
        //
        //             }
        //
        //         })
        //
        //     }
        // }

    }
}
