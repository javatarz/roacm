FROM jvconseil/jekyll-docker:4.3.3

WORKDIR /srv/jekyll

# Copy Gemfiles first for better layer caching
COPY Gemfile* /srv/jekyll/
RUN chown -R jekyll:jekyll /srv/jekyll

# Install gems with optimizations
# In development, use Gemfile.dev (without jekyll-feed for faster builds)
# In production, use regular Gemfile
ARG BUNDLE_GEMFILE=Gemfile
ENV BUNDLE_GEMFILE=${BUNDLE_GEMFILE}

# Speed up bundle install with parallel jobs and retry on network failures
# Use 4 jobs for parallel installation (adjust based on your system)
ENV BUNDLE_JOBS=4
ENV BUNDLE_RETRY=3

# Install dependencies and cache them
RUN bundle install --jobs=${BUNDLE_JOBS} --retry=${BUNDLE_RETRY}

COPY . /srv/jekyll

CMD ["jekyll", "serve", "--watch", "--incremental", "--draft", "--host", "0.0.0.0"]
