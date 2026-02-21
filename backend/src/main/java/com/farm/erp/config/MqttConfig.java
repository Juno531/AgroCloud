package com.farm.erp.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.integration.annotation.ServiceActivator;
// import org.springframework.integration.channel.DirectChannel;
// import org.springframework.integration.core.MessageProducer;
// import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
// import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
// import org.springframework.messaging.MessageChannel;
// import org.springframework.messaging.MessageHandler;

/**
 * IoT Sensor Data Collection - MQTT Configuration
 * 
 * [Architecture Design]
 * Protocol: MQTT (Lightweight, suitable for farm sensors)
 * Broker: EMQX or Mosquitto (Docker Container)
 * 
 * [Required Dependencies in pom.xml]
 * <dependency>
 * <groupId>org.springframework.boot</groupId>
 * <artifactId>spring-boot-starter-integration</artifactId>
 * </dependency>
 * <dependency>
 * <groupId>org.springframework.integration</groupId>
 * <artifactId>spring-integration-mqtt</artifactId>
 * </dependency>
 */
// @Configuration
public class MqttConfig {

    /*
     * @Bean
     * public MessageChannel mqttInputChannel() {
     * return new DirectChannel();
     * }
     * 
     * @Bean
     * public MessageProducer inbound() {
     * MqttPahoMessageDrivenChannelAdapter adapter =
     * new MqttPahoMessageDrivenChannelAdapter("tcp://localhost:1883",
     * "farm-erp-backend", "sensors/#");
     * adapter.setCompletionTimeout(5000);
     * adapter.setConverter(new DefaultPahoMessageConverter());
     * adapter.setQos(1);
     * adapter.setOutputChannel(mqttInputChannel());
     * return adapter;
     * }
     * 
     * @Bean
     * 
     * @ServiceActivator(inputChannel = "mqttInputChannel")
     * public MessageHandler handler() {
     * return message -> {
     * String topic = (String)
     * message.getHeaders().get(org.springframework.integration.mqtt.support.
     * MqttHeaders.RECEIVED_TOPIC);
     * String payload = (String) message.getPayload();
     * 
     * System.out.println("Received MQTT Message - Topic: " + topic + ", Payload: "
     * + payload);
     * 
     * // TODO: Parse payload (JSON) -> Map to SensorData Entity -> Save to DB
     * };
     * }
     */
}
