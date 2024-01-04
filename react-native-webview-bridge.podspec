require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|

  s.name            = "react-native-webview-bridge"
  s.version         = package['version']
  s.homepage        = "https://github.com/alinz/react-native-webview-bridge"
  s.summary         = "A webview bridge for react-native"
  s.license         = "MIT"
  s.author          = { "alinz" => "a.najafizadeh@gmail.com" }
  s.ios.deployment_target = '9.0'
  s.tvos.deployment_target = '9.0'
  s.source          = { :git => "https://github.com/HoneyBook/react-native-webview-bridge"}
  s.source_files    = 'ios/*.{h,m}'
  s.preserve_paths  = "**/*.js"
  s.frameworks = 'UIKit', 'QuartzCore', 'Foundation'

  s.dependency 'React'

end
