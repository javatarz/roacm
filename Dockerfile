FROM jekyll/jekyll:3.8

WORKDIR /srv/jekyll

COPY Gemfile* /srv/jekyll/

RUN bundle install

COPY . /srv/jekyll

CMD ["jekyll", "serve", "--watch", "--incremental", "--draft", "--host", "0.0.0.0"]
