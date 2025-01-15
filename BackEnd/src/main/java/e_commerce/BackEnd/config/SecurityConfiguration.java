package e_commerce.BackEnd.config;

import com.okta.spring.boot.oauth.Okta;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.accept.ContentNegotiationStrategy;
import org.springframework.web.accept.HeaderContentNegotiationStrategy;

@Configuration
//@EnableWebSecurity
public class SecurityConfiguration {

                    //Okta
//                    @Bean
//                    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//                        http
//                                .authorizeHttpRequests(authorizeRequests ->
//                                        authorizeRequests
//                                                .requestMatchers("/api/orders/**").authenticated()
//                                                .requestMatchers("/api/products/**", "/api/product-category/**",
//                                                        "/api/countries/**", "/api/states/**").permitAll()
//                                )
//                                .oauth2ResourceServer(oauth2ResourceServer ->
//                                        oauth2ResourceServer
//                                                .jwt(jwt -> jwt.decoder(jwtDecoder()))
//                                );
//
//                        // Configure CORS without using deprecated method
//                        http.cors(cors -> cors.configurationSource(request -> {
//                            var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
//                            corsConfiguration.setAllowedOrigins(List.of("http://localhost:4200"));
//                            corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//                            corsConfiguration.setAllowedHeaders(List.of("*"));
//                            corsConfiguration.setAllowCredentials(true);
//                            return corsConfiguration;
//                        }));
//
//                        http.setSharedObject(ContentNegotiationStrategy.class, new HeaderContentNegotiationStrategy());
//
//                        Okta.configureResourceServer401ResponseBody(http);
//
//                        return http.build();
//                    }
//
//    private JwtDecoder jwtDecoder() {
//        return NimbusJwtDecoder.withJwkSetUri("https://your-okta-domain/oauth2/default/v1/keys").build();
//    }

//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .authorizeHttpRequests(authorizeRequests ->
//                        authorizeRequests
//                                .requestMatchers("/api/orders/**").authenticated()
//                )
//                .oauth2ResourceServer(oauth2ResourceServer ->
//                        oauth2ResourceServer
//                                .jwt(jwt -> jwt.decoder(jwtDecoder()))
//                );
//
//        http.cors(cors -> cors.disable());
//        http.setSharedObject(ContentNegotiationStrategy.class, new HeaderContentNegotiationStrategy());
//
//        Okta.configureResourceServer401ResponseBody(http);
//
//        return http.build();
//    }

                    //Auth
//    @Bean
//    public ClientRegistrationRepository clientRegistrationRepository() {
//        ClientRegistration oktaRegistration = ClientRegistration.withRegistrationId("okta")
//                .clientId("0oal3o6g4sgLD1Y0s5d7")
//                //.clientSecret("yVFx_0VPng3puYj9eiXNm7SvrL9oM4waq5ez-Om2o4vyjxELz8umMGgEAAoRe08G")
//                .scope("openid", "profile", "email")
//                .authorizationUri("https://dev-75946766.okta.com/oauth2/v2.0/authorize")
//                .tokenUri("https://dev-75946766.okta.com/oauth2/v2.0/token")
//                .userInfoUri("https://dev-75946766.okta.com/userinfo")
//                .redirectUri("http://localhost:4200/login/callback")
//                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
//                .build();
//
//        return new InMemoryClientRegistrationRepository(oktaRegistration);
//    }

    @Bean
    protected SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        //protect endpoint /api/orders
        http.authorizeHttpRequests(requests ->
                        requests
                                .requestMatchers("/api/orders/**")
                                .authenticated()
                                .anyRequest().permitAll())
                .oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer.jwt(Customizer.withDefaults()));

        // + CORS filters
        http.cors(Customizer.withDefaults());

        // + content negotiation strategy
        http.setSharedObject(ContentNegotiationStrategy.class, new HeaderContentNegotiationStrategy());

        // + non-empty response body for 401 (more friendly)
        Okta.configureResourceServer401ResponseBody(http);

        // we are not using Cookies for session tracking >> disable CSRF
        //http.csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }
}
