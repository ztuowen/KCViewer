
(function(){
	function gotoIframe(){
		if (document.getElementById('game_frame'))
		{
			document.location.href = document.getElementById('game_frame').src;
		}
	}
  gotoIframe();
  //document.addEventListener("DOMContentLoaded",gotoIframe);
})();
