REDIS_HOST      = "localhost:6379"
REDIS_NAMESPACE = "treedee:#{Rails.env}"
REDIS_DB        = 2

module TreeDee
  def self.redis_connection
    host, port = REDIS_HOST.split(":")
    Redis::Namespace.new(REDIS_NAMESPACE, redis: Redis.new(host: host, port: port, db: REDIS_DB))
  end
end

$redis = TreeDee.redis_connection