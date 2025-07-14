<?php
    
    // Function that formats output, easier to read than var_dump()
    function debugOutput($array){

        $clean = htmlspecialchars( print_r( $array, true ) );

        echo"<pre>".$clean."</pre>";
      
    }
