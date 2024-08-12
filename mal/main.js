$(document).ready(function(){
	const API_KEY = 'SECRETKEY';
	const API_BASE_URL = 'https://example.com/';
	var API_AVAILABILITY = API_BASE_URL+'/path';
	const LOADING_URL = 'https://example.com/loading.svg';
	var LOADING_IMG = '<img src="'+LOADING_URL+'" style="width: 12px;">';
	const BASE_URL = 'https://myanimelist.net';
	var PEOPLE_BASE_URL = BASE_URL+'/people';
	var PEOPLE_URL_PREFIX = PEOPLE_BASE_URL+'/';
	const peopleClass = 'oo_people';
	var list = [];
	var qList = [];
	var idList = [];
	$('a').each(function(){
		var href = $(this).attr('href');
		if (href !== undefined) {
			var name = $(this).html();
			if (href.startsWith(PEOPLE_URL_PREFIX) && !name.includes('<')) {
				var nameExp = name.split(', ');
				var nameFormat = name;
				if (nameExp.length == 2) {
					nameFormat = nameExp[1]+' '+nameExp[0];
				}
				$(this).html(nameFormat+' '+LOADING_IMG);
				$(this).addClass('oo '+peopleClass);
				const nameCopy = '<span style="cursor: pointer" onclick="copyTextToClipboard(\''+nameFormat+'\');" title="Copy Name">copy</span>';
				var tools = '['+nameCopy+']';
				var str = href.replace(PEOPLE_URL_PREFIX, '');
				var exp = str.split('/');
				if (exp.length > 1) {
					$(this).attr('data-id', exp[0]);
					const malIDTag = 'mal:'+exp[0];
					const malIDCopy = '<span style="cursor: pointer" onclick="copyTextToClipboard(\''+malIDTag+'\');" title="Copy ID">copy</span>';
					tools += '<div class="oo_mal_id">['+malIDTag+']['+malIDCopy+']</div>';
				}
				$(this).after(tools);

				if (!list.includes(href)) {
					list.push(href);
					qList.push(name.replace(',', ''));
					if (exp.length > 1) {
						idList.push(exp[0]);
					}
				}
			}
		}
	});
	$('.h3_character_name, .h3_characters_voice_actors > a').each(function(){
		var ori = $(this).html();
		var nameFormat = ori;
		var exp = ori.split(', ');
		if (exp.length == 2) {
			var format = exp[1]+' '+exp[0];
			nameFormat = format;
			$(this).html(format);
		}
		const nameCopy = '<span style="cursor: pointer" onclick="copyTextToClipboard(\''+nameFormat+'\');" title="Copy Nama">cp</span>';
		if($(this).hasClass('h3_character_name')){
			$(this).parent().after('['+nameCopy+']');
		}else{
			$(this).after('['+nameCopy+']');
		}
	});
	if (list.length > 0) {
		$.ajax({
			url: API_AVAILABILITY,
			type: 'POST',
			data: {OO_API_CLIENT_KEY: API_KEY, url: list, q: qList},
			success: function(result){
				try{
					$('.'+peopleClass).each(function(){
						var href = $(this).attr('href');
						var data = map_val(result, ['data', href]);
						var name = $(this).html();
						name = name.replace(' '+LOADING_IMG, '');
						$(this).html(name);
						if (data != null) {
							$(this).attr('title', 'Total = '+data['total']);
							if (data['total'] > 0) {
								$(this).css('color', 'green');
							}else{
								$(this).css('color', 'red');
							}
						}else{
							$(this).css('color', 'red');
						}
					});
				}catch(err){
					console.log(err);
				}
			},
			error: function(result){
			}
		});
	}

	function map_val(data=null, key=null){
		var result = data;
		if ((data != null) && (key != null)) {
			if (typeof key === 'object') {
				var i;
				for (i = 0; i < key.length; i++) {
					var v = key[i];
					if (result.hasOwnProperty(v)) {
						var tmp = result[v];
						result = tmp;
					}else{
						result = null;
						break;
					}
				}
			}else{
				if (data.hasOwnProperty(key)) {
					result = data[key];
				}else{
					result = null;
				}
			}
		}

		return result;
	}
});

function copyTextToClipboard(text) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text).then(function() {
		console.log('Async: Copying to clipboard was successful!');
	}, function(err) {
		console.error('Async: Could not copy text: ', err);
		alert('Could not copy text');
	});
}

function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;

	// Avoid scrolling to bottom
	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
		alert('Could not copy text');
	}

	document.body.removeChild(textArea);
}
