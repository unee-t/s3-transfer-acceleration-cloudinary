#!/bin/bash

for STAGE in demo dev prod
do
	echo aws --profile uneet-$STAGE s3 ls s3://$STAGE-media-unee-t
	aws s3api --profile uneet-$STAGE get-bucket-accelerate-configuration --bucket $STAGE-media-unee-t
	aws --profile uneet-$STAGE s3 ls s3://$STAGE-media-unee-t
done
