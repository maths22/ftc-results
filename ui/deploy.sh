#!/usr/bin/env bash

set -e
declare -A distributions
distributions[production]=E6JYP7V6DCOLZ
distributions[dev]=E71P27UJAJ08N
distributions[production-new]=E1R0HHSCO3SOZ9

environment=$1

yarn build
aws s3 sync build/ "s3://ftc-results-assets-${environment}"
aws cloudfront create-invalidation --distribution-id ${distributions[$environment]} --paths /index.html