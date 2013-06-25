// $("h6.fittext").fitText("2");

$("body, p").typeset();

function debug_report(item) {
	 if(this.console){
    console.log(item);
  }
}

function get_location() {
	 if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(locate_success, locate_error);
  }
}

function locate_success(position) {
	debug_report(position);
}

function locate_error(msg) {
	debug_report(msg);
}

if(!Modernizr.svg) {
    $('img[src*="svg"]').attr('src', function () {
        return $(this).attr('src').replace('.svg', '.png');
    });
}

var retina = window.devicePixelRatio > 1;
if (retina) {
	$('img[src!="svg"]').attr('src', function () {
		return $(this).attr('src').replace(/\.(png|jpg|gif)+$/i, '@2x.$1');
	});
}

$("a").click(function(event) {
  event.preventDefault();
	var url = $(this).attr("href");
	if (url) {
		if (url.substr(0,1) == "#") {
			$.scrollTo($(url), 1000);
		} else {
			$(".container").fadeOut("fast").css("display: none");
			document.location.href=url;
		}
	} 
});

$(window).load( function() {
	$(".container").fadeIn().css("display: block");
	// get_location();
});

function ajaxRelatedJobTitleLookup() {
	var job_title = $("#job_title").val();
	var job_description = $("#job_description").val();
	var job_desired_skillsexperience = $("#job_desired_skillsexperience").val();
	var related_job_titles_result = $("#related_job_titles");
	$.ajax({
		url: file_root+'ajax/related_job_title_lookup/'+job_title+' '+job_description+' '+job_desired_skillsexperience,
		dataType: 'json',
		success: function(data) {
			related_job_titles_result.empty();
			related_job_titles_result.fadeIn("slow").css("display: block;");
			$.each(data, function(key, results) {
				// debug_report(results);
				$('<label for="related_jobs_'+key+'"><input type="checkbox" name="related_jobs['+results['Code']+']" value="'+results['Job Title']+'" id="related_jobs_'+key+'" style="display: none;"><span class="custom checkbox"></span> '+results['Job Title']+'</label>').appendTo(related_job_titles_result);
			});
		},
		error: function(msg) {
			related_job_titles_result.fadeOut("slow").css("display: none;");
			debug_report(msg);
		}
	});
}

function ajaxRebuildRegionsFromCountry(country_id, region_list, company_details) {
	debug_report(country_id);
	$(region_list).empty();
	$(region_list).next(".custom.dropdown").find("ul").empty();
	if (country_id) {
		$.ajax({
			url: file_root+'ajax/build_regions_from_country_id/'+country_id,
			dataType: 'json',
			success: function(data) {
				if (data) {
					var region_message = "Please select a region";
					$(region_list).append('<option value="">'+region_message+'</option>');
					$(region_list).next(".custom.dropdown").find(".current").html(region_message);
					$(region_list).next(".custom.dropdown").find("ul").append('<li>'+region_message+'</li>');
					$.each(data, function(key, results) {
						$(region_list).append('<option value="'+results['region_id']+'" class="dropdown_region_'+results['region_id']+'">'+results['region_name']+'</option>');
						$(region_list).next(".custom.dropdown").find("ul").append('<li>'+results['region_name']+'</li>');
					});
					$(region_list).find(".dropdown_region_"+company_details["sw_company_region_id"]).attr("selected", "selected");
					$(region_list).next(".custom.dropdown").find(".current").html($(region_list).find(".dropdown_region_"+company_details["sw_company_region_id"]).html());
					$(region_list).next(".custom.dropdown").find("li").filter( function() {
						if ($(this).context.innerHTML == $(region_list).next(".custom.dropdown").find(".current").html()) {
							$(this).addClass("selected");
						}
					});
				} else {
					var region_message = "No regions available";
					$(region_list).append('<option value="">'+region_message+'</option>');
					$(region_list).next(".custom.dropdown").find(".current").html(region_message);
					$(region_list).next(".custom.dropdown").find("ul").append('<li>'+region_message+'</li>');
				}
			},
			error: function(msg) {
				debug_report(msg);
				var region_message = "No regions available";
				$(region_list).append('<option value="">'+region_message+'</option>');
				$(region_list).next(".custom.dropdown").find(".current").html(region_message);
				$(region_list).next(".custom.dropdown").find("ul").append('<li>'+region_message+'</li>');
			}
		});
	} else {
		var region_message = "Please select a Country, then a Region";
		$(region_list).append('<option value="">'+region_message+'</option>');
		$(region_list).next(".custom.dropdown").find(".current").html(region_message);
		$(region_list).next(".custom.dropdown").find("ul").append('<li>'+region_message+'</li>');
	}
}

function companyDetailsForJob(company_id, full_companies) {
	var company_details = full_companies[company_id];
	
	if (company_details['sw_company_description'] == null || company_details['sw_company_description'] == "") {
		company_details['sw_company_description'] = '<em>No company description is available. Would you like to <a href="">add a description</a>?</em>';
	}
	
	// Assign variables
	var company_description = $("#company_description");
	var job_location_street = $("#job_location_street");
	var job_location_city = $("#job_location_city");
	var job_location_postal = $("#job_location_postal");
	var job_location_url = $("#job_location_url");
	var job_location_country = $("#job_location_country_id");
	var job_location_region = $("#job_location_region_id")
	
	// Clear out the defaults
	company_description.empty();
	
	// Write in new values
	$(company_details["sw_company_description"]).appendTo(company_description);
	$(job_location_street).val(company_details["sw_company_address"]);
	$(job_location_city).val(company_details["sw_company_city"]);
	$(job_location_postal).val(company_details["sw_company_postcode"]);
	$(job_location_url).val(company_details["sw_company_website"]);
	
	// Update Country Dropdown
	$(job_location_country).find(".dropdown_country_"+company_details["sw_company_country_id"]).attr("selected", "selected");
	$(job_location_country).next(".custom.dropdown").find(".current").html($(job_location_country).find(".dropdown_country_"+company_details["sw_company_country_id"]).html());
	$(job_location_country).next(".custom.dropdown").find("li").filter( function() {
		if ($(this).context.innerHTML == $(job_location_country).next(".custom.dropdown").find(".current").html()) {
			$(this).addClass("selected");
		} else {
			$(this).removeClass("selected");
		}
	});
	
	// Rebuild Region Selection
	ajaxRebuildRegionsFromCountry(company_details["sw_company_country_id"], job_location_region, company_details);	
}

function resetDropdowns(input) {
	$(input).each(function() { this.reset(); });
	var dropdowns = $(input).find("select");
	$.each(dropdowns, function(index, dropdown) {
		var default_selection = $(dropdown).find("option").filter(":selected");
		$(dropdown).next(".custom.dropdown").find(".current").html($(default_selection).html());
		debug_report($(dropdown).next(".custom.dropdown").find(".current").html());
		$(dropdown).next(".custom.dropdown").find("li").filter( function() {
			if ($(this).context.innerHTML == $(default_selection).html()) {
				$(this).addClass("selected");
			} else {
				$(this).removeClass("selected");
			}
		});		
	});
}

function ajaxSearch(srch, limitby) {
	if (limitby) {
		$.ajax({
			url: file_root+'ajax/search/'+limitby+'/'+srch,
			dataType: 'json',
			success: function(data) {
				debug_report(data);
			},
			error: function(msg) {
				$("#ajax_search_result").slideUp().css("display: none;");
				debug_report(msg);
			}
		});
	} else {
		$.ajax({
			url: file_root+'ajax/search/'+srch,
			dataType: 'json',
			success: function(data) {
				var ajax_search_result = $("#ajax_search_result");
				var results_list = new Array();
				if (data) {
					debug_report(data);
					ajax_search_result.empty();
					ajax_search_result.slideDown().css("display: block;");
					$.each(data, function(category, results) {
						results_list[category] = $('<ul id="'+category+'" class="ajax_search_result_key side-nav"></ul>');
						results_list[category].appendTo(ajax_search_result);
						$('<li>'+category+'</li>').appendTo(results_list[category]);
						$('<li class="divider"></li>').appendTo(results_list[category]);
						$.each(results, function(key, job) {
							// items.push('<li id="' + key + '">' + val + '</li>');
							$('<li id="result-'+key+'" class="ajax_search_result"><a href="'+file_root+job['Action']+'">'+job['Title']+'</a></li>').appendTo(results_list[category]);
						});
					});
				} else {
					ajax_search_result.slideUp().css("display: none;");
				}
			},
			error: function(msg) {
				$("#ajax_search_result").slideUp().css("display: none;");
				debug_report(msg);
			}
		});
	}
}