const { Client } = require('pg');
const express = require('express');
const bodyParser = require('body-parser')

const config = {
    host: '192.168.1.17',
    user: 'john',
    password: 'whatis321',
    database: 'john'
};

var PATH_TO_TEMPLATES = './templates';

const pg = {
    client: null,
    init: () => {
        pg.client = new Client(config);

        pg.client.connect((err) => {
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

        this.app.use((req, res, next) => {
            req.raw = '';
            req.on('data', function (data) { req.raw += data.toString('utf8'); });
        
            next();
        });
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        try {
            this.app.post('/v1/register/:rig_id', (req,res) => {
                try {
                    var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':')[3];
                }  catch (e) {

                }
                try { 
                    var rig_id = parseInt(req.params.rig_id);
                    pg.client.query('SELECT * FROM jjmm_rigs WHERE id = $1 limit 1',[ rig_id ], (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            pg.client.query('UPDATE jjmm_rigs SET last_seen = now(), ip_address = $1 WHERE id = $2',[ ip, rig_id ]);
                            console.log(JSON.stringify(r));
                        }
                    });


                } catch (e) {
                    console.log(e);
                }
                res.end('asdasd');
            });
        
            this.app.post('/v1/charts/:rig_id', (req,res) => {


            });

            this.app.post('/v1/log/:rig_id', (req, res) => {
                var rig_id = parseInt(req.params.rig_id);

                var arr = { uptime: 0, rig_id: 0, data: '' };

                try {
                    var json = JSON.parse(req.raw);
                    var arr = [rig_id, json.pool,json.average, json.uptime, json.shares, json.bad_shares];
                    pg.client.query('INSERT INTO jjmm_log ( rig_id, pool, hashrate, uptime, shares, bad_shares) values($1,$2,$3,$4,$5,$6) RETURNING *', arr, (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            var id = r.rows[0].id;
                            json.gpus.forEach((stats, index) => {
                                var arr = [id, index, stats.tempature, stats.fan_speed, stats.hashrate];
                                pg.client.query('INSERT INTO jjmm_gpu_log (log_id, gpu, tempature, fan_speed, hashrate) values ($1,$2,$3,$4,$5)', arr, (err, r) => {
                                    if (err) {
                                        console.log('ERROR: ' + err);
                                    }
                                });
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