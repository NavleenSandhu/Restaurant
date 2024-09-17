package customers.repositories;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import customers.beans.Customer;

@Repository
public class CustomerRepository {
    @Autowired
    private NamedParameterJdbcTemplate jdbc;

    public int addCustomer(Customer customer) {
        MapSqlParameterSource parameters = new MapSqlParameterSource();
        String query = "INSERT INTO customers VALUES(:email, :name, :dob, True) ON DUPLICATE KEY UPDATE email=email, opted_In = True";
        parameters.addValue("email", customer.getEmail());
        parameters.addValue("name", customer.getCustName());
        parameters.addValue("dob", customer.getDateOfBirth());
        return jdbc.update(query, parameters);
    }

    public int updateOptedIn(String email) {
        MapSqlParameterSource parameters = new MapSqlParameterSource();
        String query = "UPDATE customers SET opted_in = False WHERE email= :email";
        parameters.addValue("email", email);
        return jdbc.update(query, parameters);
    }

    public Customer getCustomerByEmail(String email) {
        MapSqlParameterSource parameters = new MapSqlParameterSource();
        String query = "SELECT * FROM customers WHERE email=:email";
        parameters.addValue("email", email);
        List<Customer> customers = jdbc.query(query, parameters, new BeanPropertyRowMapper<Customer>(Customer.class));
        if (customers.size() > 0) {
            return customers.get(0);
        }
        return null;
    }
}
