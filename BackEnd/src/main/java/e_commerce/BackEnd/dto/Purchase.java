package e_commerce.BackEnd.dto;

import e_commerce.BackEnd.entity.Address;
import e_commerce.BackEnd.entity.Customer;
import e_commerce.BackEnd.entity.Order;
import e_commerce.BackEnd.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;
}
