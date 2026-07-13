<?php
/**
 * SharIF Judge online judge
 * @file Hof_model.php
 * @author Stillmen Vallian <stillmen.v@gmail.com>
 */
defined('BASEPATH') OR exit('No direct script access allowed');

class Hof_model extends CI_Model
{

	public function __construct()
	{
		parent::__construct();
	}


	// ------------------------------------------------------------------------


	/**
	 * Get data for Hall of Fame
	 *
	 *
	 * @return mixed
	 */
	public function get_all_final_submission()
	{
		$this->load->model('user_model');
		//include upload only file: remove " AND file_type!='txt' AND file_type!='pdf' AND file_type!='zip' ";
    $datas = $this->db->query("SELECT username, CEILING(SUM(pre_score * coefficient / 10000))  AS totalscore FROM shj_submissions WHERE is_final=1 AND file_type!='txt' AND file_type!='pdf' AND file_type!='zip' GROUP BY username ORDER BY totalscore DESC")->result_array();
		foreach ($datas as $key => $data) {
			$user_id = $this->user_model->username_to_user_id($data['username']);
			$datas[$key]['display_name'] = $this->user_model->get_user($user_id)->display_name;
    }
		return $datas;
	}


	// ------------------------------------------------------------------------

	/**
	 * Get details assignments & problems for selected user
	 *
	 *
	 * @return mixed
	 */
	public function get_all_user_assignments($username)
	{
		$this->load->model('assignment_model');
		$details = $this->db->query("SELECT assignment, problem, CEILING((pre_score * coefficient / 10000)) AS score FROM shj_submissions WHERE is_final=1 AND username='$username' AND file_type!='txt' AND file_type!='pdf' AND file_type!='zip' ORDER BY assignment ASC")->result_array();
		foreach ($details as $key => $detail) {
			$assignment_id = $detail['assignment'];
			$problem_id = $detail['problem'];
			$details[$key]['assignment'] = $this->assignment_model->assignment_info($assignment_id)['name'];
			$details[$key]['scoreboard'] = $this->assignment_model->assignment_info($assignment_id)['scoreboard'];
			$details[$key]['problem'] = $this->assignment_model->problem_info($assignment_id, $problem_id)['name'];
    }
		return $details;
	}
}
