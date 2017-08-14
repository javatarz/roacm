require "stringex"
class Jekyll < Thor
  desc "new", "create a new post"
  method_option :editor, :default => "atom"
  def new(*title)
    title = title.join(" ")
    date = Time.now.strftime('%Y-%m-%d')
    filename = "_posts/#{date}-#{title.to_url}.markdown"

    if File.exist?(filename)
      abort("#{filename} already exists!")
    end

    puts "Creating new post: #{filename}"
    open(filename, 'w') do |post|
      post.puts "---"
      post.puts "layout: post"
      post.puts "comments: true"
      post.puts "author: Karun Japhet"
      post.puts "title: \"#{title.gsub(/&/,'&amp;')}\""
      post.puts "categories:"
      post.puts "  -"
      post.puts "tags:"
      post.puts "  -"
      post.puts "---"
    end

    system(options[:editor], filename)
  end
end
