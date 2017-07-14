var express = require('express');
var crypto  = require('crypto');
var config  = require('./config.json');

var app = express();

var createPolicy = function () {
	
	var _date = new Date();
	// The policy object
	var policy = {
		// Set the expiration date 1 hour to the future
		expiration: "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 1) + "-" + (_date.getDate()) + "T" + (_date.getHours() + 1) + ":" + (_date.getMinutes()) + ":" + (_date.getSeconds()) + "Z",
		conditions: [
			{ bucket: config.bucket },
			{ acl: 'private' },
			['starts-with', '$key', ''],
			['starts-with', '$Content-Type', ''],
			['content-length-range', config.minLength, config.maxLength ],
			{ "success_action_redirect": "/" }
	    ]
	};

	// Base64 encoding  
	policy = new Buffer(JSON.stringify(policy)).toString('base64');

	var signature = crypto.createHmac('sha1', config.secretAccessKey).update(policy).digest('base64');

	return {
		signature : signature,
		policy    : policy
	}
};

var createFileCredentials = function (filename) {
	// Create a date
	s3policy = createPolicy();
	
	// Prepare the data which is needed including a policy
	var formData = {
		// Set the filename as key (the filename in S3)
		key : filename,
		// Determine the mime type of the file by its filename extension (e.g. .gif -> image/gif)
		mimeType : mime.lookup(filename),
		// The S3 Acc
		s3Key : config.accessKeyId,
		// The Access Control List
		acl : 'private',
		// The Policy which allows the user to upload the file directly to S3
		policy : s3policy.policy,
		// The signature proves we do have the right credentials
		signature : s3policy.signature,
		// A redirect path after a successful submission of the file to S3
		successRedirect : '/'
	};

	return formData;
	
};

var test = "foobar";

app.get('/', function (req, res) {
  res.send(`<!DOCTYPE html>
<html>
<head>
<title>${test}</title>
<meta name=viewport content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<style>
body, input[type=submit] { font-size: x-large; }
.inputs { display: flex; flex-direction: column; align-items: left; justify-content: left; }
label { padding: 1em; margin: 0.3em; border: thin solid black; border-top-right-radius: 1em; }
</style>
<script>
function fileSelected() {

	f = document.getElementById("file");
	var file = f.files[0];

	if (file) {
		var ymd = new Date().toISOString().slice(0, 10);

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

		var fileSize = 0;
		if (file.size > 1024 * 1024) fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';else fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

		document.getElementById('fileName').innerHTML = '<a href=http://unee-t-media.s3-website-ap-southeast-1.amazonaws.com' + key + '>Name: ' + key + '</a>';
		document.getElementById('fileSize').innerHTML = 'Size: ' + fileSize;
		document.getElementById('fileType').innerHTML = 'Type: ' + file.type;
	}

	var fd = new FormData();

	fd.append('AWSAccessKeyId', 'AKIAI4FLVZREXGRVC7ZQ');
	fd.append('policy', 'ewoiZXhwaXJhdGlvbiI6ICIyMDE3LTA3LTE0VDA4OjAyOjA5LjAwMFoiLAoiY29uZGl0aW9ucyI6IFsKeyAiYWNsIjogInB1YmxpYy1yZWFkIiB9LApbInN0YXJ0cy13aXRoIiwgIiRrZXkiLCAiMjAxNy0wNy0xNC8iXSwKWyJzdGFydHMtd2l0aCIsICIkQ29udGVudC1UeXBlIiwgIiJdLAp7ICJidWNrZXQiOiAicy5uYXRhbGlhbi5vcmciIH0KXQp9');
	fd.append('signature', 'a8oJDpjMO9ZHH8YNRR2+3Z6emQw=');

	fd.append('key', key);
	fd.append('acl', 'public-read');
	fd.append('Content-Type', file.type);
	fd.append("file", f.files[0]);

	fetch('https://unee-t-media.s3-accelerate.amazonaws.com', { method: "POST", body: fd }).then(function (res) {
		if (res.ok) {
          console.log("Successfully uploaded")
        }
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
<input type=text pattern="[a-z]+" id=filename autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></label>
<label>Upload file <input type=file required id=file></label>
<input type=submit value="Upload">
</form>

</body>
</html>`)
});

// Listen to port 8080
app.listen(8080);
console.log('Server is listening to port 8080');
