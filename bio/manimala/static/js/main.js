
(function($) {

	$(document).ready( function() {

		// init scrollspy
		$('body').scrollspy({ target: '#main-nav' });
		
		// init scroll-to effect navigation, adjust the scroll speed in milliseconds			
		$('#main-nav').localScroll(1000);
		$('#header').localScroll(1000);


		// google maps 
		if( $('.map-canvas').length > 0) {
			
			var geocoder = new google.maps.Geocoder();
			var address = 'Google New York, 76 Ninth Ave, New York, NY, USA';
			var contentString = '<div class="map-detail"><strong>Our Office:</strong><p>' + address + '</p></div>';
			
			geocoder.geocode({'address': address }, function(results, status) {
				if(status == google.maps.GeocoderStatus.OK) { 
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();

					jQuery('.map-canvas').gmap().bind('init', function(ev, map) {
						jQuery('.map-canvas').gmap('addMarker', {'position': latitude+','+longitude, 'bounds': true}).click(function() {
							jQuery('.map-canvas').gmap('openInfoWindow', {'content': contentString}, this);
						});
						jQuery('.map-canvas').gmap('option', 'zoom', 8);
					});
				}else { alert('Google Maps had some trouble finding the address. Status: ' + status); }
			});
			
		}

		// form validation 
		Modernizr.load({
			test: Modernizr.input.autocomplete,		
			nope: ['assets/js/jquery.validate.js', 'assets/js/jquery.validate.bootstrap.js'],
		});

		// ajax contact form
		$('.contact-form form').submit( function(e) {
			
			e.preventDefault();

			$theForm = $(this);
			$btn = $(this).find('#submit-button');
			$alert = $(this).parent().find('.alert');			

			// just to check if validation supported without response, such as safari 5.1. Removing JS error on chrome
			if( !Modernizr.input.autocomplete ) {
				
				$theForm.validate({

					messages: {
						email: { required: "Email is required", email: "Please enter a valid email address"}
					}
				});	

				if( !$theForm.valid() ) {
					return;
				}
			}

			$btn.addClass('loading');
			$btn.attr('disabled', 'disabled');

			$.post('contact.php', $(this).serialize(), function(data){
				
				$message = data.message;
				
				if( data.result == true ){
					$theForm.slideUp('medium', function() {
						$alert.removeClass('alert-danger');
						$alert.addClass('alert-success').html($message).slideDown('medium');	
					});				
				}else {
					$alert.addClass('alert-danger').html($message).slideDown('medium');	
				}

				$btn.removeClass('loading');
				$btn.removeAttr('disabled');

			})
			.fail(function() { console.log('AJAX Error'); });

		});

	});

})(jQuery);

var callback = function(){
	$('.item-skills').each(function(){
		newWidth = $(this).parent().width() * $(this).data('percent');
		$(this).width(0);
    $(this).animate({
        width: newWidth,
    }, 1000);
	});
	$('.icons-red').each(function(){
		height = $(this).height();
    $(this).animate({
        height: 14,
    }, 2000);
	});
};
$(document).ready(callback);

var resize;
window.onresize = function() {
	clearTimeout(resize);
	resize = setTimeout(function(){
		callback();
	}, 100);
};