package operations_frontend.beans;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Item {
    private int item_id;
    private String item_name;
    private String item_description;
    private double cost;
    private String imageType;
    private int category_id;
}
