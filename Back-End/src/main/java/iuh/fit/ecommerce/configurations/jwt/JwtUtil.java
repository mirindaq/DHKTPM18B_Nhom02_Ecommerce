package iuh.fit.ecommerce.configurations.jwt;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import iuh.fit.ecommerce.entities.User;
import iuh.fit.ecommerce.enums.TokenType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.InvalidParameterException;
import java.security.Key;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${spring.app.jwtAccessSecret}")
    private String jwtAccessSecret;

    @Value("${spring.app.jwtRefreshSecret}")
    private String jwtRefreshSecret;

    @Value("${spring.app.jwtAccessExpirationMs}")
    private int jwtAccessExpirationMs;

    @Value("${spring.app.jwtRefreshExpirationMs}")
    private int jwtRefreshExpirationMs;

    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("id", user.getId());
        return generateToken(claims, user, TokenType.ACCESS_TOKEN);
    }

    public String generateRefreshToken(User user){
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("id", user.getId());
        return generateToken(claims, user, TokenType.REFRESH_TOKEN);
    }

    public String generateToken(Map<String, Object> claims, User user, TokenType type) {
        long expiration = (type == TokenType.ACCESS_TOKEN) ? jwtAccessExpirationMs : jwtRefreshExpirationMs;
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(Date.from(Instant.now().plusMillis(expiration)))
                .signWith(getSignInKey(type))
                .compact();
    }


    public String getUserNameFromJwtToken(String token, TokenType type) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey(type))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken, TokenType type) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSignInKey(type))
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            throw ex;
        }
    }

    private Key getSignInKey(TokenType type){
        switch (type) {
            case ACCESS_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtAccessSecret));
            }
            case REFRESH_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtRefreshSecret));
            }
            default -> throw new InvalidParameterException("Invalid token type");
        }
    }

    public LocalDate getExpirationDateFromToken(String token, TokenType type) {
        Date expirationDate = Jwts.parserBuilder()
                .setSigningKey(getSignInKey(type))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();

        return expirationDate.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }

}
