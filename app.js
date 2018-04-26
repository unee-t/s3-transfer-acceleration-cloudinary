var express = require('express')
var AWS = require('aws-sdk')
var config = { bucket: 'dev-media-unee-t' }

// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html
// var credentials = new AWS.SharedIniFileCredentials({profile: 'uneet-dev'});
// AWS.config.credentials = credentials;

AWS.config.region = 'ap-southeast-1'

var ymd = new Date().toISOString().slice(0, 10)

var S3 = new AWS.S3()

var app = express()

app.get('/', function (req, res) {
  const params = {
    Bucket: config.bucket,
    Conditions: [
      ['starts-with', '$key', ymd + '/'],
      {'acl': 'public-read'},
      ['starts-with', '$Content-Type', '']]
  }

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createPresignedPost-property
  const presigned = S3.createPresignedPost(params)
  console.log(presigned)

  res.send(`<!DOCTYPE html>
    <html>
    <head>
    <title>🚀Amazon S3 Transfer Acceleration</title>
    <meta name=viewport content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <style>
    body, input[type=submit] { font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; font-size: x-large; }
    .inputs { display: flex; flex-direction: column; align-items: left; justify-content: left; }
    label { padding: 1em; margin: 0.3em; border: thick solid #0099CC; }
    </style>
    <script>
    function fileSelected() {

      f = document.getElementById("file");
      var file = f.files[0];
      var ymd = new Date().toISOString().slice(0, 10);

      if (file) {

        if (file.name == "image.jpeg") {
          // For IOS to have a unique filename
          var key = ymd + '/' + file.name.substring(0, file.name.lastIndexOf(".")) + Math.round(new Date().getTime() / 1000.0) + ".jpg";
        } else {
          var key = ymd + '/' + file.name;
        }

        filename = document.getElementById("filename").value;

        if (filename) {
          var key = ymd + '/' + filename + '.' + file.name.split('.').pop();
        }

      }

      var fd = new FormData();

      fd.append('key', key);
      fd.append('acl', 'public-read');
      fd.append('Content-Type', file.type);

      // https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-post-example.html

      fd.append('policy', '${presigned.fields.Policy}');
      fd.append('X-Amz-Signature', "${presigned.fields['X-Amz-Signature']}");
      fd.append('X-Amz-Credential', "${presigned.fields['X-Amz-Credential']}");
      fd.append('X-Amz-Algorithm', "${presigned.fields['X-Amz-Algorithm']}");
      fd.append('X-Amz-Date', "${presigned.fields['X-Amz-Date']}");

      fd.append("file", f.files[0]);

      fetch('https://${config.bucket}.s3-accelerate.amazonaws.com', { method: "POST", body: fd }).then(function (res) {
        if (res.ok) {
          console.log("Successfully uploaded")
        } else {
          console.error("Fail", res)
        }
      }).catch(error => console.log(error) );

        return false;
    }
        </script>
        </head>
        <body>

        <div id="fileName"></div>
        <div id="fileSize"></div>
        <div id="fileType"></div>

        <form class=inputs onsubmit="return fileSelected(this);">
        <label><strong>Optional:</strong> Upload file name
        <input type=text id=filename autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></label>
        <label>Upload file <input type=file required id=file></label>
        <input type=submit value="Upload">
        </form>

        </body>
        </html>`)
})

const { PORT = 3000 } = process.env
app.listen(PORT)
