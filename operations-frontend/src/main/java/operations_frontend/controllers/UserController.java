package operations_frontend.controllers;

import java.util.Map;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import operations_frontend.auth.JwtUtil;
import operations_frontend.beans.User;
import operations_frontend.rabbitMQ.RabbitMQService;

@Controller
@AllArgsConstructor
public class UserController {
    private RabbitMQService mqService;
    private Environment env;
    private JwtUtil jwt;

    @GetMapping("/login")
    public String loginPage(@RequestParam(required = false) String status,
            @RequestParam(required = false) String message, Model model, HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
        if (errorReturnAddress == null) {
            return "redirect:/";
        }
        model.addAttribute("status", status);
        model.addAttribute("message", message);
        model.addAttribute("user", new User());
        return "login.html";
    }

    @PostMapping("/login")
    public String login(@ModelAttribute User user, Model model, HttpServletResponse httpResponse) {
        Map<String, Object> response = mqService.login(user);
        String status = (String) response.get("status");
        String message = (String) response.get("message");
        if (status.equals("success")) {
            httpResponse.addCookie(jwt.generateCookie(user.getEmail()));
            return "redirect:/?status=" + status + "&message=" + message;
        } else {
            return "redirect:/login?status=" + status + "&message=" + message;
        }
    }

    @GetMapping("/register")
    public String registerPage(@RequestParam(required = false) String status,
            @RequestParam(required = false) String message, Model model) {
        model.addAttribute("status", status);
        model.addAttribute("message", message);
        model.addAttribute("user", new User());
        return "register.html";
    }

    @PostMapping("/register")
    public String register(@ModelAttribute User user, Model model, HttpServletResponse httpResponse) {
        Map<String, Object> response = mqService.register(user);
        String status = (String) response.get("status");
        String message = (String) response.get("message");
        if (status.equals("success")) {
            httpResponse.addCookie(jwt.generateCookie(user.getEmail()));
            return "redirect:/login";
        } else {
            return "redirect:/register?status=" + status + "&message=" + message;
        }
    }

    @GetMapping("/logout")
    public String logout(HttpServletResponse response) {
        jwt.logoutUser(response);
        return "redirect:/login?status=success&message=Logged out successfully!";
    }
}
