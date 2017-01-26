/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import fs = require('fs');


var JSZip = require('jszip');
var zip = new JSZip();



export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()')
    }

    addDataset(id: string, content: string) : Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            let promiseList: Promise<any>[] =[];
            let code:number = 0;
            zip.loadAsync(content,{base64: true})
                .then(function (contents:any) {
                    var filepaths = Object.keys(contents.files);
                    for (let filepath of filepaths) {
                        promiseList.push(zip.files[filepath].async('string'));

                    }
                    fs.access(id + '.json', (err) => {
                        if (!err) {
                            fs.unlink(id + '.json', (err) =>{
                                if (err) throw err;
                            })
                            code = 201; // id already existed

                        }
                        else {
                            code = 204; // id is new
                        }
                        Promise.all(promiseList)
                            .then(data => {
                                data.shift();
                                fs.writeFile(id + '.json', '[' + data + ']');
                                fulfill({code: code, body: {}});
                            })
                            .catch(function(){
                                reject({code: 400, body: {"error": "my text"}});
                            });

                    });
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
            var test = fs.readFileSync('testfile.json', 'utf-8');
            var k:any = JSON.parse(test);
            // console.log(k);
            for (let t of k) {
                // console.log(t);
                var keys = Object.keys(t);
                var course_info = t[keys[0]];
                // console.log(course_info);
                for (let each of course_info){
                    var keys = Object.keys(each);
                    // console.log(keys);
                    for (let key of keys) {
                        if (key == 'Avg') {
                            console.log(each[key]);
                        }
                    }
                    // console.log(each['Avg']);
                    // console.log(each[])
                    // console.log(each['avg']);
                }

            }


            // reject({code: 400, body: {"error": "my text"}});
            fulfill({code: 201, body: {}})
        })




    }
}
