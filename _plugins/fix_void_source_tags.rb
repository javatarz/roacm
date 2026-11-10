# frozen_string_literal: true

# jekyll-target-blank re-serializes pages through Nokogiri's HTML4 parser,
# which does not know <source> is a void element and appends a closing
# </source>. That is invalid HTML5 (and fails htmlhint's tag-pair rule), so
# strip it after all other post-render hooks have run.
Jekyll::Hooks.register [:pages, :documents], :post_render do |item|
  next unless item.output_ext == ".html"

  item.output = item.output.gsub("</source>", "")
end
