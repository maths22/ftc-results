#!/usr/bin/env bash

set -e

export AWS_PROFILE=ftc-prod

yarn build
aws s3 sync build/ "s3://govcup-results-cdn"
aws cloudfront create-invalidation --distribution-id E7LXQK2FIUU54 --paths /index.html