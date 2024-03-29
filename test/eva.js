"use strict";
/*global afterEach, chai, describe, it, window*/

// Tests for eva
describe("eva", function() {
    var expect, eva, undef;
    
    // node
    if (typeof chai === "undefined") {
        eva = require("../src/eva.js");
        expect = require("./lib/chai").expect;
    }
    // browser
    else {
        eva = window.eva;
        expect = chai.expect;
    }
    
    function emptyFunction() {
    }
    
    
    describe(".createFunction", function() {
        var createFunction = eva.createFunction;
        
        describe("createFunction(sCode)", function() {
            it("should return function that executes given code", function() {
                var func;
                
                func = createFunction();
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(undef);
                
                func = createFunction("");
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(undef);
                
                func = createFunction("return 1;");
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(1);
                
                func = createFunction("return [].push;");
                expect( func )
                    .a("function");
                expect( func() )
                    .eql(Array.prototype.push);
                
                func = createFunction("return (arguments[0] || 0) + (arguments[1] || 0);");
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(0);
                expect( func(123) )
                    .equal(123);
                expect( func(1, 2) )
                    .equal(3);
                expect( func(10, 1, 5, 8) )
                    .equal(11);
            });
            
            it("should return function that throws an exception", function() {
                var func;
                
                func = createFunction("a");
                expect( func )
                    .Throw(Error);
                
                func = createFunction("[].________________();");
                expect( func )
                    .Throw(Error);
                
                func = createFunction("return argument[0];");
                expect( func )
                    .Throw(Error);
            });
            
            it("should throw a SyntaxError exception", function() {
                expect( createFunction.bind(null, "return -;") )
                    .Throw(SyntaxError);
                
                expect( createFunction.bind(null, "return ()") )
                    .Throw(SyntaxError);
            
                expect( createFunction.bind(null, "{a:'}") )
                    .Throw(SyntaxError);
                
                expect( createFunction.bind(null, "function(,a) {}") )
                    .Throw(SyntaxError);
                
                expect( createFunction.bind(null, "{:}") )
                    .Throw(SyntaxError);
                
                expect( createFunction.bind(null, "[-]") )
                    .Throw(SyntaxError);
                
                expect( createFunction.bind(null, "*[]*") )
                    .Throw(SyntaxError);
            });
        });
        
        describe("createFunction(sCode, {expression: true})", function() {
            it("should prefix function code with 'return' statement", function() {
                var func;
                
                func = createFunction("Math", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(Math);
                
                func = createFunction("new Date", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .instanceOf(Date);
                
                func = createFunction("null", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(null);
                
                func = createFunction("{}", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .eql({});
                
                func = createFunction("{a: 1, b: 2}", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .eql({a: 1, b: 2});
                
                func = createFunction("[]", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .eql([]);
                
                func = createFunction("['a', 8]", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .eql(["a", 8]);
            });
        });
        
        describe("createFunction(sCode, {paramNames: 'a, b, c'})", function() {
            it("should create function that accepts parameters with specified names", function() {
                var func;
                
                func = createFunction("return p;", {paramNames: "p"});
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(undef);
                expect( func(1) )
                    .equal(1);
                expect( func(Object) )
                    .equal(Object);
                expect( func(eva) )
                    .equal(eva);
                expect( func("p") )
                    .equal("p");
                
                func = createFunction("if (typeof abc === 'function') {return 'f';} else {return abc;}", {paramNames: "abc"});
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(undef);
                expect( func(1) )
                    .equal(1);
                expect( func(createFunction) )
                    .equal("f");
                expect( func("value") )
                    .equal("value");
                expect( func(null) )
                    .equal(null);
                
                func = createFunction("(a || 0) + (b || 0) + (c || 0)", {paramNames: "a, b, c", expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(0);
                expect( func(1) )
                    .equal(1);
                expect( func(1, 2) )
                    .equal(3);
                expect( func(1, 2, 3) )
                    .equal(6);
            });
        });
        
        describe("createFunction(sCode, {scope: true})", function() {
            it("should wrap function code using 'with' statement", function() {
                var func;
                
                func = createFunction("return field;", {scope: true});
                expect( func )
                    .a("function");
                expect( func({field: "value"}) )
                    .equal("value");
                
                func = createFunction("return a + (sc.b || 0);", {scope: true});
                expect( func )
                    .a("function");
                expect( func({a: 1}) )
                    .equal(1);
                expect( func({a: 1, b: 100}) )
                    .equal(101);
                
                func = createFunction("return push;", {scope: true});
                expect( func )
                    .a("function");
                expect( func([]) )
                    .equal([].push);
                
                func = createFunction("return b.c;", {scope: true});
                expect( func )
                    .a("function");
                expect( func({b: {c: "a"}}) )
                    .equal("a");
                
                func = createFunction("if (obj.b) {return a + b;} else {return 'a=' + a;}", {scope: true, paramNames: "obj"});
                expect( func )
                    .a("function");
                expect( func({a: "beta"}) )
                    .equal("a=beta");
                expect( func({a: 3, b: null}) )
                    .equal("a=3");
                expect( func({a: 3, b: 1}) )
                    .equal(4);
                expect( func({a: "a", b: "bc"}) )
                    .equal("abc");
                
                func = createFunction("if (value && value in space) {return space[value];} else {return def;}", {scope: true, paramNames: "space, value"});
                expect( func )
                    .a("function");
                expect( func({a: "beta", def: "default"}) )
                    .equal("default");
                expect( func({a: 3}, "a") )
                    .equal(3);
                expect( func({a: 3, b: 1}, "b") )
                    .equal(1);
                expect( func({def: "unknown", a: "a", b: "b"}, "c") )
                    .equal("unknown");
                
                func = createFunction("a + (p1 || 0) + (p2 || 0)", {scope: true, paramNames: "obj, p1, p2", expression: true});
                expect( func )
                    .a("function");
                expect( func({a: 0}) )
                    .equal(0);
                expect( func({a: 1}, 1) )
                    .equal(2);
                expect( func({a: "a"}, 1) )
                    .equal("a10");
                expect( func({a: 1}, 2, 3) )
                    .equal(6);
                expect( func({a: 10}, 20, 3, 40) )
                    .equal(33);
                expect( func({a: "a"}, "b", "c", 5) )
                    .equal("abc");
                expect( func({a: "a ", p1: "object property "}, "b ", "c ") )
                    .equal("a object property c ");
                expect( func({a: "a ", p1: "- b ", p2: "- c"}, "b ", "c ") )
                    .equal("a - b - c");
            });
            
            it("should return function that throws an ReferenceError exception", function() {
                var func;
                
                func = createFunction("a", {scope: true});
                expect( func.bind(null, {}) )
                    .Throw(ReferenceError);
                
                func = createFunction("return value;", {scope: true, paramNames: "obj"});
                expect( func.bind(null, {a: 1, v: 2}) )
                    .Throw(ReferenceError);
                
                func = createFunction("param > a ? a : b", {scope: true, paramNames: "space, a, b", expression: true});
                expect( func.bind(null, {a: 1, prm: 5}) )
                    .Throw(ReferenceError);
            });
        });
    });
    
    
    describe(".evalWith", function() {
        var evalWith = eva.evalWith;
        
        describe("evalWith(sExpression)", function() {
            it("should return result of expression evaluation", function() {
                expect( evalWith("5") )
                    .equal(5);
                expect( evalWith("null") )
                    .equal(null);
                expect( evalWith("void 0") )
                    .equal(undef);
                expect( evalWith("''") )
                    .equal("");
                expect( evalWith("'abc'") )
                    .equal("abc");
                expect( evalWith("Function") )
                    .equal(Function);
                expect( evalWith("[].concat") )
                    .equal(Array.prototype.concat);
                expect( evalWith("[]") )
                    .eql([]);
                expect( evalWith("{}") )
                    .eql({});
                
                expect( evalWith("[1, 2].concat([3, 4])") )
                    .eql([1, 2, 3, 4]);
                expect( evalWith("3 + 2") )
                    .equal(5);
                expect( evalWith("null + ''") )
                    .equal("null");
                expect( evalWith("typeof null") )
                    .equal("object");
            });
            
            it("should throw ReferenceError or TypeError exception", function() {
                expect( evalWith.bind(null, "abcdefgh") )
                    .Throw(ReferenceError);
                expect( evalWith.bind(null, "undef + non_undef") )
                    .Throw(ReferenceError);
                expect( evalWith.bind(null, "[].push(abracadabra)") )
                    .Throw(ReferenceError);
                expect( evalWith.bind(null, "fun()") )
                    .Throw(ReferenceError);
                
                expect( evalWith.bind(null, "[].length()") )
                    .Throw(TypeError);
                expect( evalWith.bind(null, "(1)()") )
                    .Throw(TypeError);
                expect( evalWith.bind(null, "[] instanceof null") )
                    .Throw(TypeError);
                expect( evalWith.bind(null, "1 in 1") )
                    .Throw(TypeError);
            });
        });
        
        describe("evalWith(sExpression, context)", function() {
            it("should return result of expression evaluation using given context as 'this'", function() {
                var obj;
                
                expect( evalWith("10", {}) )
                    .equal(10);
                expect( evalWith("null", {a: 1}) )
                    .equal(null);
                
                expect( evalWith("this.a", 4) )
                    .equal(undef);
                expect( evalWith("this.a", "abc") )
                    .equal(undef);
                
                obj = {a: 1};
                expect( evalWith("this.a++", obj) )
                    .equal(1);
                expect( obj.a )
                    .equal(2);
                
                expect( evalWith("this.length", [1, 2, 3]) )
                    .equal(3);
                expect( evalWith("this.a + this.b", {a: 1, b: 9}) )
                    .equal(10);
                expect( evalWith("this.length", emptyFunction) )
                    .equal(0);
                expect( evalWith("this.length", new Array(3)) )
                    .eql(3);
            });
        });
        
        describe("evalWith(sExpression, context | null, scope)", function() {
            it("should return result of expression evaluation using given context as 'this' and given scope by 'with' statement", function() {
                expect( evalWith("a", null, {a: evalWith}) )
                    .equal(evalWith);
                expect( evalWith("a + b", undef, {a: 1, b: 9}) )
                    .equal(10);
                expect( evalWith("length", null, emptyFunction) )
                    .equal(0);
                expect( evalWith("length", undef, new Array(1000)) )
                    .eql(1000);
                
                expect( evalWith("a + b + this.value", {value: "%"}, {a: 1, b: 9}) )
                    .equal("10%");
                expect( evalWith("this.value > c ? a : b", {value: 7}, {a: 1, b: 9, c: 4}) )
                    .equal(1);
                expect( evalWith("f(this.expr)", {expr: "Math.sin(0)"}, {a: null, f: evalWith}) )
                    .equal(0);
            });
            
            it("should throw ReferenceError or TypeError exception", function() {
                expect( evalWith.bind(null, "_________________________", null, {}) )
                    .Throw(ReferenceError);
                expect( evalWith.bind(null, "a + b", null, {}) )
                    .Throw(ReferenceError);
                expect( evalWith.bind(null, "f()", null, {f: 1}) )
                    .Throw(TypeError);
                expect( evalWith.bind(null, "f(a)", null, {f: emptyFunction}) )
                    .Throw(ReferenceError);
            });
        });
    });
    
    
    describe(".createDelegateMethod", function() {
        var createDelegateMethod = eva.createDelegateMethod,
            source = {
                value: 0,
                inc: function(add) {
                    if (arguments.length > 0) {
                        this.value += add;
                    }
                    else {
                        this.value++;
                    }
                    return this.value;
                }
            },
            target;
        
        afterEach(function() {
            source.value = 0;
            target = {
                value: 100
            };
        });
        
        describe("createDelegateMethod(source, sMethod)", function() {
            it("should return function that executes the specified method of the given object", function() {
                var method = createDelegateMethod(source, "inc");
                
                expect( method )
                    .a("function");
                expect( method() )
                    .equal(1);
                expect( source.value )
                    .equal(1);
                
                expect( method(7) )
                    .equal(8);
                expect( source.value )
                    .equal(8);
            });
        });
        
        describe("createDelegateMethod(source, sMethod, {destination: target})", function() {
            it("should add method in target object that executes the specified method of the given object", function() {
                var method = createDelegateMethod(source, "inc", {destination: target});
                
                expect( method )
                    .a("function");
                expect( target.inc )
                    .equal(method);
                
                expect( method() )
                    .equal(1);
                expect( source.value )
                    .equal(1);
                expect( target.value )
                    .equal(100);
                
                expect( method(-100) )
                    .equal(-99);
                expect( source.value )
                    .equal(-99);
                expect( target.value )
                    .equal(100);
                
                expect( target.inc() )
                    .equal(-98);
                expect( source.value )
                    .equal(-98);
                expect( target.value )
                    .equal(100);
                
                expect( target.inc(101) )
                    .equal(3);
                expect( source.value )
                    .equal(3);
                expect( target.value )
                    .equal(100);
            });
        });
        
        describe("createDelegateMethod(source, sMethod, {destination: target, destinationMethod: sTargetMethod})", function() {
            it("should add method with given name in target object that executes the specified method of the given object", function() {
                var method = createDelegateMethod(source, "inc", {destination: target, destinationMethod: "change"});
                
                expect( method )
                    .a("function");
                expect( target.change )
                    .equal(method);
                
                expect( method() )
                    .equal(1);
                expect( source.value )
                    .equal(1);
                expect( target.value )
                    .equal(100);
                
                expect( method(76) )
                    .equal(77);
                expect( source.value )
                    .equal(77);
                expect( target.value )
                    .equal(100);
                
                expect( target.change() )
                    .equal(78);
                expect( source.value )
                    .equal(78);
                expect( target.value )
                    .equal(100);
                
                expect( target.change(2) )
                    .equal(80);
                expect( source.value )
                    .equal(80);
                expect( target.value )
                    .equal(100);
            });
        });
    });
});
