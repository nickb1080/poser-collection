!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.c=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var poser = _dereq_('./src/node');

module.exports = poser;

['Array', 'Function', 'Object', 'Date', 'String'].forEach(pose);

function pose (type) {
  poser[type] = function poseComputedType () { return poser(type); };
}

},{"./src/node":2}],2:[function(_dereq_,module,exports){
'use strict';

var vm = _dereq_('vm');

function poser (type) {
  var sandbox = {};
  vm.runInNewContext('stolen=' + type + ';', sandbox, 'poser.vm');
  return sandbox.stolen;
}

module.exports = poser;

},{"vm":4}],3:[function(_dereq_,module,exports){
/*! collection- v0.0.0 - MIT license */

"use strict";
module.exports = (function( poser ) {
  var poser = _dereq_( "poser" );
  var Collection = poser.Array();
  var cp = Collection.prototype;

  function isCollection( obj ) {
    return obj instanceof Collection;
  }

  function isFunction( obj ) {
    return typeof obj === "function";
  }

  // Should match Array as well as correctly subtyped classes from any execution context.
  // Perhaps use more robust solution (kindof?)
  function isArrayLike( obj ) {
    return Object.prototype.toString.call( obj ) === "[object Array]";
  }

  function matches( against, obj ) {
    for ( var prop in against ) {
      if ( obj[prop] !== against[prop] ) { 
        return false;
      }
    }
    return true;
  }

  function flip( fn ) {
    return function( a, b ) {
      return fn.call( this, b, a );
    };
  }

  function partial( fn ) {
    var args = slice( arguments, 1 );
    return function() {
       return fn.apply( this, args.concat( slice( arguments ) ) );
    };
  }

  function get( prop ) {
    return function( obj ) {
      return obj[prop];
    };
  }

  function not( fn ) {
    return function() {
      return !fn.apply( this, arguments );
    };
  }

  function contains( obj, value ) {
    return cp.indexOf.call( obj, value ) > -1;
  }

  function isTruthy( value ) {
    return !!value;
  }

  function breakableEach( obj, callback ) {
    var result;
    for ( var i = 0; i < obj.length; i++ ) {
      result = callback( obj[i], i, obj );
      if ( result === false ) {
        return result;
      }
    }
    return null;
  }

  // helpers
  var slice = Function.prototype.call.bind( cp.slice );

  // create chainable versions of these native methods
  ["push", "pop", "shift", "unshift"].forEach( function( method ) {
    // new methods will be named cPush, cPop, cShift, cUnshift
    var name = "c" + method.charAt( 0 ).toUpperCase() + method.slice( 1 );
    Array.prototype[name] = function() {
      Array.prototype[method].apply( this, arguments );
      return this;
    };
  });

  // aliases for native methods.
  cp.each = cp.forEach;
  cp.collect = cp.map;
  cp.select = cp.filter;

  cp.forEachRight = function( fn ) {
    this.slice().reverse().each( fn );
  };
  cp.eachRight = cp.forEachRight;

  cp.where = function( obj ) {
    return this.filter( partial( matches, obj ) );
  };

  cp.whereNot = function( obj ) {
    return this.filter( not( partial( matches, obj ) ) );
  };

  cp.find = function( testFn ) {
    var result = null;
    breakableEach( this, function( el, i, arr ) {
      if ( testFn( el, i, arr ) ) {
        result = el;
        return false;
      }
    });
    return result;
  };

  cp.findNot = function( testFn ) {
    return this.find( not( testFn ) );
  };

  cp.findWhere = function( obj ) {
    return this.find( partial( matches, obj ) );
  };

  cp.findWhereNot = function( obj ) {
    return this.find( not( partial( matches, obj ) ) );
  };

  cp.pluck = function( prop ) {
    return this.map( get( prop ) );
  };

  cp.pick = function() {
    return this.map( function( el ) {
      var obj = {};
      breakableEach( arguments, function( prop ) {
        obj[prop] = el[prop];
      });
      return obj;
    });
  };

  cp.reject = function( testFn ) {
    return this.filter( not( testFn ) );
  };

  cp.invoke = function( fnOrMethod ) {
    var args = slice( arguments, 1 );
    this.forEach( function( el ) {
      ( isFunction( fnOrMethod ) ? fnOrMethod : el[fnOrMethod] ).apply( el, args );
    });
    return this;
  };

  cp.without = function() {
    var args = slice( arguments );
    return this.reject( partial( contains, args ) );
  };
  cp.remove = cp.without;

  cp.contains = function( obj ) {
    return contains( this, obj );
  };

  cp.tap = function( fn ) {
    fn( this );
    return this;
  };

  cp.clone = function() {
    return this.slice();
  };

  // todo
  cp.cloneDeep = function() {

  };

  cp.first = function( num ) {
    if ( num == null ) {
      return this[0];
    }
    return this.slice( 0, num );
  };
  cp.head = cp.first;
  cp.take = cp.first;

  cp.initial = function( num ) {
    if ( num == null ) {
      num = 1;
    }
    return this.slice( 0, this.length - num );
  };

  cp.last = function( num ) {
    if ( num == null ) {
      return this[this.length - 1];
    }
    return this.slice( 0, -1 * num );
  };

  cp.rest = function( num ) {
    if ( num == null ) {
      num = 1;
    }
    return this.slice( num );
  };
  cp.tail = cp.rest;
  cp.drop = cp.rest;

  cp.compact = function() {
    return this.filter( isTruthy );
  };

  // TODO
  // cp.flatten = function() {

  // };

  cp.partition = function( testFn ) {
    var pass = new Collection();
    var fail = new Collection();
    this.each( function( el, i, arr ) {
      ( testFn( el, i, arr ) ? pass : fail ).push( el );
    });
    return factory([ pass, fail ]);
  };

  cp.union = function() {
    return cp.concat.apply( this, arguments ).unique();
  };

  cp.intersection = function() { 
    var result = new Collection();
    var args = slice( arguments );
    this.each( function( el ) {
      var has = args.every( partial( flip( contains ), el ) );
      if ( has ) {
        result.push( el );
      }
    });
    return result;
  };

  cp.difference = function() {
    var result = new Collection();
    var args = slice( arguments );
    this.each( function( el ) {
      var notHas = args.every( not( partial( flip( contains ), el ) ) );
      if ( notHas ) {
        result.push( el );
      }
    });
    return result;
  };
  
  cp.unique = function() {
    var found = new Collection();
    this.each( function( el ) {
      if ( !found.contains( el ) ) {
        found.push( el );
      }
    });
    return found;
  };
  cp.uniq = cp.unique;

  // TODO
  // cp.zip = function() {
  // };

  cp.min = function( prop ) {
    if ( prop ) {
      return cp.min.call( this.pluck( prop ) );
    }
    return Math.min.apply( Math, this );
  };

  cp.max = function( prop ) {
    if ( prop ) {
      return cp.max.call( this.pluck( prop ) );
    }
    return Math.max.apply( Math, this );
  };

  cp.extent = function( prop ) {
    return [ this.min( prop ), this.max( prop ) ];
  };

  cp.toArray = function() {
    return Array.prototype.slice.call( this );
  };

  var factory = function( arr ) {
    if ( arr == null ) {
      arr = [];
    }
    return new Collection().concat( arr );
  };

  // args: ["name", "age", "gender"], [["joe", 30, "male"], ["jane", 35, "female"]] =>
  // return: [{name: "joe", age: 30, gender: "male"}, {name: "jane", age: 35, gender: "female"}];
  function collectifyHeaders( headers, rows ) {
    return factory( rows ).map( function( row ) {
      var obj = {};
      headers.forEach( function( header, j ) {
        obj[header] = row[j];
      });
      return obj;
    });
  }

  // arg: [["name", "age", "gender"], ["joe", 30, "male"], ["jane", 35, "female"]] =>
  // return: [{name: "joe", age: 30, gender: "male"}, {name: "jane", age: 35, gender: "female"}];
  function collectifyTable( rows, headerIndex ) {
    if ( headerIndex == null ) {
      headerIndex = 0;
    }
    var headers = rows.splice( headerIndex, 1 )[0];
    return collectifyHeaders( headers, rows );
  }

  // factory.collectify = collectifyHeaders;
  // function() {
  //   // should sniff out various types of structured data and return a collection
  // };

  factory.ctor = Collection;
  factory.proto = cp;
  factory.isCollection = isCollection;

  factory.util = {
    flip: flip,
    partial: partial,
    contains: contains
  };

  return factory;

})();
},{"poser":1}],4:[function(_dereq_,module,exports){
var indexOf = _dereq_('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":5}],5:[function(_dereq_,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}]},{},[3])
(3)
});