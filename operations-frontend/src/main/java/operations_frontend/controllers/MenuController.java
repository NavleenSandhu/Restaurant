package operations_frontend.controllers;

import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;
import operations_frontend.beans.Category;
import operations_frontend.beans.Item;
import operations_frontend.rabbitMQ.RabbitMQService;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class MenuController {

    private RedisTemplate<String, Object> redisTemplate;
    private RabbitMQService mqService;
    private Environment env;

    // Endpoint to get Items
    @GetMapping("/items")
    public ResponseEntity<List<Item>> getItems() {
        List<Item> items = (List<Item>) redisTemplate.opsForValue().get("items");
        if (items == null) {
            items = mqService.getItems();
            redisTemplate.opsForValue().set("items", items, 30, TimeUnit.MINUTES);
        }
        return ResponseEntity.ok(items);
    }

    // Endpoint to get Categories
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        List<Category> categories = (List<Category>) redisTemplate.opsForValue().get("categories");
        if (categories == null) {
            categories = mqService.getCategories();
            redisTemplate.opsForValue().set("categories", categories, 30, TimeUnit.MINUTES);
        }
        return ResponseEntity.ok(categories);
    }

    // Endpoint to get images by item_id
    @GetMapping("/uploads/{itemId}")
    public ResponseEntity<Resource> getImage(@PathVariable("itemId") String itemId) {
        try {
            // Get the image file based on the itemId
            Path imagePath = findImageById(itemId);

            Resource imageResource = new UrlResource(imagePath.toUri());

            // Check if the file exists and is readable
            if (imageResource.exists() && imageResource.isReadable()) {
                String fileName = imagePath.getFileName().toString();
                String fileExtension = getFileExtension(fileName).toLowerCase();

                MediaType mediaType = getMediaTypeForFileExtension(fileExtension);
                return ResponseEntity.ok()
                        .contentType(mediaType) // Assume image type is PNG, adjust dynamically if necessary
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + imageResource.getFilename() + "\"")
                        .body(imageResource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Helper method to find image by item_id
    private Path findImageById(String itemId) {
        Path path = Paths.get(env.getProperty("uploadDir")).resolve(itemId); // Base path to check
        // Try different extensions
        for (String ext : List.of(".png", ".jpg", ".jpeg", ".gif")) {
            Path imagePath = path.resolveSibling(itemId + ext); // Example: item_id.png
            if (imagePath.toFile().exists()) {
                return imagePath;
            }
        }
        throw new RuntimeException("Image not found for item: " + itemId);
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1);
        } else {
            return "";
        }
    }

    // Helper method to determine MediaType based on file extension
    private MediaType getMediaTypeForFileExtension(String extension) {
        switch (extension) {
            case "png":
                return MediaType.IMAGE_PNG;
            case "jpg":
            case "jpeg":
                return MediaType.IMAGE_JPEG;
            case "gif":
                return MediaType.IMAGE_GIF;
            default:
                return MediaType.APPLICATION_OCTET_STREAM; // Fallback if type is unknown
        }
    }
}
