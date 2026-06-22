<?php
session_start();
session_unset();
session_destroy();
header('Location: /hrms/login.html');
exit;
?>