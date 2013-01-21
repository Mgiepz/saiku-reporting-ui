(function(window) {

var Phomp = function() {
};

Phomp.formulaToJs = function(str) {
  //see: https://www.oasis-open.org/committees/download.php/16826/openformula-spec-20060221.html#Expression_Syntax

  //Tokenizer
  //         1    23          4      5          6                    7 8            9                       10       11       12     13                     14  15       16       17   18  19
  var re = /(\s+)|((\.[0-9]+)|([0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?))|("([^"]|"")*")|([A-Za-z][A-Za-z0-9_]*)|([\(\)])|([\[\]])|([;,])|(==|!=|<>|<=|>=|<|>|=)|(&)|([\+\-])|([\*\/])|(\^)|(%)|([\.:])/g;
  var types = [
    null,
    "whitespace",
    "number", null, null, null, null,
    "string", null,
    "identifier",
    "op_paren",
    "op_brace",
    "op_separator",
    "op_comparison",
    "op_concat",
    "op_plusmin",
    "op_muldiv",
    "op_power",
    "op_postfix",
    "op_dot"
  ];
  var match, text, type, token, prev, last, i, n = types.length;
  var first = prev = {
    type: "op_paren",
    text: "(",
    precedence: 10
  };
  while (match = re.exec(str)) {
    for (i = 1; i < n; i++) {
      if (!(text = match[i])) continue;
      if (!(type = types[i])) throw "Match does not correspond to a token type!";
      break;
    }
    if (type === "whitespace") continue;
    token = {
      from: match.index,
      to: match.index + text.length,
      type: type,
      text: text,
      next: null,
      prev: prev,
      precedence: i
    };
    prev.next = token;
    prev = token;
  }
  prev.next = last = {
    type: "op_paren",
    text: ")",
    precedence: 10,
    prev: prev
  }

  function reduce(prev, token) {
      var type, left, right, arg, args, name;
      function del() {
        var i, o = arguments[0], n = arguments.length;
        for (i=1; i<n; i++) {
          delete o[arguments[i]];
        }
      }

      if (prev.text === "(" || prev.text === "[") {          //left parenthesis
          arg = prev.next;

          if ((name = prev.prev) && name.type === "identifier") {    //name precedes left parenthesis: this is a function
              prev.type = "func";
              prev.from = name.from
              prev.name = name.text.toUpperCase();
              if (prev.prev = name.prev) name.prev.next = prev;
              del(name, "next", "prev", "precedence");

              args = prev.args = [];
              if (arg && arg.type.indexOf("op_") !== 0) {        //unwrap arguments tree to arguments list.
                  while (arg.type.indexOf("op_separator") === 1) {
                      args.unshift(arg.right);
                      arg = arg.left;
                  }
                  if (arg) args.unshift(arg);
                  del(arg, "next", "prev", "precedence");
                  right = token;
              }
              else right = arg;   //no arguments, reset so we can find the right parenthesis.
          }
          else    //not a function. In this case, parenthesis cannot be empty
          if ((!arg) || (arg.type.indexOf("op_") === 0)) throw "Missing operand";
          else {  //parenthesis not empty, store contents.
              prev.arg = arg;
              right = arg.next;
              del(arg, "next", "prev", "precedence");
          }

          if ((!right) || (prev.text === "(" && right.text !== ")") || (prev.text === "[" && right.text !== "]")) throw "Missing right parenthesis";
          token = right.next;
      }
      else {
          if (prev.type !== "op_unary_plusmin") {
              if (!(left = prev.prev) || (left.type.indexOf("op_") === 0)) throw "Missing left operand";
              prev.left = left;
              prev.from = left.from;
              prev.prev = left.prev;
              if (left.prev) left.prev.next = prev;
              del(left, "next", "prev", "precedence");
          }
          if (prev.text !== "%" && (!(right = prev.next) || (right.type.indexOf("op_") === 0))) throw "Missing right operand";
      }

      if (prev.type !== "%") {
          if (prev.text === "(" || prev.text === "[") {
              if (prev.prev) prev.to = right.to   //left parentheses spans string up to closing right parentheses
              else prev.right = right;          //for outmost left parentheses, store the closing right parentheses (checksum)
          }
          else prev.right = right;              //binary and prefix operators store the right argument
          prev.to = right.to;

          prev.next = right.next;
          if (right.next) right.next.prev = prev;
          del(right, "next", "prev", "precedence");
      }
      prev.type = "_" + prev.type;
      var r = {
          prev: prev.prev,
          token: token
      };
      return r;
  }
  //Parser
  token = prev = first;
  outer: while (token = token.next) {
      if (token.type.indexOf("op_") === -1) continue;
      if (token.type === "op_plusmin" && token.prev.type.indexOf("op_") === 0) {
          token.type = "op_unary_plusmin";
      }
      while (
          (prev.precedence >= token.precedence)
      &&  (token.text !== "(" && token.text !== "[" && token.text !== "%")
      ) {
          var tokens = reduce(prev, token);
          token = tokens.token;
          prev = tokens.prev;
          if (!(token && prev)) break outer;
      };
      prev = token;
  };
  if (first.right !== last) throw "Parse exception";
  return first.arg;
};

Phomp.formulaToJson = function(str, indent) {
  var js = Phomp.formulaToJs(str);
  return JSON.stringify(js, null, indent);
};

Phomp.jsToFormula = function(js) {
  return text;
};

Phomp.jsonToFormula = function(json) {
  var js = JSON.parse(json);
  return Phomp.jsToFormula(js);
};


Phomp.walkObj = function(object, before, after, level) {
  if (typeof (object) !== "object") return;
  var name;
  if (!level) level = "";
  for (name in object) {
    before(object, name, object[name], level);
    Phomp.walkObj(object[name], before, after, level + " ");
    after(object, name, object[name], level);
  }
};

Phomp.jsToMql = function(js) {
  var mql = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
  var stack = [];

  function escape(str) {
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return str;
  }

  Phomp.walkObj(
    js,
    function(object, name, value, level){
      if (object.constructor === Array) {
        name = stack[stack.length - 1];
        name = name.substr(0, name.length - 1);
      }
      mql += "\n" + level;
      if (stack.length && stack[stack.length - 1] === "parameter") {
        mql += name + "=\"" + escape(value) + "\"";
      }
      else {
        mql += "<" + name;
        switch (typeof(value)) {
          case "object":
            if (name !== "parameter") {
              mql += ">";
            }
            break;
          case "string":
            mql += ">";
            switch (name) {
              case "condition":
                mql += "<![CDATA[" + value + "]]>";
                break;
              default:
                mql += escape(value);
            }
            break;
        }
      }
      stack.push(name);
    },
    function(object, name, value, level){
      if (object.constructor === Array) {
        name = stack[stack.length - 1];
      }
      stack.pop();
      if (stack.length && stack[stack.length - 1] === "parameter") {
        return;
      }
      if (name === "parameter") {
        mql += "\n" + level + "\/>";
        return;
      }
      var endTag = "</" + name + ">";
      switch (typeof(value)) {
        case "object":
          mql += "\n" + level;
          break;
        case "string":
          break;
      }
      mql += endTag;
    }
  );

  return mql;
}

Phomp.jsonToMql = function(json) {
  var js = JSON.parse(json);
  return Phomp.jsToMql(js);
};

Phomp.mqlToJs = function(mql) {
  //         1234             5           6          789             10             11   12          13  14                 15         1617    18                   19
  var re = /<(((([\w\-\.]+):)?([\w\-\.]+))([^>]+)?|\/((([\w\-\.]+):)?([\w\-\.]+))|\?(\w+)([^\?]+)?\?|(!--([^\-]|-[^\-])*--)|(!\[CDATA\[(([^\]]+(\][^\]])?)+)\]\]))>|([^<>]+)/ig;
  var match, value, atts;
  var pop, push, stack = [];
  var root = {}, obj, pObj = root, member;

  while (match = re.exec(mql)) {
    //we have an element start tag
    if (value = match[5]) {
      push = true;
      //make a new object to represent this element
      obj = {};
      //attach the new object to its parent (if it exists)
      if (pObj) {
        //see if such a child item already exists
        member = pObj[value];
        if (member) {
          //it already exists.
          //add the new object to the existing array of items of this name
          if (member.constructor === Array) {
            member.push(obj);
          }
          //if this item existed only as scalar, make it an array
          else {
            pObj[value] = [member, obj];
          }
        }
        else {
          //if it didn't exist already, add this item.
          pObj[value] = obj;
        }
      }

      //do we have "stuff" beyond the tagname?
      if (atts = match[6]) {
        //check if this element is self-closing
        if (atts.length && atts.substr(atts.length - 1, 1) === "\/") {
          //it is. remove the trailing "/" character
          //make sure not to push this item on the stack
          atts = atts.substr(0, atts.length - 1);
          push = false;
        }
        var attMatch, att;
        //            123          4                5 6         7
        var attRe = /((([\w\-]+):)?([\w\-]+))\s*=\s*('([^']*)'|"([^"]*)")/g;
        //parse attributes
        while (attMatch = attRe.exec(atts)) {
          //check if such an item already exists
          if (typeof(obj[attMatch[4]]) !== "undefined") {
            throw "Unexpected attribute \"" + attMatch[4] + "\". Item already exists."
          }
          //Nope, add it.
          obj[attMatch[4]] = attMatch[5].substr(1, attMatch[5].length - 2);
        }
        //reset the regex so we can use it again next time.
        attRe.lastIndex = 0;
      }
      //push the item on the stack, and make it the new parent object.
      if (push) {
        obj._type = value;
        pObj = obj;
        stack.push(obj);
      }
    }
    else
    //element end tag
    if (value = match[10]) {
      //get the last item from the stack
      pop = stack.pop();
      //check if tagname matches the current item.
      if (pop._type !== value) {
        //nope. this means the tags aren't balanced.
        throw "Error: not wellformed. Found closing tag " + value + " but expected " + pop.tag + " at " + match.index;
      }
      //set the current parent object
      pObj = stack.length ? stack[stack.length -1] : null;
      //check if this is a container element (like "parameters", "selections", or "orders", but not "options")
      if (pop._type !== "options" && pop._type.charAt(pop._type.length - 1) === "s") {
        //construct the singular name by cutting the trailing s
        var singular = pop._type.substr(0, pop._type.length - 1);
        //if the container doesn't contain any items, add an empty array
        if (typeof(pop[singular]) === "undefined") {
          pObj[pop._type] = [];
        }
        else
        //if the container has an array of items, use that
        if (pop[singular].constructor === Array) {
          pObj[pop._type] = pop[singular];
        }
        //if the container has a single item, make it an array
        else {
          pObj[pop._type] = [pop[singular]];
        }
      }
      //if the popped item has a _value property, then fold it into a scalar
      //note that we assume that if a _value property is present, it is the
      //only meaningful property. We don't explicitly check if that is the case.
      //we probably should, and throw an error if we find that it has more properties.
      if (pop._value) {
        pObj[pop._type] = pop._value;
      }
      //remove the tagname info
      delete pop._type;
    }
    else
    if (value = match[11]) {                              //processing instruction
      //ignore
      //typically we only get this for the xml declaration
    }
    else
    if (value = match[13]) {                              //comment
      //ignore
      //comments are stripped
    }
    else
    if (value = match[15]) {                              //cdata
      //grab the text, add that as value
      pObj._value = match[16];
    }
    else
    if ((value = match[19]) && (!/^\s+$/.test(value))) {  //text (but not whitespace)
      //grab the text, add that as value
      pObj._value = match[19];
    }
  }
  return root;
}

Phomp.mqlToJson = function(mql, indent) {
  var js = Phomp.mqlToJs(mql);
  return JSON.stringify(js, null, indent);
}

if (typeof(define)==="function" && define.amd) {
  define(function (){
      return PentahoMqlUtils;
  });
}
else window.Phomp = Phomp;

return Phomp;

})(typeof exports === "undefined" ? window : exports);
