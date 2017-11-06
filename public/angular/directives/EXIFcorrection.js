//////////////////////               directive to fix image orientation in case of incorrect exif data                ////////////
////////////////////// browser auto rotates the images based on there exif meta data, to prevent this, this directive ////////////
//////////////////////      checks the exif orientation of the image with the actual orientation. If difference       ////////////
//////////////////////   is found then auto rotates the image by the appropriate degrees to correct the orientation.  ////////////

myApp.directive('fixIt', function() {
  return {
    restrict: 'A',
    link: function(scope, element,attrs) {
      element = $(element)
      function setTransform(transform) {
        element.css('-ms-transform', transform);
        element.css('-webkit-transform', transform);
        element.css('-moz-transform', transform);
        element.css('transform', transform);
      }

      var parent = element.parent();
      $(element).bind('load', function() {
        EXIF.getData(element[0], function() {
          var orientation = EXIF.getTag(element[0], 'Orientation');
          var height = element.height();
          var width = element.width();
          if (orientation && orientation !== 1) {
            switch (orientation) {
              case 2:
                setTransform('rotateY(180deg)');
                break;
              case 3:
                setTransform('rotate(180deg)');
                break;
              case 4:
                setTransform('rotateX(180deg)');
                break;
              case 5:
                setTransform('rotateZ(90deg) rotateX(180deg)');
                if (width > height) {
                  parent.css('height', width + 'px');
                  element.css('margin-top', ((width -height) / 2) + 'px');
                }
                break;
              case 6:
                setTransform('rotate(90deg)');
                if (width > height) {
                  parent.css('height', width + 'px');
                  element.css('margin-top', ((width -height) / 2) + 'px');
                }
                break;
              case 7:
                setTransform('rotateZ(90deg) rotateY(180deg)');
                if (width > height) {
                  parent.css('height', width + 'px');
                  element.css('margin-top', ((width -height) / 2) + 'px');
                }
                break;
              case 8:
                setTransform('rotate(-90deg)');
                if (width > height) {
                  parent.css('height',( width +3)+ 'px');
                  element.css('margin-top', ((width -height) / 2) + 'px');
                }
                break;
            }
          }
        });
      });


    }
  }
});