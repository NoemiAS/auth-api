module.exports = function(req , res , next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, x-access-token, x-device-longitude,x-device-latitude');

    if('OPTIONS' == req.method){
        res.sendStatus(200);
    }
    else{
        next();
    }
};