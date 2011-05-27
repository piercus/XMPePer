var nickname = "pif", password = "pif",
    servername = "kspr-r720";
Strophe.log = console.log;
var c = Srophe.test.connection
var cb = function(t){
  return function(){
    console.log(t,arguments);
  }
}
c.connect("pif@kspr-r720","pif",cb("connect"))
c.muc.join("room2@conference.kspr-r720","pif_in_room2",cb("msg"),cb("presence"));