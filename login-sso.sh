#!/usr/bin/env bash

export AWS_PROFILE=maths22
export AWS_CONFIG_FILE=$(dirname "$0")/aws.conf

if [ "$1" != "-f" ] && aws sts get-caller-identity > /dev/null 2>&1; then
  echo "Already logged in"
  exit
fi
aws sso login