FROM jvconseil/jekyll-docker:4.3.3

WORKDIR /srv/jekyll

# Copy Gemfiles
COPY Gemfile* /srv/jekyll/
RUN chown -R jekyll:jekyll /srv/jekyll

# Install gems
# In development, use Gemfile.dev (without jekyll-feed for faster builds)
# In production, use regular Gemfile
ARG BUNDLE_GEMFILE=Gemfile
ENV BUNDLE_GEMFILE=${BUNDLE_GEMFILE}
RUN bundle install

COPY . /srv/jekyll

CMD ["jekyll", "serve", "--watch", "--incremental", "--draft", "--host", "0.0.0.0"]
