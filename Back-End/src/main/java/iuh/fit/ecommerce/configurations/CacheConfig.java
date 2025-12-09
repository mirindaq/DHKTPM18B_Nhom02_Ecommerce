package iuh.fit.ecommerce.configurations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {
    public static final String PROVINCE_CACHE = "provinces";
    public static final String  CATEGORY_CACHE = "categories";
    public static final String BRAND_CACHE = "brands";
    public static final String BANNER_CACHE = "banners";
    public static final String RANKING_CACHE = "rankings";
    public static final String ARTICLE_CATEGORY_CACHE = "article-categories";
    public static final String VARIANT_CACHE = "variants";
    public static final String CATEGORY_BRAND_CACHE = "category-brands";
    public static final String FILTER_CRITERIA_CACHE = "filter-criteria";

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Cấu hình type information với NON_FINAL để đảm bảo ResponseWithPagination có type info
        objectMapper.activateDefaultTyping(
            objectMapper.getPolymorphicTypeValidator(),
            com.fasterxml.jackson.databind.ObjectMapper.DefaultTyping.NON_FINAL,
            com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);
        
        // ObjectMapper riêng cho các cache có List trực tiếp (không có type info cho List)
        ObjectMapper listObjectMapper = new ObjectMapper();
        listObjectMapper.registerModule(new JavaTimeModule());
        listObjectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        Jackson2JsonRedisSerializer<Object> listSerializer = new Jackson2JsonRedisSerializer<>(listObjectMapper, Object.class);
        
        // Default cache configuration (24 hours TTL for level 1 cache)
        // Dùng cho các cache có ResponseWithPagination (cần type info)
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(24))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
                .disableCachingNullValues();

        // Configuration riêng cho các cache có List trực tiếp (không có type info)
        RedisCacheConfiguration listConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(24))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(listSerializer))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // Các cache có List trực tiếp → dùng listConfig (không có type info)
        cacheConfigurations.put(PROVINCE_CACHE, listConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigurations.put(RANKING_CACHE, listConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigurations.put(BANNER_CACHE, listConfig.entryTtl(Duration.ofHours(1)));

        // Các cache có ResponseWithPagination → dùng defaultConfig (có type info)
        cacheConfigurations.put(CATEGORY_CACHE, defaultConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigurations.put(BRAND_CACHE, defaultConfig.entryTtl(Duration.ofHours(12)));

        cacheConfigurations.put(ARTICLE_CATEGORY_CACHE, defaultConfig.entryTtl(Duration.ofHours(12)));

        // Các cache có List trực tiếp → dùng listConfig (không có type info)
        cacheConfigurations.put(VARIANT_CACHE, listConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigurations.put(CATEGORY_BRAND_CACHE, listConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigurations.put(FILTER_CRITERIA_CACHE, listConfig.entryTtl(Duration.ofHours(12)));

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}

