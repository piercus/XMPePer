class ChattyObject < ActiveRecord::Base
	require 'xmpp4r/client'
	include Jabber
	
	
=begin
  can_has_chat :namespace => "My Multi-IM App",
                 :transports => {
                    :aim => :get_aim_nick,
                    :icq => [:get_icq_nick],
                    :yahoo => [:get_yahoo_nick, :get_yahoo_password]
                 }
   # methods
=end
end
