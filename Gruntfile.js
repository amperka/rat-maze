module.exports = function (grunt) {
	grunt.initConfig({
		shell: {
			dev: {
				command: 'node index.js',
				options: {
					execOptions: {
						cwd: 'dev'
					}
				}
			},
			prod: {
				command: 'node index.js',
				options: {
					stderr: true,
					stdout: true,
					execOptions: {
						cwd: 'prod'
					}
				}
			}
		},
		uglify: {
			prod: {
				files: [{
					expand: true,
					cwd: 'dev',
					src: '**/*.js',
					dest: 'prod'
					//flatten: true   // remove all unnecessary nesting
				}]
			}
		},
		sass: {
			build: {
				options: {                       // Target options
					style: 'compressed'
					//,убрать мап
				},
				files: [{					
					expand: true,
					cwd: 'dev/public', /* исходная директория */
					src: '*.css', /* имена шаблонов */
					dest: 'prod/public', /* результирующая директория */
					ext: '.css'
				}]				
			},
			css: { /* Цель */
				files: [{
					expand: true,
					cwd: 'dev/public', /* исходная директория */
					src: '*.scss', /* имена шаблонов */
					dest: 'prod/public', /* результирующая директория */
					ext: '.css'
				}]
			}
		},
		htmlmin: {                                     // Task
			prod: {                                      // Target
				options: {                                 // Target options
					removeComments: true,
					collapseWhitespace: true
				},
				files: {                                   // Dictionary of files
					'prod/public/index.html': 'dev/public/index.html',     // 'destination': 'source'
				}
			}
		},
		copy: {
			prod: {
				files: [{
					expand: true,
					cwd: 'dev/public/media/',
					src: '**',
					dest: 'prod/public/media/'
				}],
			}
		}
	});

	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['shell:dev']);
	grunt.registerTask('prod', ['uglify:prod', 'sass:build', 'htmlmin:prod', 'copy']);
};