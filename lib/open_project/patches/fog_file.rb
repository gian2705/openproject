if Gem.loaded_specs["carrierwave"].version > Gem::Version.new('1.3.1')
  raise "Check if these patches of Carrierwave are still required"
end

module OpenProject::Patches::CarrierwaveSanitizedFile
  extend ActiveSupport::Concern

  included do
    # create the directory if it doesn't exist
    # Overwritten to avoid ruby 2.7 deprecations
    def mkdir!(path, directory_permissions)
      options = {}
      options[:mode] = directory_permissions if directory_permissions
      FileUtils.mkdir_p(File.dirname(path), **options) unless File.exist?(File.dirname(path))
    end
  end
end

CarrierWave::SanitizedFile.send(:include, OpenProject::Patches::CarrierwaveSanitizedFile)
