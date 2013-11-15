<?

	require('lib/Pusher.php');
	
	$APP_KEY = 'a080e81530d15631ff70';
	$APP_SECRET = 'b13dc2ae75cc9047cd44';
	$APP_ID = '56527';
	$channel_name = $_POST['channel_name'];
	$socket_id = $_POST['socket_id'];


	$pusher = new Pusher($APP_KEY, $APP_SECRET, $APP_ID);
	if(preg_match("(private-.*)",$channel_name)){
		echo $pusher->socket_auth($channel_name, $socket_id);
	}else{
		$presence_data = array('name' => "sample_name");
		echo $pusher->presence_auth($channel_name, $socket_id,"sample_22user3",$presence_data);
	}
?>
