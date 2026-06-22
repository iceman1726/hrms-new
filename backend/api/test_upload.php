<?php
echo '<h2>Test Upload</h2>';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
    $file = $_FILES['test'];
    $target = $uploadDir . basename($file['name']);
    if (move_uploaded_file($file['tmp_name'], $target)) {
        echo 'Success! File saved to: ' . $target;
    } else {
        echo 'Failed to move file. Check folder permissions: ' . $uploadDir;
    }
} else {
    echo '<form method="post" enctype="multipart/form-data">
            <input type="file" name="test">
            <button>Upload</button>
          </form>';
}
?>