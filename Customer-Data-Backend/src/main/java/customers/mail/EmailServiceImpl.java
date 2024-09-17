package customers.mail;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import customers.beans.Customer;
import customers.beans.Item;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Component
public class EmailServiceImpl {
    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private TemplateEngine templateEngine;

    public void sendMailWithInline(String to, String subject, Map<String, Object> content, String emailTemplate)
            throws MessagingException {
        Context context = new Context();
        context.setVariable("customer", (Customer) content.get("customer"));
        List<Item> items = (List<Item>) content.get("cartItems");
        if (items != null) {
            context.setVariable("cartItems", items);
            double subtotal = 0;
            for (Item item : items) {
                subtotal += item.getCost() * item.getQuantity();
            }
            double tax = subtotal * 0.13;
            double total = subtotal + tax;
            context.setVariable("subtotal", String.format("%.2f", subtotal));
            context.setVariable("tax", String.format("%.2f", tax));
            context.setVariable("total", String.format("%.2f", total));
        }
        String htmlContent = templateEngine.process(emailTemplate, context);
        MimeMessage mimeMessage = this.javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        mimeMessageHelper.setTo(to);
        mimeMessageHelper.setSubject(subject);
        mimeMessageHelper.setText(htmlContent, true);
        this.javaMailSender.send(mimeMessage);
    }
}
