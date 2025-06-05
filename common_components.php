<?php

    // Functions to echo out common components for every html page!!
	function echoHeader($pageTitle){ 
			echo "
			    <html>
			        <head>
			            <title>".$pageTitle."</title>
			            <link rel='stylesheet' href='mainPageStyle.css'>
			        </head>
			        <body>		            
			";
	}

    function echoFooter(){
	    echo "
			    </body>
		    </html>
	    ";
    }
