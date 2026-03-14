#!/bin/sh
# Pre-create reply topics to avoid gateway crash on subscribe (UNKNOWN_TOPIC_OR_PARTITION)
set -e
echo "Waiting for Kafka..."
sleep 5
KAFKA_BIN="/opt/kafka/bin/kafka-topics.sh"
BROKER="${KAFKA_BROKERS:-localhost:9092}"

for topic in admin.getDashboard.reply; do
  $KAFKA_BIN --bootstrap-server "$BROKER" --create --topic "$topic" --partitions 1 --replication-factor 1 2>/dev/null || true
done
echo "Kafka topics ready"
