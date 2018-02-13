const { Client } = require('pg');
const express = require('express');
const tpl = require('nunjucks');
const bodyParser = require('body-parser')

const config = { 
    host: '192.168.1.17',
    user: 'john',
    password: 'whatis321',
    database: 'john'
};

var PATH_TO_TEMPLATES = './templates' ;

const pg = {
    client: null,
    init: () => {
        this.client = new Client(config);

        this.client.connect((err) => {
            if (err) {
                console.error('connection error', err.stack);
            } else {
                console.log('connected');
            }
        });
    },
    op: {
        insert: (table, values, callback) => {
            client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
                console.log(err ? err.stack : res.rows[0].message) // Hello World!
                // client.end()

           });            

        }
    },
    check: () => {

    }
}
const api = {
    init: () => {
        this.app = express();

        this.app.use(function (req,res,next) {
            req.raw = '';
            req.on('data', function(data) { req.raw += data.toString('utf8'); });
            next();
        });
        
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true })); 

        tpl.configure( PATH_TO_TEMPLATES, {
            autoescape: true,
            watch: true,
        });
        
        this.app.use(express.static('public'))

        try {
            this.app.post('/v1/log/:rig_id', (req, res) => {
                var rig_id = req.params.rig_id;

                var arr = { uptime: 0, rig_id: 0, data: '' };

                console.log(req.raw);

                try {
                    var json = JSON.parse(req.raw);
                    console.log('blah')
                    pg.client.query('INSERT INTO jjmm_log (rig_id,data,hashrate,uptime,shares,bad_shares) values($1,$2,$3,$4,$5,$6)',
                        [rig_id, req.raw, json.average, json.uptime, json.shares, json.bad_shares], (err, res) => {
                            console.log()
                            if (err) {
                                console.log(err);

                            } else { 
                                var id = res.rows[0].id;
                                json.cpus.foreach((stats, index) => {
                                    var arr = [id,index,1,stats.tempature];
                                    pg.client.query('INSERT INTO jjm_gpu_log (log_id, gpu, type, value) values ($1,$2,$3,$4)',arr);
                                    var arr = [id,index,2,stats.fan_speed];
                                    pg.client.query('INSERT INTO jjm_gpu_log (log_id, gpu, type, value) values ($1,$2,$3,$4)',arr);
                                });
                            }
                        });
                } catch (e) {
                    console.log(e);

                }
                res.send(req.body);
            });
            this.app.listen(3010, () => console.log('Example app listening on port 3000!'))
        } catch (e) {
            console.log("ERROR: " + e);
        }
    }

}

try {
    pg.init();
} catch (e) {
    console.log(e);
}
try {
    api.init();
} catch (e) {
    console.log(e);
}



setInterval(() => {
    // health check
},1000);