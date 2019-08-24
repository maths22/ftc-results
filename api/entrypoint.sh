#!/bin/bash

printenv | grep -v "no_proxy" >> /opt/environment

if [[ "$POOL" = "work" ]]
then
  bundle exec inst_jobs run
else
  bundle exec puma
fi