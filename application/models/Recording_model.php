<?php

/**
 * SharIF Judge online judge
 * @file Submit_model.php
 * @author Andreas Ronaldi <andreasronaldi25@gmail.com>
 */
defined('BASEPATH') or exit('No direct script access allowed');

class Recording_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
	}

	public function all_user_recordings($assignment_id, $filter_problem = NULL, $filter_user = NULL) {
		$arr['assignment'] = $assignment_id;
		if ($filter_problem !== NULL) 
			$arr['problem'] = $filter_problem;
		if ($filter_user !== NULL) 
			$arr['username'] = $filter_user;

		return $this->db
			->order_by('upload_at asc')
			->get_where('recording', $arr)
			->result_array();
	}

	public function get_user_recordings($assignment_id, $problem_id, $username) {
		$arr['assignment'] = $assignment_id;
		$arr['problem'] = $problem_id;
		$arr['username'] = $username;

		return $this->db
			->order_by('upload_at asc')
			->get_where('recording', $arr)
			->result_array();
	}

	public function add_recording($rec_info) {
		$this->db->replace('recording', $rec_info);
	}

	public function remove_saveonly_recording($assignment_id, $problem_id, $username) {
		$this->db->delete('recording', array(
			'assignment' => $assignment_id, 
			'problem'=>$problem_id, 
			'username'=>$username, 
			'rec_id'=>0)
		);
	}
}
