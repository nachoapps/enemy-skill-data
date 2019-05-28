<?php

$script = "/home/tactical0retreat/rpad-cogs-utils/pad_api_data/print_dungeon.py";
$raw_dir = "/home/tactical0retreat/pad_data/raw";
$processed_dir = "/home/tactical0retreat/pad_data/processed";

$dungeon_id = "";
if (array_key_exists("dungeon_id", $_GET)) {
    $dungeon_param = $_GET["dungeon_id"];
    if (is_numeric($dungeon_param)) {
        $dungeon_id = $dungeon_param;
    }
}

$cmd = "export PYTHONIOENCODING=utf-8;python3 "
    . $script
    . " --raw_input_dir=" . $raw_dir
    . " --processed_input_dir=" . $processed_dir
    . " --dungeon_id=" . $dungeon_id;

echo '<pre>';
passthru($cmd, $err);
echo '</pre>';

?>
