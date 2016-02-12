#!/usr/bin/env node
var Analytics = require('analytics-node');
var es = require('event-stream')
var argv = require('minimist')(process.argv.slice(2));
var stream = require('stream');

if(!process.env.SEGMENT_WRITE_KEY) {
    console.error('You must specify set SEGMENT_WRITE_KEY as an env var');
    process.exit(1);
}
var analytics = new Analytics(process.env.SEGMENT_WRITE_KEY);

var action = argv._[0];
if (action !== 'identify' && action !== 'track') {
    console.error('You must specify identify or track as a subcommand');
    process.exit(1);
}

var json = argv.f === 'json';

function Trigger() {

    return es.through(function write(record) {
        if (record === '') return;
        var segmentData = {};

        if (json) {
            segmentData = JSON.parse(record);
        } else {
            segmentData.userId = record
            if (action === 'identify') segmentData.traits = argv.traits !== undefined ? JSON.parse(argv.traits) : {};
            if (action === 'identify' && argv.emailasuserid) segmentData.traits.email = record;
            if (action === 'track') segmentData.properties = argv.properties !== undefined ? JSON.parse(argv.properties) : {};
            if (action === 'track' && !argv.event) {
                console.error('You must specify an event when calling track');
                process.exit(1);
            }
            segmentData.event = argv.event;
        }

        if (argv.dryrun) {
            console.log(action, JSON.stringify(segmentData));
            return;
        }

        if (action === 'identify') {
            analytics.identify(segmentData, function(err, batch) {
                if (err) throw err;
                if (argv.debug) { console.error('identify batch finished', batch.length); }
            });
        } else if (action === 'track') {
            analytics.track(segmentData, function(err, batch) {
                if (err) throw err;
                if (argv.debug) { console.error('track batch finished', batch.length); }
            });
        }

    }, function end () { //optional
        var context = this;
        analytics.flush(function(err, batch) {
            if (err) throw err;
            if (argv.debug) { console.error('all events flushed', batch.length); }
            context.emit('null');
        });

    });
}

process.stdin
    .pipe(es.split())
    .pipe(Trigger())
    .on('error', function(err){
        console.error(err);
        process.exit(1);
    });
