package operations_frontend.rabbitMQ;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import operations_frontend.beans.Category;
import operations_frontend.beans.Item;
import operations_frontend.beans.User;

@Service
public class RabbitMQService {
    @Autowired
    RabbitTemplate rabbitTemplate;

    public List<Item> getItems() {
        ObjectMapper mapper = new ObjectMapper();
        List<Item> items = null;
        byte[] responseBytes = (byte[]) rabbitTemplate.convertSendAndReceive("getItemsQueue", "fetchItems");

        if (responseBytes != null) {
            try {
                String response = new String(responseBytes);
                items = (List<Item>) mapper.readValue(response, new TypeReference<List<Item>>() {
                });
            } catch (JsonProcessingException e) {
                System.out.println(e.getMessage());
                ;
            }
        }
        return items;
    }

    public List<Category> getCategories() {
        ObjectMapper mapper = new ObjectMapper();
        List<Category> categories = null;
        byte[] responseBytes = (byte[]) rabbitTemplate.convertSendAndReceive("getCategoriesQueue", "fetchCategories");

        if (responseBytes != null) {
            try {
                String response = new String(responseBytes);
                categories = (List<Category>) mapper.readValue(response, new TypeReference<List<Category>>() {
                });
            } catch (JsonProcessingException e) {
                System.out.println(e.getMessage());
            }
        }
        return categories;
    }

    public Map<String, Object> addItem(Item item) {
        return getResult("addItemQueue", item);
    }

    public Map<String, Object> editItem(Object item) {
        return getResult("editItemQueue", item);
    }

    public Map<String, Object> deleteItem(int id) {
        return getResult("deleteItemQueue", id);
    }

    public Map<String, Object> login(User user) {
        return getResult("loginQueue", user);
    }

    public Map<String, Object> register(User user) {
        return getResult("registerQueue", user);
    }

    public Map<String, Object> addCategory(Category category) {
        return getResult("addCategoryQueue", category);
    }

    public Map<String, Object> editCategory(Object category) {
        return getResult("editCategoryQueue", category);
    }

    public Map<String, Object> deleteCategory(int id) {
        return getResult("deleteCategoryQueue", id);
    }

    public Map<String, Object> getResult(String queue, Object object) {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> responseBody = new HashMap<String, Object>();
        try {
            byte[] responseBytes = (byte[]) rabbitTemplate.convertSendAndReceive(queue,
                    mapper.writeValueAsString(object));
            if (responseBytes != null) {
                String response = new String(responseBytes);
                responseBody = (Map<String, Object>) mapper.readValue(response,
                        new TypeReference<Map<String, Object>>() {
                        });
            }
        } catch (JsonProcessingException e) {
            System.out.println(e.getMessage());
            ;
        }
        return responseBody;
    }
}
