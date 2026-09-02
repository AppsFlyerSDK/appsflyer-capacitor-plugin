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
  s.ios.deployment_target  = '15.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'

    # AppsFlyerRPC
    if defined?($AppsFlyerStrictMode) && $AppsFlyerStrictMode
      s.dependency 'AppsFlyerRPC/Strict', package['iosSdkVersion']
      s.pod_target_xcconfig = { 'OTHER_SWIFT_FLAGS' => '-D AFSDK_NO_IDFA' }
    else
      s.dependency 'AppsFlyerRPC', package['iosSdkVersion']
    end

end
