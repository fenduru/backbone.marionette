module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']
  });

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      version: '<%= pkg.version %>',
      year: '<%= grunt.template.today("yyyy") %>',
      banner: grunt.template.process(grunt.file.read('banner.jst'), {
        data: { date: '<%= grunt.template.date("yyyy") %>', version: '000', env: 'core' }
      }),
      bannerBundle: grunt.template.process(grunt.file.read('banner.jst'), {
        data: { date: '<%= grunt.template.date("yyyy") %>', version: '000', env: 'bundle' }
      })
    },
    assets: {
      babysitter:   'bower_components/backbone.babysitter/lib/backbone.babysitter.js',
      underscore:   'bower_components/underscore/underscore.js',
      backbone:     'bower_components/backbone/backbone.js',
      jquery:       'bower_components/jquery/dist/jquery.js',
      sinon:        'bower_components/sinonjs/sinon.js',
      jasmineSinon: 'bower_components/jasmine-sinon/lib/jasmine-sinon.js',
      wreqr:        'bower_components/backbone.wreqr/lib/backbone.wreqr.js',
    },

    clean: {
      lib: 'lib',
      tmp: 'tmp' 
    },

    preprocess: {
      core_build: {
        src: 'src/build/marionette.core.js',
        dest: 'lib/core/backbone.marionette.js'
      },
      amd: {
        src: 'src/build/amd.core.js',
        dest: 'tmp/backbone.marionette.amd.js'
      },
      tmp: {
        src: '<%= preprocess.core_build.src %>',
        dest: 'tmp/backbone.marionette.js'
      }
    },

    concat: {
      options: {
        banner: "<%= meta.banner %>"
      },
      core: {
        src: '<%= preprocess.tmp.dest %>',
        dest: 'lib/core/backbone.marionette.js'
      },
      bundle: {
        options: {
          banner: "<%= meta.bannerBundle %>"
        },
        src: [
          '<%= assets.babysitter %>',
          '<%= assets.wreqr %>',
          '<%= preprocess.tmp.dest %>',
        ],
        dest: 'lib/backbone.marionette.js'
      },
      amd: {
        src: '<%= preprocess.amd.dest %>',
        dest: 'lib/core/amd/backbone.marionette.js'
      }
    },

    uglify : {
      amd : {
        options: {
          banner: '<%= meta.banner %>'
        },
        src : '<%= concat.amd.dest %>',
        dest : 'lib/core/amd/backbone.marionette.min.js',
      },
      bundle: {
        src : '<%= concat.bundle.dest %>',
        dest : 'lib/backbone.marionette.min.js',
        options : {
          banner: '<%= meta.bannerBundle %>',
          sourceMap : 'lib/backbone.marionette.map',
          sourceMappingURL : 'backbone.marionette.map',
          sourceMapPrefix : 2,
        }
      },
      core: {
        src : '<%= concat.core.dest %>',
        dest : 'lib/core/backbone.marionette.min.js',
        options : {
          banner: "<%= meta.banner %>",
          sourceMap : 'lib/core/backbone.marionette.map',
          sourceMappingURL : '<%= uglify.bundle.options.sourceMappingURL %>',
          sourceMapPrefix : 1
        }
      }
    },

    jasmine : {
      options : {
        helpers : [
          '<%= assets.sinon %>',
          '<%= assets.jasmineSinon %>',
          'spec/javascripts/helpers/*.js'
        ],
        specs : 'spec/javascripts/**/*.spec.js',
        vendor : [
          '<%= assets.jquery %>',
          '<%= assets.underscore %>',
          '<%= assets.backbone %>',
          '<%= assets.babysitter %>',
          '<%= assets.wreqr %>',
        ],
      },
      marionette : {
        src : [
          '<%= preprocess.tmp.dest %>',
          'spec/javascripts/support/marionette.support.js'
        ],
      }
    },

    plato: {
      marionette : {
        src : 'src/*.js',
        dest : 'reports',
        options : {
          jshint : grunt.file.readJSON('.jshintrc')
        }
      }
    },

    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      marionette : [ 'src/*.js' ]
    },

    watch: {
      marionette : {
        files : ['src/**/*.js', 'spec/**/*.js'],
        tasks : ['jshint', 'jasmine:marionette']
      },
      server : {
        files : ['src/**/*.js', 'spec/**/*.js'],
        tasks : ['jasmine:marionette:build']
      }
    },

    connect: {
      server: {
        options: {
          port: 8888
        }
      }
    }
  });

  grunt.registerTask('default', 'An alias task for running tests.', ['test']);

  grunt.registerTask('test', 'Run the unit tests.', ['jshint', 'preprocess:tmp', 'jasmine:marionette', 'clean']);

  grunt.registerTask('dev', 'Auto-lints while writing code.', ['test', 'watch:marionette']);

  grunt.registerTask('build', 'Build all three versions of the library.', ['clean:lib', 'jshint', 'preprocess', 'concat', 'uglify', 'clean:tmp']);

};
