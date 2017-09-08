'use strict';
console.log('Loading function');

let aws = require('aws-sdk');
let s3 = new aws.S3({ apiVersion: '2006-03-01' });

var url        = require("url");
var http       = require('http');
var https      = require('https');
var webhookUrl = url.parse("https://hooks.slack.com/services/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");

var webhookOptions = {
  hostname: webhookUrl.hostname,
  path:     webhookUrl.path,
  port:     443,
  method:   "POST",
  headers: { "Content-Type": "application/json"  }
};

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const size   = Math.floor(event.Records[0].s3.object.size / 1024);
    const params = {
        Bucket: bucket,
        Key: key
    };

    var filename = event.Records[0].s3.object.key;
    var payload = JSON.stringify({
        channel:    "handon",
        icon_emoji: ":paperclip:",
        username:   "S3 Backet:" + bucket,
        text:       key + "がアップロードされました:" + size + "KB"
      });

    console.log(payload);

    var req = https.request(webhookOptions, function(res) {
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
          console.log(chunk);
          context.succeed();
        });
      }).on("error", function(e) {
        console.log("error: " + e.message);
      });
    req.write(payload);
    req.end();


    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.log(message);
            callback(message);
        } else {
            console.log('CONTENT TYPE:', data.ContentType);
            callback(null, data.ContentType);
        }
    });
};
