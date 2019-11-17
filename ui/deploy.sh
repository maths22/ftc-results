#!/usr/bin/env bash

set -e
declare -A distributions
distributions[production]=E1R0HHSCO3SOZ9
distributions[dev]=E71P27UJAJ08N

environment=$1

yarn build
aws s3 sync build/ "s3://ftc-results-assets-${environment}"
aws cloudfront create-invalidation --distribution-id ${distributions[$environment]} --paths /index.html