package customers.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import customers.beans.Customer;
import customers.beans.Item;
import customers.mail.EmailServiceImpl;
import customers.repositories.CustomerRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
public class MailController {
    EmailServiceImpl emailService;
    CustomerRepository customerRepository;

    @PostMapping("/send-order-confirmation")
    public Map<String, Object> sendOrderConfirmation(@RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            response.put("status", "Failure");
            response.put("message", "Please sign in using an email to receive a confirmation!");
            return response;
        } else {
            String email = null;
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("email")) {
                    email = cookie.getValue();
                }
            }
            if (email != null) {
                Customer customer = customerRepository.getCustomerByEmail(email);
                Map<String, Object> content = new HashMap<>();
                content.put("customer", customer);
                List<Item> items = new ArrayList<>();
                try {
                    List<Map<String, Object>> json = (List<Map<String, Object>>) body.get("items");
                    for (Map<String, Object> instance : json) {
                        Item item = new Item();
                        item.setItem_name((String) instance.get("item_name"));
                        item.setCost(Double.parseDouble(String.valueOf(instance.get("cost"))));
                        item.setQuantity((int) instance.get("quantity"));
                        items.add(item);
                    }
                    content.put("cartItems", items);
                    emailService.sendMailWithInline(email, "Order Confirmation", content,
                            "orderConfirmation.html");
                    response.put("status", "success");
                    response.put("message", "Email sent successfully to " + email);
                    return response;
                } catch (Exception e) {
                    response.put("status", "Error");
                    response.put("message",
                            "An error occured while sending the email! Your order has been placed. You can empty your cart.");
                    return response;
                }
            }
            response.put("status", "Failure");
            response.put("message", "Please sign in using an email to receive a confirmation!");
            return response;
        }
    }

    @GetMapping("/getCustomer")
    public Object getCustomer(HttpServletRequest request, HttpServletResponse httpResponse) {
        Map<String, Object> response = new HashMap<>();
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            response.put("status", "Failure");
            response.put("message", "Please sign in using an email to receive a confirmation!");
            return response;
        } else {
            String email = null;
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("email")) {
                    email = cookie.getValue();
                }
            }
            if (email != null) {
                response.put("customer", customerRepository.getCustomerByEmail(email));
                response.put("status", "success");
            } else {
                response.put("status", "Failure");
                response.put("message", "Please sign in using an email to receive a confirmation!");
            }
            return response;
        }
    }
}
