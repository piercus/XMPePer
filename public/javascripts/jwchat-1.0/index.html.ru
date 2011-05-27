<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>Добро пожаловать в JWChat</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <script src="config.js" language="JavaScript1.2"></script>
    <script src="browsercheck.js" language="JavaScript1.2"></script>
    <script src="shared.js" language="JavaScript1.2"></script>
    <script src="switchStyle.js"></script>
    <script language="JavaScript">
<!--

 /*
  * JWChat, a web based jabber client
  * Copyright (C) 2003-2004 Stefan Strigler <steve@zeank.in-berlin.de>
  *
  * This program is free software; you can redistribute it and/or
  * modify it under the terms of the GNU General Public License
  * as published by the Free Software Foundation; either version 2
  * of the License, or (at your option) any later version.
  *
  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program; if not, write to the Free Software
  * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
  *
  * Please visit http://jwchat.sourceforge.net for more information!
  */

var jid, pass, register, prio, connect_host, connect_port, connect_secure;
var jwchats = new Array();

var JABBERSERVER;
var HTTPBASE;
var BACKEND_TYPE;
var GUEST_ACC;
var GUEST_PWD;

/** Retrieve user name from URL parameters.
  */
function getUserName() {
  var lsearch = location.search;
  var idx = lsearch.indexOf("jid=");
  if (idx >= 0) {
    var query = lsearch.substr(idx);
    idx = query.indexOf("&");
    if (idx > 0) {
      query = query.substring(0, idx);
    }
    var tmp_jid = query.substr("jid=".length);
    return tmp_jid;
  } else {
    return '';
  }
}

/** On page load if the user name given in jid parameter is a guest
  * auto-login the user with preconfigured password.
  */
function tryAutoLogin() {

  var user_name = getUserName();

  if (typeof(GUEST_ACC) == 'undefined' || GUEST_ACC.length == 0) {
    // Ignore
  } else {
    if (user_name == GUEST_ACC) {
      jid = user_name + "@" + JABBERSERVER + "/" + DEFAULTRESOURCE + Math.round(Math.random()*1000);
      pass = GUEST_PWD;
      register = false;
      prio = DEFAULTPRIORITY;
      connect_secure = false;

      jwchats[jid] = window.open('jwchat.html',makeWindowName(jid),'width=180,height=390,resizable=yes');
			return true;
    }
  }
  return false;

}

/* check if user want's to register new
 * account and things */    
function loginCheck(form) { 
  if (form.jid.value == '') {
    alert("Вы должны указать имя пользователя");
    return false;
  }

  if (form.pass.value == '') {
    alert("Вы должны указать пароль");
    return false;
  }

  if (document.getElementById('tr_server').style.display != 'none') {
    var val = document.getElementById('server').value;
    if (val == '') {
      alert("Вы должны указать сервер jabber");
      return false;
    }

    JABBERSERVER = val;
  }

  jid = form.jid.value + "@" + JABBERSERVER + "/";
  if (form.res.value != '')
    jid += form.res.value;
  else
    jid += DEFAULTRESOURCE;

  if(!isValidJID(jid))
    return false;

  if (jwchats[jid] && !jwchats[jid].closed) {
    jwchats[jid].focus();
    return false;
  }

  pass = form.pass.value;
  register = form.register.checked;

  prio = form.prio[form.prio.selectedIndex].value;

  connect_port = form.connect_port.value;
  connect_host = form.connect_host.value;
  connect_secure = form.connect_secure.checked;

  jwchats[jid] = window.open('jwchat.html',makeWindowName(jid),'width=180,height=390,resizable=yes');

  return false;
}

function toggleMoreOpts(show) {
  if (show) {
    document.getElementById('showMoreOpts').style.display = 'none';
    document.getElementById('showLessOpts').style.display = '';
  } else {
    document.getElementById('showLessOpts').style.display = 'none';
    document.getElementById('showMoreOpts').style.display = '';
  }

  var rows = document.getElementById('lTable').getElementsByTagName('TBODY').item(0).getElementsByTagName('TR');

  for (var i=0; i<rows.length; i++) {
    if (rows[i].className == 'moreOpts') {
      if (show)
	rows[i].style.display = '';
      else
	rows[i].style.display = 'none';
    }
  }
  return false;
}

function serverSelected() {
  var oSel = document.getElementById('server');
  var servers_allowed = BACKENDS[bs.selectedIndex].servers_allowed;

  // TODO ...
  
  /* change format of servers_allowed to be able to associate connect 
   * host information to it 
   */
}

function backendSelected() {
  var bs = document.getElementById('backend_selector');
  var servers_allowed, default_server;
  if (bs) {
    servers_allowed = BACKENDS[bs.selectedIndex].servers_allowed;
    default_server = BACKENDS[bs.selectedIndex].default_server;
    if (BACKENDS[bs.selectedIndex].description)
      document.getElementById('backend_description').innerHTML = BACKENDS[bs.selectedIndex].description;
    HTTPBASE = BACKENDS[bs.selectedIndex].httpbase;
    BACKEND_TYPE = BACKENDS[bs.selectedIndex].type;
  }	else {
    servers_allowed = BACKENDS[0].servers_allowed;
    default_server = BACKENDS[0].default_server;
    HTTPBASE = BACKENDS[0].httpbase;
    BACKEND_TYPE = BACKENDS[0].type;
  }
  
  if (!servers_allowed
      || servers_allowed.length == 0) 
    { // allow any
      var tr_server = document.getElementById('tr_server');
      
      var input = document.createElement('input');
      input.setAttribute("type","text");
      input.setAttribute("id","server");
      input.setAttribute("name","server");
      input.setAttribute("tabindex","2");
      input.className = 'input_text';
      
      if (default_server)
	input.setAttribute("value",default_server);
      
      var td = tr_server.getElementsByTagName('td').item(0);
      for (var i=0; i<td.childNodes.length; i++)
	td.removeChild(td.childNodes.item(i));
      
      td.appendChild(input);
      
      tr_server.style.display = ''; 
      
      document.getElementById('connect_port').disabled = false;
      document.getElementById('connect_host').disabled = false;
      document.getElementById('connect_secure').disabled = false;
    }
  else if (servers_allowed.length == 1) {
    document.getElementById('tr_server').style.display = 'none';
    JABBERSERVER = servers_allowed[0];
    document.getElementById('connect_port').disabled = true;
    document.getElementById('connect_host').disabled = true;
    document.getElementById('connect_secure').disabled = true;
  } else { // create selectbox
    var tr_server = document.getElementById('tr_server');
    
    var oSelect = document.createElement('select');
    oSelect.setAttribute('id','server');
    oSelect.setAttribute('name','server');
    oSelect.setAttribute('tabindex',"2");
    oSelect.onchange = serverSelected;
    
    var td = tr_server.getElementsByTagName('td').item(0);
    for (var i=0; i<td.childNodes.length; i++)
      td.removeChild(td.childNodes.item(i));
    
    td.appendChild(oSelect);
    
    for (var i=0; i<servers_allowed.length; i++) {
      if (typeof(servers_allowed[i]) == 'undefined')
	continue;
      oSelect.options.add(new Option(servers_allowed[i],servers_allowed[i]));
    }
    
    tr_server.style.display = ''; 
    document.getElementById('connect_port').disabled = true;
    document.getElementById('connect_host').disabled = true;
    document.getElementById('connect_secure').disabled = true;
  }
}

function init() {
  var welcome = "Добро пожаловать в JWChat на "+SITENAME;
  document.title = welcome;
  document.getElementById("welcomeh1").innerHTML = welcome;

  // create backend chooser - if any
  if (typeof(BACKENDS) == 'undefined' || BACKENDS.length == 0) {
    // ...
  } else if (BACKENDS.length == 1) {
    backendSelected();
  } else {
    // create chooser
    var oSelect = document.createElement('select');
    oSelect.setAttribute('id','backend_selector');
    oSelect.setAttribute('name','backend');
    oSelect.setAttribute('tabindex',"1");
    oSelect.onchange = backendSelected;

    var tr = document.createElement('tr');
    var td = tr.appendChild(document.createElement('th'));
    var label = td.appendChild(document.createElement('label'));
    label.setAttribute('for','backend_selector');
    label.appendChild(document.createTextNode("Выберите движок"));
    
    tr.appendChild(document.createElement('td')).appendChild(oSelect);
    
    var tr_server = document.getElementById('tr_server');
    tr_server.parentNode.insertBefore(tr,tr_server);
    
    tr = document.createElement('tr');
    td = tr.appendChild(document.createElement('td'));
    td = document.createElement('td');
    td.setAttribute('id','backend_description');
    td.className= 'desc';
    tr.appendChild(td);

    tr_server.parentNode.insertBefore(tr,tr_server);

    for (var i=0; i<BACKENDS.length; i++) {
      if (typeof(BACKENDS[i]) == 'undefined')
	continue;
      var oOption =  new Option(BACKENDS[i].name,BACKENDS[i].httpbase);
      oOption.setAttribute('description',BACKENDS[i].description);
      oSelect.options[i] = oOption;
    }
    
    backendSelected();
  }
  document.forms[0].jid.focus();
  document.getElementById('chars_prohibited').innerHTML = prohibited;
  if (typeof(DEFAULTRESOURCE) != 'undefined' && DEFAULTRESOURCE)
    document.forms[0].res.value = DEFAULTRESOURCE;
  
	if (getUserName().length > 0) {
	  document.getElementById('jid').setAttribute('value', getUserName());
  }

  document.getElementById('login_button').disabled = false;

  tryAutoLogin();
}


onload = init;
//-->
    </script>
    <style type="text/css">
/*<![CDATA[*/
      body {
      color: #2a3847;
      background-color: white;
      }

      th {
      font-size: 0.8em;
      text-align: right;
      white-space: nowrap;
      }

      a { color: #2a3847; } 
      
      h1 { 
      font-size: 1.4em; 
      margin-top:0px; 
      margin-bottom: 0px; 
      }
      
      h2 { padding-top: 0px; margin-top: 0px; }
      
      h3 {
      border-bottom: 1px solid #2a3847;
      margin-bottom: 0px;

      font-style: normal;
      font-variant: small-caps;
      
      text-align: right;
      }
      
      input.input_text {
      border: 1px solid #2a3847;
      }
      
      input:focus, input:hover {
      background-color: #f9fae1;
      }
      
      .toggleOpts { cursor: pointer; }
      
      .desc {
      font-size: 0.65em;
      }
      
      .form_spacer {
      padding-top: 20px;
      }
      
      #td_top {
      padding-top: 20px;
      }
      #td_form {
      padding-top: 20px;
      }
      #td_bottom {
      padding: 4px;
      font-size:8pt; 
      border-top:1px solid #2a3847;
      }
      #lTable {
      padding: 8px;
      
      border: 2px solid #2a3847;
      -moz-border-radius: 8px;
      
      background-color: #81addc;
      }
/*]]>*/
    </style>
  </head>
  
  <body>
    <table width="100%" height="100%">
        <tr>
          <td align=center id='td_top'>
            <table>
                <tr>
                  <td>
                    <h1 id="welcomeh1">Добро пожаловать в JWChat</h1>
                    <h2>Клиент Jabber<sup><small>&reg;</small></sup> для веб</h2>
                  </td>
                </tr>
            </table>
          </td>
        </tr>
    <form name="login" onSubmit="return loginCheck(this);">
      <tr>
        <td height="100%" align=center valign=top id='td_form'>
          <table border=0 cellspacing=0 cellpadding=2 id="lTable" align=center width=380>
              <tr>
                <td colspan=2><h3>Вход<img src="images/available.gif" width=16 height=16></h3></td>
              </tr>
              <tr id="tr_server" style="display:none;">
                <th title="Выбрать сервер Jabber для подключения"><label for='server'>Сервер</label></th>
                <td></td>
              </tr>
              <tr>
                <th class='form_spacer'><label for='jid'>Имя пользователя</label></th>
                <td class='form_spacer' width="100%"><input type="text" id='jid' name="jid" tabindex=3 class='input_text'></td>
              </tr>
              <tr><td>&nbsp;</td><td nowrap class="desc">Имя пользователя не должно содержать: <span id='chars_prohibited'></span></td></tr>
              <tr>
                <th><label for='pass'>Пароль</label></th>
                <td><input type="password" id='pass' name="pass" tabindex=4 class='input_text'></td>
              </tr>
              <tr><td>&nbsp;</td><td><input type=checkbox name=register id=register> <label for="register">Создать нового пользователя</label></td></tr>
              <tr id="showMoreOpts" class="toggleOpts">
                <td>&nbsp;</td>
                <td onClick="return toggleMoreOpts(1);"><img src="images/group_close.gif" title="Показать дополнительные настройки"> Показать дополнительные настройки</td>
              </tr>
              <tr id="showLessOpts" class="toggleOpts" style="display:none;">
                <td>&nbsp;</td>
                <td onClick="return toggleMoreOpts(0);"><img src="images/group_open.gif" title="Скрыть дополнительные настройки"> Скрыть дополнительные настройки</td>
              </tr>
              <tr class="moreOpts" style="display:none;">
                <th><label for='res'>Ресурс</label></th>
                <td><input type="text" id="res" name="res" class="input_text"></td>
					</tr>
              <tr class="moreOpts" style="display:none;">
                <th><label for='prio'>Приоритет</label></th>
                <td>
                  <select type="text" id="prio"  name="prio" class="input_text" size="1">
                    <option value="0">низкий</option>
                    <option value="10" selected>средний</option>
                    <option value="100">высокий</option>
                  </select>
                </td>
              </tr>
              <tr class="moreOpts" style="display: none;">
		<th class="form_spacer"><label for="connect_port">Порт</label></th>
                <td class="form_spacer"><input type="text" name="connect_port" id="connect_port" class="input_text" disabled></td>
              </tr>
              <tr class="moreOpts" style="display: none;">
	        <th><label for="connect_host">Подключение к хосту</label></th>
                <td><input type="text" name="connect_host" id="connect_host" class="input_text" disabled></td>
              </tr>
              <tr class="moreOpts" style="display: none;">
                <td>&nbsp;</td>
		<td><input type="checkbox" name="connect_secure" id="connect_secure" class="input_text" disabled> <label for="connect_secure" title="Рекомендовать менеджеру подключений соединяться через SSL" disabled>Разрешить только зашифрованные подключения</label></td>
              </tr>
              
              <tr><td>&nbsp;</td><td><button type="submit" id='login_button' tabindex=5 disabled>Вход</button></td></tr>
          </table>
    </form>	
  </td>
  </tr>
    <tr>
      <td id='td_bottom'>
        <a href="http://sourceforge.net/donate/index.php?group_id=92011"><img src="http://images.sourceforge.net/images/project-support.jpg" width="88" height="32" border="0" alt="Support This Project" align=right /></a>
        За дополнительной информацией обращайтесь на <a href="http://jwchat.sourceforge.net">домашнюю страницу JWChat</a>.
        <br>
        &copy; 2003-2005 <a href="mailto:steve@zeank.in-berlin.de">Stefan Strigler</a> - 
        <!-- Created: Wed Feb  5 15:19:17 CET 2003 -->
        <!-- hhmts start -->
Last modified: Fri Jan 19 14:26:00 CET 2007
<!-- hhmts end -->
      </td>
    </tr>
  </table>
  </body>
</html>
