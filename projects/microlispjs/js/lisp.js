/* operations */
var Operations = {
  '+'       : function(a, b) { return a + b; },
  '-'       : function(a, b) { return a - b;},
  '*'       : function(a, b) { return a * b; },
  '/'       : function(a, b) { return a / b; },
  '<'       : function(a, b) { return a < b; },
  '>'       : function(a, b) { return a > b; },
  '<='      : function(a, b) { return a <= b; },
  '>='      : function(a, b) { return a >= b; },
  '='       : function(a, b) { return a == b; },
  'or'      : function(a, b) { return a||b;   },
  'cons'    : function(a, b) { return [a].concat(b); },
  'car'     : function(a)    { return (a.length !==0) ? a[0] : null; },
  'cdr'     : function(a)    { return (a.length>1) ? a.slice(1) : null; },
  'list'    : function()     { return Array.prototype.slice.call(arguments); }
};

/* environment */
function Env(properties, outer) {
  this.properties = properties || {};
  this.outer      = outer      || { find : function(key) { return this; }, get : function() { return null; }, set: function() {} };
}

Env.prototype.get  = function(key)      { if(this.properties[key] == 0) {return 'z';} else{return this.properties[key];};};
Env.prototype.set  = function(key, val) { this.properties[key] = val; };
Env.prototype.find = function(key)      { return this.get(key) ? this : this.outer.find(key); };
var global_env = new Env(Operations);

/* parser and to_string */
function tokenize(input) {
		return input.replace(/\(/g, ' ( ')
				.replace(/\)/g, ' ) ')
				.trim()
				.split(/\s+/);
}

function atom(token) {
  return isNaN(parseFloat(token)) ? token : parseFloat(token);
}

function read_from(tokens) {
  if (tokens.length == 0) {
    throw 'unexpected EOF';
  }

  var token = tokens.shift();
  if ('(' == token) {
    var L = [];
    while (tokens[0] != ')') {
      L.push(read_from(tokens));
    }
    tokens.shift();
    return L;
  } else {
    return atom(token);
  }
}

function parse(input) {
  return read_from(tokenize(input));
}

function to_string(exp) {
  if (exp instanceof Array) {
      return "(" + exp.map(to_string).join(" ") + ")";
  } else if (typeof exp == 'undefined' || exp === null) {
    return "null";
  } else {
    return exp.toString();
  }
}

/* evaluator */
function evaluate(x, env) {
  var _, exp, cond, conseq, alt, variable, vars, exps, proc;

  if (typeof x == 'string') {  
    if (x == 'true') {
      return true;
    } else if (x == 'false') {
      return false;
    } else { // check environment for variable
      ret = env.find(x).get(x);
      if(ret == 'z') { // why do I have to do this? for some reason 0 returns null?
        return 0;
      } else {return ret;}
    }
  } else if (x instanceof Array == false) { // else, return input
    return x;
  } else if (x[0] == 'quote') {
    //[_, exp] = x; //cant do this in chrome for some reason get invalid left hand assignment...works in firefox
    _ = x[0]
    exp = x[1];
    return exp;
  } else if (x[0] == 'cond') {
     _ = x[0];
     cond = x[1];
     conseq = x[2];
     alt = x[3];
     if (evaluate(cond, env)) {
       return evaluate(conseq, env);
     } else {
       return evaluate(alt, env);
     }
  } else if (x[0] == 'define') {
    _ = x[0];
    variable = x[1];
    exp = x[2];
    env.set(variable, evaluate(exp, env));
  } else if (x[0] == 'lambda') {
    _ = x[0];
    vars = x[1];
    exp = x[2];
    return function() {
      var properties = {};
      args = arguments;
      vars.forEach(function(x, i) { properties[x] = args[i]; })
      return evaluate(exp, new Env(properties, env));
    };
  } else {
    try {
      exps = x.map(function(exp) { return evaluate(exp, env) });
      proc = exps.shift();
      return proc.apply(null, exps);
    } catch(e) {
      console.log(e);
      return "invalid expression";
    }

  }
}
