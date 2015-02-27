(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["article"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<article>\n    <a href=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "entry")),"url", env.autoesc), env.autoesc);
output += "\" target=\"_blank\">\n        <img src=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "entry")),"thumb", env.autoesc), env.autoesc);
output += "\" class=\"thumb\"/>\n\n        <h2>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "entry")),"title", env.autoesc), env.autoesc);
output += "</h2>\n\n        <p class=\"description\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "entry")),"description", env.autoesc), env.autoesc);
output += "</p>\n    </a>\n</article>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["section"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<header class=\"section-header\">\n    ";
output += "\n    <div class=\"header-wrapper\">\n        <span class=\"progress-bar\" style=\"width: 10%\"></span>\n        <h1>";
output += runtime.suppressValue(env.getFilter("dateformat").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "it")),"startDate", env.autoesc),"HH:mm"), env.autoesc);
output += "</h1>\n        <h2>";
output += runtime.suppressValue(env.getFilter("dateformat").call(context, (runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "it")),"startDate", env.autoesc) + runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "it")),"duration", env.autoesc)),"HH:mm"), env.autoesc);
output += "</h2>\n    </div>\n\n    <div class=\"header-bottom\">\n        ";
output += "\n            ";
output += "\n        ";
output += "\n\n        <h2>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "it")),"name", env.autoesc), env.autoesc);
output += "</h2>\n\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "it")),"description", env.autoesc) && runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "it")),"name", env.autoesc) != runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "it")),"description", env.autoesc)) {
output += "\n        <p class=\"description\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "it")),"description", env.autoesc), env.autoesc);
output += "</p>\n        ";
;
}
output += "\n\n        ";
output += "\n            ";
output += "\n        ";
output += "\n    </div>\n</header>\n";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "it")),"entries", env.autoesc);
if(t_3) {var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("entry", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n    ";
env.getTemplate("article", function(t_7,t_5) {
if(t_7) { cb(t_7); return; }
t_5.render(context.getVariables(), frame.push(), function(t_8,t_6) {
if(t_8) { cb(t_8); return; }
output += t_6
output += "\n";
})});
}
}
frame = frame.pop();
output += "\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
