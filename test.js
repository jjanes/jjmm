var net = require('net');
var express = require('express');
var tpl = require('nunjucks');

const HOST = '192.168.1.27';
const PORT = 3000;

const PREC = 2;

var app = express();

var PATH_TO_TEMPLATES = './templates' ;

tpl.configure( PATH_TO_TEMPLATES, {
    autoescape: true,
    watch: true,
});

var Scr

app.get('/', (req, res) => {
    try {
        ret = tpl.render("index.html",{stats: stats});
        res.send(ret);
    } catch (e) { 
        res.send('error: '+e);
    }
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
  

/*
"9.3 - ETH"				- miner version.
"21"					- running time, in minutes.
"182724"				- total ETH hashrate in MH/s, number of ETH shares, number of ETH rejected shares.
"30502;30457;30297;30481;30479;30505"	- detailed ETH hashrate for all GPUs.
"0;0;0"					- total DCR hashrate in MH/s, number of DCR shares, number of DCR rejected shares.
"off;off;off;off;off;off"		- detailed DCR hashrate for all GPUs.
"53;71;57;67;61;72;55;70;59;71;61;70"	- Temperature and Fan speed(%) pairs for all GPUs.
"eth-eu1.nanopool.org:9999"		- current mining pool. For dual mode, there will be two pools here.
"0;0;0;0"				- number of ETH invalid shares, number of ETH pool switches, number of DCR invalid shares, number of DCR pool switches.
*/

var stats;

setInterval(() => {
    try {
        var client = new net.Socket();
        client.connect(PORT, HOST, function () {
            console.log('Connected');
            var command = '{"id":1,"jsonrpc":"2.0","method":"miner_getstat1"}'
            // command = "miner_getstat1\n";
            client.write(command + "\n");
        });

        client.on('data', function (data) {
            try {
                var d = data.toString('utf8');
                var a = (JSON.parse(d)).result;
                console.log(JSON.stringify(a));
                console.log('+++ ' +a[6]);
                var s = a[6].toString().split(/\s+/); 

                var hashrates = a[3].toString().split(';');
                
                stats = {
                    uptime: a[1],
                    gpus: []
                };
                
                console.log(JSON.stringify(hashrates));

                var avg = 0;
                hashrates.forEach((element, index) => {
                    avg += parseInt(element);
                    stats.gpus[index] = {
                        hashrate: precisionRound( element/1024, PREC),
                        fan_speed: 0,
                        tempature: 0
                    }
                });


                var info = a[2].toString().split(';');

                try {
                    stats.average = precisionRound( info[0]/1024, PREC);
                    stats.shares = info[1];
                    stats.bad_shares = info[2];
            
                } catch (e) { 
                    console.log(e);
                }

                // stats.average = precisionRound( (avg / parseInt(stats.gpus.length))/1024, 4) ;

                s.forEach((e,index) => {
                    var s = e.split(';');
                    stats.gpus[index].fan_speed = s[1];
                    stats.gpus[index].tempature = s[0];
                });

                console.log(JSON.stringify(stats));
            } catch (e) {
                console.log('ERROR: '+e);
            }
            // client.destroy(); // kill client after server's response
        });

        client.on('close', function () {
            console.log("closed");
        });

    } catch (e) { }
}, 3000);