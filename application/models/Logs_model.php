<?php
/**
 * SharIF Judge online judge
 * @file Logs_model.php
 * @author Mohammad Javad Naderi <mjnaderi@gmail.com>
 */
defined('BASEPATH') OR exit('No direct script access allowed');

class Logs_model extends CI_Model
{

	public function __construct()
	{
		parent::__construct();
	}


	// ------------------------------------------------------------------------


	/**
	 * Mencatat Logs (Tabel shj_logins)
	 *
	 *
	 *
	 */
	public function insert_to_logs($username, $ip_adrress)
	{
		$query = $this->db->get('logins')->result_array();

		//menghapus timestamp user yang lebih dari 24 jam
		foreach ($query as $row)
		{
			$temptime=strtotime('+24 hour', strtotime($row['timestamp']));
			if ($temptime < shj_now()) {
				# delete
				$this->db->where('timestamp', $row['timestamp']);
				$this->db->delete('logins');
			}
		}
		$current_time = shj_now_str();
		$result = $this->db->query("SELECT * FROM shj_logins WHERE username='".$username."' AND ip_address!='".$ip_adrress."' ORDER BY timestamp DESC")->row();
		if ($result === NULL) {
			$logins = array(
				'username' => $username,
				'timestamp' => $current_time,
				'ip_address' => $ip_adrress
			);
			$this->db->insert('logins', $logins);
		}
		else {
			$get_last_login_id = $result -> login_id;
			$logins = array(
				'username' => $username,
				'timestamp' => $current_time,
				'ip_address' => $ip_adrress,
				'last_24h_login_id' => $get_last_login_id
			);
			$this->db->insert('logins', $logins);
		}
	}


  // ------------------------------------------------------------------------


	/**
	 * Get All Logs
	 *
	 * Returns an array of all logs
	 *
	 * @return mixed
	 */
	public function get_all_logs()
	{
		return $this->db->order_by('login_id', 'desc')->get('logins')->result_array();
	}


	// ------------------------------------------------------------------------
}
