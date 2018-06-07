<?
// Simple example of send mail (test only). In real project it should be rebuilded.
$example = new example_of_send_mail;
$example->create();
$send = (@mail($example->sendto, $example->subject, $example->message, $example->message_header)) ? 'success' : 'error';
echo $example->response[$send];

class example_of_send_mail 
{
	// main email attributes
	public $sendfrom = 'neba@inbox.ru';
	public $sendto = 'ilya.neba@gmail.com';
	public $subject;
	public $message;
	public $message_header = '';
	public $response = array 
	(
		'success' => 'Message was sent successfully', 
		'error' => 'Can\'t sent message', 
	);
	// attributes for files
	public $site_name;
	public $linkdir;
	public $loaddir;
	public $allowed = array 
	(
		'jpg'  => 'image/jpeg',
		'jpeg' => 'image/jpeg',
		'gif'  => 'image/gif',
		'png'  => 'image/png',
		'doc'  => 'application/msword',
		'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'pdf'  => 'application/pdf',
		'rar'  => 'application/octet-stream',
		'zip'  => 'application/octet-stream',
	);

	// Start point for message
	public function create () 
	{
		$this->site_name = $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['SERVER_NAME'];
		$this->linkdir = '/upload/';
		$this->loaddir = $_SERVER['DOCUMENT_ROOT'].$this->linkdir;
		$this->subject = 'Site message';
		$this->head();
		$this->message = $this->text();
	}

	// Message head process
	public function head () 
	{
		$message_header = 'MIME-Version: 1.0'.PHP_EOL;
		$message_header .= 'Reply-To: <'.$this->sendfrom.'>'.PHP_EOL;
		$message_header .= 'Content-type: text/html; charset=utf-8'.PHP_EOL;
		$message_header .= 'X-Mailer: PHP/'.phpversion();
		$this->message_header = $message_header;
	}

	// Message text process
	public function text () 
	{
		$message = '<h2>A new message from site '.$this->site_name.'</h2>';
		foreach ($_POST as $option) 
		{
			$row = json_decode($option, true);
			switch ($row['type']) 
			{
				case 'textarea': 
					$message .= '<div><b>'.$row['caption'].':</b></div><div>'.$row['value'].'</div>';
					break;
				case 'file': 
					$message .= '<div><b>'.$row['caption'].':</b></div>';
					$message .= $this->files($row['name']);
					break;
				default: 
					$message .= '<div><b>'.$row['caption'].':</b> <u>'.$row['value'].'</u></div>';
					break;
			}
		}
		return $message;
	}

	// Uploaded files processing
	public function files ($fieldname) 
	{
		$result = '<div>';
		if (!empty($_FILES[$fieldname])) 
		{
			foreach ($_FILES[$fieldname]['name'] as $key => $fileID) 
			{
				$file = array 
				(
					'name' => $fileID, 
					'type' => $_FILES[$fieldname]['type'][$key], 
					'tmp_name' => $_FILES[$fieldname]['tmp_name'][$key], 
					'error' => $_FILES[$fieldname]['error'][$key], 
					'size' => $_FILES[$fieldname]['size'][$key], 
				);
				$ext = mb_strtolower(end(explode('.', $fileID)));
				if ((!empty($this->allowed[$ext]))&&($this->allowed[$ext] == $file['type'])&&($file['error'] == 0)) 
				{
					do 
					{
						$file['upload_name'] = $this->abra().'.'.$ext;
						$file['route'] = str_replace (['/', '\\'], DIRECTORY_SEPARATOR, $this->loaddir.$file['upload_name']);
					} while (file_exists($file['route']));
					$file['link'] = $this->site_name.$this->linkdir.$file['upload_name'];
					if (move_uploaded_file($file['tmp_name'], $file['route'])) $result .= '<div><a href="'.$file['link'].'">'.$file['name'].'</a></div>';
				}
			}
		}
		else 
		{
			$result .= 'no files';
		}
		$result .= '</div>';
		return $result;
	}

	// Random word generator
	public function abra ($length = 8) 
	{
		$alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		$result = '';
		$alphabet_length = strlen($alphabet) - 1;
		while (strlen($result) < $length) $result .= $alphabet[random_int(0, $alphabet_length)];
		return $result;
	}
}
?>