package operations_frontend.apiServices;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service

public class OrdersService {
    @Autowired
    private WebClient webClient;

    public List<Integer> getYears() {
        List<Integer> response = webClient.get().uri("/getYears")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToFlux(Integer.class)
                .collectList()
                .block();
        return response;
    }

}
