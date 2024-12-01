<?php
// example backend router to non root domain
// this code is not best practices just for example purposes !!!


$url = $_SERVER['REQUEST_URI'];

if (strpos($url, '/folder') !== 0) {
    echo 'check /folder';
}else{
    echo file_get_contents(__DIR__ . '/example-nonroot.html');
}