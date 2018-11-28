#!/bin/bash

printenv | grep -v "no_proxy" >> /opt/environment
cron && bundle exec puma