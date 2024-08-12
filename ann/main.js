jQuery(document).ready(function(){
	const API_KEY = 'SECRETKEY';
	const API_BASE_URL = 'https://example.com/';
	var API_AVAILABILITY = API_BASE_URL+'/path';
	const LOADING_URL = 'https://example.com/loading.svg';
	var LOADING_IMG = '<img src="'+LOADING_URL+'" style="width: 12px;" class="kskddisable">';
	const PEOPLE_URL_PREFIX = '/encyclopedia/people.php?id=';
	const peopleClass = 'oo_people';
	var list = [];
	var qList = [];
	var idList = [];
	jQuery('a').each(function(){
		var href = jQuery(this).attr('href');
		if (href !== undefined) {
			var name = jQuery(this).html();
			if (href.startsWith(PEOPLE_URL_PREFIX) && !name.includes('<')) {
				jQuery(this).html(name+' '+LOADING_IMG);
				jQuery(this).addClass('oo '+peopleClass);
				var id = href.replace(PEOPLE_URL_PREFIX, '');

				const nameCopy = '<span style="cursor: pointer" onclick="copyTextToClipboard(\''+name+'\');" title="Copy Name">copy name</span>';
				var tools = '<span style="background-color: yellow;">(['+nameCopy+']';

				if (!list.includes(href) && (id != '')) {
					jQuery(this).attr('data-id', id);
					list.push(href);
					qList.push(romaji(name));
					idList.push(id);

					const annIDTag = 'ann:'+id;
					const annIDCopy = '<span style="cursor: pointer" onclick="copyTextToClipboard(\''+annIDTag+'\');" title="Copy ID">copy</span>';
					tools += ' - <span class="oo_ann_id">'+annIDTag+'['+annIDCopy+']</span>';
				}
				tools += ')</span>';
				jQuery(this).after(tools);
			}
		}
	});
	if (list.length > 0) {
		var ajax = {};
		ajax.x = function () {
		    if (typeof XMLHttpRequest !== 'undefined') {
		        return new XMLHttpRequest();
		    }
		    var versions = [
		        "MSXML2.XmlHttp.6.0",
		        "MSXML2.XmlHttp.5.0",
		        "MSXML2.XmlHttp.4.0",
		        "MSXML2.XmlHttp.3.0",
		        "MSXML2.XmlHttp.2.0",
		        "Microsoft.XmlHttp"
		    ];

		    var xhr;
		    for (var i = 0; i < versions.length; i++) {
		        try {
		            xhr = new ActiveXObject(versions[i]);
		            break;
		        } catch (e) {
		        }
		    }
		    return xhr;
		};

		ajax.send = function (url, callback, method, data, async) {
		    if (async === undefined) {
		        async = true;
		    }
		    var x = ajax.x();
		    x.open(method, url, async);
		    x.onreadystatechange = function () {
		        if (x.readyState == 4) {
		            callback(x.responseText)
		        }
		    };
		    if (method == 'POST') {
		        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		    }
		    x.send(data)
		};

		ajax.post = function (url, data, callback, async) {
		    var query = [];
		    jQuery.each(data, function(k, v){
		    	if (Array.isArray(v)) {
		    		jQuery.each(v, function(k2, v2){
		    			query.push(k + '[]' + '=' + encodeURIComponent(v2));
		    		});
		    	}else{
		    		query.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
		    	}
		    });
		    ajax.send(url, callback, 'POST', query.join('&'), async)
		};

		ajax.post(API_AVAILABILITY, {OO_API_CLIENT_KEY: API_KEY, url: list, q: qList}, function(res) {
			try{
				var result = JSON.parse(res);
				jQuery('.'+peopleClass).each(function(){
					var href = jQuery(this).attr('href');
					var data = map_val(result, ['data', href]);
					var name = jQuery(this).html();
					name = name.replace(' '+LOADING_IMG, '');
					jQuery(this).html(name);
					if (data != null) {
						jQuery(this).attr('title', 'Total = '+data['total']);
						if (data['total'] > 0) {
							jQuery(this).attr('style', 'color: blue !important;');
						}else{
							jQuery(this).attr('style', 'color: red !important;');
						}
					}else{
						jQuery(this).attr('style', 'color: red !important;');
					}
				});
			}catch(err){
				console.log(err);
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

	function romaji(str){
		var result = str.replaceAll('ū', 'uu');
		result = result.replace('Ōno', 'Oono');
		result = result.replace('Ōnishi', 'Oonishi');
		result = result.replace('Ōzora', 'Ouzora');
		result = result.replace('Yō', 'You');
		result = result.replace('hō', 'hou');
		result = result.replace('rō', 'rou');
		result = result.replace("'", "");
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
