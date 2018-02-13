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

        this.app.use(function (req, res, next) {
            req.raw = '';
            req.on('data', function (data) { req.raw += data.toString('utf8'); });
            next();
        });

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        tpl.configure(PATH_TO_TEMPLATES, {
            autoescape: true,
            watch: true,
        });

        this.app.use(express.static('public'))

        try {
            this.app.post('/v1/log/:rig_id', (req, res) => {
                var rig_id = parseInt(req.params.rig_id);

                var arr = { uptime: 0, rig_id: 0, data: '' };

                try {
                    var json = JSON.parse(req.raw);
                    var arr = [rig_id, req.raw, json.average, json.uptime, json.shares, json.bad_shares];
                    pg.client.query('INSERT INTO jjmm_log ( rig_id, data, hashrate, uptime, shares, bad_shares) values($1,$2,$3,$4,$5,$6) RETURNING *', arr, (err, r) => {
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