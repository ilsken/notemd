module.exports = '<div class="row-fluid note-row">\n<section>\n	<div class="page-header"><h1 ng-bind="name"></h1></div>\n	<p ng-bind-html-unsafe="content"></p>\n</section>\n<!--\n  <div class="span12">\n     <div class="card">\n        <h2 class="card-heading simple" ng-bind="name"></h2>\n        <div class="card-body" ng-bind-html-unsafe="content">\n        </div>\n     </div>\n  </div><!--/span-->\n</div>';