env = new Env({}, global_env);
var input_str = "";

/* REPL */
$(function() {
	var jqconsole = $('#cons').jqconsole('Here is a little lisp interpreter I coded in about 100 lines of javascript.\n' +
						'The interpreter supports function invocation, lambdas, lets, ifs, numbers, strings, a few library functions, and lists\n' +
						'There is currently no support for multiline programs, but as a fix, you can append a comment to each line to continue the program.\n' +
						'Type \'sample\' for some simple and more complex test commands.\n', '> ');
	jqconsole.SetPromptLabel('> ');
	var startPrompt = function () {
		jqconsole.Prompt(true, function (input) {
			if(input == 'clear') {
				jqconsole.Clear();
			} else if (input == 'sample') { // print sample output
				for (var i = 0; i < tests.length; i++) {
					jqconsole.Write('> ' + tests[i] + '\n','jqconsole-input',false);
			    	jqconsole.Write(to_string(evaluate(parse(tests[i]), env)) + '\n','jqconsole-output',false);
				}
			} else { /* lisp expression */
				if (input.match(/,$/)) {
					jqconsole.SetPromptLabel('');
					input = input.substring(0, input.trim().length - 1);
					input_str = input_str.concat(input + " ");
				} else {
					jqconsole.SetPromptLabel('> ');
					input_str = input_str.concat(input);
					jqconsole.Write(to_string(evaluate(parse(input_str.toLowerCase()), env)) + '\n','jqconsole-output',false);
					input_str = "";
				}
			}
			startPrompt();
		});
	};
	startPrompt();
});

