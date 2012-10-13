require "resque/tasks"

task "resque:setup" => :environment

namespace :resque do
  desc "Clean up old workers"
  task :clean => :environment do
    host = ENV['WORKER_HOST'] or raise "WORKER_HOST environment variable not defined"
    Resque::Worker.all.each { |w| w.unregister_worker if w.id.split(":")[0] == host }
  end
end