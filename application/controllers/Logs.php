<?php
/**
 * SharIF Judge online judge
 * @file Logs.php
 * @author Stillmen Vallian <stillmen.v@gmail.com>
 */
defined('BASEPATH') OR exit('No direct script access allowed');

class Logs extends CI_Controller
{


	public function __construct()
	{
		parent::__construct();
		if ( ! $this->session->userdata('logged_in')) // if not logged in
			redirect('login');
		if ( $this->user->level <= 2) // permission denied
			show_404();
	}




	// ------------------------------------------------------------------------




	public function index()
	{

		$data = array(
			'logs' => $this->logs_model->get_all_logs()
		);

		$this->twig->display('pages/admin/logs.twig', $data);
	}




	// ------------------------------------------------------------------------

}
