'use strict';

angular.module('rvtk.version', [
    'rvtk.version.interpolate-filter',
    'rvtk.version.version-directive'
])

.value('version', '0.1');
