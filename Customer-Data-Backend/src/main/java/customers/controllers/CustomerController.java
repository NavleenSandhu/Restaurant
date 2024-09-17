package customers.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import customers.beans.Customer;
import customers.mail.EmailServiceImpl;
import customers.repositories.CustomerRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
public class CustomerController {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private EmailServiceImpl emailService;

    @PostMapping(value = { "", "/" }, headers = { "Content-type= application/json" })
    public Map<String, Object> addCustomer(@RequestBody Customer customer, HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        Map<String, Object> response = new HashMap<>();
        Cookie[] cookies = httpRequest.getCookies();
        if (cookies != null) {
            boolean emailExists = false;
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("email")) {
                    emailExists = true;
                }
            }
            if (!emailExists) {
                Cookie cookie = new Cookie("email", customer.getEmail());
                cookie.setMaxAge(60 * 60);
                cookie.setHttpOnly(true);
                httpResponse.addCookie(cookie);
            }
        } else {
            Cookie cookie = new Cookie("email", customer.getEmail());
            cookie.setMaxAge(60 * 60);
            cookie.setHttpOnly(true);
            httpResponse.addCookie(cookie);
        }
        try {
            InternetAddress emailAddr = new InternetAddress(customer.getEmail());
            emailAddr.validate();
        } catch (AddressException ex) {
            response.put("failure", "Email is not valid! Please enter a valid email!");
            return response;
        }
        Customer dbCustomer = customerRepository.getCustomerByEmail(customer.getEmail());
        if (dbCustomer == null) {
            Map<String, Object> content = new HashMap<>();
            content.put("customer", customer);
            try {
                emailService.sendMailWithInline(customer.getEmail(), "Sign up Confirmation", content,
                        "signUpConfirmation.html");
            } catch (MessagingException e) {
                e.printStackTrace();

            }
        }
        int rowsAffected = customerRepository.addCustomer(
                customer);
        response.put("status", "success");
        response.put("message", "Customer added successfully!");
        if (rowsAffected > 0) {
            return response;
        }
        return null;
    }

    @PostMapping(value = { "/optOut" }, headers = { "Content-type= application/json" })
    public Map<String, Object> optOut(@RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();
        try {
            InternetAddress emailAddr = new InternetAddress((String) requestBody.get("email"));
            emailAddr.validate();
        } catch (AddressException ex) {
            response.put("failure", "Email is not valid! Please enter a valid email!");
            return response;
        }
        int rowsAffected = customerRepository.updateOptedIn((String) requestBody.get("email"));
        response.put("success", "Opted out successfully");
        if (rowsAffected > 0) {
            return response;
        }
        return null;
    }
}
