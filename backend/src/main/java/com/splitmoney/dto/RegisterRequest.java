package com.splitmoney.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class RegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank @Email(message = "Valid email required")
    private String email;

    @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String phone;
}
