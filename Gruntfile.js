module.exports = function ( grunt ) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-aws');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-devcode');
  grunt.loadNpmTasks('grunt-phonegap-build');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-http-server');

  var userConfig = require( './config/build.config.js' );

  /**
   * This is the configuration object Grunt uses to give each plugin its
   * instructions.
   */
  var taskConfig = {
    /**
     * We read in our `package.json` file so we can access the package name and
     * version. It's already there, so we don't repeat ourselves here.
     */
    pkg: grunt.file.readJSON("package.json"),

    conf: grunt.file.readJSON("./config/secret.json"),

    /**
     * The banner is the comment that is placed at the top of our compiled
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner:
        '/**\n' +
        ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
        ' */\n'
    },
    /**
     * Increments the version number, etc.
     */
    bump: {
      options: {
        files: [
          "package.json",
          "bower.json"
        ],
        commit: false,
        commitMessage: 'chore(release): v%VERSION%',
        commitFiles: [
          "package.json",
          "client/bower.json"
        ],
        createTag: false,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin'
      }
    },
    /**
    * run http server for local dev
    */
    'http-server': {

        'dev': {

            // the server root directory
            root: "<%= build_dir %>",
            port: 8081,
            host: "127.0.0.1",

            cache: 0,
            showDir : true,
            autoIndex: true,
            ext: "html",

            runInBackground: true,
            logFn: function(req, res, error) { }

        },
        'prod': {

            // the server root directory
            root: "<%= compile_dir %>",
            port: 8081,
            host: "127.0.0.1",

            cache: 0,
            showDir : true,
            autoIndex: true,
            ext: "html",

            runInBackground: false,
            logFn: function(req, res, error) { }

        }


    },

    /**
     * The directories to delete when `grunt clean` is executed.
     */
    clean: {
        build: ['<%= base_dir %>'],
        bin: ['<%= base_dir %>'],
        templates:['dist/templates-app.js', 'dist/templates-common.js']
    },

    /**
     * The `copy` task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `compile_dir`.
     */
    copy: {
      build_app_assets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= build_dir %>/assets/',
            cwd: 'src/assets',
            expand: true
          }
       ]
      },
      build_vendor_assets: {
        files: [
          {
            src: [ '<%= vendor_files.assets %>' ],
            dest: '<%= build_dir %>/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          }
       ]
      },
      build_vendor_fonts: {
        files: [
          {
            src: [ '<%= vendor_files.fonts %>' ],
            dest: '<%= build_dir %>/assets/fonts/',
            cwd: '.',
            expand: true,
            flatten: true
          }
       ]
      },
      build_i18n: {
      files: [
          {
              src: [ '**' ],
              dest: '<%= build_dir %>/i18n/',
              cwd: 'src/i18n',
              expand: true
          }
        ]
      },
      build_appjs: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorjs: {
        files: [
          {
            src: [ '<%= vendor_files.js %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorjs_phonegap: {
          files: [
              {
                  src: [ '<%=phonegap_files.js %>' ],
                  dest: '<%= build_dir %>/',
                  cwd: '.',
                  expand: true
              }
          ]
      },
      compile_assets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= compile_dir %>/assets',
            cwd: '<%= build_dir %>/assets',
            expand: true
          }
        ]
      },
      compile_i18n: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= compile_dir %>/i18n/',
            cwd: 'src/i18n',
            expand: true
          }
        ]
      },
      build_phonegap_config: {
        files: [
          {
            src: [ 'phonegap.config.xml' ],
            dest: '<%= build_dir %>/',
            cwd: 'config/',
            rename: function(dest, src) {
              return dest + 'config.xml';
            },
            expand: true
          }
        ]
      },
      compile_phonegap_config: {
        files: [
          {
            src: [ 'phonegap.config.xml' ],
            dest: '<%= compile_dir %>/',
            cwd: 'config/',
            rename: function(dest, src) {
              return dest + 'config.xml';
            },
            expand: true
          }
        ]
      }
    },
      devcode :
      {
          options :
          {
              html: true,        // html files parsing?
              js: true,          // javascript files parsing?
              css: true,         // css files parsing?
              clean: true,       // removes devcode comments even if code was not removed
              block: {
                  open: 'devcode', // with this string we open a block of code
                  close: 'endcode' // with this string we close a block of code
              },
              dest: 'build'       // default destination which overwrittes environment variable
          },
          phonegap : {           // settings for task used with 'devcode:web'
              options: {
                  source: '<%= build_dir %>/',
                  dest: '<%= build_dir %>/',
                  env: 'mobile'
              }
          },
          phonegapprod : {           // settings for task used with 'devcode:web'
              options: {
                  source: '<%= compile_dir %>/',
                  dest: '<%= compile_dir %>/',
                  env: 'mobile'
              }
          },
          webdev: {
              options: {
                  source: '<%= build_dir %>/',
                  dest: '<%= build_dir %>/',
                  env: 'web'
              }
          },
          webprod: {
              options: {
                  source: '<%= compile_dir %>/',
                  dest: '<%= compile_dir %>/',
                  env: 'web'
              }
          },
          build: {
              options: {
                  source: '<%= build_dir %>/',
                  dest: '<%= build_dir %>/',
                  env: 'build',
                  block: {
                      open: 'env',
                      close: 'endenv'
                  },
              }
          },
          compile: {
              options: {
                  source: '<%= compile_dir %>/',
                  dest: '<%= compile_dir %>/',
                  env: 'compile',
                  block: {
                      open: 'env',
                      close: 'endenv'
                  },
              }
          }
      },

    /**
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      build_css: {
        src: [
          '<%= vendor_files.css %>',
          '<%= sass.build.files[0].dest %>',
          '<%= less.build.dest %>'
        ],
        dest: '<%= less.build.dest %>'
      },
      /**
       * The `compile_js` target is the concatenation of our application source
       * code and all specified vendor source code into a single file.
       */
      compile_js: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= vendor_files.js %>',
          '<%= app_files.js %>',
          'config/module.prefix',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          'config/module.suffix'
        ],
        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      },
      compile_js_phonegap: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= phonegap_files.js %>',
          '<%= app_files.js %>',
          'config/module.prefix',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          'config/module.suffix'
        ],
        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    /**
     * `ngAnnotate` annotates the sources before minifying. That is, it allows us
     * to code without the array syntax.
     */
    ngAnnotate: {
      compile: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            cwd: '<%= build_dir %>',
            dest: '<%= build_dir %>',
            expand: true
          }
        ]
      }
    },


    /**
     * Minify the sources!
     */
    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>',
          mangle: false
        },
        files: {
          '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
        }
      }
    },
    sass: {
      build: {
        files: [{
          src: [ '<%= app_files.sass %>' ],
          dest: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        }]
      },
      compile: {
        files: [{
          src: [ '<%= app_files.sass %>' ],
          dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        }]
      }
    },

    /**
     * `less` handles our LESS compilation and uglification automatically.
     * Only our `main.less` file is included in compilation; all other files
     * must be imported from this file.
     */
    less: {
      build: {
        src: [ '<%= app_files.less %>' ],
        dest: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css',
        options: {
          compile: true,
          compress: false,
          noUnderscores: false,
          noIDs: false,
          zeroUnits: false
        }
      },
      compile: {
        src: [ '<%= app_files.less %>' ],
        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css',
        options: {
          compile: true,
          compress: true,
          noUnderscores: false,
          noIDs: false,
          zeroUnits: false
        }
      }
    },

    /**
     * `jshint` defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in `options`. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside `src/`.
     */
    jshint: {
      src: [
        '<%= app_files.js %>'
      ],
      test: [
        '<%= app_files.jsunit %>'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        laxcomma : true
      },
      globals: {}
    },

    /**
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: {
        /**
         * These are the templates from `src/app`.
         */
        app: {
          options: {
            base: 'src/app'
          },
          src: [ '<%= app_files.atpl %>' ],
          dest: '<%= base_dir %>/<%= stage %>/<%= env %>/templates-app.js'
        },

        /**
         * These are the templates from `src/common`.
         */
        common: {
          options: {
            base: 'src/common'
          },
          src: [ '<%= app_files.ctpl %>' ],
          dest: '<%= base_dir %>/<%= stage %>/<%= env %>/templates-common.js'
        }
    },

    /**
     * The Karma configurations.
    */
    karma: {
      options: {
        configFile: '<%= base_dir %>/<%= stage %>/<%= env %>/karma-unit.js'
      },
      unit: {
        runnerPort: 9101,
        background: true
      },
      continuous: {
        singleRun: true
      }
    },

    /**
     * The `index` task compiles the `index.html` file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {
      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/src/**/*.js',
          '<%= html2js.common.dest %>',
          '<%= html2js.app.dest %>',
          '<%= vendor_files.css %>',
          '<%= less.build.dest %>'
        ]
      },
      buildphonegap: {
        dir: '<%= build_dir %>',
        src: [
          '<%= phonegap_files.js %>',
          '<%= build_dir %>/src/**/*.js',
          '<%= html2js.common.dest %>',
          '<%= html2js.app.dest %>',
          '<%= phonegap_files.css %>',
          '<%= less.build.dest %>'
        ]
      },

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      compile: {
        dir: '<%= compile_dir %>',
        src: [
          '<%= concat.compile_js.dest %>',
          '<%= vendor_files.css %>',
          '<%= less.compile.dest %>'
        ]
      }
    },

    /**
     * This task compiles the karma template so that changes to its file array
     * don't have to be managed manually.
     */
    karmaconfig: {
      unit: {
        dir: '<%= base_dir %>/<%= stage %>/<%= env %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          '<%= test_files.js %>'
        ]
      }
    },
    /**
    * Deploy build dir in S3
    */
    s3: {
      options: {
        accessKeyId: "<%= conf.aws.accessKeyId %>",
        secretAccessKey: "<%= conf.aws.secretAccessKey %>",
        cache: false,
        access: "public-read",
        region: "<%= conf.aws.region %>",
        bucket: "<%= conf.aws.bucket %>"
      },
      build: {
        cwd: "<%= base_dir %>/<%= stage %>/<%= env %>/",
        src: "**"
      }
    },

    /**
     * And for rapid development, we have a watch set up that checks to see if
     * any of the files listed below change, and then to execute the listed
     * tasks when they do. This just saves us from having to type "grunt" into
     * the command-line every time we want to see what we're working on; we can
     * instead just leave "grunt watch" running in a background terminal. Set it
     * and forget it, as Ron Popeil used to tell us.
     *
     * But we don't need the same thing to happen for all the files.
     */
    delta: {
        /**
         * By default, we want the Live Reload to work for all tasks; this is
         * overridden in some tasks (like this file) where browser resources are
         * unaffected. It runs by default on port 35729, which your browser
         * plugin should auto-detect.
         */
        options: {
          livereload: true
        },

        /**
         * When the Gruntfile changes, we just want to lint it. In fact, when
         * your Gruntfile changes, it will automatically be reloaded!
         */
        gruntfile: {
          files: 'Gruntfile.js',
          tasks: [ 'jshint:gruntfile' ],
          options: {
            livereload: false
          }
        },

        /**
         * When our JavaScript source files change, we want to run lint them and
         * run our unit tests.
         */
        jssrc: {
          files: [
            '<%= app_files.js %>',
            'src/i18n/**'
          ],
          tasks: [ 'set_env:web', 'set_stage:build', 'jshint:src', 'copy:build_appjs', 'copy:build_i18n', 'devcode:webdev', 'devcode:build']
        },

        /**
         * When assets are changed, copy them. Note that this will *not* copy new
         * files, so this is probably not very useful.
         */
        assets: {
          files: [
            'src/assets/**/*'
          ],
          tasks: [ 'set_env:web', 'set_stage:build', 'copy:build_app_assets' ]
        },

        /**
         * When index.html changes, we need to compile it.
         */
        html: {
          files: [ '<%= app_files.html %>' ],
          tasks: [ 'set_env:web', 'set_stage:build', 'index:build', 'devcode:webdev', 'devcode:build' ]
        },
        /**
         * When our templates change, we only rewrite the template cache.
         */
        tpls: {
          files: [
            '<%= app_files.atpl %>',
            '<%= app_files.ctpl %>'
          ],
          tasks: [  'set_env:web', 'set_stage:build', 'html2js' ]
        },

        /**
         * When the CSS files change, we need to compile and minify them.
         */
        less: {
          files: [ 'src/**/**.less' ],
          tasks: [ 'set_env:web', 'set_stage:build', 'less:build' ]
        },
        sass: {
          files: [ 'src/**/**.scss' ],
          tasks: [ 'set_env:web', 'set_stage:build', 'sass:build' ]
        },


        /**
         * When a JavaScript unit test file changes, we only want to lint it and
         * run the unit tests. We don't want to do any live reloading.
         */
        jsunit: {
          files: [
            '<%= app_files.jsunit %>'
          ],
          tasks: [ 'set_env:web', 'set_stage:build', 'jshint:test', 'karma:unit:run' ],
          options: {
            livereload: false
          }
        }

    },
    shell: {
        install: {
            options: {
            stderr: true
            },
            command: [
            'adb install -r ./dist/phonegap/app.apk'
            ].join('&&')
        },
        androidLog: {
            options: {
            stderr: true
            },
            command: [
            'adb logcat CordovaLog:* GCMBaseIntentService:* GCMBroadcastReceiver:*   PluginManager:* *:S'
            ].join('&&')
        }
    },
    compress: {
        bin: {
            options: {
                archive: 'dist/phonegap/upload_compile.zip'
            },
            files: [
                //{src: ['config.xml'], dest: '.', cwd:'./config/'},
                {expand : true, cwd: '<%= compile_dir %>/', src: ['**/*.*'], dest: '.'}
            ]

        },
        build: {
            options: {
                archive: 'dist/phonegap/upload_build.zip'
            },
            files: [
                //{src: ['config/config.xml'], dest: '.'},
                {expand : true, cwd: '<%= build_dir %>/', src: ['**/*.*'], dest: '.'}
            ]
        }
    },
    "phonegap-build": {
        release: {
            options: {
            archive: "dist/upload.zip",
            "appId": "<%=conf.phonegap.appId %>",
            "user": {
                "token": "<%=conf.phonegap.token %>"
            },
            keys: {
                ios: { "password": "<%=conf.phonegap.keys.ios.password %>" },
                android: { "key_pw": "<%=conf.phonegap.keys.android.key_pw %>", "keystore_pw": "<%=conf.phonegap.keys.android.keystore_pw %>" }
            },
            download: {
                ios: './dist/phonegap/app.ipa',
                android: './dist/phonegap/app.apk'
            },
            pollRate : 10
            }
        },
        build: {
            options: {
            archive: "dist/phonegap/upload_build.zip",
            "appId": "<%=conf.phonegap.appId %>",
            "user": {
                "token": "<%=conf.phonegap.token %>"
            },
            keys: {
                ios: { "password": "<%=conf.phonegap.keys.ios.password %>" },
                android: { "key_pw": "<%=conf.phonegap.keys.android.key_pw %>", "keystore_pw": "<%=conf.phonegap.keys.android.keystore_pw %>" }
            },
            download: {
                ios: './dist/phonegap/app.ipa',
                android: './dist/phonegap/app.apk'
            },
            pollRate : 10
            }
        }
    }
  };

  grunt.registerTask("set_env", function(data) {
    userConfig.env = data;
    userConfig.build_dir = userConfig.build_dir + "/" + data;
    userConfig.compile_dir = userConfig.compile_dir + "/" + data;
    grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  });
  grunt.registerTask("set_stage", function(data) {
    userConfig.stage = data;
    grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );
  });

  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  /**
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   */
  grunt.renameTask( 'watch', 'delta');
  grunt.registerTask( 'watch', [ 'set_env:web', 'set_stage:build', 'web-employee', 'http-server:dev', 'delta' ] );
  grunt.registerTask( 'test:web', [ 'set_env:web', 'set_stage:build', 'karmaconfig', 'karma:continuous' ] );
  grunt.registerTask( 'test:mobile', [ 'set_env:mobile', 'set_stage:build', 'karmaconfig', 'karma:continuous' ] );
  // grunt.registerTask( 'default', [ 'build', 'compile' ] );
  // grunt.registerTask( 'test', ['karmaconfig', 'karma:continuous']);
  grunt.registerTask( 'build:web',      ['set_env:web','set_stage:build', 'web-employee', 'karmaconfig', 'karma:continuous']);
  grunt.registerTask( 'build:mobile',      ['set_env:mobile','set_stage:build', 'mobile-employee', 'karmaconfig', 'karma:continuous', 'phonegap-build:build', 'shell:install']);
  grunt.registerTask( 'compile:web',    ['set_env:web','set_stage:compile', 'web-release', 'karmaconfig', 'karma:continuous', 'http-server:prod']);
  grunt.registerTask( 'compile:mobile', ['set_env:mobile','set_stage:compile', 'mobile-release', 'karmaconfig', 'karma:continuous', "phonegap-build:release", "shell:install"]);

  grunt.registerTask( 'deploy:build:s3', [ 'set_env:web', 'set_stage:build', 's3'] );
  grunt.registerTask( 'deploy:compile:s3', [ 'set_env:web', 'set_stage:compile', 's3'] );

  // grunt.registerTask( 'use-less-build', ['less:build']);
  // grunt.registerTask( 'use-less-compile', ['less:compile']);
  // grunt.registerTask( 'use-sass-build', ['sass:build', 'clean:sass_build_tmp']);
  // grunt.registerTask( 'use-sass-compile', ['sass:compile', 'clean:sass_compile_tmp']);

  grunt.registerTask( 'web-release', [
    'clean:bin', 'html2js', 'jshint', 'copy:compile_assets','copy:compile_i18n', 'ngAnnotate',
    'concat:compile_js', 'clean:templates', 'cssparser', 'index:compile', 'devcode:webprod', 'devcode:compile', 'uglify',
  ]);

  grunt.registerTask( 'web-employee', [
    'clean:build', 'html2js', 'jshint', 'cssparser',
    'concat:build_css', 'copy:build_app_assets', 'copy:build_vendor_assets', 'copy:build_vendor_fonts',
    'copy:build_appjs', 'copy:build_i18n', 'copy:build_vendorjs', 'clean:templates', 'index:build',
    'devcode:webdev', 'devcode:build'
  ]);

  grunt.registerTask( 'mobile-release', [
    'clean:bin', 'html2js', 'jshint', 'copy:compile_assets','copy:compile_i18n', 'ngAnnotate',
    'concat:compile_js_phonegap', 'cssparser',  'index:compile',
    'devcode:phonegap', 'devcode:compile', 'uglify', 'copy:compile_phonegap_config', 'compress:bin', 'clean:templates'
  ]);

  grunt.registerTask( 'mobile-employee', [
    'clean:build', 'html2js', 'jshint', 'cssparser',
    'concat:build_css', 'copy:build_app_assets', 'copy:build_vendor_assets', 'copy:build_vendor_fonts',
    'copy:build_appjs', 'copy:build_i18n', 'copy:build_vendorjs_phonegap', 'index:buildphonegap',
    'devcode:phonegap', 'devcode:build', 'copy:build_phonegap_config', 'compress:build', 'clean:templates'
  ]);


  /**
   * A utility function to get all app JS sources.
   */
  function filterForJS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.js$/ );
    });
  }

  /**
   * A utility function to get all app CSS sources.
   */
  function filterForCSS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.css$/ );
    });
  }



  grunt.registerTask("cssparser", function() {
    grunt.task.run(grunt.config('css_parser') + ":" + grunt.config('stage'));
  });


  /**
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask( 'index', 'Process index.html template', function () {
    var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/', 'g' );
    var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });
    var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });

    grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' )
          }
        });
      }
    });
  });

  /**
   * In order to avoid having to specify manually the files needed for karma to
   * run, we use grunt to manage the list for us. The `karma/*` files are
   * compiled as grunt templates for use by Karma. Yay!
   */
  grunt.registerMultiTask( 'karmaconfig', "karma configuration", function (type) {
    var folder = 'build_dir';
    if(grunt.config( 'stage' ) == "compile") {
      folder = 'compile_dir';
    }
    var jsFiles = filterForJS( this.filesSrc );
    grunt.file.copy( 'config/karma-unit.tpl.js', grunt.config( folder ) + '/karma-unit.js', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles
          }
        });
      }
    });
  });

};
