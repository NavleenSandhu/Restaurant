package operations_frontend.rabbitMQ;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public Queue getItemsQueue() {
        return new Queue("getItemsQueue", false);
    }

    @Bean
    public Queue addItemQueue() {
        return new Queue("addItemQueue", false);
    }

    @Bean
    public Queue editItemQueue() {
        return new Queue("editItemQueue", false);
    }

    @Bean
    public Queue deleteItemQueue() {
        return new Queue("deleteItemQueue", false);
    }

    @Bean
    public Queue loginQueue() {
        return new Queue("loginQueue", false);
    }

    @Bean
    public Queue registerQueue() {
        return new Queue("registerQueue", false);
    }
    @Bean
    public Queue getCategoriesQueue() {
        return new Queue("getCategoriesQueue", false);
    }
    @Bean
    public Queue addCategoryQueue() {
        return new Queue("addCategoryQueue", false);
    }
    @Bean
    public Queue editCategoryQueue() {
        return new Queue("editCategoryQueue", false);
    }
    @Bean
    public Queue deleteCategoryQueue() {
        return new Queue("deleteCategoryQueue", false);
    }
}
