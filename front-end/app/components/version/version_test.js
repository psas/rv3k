'use strict';

describe('rvtk.version module', function() {
    beforeEach(module('rvtk.version'));

    describe('version service', function() {
        it('should return current version', inject(function(version) {
          expect(version).toEqual('0.1');
        }));
    });
});
