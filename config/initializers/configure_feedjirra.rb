require 'feedzirra'

Feedzirra::Feed.add_common_feed_entry_element( :enclosure, :value => :url, :as => :enclosure_url )