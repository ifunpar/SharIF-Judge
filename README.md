# SharIF Judge

[SharIF Judge](https://github.com/ifunpar/Sharif-Judge) is a free and open source online judge for C, C++, Java and
Python programming courses. SharIF Judge is a fork of the original [Sharif Judge](https://github.com/mjnaderi/Sharif-Judge) beautifully created by [@mjnaderi](https://github.com/mjnaderi). This forked version contain many improvements, mostly due to the needs by our faculty at [@ifunpar](https://github.com/ifunpar).

The web interface is written in PHP (CodeIgniter framework) and the main backend is written in BASH.

Python in SharIF Judge is not sandboxed yet. Just a low level of security is provided for python.
If you want to use SharIF Judge for python, USE IT AT YOUR OWN RISK or provide sandboxing yourself.

The full documentation is at https://github.com/ifunpar/Sharif-Judge/tree/docs

Download the latest release from https://github.com/ifunpar/Sharif-Judge/releases

## Branches, Tags and Releases

The numbering may be confusing, I apologize. However, here are some explanations:

* Branches, sorted from newest to oldest:
    - **`Version-1`** this is the **main branch**, since mjnaderi is using this naming for the main branch.
    - `Version-1.5`, this is an older branch, containing action replay and (supposedly) PHP 8.3 compatibility
    - `Version-1.1`, this is an even older branch, compatible up to PHP 7.4, but pretty stable
    - `docs`, documentation branch, similar to mjnaderi's one but maybe with some adjustments
    - Other branches are undocumented
* Tags and releases, sorted from newest to oldest
    - `v1.5.x-ifunpar` release of `Version-1.5` branch
    - `v1.4.x-ifunpar` release of pre-`Version-1.1` branch. Named `1.4` because mjnaderi used that. We will no longer use mjnaderi's one.

## Features
  * Multiple user roles (admin, head instructor, instructor, student)
  * Sandboxing _(not yet for python)_
  * Cheat detection (similar codes detection) using [Moss](http://theory.stanford.edu/~aiken/moss/)
  * Custom rule for grading late submissions
  * Submission queue
  * Download results in excel file
  * Download submitted codes in zip file
  * _"Output Comparison"_ and _"Tester Code"_ methods for checking output correctness
  * Add multiple users
  * Problem Descriptions (PDF/Markdown/HTML)
  * Rejudge
  * Scoreboard
  * Notifications
  * Lock Student's Display Name
  * Archived Assignment
  * Hall of Fame 
  * 24-hour Logs
  * ...

## Requirements

For running SharIF Judge, a Linux server with following requirements is needed:

  * Webserver running PHP version 5.3 or later with `mysqli` extension
  * PHP CLI (PHP command line interface, i.e. `php` shell command)
  * MySql or PostgreSql database
  * PHP must have permission to run shell commands using [`shell_exec()`](http://www.php.net/manual/en/function.shell-exec.php) php function (specially `shell_exec("php");`)
  * Tools for compiling and running submitted codes (`gcc`, `g++`, `javac`, `java`, `python2` and `python3` commands)
  * It is better to have `perl` installed for more precise time and memory limit and imposing size limit on output of submitted code.

## Installation

  1. `git clone` and switch to one of the tag, or...
      * ...download the latest release from [release page](https://github.com/ifunpar/SharIF-Judge/releases) and unpack downloaded file in your public html directory.
  2. **[Optional]** Move folders `system` and `application` somewhere outside your public directory. Then save their full path in `index.php` file (`$system_path` and `$application_folder` variables).
  3. Create a MySql or PostgreSql database for SharIF Judge. Do not install any database connection package for C/C++, Java or Python.
  4. Copy `application/config/config.example.php` to `application/config/config.php` and update `base__url` according to your server configuration.
  5. Copy `application/config/database.example.php` to `application/config/database.php` and update the file according to your database configuration.
  6. Copy `application/config/secrets.example.php` to `application/config/secrets.php` and update the file according to your RADIUS and SMTP configuration.
  7. Make `application/cache/Twig` writable by php.
  8. Open the main page of SharIF Judge in a web browser and follow the installation process.
  9. Log in with your admin account.
  10. **[IMPORTANT]** Move folders `tester` and `assignments` somewhere outside your public directory. Then save their full path in `Settings` page. **These two folders must be writable by PHP.** Submitted files will be stored in `assignments` folder. So it should be somewhere not publicly accessible.
  11. **[IMPORTANT]** [Secure SharIF Judge](https://github.com/ifunpar/Sharif-Judge/blob/docs/v1.4/security.md)

## After Installation

  * Read the [documentation](https://github.com/ifunpar/Sharif-Judge/tree/docs)

## License

GPL v3
