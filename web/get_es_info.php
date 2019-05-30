<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, x-xsrf-token, x_csrftoken, Cache-Control, X-Requested-With');
header('Content-Type: application/json');


$monster_id = "";
if (array_key_exists("monster_id", $_GET)) {
    $monster_param = $_GET["monster_id"];
    if (is_numeric($monster_param)) {
        $monster_id = $monster_param;
    }
}

if ($monster_id == "") {
  die("You must supply an integer monster_id");
}

$data_home = "/home/tactical0retreat/pad_data";
$es_home = "/home/tactical0retreat/git/enemy-skill-data";
$api_home = "/home/tactical0retreat/rpad-cogs-utils/pad_api_data";

$raw_dir = $data_home . "/raw";
$processed_dir = $data_home . "/processed";
$es_dir = $es_home . "/enemy_data";


$encoding = "export PYTHONIOENCODING=utf-8";
$pypath = "export PYTHONPATH=" . $api_home;
$script = realpath("get_es_info.py");

$cmd = "python3 " . $script
    . " --monster_id=" . $monster_id
    . " --raw_input_dir=" . $raw_dir
    . " --es_input_dir=" . $es_dir;

$final_cmd = $encoding . ";" . $pypath . ";" . $cmd;
passthru($final_cmd, $err);

?>
