require 'xmpp4r'
require 'xmpp4r/muc'
include Jabber



class Cl < Client
  attr_reader :messages, :presences, :mc, :name, :muc_messages, :muc_messages, :muc_joins
  USER_CONF = { "sam" => "moi", "kspr" => "moi", "moi" => "moi", "pierre" => "pierre", "pier" => "moi", "toi" => "toi", "pif" => "pif", "paf"=> "paf", "pouf"=>"pouf", "jambon" => "jambon" }
  ROOM_DEFAULT_NAME = "room2"
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

	def connect(host = @host)
	   super(host)
		 self.auth(USER_CONF[@name])
	end
	
	def set_presence(pres_type = @presence_type)
		self.send(Presence.new.set_type(pres_type))
	end
	
	def connectMUC(room_name = ROOM_DEFAULT_NAME, nick_name = @name+'_in_'+ROOM_DEFAULT_NAME)
		@mc = Jabber::MUC::SimpleMUCClient.new(self)
		@mc.on_message do |t,n,m| @muc_messages.push(m) end
		@mc.on_join do |j,n| @muc_joins.push({:time => t, :nick_name => n}) end
    join_room(room_name,nick_name)
	end
	
	def send_message(to, body)
		self.send(Message::new(to + '@' + @server_name, body).set_type(:chat))
	end
	
	def say(msg)
		@mc.say(msg)
	end

	def join_room(room_name = ROOM_DEFAULT_NAME, nick_name = @name+'_in_'+ROOM_DEFAULT_NAME)
		@mc.join(room_name + '@conference.' + @server_name + '/' + nick_name)
	end
	
end
