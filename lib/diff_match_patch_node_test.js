sys = require('sys');
dmb_lib = require('./diff_match_patch_node.js');

var text1 = "for who the bell tolls";
var text2 = "for who the bell tolls, time marches on";

var dmp = dmb_lib.diff_match_patch
var diff = dmp.diff_main(text1, text2, true);

if (diff.length > 2) dmp.diff_cleanupSemantic(diff);
  
var patch_list = dmp.patch_make(text1, text2, diff);
patch_text = dmp.patch_toText(patch_list);

sys.puts(patch_text);
