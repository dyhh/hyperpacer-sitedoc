/**
 *
 * @author daihuahua
 * @since 2016-08-29
 *
 */

var fs = require('fs');
var ps = require('child_process');
var path = require('path');
var ejs = require('ejs');


var config = {
  pre:{
    title: 'HyperPacer 主页',
    url: 'http://www.beecode.cn/pages/products/hyperpacer/hyperpacer.html'
  },
  next:{
    title: 'HyperPacer 视频专区',
    url: 'http://v.youku.com/v_show/id_XMTcwMDcxMzI3Ng==.html'
  },
  titlePicker: function(html){
    var str = html.split('\n')[0].match(/<!--.+-->/)[0];
    return str.substring(4, str.length-3);
  }
};
var tree = {};

function isTrueFile(item){
  return '.DS_Store' != item;
}
readTree(path.join(__dirname,'src'), tree);
preHanle(tree);
generate(tree);
function preHanle(tree){
  var last = config.pre;
  tree.children.forEach(function(category){
    category.children.forEach(function(item){
      last.next = item;
      item.pre = last;
      last = item;
    });
  });
  last.next = config.next;
}
function generate(tree){
  var template = fs.readFileSync(path.join(__dirname, 'template.html'),'utf8');
  tree.children.forEach(function(category){
    category.children.forEach(function(item){
        fs.writeFileSync(path.join(__dirname,'dist', item.name), ejs.render(template, item), 'utf8');
    });
  });

}
function readTree(basedir, result){
  var files;
  // 读取目录
  try {
    files = fs.readdirSync(basedir);
  } catch (e) {
    return trees;
  }

  result.children = [];

  files.filter(isTrueFile).forEach(function(item){
    var stat = fs.statSync(basedir, item);
    if(stat.isDirectory()){
      var obj = {
        name: item.substr(2),
        children: []
      };
      result.children.push(obj);
      var dir_path = path.join(basedir, item);
      try {
        children_files = fs.readdirSync(dir_path);
      } catch (e) {
        console.error(e);
      }
      children_files.filter(isTrueFile).forEach(function(name){
        var item = {};
        item.name = name.substr(2);
        item.content = fs.readFileSync(path.join(dir_path,name),'utf8');
        item.title = 'HyperPacer '+config.titlePicker(item.content);
        item.tree = result;
        item.pre = {};
        item.next = {};
        obj.children.push(item);
      });
    }
  });
}
