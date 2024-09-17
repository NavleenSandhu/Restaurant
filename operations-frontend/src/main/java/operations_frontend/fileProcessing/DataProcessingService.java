package operations_frontend.fileProcessing;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import operations_frontend.beans.Item;

@Service
public class DataProcessingService {

    public String getExtension(MultipartFile image) {
        String extension = "";
        String originalFilename = image.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
        }
        return extension;
    }

    public void setImageTypes(List<Item> items, List<String> files) {
        for (Item item : items) {
            Optional<String> result = files.stream().filter(file -> file.startsWith(String.valueOf(item.getItem_id())))
                    .findFirst();
            String extension = "";
            if (result.isPresent()) {
                String fileName = result.get();
                extension = fileName.substring(fileName.lastIndexOf(".") + 1);
            }
            item.setImageType(extension);
        }
    }
}
