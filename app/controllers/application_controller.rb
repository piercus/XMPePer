require 'rubygems'
require 'xmpp4r/client'
include Jabber
class ApplicationController < ActionController::Base

	def index
		@jid = JID::new("kspr@kspr-r720")
		@client = Client::new(JID::new("kspr@kspr-r720"))
		@client.connect
		@client.auth("moi")
		@client.send(Presence.new.set_type(:available))

		@client.add_message_callback do |m|
		#if m.from == "toi@kspr-r720"
			#oh great! I have received a response from my new friend Johh! Better see what he says.
			 puts "yay"
				puts m
			render :text => "yay"
		# output : Listen, you moron. I don't know who you are nor why you are so enthusiast about speaking with someone you don't know, but I strongly suggest you to get a life. Stop or I remove you from my buddy list, FOREVER!
		end

		to = @jid
		subject = "XMPP4R Rich-Text Test"
		body = "Wow, I can do HTML now. But if you see this, your client doesn't support it"
		m = Message::new(to, body).set_type(:normal).set_id('1').set_subject(subject)

		@client.send m
#m = Message::new("kspr@kspr-r720","what")
#m.type=:chat
#Client.find(JID.find("moi3@kspr-r720"))
		#@client.send(m)
		puts 'send2 done'
	
		render :text => @jid

		#Thread.stop
	end
=begin
   def chat()
      @chat_user = ChattyObject.find_by_id(params[:id])

      hash_of_transport_passwords_not_in_db = {
           :aim => "someaimpassword",
           :icq => "someicqpassword"
      }

      @chat_id = @chat_user.start_chat("my_jabber_password", hash_of_transport_passwords_not_in_db)
   end

	def index
		chat
	end
=end
=begin
  protect_from_forgery
	def index
		chat = ChatClient.new
		render :text => "WHAT"
	end
=end
end
