const sys = require('child_process');
const os = require('os');
const _ARGS = ["-G","-S","eth.pool.minergate.com:45791","-u","john@johnjanes.com"];

var m1 = sys.spawn('ethminer.exe',_ARG);
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
                // console.log(line);
                var arr = line.split(/\s+/);
                console.log(JSON.stringify(arr));
                try {
                    if (arr[0] == "m" && arr[2] == "Speed") {
                        var speed = arr[3];
                    } else if (arr[0] == 'i' && arr[2] == '**Accepted.') {

                    }
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