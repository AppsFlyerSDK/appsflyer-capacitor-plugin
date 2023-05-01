require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'AppsflyerCapacitorPlugin'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.static_framework = true
  s.ios.deployment_target  = '13.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'

    # AppsFlyerFramework
    if defined?($AppsFlyerStrictMode)
      Pod::UI.puts "#{s.name}: Using AppsFlyerFramework/Strict mode"
      s.dependency 'AppsFlyerFramework/Strict', package['iosSdkVersion']
      s.xcconfig = {'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => '$(inherited) AFSDK_NO_IDFA' }
    else
      Pod::UI.puts "#{s.name}: Using default AppsFlyerFramework.You may require App Tracking Transparency. Not allowed for Kids apps."
      Pod::UI.puts "#{s.name}: You may set variable `$AppsFlyerStrictMode=true` in Podfile to use strict mode for kids apps."
      s.dependency 'AppsFlyerFramework', package['iosSdkVersion']
    end

end
