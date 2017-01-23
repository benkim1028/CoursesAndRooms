/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');



var JSZip = require('jszip');
var zip = new JSZip();
//var jsonfile = require('jsonfile');
var writeFile = require('write-file');
//const validFilename = require('valid-filename');


var getAllFileNamesFromFolder = function(dir:any) {

    var results:string[] = [];
    fs.readdirSync(dir).forEach(function(file:any) {

        //file = dir+'/'+file;
        //console.log(file);
        // var stat = filesystem.statSync(file);
        //
        // if (stat && stat.isDirectory()) {
        //     results = results.concat(getAllFileNamesFromFolder(file))
        // } else results.push(file);
        results.push(file);
    });
    return results;
};
function isUniqueFileName(id:string, fileNames:string[]):boolean {
    for (let fileName of fileNames) {
        if (fileName == id){
            return false;
        }
    }
    return true;
}


// var query = require('obj-query')

// function finalObj (data:any):any {
//     let wholeData:any = JSON.parse(data);
//     console.log(wholeData);
//     let dataKeys:any = Object.keys(wholeData);
//     for (let dataKey of dataKeys) {
//         if (dataKey == 'result') {
//             return wholeData[dataKey];
//         }
//     }
// }

export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string) : Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            let promiseList: Promise<any>[] =[];
            // let listofFileNames = getAllFileNamesFromFolder('/Users/mobileheo/cpsc310project_team35');
            zip.loadAsync(content,{base64: true})
                .then(function (contents:any) {
                     // if (isUniqueFileName(id +'.json', listofFileNames)) {
                     //     console.log((isUniqueFileName(id +'.json', listofFileNames)));
                        var filepaths = Object.keys(contents.files);
                        for (let filepath of filepaths) {
                            promiseList.push(zip.files[filepath].async('string'));

                        }
                         Promise.all(promiseList)
                             .then(data => {
                                 writeFile(id + '.json', data);
                                 fulfill({ code: 204, body: {} });
                             })
                             .catch(function(){
                                 reject({code: 400, body: {"error": "my text"}});
                             });
                    // }
                    // else {
                    //      fulfill({code: 201, body: {}});
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
        //query.courses_dept ==
        return null;




    }
}
