/**
 * This is the REST entry point for the project.
 * Restify is configured here.
 */

import restify = require('restify');

import Log from "../Util";
import {InsightResponse, QueryRequest} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";
import fs = require('fs');


/**
 * Created by rtholmes on 2016-06-14.
 */

/**
 * This configures the REST endpoints for the server.
 */
export default class Server {
    private static insightFacade = new InsightFacade;

    private port: number;
    private rest: restify.Server;

    constructor(port: number) {
        Log.info("Server::<init>( " + port + " )");
        this.port = port;
    }

    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<boolean>}
     */
    public stop(): Promise<boolean> {
        Log.info('Server::close()');
        let that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }

    /**
     * Starts the server. Returns a promise with a boolean value. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<boolean>}
     */
    public start(): Promise<boolean> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Log.info('Server::start() - start');

                that.rest = restify.createServer({
                    name: 'insightUBC'
                });
                that.rest.use(restify.bodyParser({mapParams: true, mapFiles: true}));


                that.rest.get('/', function (req: restify.Request, res: restify.Response, next: restify.Next) {
                    res.send(200);
                    return next();
                });

                // provides the echo service
                // curl -is  http://localhost:4321/echo/myMessage
                that.rest.get('/echo/:msg', Server.echo);
                // that.rest.get('/square/:number', Server.square);
                // Sends a dataset. Is idempotent and can create or update a dataset id.
                // curl localhost:4321/dataset/test --upload-file FNAME.zip
                that.rest.put('/dataset/:id', Server.putDataset);
                that.rest.del('/dataset/:id', Server.deleteDataset);
                that.rest.post('/query', Server.postQuery);




                // Receives queries. Although these queries never change the server (and thus could be GETs)
                // they are formed by sending JSON bodies, which is not standard for normal GET requests.
                // curl -is -X POST -d '{ "key": "value" }' http://localhost:4321/query
                // that.rest.post('/query', restify.bodyParser(), Server.postQuery);

                // Other endpoints will go here

                that.rest.listen(that.port, function () {
                    Log.info('Server::start() - restify listening: ' + that.rest.url);
                    fulfill(true);
                });

                that.rest.on('error', function (err: string) {
                    // catches errors in restify start; unusual syntax due to internal node not using normal exceptions here
                    Log.info('Server::start() - restify ERROR: ' + err);
                    reject(err);
                });
            } catch (err) {
                Log.error('Server::start() - ERROR: ' + err);
                reject(err);
            }
        });
    }

    public static square(req: restify.Request, res: restify.Response, next: restify.Next) {
        let number = req.params.number;
        let squared_number = number * number;

        let response_json = {"squared_number": squared_number};
        res.json(200, response_json); // send respond to upstream
        return next();
    }


    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.


    public static echo(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
        try {
            let result = Server.performEcho(req.params.msg);
            Log.info('Server::echo(..) - responding ' + result.code);
            res.json(result.code, result.body);
        } catch (err) {
            Log.error('Server::echo(..) - responding 400');
            res.json(400, {error: err.message});
        }
        return next();
    }

    public static performEcho(msg: string): InsightResponse {
        if (typeof msg !== 'undefined' && msg !== null) {
            return {code: 200, body: {message: msg + '...' + msg}};
        } else {
            return {code: 400, body: {error: 'Message not provided'}};
        }
    }
    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {

        // Log.trace('RouteHandler::putDataset(..) - params: ' + JSON.stringify(req.params));

        let facade = new InsightFacade();
        let dataStr = new Buffer(req.params.body).toString('base64');

        return facade.addDataset(req.params.id, dataStr).then(function (result:any) {
            res.json(result.code, result.body);
            return next();
        }).catch(function (err:any) {
            res.json(err.code, err.body);
            return next();
        });
    }

    public static  deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next) {

        // Log.trace('RouteHandler::deleteDataset(..) - params: ' + JSON.stringify(req.params));

        let facade = new InsightFacade();

        return facade.removeDataset(req.params.id).then(function (result:any) {
            res.json(result.code, result.body);
            return next();
        }).catch(function (err:any) {
            res.json(err.code, err.body);
            return next();
        });
    }

    public static  postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {

        // Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.body));

        let facade = new InsightFacade();

        return facade.performQuery(req.body).then(function (result:any) {
            res.json(result.code, result.body);
            return next();
        }).catch(function (err:any) {
            res.json(err.code, err.body);
            return next();
        });
    }

}
