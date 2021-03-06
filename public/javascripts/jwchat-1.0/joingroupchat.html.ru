<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>JWChat - Присоединиться к групповому чату</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <script src="shared.js" language="JavaScript1.2"></script>
    <script src="switchStyle.js"></script>
    <script language="JavaScript1.2">
      <!--
var jid;
var srcW; // the source window with necessary data

function doSub() {
  var nick = (document.forms[0].nick.value!='')?document.forms[0].nick.value:srcW.roster.nick;
  
  if (document.forms[0].group.value == '') {
    alert("Пожалуйста укажите канал/группу для подключения");
    return false;
  }
  if (document.forms[0].server.value == '') {
    alert("Пожалуйста укажите имя сервера");
    return false;
  }

  var pass = document.forms[0].pass.value;

  var group = document.forms[0].group.value+"@"+document.forms[0].server.value;

  srcW.openGroupchat(group,nick,pass);
		
  window.close();
  return false;
}

function bookmark_selected(el) {
  var bookmark = srcW.bookmarks[el.options[el.selectedIndex].value];

  document.forms[0].nick.value = bookmark.nick;
  
  document.forms[0].group.value = bookmark.jid.substring(0,bookmark.jid.indexOf('@'));

  document.forms[0].server.value = bookmark.jid.substring(bookmark.jid.indexOf('@')+1);

  if (typeof(bookmark.pass) != 'undefined')
    document.forms[0].pass.value = bookmark.pass;

  return false;
}

function updateBookmarks() {
  var bookmark_selector = document.getElementById('bookmark_selector');
  var optidx = 1;

  // clear list - don't remove first
  for (var i=1; i<bookmark_selector.options.length; i++)
    bookmark_selector.options[i] = null;

  // fill from global arr
  for (var i=0; i<srcW.bookmarks.length; i++)
    bookmark_selector.options[optidx++] = new Option(srcW.bookmarks[i].name,i);
}

var srw;
function openSearchRooms() {
  if (!srw || srw.closed)
    srw = open("searchrooms.html","srw"+makeWindowName(srcW.jid),"width=400,height=300,resizable=yes");
  srw.focus();
  return false;
}

function init() {
  // determine source window
  if (opener.top.roster)
    srcW = opener.top;
  
  if (typeof(srcW.DEFAULTCONFERENCESERVER) != 'undefined' && srcW.DEFAULTCONFERENCESERVER != '')
    document.forms[0].server.value = srcW.DEFAULTCONFERENCESERVER;
  if (typeof(srcW.DEFAULTCONFERENCEROOM) != 'undefined' && srcW.DEFAULTCONFERENCEROOM != '')
    document.forms[0].group.value = srcW.DEFAULTCONFERENCEROOM;

  document.forms[0].nick.value = srcW.nick;

  updateBookmarks();
}

function cleanUp() {
  if (srw && !srw.closed)
    srw.close();
}

function keyPressed(e) {
  if (e.keyCode == 13)
    return doSub();
  if (e.keyCode == 27)
    window.close();
  return true;
}

onkeydown = keyPressed;
onload = init;
onunload = cleanUp;
      //-->
    </script>
    <script for="document" event="onkeydown()" language="JScript">
      <!--
       if (window.event)
        return keyPressed(window.event);
      //-->
    </script>
  </head>
  <body style="margin:8px;">
    <form name="sub" onsubmit="return doSub();">
      <table border="0" width="100%">
          <tr><td colspan="2">Искать комнаты <button onClick="return openSearchRooms();">Открыть поиск</button></td></tr>
          <tr><td colspan="2"><hr noshade size="1"></td></tr>
          <tr><td>Закладка</td><td><select id="bookmark_selector" onChange="return bookmark_selected(this);"><option value=""> - Выберите закладку - </option></select> <button onClick="return srcW.openEditBookmarks();">Редактировать</button></td></tr>
          <tr><td colspan="2"><hr noshade size="1"></td></tr>
          <tr><td nowrap>Ник</td><td width="100%"><input type="text" name="nick" size="32" style="width:100%;"></td></tr>
          <tr><td nowrap>Комната</td><td width="100%"><input type="text" name="group" size="32" style="width:100%;"></td></tr>
          <tr><td nowrap>Сервер</td><td width="100%"><input type="text" name="server" size="32" style="width:100%;"></td></tr>
          <tr><td nowrap>Пароль</td><td width="100%"><input type="text" name="pass" size="32" style="width:100%;"></td></tr>
      </table>
      <hr noshade size="1" size="100%">
      <div align="right" id="buttonbox">
        <button type="button" onClick="window.close();">Отменить</button>&nbsp;<button type="submit">Присоединиться</button>
      </div>
    </form>
  </body>
</html>
