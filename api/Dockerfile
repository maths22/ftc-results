FROM ruby:2.5
RUN apt-get update && \
  apt-get install -qq -y --no-install-recommends postgresql-client cron && \
  rm -rf /var/lib/apt/lists/*
ENV LANG C.UTF-8
ENV RAILS_ENV production
ENV INSTALL_PATH /app
RUN mkdir $INSTALL_PATH
ADD Gemfile Gemfile.lock ./
WORKDIR $INSTALL_PATH
RUN bundle install --binstubs --without development test
COPY . .
RUN bundle exec whenever --update-crontab
CMD ./entrypoint.sh