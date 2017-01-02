$(document).ready(function(){	
	$(".button-collapse").sideNav();
	  // Initialize collapsible (uncomment the line below if you use the dropdown variation)
	$('.collapsible').collapsible();
	$('.pushpin-demo-nav').each(function() {
	    var $this = $(this);
	    var $target = $('#' + $(this).attr('data-target'));
	    $this.pushpin({
	      top: $target.offset().top,
	      bottom: $target.offset().top + $target.outerHeight() - $this.height()
	    });
	  });

	$(".play-pause").click(function(e){
		e.preventDefault(); 
		
		if($(this).hasClass("play")){
			console.log("has");
			$(this).removeClass("play");
			$(this).html('');
			$(this).html("<i class='material-icons'>pause_arrow</i>");
		}else{
			console.log("not");
			$(this).addClass("play");
			$(this).html(''); 
			$(this).html("<i class='material-icons'>play_arrow</i>");
		}
	});

    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();


});