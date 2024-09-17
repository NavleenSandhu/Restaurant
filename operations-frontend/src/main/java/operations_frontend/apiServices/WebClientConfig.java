package operations_frontend.apiServices;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.AllArgsConstructor;

@Configuration
@AllArgsConstructor
public class WebClientConfig {
    private Environment env;

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        return builder
                .baseUrl(env.getProperty("orders.api.url"))
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
