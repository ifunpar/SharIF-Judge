<?php
/**
 * SharIF Judge online judge
 * @file Halloffame.php
 * @author Stillmen Vallian <stillmen.v@gmail.com>
 */
defined('BASEPATH') OR exit('No direct script access allowed');

class Halloffame extends CI_Controller
{


	public function __construct()
	{
		parent::__construct();
		if ( ! $this->session->userdata('logged_in')) // if not logged in
			redirect('login');
		$this->load->model('hof_model');
	}




	// ------------------------------------------------------------------------




	public function index()
	{
		$data = array(
			'hofs' => $this->hof_model->get_all_final_submission()
		);
		$this->twig->display('pages/halloffame.twig', $data);
	}




	// ------------------------------------------------------------------------



	/**
	 * Controller for shows the details of the score
	 * Called by ajax request
	 */
	public function hof_details()
	{
		if ( ! $this->input->is_ajax_request() )
			show_404();
		$username = $this->input->post('username');

		$json_result = $this->hof_model->get_all_user_assignments($username);

		$this->output->set_header('Content-Type: application/json; charset=utf-8');
		echo json_encode($json_result);
	}
}
