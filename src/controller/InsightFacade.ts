/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');



var JSZip = require('jszip');
var zip = new JSZip();

function isDuplicate(id: string): any {
    fs.access(id + '.json', (err) => {
        if (!err) {
            return true;
        }
        else {
            return false;
        }
    });

}

export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()')
    }

    addDataset(id: string, content: string) : Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            let promiseList: Promise<any>[] =[];
            zip.loadAsync(content,{base64: true})
                .then(function (contents:any) {
                     if (isDuplicate(id)) {
                         console.log(isDuplicate(id));
                         fs.unlink(id + '.json', (err) =>{
                             if (err) throw err;
                         })
                        var filepaths = Object.keys(contents.files);
                        for (let filepath of filepaths) {
                            promiseList.push(zip.files[filepath].async('string'));

                        }
                         Promise.all(promiseList)
                             .then(data => {
                                 fs.writeFile(id + '.json', data);
                                 fulfill({code: 201, body: {}});
                             })
                             .catch(function(){
                                 reject({code: 400, body: {"error": "my text"}});
                             });
                    }
                    else {
                         var filepaths = Object.keys(contents.files);
                         for (let filepath of filepaths) {
                             promiseList.push(zip.files[filepath].async('string'));

                         }
                         Promise.all(promiseList)
                             .then(data => {
                                 fs.writeFile(id + '.json', data);
                                 fulfill({ code: 204, body: {} });
                             })
                             .catch(function(){
                                 reject({code: 400, body: {"error": "my text"}});
                             });
                    }

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
            let promiseList: Promise<any>[] =[];
        })




    }
}
