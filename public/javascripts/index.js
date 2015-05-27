var site = window.location.pathname;

$(document).ready(function() {

	if(site == '/editprofile') {
		
		$('input[name="avatar"]').on('change', function (e) {
			var allowedext = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
			var file = e.target.files[0];
			if (allowedext.indexOf(file.type) == -1) {
				$('.file_input_status[data-id="avatar"]').html('Allowed avatar image extensions: jpg, png, gif!');
				$('input[name="editprofile_save"]').attr('disabled', 'disabled');
			}
			else {
				$('.file_input_status[data-id="avatar"]').html('');
				$('input[name="editprofile_save"]').removeAttr('disabled');
			}
			//var file = $(this);
			//var formData = new FormData();
			//formData.append("userfile", that.files[0]);
			
		});

	}
	
});