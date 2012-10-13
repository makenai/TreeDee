Resque.redis.namespace = "resque:earl:#{Rails.env}"

Resque::Server.use(Rack::Auth::Basic) do |user, pass|
  user == "admin"
  pass == "threed33"
end