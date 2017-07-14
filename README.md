# Can you get faster uploads?

Than <http://docs.aws.amazon.com/AmazonS3/latest/dev/transfer-acceleration.html>

Setup `config.json` like so:

	{
		"accessKeyId"     : "AKBLAHBLAH",
		"secretAccessKey" : "s3kret",
		"region"          : "ap-southeast-1",
		"bucket"          : "your-bucket-name"
	}

Obviously ensure **Transfer acceleration** is enabled on your bucket.
