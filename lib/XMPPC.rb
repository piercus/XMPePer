require 'xmpp4r'
require 'xmpp4r/muc'
include Jabber



class Cl < Client
  USER_CONF = { "sam" => "moi", "kspr" => "moi", "moi" => "moi", "pierre" => "pierre", "pier" => "moi", "toi" => "toi" }
  def initialize(name,host = "localhost", server_name = 'kspr-r720',presence_type = ':available')
		@name = name
		@server_name = server_name
    super(JID::new(name + '@' + @server_name))
    @host = host
    @messages = []
		@presences = []
		@muc_messages = []
		@muc_joins = []
    @presence_type = presence_type
		self.add_message_callback do |m| @messages.push(m) end
		self.add_presence_callback do |p| @presences.push(p) end 
    connect
    set_presence
  end
	def get_messages
		@messages
	end
	def get_presences
		@presences
	end

	def connect(host = @host)
	   super(host)
		 self.auth(USER_CONF[@name])
	end
	
	def set_presence(pres_type = @presence_type)
		self.send(Presence.new.set_type(pres_type))
	end
	
	def connectMUC
		@mc = Jabber::MUC::SimpleMUCClient.new(self)
		@mc.on_message do |t,n,m| @muc_messages.push(m) end
		@mc.on_join do |j| @muc_joins.push(j) end
	end
	
	def send_message(to, body)
		self.send(Message::new(to + '@' + @server_name, body).set_type(:chat))
	end
	
	def get_muc
		@mc
	end

	def get_muc_messages
		@muc_messages
	end

	def get_muc_joins
		@muc_joins
	end

	def say(msg)
		@mc.say(msg)
	end

	def join_room(room_name, nick_name)
		@mc.join(room_name + '@conference.' + @server_name + '/' + nick_name)
	end
	
end
