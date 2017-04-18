/**
 * Copyright (c) 2017 Jeff Patterson, Amanda Murphy, Paolo Villanueva, Patrick Overton, Connor Picken, Yun Cong Chen, Seth Amundsen, Michael Ohl, Matthew Tighe
 * ALL RIGHTS RESERVED
 * [This program is licensed under the "GNU General Public License"]
 * Please see the file COPYING in the source
 * distribution of this software for license terms.
 */

'use strict';

describe('rvtk.version module', function() {
    beforeEach(module('rvtk.version'));

    describe('version service', function() {
        it('should return current version', inject(function(version) {
          expect(version).toEqual('0.1');
        }));
    });
});
