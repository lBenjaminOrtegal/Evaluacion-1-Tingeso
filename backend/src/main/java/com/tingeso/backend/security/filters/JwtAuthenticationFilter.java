package com.tingeso.backend.security.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tingeso.backend.entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.*;

import static com.tingeso.backend.security.TokenJwtConfig.*;

public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private static final ObjectMapper mapper = new ObjectMapper();

    public JwtAuthenticationFilter(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
        setFilterProcessesUrl("/api/auth/login");
    }

    @Override
    public Authentication attemptAuthentication(
            HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {

        try {
            User user = mapper.readValue(request.getInputStream(), User.class);

            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());

            return authenticationManager.authenticate(authenticationToken);
        } catch (IOException e) {
            throw new RuntimeException("error while reading credentials", e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authResult)
            throws IOException, ServletException {

        org.springframework.security.core.userdetails.User user =
                (org.springframework.security.core.userdetails.User) authResult.getPrincipal();
        String email = user.getUsername();
        Collection<? extends GrantedAuthority> roles = authResult.getAuthorities();
        boolean isAdmin = roles.stream().anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));

        Claims claims = Jwts.claims()
                .add("authorities", roles.stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList())
                .add("isAdmin", isAdmin)
                .add("email", email)
                .build();

        String token = Jwts.builder()
                .subject(email)
                .claims(claims)
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .issuedAt(new Date())
                .signWith(SECRET_KEY)
                .compact();

        response.addHeader(HEADER_AUTHORIZATION, PREFIX_TOKEN + token);

        Map<String, String> body = new HashMap<>();
        body.put("token", token);
        body.put("email", email);
        body.put("message", "you have successfully logged in");

        response.getWriter().write(mapper.writeValueAsString(body));
        response.setContentType(CONTENT_TYPE);
        response.setStatus(200);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request,
                                              HttpServletResponse response,
                                              AuthenticationException failed)
            throws IOException {
        Map<String, String> body = new HashMap<>();
        body.put("message", "invalid credentials");
        body.put("error", failed.getMessage());

        response.getWriter().write(mapper.writeValueAsString(body));
        response.setStatus(401);
        response.setContentType(CONTENT_TYPE);
    }

}
