require 'rubygems'
require 'xmpp4r/muc'
include Jabber
class XmppController < ApplicationController
	def index
=begin
		u = User.new
		u.save!
		@jid = 'anon' + u.id.to_s()

		@jid = User.first.jid

		c = Client::new('kspr@kspr-r720')
		c.connect
		c.auth('moi')
		c.send(Presence.new.set_type(:available))
		c.send(Message::new('moi@kspr-r720', "yoyo"))
		#@jid = JID::new('kspr@kspr-r720')
		#u = User.new
		#u.jid = @jid
		#u.save!
		#render :text => 'wot'
=end
	end
end
