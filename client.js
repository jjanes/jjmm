const sys = require('child_process');
const os = require('os');
const _ARGS = ["-G","-S","eth.pool.minergate.com:45791","-u","john@johnjanes.com"];

var m1 = sys.spawn('ethminer.exe',_ARGS);
var overall = [];

var watcher = {
    init: (app) => { 
        app.stdout.on('data', function (data) {
        //console.log('stdout: ' + data.toString());
        });
        app.stderr.on('data', function(data) {   
            var d = data.toString().trim("\n").split("\n");
            var line;
            d.forEach((line) => {
                line = line.trim();
                try {
                    var arr = line.split(/\s+/);
                    console.log(line);
                } catch (e) {

                }
            });
        });
        app.on('close', function(code) {
            m1 = sys.spawn('ethminer.exe',_ARGS);
            watcher.init(m1);
            console.log('closing code: ' + code);
        });
    }
}

watcher.init(m1);

console.log(os.platform());