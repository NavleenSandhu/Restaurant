package operations_frontend.auth;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtUtil {
    private String secret;

    public JwtUtil(Environment env) {
        this.secret = env.getProperty("secrets.jwt_secret");
    }

    public String generateToken(String id) {
        SecretKey key = Keys.hmacShaKeyFor(this.secret.getBytes());
        return Jwts.builder()
                .setSubject(id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 15))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Cookie generateCookie(String id) {
        String token = generateToken(id);
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(-1);
        return cookie;
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(this.secret.getBytes())
                .setAllowedClockSkewSeconds(60 * 15)
                .build()
                .parseClaimsJws(token)
                .getBody();

    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    public String getEmailFromToken(String token) {
        return extractClaims(token).getSubject();
    }

    public String validateUser(Cookie[] cookies, String validEmail) {
        String sessionExpiredParams = "?status=failure&message=Session Expired!";
        try {
            if (cookies == null) {
                return "redirect:/login";
            }
            String token = null;
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("token")) {
                    token = cookie.getValue();
                }
            }
            if (token == null || isTokenExpired(token)) {
                return "redirect:/login" + sessionExpiredParams;
            }
            String currentEmail = getEmailFromToken(token);
            if (!currentEmail.equals(validEmail)) {
                return "redirect:/login?status=danger&message=You are not authorized to login to this page with "
                        + currentEmail + "!";
            }
        } catch (Exception e) {
            return "redirect:/login" + sessionExpiredParams;
        }
        return null;
    }

    public void logoutUser(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    public void regenerateTokenToCookies(HttpServletResponse response, Cookie[] cookies) {
        String token = null;
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("token")) {
                token = cookie.getValue();
            }
        }
        response.addCookie(generateCookie(getEmailFromToken(token)));
    }
}
