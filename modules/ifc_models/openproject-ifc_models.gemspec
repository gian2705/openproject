# encoding: UTF-8

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "openproject-ifc_models"
  s.version     = "1.0.0"
  s.authors     = "OpenProject GmbH"
  s.email       = "info@openproject.com"
  s.homepage    = "https://community.openproject.org/"
  s.summary     = "Save and view IFC models in OpenProject."
  s.description = "This OpenProject plugin allows to store and view IFC models."

  s.files = Dir["{app,config,db,lib}/**/*", "CHANGELOG.md", "README.rdoc"]
  s.test_files = Dir["spec/**/*"]

  s.add_dependency 'activerecord-import'
  s.add_dependency 'rubyzip', '~> 1.2'
end
