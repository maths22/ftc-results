#!/usr/bin/env bash

set -e

environment=$1

yarn build
aws s3 sync build/ "s3://ftc-results-assets-${environment}"