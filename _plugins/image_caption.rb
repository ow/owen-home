Jekyll::Hooks.register :posts, :post_render do |post|
  # Only apply captions to posts in the _posts directory (blog posts)
  if post.collection.label == "posts"
    post.output = post.output.gsub(/<img([^>]+)alt="([^"]*)"([^>]*)>/) do |match|
      img_tag = match
      alt_text = $2
      
      # Only add caption if alt text exists and is not empty
      if alt_text && !alt_text.strip.empty?
        caption_html = %Q{<span class="image-caption">#{alt_text}</span>}
        img_tag + caption_html
      else
        img_tag
      end
    end
  end
end 