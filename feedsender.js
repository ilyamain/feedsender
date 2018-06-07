// Simple multifunctional feedback form
function opinion (selector) 
{
	var defaults = 
	{
		form_class: 'opinion-form', 
		icon: 'field-icon', 
		caption_class: 'opinion-field-caption', 
		field_type: 'text', 
		field_class: 'form-field opinion-field', 
		field_required_class: 'required-field', 
		field_placeholder: '', 
		field_unfilled: 'unfilled-field', 
		btn_block_name: 'buttons-block', 
		btn_block_class: 'form-buttons buttons-block opinion-buttons', 
		btn_sender: true, 
		btn_sender_class: 'button-send button-style', 
		btn_sender_text: 'Send', 
		btn_cancel: true, 
		btn_cancel_class: 'button-cancel button-style', 
		btn_cancel_text: 'Cancel', 
		message_file: '/sendmail.php', 
		message_type: 'POST', 
		error_class: 'form-error', 
		error_text: 'Fill necessary fields please', 
	};
	var goal = $(selector);
	var items = new Array();
	var errors;
	var buttons_block;
	var output = 
	{
		// Update form defaults
		options: function (options) 
		{
			for (var i in defaults) if (!undef(options[i])) defaults[i] = options[i];
			return output;
		}, 
		// Create new form on empty goal
		create: function (fields) 
		{
			var card = $('<form>');
			card.addClass(defaults.form_class);
			card.html('');
			// fill fields block
			items = [];
			for (var i in fields) 
			{
				var item = construct_field(fields[i]);
				items.push(item);
			};
			for (var i in items) card.append(items[i].dom);
			// fill errors block
			errors = $('<div class="' + defaults.error_class + '">');
			card.append(errors);
			// fill buttons block
			buttons_block = construct_buttons();
			card.append(buttons_block.dom);
			goal.append(card);
			return output;
		}, 
		// Reading exist forms
		read: function () 
		{
			// Fields reading
			var common_field_class = '.' + defaults.field_class.split(' ')[0];
			var fields = goal.find(common_field_class);
			items = [];
			fields.map(function (k, field) 
			{
				// class, caption & requirement definition
				var item = {};
				item.class_name = $($(field).attr('class').split(' ')).not(defaults.field_class.split(' ')).get();
				item.required = (item.class_name.includes(defaults.field_required_class)) ? true : false;
				item.class_name = $(item.class_name).not(defaults.field_required_class.split(' ')).get().join(' ');
				// name, caption, type, icon and hold definition
				var input = $(field).find('input, select, textarea');
				item.name = input.attr('name');
				item.caption = $(field).find('.' + defaults.caption_class).html();
				item.type = 'text';
				if (input.is('[type="hidden"]')) item.type = 'hidden';
				if (input.is('[type="file"]')) item.type = 'file';
				if (input.is('[type="radio"]')) item.type = 'radio';
				if (input.is('[type="checkbox"]')) item.type = 'checkbox';
				if (input.is('select')) item.type = 'select';
				if (input.is('textarea')) item.type = 'textarea';
				switch (item.type) 
				{
					case 'hidden': 
						item.icon = $(field).find('span').attr('class');
						item.hold = input.val();
						break;
					case 'text': 
						item.icon = $(field).find('span').attr('class');
						item.hold = input.attr('placeholder');
						break;
					case 'radio': 
						item.icon = $(field).find('label').attr('class');
						item.hold = [];
						$(field).find('label').map(function (i, label) 
						{
							var holder = $(label).html();
							var label_goal = $(field).find('input[id="' + $(label).attr('for') + '"]');
							if (label_goal.prop('disabled')) holder += '{disabled}';
							if (label_goal.prop('checked')) holder += '{selected}';
							item.hold.push(holder);
						});
						break;
					case 'select': 
						item.icon = $(field).find('span').attr('class');
						item.hold = [];
						$(field).find('option').map(function (i, opt) 
						{
							var holder = $(opt).html();
							if ($(opt).prop('disabled')) holder += '{disabled}';
							if ($(opt).prop('selected')) holder += '{selected}';
							item.hold.push(holder);
						});
						break;
					case 'checkbox': 
						item.icon = $(field).find('label').attr('class');
						item.hold = [];
						$(field).find('label').map(function (i, label) 
						{
							var holder = $(label).html();
							var label_goal = $(field).find('input[id="' + $(label).attr('for') + '"]');
							if (label_goal.prop('disabled')) holder += '{disabled}';
							if (label_goal.prop('checked')) holder += '{selected}';
							item.hold.push(holder);
						});
						break;
					case 'textarea': 
						item.icon = $(field).find('span').attr('class');
						item.hold = input.attr('placeholder');
						break;
					case 'file': 
						$(field).find('a').on('click', function () {$(field).find('input').click();});
						$(field).find('input').on('change', function () 
						{
							var count = this.files.length;
							$(field).find('a').find('i').remove();
							if (count >= 2) count += ' files';
							if (count === 1) count += ' file';
							if (!missed(count)) $(field).find('a').append('<i> (' + count + ')</i>');
						});
						item.icon = $(field).find('a').attr('class');
						item.hold = $(field).find('a').html();
						if ($(field).find('input').prop('multiple')) item.hold += '{multiple}';
						break;
					default: 
						item.icon = '';
						item.hold = '';
						break;
				};
				item.dom = $(field);
				items.push(item);
			});
			// Errors block reading
			errors = goal.find('.' + defaults.error_class);
			// Buttons reading
			var common_buttons_class = '.' + defaults.btn_block_class.split(' ')[0];
			buttons_block = {};
			buttons_block.dom = goal.find(common_buttons_class);
			if (defaults.btn_sender) $(buttons_block.dom.find('.' + defaults.btn_sender_class.split(' ')[0])).on('click', form_send);
			if (defaults.btn_cancel) $(buttons_block.dom.find('.' + defaults.btn_cancel_class.split(' ')[0])).on('click', formclose);
			buttons_block.class_name = buttons_block.dom.attr('class');
			buttons_block.name = defaults.btn_block_name;
			return output;
		}, 
	};
	return output;

	// Create fields for your form
	function construct_field (a) 
	{
		var result = {};
		var field_options = {}; // type, name, hold, class_name, required, 
		if (typeof a === 'string') 
		{
			field_options.icon = defaults.icon
			field_options.type = defaults.field_type;
			field_options.name = a;
			field_options.hold = '';
			field_options.caption = '';
			field_options.required = false;
			field_options.class_name = defaults.field_class;
		}
		else 
		{
			field_options.icon = (!missed(a.icon)) ? a.icon : defaults.icon;
			field_options.type = (!missed(a.type)) ? a.type : defaults.field_type;
			field_options.name = (!missed(a.name)) ? a.name : abra(5);
			field_options.hold = (!missed(a.hold)) ? a.hold : defaults.field_placeholder;
			field_options.caption = (!missed(a.caption)) ? a.caption : '';
			field_options.required = (!missed(a.required)) ? a.required : false;
			field_options.class_name = defaults.field_class.split(' ');
			if (!missed(a.class_name)) 
			{
				a.class_name = a.class_name.split(' ');
				for (var i in a.class_name) field_options.class_name.push(a.class_name[i]);
			};
		};
		var dom;
		switch (field_options.type) 
		{
			case 'hidden': 
				dom = $('<div>');
				var icon = $('<span class="' + field_options.icon + '">');
				var input = $('<input>');
				input.attr('type', field_options.type);
				input.attr('name', field_options.name);
				input.val(field_options.hold);
				dom.append(icon);
				dom.append(input);
				if (!missed(field_options.caption)) 
				{
					var caption = $('<div class="' + defaults.caption_class + '">');
					caption.html(field_options.caption);
					dom.prepend(caption);
				};
				break;
			case 'text': 
				dom = $('<div>');
				var icon = $('<span class="' + field_options.icon + '">');
				var input = $('<input>');
				input.attr('type', field_options.type);
				input.attr('name', field_options.name);
				input.attr('placeholder', field_options.hold);
				dom.append(icon);
				dom.append(input);
				if (!missed(field_options.caption)) 
				{
					var caption = $('<div class="' + defaults.caption_class + '">');
					caption.html(field_options.caption);
					dom.prepend(caption);
				};
				break;
			case 'radio': 
				dom = $('<div>');
				if (typeof field_options.hold === 'string') field_options.hold = field_options.hold.split('; ');
				for (var i in field_options.hold) 
				{
					var input_id = field_options.name + '_' + i;
					var input = $('<input>');
					input.attr('type', field_options.type);
					input.attr('name', field_options.name);
					input.attr('id', input_id);
					if (field_options.hold[i].indexOf('{disabled}') !== -1) input.prop('disabled', true);
					if (field_options.hold[i].indexOf('{selected}') !== -1) input.prop('checked', true);
					var label = $('<label class="' + field_options.icon + '">');
					label.attr('for', input_id);
					label.html(field_options.hold[i].replace('{disabled}','').replace('{selected}',''));
					input.val(label.html());
					dom.append(input);
					dom.append(label);
				};
				if (!missed(field_options.caption)) 
				{
					var caption = $('<div class="' + defaults.caption_class + '">');
					caption.html(field_options.caption);
					dom.prepend(caption);
				};
				break;
			case 'select': 
				dom = $('<div>');
				var icon = $('<span class="' + field_options.icon + '">');
				var selector = $('<select>');
				selector.attr('name', field_options.name);
				if (typeof field_options.hold === 'string') field_options.hold = field_options.hold.split('; ');
				for (var i in field_options.hold) 
				{
					var opt = $('<option>');
					if (field_options.hold[i].indexOf('{disabled}') !== -1) opt.prop('disabled', true);
					if (field_options.hold[i].indexOf('{selected}') !== -1) opt.prop('selected', true);
					opt.html(field_options.hold[i].replace('{disabled}','').replace('{selected}',''));
					selector.append(opt);
				};
				dom.append(icon);
				dom.append(selector);
				if (!missed(field_options.caption)) 
				{
					var caption = $('<div class="' + defaults.caption_class + '">');
					caption.html(field_options.caption);
					dom.prepend(caption);
				};
				break;
			case 'checkbox': 
				dom = $('<div>');
				if (typeof field_options.hold === 'string') field_options.hold = field_options.hold.split('; ');
				for (var i in field_options.hold) 
				{
					var input_id = field_options.name + '_' + i;
					var input = $('<input>');
					input.attr('type', field_options.type);
					input.attr('name', field_options.name);
					input.attr('id', input_id);
					if (field_options.hold[i].indexOf('{disabled}') !== -1) input.prop('disabled', true);
					if (field_options.hold[i].indexOf('{selected}') !== -1) input.prop('checked', true);
					var label = $('<label class="' + field_options.icon + '">');
					label.attr('for', input_id);
					label.html(field_options.hold[i].replace('{disabled}','').replace('{selected}',''));
					input.val(label.html());
					dom.append(input);
					dom.append(label);
				};
				if (!missed(field_options.caption)) 
				{
					var caption = $('<div class="' + defaults.caption_class + '">');
					caption.html(field_options.caption);
					dom.prepend(caption);
				};
				break;
			case 'textarea': 
				dom = $('<div>');
				var icon = $('<span class="' + field_options.icon + '">');
				var input = $('<textarea>');
				input.attr('type', field_options.type);
				input.attr('name', field_options.name);
				input.attr('placeholder', field_options.hold);
				dom.append(icon);
				dom.append(input);
				if (!missed(field_options.caption)) 
				{
					var caption = $('<div class="' + defaults.caption_class + '">');
					caption.html(field_options.caption);
					dom.prepend(caption);
				};
				break;
			case 'file': 
				dom = $('<div>');
				var styled_button = $('<a class="' + field_options.icon + '">');
				var input = $('<input>');
				input.attr('type', field_options.type);
				input.attr('name', field_options.name);
				if (field_options.hold.indexOf('{multiple}') !== -1) input.prop('multiple', true);
				styled_button.html(field_options.hold.replace('{multiple}',''));
				$(styled_button).on('click', function () {input.click();});
				input.on('change', function () 
				{
					var count = this.files.length;
					styled_button.find('i').remove();
					if (count >= 2) count += ' files';
					if (count === 1) count += ' file';
					if (!missed(count)) styled_button.append('<i> (' + count + ')</i>');
				});
				dom.append(styled_button);
				dom.append(input);
				if (!missed(field_options.caption)) 
				{
					var caption = $('<div class="' + defaults.caption_class + '">');
					caption.html(field_options.caption);
					dom.prepend(caption);
				};
				break;
			default: 
				dom = $('<div>');
				var icon = $('<span class="' + field_options.icon + '">');
				var input = $('<input>');
				input.attr('type', field_options.type);
				input.attr('name', field_options.name);
				input.attr('placeholder', field_options.hold);
				dom.append(icon);
				dom.append(input);
				if (!missed(field_options.caption)) 
				{
					var caption = $('<div class="' + defaults.caption_class + '">');
					caption.html(field_options.caption);
					dom.prepend(caption);
				};
				break;
		};
		var class_name = field_options.class_name.join(' ');
		dom.addClass(class_name);
		if (field_options.required) dom.addClass(defaults.field_required_class);
		result.dom = dom;
		result.icon = field_options.icon;
		result.caption = field_options.caption;
		result.type = field_options.type;
		result.name = field_options.name;
		result.hold = field_options.hold;
		result.required = field_options.required;
		result.class_name = field_options.class_name;
		return result;
	}

	// Create buttons block
	function construct_buttons () 
	{
		var result = {};
		var dom = $('<div class="' + defaults.btn_block_class + '">');
		var sender = $('<a>');
		var cancel = $('<a>');
		if (defaults.btn_sender) 
		{
			sender.addClass(defaults.btn_sender_class);
			sender.html(defaults.btn_sender_text);
			$(sender).on('click', form_send);
			dom.append(sender);
		}
		if (defaults.btn_cancel) 
		{
			cancel.addClass(defaults.btn_cancel_class);
			cancel.html(defaults.btn_cancel_text);
			$(cancel).on('click', formclose);
			dom.append(cancel);
		}
		result.dom = dom;
		result.class_name = defaults.btn_block_class;
		result.name = defaults.btn_block_name;
		return result;
	}

	// Closing form (processing simplified)
	function formclose () 
	{
		goal.html('');
	}

	// Sending filled form 
	function form_send () 
	{
		var unfilled_items = false;
		var sending_data = new FormData();
		items.map(function (item) 
		{
			var field = {};
			field.caption = item.caption;
			switch (item.type) 
			{
				case 'hidden': 
					var input = $(item.dom).find('input');
					field.name = input.attr('name');
					field.value = input.val();
					break;
				case 'text': 
					var input = $(item.dom).find('input');
					field.name = input.attr('name');
					field.value = input.val();
					break;
				case 'radio': 
					var input = $(item.dom).find('input:checked');
					field.name = input.attr('name');
					field.value = input.val();
					break;
				case 'select': 
					var input = $(item.dom).find('select');
					field.name = input.attr('name');
					field.value = input.val();
					break;
				case 'checkbox': 
					var input = $(item.dom).find('input');
					var field_value = [];
					$.each(input, function (k, value) 
					{
						if ($(this).prop('checked')) field_value.push($(this).val());
					});
					field.name = input.attr('name');
					field.value = field_value.join('; ');
					break;
				case 'textarea': 
					var input = $(item.dom).find('textarea');
					field.name = input.attr('name');
					field.value = input.val();
					break;
				case 'file': 
					field.name = $(item.dom).find('input').attr('name');
					$.each($(item.dom).find('input'), function (j, input) 
					{
						if (!missed(input)) $.each(input.files, function (k, value) 
						{
							sending_data.append(field.name + '[]', value);
						});
					});
					break;
				default: 
					break;
			};
			error_exclude();
			if (item.required) error_test(field.value, item.dom);
			field.type = item.type;
			sending_data.append(field.name, JSON.stringify(field));
		});
		if (!unfilled_items) 
		{
			$.ajax 
			({
				url: defaults.message_file, 
				type: defaults.message_type, 
				data: sending_data, 
				cache: false, 
				dataType: 'html', 
				processData: false, 
				contentType: false, 
				success: function (result) 
				{
					$('pre').html(result);
				}, 
				error: function (result) 
				{
					$('pre').html(result);
				}, 
			});
		}

		function error_exclude () 
		{
			errors.removeClass(defaults.field_unfilled);
			errors.html('');
		}

		function error_test (value, dom) 
		{
			if (missed(value)) 
			{
				$(dom).addClass(defaults.field_unfilled);
				errors.addClass(defaults.field_unfilled);
				errors.html(defaults.error_text);
				unfilled_items = true;
			}
			else 
			{
				$(dom).removeClass(defaults.field_unfilled);
			}
		}
	};

	// Simple test for undefined values
	function undef (a) 
	{
		if (a == undefined) return true;
		if (a == null) return true;
		if ((a instanceof Array)&&(a.length == 0)) return true;
		return false;
	}

	// Simple test for empty values
	function missed (a) 
	{
		if (a == undefined) return true;
		if (a == null) return true;
		if (a == false) return true;
		if (a == 'none') return true;
		if (a == '') return true;
		if (a == '0') return true;
		if (a == 0) return true;
		if ((a instanceof Array)&&(a.length == 0)) return true;
		return false;
	}

	// Random word generator
	function abra (lgth) 
	{
		let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		if (is_empty(lgth)) lgth = 10;
		while (result.length < lgth) result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
		return result;
	}
}