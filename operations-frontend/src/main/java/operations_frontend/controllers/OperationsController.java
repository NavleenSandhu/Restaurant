package operations_frontend.controllers;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.core.env.Environment;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import operations_frontend.apiServices.OrdersService;
import operations_frontend.auth.JwtUtil;
import operations_frontend.beans.Category;
import operations_frontend.beans.Item;
import operations_frontend.fileProcessing.DataProcessingService;
import operations_frontend.rabbitMQ.RabbitMQService;

@AllArgsConstructor
@Controller
public class OperationsController {
    private RabbitMQService mqService;
    private JwtUtil jwt;
    private Environment env;
    private DataProcessingService dService;
    private RedisTemplate<String, Object> redisTemplate;
    private OrdersService ordersService;

    @GetMapping("/")
    public String home(@RequestParam(required = false) String status,
            @RequestParam(required = false) String message, Model model, HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {

            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
        } catch (Error e) {
            e.printStackTrace();
            status = "danger";
            message = e.getMessage();
        }
        model.addAttribute("status", status);
        model.addAttribute("message", message);
        return "home.html";
    }

    @GetMapping("/viewItems")
    public String viewItemsPage(@RequestParam(required = false) String status,
            @RequestParam(required = false) String message, Model model, HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            List<Item> items = (List<Item>) redisTemplate.opsForValue().get("items");
            List<Category> categories = (List<Category>) redisTemplate.opsForValue().get("categories");
            File directory = new File(env.getProperty("uploadDir"));
            dService.setImageTypes(items, Arrays.asList(directory.list()));
            if (items == null) {
                items = mqService.getItems();
                if (items.size() > 0) {
                    redisTemplate.opsForValue().set("items", items, 30, TimeUnit.MINUTES);
                }
            }
            if (categories == null) {
                categories = mqService.getCategories();
                redisTemplate.opsForValue().set("categories", categories, 30, TimeUnit.MINUTES);
            }
            model.addAttribute("items", items);
            model.addAttribute("categories", categories);
        } catch (Error e) {
            e.printStackTrace();
            status = "danger";
            message = e.getMessage();
        }
        model.addAttribute("status", status);
        model.addAttribute("message", message);
        return "viewMenu.html";
    }

    @GetMapping("/viewCategories")
    public String viewCategoriesPage(@RequestParam(required = false) String status,
            @RequestParam(required = false) String message, Model model, HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            List<Category> categories = (List<Category>) redisTemplate.opsForValue().get("categories");

            if (categories == null) {
                categories = mqService.getCategories();
                redisTemplate.opsForValue().set("categories", categories, 30, TimeUnit.MINUTES);
            }
            model.addAttribute("categories", categories);
        } catch (Error e) {
            e.printStackTrace();
            status = "danger";
            message = e.getMessage();
        }
        model.addAttribute("status", status);
        model.addAttribute("message", message);
        return "viewCategories.html";
    }

    @GetMapping("/addItem")
    public String addItemPage(@RequestParam(required = false) String status,
            @RequestParam(required = false) String message, Model model, HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            List<Category> categories = (List<Category>) redisTemplate.opsForValue().get("categories");
            if (categories == null) {
                categories = mqService.getCategories();
                redisTemplate.opsForValue().set("categories", categories, 30, TimeUnit.MINUTES);
            }
            model.addAttribute("categories", categories);
        } catch (Error e) {
            e.printStackTrace();
            status = "danger";
            message = e.getMessage();
        }
        model.addAttribute("status", status);
        model.addAttribute("message", message);
        return "addItem.html";
    }

    @GetMapping("/addCategory")
    public String addCategoryPage(@RequestParam(required = false) String status,
            @RequestParam(required = false) String message, Model model, HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
        } catch (Error e) {
            e.printStackTrace();
            status = "danger";
            message = e.getMessage();
        }
        model.addAttribute("status", status);
        model.addAttribute("message", message);
        return "addCategory.html";
    }

    @PostMapping("/addItem")
    public String addItem(@RequestParam String item_name, @RequestParam String item_description,
            @RequestParam double cost, @RequestParam int category_id, @RequestParam MultipartFile image, Model model,
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            String extension = dService.getExtension(image);
            Item newItem = new Item(0, item_name, item_description, cost, extension, category_id);
            Map<String, Object> response = mqService.addItem(newItem);
            String status = (String) response.get("status");
            String message = (String) response.get("message");
            if (status.equals("success")) {
                int newId = (int) response.get("item_id");
                newItem.setItem_id(newId);
                Files.write(Paths.get(env.getProperty("uploadDir") + newItem.getItem_id() + "." + extension),
                        image.getBytes());
                List<Item> items = (List<Item>) redisTemplate.opsForValue().get("items");
                if (items != null) {
                    items.add(newItem);
                    redisTemplate.opsForValue().set("items", items, 30, TimeUnit.MINUTES);
                }
                return "redirect:/viewItems?status=" + status + "&message=" + message;
            } else {
                return "redirect:/addItem?status=" + status + "&message=" + message;

            }
        } catch (IOException e) {
            e.printStackTrace();
            e.printStackTrace();
            String status = "danger";
            String message = "Could not upload file!";
            return "redirect:/addItem?status=" + status + "&message=" + message;
        } catch (Error e) {
            e.printStackTrace();
            String status = "danger";
            String message = e.getMessage();
            return "redirect:/addItem?status=" + status + "&message=" + message;
        }

    }

    @PostMapping("/addCategory")
    public String addCategory(@RequestParam String category_name, Model model,
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            Map<String, Object> response = mqService.addCategory(new Category(0, category_name));
            String status = (String) response.get("status");
            String message = (String) response.get("message");
            if (status.equals("success")) {
                List<Category> categories = mqService.getCategories();
                redisTemplate.opsForValue().set("categories", categories, 30, TimeUnit.MINUTES);
                return "redirect:/viewCategories?status=" + status + "&message=" + message;
            } else {
                return "redirect:/addCategory?status=" + status + "&message=" + message;
            }
        } catch (Error e) {
            e.printStackTrace();
            String status = "danger";
            String message = e.getMessage();
            return "redirect:/addItem?status=" + status + "&message=" + message;
        }
    }

    @GetMapping("/edit/{id}")
    public String editItemPage(@RequestParam(required = false) String status,
            @RequestParam(required = false) String message, @PathVariable int id, Model model,
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            List<Category> categories = (List<Category>) redisTemplate.opsForValue().get("categories");
            if (categories == null) {
                categories = mqService.getCategories();
                redisTemplate.opsForValue().set("categories", categories, 30, TimeUnit.MINUTES);
            }

            model.addAttribute("item_id", id);
            model.addAttribute("categories", categories);
        } catch (Error e) {
            e.printStackTrace();
            status = "danger";
            message = e.getMessage();
        }
        model.addAttribute("status", status);
        model.addAttribute("message", message);
        return "editItem.html";
    }

    @PostMapping("/editItem")
    public String editItem(
            @RequestParam String item_id, @RequestParam(required = false) String item_name,
            @RequestParam(required = false) String item_description,
            @RequestParam(required = false) String cost,
            @RequestParam(required = false, defaultValue = "0") int category_id,
            @RequestParam(required = false) MultipartFile image, Model model, HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            Map<String, Object> itemMap = new HashMap<>();
            if (!item_id.equals("")) {
                itemMap.put("item_id", Integer.parseInt(item_id));
            }
            if (!item_name.equals("")) {
                itemMap.put("item_name", item_name);
            }
            if (!item_description.equals("")) {
                itemMap.put("item_description", item_description);
            }
            if (!cost.equals("")) {
                itemMap.put("cost", Double.parseDouble(cost));
            }
            if (category_id > 0) {
                itemMap.put("category_id", category_id);
            }
            Map<String, Object> response = mqService.editItem(itemMap);
            String message = "";
            String status = "";
            if (response.get("status") != null) {
                if (!image.getOriginalFilename().equals("")) {
                    String extension = dService.getExtension(image);
                    try {
                        Files.write(Paths.get(env.getProperty("uploadDir") + item_id + "." + extension),
                                image.getBytes());
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                List<Item> items = mqService.getItems();
                redisTemplate.opsForValue().set("items", items, 30, TimeUnit.MINUTES);
                message = (String) response.get("message");
                status = (String) response.get("status");
                return "redirect:/viewItems?status=" + status + "&message=" + message;
            } else {
                return "redirect:/edit/" + item_id + "?status=" + status + "&message=" + message;
            }
        } catch (Error e) {
            e.printStackTrace();
            String status = "danger";
            String message = e.getMessage();
            return "redirect:/edit/" + item_id + "?status=" + status + "&message=" + message;
        }
    }

    @GetMapping("/editCategory/{id}")
    public String editCategoryPage(@RequestParam(required = false) String status,
            @RequestParam(required = false) String message, @PathVariable int id, Model model,
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            model.addAttribute("category_id", id);
        } catch (Error e) {
            e.printStackTrace();
            status = "danger";
            message = e.getMessage();
        }
        model.addAttribute("status", status);
        model.addAttribute("message", message);
        return "editCategory.html";
    }

    @PostMapping("/editCategory")
    public String editCategory(
            @RequestParam String category_id, @RequestParam(required = false) String category_name, Model model,
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        String message = "";
        String status = "";
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            Map<String, Object> itemMap = new HashMap<>();
            if (!category_id.equals("")) {
                itemMap.put("category_id", Integer.parseInt(category_id));
            }
            if (!category_name.equals("")) {
                itemMap.put("category_name", category_name);
            }
            Map<String, Object> response = mqService.editCategory(itemMap);
            if (response.get("status") != null) {
                List<Category> categories = mqService.getCategories();
                redisTemplate.opsForValue().set("categories", categories, 30, TimeUnit.MINUTES);
                message = (String) response.get("message");
                status = (String) response.get("status");
                return "redirect:/viewCategories?status=" + status + "&message=" + message;
            } else {
                return "redirect:/editCategory/" + category_id + "?status=" + status + "&message=" + message;
            }
        } catch (Error e) {
            e.printStackTrace();
            status = "danger";
            message = e.getMessage();
            return "redirect:/editCategory/" + category_id + "?status=" + status + "&message=" + message;
        }
    }

    @GetMapping("/delete/{id}")
    public String deleteItem(@PathVariable int id, Model model, HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            Map<String, Object> response = mqService.deleteItem(id);
            List<Item> items = (List<Item>) redisTemplate.opsForValue().get("items");
            Object status = response.get("status");
            Object message = response.get("message");
            if (status != null && ((String) status).equals("success")) {
                if (items != null) {
                    Optional<Item> item = items.stream().filter(i -> i.getItem_id() == id).findFirst();
                    if (item.isPresent()) {
                        items.remove((Item) item.get());
                        redisTemplate.opsForValue().set("items", items, 30, TimeUnit.MINUTES);
                        try {
                            Files.deleteIfExists(
                                    Paths.get(env.getProperty("uploadDir") + id + "." + item.get().getImageType()));
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    } else {
                        redisTemplate.opsForValue().getAndDelete("items");
                    }
                }
            }

            return "redirect:/viewItems?status=" + (String) status + "&message=" + (String) message;
        } catch (Error e) {
            e.printStackTrace();
            String status = "danger";
            String message = e.getMessage();
            return "redirect:/viewItems?status=" + status + "&message=" + message;
        }
    }

    @GetMapping("/deleteCategory/{id}")
    public String deleteCategory(@PathVariable int id, Model model, HttpServletRequest request,
            HttpServletResponse httpResponse) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            Map<String, Object> response = mqService.deleteCategory(id);
            List<Category> categories = (List<Category>) redisTemplate.opsForValue().get("categories");
            Object status = response.get("status");
            Object message = response.get("message");
            if (status != null && ((String) status).equals("success")) {
                if (categories != null) {
                    Optional<Category> category = categories.stream().filter(i -> i.getCategory_id() == id).findFirst();
                    if (category.isPresent()) {
                        categories.remove((Category) category.get());
                        redisTemplate.opsForValue().set("categories", categories, 30, TimeUnit.MINUTES);
                    } else {
                        redisTemplate.opsForValue().getAndDelete("categories");
                    }
                }
            }
            return "redirect:/viewCategories?status=" + (String) status + "&message=" + (String) message;
        } catch (Error e) {
            e.printStackTrace();
            String status = "danger";
            String message = e.getMessage();
            return "redirect:/viewCategories?status=" + status + "&message=" + message;
        }
    }

    @GetMapping("/analytics")
    public String analyticsPage(HttpServletRequest request, HttpServletResponse httpResponse, Model model) {
        try {
            Cookie[] cookies = request.getCookies();
            String errorReturnAddress = jwt.validateUser(cookies, env.getProperty("owner.email"));
            if (errorReturnAddress != null) {
                jwt.logoutUser(httpResponse);
                return errorReturnAddress;
            }
            jwt.regenerateTokenToCookies(httpResponse, cookies);
            List<Integer> years = ordersService.getYears();
            model.addAttribute("years", years);
        } catch (Error e) {
            e.printStackTrace();
        }
        return "analytics";
    }
}
