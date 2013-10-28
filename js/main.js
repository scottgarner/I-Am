"use strict";

var delay = 400;

var stateIndex = 0;
var states = [];
var characters = "abcdefghijklmnopqurstuvwxyz ";
var url = "http://google.com/complete/search?output=firefox&q=";


$(document).ready( function() {

	characters = characters.split("").sort( function() { return Math.random() - 0.5 } );

	$("#return").click(function() {
		$("#info").slideUp();	
		$("#search").slideDown();
	});

	$("#about").click(function() {
		$("#info").slideDown();	
		$("#search").slideUp();
	});	

	$("#actualize").click(function() {
		getSuggestion("i am ");		

		$("#suggestions").show();
		$("#actualize").hide();

		states = [];
		stateIndex = 0;
	});

});

function getSuggestion(query) {

	if(!states[stateIndex]) {

		states[stateIndex] = {
			letterIndex: Math.floor(Math.random()*characters.length),
			attempts: 1
		}

	} else {
		states[stateIndex].letterIndex = (states[stateIndex].letterIndex + 1) % characters.length;
		states[stateIndex].attempts++;

		if (states[stateIndex].attempts > characters.length) {
			delete states[stateIndex];
			stateIndex--;

			setTimeout( function() {
				getSuggestion(query.slice(0,-1));
			}, delay);

			return;
		}
	}

	$("#query").html(query + characters[states[stateIndex].letterIndex]);
	var queryURL = url + encodeURIComponent(query + characters[states[stateIndex].letterIndex]);

	$.ajax(
		{
			url: queryURL,
			dataType: "jsonp",
			complete: function(data) {
				
				var searchQuery = data.responseJSON[0];
				var suggestions = data.responseJSON[1];

				$("#suggestions").html("");
				var validSuggestions = [];				
				$(suggestions).each( function(key,value) {
					if (value.indexOf(searchQuery) == 0 && value.length >= 11) {
						validSuggestions.push(value);
						$("#suggestions").append($("<div/>").html(value));
					}
				});

				if (validSuggestions.length == 1) {
				
					$("#query").html(validSuggestions[0]);
					$("#suggestions").hide();
					$("#actualize").show();
				
				} else if (validSuggestions.length == 0) {
				
					$("#suggestions").html("No suggestions");
					setTimeout( function() {
						getSuggestion(searchQuery.slice(0,-1));
					}, delay);
				
				}  else {

					var longestSuggestion = validSuggestions[0];

					while (longestSuggestion.length > searchQuery.length) {

						var common = true;
						for (var j = 1; j < validSuggestions.length; j++) {

							if (validSuggestions[j].indexOf(longestSuggestion) == -1) {
								common = false;
								break;
							}

						}

						if (common) {
							break;
						} else {
							longestSuggestion = longestSuggestion.slice(0,-1);
						}
					}

					stateIndex++;
					setTimeout( function() {
						getSuggestion(longestSuggestion);
					}, delay);
				}

			}
		});
} 

