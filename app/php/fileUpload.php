<?php
session_start();
if (isset($_SESSION['wiki_id'])) {
    require_once('advanced_user_oo.php');
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'wiki');
    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $server_root = $_SERVER['DOCUMENT_ROOT'];
    $media_path = urldecode($_POST['media_path']);
    $media_path = $server_root.$media_path;
    $temp_dir = $media_path."/temp";
    if (!@is_dir($temp_dir)) {
        @mkdir($temp_dir, 0755,true);
    }
    $media_name = $_POST['media_name'];
    $media_file = $media_path."/".$media_name;


    /**
     *
     * Delete a directory RECURSIVELY
     * @param string $dir - directory path
     * @link http://php.net/manual/en/function.rmdir.php
     */
    function rrmdir($dir) {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (filetype($dir . "/" . $object) == "dir") {
                        rrmdir($dir . "/" . $object);
                    } else {
                        unlink($dir . "/" . $object);
                    }
                }
            }
            reset($objects);
            rmdir($dir);
        }
    }

    /**
     *
     * Check if all the parts exist, and
     * gather all the parts of the file together
     * @param string $dir - the temporary directory holding all the parts of the file
     * @param string $fileName - the original file name
     * @param string $chunkSize - each chunk size (in bytes)
     * @param string $totalSize - original file size (in bytes)
     */
    function createFileFromChunks($temp_dir, $media_file, $fileName, $chunkSize, $totalSize) {

        // count all the parts of this file
        $total_files = 0;
        foreach(scandir($temp_dir) as $file) {
            if (stripos($file, $fileName) !== false) {
                $total_files++;
            }
        }

        // check that all the parts are present
        // the size of the last part is between chunkSize and 2*$chunkSize
        if ($total_files * $chunkSize >=  ($totalSize - $chunkSize + 1)) {

            // create the final destination file
            if (($fp = fopen($media_file, 'w')) !== false) {
                for ($i=1; $i<=$total_files; $i++) {
                    fwrite($fp, file_get_contents($temp_dir.'/'.$fileName.'.part'.$i));
                }
                fclose($fp);
                echo($total_files.' = '.$media_file);
            } else {
                echo('cannot create the destination file');
                return false;
            }

            // rename the temporary directory (to avoid access from other
            // concurrent chunks uploads) and than delete it

            if (rename($temp_dir, $temp_dir.'_UNUSED')) {
                rrmdir($temp_dir.'_UNUSED');
            } else {
                rrmdir($temp_dir);
            }
        }
    };


//check if request is GET and the requested chunk exists or not. this makes testChunks work
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $chunk_file = $temp_dir.'/'.$_GET['flowFilename'].'.part'.$_GET['flowChunkNumber'];
        if (file_exists($chunk_file)) {
            header("HTTP/1.0 200 Ok");
        } else
        {
            header("HTTP/1.0 404 Not Found");
        }
    }


// loop through files and move the chunks to a temporarily created directory
    if (!empty($_FILES)) foreach ($_FILES as $file) {

        // init the destination file (format <filename.ext>.part<#chunk>
        // the file is stored in a temporary directory
        $dest_file = $temp_dir.'/'.$_POST['flowFilename'].'.part'.$_POST['flowChunkNumber'];

        // move the temporary file
        if (!move_uploaded_file($file['tmp_name'], $dest_file)) {
            echo('Error saving (move_uploaded_file) chunk '.$dest_file.' for file '.$_POST['flowFilename']);
        } else {
            // check if all the parts present, and create the final destination file
            createFileFromChunks($temp_dir, $media_file, $_POST['flowFilename'],
                $_POST['flowChunkSize'], $_POST['flowTotalSize']);

            $user_id = $_POST['user_id'];
            $wiki_id = $_SESSION['wiki_id'];
            $page_id = $_POST['page_id'];
            $heading_id = $_POST['heading_id'];
            $type_id = $_POST['type_id'];
            $query = "INSERT INTO user_uploads (user_id, type_id, wiki_id, page_id, heading_id, file_name, upload_date) VALUES
			('$user_id', '$type_id', '$wiki_id', '$page_id', '$heading_id', '$media_name', UTC_TIMESTAMP())
			ON DUPLICATE KEY UPDATE file_name='$media_name'";
            $result = $mysqli->query($query);
            if ($result) {
                $status = array('success'=>true);
            } else {
                $status = array('error'=> 'Could not add data to database.' .
                    'The upload was cancelled, or server error encountered', 'path'=>$media_path);
            }
            $mysqli->close();
        }
    }
}
?>