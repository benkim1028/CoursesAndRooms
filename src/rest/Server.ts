/**
 * This is the REST entry point for the project.
 * Restify is configured here.
 */

import restify = require('restify');

import Log from "../Util";
import {InsightResponse, QueryRequest} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";


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
                that.rest.get('/square/:number', Server.square);
                that.rest.get('/putDataset2/:id', Server.putDataset2);

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



    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.

    public static square(req: restify.Request, res: restify.Response, next: restify.Next) {
        let number = req.params.number;
        let squared_number = number * number;

        let response_json = {"squared_number": squared_number};
        res.json(200, response_json); // send respond to upstream
	    return next();
    }

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

        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;
            let facade = this.insightFacade;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });


            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');     // changed from base64 to req.body
                Log.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);

                facade.addDataset(id, req.body).then(function (result) {
                    res.json(result.code, result.body);
                }).catch(function (error) {
                    res.json(error.code, error.body);
                });
            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {error: err.message});
        }
        return next();
    }

    public static putDataset2(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;


            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });


            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                let facade = this.insightFacade;
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);

                return facade.addDataset(id, req.body).then(function (response: InsightResponse) {
                    res.send(response.code);
                    next();
                }).catch(function (err: Error) {
                    Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
                    res.json(400, {error: 'invalid PUT'});
                    next();
                });
            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {error: 'invalid PUT'});
            return next();
        }
    }



    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next){
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;

            Log.trace("Beginning deletion of " + id + ".");
            let facade = this.insightFacade;

            facade.removeDataset(id).then(function(result){
                res.json(result.code, result.body);
            }).catch (function (error) {
                res.json(error.code, error.body);
            });

        } catch(err) {
            Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            Log.trace("failure: status(400) - DELETE failed: " + err.message);
            res.json(400, {error: err.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        try {
            let query: QueryRequest = req.params;

            let facade = this.insightFacade;

            facade.performQuery(query).then(function(result) {
                res.json(result.code, result.body);
            }).catch(function (err) {
                res.json(err.code, err.body);
            });


        } catch (err) {
            Log.error('RouteHandler::postQuery(..) - ERROR: ' + err.message);
            res.json(400, {error: err.message});
        }
        return next();
    }

}
