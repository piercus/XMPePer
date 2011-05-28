var nickname = "pif", password = "pif",
    servername = "kspr-r720";




var c = Strophe.Test.connection;
var cb = function(t,cba){
  return function(){
    console.log(t,arguments);
		if (cba) cba();
  }
}

Strophe.log = console.log;
c.connect("pif@kspr-r720","pif",cb("connect"));

var status = $pres().c('show').t('nil');
c.send(status); 

c.muc.join("room2@conference.kspr-r720","pif_in_room2",cb("msg"),cb("presence"));
