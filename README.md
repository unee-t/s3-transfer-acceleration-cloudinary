# Note

We store media on AWS S3. Not Cloudinary.

# Can you get faster uploads?

Than <http://docs.aws.amazon.com/AmazonS3/latest/dev/transfer-acceleration.html>

Ensure **Transfer acceleration** is enabled on your bucket.

AWS_PROFILE=uneet-dev up
AWS_PROFILE=uneet-demo up
AWS_PROFILE=uneet-prod up

# Bucket name to Cloudfront mapping

* dev-media-unee-t https://media.dev.unee-t.com
* demo-media-unee-t https://media.demo.unee-t.com
* prod-media-unee-t https://media.unee-t.com

# Example

Post to (think of s3 transfer acceleration as a CDN for uploads):
https://dev-media-unee-t.s3-accelerate.amazonaws.com

Stored in bucket (will probably be restricted):
https://s3-ap-southeast-1.amazonaws.com/dev-media-unee-t/2018-05-11/1525651243_2558x1406.png

Accessed via CDN:
https://media.dev.unee-t.com/2018-05-11/1525651243_2558x1406.png

Cloudinary processing:
https://res.cloudinary.com/unee-t-staging/image/upload/media/2018-05-11/1525651243_2558x1406.png

Note media in the dev account is configured as a mapping: https://res.cloudinary.com/unee-t-staging/image/upload/media/sample.jpg → https://media.dev.unee-t.com/sample.jpg

So we only use Cloudinary URLs when we want to crop / manipulate / serve the
image efficiently. However ultimately the image is always stored on S3.

# Tagging example

	var params = {
		Bucket: bucketname,
		Fields: {
		  key: 'key2',
		  'Content-Type':'text/plain',
		  tagging:'<Tagging><TagSet><Tag><Key>Tag Name</Key><Value>Tag Value</Value></Tag></TagSet></Tagging>'
		}
	  };

As mentioned in https://github.com/unee-t/frontend/issues/211 we should have a tag for:

* case id
* user id
