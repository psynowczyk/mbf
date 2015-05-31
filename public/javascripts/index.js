var site = window.location.pathname;

$(document).ready(function() {
/*
	$('#menu_usermenu_box').hover(
		function() {
			$('#menu_usermenu').css('display', 'block');
		},
		function() {
			$('#menu_usermenu').css('display', 'none');
		}
	);
*/
	if(site == '/editprofile') {
		
		$('input[name="avatar"]').on('change', function (e) {
			var allowedext = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
			var file = e.target.files[0];
			if (allowedext.indexOf(file.type) == -1) {
				$('.file_input_status[data-id="avatar"]').html('Allowed avatar image extensions: jpg, png, gif!');
				$('input[data-id="editprofile_save"]').attr('disabled', 'disabled');
			}
			else {
				$('.file_input_status[data-id="avatar"]').html('');
				$('input[data-id="editprofile_save"]').removeAttr('disabled');
			}
			
		});

		$("form#editprofile").on('submit', function (event) {
			event.preventDefault();

			if ($('input[type="file"]')[0].files.length > 0) {
				var formData = new FormData(this);
				$.ajax({
					url: '/editprofile_both',
					type: 'POST',
					data: formData,
					processData: false,
					contentType: false,
					success: function () {
						location.href = '/editprofile';
					}
				});
			}
			else {
				var formData = $(this).serialize();
				$.post('/editprofile_data', formData, function() {
   				location.href = '/editprofile';
				});
			}

		});


	}
	
});